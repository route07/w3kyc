// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../utility/InputValidator.sol";

/**
 * @title KYCDataStorage
 * @dev Dedicated storage contract for KYC verification data
 * @notice This contract only handles data storage and retrieval with configurable values
 * @author Web3 KYC Team
 */
contract KYCDataStorage is ReentrancyGuard {
    
    // ============ STRUCTS ============
    
    /**
     * @dev Structure to store KYC verification data
     */
    struct KYCData {
        bool isVerified;                    // Whether the user is KYC verified
        string verificationHash;            // IPFS hash containing verification data
        uint256 verificationDate;           // Timestamp when KYC was verified
        uint256 riskScore;                  // Risk score (0-100)
        bool isActive;                      // Whether KYC is currently active
        uint256 expiresAt;                  // Expiration timestamp
        address linkedWallet;               // Primary linked wallet address
        string jurisdiction;                // Jurisdiction where KYC was performed (UK, EU, US, AU, ZA)
        string tenantId;                    // ID of the tenant that verified this user
    }
    
    /**
     * @dev Configuration structure for KYC settings
     */
    struct KYCConfig {
        uint256 defaultExpiryDuration;      // Default KYC expiry duration in seconds
        uint256 maxRiskScore;               // Global maximum risk score
        bool allowMultipleWallets;          // Whether to allow multiple wallet links per user
        uint256 maxWalletsPerUser;          // Maximum number of wallets per user
        bool requireJurisdictionMatch;      // Whether to require strict jurisdiction matching
    }
    
    // ============ STATE VARIABLES ============
    
    // Storage mappings
    mapping(address => KYCData) public kycData;
    mapping(address => address[]) public linkedWallets;        // Multiple wallets per user
    mapping(string => address[]) public tenantUsers;           // Users per tenant
    mapping(address => uint256) public userWalletCount;        // Count of wallets per user
    
    // Configuration storage
    KYCConfig public kycConfig;
    mapping(string => uint256) public jurisdictionExpiryDurations;  // Per-jurisdiction expiry
    mapping(string => uint256) public jurisdictionRiskThresholds;   // Per-jurisdiction risk limits
    
    // Access control
    mapping(address => bool) public authorizedWriters;
    address public owner;
    
    // Version tracking
    uint256 public constant VERSION = 1;
    string public constant CONTRACT_NAME = "KYCDataStorage";
    
    // ============ EVENTS ============
    
    event KYCDataStored(
        address indexed user, 
        string jurisdiction, 
        string tenantId,
        uint256 riskScore,
        uint256 expiresAt
    );
    
    event KYCDataUpdated(
        address indexed user, 
        string field, 
        uint256 timestamp
    );
    
    event WalletLinked(
        address indexed user, 
        address indexed wallet,
        uint256 walletCount
    );
    
    event WalletUnlinked(
        address indexed user, 
        address indexed wallet,
        uint256 walletCount
    );
    
    event KYCConfigUpdated(
        string field, 
        uint256 oldValue, 
        uint256 newValue
    );
    
    event JurisdictionConfigUpdated(
        string jurisdiction, 
        string field, 
        uint256 value
    );
    
    event AuthorizedWriterUpdated(
        address indexed writer, 
        bool authorized
    );
    
    // ============ MODIFIERS ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyAuthorized() {
        require(authorizedWriters[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }
    
    modifier validUser(address user) {
        require(user != address(0), "Invalid user address");
        _;
    }
    
    modifier validWallet(address wallet) {
        require(wallet != address(0), "Invalid wallet address");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Constructor to initialize the contract
     */
    constructor() {
        owner = msg.sender;
        authorizedWriters[owner] = true;
        
        // Initialize default configuration
        _initializeDefaultConfig();
        
        // Initialize jurisdiction-specific settings
        _initializeJurisdictionDefaults();
    }
    
    // ============ INITIALIZATION FUNCTIONS ============
    
    /**
     * @dev Initialize default KYC configuration
     */
    function _initializeDefaultConfig() internal {
        kycConfig = KYCConfig({
            defaultExpiryDuration: 365 days,
            maxRiskScore: 100,
            allowMultipleWallets: true,
            maxWalletsPerUser: 5,
            requireJurisdictionMatch: true
        });
    }
    
    /**
     * @dev Initialize jurisdiction-specific default settings
     */
    function _initializeJurisdictionDefaults() internal {
        // UK Configuration
        jurisdictionExpiryDurations["UK"] = 365 days;
        jurisdictionRiskThresholds["UK"] = 50;
        
        // EU Configuration
        jurisdictionExpiryDurations["EU"] = 365 days;
        jurisdictionRiskThresholds["EU"] = 50;
        
        // US Configuration
        jurisdictionExpiryDurations["US"] = 365 days;
        jurisdictionRiskThresholds["US"] = 70;
        
        // Australia Configuration
        jurisdictionExpiryDurations["AU"] = 365 days;
        jurisdictionRiskThresholds["AU"] = 60;
        
        // South Africa Configuration
        jurisdictionExpiryDurations["ZA"] = 365 days;
        jurisdictionRiskThresholds["ZA"] = 40;
    }
    
    // ============ CONFIGURATION FUNCTIONS ============
    
    /**
     * @dev Update KYC configuration
     * @param _defaultExpiryDuration New default expiry duration
     * @param _maxRiskScore New maximum risk score
     * @param _allowMultipleWallets Whether to allow multiple wallets
     * @param _maxWalletsPerUser Maximum wallets per user
     * @param _requireJurisdictionMatch Whether to require jurisdiction matching
     */
    function updateKYCConfig(
        uint256 _defaultExpiryDuration,
        uint256 _maxRiskScore,
        bool _allowMultipleWallets,
        uint256 _maxWalletsPerUser,
        bool _requireJurisdictionMatch
    ) external onlyOwner {
        uint256 oldExpiry = kycConfig.defaultExpiryDuration;
        uint256 oldMaxRisk = kycConfig.maxRiskScore;
        
        kycConfig.defaultExpiryDuration = _defaultExpiryDuration;
        kycConfig.maxRiskScore = _maxRiskScore;
        kycConfig.allowMultipleWallets = _allowMultipleWallets;
        kycConfig.maxWalletsPerUser = _maxWalletsPerUser;
        kycConfig.requireJurisdictionMatch = _requireJurisdictionMatch;
        
        emit KYCConfigUpdated("defaultExpiryDuration", oldExpiry, _defaultExpiryDuration);
        emit KYCConfigUpdated("maxRiskScore", oldMaxRisk, _maxRiskScore);
    }
    
    /**
     * @dev Update jurisdiction-specific configuration
     * @param jurisdiction The jurisdiction to update
     * @param expiryDuration New expiry duration for this jurisdiction
     * @param riskThreshold New risk threshold for this jurisdiction
     */
    function updateJurisdictionConfig(
        string memory jurisdiction,
        uint256 expiryDuration,
        uint256 riskThreshold
    ) external onlyOwner {
        require(bytes(jurisdiction).length > 0, "Invalid jurisdiction");
        require(riskThreshold <= kycConfig.maxRiskScore, "Risk threshold too high");
        
        jurisdictionExpiryDurations[jurisdiction] = expiryDuration;
        jurisdictionRiskThresholds[jurisdiction] = riskThreshold;
        
        emit JurisdictionConfigUpdated(jurisdiction, "expiryDuration", expiryDuration);
        emit JurisdictionConfigUpdated(jurisdiction, "riskThreshold", riskThreshold);
    }
    
    /**
     * @dev Set authorized writer
     * @param writer Address to authorize/revoke
     * @param authorized Whether to authorize or revoke
     */
    function setAuthorizedWriter(address writer, bool authorized) external onlyOwner nonReentrant {
        // Comprehensive input validation
        InputValidator.validateAddress(writer, "writer");
        
        authorizedWriters[writer] = authorized;
        emit AuthorizedWriterUpdated(writer, authorized);
    }
    
    // ============ CORE KYC FUNCTIONS ============
    
    /**
     * @dev Store KYC data for a user
     * @param user Address of the user
     * @param verificationHash IPFS hash containing verification data
     * @param riskScore Risk score (0-100)
     * @param jurisdiction Jurisdiction where KYC was performed
     * @param tenantId ID of the tenant that verified the user
     */
    function storeKYCData(
        address user,
        string memory verificationHash,
        uint256 riskScore,
        string memory jurisdiction,
        string memory tenantId
    ) external onlyAuthorized validUser(user) {
        require(bytes(verificationHash).length > 0, "Invalid verification hash");
        require(riskScore <= kycConfig.maxRiskScore, "Risk score too high");
        require(bytes(jurisdiction).length > 0, "Invalid jurisdiction");
        require(bytes(tenantId).length > 0, "Invalid tenant ID");
        
        // Use jurisdiction-specific expiry or default
        uint256 expiryDuration = jurisdictionExpiryDurations[jurisdiction];
        if (expiryDuration == 0) {
            expiryDuration = kycConfig.defaultExpiryDuration;
        }
        
        kycData[user] = KYCData({
            isVerified: true,
            verificationHash: verificationHash,
            verificationDate: block.timestamp,
            riskScore: riskScore,
            isActive: true,
            expiresAt: block.timestamp + expiryDuration,
            linkedWallet: address(0),
            jurisdiction: jurisdiction,
            tenantId: tenantId
        });
        
        // Add user to tenant's user list
        tenantUsers[tenantId].push(user);
        
        emit KYCDataStored(user, jurisdiction, tenantId, riskScore, block.timestamp + expiryDuration);
    }
    
    /**
     * @dev Update KYC status for a user
     * @param user Address of the user
     * @param isActive Whether KYC should be active
     */
    function updateKYCStatus(address user, bool isActive) external onlyAuthorized validUser(user) nonReentrant {
        require(kycData[user].isVerified, "User not verified");
        
        kycData[user].isActive = isActive;
        
        emit KYCDataUpdated(user, "status", block.timestamp);
    }
    
    /**
     * @dev Update risk score for a user
     * @param user Address of the user
     * @param newRiskScore New risk score
     */
    function updateRiskScore(address user, uint256 newRiskScore) external onlyAuthorized validUser(user) nonReentrant {
        require(kycData[user].isVerified, "User not verified");
        require(newRiskScore <= kycConfig.maxRiskScore, "Risk score too high");
        
        kycData[user].riskScore = newRiskScore;
        
        emit KYCDataUpdated(user, "riskScore", block.timestamp);
    }
    
    /**
     * @dev Extend KYC expiry for a user
     * @param user Address of the user
     * @param additionalTime Additional time to add to expiry
     */
    function extendKYCExpiry(address user, uint256 additionalTime) external onlyAuthorized validUser(user) nonReentrant {
        require(kycData[user].isVerified, "User not verified");
        
        kycData[user].expiresAt += additionalTime;
        
        emit KYCDataUpdated(user, "expiry", block.timestamp);
    }
    
    // ============ WALLET MANAGEMENT FUNCTIONS ============
    
    /**
     * @dev Link a wallet to a user
     * @param user Address of the user
     * @param wallet Address of the wallet to link
     */
    function linkWallet(address user, address wallet) external onlyAuthorized validUser(user) validWallet(wallet) nonReentrant {
        require(kycData[user].isVerified, "User not verified");
        
        if (kycConfig.allowMultipleWallets) {
            require(userWalletCount[user] < kycConfig.maxWalletsPerUser, "Max wallets reached");
            require(!_isWalletLinked(user, wallet), "Wallet already linked");
            
            linkedWallets[user].push(wallet);
            userWalletCount[user]++;
        } else {
            kycData[user].linkedWallet = wallet;
        }
        
        emit WalletLinked(user, wallet, userWalletCount[user]);
    }
    
    /**
     * @dev Unlink a wallet from a user
     * @param user Address of the user
     * @param wallet Address of the wallet to unlink
     */
    function unlinkWallet(address user, address wallet) external onlyAuthorized validUser(user) validWallet(wallet) nonReentrant {
        require(kycData[user].isVerified, "User not verified");
        
        if (kycConfig.allowMultipleWallets) {
            require(_isWalletLinked(user, wallet), "Wallet not linked");
            
            // Remove wallet from array
            address[] storage wallets = linkedWallets[user];
            for (uint256 i = 0; i < wallets.length; i++) {
                if (wallets[i] == wallet) {
                    wallets[i] = wallets[wallets.length - 1];
                    wallets.pop();
                    userWalletCount[user]--;
                    break;
                }
            }
        } else {
            require(kycData[user].linkedWallet == wallet, "Wallet not linked");
            kycData[user].linkedWallet = address(0);
        }
        
        emit WalletUnlinked(user, wallet, userWalletCount[user]);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get complete KYC data for a user
     * @param user Address of the user
     * @return Complete KYC data structure
     */
    function getKYCData(address user) external view validUser(user) returns (KYCData memory) {
        return kycData[user];
    }
    
    /**
     * @dev Get KYC status for a user
     * @param user Address of the user
     * @return isVerified Whether the user is verified
     * @return isActive Whether KYC is active
     * @return isExpired Whether KYC is expired
     */
    function getKYCStatus(address user) external view validUser(user) returns (
        bool isVerified,
        bool isActive,
        bool isExpired
    ) {
        KYCData memory data = kycData[user];
        return (
            data.isVerified,
            data.isActive,
            block.timestamp >= data.expiresAt
        );
    }
    
    /**
     * @dev Check if KYC is valid (verified, active, and not expired)
     * @param user Address of the user
     * @return Whether KYC is valid
     */
    function isKYCValid(address user) external view validUser(user) returns (bool) {
        KYCData memory data = kycData[user];
        return data.isVerified && 
               data.isActive && 
               block.timestamp < data.expiresAt;
    }
    
    /**
     * @dev Get all users for a specific tenant
     * @param tenantId ID of the tenant
     * @return Array of user addresses
     */
    function getTenantUsers(string memory tenantId) external view returns (address[] memory) {
        return tenantUsers[tenantId];
    }
    
    /**
     * @dev Get all linked wallets for a user
     * @param user Address of the user
     * @return Array of linked wallet addresses
     */
    function getLinkedWallets(address user) external view validUser(user) returns (address[] memory) {
        return linkedWallets[user];
    }
    
    /**
     * @dev Get wallet count for a user
     * @param user Address of the user
     * @return Number of linked wallets
     */
    function getWalletCount(address user) external view validUser(user) returns (uint256) {
        return userWalletCount[user];
    }
    
    /**
     * @dev Get current KYC configuration
     * @return Complete KYC configuration structure
     */
    function getKYCConfig() external view returns (KYCConfig memory) {
        return kycConfig;
    }
    
    /**
     * @dev Get jurisdiction-specific configuration
     * @param jurisdiction The jurisdiction to query
     * @return expiryDuration Expiry duration for this jurisdiction
     * @return riskThreshold Risk threshold for this jurisdiction
     */
    function getJurisdictionConfig(string memory jurisdiction) external view returns (
        uint256 expiryDuration,
        uint256 riskThreshold
    ) {
        return (
            jurisdictionExpiryDurations[jurisdiction],
            jurisdictionRiskThresholds[jurisdiction]
        );
    }
    
    /**
     * @dev Check if an address is authorized to write
     * @param writer Address to check
     * @return Whether the address is authorized
     */
    function isAuthorizedWriter(address writer) external view returns (bool) {
        return authorizedWriters[writer] || writer == owner;
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Check if a wallet is linked to a user
     * @param user Address of the user
     * @param wallet Address of the wallet
     * @return Whether the wallet is linked
     */
    function _isWalletLinked(address user, address wallet) internal view returns (bool) {
        address[] memory wallets = linkedWallets[user];
        for (uint256 i = 0; i < wallets.length; i++) {
            if (wallets[i] == wallet) {
                return true;
            }
        }
        return false;
    }
}
