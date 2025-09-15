// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../storage/KYCDataStorage.sol";
import "../storage/AuditLogStorage.sol";
import "../storage/TenantConfigStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../utility/InputValidator.sol";

/**
 * @title KYCManager
 * @dev Business logic contract for KYC operations
 * @notice This contract handles KYC verification, status updates, and wallet management
 * @author Web3 KYC Team
 */
contract KYCManager is ReentrancyGuard {
    
    // ============ STATE VARIABLES ============
    
    // Storage contract references
    KYCDataStorage public kycDataStorage;
    AuditLogStorage public auditLogStorage;
    TenantConfigStorage public tenantConfigStorage;
    
    // Access control
    mapping(address => bool) public authorizedWriters;
    address public owner;
    
    // Version tracking
    uint256 public constant VERSION = 1;
    string public constant CONTRACT_NAME = "KYCManager";
    
    // ============ EVENTS ============
    
    event KYCVerified(
        address indexed user,
        string tenantId,
        string jurisdiction,
        uint256 riskScore,
        uint256 expiresAt
    );
    
    event KYCStatusUpdated(
        address indexed user,
        bool isActive,
        string reason
    );
    
    event WalletLinked(
        address indexed user,
        address indexed wallet,
        string tenantId
    );
    
    event WalletUnlinked(
        address indexed user,
        address indexed wallet,
        string tenantId
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
    
    modifier validTenant(string memory tenantId) {
        require(bytes(tenantId).length > 0, "Invalid tenant ID");
        _;
    }
    
    modifier validWallet(address wallet) {
        require(wallet != address(0), "Invalid wallet address");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Constructor to initialize the contract
     * @param _kycDataStorage Address of KYCDataStorage contract
     * @param _auditLogStorage Address of AuditLogStorage contract
     * @param _tenantConfigStorage Address of TenantConfigStorage contract
     */
    constructor(
        address _kycDataStorage,
        address _auditLogStorage,
        address _tenantConfigStorage
    ) {
        require(_kycDataStorage != address(0), "Invalid KYC data storage address");
        require(_auditLogStorage != address(0), "Invalid audit log storage address");
        require(_tenantConfigStorage != address(0), "Invalid tenant config storage address");
        
        owner = msg.sender;
        authorizedWriters[owner] = true;
        
        kycDataStorage = KYCDataStorage(_kycDataStorage);
        auditLogStorage = AuditLogStorage(_auditLogStorage);
        tenantConfigStorage = TenantConfigStorage(_tenantConfigStorage);
    }
    
    // ============ CONFIGURATION FUNCTIONS ============
    
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
     * @dev Verify KYC for a user
     * @param user Address of the user
     * @param verificationHash IPFS hash containing verification data
     * @param riskScore Risk score (0-100)
     * @param jurisdiction Jurisdiction where KYC was performed
     * @param tenantId ID of the tenant that verified the user
     */
    function verifyKYC(
        address user,
        string memory verificationHash,
        uint256 riskScore,
        string memory jurisdiction,
        string memory tenantId
    ) external onlyAuthorized validUser(user) validTenant(tenantId) {
        // Verify tenant exists and is active
        require(tenantConfigStorage.isTenantActive(tenantId), "Tenant not active");
        
        // Get tenant configuration
        (,, uint256 maxRiskScore,,,) = tenantConfigStorage.getTenantConfig(tenantId);
        require(riskScore <= maxRiskScore, "Risk score exceeds tenant limit");
        
        // Store KYC data
        kycDataStorage.storeKYCData(user, verificationHash, riskScore, jurisdiction, tenantId);
        
        // Create audit log
        auditLogStorage.createSimpleAuditLog(
            user,
            "KYC_VERIFIED",
            string(abi.encodePacked("KYC verified with risk score: ", _uintToString(riskScore))),
            tenantId,
            jurisdiction
        );
        
        // Get expiry time for event
        KYCDataStorage.KYCData memory kycData = kycDataStorage.getKYCData(user);
        uint256 expiresAt = kycData.expiresAt;
        
        emit KYCVerified(user, tenantId, jurisdiction, riskScore, expiresAt);
    }
    
    /**
     * @dev Update KYC status for a user
     * @param user Address of the user
     * @param isActive Whether KYC should be active
     * @param reason Reason for the status change
     */
    function updateKYCStatus(
        address user,
        bool isActive,
        string memory reason
    ) external onlyAuthorized validUser(user) {
        // Check if user is verified
        (bool isVerified,,) = kycDataStorage.getKYCStatus(user);
        require(isVerified, "User not verified");
        
        // Update status
        kycDataStorage.updateKYCStatus(user, isActive);
        
        // Create audit log
        auditLogStorage.createSimpleAuditLog(
            user,
            isActive ? "KYC_ACTIVATED" : "KYC_DEACTIVATED",
            reason,
            "",
            ""
        );
        
        emit KYCStatusUpdated(user, isActive, reason);
    }
    
    /**
     * @dev Update risk score for a user
     * @param user Address of the user
     * @param newRiskScore New risk score
     * @param reason Reason for the risk score change
     */
    function updateRiskScore(
        address user,
        uint256 newRiskScore,
        string memory reason
    ) external onlyAuthorized validUser(user) {
        // Check if user is verified
        (bool isVerified,,) = kycDataStorage.getKYCStatus(user);
        require(isVerified, "User not verified");
        
        // Get current KYC data to check tenant limits
        KYCDataStorage.KYCData memory kycData = kycDataStorage.getKYCData(user);
        uint256 currentRiskScore = kycData.riskScore;
        string memory tenantId = kycData.tenantId;
        
        // Verify tenant exists and check risk score limit
        if (bytes(tenantId).length > 0) {
            (,, uint256 maxRiskScore,,,) = tenantConfigStorage.getTenantConfig(tenantId);
            require(newRiskScore <= maxRiskScore, "Risk score exceeds tenant limit");
        }
        
        // Update risk score
        kycDataStorage.updateRiskScore(user, newRiskScore);
        
        // Create audit log
        auditLogStorage.createSimpleAuditLog(
            user,
            "RISK_SCORE_UPDATED",
            string(abi.encodePacked(
                "Risk score updated from ", 
                _uintToString(currentRiskScore), 
                " to ", 
                _uintToString(newRiskScore),
                ". Reason: ",
                reason
            )),
            tenantId,
            ""
        );
    }
    
    /**
     * @dev Extend KYC expiry for a user
     * @param user Address of the user
     * @param additionalTime Additional time to add to expiry
     * @param reason Reason for the extension
     */
    function extendKYCExpiry(
        address user,
        uint256 additionalTime,
        string memory reason
    ) external onlyAuthorized validUser(user) {
        // Check if user is verified
        (bool isVerified,,) = kycDataStorage.getKYCStatus(user);
        require(isVerified, "User not verified");
        
        // Extend expiry
        kycDataStorage.extendKYCExpiry(user, additionalTime);
        
        // Get tenant ID for audit log
        KYCDataStorage.KYCData memory kycData = kycDataStorage.getKYCData(user);
        string memory tenantId = kycData.tenantId;
        
        // Create audit log
        auditLogStorage.createSimpleAuditLog(
            user,
            "KYC_EXPIRY_EXTENDED",
            string(abi.encodePacked(
                "KYC expiry extended by ",
                _uintToString(additionalTime),
                " seconds. Reason: ",
                reason
            )),
            tenantId,
            ""
        );
    }
    
    // ============ WALLET MANAGEMENT FUNCTIONS ============
    
    /**
     * @dev Link a wallet to a user
     * @param user Address of the user
     * @param wallet Address of the wallet to link
     */
    function linkWallet(
        address user,
        address wallet
    ) external onlyAuthorized validUser(user) validWallet(wallet) {
        // Check if user is verified
        (bool isVerified,,) = kycDataStorage.getKYCStatus(user);
        require(isVerified, "User not verified");
        
        // Link wallet
        kycDataStorage.linkWallet(user, wallet);
        
        // Get tenant ID for audit log
        KYCDataStorage.KYCData memory kycData = kycDataStorage.getKYCData(user);
        string memory tenantId = kycData.tenantId;
        
        // Create audit log
        auditLogStorage.createSimpleAuditLog(
            user,
            "WALLET_LINKED",
            string(abi.encodePacked("Wallet linked: ", _addressToString(wallet))),
            tenantId,
            ""
        );
        
        emit WalletLinked(user, wallet, tenantId);
    }
    
    /**
     * @dev Unlink a wallet from a user
     * @param user Address of the user
     * @param wallet Address of the wallet to unlink
     */
    function unlinkWallet(
        address user,
        address wallet
    ) external onlyAuthorized validUser(user) validWallet(wallet) {
        // Check if user is verified
        (bool isVerified,,) = kycDataStorage.getKYCStatus(user);
        require(isVerified, "User not verified");
        
        // Unlink wallet
        kycDataStorage.unlinkWallet(user, wallet);
        
        // Get tenant ID for audit log
        KYCDataStorage.KYCData memory kycData = kycDataStorage.getKYCData(user);
        string memory tenantId = kycData.tenantId;
        
        // Create audit log
        auditLogStorage.createSimpleAuditLog(
            user,
            "WALLET_UNLINKED",
            string(abi.encodePacked("Wallet unlinked: ", _addressToString(wallet))),
            tenantId,
            ""
        );
        
        emit WalletUnlinked(user, wallet, tenantId);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Check if KYC is valid for a user
     * @param user Address of the user
     * @return Whether KYC is valid
     */
    function isKYCValid(address user) external view validUser(user) returns (bool) {
        return kycDataStorage.isKYCValid(user);
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
        return kycDataStorage.getKYCStatus(user);
    }
    
    /**
     * @dev Get complete KYC data for a user
     * @param user Address of the user
     * @return Complete KYC data structure
     */
    function getKYCData(address user) external view validUser(user) returns (KYCDataStorage.KYCData memory) {
        return kycDataStorage.getKYCData(user);
    }
    
    /**
     * @dev Get all linked wallets for a user
     * @param user Address of the user
     * @return Array of linked wallet addresses
     */
    function getLinkedWallets(address user) external view validUser(user) returns (address[] memory) {
        return kycDataStorage.getLinkedWallets(user);
    }
    
    /**
     * @dev Get wallet count for a user
     * @param user Address of the user
     * @return Number of linked wallets
     */
    function getWalletCount(address user) external view validUser(user) returns (uint256) {
        return kycDataStorage.getWalletCount(user);
    }
    
    /**
     * @dev Get all users for a specific tenant
     * @param tenantId ID of the tenant
     * @return Array of user addresses
     */
    function getTenantUsers(string memory tenantId) external view validTenant(tenantId) returns (address[] memory) {
        return kycDataStorage.getTenantUsers(tenantId);
    }
    
    /**
     * @dev Get recent audit logs for a user
     * @param user Address of the user
     * @param count Number of recent entries to return
     * @return Array of recent audit entries
     */
    function getRecentUserAuditLogs(
        address user,
        uint256 count
    ) external view validUser(user) returns (AuditLogStorage.AuditEntry[] memory) {
        return auditLogStorage.getRecentUserAuditLogs(user, count);
    }
    
    /**
     * @dev Get audit logs for a specific tenant
     * @param tenantId ID of the tenant
     * @return Array of audit entries
     */
    function getTenantAuditLogs(string memory tenantId) external view validTenant(tenantId) returns (AuditLogStorage.AuditEntry[] memory) {
        return auditLogStorage.getTenantAuditLogs(tenantId);
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
     * @dev Convert uint256 to string
     * @param value Value to convert
     * @return String representation of the value
     */
    function _uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        
        uint256 temp = value;
        uint256 digits;
        
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }
    
    /**
     * @dev Convert address to string
     * @param addr Address to convert
     * @return String representation of address
     */
    function _addressToString(address addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
}
