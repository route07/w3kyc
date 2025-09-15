// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./InputValidator.sol";

/**
 * @title JurisdictionConfig
 * @dev Jurisdiction-specific configuration management
 * @notice This contract manages configuration settings for different jurisdictions (UK, EU, US, AU, ZA)
 * @author Web3 KYC Team
 */
contract JurisdictionConfig is ReentrancyGuard {
    
    // ============ ENUMS ============
    
    enum Jurisdiction {
        UK,     // United Kingdom
        EU,     // European Union
        US,     // United States
        AU,     // Australia
        ZA      // South Africa
    }
    
    enum ComplianceLevel {
        BASIC,      // Basic compliance requirements
        STANDARD,   // Standard compliance requirements
        ENHANCED,   // Enhanced compliance requirements
        STRICT      // Strict compliance requirements
    }
    
    // ============ STRUCTS ============
    
    struct JurisdictionSettings {
        bool isActive;                      // Whether jurisdiction is active
        ComplianceLevel complianceLevel;    // Compliance level required
        uint256 minAge;                     // Minimum age requirement
        uint256 maxAge;                     // Maximum age requirement
        bool requiresBiometric;             // Whether biometric verification is required
        bool requiresAddressProof;          // Whether address proof is required
        bool requiresIncomeProof;           // Whether income proof is required
        uint256 maxTransactionLimit;        // Maximum transaction limit
        uint256 dailyLimit;                 // Daily transaction limit
        uint256 monthlyLimit;               // Monthly transaction limit
        uint256 kycValidityPeriod;          // KYC validity period in days
        string[] requiredDocuments;         // Required document types
        string[] allowedCountries;          // Allowed countries for this jurisdiction
        string description;                 // Description of jurisdiction settings
    }
    
    struct CrossJurisdictionRule {
        bool isActive;                      // Whether rule is active
        Jurisdiction fromJurisdiction;      // Source jurisdiction
        Jurisdiction toJurisdiction;        // Target jurisdiction
        bool requiresReVerification;        // Whether re-verification is required
        uint256 validityPeriod;             // Validity period for cross-jurisdiction
        string description;                 // Description of the rule
    }
    
    // ============ STATE VARIABLES ============
    
    address public owner;
    mapping(address => bool) public authorizedWriters;
    
    // Jurisdiction configurations
    mapping(Jurisdiction => JurisdictionSettings) public jurisdictionSettings;
    mapping(string => CrossJurisdictionRule) public crossJurisdictionRules;
    
    // Supported jurisdictions
    Jurisdiction[] public supportedJurisdictions;
    string[] public crossJurisdictionRuleIds;
    
    // Events
    event JurisdictionSettingsUpdated(Jurisdiction indexed jurisdiction, ComplianceLevel complianceLevel);
    event CrossJurisdictionRuleCreated(string indexed ruleId, Jurisdiction fromJurisdiction, Jurisdiction toJurisdiction);
    event CrossJurisdictionRuleUpdated(string indexed ruleId, bool isActive);
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
    
    modifier validJurisdiction(Jurisdiction jurisdiction) {
        require(uint256(jurisdiction) < 5, "Invalid jurisdiction");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        owner = msg.sender;
        authorizedWriters[owner] = true;
        
        // Initialize supported jurisdictions
        supportedJurisdictions = [
            Jurisdiction.UK,
            Jurisdiction.EU,
            Jurisdiction.US,
            Jurisdiction.AU,
            Jurisdiction.ZA
        ];
        
        // Initialize default jurisdiction settings
        _initializeDefaultSettings();
    }
    
    // ============ JURISDICTION CONFIGURATION ============
    
    /**
     * @dev Update jurisdiction settings
     * @param jurisdiction Jurisdiction to update
     * @param settings New settings for the jurisdiction
     */
    function updateJurisdictionSettings(
        Jurisdiction jurisdiction,
        JurisdictionSettings memory settings
    ) external onlyAuthorizedWriter validJurisdiction(jurisdiction) nonReentrant {
        // Comprehensive input validation
        InputValidator.validateUintRange(settings.minAge, "minAge", 16, 100);
        InputValidator.validateUintRange(settings.maxAge, "maxAge", settings.minAge, 120);
        InputValidator.validateUintPositive(settings.maxTransactionLimit, "maxTransactionLimit");
        InputValidator.validateUintPositive(settings.dailyLimit, "dailyLimit");
        InputValidator.validateUintPositive(settings.monthlyLimit, "monthlyLimit");
        InputValidator.validateUintPositive(settings.kycValidityPeriod, "kycValidityPeriod");
        InputValidator.validateString(settings.description, "description");
        
        // Validate compliance level
        require(uint256(settings.complianceLevel) < 4, "Invalid compliance level");
        
        // Update settings
        jurisdictionSettings[jurisdiction] = settings;
        
        emit JurisdictionSettingsUpdated(jurisdiction, settings.complianceLevel);
    }
    
    /**
     * @dev Get jurisdiction settings
     * @param jurisdiction Jurisdiction to query
     * @return settings Current settings for the jurisdiction
     */
    function getJurisdictionSettings(Jurisdiction jurisdiction) external view validJurisdiction(jurisdiction) returns (JurisdictionSettings memory settings) {
        return jurisdictionSettings[jurisdiction];
    }
    
    /**
     * @dev Check if jurisdiction is active
     * @param jurisdiction Jurisdiction to check
     * @return Whether the jurisdiction is active
     */
    function isJurisdictionActive(Jurisdiction jurisdiction) external view validJurisdiction(jurisdiction) returns (bool) {
        return jurisdictionSettings[jurisdiction].isActive;
    }
    
    /**
     * @dev Get compliance level for jurisdiction
     * @param jurisdiction Jurisdiction to query
     * @return complianceLevel Compliance level required
     */
    function getComplianceLevel(Jurisdiction jurisdiction) external view validJurisdiction(jurisdiction) returns (ComplianceLevel complianceLevel) {
        return jurisdictionSettings[jurisdiction].complianceLevel;
    }
    
    // ============ CROSS-JURISDICTION RULES ============
    
    /**
     * @dev Create cross-jurisdiction rule
     * @param ruleId Unique identifier for the rule
     * @param fromJurisdiction Source jurisdiction
     * @param toJurisdiction Target jurisdiction
     * @param requiresReVerification Whether re-verification is required
     * @param validityPeriod Validity period for cross-jurisdiction
     * @param description Description of the rule
     */
    function createCrossJurisdictionRule(
        string memory ruleId,
        Jurisdiction fromJurisdiction,
        Jurisdiction toJurisdiction,
        bool requiresReVerification,
        uint256 validityPeriod,
        string memory description
    ) external onlyAuthorizedWriter validJurisdiction(fromJurisdiction) validJurisdiction(toJurisdiction) nonReentrant {
        // Comprehensive input validation
        InputValidator.validateString(ruleId, "ruleId");
        InputValidator.validateString(description, "description");
        InputValidator.validateUintPositive(validityPeriod, "validityPeriod");
        
        require(crossJurisdictionRules[ruleId].fromJurisdiction == Jurisdiction.UK && crossJurisdictionRules[ruleId].toJurisdiction == Jurisdiction.UK, "Rule already exists");
        
        crossJurisdictionRules[ruleId] = CrossJurisdictionRule({
            isActive: true,
            fromJurisdiction: fromJurisdiction,
            toJurisdiction: toJurisdiction,
            requiresReVerification: requiresReVerification,
            validityPeriod: validityPeriod,
            description: description
        });
        
        crossJurisdictionRuleIds.push(ruleId);
        
        emit CrossJurisdictionRuleCreated(ruleId, fromJurisdiction, toJurisdiction);
    }
    
    /**
     * @dev Update cross-jurisdiction rule
     * @param ruleId ID of the rule to update
     * @param isActive Whether the rule is active
     */
    function updateCrossJurisdictionRule(
        string memory ruleId,
        bool isActive
    ) external onlyAuthorizedWriter nonReentrant {
        InputValidator.validateString(ruleId, "ruleId");
        
        require(crossJurisdictionRules[ruleId].fromJurisdiction != Jurisdiction.UK || crossJurisdictionRules[ruleId].toJurisdiction != Jurisdiction.UK, "Rule not found");
        
        crossJurisdictionRules[ruleId].isActive = isActive;
        
        emit CrossJurisdictionRuleUpdated(ruleId, isActive);
    }
    
    /**
     * @dev Get cross-jurisdiction rule
     * @param ruleId ID of the rule
     * @return rule Cross-jurisdiction rule details
     */
    function getCrossJurisdictionRule(string memory ruleId) external view returns (CrossJurisdictionRule memory rule) {
        InputValidator.validateString(ruleId, "ruleId");
        
        return crossJurisdictionRules[ruleId];
    }
    
    /**
     * @dev Check cross-jurisdiction compliance
     * @param fromJurisdiction Source jurisdiction
     * @param toJurisdiction Target jurisdiction
     * @return requiresReVerification Whether re-verification is required
     * @return validityPeriod Validity period for cross-jurisdiction
     */
    function checkCrossJurisdictionCompliance(
        Jurisdiction fromJurisdiction,
        Jurisdiction toJurisdiction
    ) external view validJurisdiction(fromJurisdiction) validJurisdiction(toJurisdiction) returns (bool requiresReVerification, uint256 validityPeriod) {
        // Find applicable rule
        for (uint256 i = 0; i < crossJurisdictionRuleIds.length; i++) {
            CrossJurisdictionRule memory rule = crossJurisdictionRules[crossJurisdictionRuleIds[i]];
            
            if (rule.isActive && 
                rule.fromJurisdiction == fromJurisdiction && 
                rule.toJurisdiction == toJurisdiction) {
                return (rule.requiresReVerification, rule.validityPeriod);
            }
        }
        
        // Default: no cross-jurisdiction rules
        return (false, 0);
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
     * @dev Get all supported jurisdictions
     * @return jurisdictions Array of supported jurisdictions
     */
    function getSupportedJurisdictions() external view returns (Jurisdiction[] memory jurisdictions) {
        return supportedJurisdictions;
    }
    
    /**
     * @dev Get all cross-jurisdiction rule IDs
     * @return ruleIds Array of rule IDs
     */
    function getCrossJurisdictionRuleIds() external view returns (string[] memory ruleIds) {
        return crossJurisdictionRuleIds;
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
     * @dev Initialize default jurisdiction settings
     */
    function _initializeDefaultSettings() internal {
        // UK Settings
        jurisdictionSettings[Jurisdiction.UK] = JurisdictionSettings({
            isActive: true,
            complianceLevel: ComplianceLevel.STANDARD,
            minAge: 18,
            maxAge: 100,
            requiresBiometric: false,
            requiresAddressProof: true,
            requiresIncomeProof: false,
            maxTransactionLimit: 1000000 * 10**18, // 1M GBP
            dailyLimit: 10000 * 10**18, // 10K GBP
            monthlyLimit: 100000 * 10**18, // 100K GBP
            kycValidityPeriod: 365, // 1 year
            requiredDocuments: new string[](2),
            allowedCountries: new string[](1),
            description: "UK KYC requirements under FCA regulations"
        });
        
        // EU Settings
        jurisdictionSettings[Jurisdiction.EU] = JurisdictionSettings({
            isActive: true,
            complianceLevel: ComplianceLevel.ENHANCED,
            minAge: 18,
            maxAge: 100,
            requiresBiometric: true,
            requiresAddressProof: true,
            requiresIncomeProof: true,
            maxTransactionLimit: 500000 * 10**18, // 500K EUR
            dailyLimit: 5000 * 10**18, // 5K EUR
            monthlyLimit: 50000 * 10**18, // 50K EUR
            kycValidityPeriod: 730, // 2 years
            requiredDocuments: new string[](3),
            allowedCountries: new string[](27),
            description: "EU KYC requirements under AMLD5 regulations"
        });
        
        // US Settings
        jurisdictionSettings[Jurisdiction.US] = JurisdictionSettings({
            isActive: true,
            complianceLevel: ComplianceLevel.STRICT,
            minAge: 18,
            maxAge: 100,
            requiresBiometric: true,
            requiresAddressProof: true,
            requiresIncomeProof: true,
            maxTransactionLimit: 10000000 * 10**18, // 10M USD
            dailyLimit: 100000 * 10**18, // 100K USD
            monthlyLimit: 1000000 * 10**18, // 1M USD
            kycValidityPeriod: 365, // 1 year
            requiredDocuments: new string[](4),
            allowedCountries: new string[](1),
            description: "US KYC requirements under BSA/AML regulations"
        });
        
        // Australia Settings
        jurisdictionSettings[Jurisdiction.AU] = JurisdictionSettings({
            isActive: true,
            complianceLevel: ComplianceLevel.STANDARD,
            minAge: 18,
            maxAge: 100,
            requiresBiometric: false,
            requiresAddressProof: true,
            requiresIncomeProof: false,
            maxTransactionLimit: 5000000 * 10**18, // 5M AUD
            dailyLimit: 50000 * 10**18, // 50K AUD
            monthlyLimit: 500000 * 10**18, // 500K AUD
            kycValidityPeriod: 365, // 1 year
            requiredDocuments: new string[](2),
            allowedCountries: new string[](1),
            description: "Australia KYC requirements under AUSTRAC regulations"
        });
        
        // South Africa Settings
        jurisdictionSettings[Jurisdiction.ZA] = JurisdictionSettings({
            isActive: true,
            complianceLevel: ComplianceLevel.BASIC,
            minAge: 18,
            maxAge: 100,
            requiresBiometric: false,
            requiresAddressProof: true,
            requiresIncomeProof: false,
            maxTransactionLimit: 1000000 * 10**18, // 1M ZAR
            dailyLimit: 10000 * 10**18, // 10K ZAR
            monthlyLimit: 100000 * 10**18, // 100K ZAR
            kycValidityPeriod: 365, // 1 year
            requiredDocuments: new string[](2),
            allowedCountries: new string[](1),
            description: "South Africa KYC requirements under FIC Act"
        });
    }
}
