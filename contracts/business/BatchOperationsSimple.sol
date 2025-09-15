// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../storage/KYCDataStorage.sol";
import "../storage/AuditLogStorage.sol";
import "../storage/DIDCredentialStorage.sol";
import "../utility/InputValidator.sol";

/**
 * @title BatchOperationsSimple
 * @dev Simplified batch operations for KYC verification and credential issuance
 * @notice This contract handles batch operations to improve efficiency and reduce gas costs
 * @author Web3 KYC Team
 */
contract BatchOperationsSimple is ReentrancyGuard {
    
    // ============ STRUCTS ============
    
    struct BatchKYCRequest {
        address user;
        string tenantId;
        string jurisdiction;
        string documentHash;
    }
    
    struct BatchOperationResult {
        bool success;
        string errorMessage;
    }
    
    // ============ STATE VARIABLES ============
    
    address public owner;
    mapping(address => bool) public authorizedWriters;
    
    // Contract references
    KYCDataStorage public kycDataStorage;
    AuditLogStorage public auditLogStorage;
    DIDCredentialStorage public didCredentialStorage;
    
    // Batch operation limits
    uint256 public constant MAX_BATCH_SIZE = 50;
    
    // Events
    event BatchKYCOperationCompleted(uint256 indexed batchId, uint256 successCount, uint256 failureCount);
    event AuthorizedWriterUpdated(address indexed writer, bool authorized);
    
    // ============ MODIFIERS ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAuthorizedWriter() {
        require(authorizedWriters[msg.sender] || msg.sender == owner, "Not authorized to write");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _kycDataStorage,
        address _auditLogStorage,
        address _didCredentialStorage
    ) {
        owner = msg.sender;
        authorizedWriters[owner] = true;
        
        kycDataStorage = KYCDataStorage(_kycDataStorage);
        auditLogStorage = AuditLogStorage(_auditLogStorage);
        didCredentialStorage = DIDCredentialStorage(_didCredentialStorage);
    }
    
    // ============ BATCH KYC OPERATIONS ============
    
    /**
     * @dev Process batch KYC verification requests
     * @param requests Array of KYC requests
     * @param batchId Unique identifier for this batch
     * @return results Array of operation results
     */
    function processBatchKYC(
        BatchKYCRequest[] memory requests,
        uint256 batchId
    ) external onlyAuthorizedWriter nonReentrant returns (BatchOperationResult[] memory results) {
        // Input validation
        require(requests.length <= MAX_BATCH_SIZE, "Batch size too large");
        require(batchId > 0, "Invalid batch ID");
        
        uint256 successCount = 0;
        uint256 failureCount = 0;
        
        // Initialize results array
        results = new BatchOperationResult[](requests.length);
        
        // Process each request
        for (uint256 i = 0; i < requests.length; i++) {
            try this._processSingleKYC(requests[i]) {
                results[i] = BatchOperationResult({
                    success: true,
                    errorMessage: ""
                });
                successCount++;
            } catch Error(string memory reason) {
                results[i] = BatchOperationResult({
                    success: false,
                    errorMessage: reason
                });
                failureCount++;
            } catch {
                results[i] = BatchOperationResult({
                    success: false,
                    errorMessage: "Unknown error"
                });
                failureCount++;
            }
        }
        
        emit BatchKYCOperationCompleted(batchId, successCount, failureCount);
    }
    
    /**
     * @dev Process single KYC request (internal)
     * @param request KYC request to process
     */
    function _processSingleKYC(BatchKYCRequest memory request) external {
        require(msg.sender == address(this), "Internal function only");
        
        // Validate request
        require(request.user != address(0), "Invalid user address");
        require(bytes(request.tenantId).length > 0, "Invalid tenant ID");
        require(bytes(request.jurisdiction).length > 0, "Invalid jurisdiction");
        
        // Process KYC verification
        kycDataStorage.updateKYCStatus(request.user, true);
        
        // Log individual KYC verification
        auditLogStorage.createAuditLog(
            request.user,
            request.tenantId,
            request.jurisdiction,
            "KYC_VERIFICATION",
            "KYC verification completed via batch operation",
            "SUCCESS"
        );
    }
    
    // ============ BATCH STATUS UPDATES ============
    
    /**
     * @dev Update KYC status for multiple users
     * @param users Array of user addresses
     * @param isActive New KYC active status
     */
    function batchUpdateKYCStatus(
        address[] memory users,
        bool isActive
    ) external onlyAuthorizedWriter nonReentrant {
        require(users.length <= MAX_BATCH_SIZE, "Batch size too large");
        
        // Update each user's status
        for (uint256 i = 0; i < users.length; i++) {
            require(users[i] != address(0), "Invalid user address");
            kycDataStorage.updateKYCStatus(users[i], isActive);
        }
    }
    
    // ============ ACCESS CONTROL ============
    
    /**
     * @dev Set authorized writer
     * @param writer Address to authorize/revoke
     * @param authorized Whether to authorize or revoke
     */
    function setAuthorizedWriter(address writer, bool authorized) external onlyOwner nonReentrant {
        require(writer != address(0), "Invalid writer address");
        authorizedWriters[writer] = authorized;
        emit AuthorizedWriterUpdated(writer, authorized);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get batch operation limits
     * @return maxBatchSize Maximum batch size
     */
    function getBatchLimits() external pure returns (uint256 maxBatchSize) {
        return MAX_BATCH_SIZE;
    }
    
    /**
     * @dev Check if address is authorized writer
     * @param writer Address to check
     * @return Whether the address is authorized
     */
    function isAuthorizedWriter(address writer) external view returns (bool) {
        return authorizedWriters[writer] || writer == owner;
    }
}
