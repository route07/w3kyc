// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title FeatureFlagsRefactored
 * @dev Refactored feature flags to avoid stack too deep errors
 * @notice Simplified feature toggling system
 * @author Web3 KYC Team
 */
contract FeatureFlagsRefactored is ReentrancyGuard {
    
    // ============ ENUMS ============
    
    enum FeatureStatus {
        DISABLED,
        ENABLED,
        BETA,
        GRADUAL_ROLLOUT
    }
    
    enum FeatureCategory {
        KYC,
        CREDENTIALS,
        COMPLIANCE,
        SECURITY,
        UI,
        API,
        ANALYTICS,
        CUSTOM
    }
    
    // ============ STRUCTS ============
    
    struct FeatureFlag {
        string featureId;
        string name;
        string description;
        FeatureCategory category;
        FeatureStatus status;
        uint256 rolloutPercentage;
        uint256 startTime;
        uint256 endTime;
        address createdBy;
        string version;
        bool requiresAuth;
        string metadata;
    }
    
    // ============ STATE VARIABLES ============
    
    address public owner;
    mapping(address => bool) public authorizedWriters;
    
    // Feature flag storage
    mapping(string => FeatureFlag) public featureFlags;
    mapping(FeatureCategory => string[]) public featuresByCategory;
    
    // Arrays for iteration
    string[] public allFeatureIds;
    
    // Events
    event FeatureFlagCreated(string indexed featureId, string name, FeatureCategory category);
    event FeatureFlagUpdated(string indexed featureId, FeatureStatus status);
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
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        owner = msg.sender;
        authorizedWriters[owner] = true;
        _initializeDefaultFeatures();
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
     * @param version Version of the feature
     * @param requiresAuth Whether feature requires authentication
     * @param metadata Additional metadata
     */
    function createFeatureFlag(
        string memory featureId,
        string memory name,
        string memory description,
        FeatureCategory category,
        FeatureStatus status,
        uint256 rolloutPercentage,
        string memory version,
        bool requiresAuth,
        string memory metadata
    ) external onlyAuthorizedWriter nonReentrant {
        require(featureFlags[featureId].createdBy == address(0), "Feature flag already exists");
        require(bytes(featureId).length > 0, "Invalid feature ID");
        require(bytes(name).length > 0, "Invalid name");
        require(rolloutPercentage <= 100, "Invalid rollout percentage");
        
        featureFlags[featureId] = FeatureFlag({
            featureId: featureId,
            name: name,
            description: description,
            category: category,
            status: status,
            rolloutPercentage: rolloutPercentage,
            startTime: block.timestamp,
            endTime: 0,
            createdBy: msg.sender,
            version: version,
            requiresAuth: requiresAuth,
            metadata: metadata
        });
        
        featuresByCategory[category].push(featureId);
        allFeatureIds.push(featureId);
        
        emit FeatureFlagCreated(featureId, name, category);
    }
    
    /**
     * @dev Update feature flag status
     * @param featureId Feature flag ID to update
     * @param status New status
     */
    function updateFeatureFlagStatus(
        string memory featureId,
        FeatureStatus status
    ) external onlyAuthorizedWriter validFeature(featureId) nonReentrant {
        featureFlags[featureId].status = status;
        emit FeatureFlagUpdated(featureId, status);
    }
    
    /**
     * @dev Update feature flag rollout percentage
     * @param featureId Feature flag ID to update
     * @param rolloutPercentage New rollout percentage
     */
    function updateFeatureFlagRollout(
        string memory featureId,
        uint256 rolloutPercentage
    ) external onlyAuthorizedWriter validFeature(featureId) nonReentrant {
        require(rolloutPercentage <= 100, "Invalid rollout percentage");
        featureFlags[featureId].rolloutPercentage = rolloutPercentage;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get feature flag details
     * @param featureId Feature flag ID
     * @return featureFlag Feature flag details
     */
    function getFeatureFlag(string memory featureId) external view validFeature(featureId) returns (FeatureFlag memory featureFlag) {
        return featureFlags[featureId];
    }
    
    /**
     * @dev Check if feature is enabled
     * @param featureId Feature flag ID
     * @return Whether the feature is enabled
     */
    function isFeatureEnabled(string memory featureId) external view validFeature(featureId) returns (bool) {
        FeatureFlag memory flag = featureFlags[featureId];
        
        if (flag.status == FeatureStatus.DISABLED) return false;
        if (flag.status == FeatureStatus.ENABLED) return true;
        if (flag.endTime > 0 && block.timestamp > flag.endTime) return false;
        
        return true;
    }
    
    /**
     * @dev Get features by category
     * @param category Category to filter by
     * @return featureIds Array of feature IDs
     */
    function getFeaturesByCategory(FeatureCategory category) external view returns (string[] memory featureIds) {
        return featuresByCategory[category];
    }
    
    /**
     * @dev Get all feature IDs
     * @return featureIds Array of all feature IDs
     */
    function getAllFeatureIds() external view returns (string[] memory featureIds) {
        return allFeatureIds;
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
     * @dev Initialize default feature flags
     */
    function _initializeDefaultFeatures() internal {
        // KYC Advanced Features
        _createDefaultFeature(
            "kyc-advanced-verification",
            "Advanced KYC Verification",
            "Enable advanced KYC verification features",
            FeatureCategory.KYC,
            FeatureStatus.ENABLED,
            100,
            "1.0",
            true,
            "Advanced KYC features"
        );
        
        // Batch Operations
        _createDefaultFeature(
            "batch-operations",
            "Batch Operations",
            "Enable batch processing for KYC operations",
            FeatureCategory.KYC,
            FeatureStatus.ENABLED,
            100,
            "1.0",
            true,
            "Batch processing features"
        );
    }
    
    /**
     * @dev Create default feature flag (internal)
     */
    function _createDefaultFeature(
        string memory featureId,
        string memory name,
        string memory description,
        FeatureCategory category,
        FeatureStatus status,
        uint256 rolloutPercentage,
        string memory version,
        bool requiresAuth,
        string memory metadata
    ) internal {
        featureFlags[featureId] = FeatureFlag({
            featureId: featureId,
            name: name,
            description: description,
            category: category,
            status: status,
            rolloutPercentage: rolloutPercentage,
            startTime: block.timestamp,
            endTime: 0,
            createdBy: owner,
            version: version,
            requiresAuth: requiresAuth,
            metadata: metadata
        });
        
        featuresByCategory[category].push(featureId);
        allFeatureIds.push(featureId);
    }
}
