# Configurable Values Analysis for KYC Smart Contracts

## 🔧 **Overview**

This document identifies which contract values should be configurable from the start rather than hardcoded, ensuring the KYC system can adapt to changing regulatory requirements, business needs, and market conditions without requiring contract upgrades.

## **Contracts with Hardcoded Values That Should Be Configurable**

### **1. KYCDataStorage.sol - HIGH PRIORITY**

**Current Hardcoded Values:**
```solidity
expiresAt: block.timestamp + 365 days  // Line in storeKYCData()
```

**Should Be Configurable:**
- **KYC Expiry Duration**: Different jurisdictions may have different requirements
- **Default Risk Thresholds**: May need adjustment based on market conditions
- **Maximum Risk Score**: Should be tenant/jurisdiction specific

### **2. DIDCredentialStorage.sol - HIGH PRIORITY**

**Current Hardcoded Values:**
```solidity
expiresAt: block.timestamp + 365 days  // Line in issueCredential()
```

**Should Be Configurable:**
- **Credential Expiry Duration**: Different credential types may have different lifespans
- **Maximum Attributes**: Limit on credential attributes array
- **Revocation Grace Period**: Time before revocation takes effect

### **3. ComplianceChecker.sol - CRITICAL PRIORITY**

**Current Hardcoded Values:**
```solidity
jurisdictionRiskThresholds["UK"] = 50;
jurisdictionRiskThresholds["EU"] = 50;
jurisdictionRiskThresholds["US"] = 70;
jurisdictionRiskThresholds["AU"] = 60;
jurisdictionRiskThresholds["ZA"] = 40;

jurisdictionExpiryPeriods["UK"] = 365 days;
jurisdictionExpiryPeriods["EU"] = 365 days;
jurisdictionExpiryPeriods["US"] = 365 days;
jurisdictionExpiryPeriods["AU"] = 365 days;
jurisdictionExpiryPeriods["ZA"] = 365 days;
```

**Should Be Configurable:**
- **Risk Thresholds**: Regulatory changes, market conditions
- **Expiry Periods**: Regulatory updates, business requirements
- **Compliance Rules**: New jurisdictions, rule changes

## **Enhanced Configurable Contracts**

