// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./InputValidator.sol";

/**
 * @title CredentialTypeManagerSimple
 * @dev Simplified credential type management system
 * @notice This contract manages different types of credentials that can be issued
 * @author Web3 KYC Team
 */
contract CredentialTypeManagerSimple is ReentrancyGuard {
    
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
    CredentialCategory[] public allCategories;
    
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
    
    modifier validCategory(CredentialCategory category) {
        require(uint256(category) < 5, "Invalid credential category");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        owner = msg.sender;
        authorizedWriters[owner] = true;
        
        // Initialize categories
        allCategories = [
            CredentialCategory.IDENTITY,
            CredentialCategory.FINANCIAL,
            CredentialCategory.PROFESSIONAL,
            CredentialCategory.COMPLIANCE,
            CredentialCategory.CUSTOM
        ];
        
        // Initialize default credential types
        _initializeDefaultCredentialTypes();
    }
    
    // ============ CREDENTIAL TYPE MANAGEMENT ============
    
    /**
     * @dev Create a new credential type
     * @param credentialTypeId Unique identifier for the credential type
     * @param name Human-readable name
     * @param description Description of the credential type
     * @param category Category of the credential
     * @param defaultValidityPeriod Default validity period in days
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
    ) external onlyAuthorizedWriter validCategory(category) nonReentrant {
        // Input validation
        InputValidator.validateString(credentialTypeId, "credentialTypeId");
        InputValidator.validateString(name, "name");
        InputValidator.validateString(description, "description");
        InputValidator.validateString(version, "version");
        InputValidator.validateUintPositive(defaultValidityPeriod, "defaultValidityPeriod");
        
        require(credentialTypes[credentialTypeId].createdBy == address(0), "Credential type already exists");
        
        // Create credential type
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
        
        // Add to category mapping
        credentialTypesByCategory[category].push(credentialTypeId);
        
        // Add to all types array
        allCredentialTypeIds.push(credentialTypeId);
        
        emit CredentialTypeCreated(credentialTypeId, name, category);
    }
    
    /**
     * @dev Update credential type status
     * @param credentialTypeId ID of the credential type
     * @param status New status
     */
    function updateCredentialTypeStatus(
        string memory credentialTypeId,
        CredentialStatus status
    ) external onlyAuthorizedWriter validCredentialType(credentialTypeId) nonReentrant {
        InputValidator.validateString(credentialTypeId, "credentialTypeId");
        
        credentialTypes[credentialTypeId].status = status;
        
        emit CredentialTypeUpdated(credentialTypeId, status);
    }
    
    /**
     * @dev Get credential type details
     * @param credentialTypeId ID of the credential type
     * @return credentialType Credential type details
     */
    function getCredentialType(string memory credentialTypeId) external view validCredentialType(credentialTypeId) returns (CredentialType memory credentialType) {
        return credentialTypes[credentialTypeId];
    }
    
    /**
     * @dev Check if credential type is active
     * @param credentialTypeId ID of the credential type
     * @return Whether the credential type is active
     */
    function isCredentialTypeActive(string memory credentialTypeId) external view validCredentialType(credentialTypeId) returns (bool) {
        return credentialTypes[credentialTypeId].status == CredentialStatus.ACTIVE;
    }
    
    // ============ QUERY FUNCTIONS ============
    
    /**
     * @dev Get all credential types by category
     * @param category Category to query
     * @return credentialTypeIds Array of credential type IDs
     */
    function getCredentialTypesByCategory(CredentialCategory category) external view validCategory(category) returns (string[] memory credentialTypeIds) {
        return credentialTypesByCategory[category];
    }
    
    /**
     * @dev Get all credential type IDs
     * @return credentialTypeIds Array of all credential type IDs
     */
    function getAllCredentialTypeIds() external view returns (string[] memory credentialTypeIds) {
        return allCredentialTypeIds;
    }
    
    /**
     * @dev Get all categories
     * @return categories Array of all categories
     */
    function getAllCategories() external view returns (CredentialCategory[] memory categories) {
        return allCategories;
    }
    
    // ============ ACCESS CONTROL ============
    
    /**
     * @dev Set authorized writer
     * @param writer Address to authorize/revoke
     * @param authorized Whether to authorize or revoke
     */
    function setAuthorizedWriter(address writer, bool authorized) external onlyOwner nonReentrant {
        InputValidator.validateAddress(writer, "writer");
        
        authorizedWriters[writer] = authorized;
        emit AuthorizedWriterUpdated(writer, authorized);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get credential type statistics
     * @return totalTypes Total number of credential types
     * @return activeTypes Number of active credential types
     * @return categoriesCount Number of categories
     */
    function getCredentialTypeStatistics() external view returns (uint256 totalTypes, uint256 activeTypes, uint256 categoriesCount) {
        totalTypes = allCredentialTypeIds.length;
        categoriesCount = allCategories.length;
        
        // Count active types
        for (uint256 i = 0; i < allCredentialTypeIds.length; i++) {
            if (credentialTypes[allCredentialTypeIds[i]].status == CredentialStatus.ACTIVE) {
                activeTypes++;
            }
        }
    }
    
    /**
     * @dev Check if address is authorized writer
     * @param writer Address to check
     * @return Whether the address is authorized
     */
    function isAuthorizedWriter(address writer) external view returns (bool) {
        InputValidator.validateAddress(writer, "writer");
        
        return authorizedWriters[writer] || writer == owner;
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Initialize default credential types
     */
    function _initializeDefaultCredentialTypes() internal {
        // KYC Identity Credential
        credentialTypes["kyc-identity"] = CredentialType({
            credentialTypeId: "kyc-identity",
            name: "KYC Identity Verification",
            description: "Identity verification credential for KYC compliance",
            category: CredentialCategory.IDENTITY,
            status: CredentialStatus.ACTIVE,
            defaultValidityPeriod: 365,
            requiresBiometric: false,
            requiresDocumentProof: true,
            creationTimestamp: block.timestamp,
            createdBy: owner,
            version: "1.0.0"
        });
        
        // Financial Credential
        credentialTypes["financial-status"] = CredentialType({
            credentialTypeId: "financial-status",
            name: "Financial Status Verification",
            description: "Financial status and income verification credential",
            category: CredentialCategory.FINANCIAL,
            status: CredentialStatus.ACTIVE,
            defaultValidityPeriod: 180,
            requiresBiometric: false,
            requiresDocumentProof: true,
            creationTimestamp: block.timestamp,
            createdBy: owner,
            version: "1.0.0"
        });
        
        // Professional Credential
        credentialTypes["professional-verification"] = CredentialType({
            credentialTypeId: "professional-verification",
            name: "Professional Verification",
            description: "Professional qualifications and status verification",
            category: CredentialCategory.PROFESSIONAL,
            status: CredentialStatus.ACTIVE,
            defaultValidityPeriod: 730,
            requiresBiometric: false,
            requiresDocumentProof: true,
            creationTimestamp: block.timestamp,
            createdBy: owner,
            version: "1.0.0"
        });
        
        // Add to arrays
        allCredentialTypeIds.push("kyc-identity");
        allCredentialTypeIds.push("financial-status");
        allCredentialTypeIds.push("professional-verification");
        
        credentialTypesByCategory[CredentialCategory.IDENTITY].push("kyc-identity");
        credentialTypesByCategory[CredentialCategory.FINANCIAL].push("financial-status");
        credentialTypesByCategory[CredentialCategory.PROFESSIONAL].push("professional-verification");
    }
}
