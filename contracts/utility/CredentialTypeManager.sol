// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./InputValidator.sol";

/**
 * @title CredentialTypeManager
 * @dev Dynamic credential type management system
 * @notice This contract manages different types of credentials that can be issued
 * @author Web3 KYC Team
 */
contract CredentialTypeManager is ReentrancyGuard {
    
    // ============ ENUMS ============
    
    enum CredentialCategory {
        IDENTITY,       // Identity verification credentials
        FINANCIAL,      // Financial credentials
        PROFESSIONAL,   // Professional credentials
        COMPLIANCE,     // Compliance credentials
        CUSTOM          // Custom credentials
    }
    
    enum CredentialStatus {
        ACTIVE,         // Credential type is active
        INACTIVE,       // Credential type is inactive
        DEPRECATED,     // Credential type is deprecated
        SUSPENDED       // Credential type is suspended
    }
    
    // ============ STRUCTS ============
    
    struct CredentialType {
        string credentialTypeId;        // Unique identifier for credential type
        string name;                    // Human-readable name
        string description;             // Description of the credential type
        CredentialCategory category;    // Category of the credential
        CredentialStatus status;        // Current status
        uint256 defaultValidityPeriod; // Default validity period in days
        bool requiresBiometric;         // Whether biometric verification is required
        bool requiresDocumentProof;     // Whether document proof is required
        bool requiresThirdPartyVerification; // Whether third-party verification is required
        string[] requiredFields;        // Required fields for this credential type
        string[] optionalFields;        // Optional fields for this credential type
        uint256 maxIssuanceCount;       // Maximum number of times this credential can be issued to a user
        uint256 creationTimestamp;      // When this credential type was created
        address createdBy;              // Address that created this credential type
        string version;                 // Version of the credential type
    }
    
    struct CredentialTypeConfig {
        bool allowMultipleIssuance;     // Whether multiple instances are allowed
        bool requiresExpiry;            // Whether expiry is required
        bool allowsRevocation;          // Whether revocation is allowed
        bool requiresRenewal;           // Whether renewal is required
        uint256 renewalPeriod;          // Renewal period in days
        string[] supportedJurisdictions; // Supported jurisdictions
        string metadata;                // Additional metadata
    }
    
    // ============ STATE VARIABLES ============
    
    address public owner;
    mapping(address => bool) public authorizedWriters;
    
    // Credential type storage
    mapping(string => CredentialType) public credentialTypes;
    mapping(string => CredentialTypeConfig) public credentialTypeConfigs;
    mapping(CredentialCategory => string[]) public credentialTypesByCategory;
    
    // Arrays for iteration
    string[] public allCredentialTypeIds;
    CredentialCategory[] public allCategories;
    
    // Events
    event CredentialTypeCreated(string indexed credentialTypeId, string name, CredentialCategory category);
    event CredentialTypeUpdated(string indexed credentialTypeId, CredentialStatus status);
    event CredentialTypeConfigUpdated(string indexed credentialTypeId, bool allowMultipleIssuance);
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
     * @param requiresThirdPartyVerification Whether third-party verification is required
     * @param requiredFields Array of required fields
     * @param optionalFields Array of optional fields
     * @param maxIssuanceCount Maximum number of times this credential can be issued
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
        bool requiresThirdPartyVerification,
        string[] memory requiredFields,
        string[] memory optionalFields,
        uint256 maxIssuanceCount,
        string memory version
    ) external onlyAuthorizedWriter validCategory(category) nonReentrant {
        // Comprehensive input validation
        InputValidator.validateString(credentialTypeId, "credentialTypeId");
        InputValidator.validateString(name, "name");
        InputValidator.validateString(description, "description");
        InputValidator.validateString(version, "version");
        InputValidator.validateUintPositive(defaultValidityPeriod, "defaultValidityPeriod");
        InputValidator.validateUintPositive(maxIssuanceCount, "maxIssuanceCount");
        
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
            requiresThirdPartyVerification: requiresThirdPartyVerification,
            requiredFields: requiredFields,
            optionalFields: optionalFields,
            maxIssuanceCount: maxIssuanceCount,
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
     * @dev Update credential type configuration
     * @param credentialTypeId ID of the credential type
     * @param config New configuration
     */
    function updateCredentialTypeConfig(
        string memory credentialTypeId,
        CredentialTypeConfig memory config
    ) external onlyAuthorizedWriter validCredentialType(credentialTypeId) nonReentrant {
        InputValidator.validateString(credentialTypeId, "credentialTypeId");
        InputValidator.validateString(config.metadata, "metadata");
        InputValidator.validateUintPositive(config.renewalPeriod, "renewalPeriod");
        
        credentialTypeConfigs[credentialTypeId] = config;
        
        emit CredentialTypeConfigUpdated(credentialTypeId, config.allowMultipleIssuance);
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
     * @dev Get credential type configuration
     * @param credentialTypeId ID of the credential type
     * @return config Credential type configuration
     */
    function getCredentialTypeConfig(string memory credentialTypeId) external view validCredentialType(credentialTypeId) returns (CredentialTypeConfig memory config) {
        return credentialTypeConfigs[credentialTypeId];
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
    
    /**
     * @dev Search credential types by name (simplified)
     * @param searchTerm Search term
     * @return credentialTypeIds Array of matching credential type IDs
     */
    function searchCredentialTypes(string memory searchTerm) external view returns (string[] memory credentialTypeIds) {
        InputValidator.validateString(searchTerm, "searchTerm");
        
        // Simplified search - return all types for now
        return allCredentialTypeIds;
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
        string[] memory kycRequiredFields = new string[](3);
        kycRequiredFields[0] = "fullName";
        kycRequiredFields[1] = "dateOfBirth";
        kycRequiredFields[2] = "nationality";
        
        string[] memory kycOptionalFields = new string[](2);
        kycOptionalFields[0] = "middleName";
        kycOptionalFields[1] = "previousName";
        
        credentialTypes["kyc-identity"] = CredentialType({
            credentialTypeId: "kyc-identity",
            name: "KYC Identity Verification",
            description: "Identity verification credential for KYC compliance",
            category: CredentialCategory.IDENTITY,
            status: CredentialStatus.ACTIVE,
            defaultValidityPeriod: 365,
            requiresBiometric: false,
            requiresDocumentProof: true,
            requiresThirdPartyVerification: true,
            requiredFields: kycRequiredFields,
            optionalFields: kycOptionalFields,
            maxIssuanceCount: 1,
            creationTimestamp: block.timestamp,
            createdBy: owner,
            version: "1.0.0"
        });
        
        // Financial Credential
        string[] memory financialRequiredFields = new string[](2);
        financialRequiredFields[0] = "income";
        financialRequiredFields[1] = "employmentStatus";
        
        string[] memory financialOptionalFields = new string[](1);
        financialOptionalFields[0] = "employer";
        
        credentialTypes["financial-status"] = CredentialType({
            credentialTypeId: "financial-status",
            name: "Financial Status Verification",
            description: "Financial status and income verification credential",
            category: CredentialCategory.FINANCIAL,
            status: CredentialStatus.ACTIVE,
            defaultValidityPeriod: 180,
            requiresBiometric: false,
            requiresDocumentProof: true,
            requiresThirdPartyVerification: true,
            requiredFields: financialRequiredFields,
            optionalFields: financialOptionalFields,
            maxIssuanceCount: 3,
            creationTimestamp: block.timestamp,
            createdBy: owner,
            version: "1.0.0"
        });
        
        // Professional Credential
        string[] memory professionalRequiredFields = new string[](2);
        professionalRequiredFields[0] = "profession";
        professionalRequiredFields[1] = "qualifications";
        
        credentialTypes["professional-verification"] = CredentialType({
            credentialTypeId: "professional-verification",
            name: "Professional Verification",
            description: "Professional qualifications and status verification",
            category: CredentialCategory.PROFESSIONAL,
            status: CredentialStatus.ACTIVE,
            defaultValidityPeriod: 730,
            requiresBiometric: false,
            requiresDocumentProof: true,
            requiresThirdPartyVerification: true,
            requiredFields: professionalRequiredFields,
            optionalFields: new string[](0),
            maxIssuanceCount: 5,
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
