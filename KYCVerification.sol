// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title KYCVerification
 * @dev Smart contract for managing KYC verification status on blockchain
 * @notice This contract stores KYC verification status and allows for reusable credentials
 */
contract KYCVerification is Ownable, Pausable, ReentrancyGuard {
    
    // Structs
    struct KYCData {
        bool isVerified;
        string verificationHash; // IPFS hash of verification data
        uint256 verificationDate;
        uint256 riskScore; // 0-100
        bool isActive;
        uint256 expiresAt;
        address linkedWallet;
    }
    
    struct AuditEntry {
        string action;
        string details;
        uint256 timestamp;
    }
    
    // State variables
    mapping(address => KYCData) public kycData;
    mapping(address => AuditEntry[]) public auditLogs;
    mapping(address => bool) public authorizedVerifiers;
    
    // Events
    event KYCVerified(address indexed user, string verificationHash, uint256 timestamp);
    event KYCStatusUpdated(address indexed user, bool isActive, uint256 timestamp);
    event AuditLogCreated(address indexed user, string action, string details, uint256 timestamp);
    event WalletLinked(address indexed user, address indexed wallet);
    event VerifierAuthorized(address indexed verifier);
    event VerifierRevoked(address indexed verifier);
    
    // Constants
    uint256 public constant KYC_EXPIRY_DURATION = 365 days; // 1 year
    uint256 public constant MAX_RISK_SCORE = 100;
    
    // Modifiers
    modifier onlyAuthorizedVerifier() {
        require(authorizedVerifiers[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    modifier onlyVerifiedUser(address user) {
        require(kycData[user].isVerified, "User not verified");
        _;
    }
    
    /**
     * @dev Constructor
     * @param initialOwner The initial owner of the contract
     */
    constructor(address initialOwner) Ownable(initialOwner) {}
    
    /**
     * @dev Verify KYC for a user
     * @param user Address of the user to verify
     * @param verificationHash IPFS hash containing verification data
     * @param riskScore Risk score (0-100)
     */
    function verifyKYC(
        address user,
        string memory verificationHash,
        uint256 riskScore
    ) external onlyAuthorizedVerifier whenNotPaused nonReentrant {
        require(user != address(0), "Invalid user address");
        require(bytes(verificationHash).length > 0, "Invalid verification hash");
        require(riskScore <= MAX_RISK_SCORE, "Invalid risk score");
        
        kycData[user] = KYCData({
            isVerified: true,
            verificationHash: verificationHash,
            verificationDate: block.timestamp,
            riskScore: riskScore,
            isActive: true,
            expiresAt: block.timestamp + KYC_EXPIRY_DURATION,
            linkedWallet: address(0)
        });
        
        // Create audit log
        _createAuditLog(user, "KYC_VERIFIED", verificationHash);
        
        emit KYCVerified(user, verificationHash, block.timestamp);
    }
    
    /**
     * @dev Update KYC status for a user
     * @param user Address of the user
     * @param isActive Whether KYC is active
     */
    function updateKYCStatus(
        address user,
        bool isActive
    ) external onlyAuthorizedVerifier whenNotPaused {
        require(kycData[user].isVerified, "User not verified");
        
        kycData[user].isActive = isActive;
        
        // Create audit log
        string memory action = isActive ? "KYC_ACTIVATED" : "KYC_DEACTIVATED";
        _createAuditLog(user, action, "");
        
        emit KYCStatusUpdated(user, isActive, block.timestamp);
    }
    
    /**
     * @dev Link a wallet to a user
     * @param user Address of the user
     * @param walletAddress Address of the wallet to link
     */
    function linkWallet(
        address user,
        address walletAddress
    ) external onlyAuthorizedVerifier whenNotPaused {
        require(kycData[user].isVerified, "User not verified");
        require(walletAddress != address(0), "Invalid wallet address");
        
        kycData[user].linkedWallet = walletAddress;
        
        // Create audit log
        _createAuditLog(user, "WALLET_LINKED", _addressToString(walletAddress));
        
        emit WalletLinked(user, walletAddress);
    }
    
    /**
     * @dev Get KYC status for a user
     * @param user Address of the user
     * @return isVerified Whether the user is verified
     * @return verificationHash IPFS hash of verification data
     * @return verificationDate Timestamp of verification
     * @return riskScore Risk score (0-100)
     * @return isActive Whether KYC is active
     * @return expiresAt Expiration timestamp
     */
    function getKYCStatus(address user) external view returns (
        bool isVerified,
        string memory verificationHash,
        uint256 verificationDate,
        uint256 riskScore,
        bool isActive,
        uint256 expiresAt
    ) {
        KYCData memory data = kycData[user];
        return (
            data.isVerified,
            data.verificationHash,
            data.verificationDate,
            data.riskScore,
            data.isActive,
            data.expiresAt
        );
    }
    
    /**
     * @dev Check if KYC is valid (verified, active, and not expired)
     * @param user Address of the user
     * @return Whether KYC is valid
     */
    function isKYCValid(address user) external view returns (bool) {
        KYCData memory data = kycData[user];
        return data.isVerified && 
               data.isActive && 
               block.timestamp < data.expiresAt;
    }
    
    /**
     * @dev Get verification hash for a user
     * @param user Address of the user
     * @return IPFS verification hash
     */
    function getVerificationHash(address user) external view returns (string memory) {
        return kycData[user].verificationHash;
    }
    
    /**
     * @dev Get risk score for a user
     * @param user Address of the user
     * @return Risk score
     */
    function getRiskScore(address user) external view returns (uint256) {
        return kycData[user].riskScore;
    }
    
    /**
     * @dev Get expiration date for a user's KYC
     * @param user Address of the user
     * @return Expiration timestamp
     */
    function getExpirationDate(address user) external view returns (uint256) {
        return kycData[user].expiresAt;
    }
    
    /**
     * @dev Get linked wallet for a user
     * @param user Address of the user
     * @return Linked wallet address
     */
    function getLinkedWallet(address user) external view returns (address) {
        return kycData[user].linkedWallet;
    }
    
    /**
     * @dev Get audit logs for a user
     * @param user Address of the user
     * @return Array of audit entries
     */
    function getAuditLogs(address user) external view returns (AuditEntry[] memory) {
        return auditLogs[user];
    }
    
    /**
     * @dev Create audit log entry
     * @param user Address of the user
     * @param action Action performed
     * @param details Details of the action
     */
    function createAuditLog(
        address user,
        string memory action,
        string memory details
    ) external onlyAuthorizedVerifier whenNotPaused {
        _createAuditLog(user, action, details);
    }
    
    /**
     * @dev Authorize a verifier
     * @param verifier Address of the verifier to authorize
     */
    function authorizeVerifier(address verifier) external onlyOwner {
        require(verifier != address(0), "Invalid verifier address");
        authorizedVerifiers[verifier] = true;
        emit VerifierAuthorized(verifier);
    }
    
    /**
     * @dev Revoke verifier authorization
     * @param verifier Address of the verifier to revoke
     */
    function revokeVerifier(address verifier) external onlyOwner {
        authorizedVerifiers[verifier] = false;
        emit VerifierRevoked(verifier);
    }
    
    /**
     * @dev Check if address is authorized verifier
     * @param verifier Address to check
     * @return Whether address is authorized
     */
    function isAuthorizedVerifier(address verifier) external view returns (bool) {
        return authorizedVerifiers[verifier] || verifier == owner();
    }
    
    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Internal function to create audit log
     * @param user Address of the user
     * @param action Action performed
     * @param details Details of the action
     */
    function _createAuditLog(
        address user,
        string memory action,
        string memory details
    ) internal {
        auditLogs[user].push(AuditEntry({
            action: action,
            details: details,
            timestamp: block.timestamp
        }));
        
        emit AuditLogCreated(user, action, details, block.timestamp);
    }
    
    /**
     * @dev Convert address to string
     * @param addr Address to convert
     * @return String representation of address
     */
    function _addressToString(address addr) internal pure returns (string memory) {
        return string(abi.encodePacked(addr));
    }
} 