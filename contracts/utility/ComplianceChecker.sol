// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../storage/KYCDataStorage.sol";
import "../storage/TenantConfigStorage.sol";
import "../storage/DIDCredentialStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ComplianceChecker
 * @dev Utility contract for compliance validation and jurisdiction-specific rules
 * @notice This contract handles compliance checking across different jurisdictions
 * @author Web3 KYC Team
 */
contract ComplianceChecker is ReentrancyGuard {
    
    // ============ STRUCTS ============
    
    /**
     * @dev Structure to store compliance configuration
     */
    struct ComplianceConfig {
        uint256 maxRiskScore;               // Global maximum risk score
        uint256 defaultExpiryDuration;      // Default expiry duration
        bool allowCrossJurisdiction;        // Whether to allow cross-jurisdiction operations
        bool requireCredentialVerification; // Whether to require credential verification
        bool enableRiskScoring;             // Whether to enable risk scoring
    }
    
    /**
     * @dev Structure to store jurisdiction-specific rules
     */
    struct JurisdictionRules {
        uint256 maxRiskScore;               // Maximum risk score for this jurisdiction
        uint256 expiryDuration;             // Expiry duration for this jurisdiction
        bool requiresAddressVerification;   // Whether address verification is required
        bool requiresPhoneVerification;     // Whether phone verification is required
        bool requiresEmailVerification;     // Whether email verification is required
        string[] requiredCredentialTypes;   // Required credential types
        bool isActive;                      // Whether jurisdiction is active
    }
    
    /**
     * @dev Structure to store compliance result
     */
    struct ComplianceResult {
        bool isCompliant;                   // Whether the operation is compliant
        string[] violations;                // List of compliance violations
        uint256 riskScore;                  // Calculated risk score
        string jurisdiction;                // Jurisdiction of the result
        uint256 expiresAt;                  // When compliance expires
    }
    
    // ============ STATE VARIABLES ============
    
    // Storage contract references
    KYCDataStorage public kycDataStorage;
    TenantConfigStorage public tenantConfigStorage;
    DIDCredentialStorage public didCredentialStorage;
    
    // Configuration
    ComplianceConfig public complianceConfig;
    mapping(string => JurisdictionRules) public jurisdictionRules;
    
    // Access control
    mapping(address => bool) public authorizedWriters;
    address public owner;
    
    // Version tracking
    uint256 public constant VERSION = 1;
    string public constant CONTRACT_NAME = "ComplianceChecker";
    
    // ============ EVENTS ============
    
    event ComplianceChecked(
        address indexed user,
        string jurisdiction,
        bool isCompliant,
        uint256 riskScore
    );
    
    event ComplianceConfigUpdated(
        string field,
        uint256 oldValue,
        uint256 newValue
    );
    
    event JurisdictionRulesUpdated(
        string jurisdiction,
        string field,
        bool value
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
    
    modifier validJurisdiction(string memory jurisdiction) {
        require(bytes(jurisdiction).length > 0, "Invalid jurisdiction");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Constructor to initialize the contract
     * @param _kycDataStorage Address of KYCDataStorage contract
     * @param _tenantConfigStorage Address of TenantConfigStorage contract
     * @param _didCredentialStorage Address of DIDCredentialStorage contract
     */
    constructor(
        address _kycDataStorage,
        address _tenantConfigStorage,
        address _didCredentialStorage
    ) {
        require(_kycDataStorage != address(0), "Invalid KYC data storage address");
        require(_tenantConfigStorage != address(0), "Invalid tenant config storage address");
        require(_didCredentialStorage != address(0), "Invalid DID credential storage address");
        
        owner = msg.sender;
        authorizedWriters[owner] = true;
        
        kycDataStorage = KYCDataStorage(_kycDataStorage);
        tenantConfigStorage = TenantConfigStorage(_tenantConfigStorage);
        didCredentialStorage = DIDCredentialStorage(_didCredentialStorage);
        
        // Initialize default configuration
        _initializeDefaultConfig();
        
        // Initialize jurisdiction-specific rules
        _initializeJurisdictionRules();
    }
    
    // ============ INITIALIZATION FUNCTIONS ============
    
    /**
     * @dev Initialize default compliance configuration
     */
    function _initializeDefaultConfig() internal {
        complianceConfig = ComplianceConfig({
            maxRiskScore: 100,
            defaultExpiryDuration: 365 days,
            allowCrossJurisdiction: true,
            requireCredentialVerification: true,
            enableRiskScoring: true
        });
    }
    
    /**
     * @dev Initialize jurisdiction-specific rules
     */
    function _initializeJurisdictionRules() internal {
        // UK Rules
        string[] memory ukRequiredCreds = new string[](3);
        ukRequiredCreds[0] = "Identity";
        ukRequiredCreds[1] = "Address";
        ukRequiredCreds[2] = "KYC";
        
        jurisdictionRules["UK"] = JurisdictionRules({
            maxRiskScore: 50,
            expiryDuration: 365 days,
            requiresAddressVerification: true,
            requiresPhoneVerification: false,
            requiresEmailVerification: true,
            requiredCredentialTypes: ukRequiredCreds,
            isActive: true
        });
        
        // EU Rules
        string[] memory euRequiredCreds = new string[](3);
        euRequiredCreds[0] = "Identity";
        euRequiredCreds[1] = "Address";
        euRequiredCreds[2] = "KYC";
        
        jurisdictionRules["EU"] = JurisdictionRules({
            maxRiskScore: 50,
            expiryDuration: 365 days,
            requiresAddressVerification: true,
            requiresPhoneVerification: false,
            requiresEmailVerification: true,
            requiredCredentialTypes: euRequiredCreds,
            isActive: true
        });
        
        // US Rules
        string[] memory usRequiredCreds = new string[](4);
        usRequiredCreds[0] = "Identity";
        usRequiredCreds[1] = "Address";
        usRequiredCreds[2] = "KYC";
        usRequiredCreds[3] = "AML";
        
        jurisdictionRules["US"] = JurisdictionRules({
            maxRiskScore: 70,
            expiryDuration: 365 days,
            requiresAddressVerification: true,
            requiresPhoneVerification: true,
            requiresEmailVerification: true,
            requiredCredentialTypes: usRequiredCreds,
            isActive: true
        });
        
        // Australia Rules
        string[] memory auRequiredCreds = new string[](3);
        auRequiredCreds[0] = "Identity";
        auRequiredCreds[1] = "Address";
        auRequiredCreds[2] = "KYC";
        
        jurisdictionRules["AU"] = JurisdictionRules({
            maxRiskScore: 60,
            expiryDuration: 365 days,
            requiresAddressVerification: true,
            requiresPhoneVerification: false,
            requiresEmailVerification: true,
            requiredCredentialTypes: auRequiredCreds,
            isActive: true
        });
        
        // South Africa Rules
        string[] memory zaRequiredCreds = new string[](3);
        zaRequiredCreds[0] = "Identity";
        zaRequiredCreds[1] = "Address";
        zaRequiredCreds[2] = "KYC";
        
        jurisdictionRules["ZA"] = JurisdictionRules({
            maxRiskScore: 40,
            expiryDuration: 365 days,
            requiresAddressVerification: true,
            requiresPhoneVerification: false,
            requiresEmailVerification: true,
            requiredCredentialTypes: zaRequiredCreds,
            isActive: true
        });
    }
    
    // ============ CONFIGURATION FUNCTIONS ============
    
    /**
     * @dev Update compliance configuration
     * @param _maxRiskScore New maximum risk score
     * @param _defaultExpiryDuration New default expiry duration
     * @param _allowCrossJurisdiction Whether to allow cross-jurisdiction operations
     * @param _requireCredentialVerification Whether to require credential verification
     * @param _enableRiskScoring Whether to enable risk scoring
     */
    function updateComplianceConfig(
        uint256 _maxRiskScore,
        uint256 _defaultExpiryDuration,
        bool _allowCrossJurisdiction,
        bool _requireCredentialVerification,
        bool _enableRiskScoring
    ) external onlyOwner {
        uint256 oldMaxRisk = complianceConfig.maxRiskScore;
        uint256 oldExpiry = complianceConfig.defaultExpiryDuration;
        
        complianceConfig.maxRiskScore = _maxRiskScore;
        complianceConfig.defaultExpiryDuration = _defaultExpiryDuration;
        complianceConfig.allowCrossJurisdiction = _allowCrossJurisdiction;
        complianceConfig.requireCredentialVerification = _requireCredentialVerification;
        complianceConfig.enableRiskScoring = _enableRiskScoring;
        
        emit ComplianceConfigUpdated("maxRiskScore", oldMaxRisk, _maxRiskScore);
        emit ComplianceConfigUpdated("defaultExpiryDuration", oldExpiry, _defaultExpiryDuration);
    }
    
    /**
     * @dev Update jurisdiction-specific rules
     * @param jurisdiction Jurisdiction to update
     * @param maxRiskScore Maximum risk score for this jurisdiction
     * @param expiryDuration Expiry duration for this jurisdiction
     * @param requiresAddressVerification Whether address verification is required
     * @param requiresPhoneVerification Whether phone verification is required
     * @param requiresEmailVerification Whether email verification is required
     * @param requiredCredentialTypes Required credential types
     * @param isActive Whether jurisdiction is active
     */
    function updateJurisdictionRules(
        string memory jurisdiction,
        uint256 maxRiskScore,
        uint256 expiryDuration,
        bool requiresAddressVerification,
        bool requiresPhoneVerification,
        bool requiresEmailVerification,
        string[] memory requiredCredentialTypes,
        bool isActive
    ) external onlyOwner validJurisdiction(jurisdiction) {
        jurisdictionRules[jurisdiction] = JurisdictionRules({
            maxRiskScore: maxRiskScore,
            expiryDuration: expiryDuration,
            requiresAddressVerification: requiresAddressVerification,
            requiresPhoneVerification: requiresPhoneVerification,
            requiresEmailVerification: requiresEmailVerification,
            requiredCredentialTypes: requiredCredentialTypes,
            isActive: isActive
        });
        
        emit JurisdictionRulesUpdated(jurisdiction, "rules", true);
    }
    
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
    
    // ============ CORE COMPLIANCE FUNCTIONS ============
    
    /**
     * @dev Check compliance for a user
     * @param user Address of the user
     * @param jurisdiction Jurisdiction to check compliance for
     * @param tenantId Tenant ID for tenant-specific rules
     * @return Compliance result
     */
    function checkCompliance(
        address user,
        string memory jurisdiction,
        string memory tenantId
    ) external view validUser(user) validJurisdiction(jurisdiction) returns (ComplianceResult memory) {
        // Initialize result
        ComplianceResult memory result = ComplianceResult({
            isCompliant: true,
            violations: new string[](0),
            riskScore: 0,
            jurisdiction: jurisdiction,
            expiresAt: 0
        });
        
        // Check if jurisdiction is active
        if (!jurisdictionRules[jurisdiction].isActive) {
            result.isCompliant = false;
            result.violations = _addViolation(result.violations, "Jurisdiction not active");
            return result;
        }
        
        // Get KYC data
        KYCDataStorage.KYCData memory kycData = kycDataStorage.getKYCData(user);
        
        // Check if user is verified
        if (!kycData.isVerified) {
            result.isCompliant = false;
            result.violations = _addViolation(result.violations, "User not KYC verified");
            return result;
        }
        
        // Check if KYC is active
        if (!kycData.isActive) {
            result.isCompliant = false;
            result.violations = _addViolation(result.violations, "KYC not active");
            return result;
        }
        
        // Check if KYC is expired
        if (block.timestamp >= kycData.expiresAt) {
            result.isCompliant = false;
            result.violations = _addViolation(result.violations, "KYC expired");
            return result;
        }
        
        // Set risk score and expiry
        result.riskScore = kycData.riskScore;
        result.expiresAt = kycData.expiresAt;
        
        // Check risk score against jurisdiction rules
        if (kycData.riskScore > jurisdictionRules[jurisdiction].maxRiskScore) {
            result.isCompliant = false;
            result.violations = _addViolation(result.violations, "Risk score too high for jurisdiction");
        }
        
        // Check tenant-specific rules if tenant ID is provided
        if (bytes(tenantId).length > 0) {
            if (tenantConfigStorage.isTenantActive(tenantId)) {
                (,, uint256 tenantMaxRiskScore,,,) = tenantConfigStorage.getTenantConfig(tenantId);
                if (kycData.riskScore > tenantMaxRiskScore) {
                    result.isCompliant = false;
                    result.violations = _addViolation(result.violations, "Risk score too high for tenant");
                }
            } else {
                result.isCompliant = false;
                result.violations = _addViolation(result.violations, "Tenant not active");
            }
        }
        
        // Check required credentials if credential verification is enabled
        if (complianceConfig.requireCredentialVerification) {
            string[] memory missingCreds = _checkRequiredCredentials(user, jurisdiction);
            if (missingCreds.length > 0) {
                result.isCompliant = false;
                for (uint256 i = 0; i < missingCreds.length; i++) {
                    result.violations = _addViolation(result.violations, string(abi.encodePacked("Missing credential: ", missingCreds[i])));
                }
            }
        }
        
        return result;
    }
    
    /**
     * @dev Check if a user is compliant for a specific operation
     * @param user Address of the user
     * @param jurisdiction Jurisdiction to check
     * @param tenantId Tenant ID
     * @return Whether the user is compliant
     */
    function isCompliant(
        address user,
        string memory jurisdiction,
        string memory tenantId
    ) external view validUser(user) validJurisdiction(jurisdiction) returns (bool) {
        ComplianceResult memory result = this.checkCompliance(user, jurisdiction, tenantId);
        return result.isCompliant;
    }
    
    /**
     * @dev Get compliance violations for a user
     * @param user Address of the user
     * @param jurisdiction Jurisdiction to check
     * @param tenantId Tenant ID
     * @return Array of violation messages
     */
    function getComplianceViolations(
        address user,
        string memory jurisdiction,
        string memory tenantId
    ) external view validUser(user) validJurisdiction(jurisdiction) returns (string[] memory) {
        ComplianceResult memory result = this.checkCompliance(user, jurisdiction, tenantId);
        return result.violations;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get compliance configuration
     * @return Complete compliance configuration
     */
    function getComplianceConfig() external view returns (ComplianceConfig memory) {
        return complianceConfig;
    }
    
    /**
     * @dev Get jurisdiction rules
     * @param jurisdiction Jurisdiction to query
     * @return Jurisdiction rules
     */
    function getJurisdictionRules(string memory jurisdiction) external view validJurisdiction(jurisdiction) returns (JurisdictionRules memory) {
        return jurisdictionRules[jurisdiction];
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
     * @dev Check required credentials for a user in a jurisdiction
     * @param user Address of the user
     * @param jurisdiction Jurisdiction to check
     * @return Array of missing credential types
     */
    function _checkRequiredCredentials(
        address user,
        string memory jurisdiction
    ) internal view returns (string[] memory) {
        JurisdictionRules memory rules = jurisdictionRules[jurisdiction];
        string[] memory missingCreds = new string[](rules.requiredCredentialTypes.length);
        uint256 missingCount = 0;
        
        // Get user's DID
        string memory did = didCredentialStorage.getDIDForAddress(user);
        if (bytes(did).length == 0) {
            // If no DID, all credentials are missing
            return rules.requiredCredentialTypes;
        }
        
        // Check each required credential type
        for (uint256 i = 0; i < rules.requiredCredentialTypes.length; i++) {
            // Check if user has valid credential of this type
            bool hasValidCred = false;
            DIDCredentialStorage.DIDCredential[] memory credentials = didCredentialStorage.getDIDCredentialsByType(did, rules.requiredCredentialTypes[i]);
            for (uint256 j = 0; j < credentials.length; j++) {
                if (!credentials[j].isRevoked && block.timestamp < credentials[j].expiresAt) {
                    hasValidCred = true;
                    break;
                }
            }
            if (!hasValidCred) {
                missingCreds[missingCount] = rules.requiredCredentialTypes[i];
                missingCount++;
            }
        }
        
        // Resize array to actual missing count
        string[] memory result = new string[](missingCount);
        for (uint256 i = 0; i < missingCount; i++) {
            result[i] = missingCreds[i];
        }
        
        return result;
    }
    
    /**
     * @dev Add a violation to the violations array
     * @param violations Current violations array
     * @param violation New violation to add
     * @return Updated violations array
     */
    function _addViolation(string[] memory violations, string memory violation) internal pure returns (string[] memory) {
        string[] memory newViolations = new string[](violations.length + 1);
        for (uint256 i = 0; i < violations.length; i++) {
            newViolations[i] = violations[i];
        }
        newViolations[violations.length] = violation;
        return newViolations;
    }
}
