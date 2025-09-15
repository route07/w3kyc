// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../utility/InputValidator.sol";
import "../utility/BoundsChecker.sol";

/**
 * @title MultisigManager
 * @dev Flexible multisig system that defaults to single-signature but can be configured for multiple signatures
 * @notice This contract manages multisig requirements for critical operations across the KYC system
 * @author Web3 KYC Team
 */
contract MultisigManager is ReentrancyGuard {
    
    // ============ STRUCTS ============
    
    /**
     * @dev Structure to store multisig configuration for a function
     */
    struct MultisigConfig {
        bool isEnabled;                 // Whether multisig is enabled for this function
        uint256 requiredSignatures;     // Number of signatures required (1 = single sig, 2+ = multisig)
        uint256 timelockDuration;       // Timelock duration in seconds (0 = no timelock)
        bool isActive;                  // Whether this configuration is active
    }
    
    /**
     * @dev Structure to store pending operations
     */
    struct PendingOperation {
        address target;                 // Target contract address
        bytes data;                     // Function call data
        uint256 timestamp;              // When operation was proposed
        uint256 requiredSignatures;     // Required signatures
        uint256 timelockExpiry;         // When timelock expires
        mapping(address => bool) signatures; // Signatures collected
        uint256 signatureCount;         // Current signature count
        bool executed;                  // Whether operation was executed
    }
    
    // ============ STATE VARIABLES ============
    
    // Multisig configurations
    mapping(bytes32 => MultisigConfig) public multisigConfigs;
    mapping(bytes32 => PendingOperation) public pendingOperations;
    
    // Access control
    address public owner;
    mapping(address => bool) public authorizedSigners;
    mapping(address => bool) public authorizedWriters;
    
    // Operation tracking
    uint256 public operationCounter;
    mapping(uint256 => bytes32) public operationIds;
    
    // Version tracking
    uint256 public constant VERSION = 1;
    string public constant CONTRACT_NAME = "MultisigManager";
    
    // ============ EVENTS ============
    
    event MultisigConfigUpdated(
        bytes32 indexed functionId,
        bool isEnabled,
        uint256 requiredSignatures,
        uint256 timelockDuration
    );
    
    event OperationProposed(
        uint256 indexed operationId,
        bytes32 indexed functionId,
        address target,
        address proposer,
        uint256 requiredSignatures,
        uint256 timelockExpiry
    );
    
    event OperationSigned(
        uint256 indexed operationId,
        address signer,
        uint256 signatureCount
    );
    
    event OperationExecuted(
        uint256 indexed operationId,
        bytes32 indexed functionId,
        address target,
        bool success
    );
    
    event OperationCancelled(
        uint256 indexed operationId,
        address cancelledBy
    );
    
    event AuthorizedSignerUpdated(
        address indexed signer,
        bool authorized
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
    
    modifier onlyAuthorizedSigner() {
        require(authorizedSigners[msg.sender] || msg.sender == owner, "Not authorized signer");
        _;
    }
    
    modifier validSigner(address signer) {
        require(signer != address(0), "Invalid signer address");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Constructor to initialize the contract
     */
    constructor() {
        owner = msg.sender;
        authorizedSigners[owner] = true;
        authorizedWriters[owner] = true;
        
        // Initialize default configurations for critical functions
        _initializeDefaultConfigs();
    }
    
    // ============ INITIALIZATION FUNCTIONS ============
    
    /**
     * @dev Initialize default multisig configurations
     */
    function _initializeDefaultConfigs() internal {
        // System configuration functions - Default to single signature
        _setMultisigConfig("updateKYCConfig", false, 1, 0);
        _setMultisigConfig("updateCredentialConfig", false, 1, 0);
        _setMultisigConfig("updateComplianceConfig", false, 1, 0);
        _setMultisigConfig("updateAuditConfig", false, 1, 0);
        
        // Jurisdiction configuration - Default to single signature
        _setMultisigConfig("updateJurisdictionConfig", false, 1, 0);
        _setMultisigConfig("updateJurisdictionRules", false, 1, 0);
        
        // Access control - Default to single signature
        _setMultisigConfig("setSuperAdmin", false, 1, 0);
        _setMultisigConfig("updateRolePermissions", false, 1, 0);
        _setMultisigConfig("setAuthorizedWriter", false, 1, 0);
        _setMultisigConfig("setAuthorizedIssuer", false, 1, 0);
        
        // Tenant management - Default to single signature
        _setMultisigConfig("registerTenant", false, 1, 0);
        _setMultisigConfig("updateTenantConfig", false, 1, 0);
        _setMultisigConfig("updateTenantAdmin", false, 1, 0);
        _setMultisigConfig("deactivateTenant", false, 1, 0);
        
        // Emergency functions - Default to single signature
        _setMultisigConfig("clearUserAuditLogs", false, 1, 0);
        _setMultisigConfig("clearOldAuditLogs", false, 1, 0);
        
        // Credential type management - Default to single signature
        _setMultisigConfig("setAllowedCredentialType", false, 1, 0);
    }
    
    // ============ CONFIGURATION FUNCTIONS ============
    
    /**
     * @dev Set multisig configuration for a function
     * @param functionName Name of the function
     * @param isEnabled Whether multisig is enabled
     * @param requiredSignatures Number of signatures required
     * @param timelockDuration Timelock duration in seconds
     */
    function setMultisigConfig(
        string memory functionName,
        bool isEnabled,
        uint256 requiredSignatures,
        uint256 timelockDuration
    ) external onlyOwner {
        // Comprehensive input validation
        InputValidator.validateString(functionName, "functionName");
        InputValidator.validateMultisigConfig(requiredSignatures, timelockDuration);
        
        _setMultisigConfig(functionName, isEnabled, requiredSignatures, timelockDuration);
    }
    
    /**
     * @dev Internal function to set multisig configuration
     * @param functionName Name of the function
     * @param isEnabled Whether multisig is enabled
     * @param requiredSignatures Number of signatures required
     * @param timelockDuration Timelock duration in seconds
     */
    function _setMultisigConfig(
        string memory functionName,
        bool isEnabled,
        uint256 requiredSignatures,
        uint256 timelockDuration
    ) internal {
        bytes32 functionId = keccak256(bytes(functionName));
        
        multisigConfigs[functionId] = MultisigConfig({
            isEnabled: isEnabled,
            requiredSignatures: requiredSignatures,
            timelockDuration: timelockDuration,
            isActive: true
        });
        
        emit MultisigConfigUpdated(functionId, isEnabled, requiredSignatures, timelockDuration);
    }
    
    /**
     * @dev Enable multisig for a function
     * @param functionName Name of the function
     * @param requiredSignatures Number of signatures required
     * @param timelockDuration Timelock duration in seconds
     */
    function enableMultisig(
        string memory functionName,
        uint256 requiredSignatures,
        uint256 timelockDuration
    ) external onlyOwner {
        // Comprehensive input validation
        InputValidator.validateString(functionName, "functionName");
        InputValidator.validateMultisigConfig(requiredSignatures, timelockDuration);
        
        _setMultisigConfig(functionName, true, requiredSignatures, timelockDuration);
    }
    
    /**
     * @dev Disable multisig for a function (default to single signature)
     * @param functionName Name of the function
     */
    function disableMultisig(string memory functionName) external onlyOwner nonReentrant {
        // Comprehensive input validation
        InputValidator.validateString(functionName, "functionName");
        
        _setMultisigConfig(functionName, false, 1, 0);
    }
    
    /**
     * @dev Set authorized signer
     * @param signer Address to authorize/revoke
     * @param authorized Whether to authorize or revoke
     */
    function setAuthorizedSigner(address signer, bool authorized) external onlyOwner validSigner(signer) nonReentrant {
        // Comprehensive input validation
        InputValidator.validateAddress(signer, "signer");
        
        authorizedSigners[signer] = authorized;
        emit AuthorizedSignerUpdated(signer, authorized);
    }
    
    /**
     * @dev Set authorized writer
     * @param writer Address to authorize/revoke
     * @param authorized Whether to authorize or revoke
     */
    function setAuthorizedWriter(address writer, bool authorized) external onlyOwner validSigner(writer) nonReentrant {
        // Comprehensive input validation
        InputValidator.validateAddress(writer, "writer");
        
        authorizedWriters[writer] = authorized;
        emit AuthorizedWriterUpdated(writer, authorized);
    }
    
    // ============ MULTISIG OPERATION FUNCTIONS ============
    
    /**
     * @dev Propose a multisig operation
     * @param functionName Name of the function to call
     * @param target Target contract address
     * @param data Function call data
     * @return operationId ID of the proposed operation
     */
    function proposeOperation(
        string memory functionName,
        address target,
        bytes memory data
    ) external onlyAuthorizedSigner returns (uint256) {
        // Comprehensive input validation
        InputValidator.validateOperationParams(functionName, target, data);
        
        bytes32 functionId = keccak256(bytes(functionName));
        MultisigConfig memory config = multisigConfigs[functionId];
        
        require(config.isActive, "Function not configured");
        require(_isValidSigner(msg.sender), "Not an authorized signer");
        
        // If multisig is disabled, execute immediately
        if (!config.isEnabled) {
            return _executeImmediate(target, data, functionId);
        }
        
        // Create pending operation
        uint256 operationId = ++operationCounter;
        bytes32 opId = keccak256(abi.encodePacked(operationId, functionId, target, data, block.timestamp));
        operationIds[operationId] = opId;
        
        PendingOperation storage operation = pendingOperations[opId];
        operation.target = target;
        operation.data = data;
        operation.timestamp = block.timestamp;
        operation.requiredSignatures = config.requiredSignatures;
        operation.timelockExpiry = block.timestamp + config.timelockDuration;
        operation.signatures[msg.sender] = true;
        operation.signatureCount = 1;
        operation.executed = false;
        
        emit OperationProposed(operationId, functionId, target, msg.sender, config.requiredSignatures, operation.timelockExpiry);
        emit OperationSigned(operationId, msg.sender, 1);
        
        // If enough signatures and timelock expired, execute immediately
        if (operation.signatureCount >= operation.requiredSignatures && operation.timelockExpiry <= block.timestamp) {
            _executeOperation(operationId);
        }
        
        return operationId;
    }
    
    /**
     * @dev Sign a pending operation
     * @param operationId ID of the operation to sign
     */
    function signOperation(uint256 operationId) external onlyAuthorizedSigner nonReentrant {
        // Comprehensive input validation
        InputValidator.validateOperationId(operationId);
        
        bytes32 opId = operationIds[operationId];
        require(opId != bytes32(0), "Operation not found");
        
        PendingOperation storage operation = pendingOperations[opId];
        require(!operation.executed, "Operation already executed");
        require(!operation.signatures[msg.sender], "Already signed");
        require(_isValidSigner(msg.sender), "Not an authorized signer");
        
        // Validate that we haven't exceeded the required signatures
        require(operation.signatureCount < operation.requiredSignatures, "Operation already has enough signatures");
        
        operation.signatures[msg.sender] = true;
        operation.signatureCount++;
        
        uint256 signatureCount = operation.signatureCount;
        emit OperationSigned(operationId, msg.sender, signatureCount);
        
        // Check if ready to execute
        if (signatureCount >= operation.requiredSignatures && 
            block.timestamp >= operation.timelockExpiry) {
            _executeOperation(operationId);
        }
    }
    
    /**
     * @dev Execute a pending operation
     * @param operationId ID of the operation to execute
     */
    function executeOperation(uint256 operationId) external onlyAuthorizedSigner nonReentrant {
        // Comprehensive input validation
        InputValidator.validateOperationId(operationId);
        
        _executeOperation(operationId);
    }
    
    /**
     * @dev Cancel a pending operation
     * @param operationId ID of the operation to cancel
     */
    function cancelOperation(uint256 operationId) external onlyAuthorizedSigner nonReentrant {
        // Comprehensive input validation
        InputValidator.validateOperationId(operationId);
        
        bytes32 opId = operationIds[operationId];
        require(opId != bytes32(0), "Operation not found");
        
        PendingOperation storage operation = pendingOperations[opId];
        require(!operation.executed, "Operation already executed");
        
        // Only the proposer or owner can cancel
        require(operation.signatures[msg.sender] || msg.sender == owner, "Not authorized to cancel");
        
        operation.executed = true; // Mark as executed to prevent further actions
        emit OperationCancelled(operationId, msg.sender);
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Execute operation immediately (single signature)
     * @param target Target contract address
     * @param data Function call data
     * @param functionId Function identifier
     * @return operationId ID of the operation
     */
    function _executeImmediate(
        address target,
        bytes memory data,
        bytes32 functionId
    ) internal returns (uint256) {
        uint256 operationId = ++operationCounter;
        bytes32 opId = keccak256(abi.encodePacked(operationId, functionId, target, data, block.timestamp));
        operationIds[operationId] = opId;
        
        bool success = _executeCall(target, data);
        emit OperationExecuted(operationId, functionId, target, success);
        
        return operationId;
    }
    
    /**
     * @dev Execute a pending operation
     * @param operationId ID of the operation to execute
     */
    function _executeOperation(uint256 operationId) internal {
        bytes32 opId = operationIds[operationId];
        PendingOperation storage operation = pendingOperations[opId];
        
        require(!operation.executed, "Operation already executed");
        require(operation.signatureCount >= operation.requiredSignatures, "Insufficient signatures");
        require(block.timestamp >= operation.timelockExpiry, "Timelock not expired");
        
        operation.executed = true;
        
        bool success = _executeCall(operation.target, operation.data);
        emit OperationExecuted(operationId, opId, operation.target, success);
    }
    
    /**
     * @dev Execute a contract call
     * @param target Target contract address
     * @param data Function call data
     * @return success Whether the call was successful
     */
    function _executeCall(address target, bytes memory data) internal returns (bool success) {
        (success, ) = target.call(data);
    }
    
    /**
     * @dev Count signatures for an operation
     * @param operation Operation to count signatures for
     * @return count Number of valid signatures
     */
    function _countSignatures(PendingOperation storage operation) internal view returns (uint256 count) {
        // Return the stored signature count for gas efficiency
        // The signatureCount is maintained accurately in proposeOperation and signOperation
        return operation.signatureCount;
    }
    
    /**
     * @dev Validate that a signature is from an authorized signer
     * @param signer Address of the signer
     * @return Whether the signer is authorized
     */
    function _isValidSigner(address signer) internal view returns (bool) {
        return authorizedSigners[signer] || signer == owner;
    }
    
    /**
     * @dev Get list of signers for an operation
     * @param operationId ID of the operation
     * @return signers Array of signer addresses
     */
    function getOperationSigners(uint256 operationId) external view returns (address[] memory signers) {
        // Comprehensive input validation
        InputValidator.validateOperationId(operationId);
        
        bytes32 opId = operationIds[operationId];
        require(opId != bytes32(0), "Operation not found");
        
        PendingOperation storage operation = pendingOperations[opId];
        
        // Comprehensive bounds checking
        BoundsChecker.validateSignerArray(operation.requiredSignatures, "requiredSignatures");
        
        // Count valid signers first
        uint256 signerCount = 0;
        
        // Validate memory allocation
        BoundsChecker.validateMemoryAllocation(operation.requiredSignatures, BoundsChecker.MAX_SIGNERS, "tempSigners");
        address[] memory tempSigners = new address[](operation.requiredSignatures);
        
        // Check owner
        if (operation.signatures[owner]) {
            BoundsChecker.validateArrayIndex(signerCount, operation.requiredSignatures, "tempSigners");
            tempSigners[signerCount] = owner;
            signerCount++;
        }
        
        // Check authorized signers (simplified - in production, maintain a list)
        // For gas efficiency, we'll return the count and let the caller iterate if needed
        
        // Validate memory allocation for result
        BoundsChecker.validateMemoryAllocation(signerCount, BoundsChecker.MAX_SIGNERS, "signers");
        signers = new address[](signerCount);
        
        // Validate iteration bounds
        BoundsChecker.validateIterationBounds(0, signerCount, signerCount, "signers");
        
        for (uint256 i = 0; i < signerCount; i++) {
            BoundsChecker.validateArrayIndex(i, signerCount, "signers");
            BoundsChecker.validateArrayIndex(i, operation.requiredSignatures, "tempSigners");
            signers[i] = tempSigners[i];
        }
    }
    
    /**
     * @dev Check if an operation has enough signatures to execute
     * @param operationId ID of the operation
     * @return Whether the operation can be executed
     */
    function canExecuteOperation(uint256 operationId) external view returns (bool) {
        // Comprehensive input validation
        InputValidator.validateOperationId(operationId);
        
        bytes32 opId = operationIds[operationId];
        if (opId == bytes32(0)) return false;
        
        PendingOperation storage operation = pendingOperations[opId];
        
        return (
            !operation.executed &&
            operation.signatureCount >= operation.requiredSignatures &&
            block.timestamp >= operation.timelockExpiry
        );
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get multisig configuration for a function
     * @param functionName Name of the function
     * @return Configuration for the function
     */
    function getMultisigConfig(string memory functionName) external view returns (MultisigConfig memory) {
        // Comprehensive input validation
        InputValidator.validateString(functionName, "functionName");
        
        bytes32 functionId = keccak256(bytes(functionName));
        return multisigConfigs[functionId];
    }
    
    /**
     * @dev Check if a function requires multisig
     * @param functionName Name of the function
     * @return Whether the function requires multisig
     */
    function requiresMultisig(string memory functionName) external view returns (bool) {
        // Comprehensive input validation
        InputValidator.validateString(functionName, "functionName");
        
        bytes32 functionId = keccak256(bytes(functionName));
        MultisigConfig memory config = multisigConfigs[functionId];
        return config.isEnabled && config.requiredSignatures > 1;
    }
    
    /**
     * @dev Get pending operation details
     * @param operationId ID of the operation
     * @return target Target contract address
     * @return data Function call data
     * @return timestamp When operation was proposed
     * @return requiredSignatures Required signatures
     * @return currentSignatures Current signature count
     * @return timelockExpiry When timelock expires
     * @return executed Whether operation was executed
     */
    function getPendingOperation(uint256 operationId) external view returns (
        address target,
        bytes memory data,
        uint256 timestamp,
        uint256 requiredSignatures,
        uint256 currentSignatures,
        uint256 timelockExpiry,
        bool executed
    ) {
        // Comprehensive input validation
        InputValidator.validateOperationId(operationId);
        
        bytes32 opId = operationIds[operationId];
        require(opId != bytes32(0), "Operation not found");
        
        PendingOperation storage operation = pendingOperations[opId];
        return (
            operation.target,
            operation.data,
            operation.timestamp,
            operation.requiredSignatures,
            operation.signatureCount,
            operation.timelockExpiry,
            operation.executed
        );
    }
    
    /**
     * @dev Get detailed operation information
     * @param operationId ID of the operation
     * @return target Target contract address
     * @return data Function call data
     * @return timestamp When operation was proposed
     * @return requiredSignatures Required signatures
     * @return currentSignatures Current signature count
     * @return timelockExpiry When timelock expires
     * @return executed Whether operation was executed
     * @return canExecute Whether operation can be executed now
     * @return timeRemaining Time remaining until timelock expires (0 if expired)
     */
    function getOperationDetails(uint256 operationId) external view returns (
        address target,
        bytes memory data,
        uint256 timestamp,
        uint256 requiredSignatures,
        uint256 currentSignatures,
        uint256 timelockExpiry,
        bool executed,
        bool canExecute,
        uint256 timeRemaining
    ) {
        // Comprehensive input validation
        InputValidator.validateOperationId(operationId);
        
        bytes32 opId = operationIds[operationId];
        require(opId != bytes32(0), "Operation not found");
        
        PendingOperation storage operation = pendingOperations[opId];
        
        bool timelockExpired = block.timestamp >= operation.timelockExpiry;
        bool hasEnoughSignatures = operation.signatureCount >= operation.requiredSignatures;
        bool executable = !operation.executed && hasEnoughSignatures && timelockExpired;
        
        uint256 remaining = 0;
        if (!timelockExpired) {
            remaining = operation.timelockExpiry - block.timestamp;
        }
        
        return (
            operation.target,
            operation.data,
            operation.timestamp,
            operation.requiredSignatures,
            operation.signatureCount,
            operation.timelockExpiry,
            operation.executed,
            executable,
            remaining
        );
    }
    
    /**
     * @dev Check if an address is authorized to sign
     * @param signer Address to check
     * @return Whether the address is authorized
     */
    function isAuthorizedSigner(address signer) external view returns (bool) {
        // Comprehensive input validation
        InputValidator.validateAddress(signer, "signer");
        
        return authorizedSigners[signer] || signer == owner;
    }
    
    /**
     * @dev Check if an address is authorized to write
     * @param writer Address to check
     * @return Whether the address is authorized
     */
    function isAuthorizedWriter(address writer) external view returns (bool) {
        // Comprehensive input validation
        InputValidator.validateAddress(writer, "writer");
        
        return authorizedWriters[writer] || writer == owner;
    }
    
    /**
     * @dev Get total number of authorized signers
     * @return count Number of authorized signers (including owner)
     */
    function getAuthorizedSignerCount() external view returns (uint256 count) {
        // Owner is always counted as 1
        count = 1;
        
        // Note: In a production system, you would maintain a separate array
        // of authorized signers to efficiently count them. For gas efficiency,
        // this simplified version assumes the owner + authorized signers
        // The actual count would need to be maintained separately
        return count;
    }
    
    /**
     * @dev Check if an operation has been signed by a specific address
     * @param operationId ID of the operation
     * @param signer Address to check
     * @return Whether the address has signed the operation
     */
    function hasSignedOperation(uint256 operationId, address signer) external view returns (bool) {
        // Comprehensive input validation
        InputValidator.validateOperationId(operationId);
        InputValidator.validateAddress(signer, "signer");
        
        bytes32 opId = operationIds[operationId];
        if (opId == bytes32(0)) return false;
        
        PendingOperation storage operation = pendingOperations[opId];
        return operation.signatures[signer];
    }
    
    /**
     * @dev Get signature status for an operation
     * @param operationId ID of the operation
     * @return currentSignatures Current number of signatures
     * @return requiredSignatures Required number of signatures
     * @return isComplete Whether the operation has enough signatures
     */
    function getSignatureStatus(uint256 operationId) external view returns (
        uint256 currentSignatures,
        uint256 requiredSignatures,
        bool isComplete
    ) {
        // Comprehensive input validation
        InputValidator.validateOperationId(operationId);
        
        bytes32 opId = operationIds[operationId];
        require(opId != bytes32(0), "Operation not found");
        
        PendingOperation storage operation = pendingOperations[opId];
        
        return (
            operation.signatureCount,
            operation.requiredSignatures,
            operation.signatureCount >= operation.requiredSignatures
        );
    }
}
