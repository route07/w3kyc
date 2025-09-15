// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CredentialTypeManagerRefactored
 * @dev Refactored credential type management to avoid stack too deep errors
 * @notice Simplified credential type management system
 * @author Web3 KYC Team
 */
contract CredentialTypeManagerRefactored is ReentrancyGuard {
    
    // ============ ENUMS ============
    
    enum CredentialCategory {
        IDENTITY,
        FINANCIAL,
        PROFESSIONAL,
        COMPLIANCE,
        CUSTOM
    }
    
    enum CredentialStatus {
        ACTIVE,
        INACTIVE,
        DEPRECATED,
        SUSPENDED
    }
    
    // ============ STRUCTS ============
    
    struct CredentialType {
        string credentialTypeId;
        string name;
        string description;
        CredentialCategory category;
        CredentialStatus status;
        uint256 defaultValidityPeriod;
        bool requiresBiometric;
        bool requiresDocumentProof;
        uint256 creationTimestamp;
        address createdBy;
        string version;
    }
    
    // ============ STATE VARIABLES ============
    
    address public owner;
    mapping(address => bool) public authorizedWriters;
    
    // Credential type storage
    mapping(string => CredentialType) public credentialTypes;
    mapping(CredentialCategory => string[]) public credentialTypesByCategory;
    
    // Arrays for iteration
    string[] public allCredentialTypeIds;
    
    // Events
    event CredentialTypeCreated(string indexed credentialTypeId, string name, CredentialCategory category);
    event CredentialTypeUpdated(string indexed credentialTypeId, CredentialStatus status);
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
    
    modifier validCredentialType(string memory credentialTypeId) {
        require(credentialTypes[credentialTypeId].createdBy != address(0), "Credential type not found");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        owner = msg.sender;
        authorizedWriters[owner] = true;
        _initializeDefaultCredentialTypes();
    }
    
    // ============ CREDENTIAL TYPE MANAGEMENT ============
    
    /**
     * @dev Create a new credential type
     * @param credentialTypeId Unique identifier for the credential type
     * @param name Human-readable name
     * @param description Description of the credential type
     * @param category Category of the credential
     * @param defaultValidityPeriod Default validity period in seconds
     * @param requiresBiometric Whether biometric verification is required
     * @param requiresDocumentProof Whether document proof is required
     * @param version Version of the credential type
     */
    function createCredentialType(
        string memory credentialTypeId,
        string memory name,
        string memory description,
        CredentialCategory category,
        uint256 defaultValidityPeriod,
        bool requiresBiometric,
        bool requiresDocumentProof,
        string memory version
    ) external onlyAuthorizedWriter nonReentrant {
        require(credentialTypes[credentialTypeId].createdBy == address(0), "Credential type already exists");
        require(bytes(credentialTypeId).length > 0, "Invalid credential type ID");
        require(bytes(name).length > 0, "Invalid name");
        
        credentialTypes[credentialTypeId] = CredentialType({
            credentialTypeId: credentialTypeId,
            name: name,
            description: description,
            category: category,
            status: CredentialStatus.ACTIVE,
            defaultValidityPeriod: defaultValidityPeriod,
            requiresBiometric: requiresBiometric,
            requiresDocumentProof: requiresDocumentProof,
            creationTimestamp: block.timestamp,
            createdBy: msg.sender,
            version: version
        });
        
        credentialTypesByCategory[category].push(credentialTypeId);
        allCredentialTypeIds.push(credentialTypeId);
        
        emit CredentialTypeCreated(credentialTypeId, name, category);
    }
    
    /**
     * @dev Update credential type status
     * @param credentialTypeId Credential type ID to update
     * @param status New status
     */
    function updateCredentialTypeStatus(
        string memory credentialTypeId,
        CredentialStatus status
    ) external onlyAuthorizedWriter validCredentialType(credentialTypeId) nonReentrant {
        credentialTypes[credentialTypeId].status = status;
        emit CredentialTypeUpdated(credentialTypeId, status);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get credential type details
     * @param credentialTypeId Credential type ID
     * @return credentialType Credential type details
     */
    function getCredentialType(string memory credentialTypeId) external view validCredentialType(credentialTypeId) returns (CredentialType memory credentialType) {
        return credentialTypes[credentialTypeId];
    }
    
    /**
     * @dev Check if credential type is active
     * @param credentialTypeId Credential type ID
     * @return Whether the credential type is active
     */
    function isCredentialTypeActive(string memory credentialTypeId) external view validCredentialType(credentialTypeId) returns (bool) {
        return credentialTypes[credentialTypeId].status == CredentialStatus.ACTIVE;
    }
    
    /**
     * @dev Get credential types by category
     * @param category Category to filter by
     * @return credentialTypeIds Array of credential type IDs
     */
    function getCredentialTypesByCategory(CredentialCategory category) external view returns (string[] memory credentialTypeIds) {
        return credentialTypesByCategory[category];
    }
    
    /**
     * @dev Get all credential type IDs
     * @return credentialTypeIds Array of all credential type IDs
     */
    function getAllCredentialTypeIds() external view returns (string[] memory credentialTypeIds) {
        return allCredentialTypeIds;
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
    
    /**
     * @dev Check if address is authorized writer
     * @param writer Address to check
     * @return Whether the address is authorized
     */
    function isAuthorizedWriter(address writer) external view returns (bool) {
        return authorizedWriters[writer] || writer == owner;
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Initialize default credential types
     */
    function _initializeDefaultCredentialTypes() internal {
        // KYC Identity Credential
        _createDefaultCredentialType(
            "kyc-identity",
            "KYC Identity Verification",
            "Identity verification credential for KYC compliance",
            CredentialCategory.IDENTITY,
            31536000, // 1 year
            false,
            true,
            "1.0"
        );
        
        // Financial Credential
        _createDefaultCredentialType(
            "financial-status",
            "Financial Status Verification",
            "Financial status and income verification credential",
            CredentialCategory.FINANCIAL,
            180 days,
            false,
            true,
            "1.0"
        );
    }
    
    /**
     * @dev Create default credential type (internal)
     */
    function _createDefaultCredentialType(
        string memory credentialTypeId,
        string memory name,
        string memory description,
        CredentialCategory category,
        uint256 defaultValidityPeriod,
        bool requiresBiometric,
        bool requiresDocumentProof,
        string memory version
    ) internal {
        credentialTypes[credentialTypeId] = CredentialType({
            credentialTypeId: credentialTypeId,
            name: name,
            description: description,
            category: category,
            status: CredentialStatus.ACTIVE,
            defaultValidityPeriod: defaultValidityPeriod,
            requiresBiometric: requiresBiometric,
            requiresDocumentProof: requiresDocumentProof,
            creationTimestamp: block.timestamp,
            createdBy: owner,
            version: version
        });
        
        credentialTypesByCategory[category].push(credentialTypeId);
        allCredentialTypeIds.push(credentialTypeId);
    }
}