### **1. Enhanced KYCDataStorage.sol**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract KYCDataStorage {
    
    struct KYCData {
        bool isVerified;
        string verificationHash;
        uint256 verificationDate;
        uint256 riskScore;
        bool isActive;
        uint256 expiresAt;
        address linkedWallet;
        string jurisdiction;
        string tenantId;
    }
    
    // CONFIGURABLE VALUES
    struct KYCConfig {
        uint256 defaultExpiryDuration;    // Default KYC expiry
        uint256 maxRiskScore;             // Global max risk score
        bool allowMultipleWallets;        // Allow multiple wallet links
        uint256 maxWalletsPerUser;        // Limit wallets per user
        bool requireJurisdictionMatch;    // Strict jurisdiction matching
    }
    
    // Storage mappings
    mapping(address => KYCData) public kycData;
    mapping(address => address[]) public linkedWallets;
    mapping(string => address[]) public tenantUsers;
    
    // CONFIGURABLE STORAGE
    KYCConfig public kycConfig;
    mapping(string => uint256) public jurisdictionExpiryDurations; // Per-jurisdiction expiry
    mapping(string => uint256) public jurisdictionRiskThresholds;  // Per-jurisdiction risk limits
    
    // Access control
    mapping(address => bool) public authorizedWriters;
    address public owner;
    
    // Events
    event KYCConfigUpdated(string field, uint256 oldValue, uint256 newValue);
    event JurisdictionConfigUpdated(string jurisdiction, string field, uint256 value);
    
    modifier onlyAuthorized() {
        require(authorizedWriters[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        
        // Initialize default configuration
        kycConfig = KYCConfig({
            defaultExpiryDuration: 365 days,
            maxRiskScore: 100,
            allowMultipleWallets: true,
            maxWalletsPerUser: 5,
            requireJurisdictionMatch: true
        });
        
        // Initialize jurisdiction-specific settings
        _initializeJurisdictionDefaults();
    }
    
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
    
    // CONFIGURATION FUNCTIONS
    function updateKYCConfig(
        uint256 _defaultExpiryDuration,
        uint256 _maxRiskScore,
        bool _allowMultipleWallets,
        uint256 _maxWalletsPerUser,
        bool _requireJurisdictionMatch
    ) external onlyAuthorized {
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
    
    function updateJurisdictionConfig(
        string memory jurisdiction,
        uint256 expiryDuration,
        uint256 riskThreshold
    ) external onlyAuthorized {
        jurisdictionExpiryDurations[jurisdiction] = expiryDuration;
        jurisdictionRiskThresholds[jurisdiction] = riskThreshold;
        
        emit JurisdictionConfigUpdated(jurisdiction, "expiryDuration", expiryDuration);
        emit JurisdictionConfigUpdated(jurisdiction, "riskThreshold", riskThreshold);
    }
    
    function storeKYCData(
        address user,
        string memory verificationHash,
        uint256 riskScore,
        string memory jurisdiction,
        string memory tenantId
    ) external onlyAuthorized {
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
        
        tenantUsers[tenantId].push(user);
        emit KYCDataStored(user, jurisdiction, tenantId);
    }
    
    function linkWallet(address user, address wallet) external onlyAuthorized {
        require(kycData[user].isVerified, "User not verified");
        
        if (kycConfig.allowMultipleWallets) {
            require(linkedWallets[user].length < kycConfig.maxWalletsPerUser, "Max wallets reached");
            linkedWallets[user].push(wallet);
        } else {
            kycData[user].linkedWallet = wallet;
        }
        
        emit WalletLinked(user, wallet);
    }
    
    // GETTER FUNCTIONS FOR CONFIGURATION
    function getKYCConfig() external view returns (KYCConfig memory) {
        return kycConfig;
    }
    
    function getJurisdictionConfig(string memory jurisdiction) external view returns (
        uint256 expiryDuration,
        uint256 riskThreshold
    ) {
        return (
            jurisdictionExpiryDurations[jurisdiction],
            jurisdictionRiskThresholds[jurisdiction]
        );
    }
}
```

### **2. Enhanced DIDCredentialStorage.sol**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DIDCredentialStorage {
    
    struct DIDCredential {
        string did;
        string credentialType;
        string credentialHash;
        string jurisdiction;
        uint256 issuedAt;
        uint256 expiresAt;
        bool isRevoked;
        string issuer;
        string[] attributes;
    }
    
    // CONFIGURABLE VALUES
    struct CredentialConfig {
        uint256 defaultExpiryDuration;    // Default credential expiry
        uint256 maxAttributesPerCredential; // Limit attributes
        bool allowRevocation;             // Allow credential revocation
        uint256 revocationGracePeriod;    // Time before revocation takes effect
        mapping(string => uint256) credentialTypeExpiry; // Per-type expiry
    }
    
    // Storage mappings
    mapping(string => DIDCredential[]) public didCredentials;
    mapping(address => string) public addressToDID;
    mapping(string => address) public didToAddress;
    mapping(string => bool) public revokedCredentials;
    
    // CONFIGURABLE STORAGE
    CredentialConfig public credentialConfig;
    mapping(string => uint256) public jurisdictionExpiryDurations;
    mapping(string => bool) public allowedCredentialTypes;
    
    // Access control
    mapping(address => bool) public authorizedWriters;
    address public owner;
    
    // Events
    event CredentialConfigUpdated(string field, uint256 oldValue, uint256 newValue);
    event CredentialTypeConfigUpdated(string credentialType, uint256 expiryDuration);
    
    modifier onlyAuthorized() {
        require(authorizedWriters[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        
        // Initialize default configuration
        credentialConfig.defaultExpiryDuration = 365 days;
        credentialConfig.maxAttributesPerCredential = 10;
        credentialConfig.allowRevocation = true;
        credentialConfig.revocationGracePeriod = 1 days;
        
        // Initialize credential type expiry durations
        credentialConfig.credentialTypeExpiry["KYC"] = 365 days;
        credentialConfig.credentialTypeExpiry["RiskScore"] = 30 days;
        credentialConfig.credentialTypeExpiry["Compliance"] = 365 days;
        
        // Initialize allowed credential types
        allowedCredentialTypes["KYC"] = true;
        allowedCredentialTypes["RiskScore"] = true;
        allowedCredentialTypes["Compliance"] = true;
        
        _initializeJurisdictionDefaults();
    }
    
    function _initializeJurisdictionDefaults() internal {
        jurisdictionExpiryDurations["UK"] = 365 days;
        jurisdictionExpiryDurations["EU"] = 365 days;
        jurisdictionExpiryDurations["US"] = 365 days;
        jurisdictionExpiryDurations["AU"] = 365 days;
        jurisdictionExpiryDurations["ZA"] = 365 days;
    }
    
    // CONFIGURATION FUNCTIONS
    function updateCredentialConfig(
        uint256 _defaultExpiryDuration,
        uint256 _maxAttributesPerCredential,
        bool _allowRevocation,
        uint256 _revocationGracePeriod
    ) external onlyAuthorized {
        uint256 oldExpiry = credentialConfig.defaultExpiryDuration;
        uint256 oldMaxAttrs = credentialConfig.maxAttributesPerCredential;
        
        credentialConfig.defaultExpiryDuration = _defaultExpiryDuration;
        credentialConfig.maxAttributesPerCredential = _maxAttributesPerCredential;
        credentialConfig.allowRevocation = _allowRevocation;
        credentialConfig.revocationGracePeriod = _revocationGracePeriod;
        
        emit CredentialConfigUpdated("defaultExpiryDuration", oldExpiry, _defaultExpiryDuration);
        emit CredentialConfigUpdated("maxAttributesPerCredential", oldMaxAttrs, _maxAttributesPerCredential);
    }
    
    function updateCredentialTypeExpiry(
        string memory credentialType,
        uint256 expiryDuration
    ) external onlyAuthorized {
        credentialConfig.credentialTypeExpiry[credentialType] = expiryDuration;
        emit CredentialTypeConfigUpdated(credentialType, expiryDuration);
    }
    
    function addAllowedCredentialType(string memory credentialType) external onlyAuthorized {
        allowedCredentialTypes[credentialType] = true;
    }
    
    function removeAllowedCredentialType(string memory credentialType) external onlyAuthorized {
        allowedCredentialTypes[credentialType] = false;
    }
    
    function issueCredential(
        string memory did,
        string memory credentialType,
        string memory credentialHash,
        string memory jurisdiction,
        string memory issuer,
        string[] memory attributes
    ) external onlyAuthorized {
        require(allowedCredentialTypes[credentialType], "Credential type not allowed");
        require(attributes.length <= credentialConfig.maxAttributesPerCredential, "Too many attributes");
        
        // Determine expiry duration
        uint256 expiryDuration = credentialConfig.credentialTypeExpiry[credentialType];
        if (expiryDuration == 0) {
            expiryDuration = credentialConfig.defaultExpiryDuration;
        }
        
        DIDCredential memory credential = DIDCredential({
            did: did,
            credentialType: credentialType,
            credentialHash: credentialHash,
            jurisdiction: jurisdiction,
            issuedAt: block.timestamp,
            expiresAt: block.timestamp + expiryDuration,
            isRevoked: false,
            issuer: issuer,
            attributes: attributes
        });
        
        didCredentials[did].push(credential);
        emit DIDCredentialIssued(did, credentialType, jurisdiction, issuer);
    }
    
    function revokeCredential(string memory credentialHash) external onlyAuthorized {
        require(credentialConfig.allowRevocation, "Revocation not allowed");
        revokedCredentials[credentialHash] = true;
        emit DIDCredentialRevoked(credentialHash);
    }
    
    // GETTER FUNCTIONS FOR CONFIGURATION
    function getCredentialConfig() external view returns (
        uint256 defaultExpiryDuration,
        uint256 maxAttributesPerCredential,
        bool allowRevocation,
        uint256 revocationGracePeriod
    ) {
        return (
            credentialConfig.defaultExpiryDuration,
            credentialConfig.maxAttributesPerCredential,
            credentialConfig.allowRevocation,
            credentialConfig.revocationGracePeriod
        );
    }
    
    function getCredentialTypeExpiry(string memory credentialType) external view returns (uint256) {
        return credentialConfig.credentialTypeExpiry[credentialType];
    }
}
```

### **3. Enhanced ComplianceChecker.sol**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ComplianceChecker {
    
    // CONFIGURABLE VALUES
    struct ComplianceConfig {
        bool strictJurisdictionMatching;     // Require exact jurisdiction match
        bool allowCrossJurisdiction;         // Allow cross-jurisdiction compliance
        uint256 globalMaxRiskScore;          // Global risk threshold
        bool requireActiveStatus;            // Require active KYC status
        bool checkExpiry;                    // Check KYC expiry
        uint256 gracePeriodAfterExpiry;      // Grace period after expiry
    }
    
    KYCDataStorage public kycStorage;
    TenantConfigStorage public tenantStorage;
    
    // CONFIGURABLE STORAGE
    ComplianceConfig public complianceConfig;
    mapping(string => uint256) public jurisdictionRiskThresholds;
    mapping(string => uint256) public jurisdictionExpiryPeriods;
    mapping(string => bool) public allowedJurisdictions;
    mapping(string => mapping(string => bool)) public crossJurisdictionRules; // from -> to
    
    // Access control
    mapping(address => bool) public authorizedWriters;
    address public owner;
    
    // Events
    event ComplianceConfigUpdated(string field, bool oldValue, bool newValue);
    event JurisdictionRuleUpdated(string jurisdiction, string field, uint256 value);
    event CrossJurisdictionRuleUpdated(string fromJurisdiction, string toJurisdiction, bool allowed);
    
    modifier onlyAuthorized() {
        require(authorizedWriters[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }
    
    constructor(address _kycStorage, address _tenantStorage) {
        kycStorage = KYCDataStorage(_kycStorage);
        tenantStorage = TenantConfigStorage(_tenantStorage);
        owner = msg.sender;
        
        // Initialize default configuration
        complianceConfig = ComplianceConfig({
            strictJurisdictionMatching: true,
            allowCrossJurisdiction: false,
            globalMaxRiskScore: 100,
            requireActiveStatus: true,
            checkExpiry: true,
            gracePeriodAfterExpiry: 7 days
        });
        
        _initializeJurisdictionDefaults();
    }
    
    function _initializeJurisdictionDefaults() internal {
        // UK Configuration
        jurisdictionRiskThresholds["UK"] = 50;
        jurisdictionExpiryPeriods["UK"] = 365 days;
        allowedJurisdictions["UK"] = true;
        
        // EU Configuration
        jurisdictionRiskThresholds["EU"] = 50;
        jurisdictionExpiryPeriods["EU"] = 365 days;
        allowedJurisdictions["EU"] = true;
        
        // US Configuration
        jurisdictionRiskThresholds["US"] = 70;
        jurisdictionExpiryPeriods["US"] = 365 days;
        allowedJurisdictions["UK"] = true;
        
        // Australia Configuration
        jurisdictionRiskThresholds["AU"] = 60;
        jurisdictionExpiryPeriods["AU"] = 365 days;
        allowedJurisdictions["AU"] = true;
        
        // South Africa Configuration
        jurisdictionRiskThresholds["ZA"] = 40;
        jurisdictionExpiryPeriods["ZA"] = 365 days;
        allowedJurisdictions["ZA"] = true;
        
        // Cross-jurisdiction rules (EU countries can accept each other)
        crossJurisdictionRules["UK"]["EU"] = true;
        crossJurisdictionRules["EU"]["UK"] = true;
    }
    
    // CONFIGURATION FUNCTIONS
    function updateComplianceConfig(
        bool _strictJurisdictionMatching,
        bool _allowCrossJurisdiction,
        uint256 _globalMaxRiskScore,
        bool _requireActiveStatus,
        bool _checkExpiry,
        uint256 _gracePeriodAfterExpiry
    ) external onlyAuthorized {
        bool oldStrict = complianceConfig.strictJurisdictionMatching;
        bool oldCross = complianceConfig.allowCrossJurisdiction;
        
        complianceConfig.strictJurisdictionMatching = _strictJurisdictionMatching;
        complianceConfig.allowCrossJurisdiction = _allowCrossJurisdiction;
        complianceConfig.globalMaxRiskScore = _globalMaxRiskScore;
        complianceConfig.requireActiveStatus = _requireActiveStatus;
        complianceConfig.checkExpiry = _checkExpiry;
        complianceConfig.gracePeriodAfterExpiry = _gracePeriodAfterExpiry;
        
        emit ComplianceConfigUpdated("strictJurisdictionMatching", oldStrict, _strictJurisdictionMatching);
        emit ComplianceConfigUpdated("allowCrossJurisdiction", oldCross, _allowCrossJurisdiction);
    }
    
    function updateJurisdictionRule(
        string memory jurisdiction,
        uint256 riskThreshold,
        uint256 expiryPeriod
    ) external onlyAuthorized {
        uint256 oldRisk = jurisdictionRiskThresholds[jurisdiction];
        uint256 oldExpiry = jurisdictionExpiryPeriods[jurisdiction];
        
        jurisdictionRiskThresholds[jurisdiction] = riskThreshold;
        jurisdictionExpiryPeriods[jurisdiction] = expiryPeriod;
        
        emit JurisdictionRuleUpdated(jurisdiction, "riskThreshold", riskThreshold);
        emit JurisdictionRuleUpdated(jurisdiction, "expiryPeriod", expiryPeriod);
    }
    
    function addAllowedJurisdiction(string memory jurisdiction) external onlyAuthorized {
        allowedJurisdictions[jurisdiction] = true;
    }
    
    function removeAllowedJurisdiction(string memory jurisdiction) external onlyAuthorized {
        allowedJurisdictions[jurisdiction] = false;
    }
    
    function setCrossJurisdictionRule(
        string memory fromJurisdiction,
        string memory toJurisdiction,
        bool allowed
    ) external onlyAuthorized {
        crossJurisdictionRules[fromJurisdiction][toJurisdiction] = allowed;
        emit CrossJurisdictionRuleUpdated(fromJurisdiction, toJurisdiction, allowed);
    }
    
    function checkCompliance(
        address user,
        string memory jurisdiction,
        string memory tenantId
    ) external view returns (bool isCompliant, string memory reason) {
        KYCDataStorage.KYCData memory kycData = kycStorage.getKYCData(user);
        
        // Check if user is verified
        if (!kycData.isVerified) {
            return (false, "User not KYC verified");
        }
        
        // Check if KYC is active (if required)
        if (complianceConfig.requireActiveStatus && !kycData.isActive) {
            return (false, "KYC not active");
        }
        
        // Check if KYC is not expired (if required)
        if (complianceConfig.checkExpiry) {
            uint256 expiryTime = kycData.expiresAt;
            if (complianceConfig.gracePeriodAfterExpiry > 0) {
                expiryTime += complianceConfig.gracePeriodAfterExpiry;
            }
            
            if (block.timestamp >= expiryTime) {
                return (false, "KYC expired");
            }
        }
        
        // Check jurisdiction matching
        if (complianceConfig.strictJurisdictionMatching) {
            if (keccak256(bytes(kycData.jurisdiction)) != keccak256(bytes(jurisdiction))) {
                return (false, "Jurisdiction mismatch");
            }
        } else if (complianceConfig.allowCrossJurisdiction) {
            // Check cross-jurisdiction rules
            if (!crossJurisdictionRules[kycData.jurisdiction][jurisdiction]) {
                return (false, "Cross-jurisdiction not allowed");
            }
        }
        
        // Check risk score
        uint256 maxRisk = jurisdictionRiskThresholds[jurisdiction];
        if (maxRisk == 0) {
            maxRisk = complianceConfig.globalMaxRiskScore;
        }
        
        if (kycData.riskScore > maxRisk) {
            return (false, "Risk score too high");
        }
        
        // Check tenant-specific requirements
        (,, uint256 tenantMaxRisk, string[] memory allowedJurisdictions,,) = 
            tenantStorage.getTenantConfig(tenantId);
        
        if (kycData.riskScore > tenantMaxRisk) {
            return (false, "Exceeds tenant risk threshold");
        }
        
        bool jurisdictionAllowed = false;
        for (uint i = 0; i < allowedJurisdictions.length; i++) {
            if (keccak256(bytes(jurisdiction)) == keccak256(bytes(allowedJurisdictions[i]))) {
                jurisdictionAllowed = true;
                break;
            }
        }
        
        if (!jurisdictionAllowed) {
            return (false, "Jurisdiction not allowed for tenant");
        }
        
        return (true, "Compliant");
    }
    
    // GETTER FUNCTIONS FOR CONFIGURATION
    function getComplianceConfig() external view returns (ComplianceConfig memory) {
        return complianceConfig;
    }
    
    function getJurisdictionConfig(string memory jurisdiction) external view returns (
        uint256 riskThreshold,
        uint256 expiryPeriod,
        bool isAllowed
    ) {
        return (
            jurisdictionRiskThresholds[jurisdiction],
            jurisdictionExpiryPeriods[jurisdiction],
            allowedJurisdictions[jurisdiction]
        );
    }
}
```

## **Summary of Configurable Values**

### **🔴 CRITICAL - Must Be Configurable**
1. **KYC Expiry Durations** - Regulatory changes
2. **Risk Thresholds** - Market conditions, regulatory updates
3. **Jurisdiction Rules** - New jurisdictions, rule changes
4. **Credential Types** - New credential types, business requirements

### **🟡 HIGH PRIORITY - Should Be Configurable**
1. **Maximum Attributes** - Performance optimization
2. **Wallet Limits** - Security policies
3. **Cross-Jurisdiction Rules** - Business partnerships
4. **Grace Periods** - Operational flexibility

### **🟢 MEDIUM PRIORITY - Nice to Have Configurable**
1. **Default Values** - Operational preferences
2. **Feature Flags** - A/B testing, gradual rollouts
3. **Audit Log Retention** - Compliance requirements

## **Configuration Management Strategy**

### **1. Centralized Configuration Contract**
```solidity
contract ConfigurationManager {
    mapping(string => uint256) public globalConfig;
    mapping(string => mapping(string => uint256)) public jurisdictionConfig;
    mapping(string => mapping(string => bool)) public featureFlags;
    
    function updateGlobalConfig(string memory key, uint256 value) external onlyOwner;
    function updateJurisdictionConfig(string memory jurisdiction, string memory key, uint256 value) external onlyOwner;
    function setFeatureFlag(string memory feature, bool enabled) external onlyOwner;
}
```

### **2. Configuration Validation**
- **Range Checks**: Ensure values are within reasonable bounds
- **Dependency Checks**: Validate related configurations
- **Timelock**: Require delay for critical configuration changes
- **Multi-signature**: Require multiple approvals for sensitive changes

### **3. Configuration Events**
- **Change Tracking**: Log all configuration changes
- **Rollback Capability**: Ability to revert to previous configurations
- **Audit Trail**: Complete history of configuration changes

## **Implementation Benefits**

### **1. Regulatory Compliance**
- **Adapt to Changes**: Quickly respond to regulatory updates
- **Jurisdiction Support**: Add new jurisdictions without code changes
- **Risk Management**: Adjust risk thresholds based on market conditions

### **2. Business Flexibility**
- **Tenant Customization**: Allow tenants to set their own parameters
- **Feature Rollouts**: Enable/disable features without deployments
- **Operational Control**: Fine-tune system behavior in production

### **3. Cost Efficiency**
- **No Upgrades**: Avoid expensive contract upgrades
- **Gas Optimization**: Optimize gas usage through configuration
- **Maintenance**: Reduce maintenance overhead

### **4. Security**
- **Controlled Changes**: All configuration changes are logged and auditable
- **Access Control**: Only authorized users can modify configurations
- **Validation**: All changes are validated before application

## **Configuration Categories**

### **1. Jurisdiction-Specific Settings**
```solidity
struct JurisdictionConfig {
    uint256 riskThreshold;
    uint256 expiryPeriod;
    bool isAllowed;
    string[] requiredDocuments;
    uint256 maxTransactionAmount;
}
```

### **2. Tenant-Specific Settings**
```solidity
struct TenantConfig {
    uint256 maxRiskScore;
    string[] allowedJurisdictions;
    bool requireAdditionalVerification;
    uint256 customExpiryPeriod;
    string[] customFields;
}
```

### **3. Global System Settings**
```solidity
struct GlobalConfig {
    uint256 defaultExpiryDuration;
    uint256 maxRiskScore;
    bool allowCrossJurisdiction;
    bool requireActiveStatus;
    uint256 gracePeriodAfterExpiry;
}
```

### **4. Feature Flags**
```solidity
struct FeatureFlags {
    bool enableDIDCredentials;
    bool enableCrossJurisdiction;
    bool enableAdvancedRiskScoring;
    bool enableAutomatedCompliance;
    bool enableRealTimeMonitoring;
}
```

## **Configuration Update Process**

### **1. Change Request**
- **Proposal**: Submit configuration change proposal
- **Review**: Technical and business review
- **Approval**: Multi-signature approval for critical changes

### **2. Implementation**
- **Validation**: Validate new configuration values
- **Testing**: Test configuration in staging environment
- **Deployment**: Apply configuration to production

### **3. Monitoring**
- **Audit**: Log all configuration changes
- **Monitoring**: Monitor system behavior after changes
- **Rollback**: Ability to rollback if issues arise

## **Best Practices**

### **1. Configuration Design**
- **Defaults**: Provide sensible default values
- **Validation**: Validate all configuration inputs
- **Documentation**: Document all configuration options
- **Versioning**: Version configuration changes

### **2. Access Control**
- **Roles**: Define clear roles for configuration management
- **Approval**: Require approval for sensitive changes
- **Audit**: Log all configuration access and changes

### **3. Testing**
- **Unit Tests**: Test configuration validation
- **Integration Tests**: Test configuration impact on system
- **Load Tests**: Test system behavior with different configurations

### **4. Monitoring**
- **Metrics**: Monitor system metrics after configuration changes
- **Alerts**: Set up alerts for configuration-related issues
- **Dashboards**: Create dashboards for configuration visibility

---

**Last Updated**: [Current Date]
**Version**: 1.0
**Author**: Development Team
