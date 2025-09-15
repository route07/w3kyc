// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./InputValidator.sol";

/**
 * @title FeatureFlags
 * @dev Runtime feature toggling system for A/B testing and gradual rollouts
 * @notice This contract manages feature flags that can be enabled/disabled at runtime
 * @author Web3 KYC Team
 */
contract FeatureFlags is ReentrancyGuard {
    
    // ============ ENUMS ============
    
    enum FeatureStatus {
        DISABLED,       // Feature is completely disabled
        ENABLED,        // Feature is enabled for all users
        BETA,           // Feature is in beta testing
        GRADUAL_ROLLOUT // Feature is being gradually rolled out
    }
    
    enum FeatureCategory {
        KYC,            // KYC-related features
        CREDENTIALS,    // Credential-related features
        COMPLIANCE,     // Compliance-related features
        SECURITY,       // Security-related features
        UI,             // User interface features
        API,            // API-related features
        ANALYTICS,      // Analytics features
        CUSTOM          // Custom features
    }
    
    // ============ STRUCTS ============
    
    struct FeatureFlag {
        string featureId;           // Unique identifier for the feature
        string name;                // Human-readable name
        string description;         // Description of the feature
        FeatureCategory category;   // Category of the feature
        FeatureStatus status;       // Current status of the feature
        uint256 rolloutPercentage;  // Percentage of users who should see this feature (0-100)
        uint256 startTime;          // When the feature was first enabled
        uint256 endTime;            // When the feature should be disabled (0 = never)
        address createdBy;          // Address that created this feature flag
        string version;             // Version of the feature
        bool requiresAuth;          // Whether feature requires authentication
        string[] dependencies;      // Dependencies on other features
        string metadata;            // Additional metadata
    }
    
    struct FeatureConfig {
        bool allowOverride;         // Whether feature can be overridden
        bool logUsage;              // Whether to log feature usage
        bool trackMetrics;          // Whether to track feature metrics
        uint256 maxUsagePerUser;    // Maximum usage per user (0 = unlimited)
        string[] allowedUsers;      // Specific users allowed to use this feature
        string[] blockedUsers;      // Specific users blocked from using this feature
        string[] allowedTenants;    // Specific tenants allowed to use this feature
        string[] blockedTenants;    // Specific tenants blocked from using this feature
    }
    
    // ============ STATE VARIABLES ============
    
    address public owner;
    mapping(address => bool) public authorizedWriters;
    
    // Feature flag storage
    mapping(string => FeatureFlag) public featureFlags;
    mapping(string => FeatureConfig) public featureConfigs;
    mapping(FeatureCategory => string[]) public featuresByCategory;
    
    // Arrays for iteration
    string[] public allFeatureIds;
    FeatureCategory[] public allCategories;
    
    // Feature usage tracking
    mapping(string => mapping(address => uint256)) public featureUsageCount;
    mapping(string => uint256) public totalFeatureUsage;
    
    // Events
    event FeatureFlagCreated(string indexed featureId, string name, FeatureCategory category);
    event FeatureFlagUpdated(string indexed featureId, FeatureStatus status, uint256 rolloutPercentage);
    event FeatureFlagDeleted(string indexed featureId);
    event FeatureUsageTracked(string indexed featureId, address indexed user, uint256 usageCount);
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
    
    modifier validFeature(string memory featureId) {
        require(featureFlags[featureId].createdBy != address(0), "Feature flag not found");
        _;
    }
    
    modifier validCategory(FeatureCategory category) {
        require(uint256(category) < 8, "Invalid feature category");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        owner = msg.sender;
        authorizedWriters[owner] = true;
        
        // Initialize categories
        allCategories = [
            FeatureCategory.KYC,
            FeatureCategory.CREDENTIALS,
            FeatureCategory.COMPLIANCE,
            FeatureCategory.SECURITY,
            FeatureCategory.UI,
            FeatureCategory.API,
            FeatureCategory.ANALYTICS,
            FeatureCategory.CUSTOM
        ];
        
        // Initialize default feature flags
        _initializeDefaultFeatureFlags();
    }
    
    // ============ FEATURE FLAG MANAGEMENT ============
    
    /**
     * @dev Create a new feature flag
     * @param featureId Unique identifier for the feature
     * @param name Human-readable name
     * @param description Description of the feature
     * @param category Category of the feature
     * @param status Initial status of the feature
     * @param rolloutPercentage Percentage of users who should see this feature
     * @param endTime When the feature should be disabled (0 = never)
     * @param requiresAuth Whether feature requires authentication
     * @param dependencies Array of feature dependencies
     * @param version Version of the feature
     * @param metadata Additional metadata
     */
    function createFeatureFlag(
        string memory featureId,
        string memory name,
        string memory description,
        FeatureCategory category,
        FeatureStatus status,
        uint256 rolloutPercentage,
        uint256 endTime,
        bool requiresAuth,
        string[] memory dependencies,
        string memory version,
        string memory metadata
    ) external onlyAuthorizedWriter validCategory(category) nonReentrant {
        // Comprehensive input validation
        InputValidator.validateString(featureId, "featureId");
        InputValidator.validateString(name, "name");
        InputValidator.validateString(description, "description");
        InputValidator.validateString(version, "version");
        InputValidator.validateString(metadata, "metadata");
        InputValidator.validateUintRange(rolloutPercentage, "rolloutPercentage", 0, 100);
        
        require(featureFlags[featureId].createdBy == address(0), "Feature flag already exists");
        require(uint256(status) < 4, "Invalid feature status");
        
        // Create feature flag
        featureFlags[featureId] = FeatureFlag({
            featureId: featureId,
            name: name,
            description: description,
            category: category,
            status: status,
            rolloutPercentage: rolloutPercentage,
            startTime: block.timestamp,
            endTime: endTime,
            createdBy: msg.sender,
            version: version,
            requiresAuth: requiresAuth,
            dependencies: dependencies,
            metadata: metadata
        });
        
        // Add to category mapping
        featuresByCategory[category].push(featureId);
        
        // Add to all features array
        allFeatureIds.push(featureId);
        
        emit FeatureFlagCreated(featureId, name, category);
    }
    
    /**
     * @dev Update feature flag status and rollout percentage
     * @param featureId ID of the feature flag
     * @param status New status
     * @param rolloutPercentage New rollout percentage
     */
    function updateFeatureFlag(
        string memory featureId,
        FeatureStatus status,
        uint256 rolloutPercentage
    ) external onlyAuthorizedWriter validFeature(featureId) nonReentrant {
        InputValidator.validateString(featureId, "featureId");
        InputValidator.validateUintRange(rolloutPercentage, "rolloutPercentage", 0, 100);
        require(uint256(status) < 4, "Invalid feature status");
        
        featureFlags[featureId].status = status;
        featureFlags[featureId].rolloutPercentage = rolloutPercentage;
        
        emit FeatureFlagUpdated(featureId, status, rolloutPercentage);
    }
    
    /**
     * @dev Update feature flag configuration
     * @param featureId ID of the feature flag
     * @param config New configuration
     */
    function updateFeatureConfig(
        string memory featureId,
        FeatureConfig memory config
    ) external onlyAuthorizedWriter validFeature(featureId) nonReentrant {
        InputValidator.validateString(featureId, "featureId");
        InputValidator.validateUintNonNegative(config.maxUsagePerUser, "maxUsagePerUser");
        
        featureConfigs[featureId] = config;
    }
    
    /**
     * @dev Delete a feature flag
     * @param featureId ID of the feature flag to delete
     */
    function deleteFeatureFlag(string memory featureId) external onlyAuthorizedWriter validFeature(featureId) nonReentrant {
        InputValidator.validateString(featureId, "featureId");
        
        // Remove from category mapping
        FeatureCategory category = featureFlags[featureId].category;
        for (uint256 i = 0; i < featuresByCategory[category].length; i++) {
            if (keccak256(bytes(featuresByCategory[category][i])) == keccak256(bytes(featureId))) {
                featuresByCategory[category][i] = featuresByCategory[category][featuresByCategory[category].length - 1];
                featuresByCategory[category].pop();
                break;
            }
        }
        
        // Remove from all features array
        for (uint256 i = 0; i < allFeatureIds.length; i++) {
            if (keccak256(bytes(allFeatureIds[i])) == keccak256(bytes(featureId))) {
                allFeatureIds[i] = allFeatureIds[allFeatureIds.length - 1];
                allFeatureIds.pop();
                break;
            }
        }
        
        // Delete feature flag
        delete featureFlags[featureId];
        delete featureConfigs[featureId];
        
        emit FeatureFlagDeleted(featureId);
    }
    
    // ============ FEATURE CHECKING ============
    
    /**
     * @dev Check if a feature is enabled for a user
     * @param featureId ID of the feature to check
     * @param user Address of the user
     * @param tenantId ID of the tenant (optional)
     * @return Whether the feature is enabled for the user
     */
    function isFeatureEnabled(
        string memory featureId,
        address user,
        string memory tenantId
    ) external view validFeature(featureId) returns (bool) {
        InputValidator.validateString(featureId, "featureId");
        InputValidator.validateAddress(user, "user");
        
        FeatureFlag memory feature = featureFlags[featureId];
        FeatureConfig memory config = featureConfigs[featureId];
        
        // Check if feature is disabled
        if (feature.status == FeatureStatus.DISABLED) {
            return false;
        }
        
        // Check if feature has expired
        if (feature.endTime > 0 && block.timestamp > feature.endTime) {
            return false;
        }
        
        // Check if user is blocked
        for (uint256 i = 0; i < config.blockedUsers.length; i++) {
            if (keccak256(bytes(config.blockedUsers[i])) == keccak256(bytes(_addressToString(user)))) {
                return false;
            }
        }
        
        // Check if tenant is blocked
        if (bytes(tenantId).length > 0) {
            for (uint256 i = 0; i < config.blockedTenants.length; i++) {
                if (keccak256(bytes(config.blockedTenants[i])) == keccak256(bytes(tenantId))) {
                    return false;
                }
            }
        }
        
        // Check if user is specifically allowed
        for (uint256 i = 0; i < config.allowedUsers.length; i++) {
            if (keccak256(bytes(config.allowedUsers[i])) == keccak256(bytes(_addressToString(user)))) {
                return true;
            }
        }
        
        // Check if tenant is specifically allowed
        if (bytes(tenantId).length > 0) {
            for (uint256 i = 0; i < config.allowedTenants.length; i++) {
                if (keccak256(bytes(config.allowedTenants[i])) == keccak256(bytes(tenantId))) {
                    return true;
                }
            }
        }
        
        // Check rollout percentage
        if (feature.status == FeatureStatus.GRADUAL_ROLLOUT) {
            uint256 userHash = uint256(keccak256(abi.encodePacked(user, featureId)));
            return (userHash % 100) < feature.rolloutPercentage;
        }
        
        // Check if feature is enabled for all users
        return feature.status == FeatureStatus.ENABLED || feature.status == FeatureStatus.BETA;
    }
    
    /**
     * @dev Track feature usage
     * @param featureId ID of the feature being used
     * @param user Address of the user using the feature
     */
    function trackFeatureUsage(string memory featureId, address user) external onlyAuthorizedWriter validFeature(featureId) nonReentrant {
        InputValidator.validateString(featureId, "featureId");
        InputValidator.validateAddress(user, "user");
        
        FeatureConfig memory config = featureConfigs[featureId];
        
        // Check if usage tracking is enabled
        if (!config.trackMetrics) {
            return;
        }
        
        // Check usage limits
        if (config.maxUsagePerUser > 0 && featureUsageCount[featureId][user] >= config.maxUsagePerUser) {
            return;
        }
        
        // Increment usage count
        featureUsageCount[featureId][user]++;
        totalFeatureUsage[featureId]++;
        
        emit FeatureUsageTracked(featureId, user, featureUsageCount[featureId][user]);
    }
    
    // ============ QUERY FUNCTIONS ============
    
    /**
     * @dev Get all feature flags by category
     * @param category Category to query
     * @return featureIds Array of feature IDs
     */
    function getFeaturesByCategory(FeatureCategory category) external view validCategory(category) returns (string[] memory featureIds) {
        return featuresByCategory[category];
    }
    
    /**
     * @dev Get all feature flag IDs
     * @return featureIds Array of all feature IDs
     */
    function getAllFeatureIds() external view returns (string[] memory featureIds) {
        return allFeatureIds;
    }
    
    /**
     * @dev Get feature flag details
     * @param featureId ID of the feature flag
     * @return feature Feature flag details
     */
    function getFeatureFlag(string memory featureId) external view validFeature(featureId) returns (FeatureFlag memory feature) {
        return featureFlags[featureId];
    }
    
    /**
     * @dev Get feature flag configuration
     * @param featureId ID of the feature flag
     * @return config Feature flag configuration
     */
    function getFeatureConfig(string memory featureId) external view validFeature(featureId) returns (FeatureConfig memory config) {
        return featureConfigs[featureId];
    }
    
    /**
     * @dev Get feature usage statistics
     * @param featureId ID of the feature flag
     * @return totalUsage Total usage count
     * @return uniqueUsers Number of unique users
     */
    function getFeatureUsageStats(string memory featureId) external view validFeature(featureId) returns (uint256 totalUsage, uint256 uniqueUsers) {
        totalUsage = totalFeatureUsage[featureId];
        
        // Count unique users (simplified - in production, maintain a separate mapping)
        uniqueUsers = 0; // Placeholder - implement proper unique user counting
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
     * @dev Get all categories
     * @return categories Array of all categories
     */
    function getAllCategories() external view returns (FeatureCategory[] memory categories) {
        return allCategories;
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
     * @dev Initialize default feature flags
     */
    function _initializeDefaultFeatureFlags() internal {
        // Advanced KYC Features
        featureFlags["advanced-kyc"] = FeatureFlag({
            featureId: "advanced-kyc",
            name: "Advanced KYC Features",
            description: "Advanced KYC verification features including biometric verification",
            category: FeatureCategory.KYC,
            status: FeatureStatus.BETA,
            rolloutPercentage: 25,
            startTime: block.timestamp,
            endTime: 0,
            createdBy: owner,
            version: "1.0.0",
            requiresAuth: true,
            dependencies: new string[](0),
            metadata: "Advanced KYC features for enhanced verification"
        });
        
        // Real-time Risk Assessment
        featureFlags["real-time-risk"] = FeatureFlag({
            featureId: "real-time-risk",
            name: "Real-time Risk Assessment",
            description: "Real-time risk assessment using AI/ML algorithms",
            category: FeatureCategory.COMPLIANCE,
            status: FeatureStatus.GRADUAL_ROLLOUT,
            rolloutPercentage: 50,
            startTime: block.timestamp,
            endTime: 0,
            createdBy: owner,
            version: "1.0.0",
            requiresAuth: true,
            dependencies: new string[](1),
            metadata: "Real-time risk assessment features"
        });
        
        // Enhanced Analytics
        featureFlags["enhanced-analytics"] = FeatureFlag({
            featureId: "enhanced-analytics",
            name: "Enhanced Analytics",
            description: "Enhanced analytics and reporting features",
            category: FeatureCategory.ANALYTICS,
            status: FeatureStatus.ENABLED,
            rolloutPercentage: 100,
            startTime: block.timestamp,
            endTime: 0,
            createdBy: owner,
            version: "1.0.0",
            requiresAuth: true,
            dependencies: new string[](0),
            metadata: "Enhanced analytics dashboard"
        });
        
        // Add to arrays
        allFeatureIds.push("advanced-kyc");
        allFeatureIds.push("real-time-risk");
        allFeatureIds.push("enhanced-analytics");
        
        featuresByCategory[FeatureCategory.KYC].push("advanced-kyc");
        featuresByCategory[FeatureCategory.COMPLIANCE].push("real-time-risk");
        featuresByCategory[FeatureCategory.ANALYTICS].push("enhanced-analytics");
    }
    
    /**
     * @dev Convert address to string
     * @param addr Address to convert
     * @return String representation of address
     */
    function _addressToString(address addr) internal pure returns (string memory) {
        return _uintToString(uint256(uint160(addr)));
    }
    
    /**
     * @dev Convert uint to string (simplified)
     * @param value Value to convert
     * @return String representation
     */
    function _uintToString(uint256 value) internal pure returns (string memory) {
        // Simplified implementation to avoid stack too deep
        if (value == 0) return "0";
        if (value == 1) return "1";
        if (value == 2) return "2";
        if (value == 3) return "3";
        if (value == 4) return "4";
        if (value == 5) return "5";
        if (value == 6) return "6";
        if (value == 7) return "7";
        if (value == 8) return "8";
        if (value == 9) return "9";
        return "10+"; // Simplified for values > 9
    }
}
