// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title TenantConfigStorage
 * @dev Dedicated storage contract for tenant configurations and settings
 * @notice This contract manages multi-tenant configurations for the KYC system
 * @author Web3 KYC Team
 */
contract TenantConfigStorage is ReentrancyGuard {
    
    // ============ STRUCTS ============
    
    /**
     * @dev Structure to store tenant configuration
     */
    struct TenantConfig {
        string tenantId;                    // Unique tenant identifier
        string name;                        // Human-readable tenant name
        string[] requiredCredentials;       // Required credential types
        uint256 maxRiskScore;               // Maximum allowed risk score
        string[] allowedJurisdictions;      // Allowed jurisdictions
        bool isActive;                      // Whether tenant is active
        uint256 createdAt;                  // Creation timestamp
        address admin;                      // Tenant admin address
        string[] customFields;              // Custom field definitions
        mapping(string => string) settings; // Key-value settings
    }
    
    /**
     * @dev Structure to store tenant statistics
     */
    struct TenantStats {
        uint256 totalUsers;                 // Total number of users
        uint256 activeUsers;                // Number of active users
        uint256 totalVerifications;         // Total verifications performed
        uint256 lastActivity;               // Last activity timestamp
    }
    
    /**
     * @dev Structure to store tenant limits
     */
    struct TenantLimits {
        uint256 maxUsers;                   // Maximum number of users
        uint256 maxVerificationsPerDay;     // Maximum verifications per day
        uint256 maxVerificationsPerMonth;   // Maximum verifications per month
        uint256 maxStorageGB;               // Maximum storage in GB
    }
    
    // ============ STATE VARIABLES ============
    
    // Storage mappings
    mapping(string => TenantConfig) public tenantConfigs;
    mapping(address => string[]) public adminTenants;           // Tenants per admin
    mapping(string => TenantStats) public tenantStats;          // Statistics per tenant
    mapping(string => TenantLimits) public tenantLimits;        // Limits per tenant
    mapping(string => bool) public tenantExists;                // Quick existence check
    
    // Global arrays
    string[] public allTenants;
    string[] public activeTenants;
    
    // Access control
    mapping(address => bool) public authorizedWriters;
    address public owner;
    
    // Version tracking
    uint256 public constant VERSION = 1;
    string public constant CONTRACT_NAME = "TenantConfigStorage";
    
    // ============ EVENTS ============
    
    event TenantRegistered(
        string indexed tenantId,
        string name,
        address admin,
        uint256 maxRiskScore
    );
    
    event TenantConfigUpdated(
        string indexed tenantId,
        string field,
        string value
    );
    
    event TenantDeactivated(
        string indexed tenantId
    );
    
    event TenantReactivated(
        string indexed tenantId
    );
    
    event TenantAdminChanged(
        string indexed tenantId,
        address oldAdmin,
        address newAdmin
    );
    
    event TenantLimitsUpdated(
        string indexed tenantId,
        string field,
        uint256 value
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
    
    modifier validTenant(string memory tenantId) {
        require(bytes(tenantId).length > 0, "Invalid tenant ID");
        require(tenantExists[tenantId], "Tenant does not exist");
        _;
    }
    
    modifier validAdmin(address admin) {
        require(admin != address(0), "Invalid admin address");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Constructor to initialize the contract
     */
    constructor() {
        owner = msg.sender;
        authorizedWriters[owner] = true;
    }
    
    // ============ CONFIGURATION FUNCTIONS ============
    
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
    
    // ============ TENANT MANAGEMENT FUNCTIONS ============
    
    /**
     * @dev Register a new tenant
     * @param tenantId Unique tenant identifier
     * @param name Human-readable tenant name
     * @param requiredCredentials Array of required credential types
     * @param maxRiskScore Maximum allowed risk score
     * @param allowedJurisdictions Array of allowed jurisdictions
     * @param admin Tenant admin address
     * @param customFields Array of custom field definitions
     */
    function registerTenant(
        string memory tenantId,
        string memory name,
        string[] memory requiredCredentials,
        uint256 maxRiskScore,
        string[] memory allowedJurisdictions,
        address admin,
        string[] memory customFields
    ) external onlyAuthorized validAdmin(admin) {
        require(bytes(tenantId).length > 0, "Invalid tenant ID");
        require(bytes(name).length > 0, "Invalid tenant name");
        require(!tenantExists[tenantId], "Tenant already exists");
        require(maxRiskScore <= 100, "Invalid max risk score");
        
        // Create tenant configuration
        TenantConfig storage config = tenantConfigs[tenantId];
        config.tenantId = tenantId;
        config.name = name;
        config.requiredCredentials = requiredCredentials;
        config.maxRiskScore = maxRiskScore;
        config.allowedJurisdictions = allowedJurisdictions;
        config.isActive = true;
        config.createdAt = block.timestamp;
        config.admin = admin;
        config.customFields = customFields;
        
        // Initialize statistics
        tenantStats[tenantId] = TenantStats({
            totalUsers: 0,
            activeUsers: 0,
            totalVerifications: 0,
            lastActivity: block.timestamp
        });
        
        // Initialize default limits
        tenantLimits[tenantId] = TenantLimits({
            maxUsers: 10000,
            maxVerificationsPerDay: 1000,
            maxVerificationsPerMonth: 30000,
            maxStorageGB: 100
        });
        
        // Update mappings
        adminTenants[admin].push(tenantId);
        allTenants.push(tenantId);
        activeTenants.push(tenantId);
        tenantExists[tenantId] = true;
        
        emit TenantRegistered(tenantId, name, admin, maxRiskScore);
    }
    
    /**
     * @dev Update tenant setting
     * @param tenantId ID of the tenant
     * @param key Setting key
     * @param value Setting value
     */
    function updateTenantSetting(
        string memory tenantId,
        string memory key,
        string memory value
    ) external onlyAuthorized validTenant(tenantId) {
        tenantConfigs[tenantId].settings[key] = value;
        emit TenantConfigUpdated(tenantId, key, value);
    }
    
    /**
     * @dev Update tenant configuration
     * @param tenantId ID of the tenant
     * @param name New tenant name
     * @param maxRiskScore New maximum risk score
     * @param allowedJurisdictions New allowed jurisdictions
     */
    function updateTenantConfig(
        string memory tenantId,
        string memory name,
        uint256 maxRiskScore,
        string[] memory allowedJurisdictions
    ) external onlyAuthorized validTenant(tenantId) {
        require(bytes(name).length > 0, "Invalid tenant name");
        require(maxRiskScore <= 100, "Invalid max risk score");
        
        tenantConfigs[tenantId].name = name;
        tenantConfigs[tenantId].maxRiskScore = maxRiskScore;
        tenantConfigs[tenantId].allowedJurisdictions = allowedJurisdictions;
        
        emit TenantConfigUpdated(tenantId, "config", "updated");
    }
    
    /**
     * @dev Update tenant admin
     * @param tenantId ID of the tenant
     * @param newAdmin New admin address
     */
    function updateTenantAdmin(
        string memory tenantId,
        address newAdmin
    ) external onlyAuthorized validTenant(tenantId) validAdmin(newAdmin) {
        address oldAdmin = tenantConfigs[tenantId].admin;
        
        // Remove from old admin's tenant list
        _removeTenantFromAdmin(oldAdmin, tenantId);
        
        // Add to new admin's tenant list
        adminTenants[newAdmin].push(tenantId);
        
        // Update tenant config
        tenantConfigs[tenantId].admin = newAdmin;
        
        emit TenantAdminChanged(tenantId, oldAdmin, newAdmin);
    }
    
    /**
     * @dev Deactivate tenant
     * @param tenantId ID of the tenant
     */
    function deactivateTenant(string memory tenantId) external onlyAuthorized validTenant(tenantId) nonReentrant {
        tenantConfigs[tenantId].isActive = false;
        _removeFromActiveTenants(tenantId);
        emit TenantDeactivated(tenantId);
    }
    
    /**
     * @dev Reactivate tenant
     * @param tenantId ID of the tenant
     */
    function reactivateTenant(string memory tenantId) external onlyAuthorized validTenant(tenantId) nonReentrant {
        tenantConfigs[tenantId].isActive = true;
        activeTenants.push(tenantId);
        emit TenantReactivated(tenantId);
    }
    
    /**
     * @dev Update tenant limits
     * @param tenantId ID of the tenant
     * @param maxUsers Maximum number of users
     * @param maxVerificationsPerDay Maximum verifications per day
     * @param maxVerificationsPerMonth Maximum verifications per month
     * @param maxStorageGB Maximum storage in GB
     */
    function updateTenantLimits(
        string memory tenantId,
        uint256 maxUsers,
        uint256 maxVerificationsPerDay,
        uint256 maxVerificationsPerMonth,
        uint256 maxStorageGB
    ) external onlyAuthorized validTenant(tenantId) {
        tenantLimits[tenantId].maxUsers = maxUsers;
        tenantLimits[tenantId].maxVerificationsPerDay = maxVerificationsPerDay;
        tenantLimits[tenantId].maxVerificationsPerMonth = maxVerificationsPerMonth;
        tenantLimits[tenantId].maxStorageGB = maxStorageGB;
        
        emit TenantLimitsUpdated(tenantId, "limits", 0);
    }
    
    // ============ STATISTICS FUNCTIONS ============
    
    /**
     * @dev Update tenant statistics
     * @param tenantId ID of the tenant
     * @param totalUsers Total number of users
     * @param activeUsers Number of active users
     * @param totalVerifications Total verifications performed
     */
    function updateTenantStats(
        string memory tenantId,
        uint256 totalUsers,
        uint256 activeUsers,
        uint256 totalVerifications
    ) external onlyAuthorized validTenant(tenantId) {
        tenantStats[tenantId].totalUsers = totalUsers;
        tenantStats[tenantId].activeUsers = activeUsers;
        tenantStats[tenantId].totalVerifications = totalVerifications;
        tenantStats[tenantId].lastActivity = block.timestamp;
    }
    
    /**
     * @dev Increment tenant verification count
     * @param tenantId ID of the tenant
     */
    function incrementVerificationCount(string memory tenantId) external onlyAuthorized validTenant(tenantId) nonReentrant {
        tenantStats[tenantId].totalVerifications++;
        tenantStats[tenantId].lastActivity = block.timestamp;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get tenant configuration
     * @param tenantId ID of the tenant
     * @return name Tenant name
     * @return requiredCredentials Required credential types
     * @return maxRiskScore Maximum risk score
     * @return allowedJurisdictions Allowed jurisdictions
     * @return isActive Whether tenant is active
     * @return admin Tenant admin address
     */
    function getTenantConfig(string memory tenantId) external view validTenant(tenantId) returns (
        string memory name,
        string[] memory requiredCredentials,
        uint256 maxRiskScore,
        string[] memory allowedJurisdictions,
        bool isActive,
        address admin
    ) {
        TenantConfig storage config = tenantConfigs[tenantId];
        return (
            config.name,
            config.requiredCredentials,
            config.maxRiskScore,
            config.allowedJurisdictions,
            config.isActive,
            config.admin
        );
    }
    
    /**
     * @dev Get tenant setting
     * @param tenantId ID of the tenant
     * @param key Setting key
     * @return Setting value
     */
    function getTenantSetting(string memory tenantId, string memory key) external view validTenant(tenantId) returns (string memory) {
        return tenantConfigs[tenantId].settings[key];
    }
    
    /**
     * @dev Get tenant statistics
     * @param tenantId ID of the tenant
     * @return Complete tenant statistics
     */
    function getTenantStats(string memory tenantId) external view validTenant(tenantId) returns (TenantStats memory) {
        return tenantStats[tenantId];
    }
    
    /**
     * @dev Get tenant limits
     * @param tenantId ID of the tenant
     * @return Complete tenant limits
     */
    function getTenantLimits(string memory tenantId) external view validTenant(tenantId) returns (TenantLimits memory) {
        return tenantLimits[tenantId];
    }
    
    /**
     * @dev Get all tenants for an admin
     * @param admin Admin address
     * @return Array of tenant IDs
     */
    function getAdminTenants(address admin) external view validAdmin(admin) returns (string[] memory) {
        return adminTenants[admin];
    }
    
    /**
     * @dev Get all tenants
     * @return Array of all tenant IDs
     */
    function getAllTenants() external view returns (string[] memory) {
        return allTenants;
    }
    
    /**
     * @dev Get active tenants
     * @return Array of active tenant IDs
     */
    function getActiveTenants() external view returns (string[] memory) {
        return activeTenants;
    }
    
    /**
     * @dev Check if tenant exists
     * @param tenantId ID of the tenant
     * @return Whether tenant exists
     */
    function isTenantExists(string memory tenantId) external view returns (bool) {
        return tenantExists[tenantId];
    }
    
    /**
     * @dev Check if tenant is active
     * @param tenantId ID of the tenant
     * @return Whether tenant is active
     */
    function isTenantActive(string memory tenantId) external view returns (bool) {
        return tenantExists[tenantId] && tenantConfigs[tenantId].isActive;
    }
    
    /**
     * @dev Get tenant count
     * @return Total number of tenants
     */
    function getTenantCount() external view returns (uint256) {
        return allTenants.length;
    }
    
    /**
     * @dev Get active tenant count
     * @return Number of active tenants
     */
    function getActiveTenantCount() external view returns (uint256) {
        return activeTenants.length;
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
     * @dev Remove tenant from admin's tenant list
     * @param admin Admin address
     * @param tenantId Tenant ID to remove
     */
    function _removeTenantFromAdmin(address admin, string memory tenantId) internal {
        string[] storage tenants = adminTenants[admin];
        for (uint256 i = 0; i < tenants.length; i++) {
            if (keccak256(bytes(tenants[i])) == keccak256(bytes(tenantId))) {
                tenants[i] = tenants[tenants.length - 1];
                tenants.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Remove tenant from active tenants list
     * @param tenantId Tenant ID to remove
     */
    function _removeFromActiveTenants(string memory tenantId) internal {
        for (uint256 i = 0; i < activeTenants.length; i++) {
            if (keccak256(bytes(activeTenants[i])) == keccak256(bytes(tenantId))) {
                activeTenants[i] = activeTenants[activeTenants.length - 1];
                activeTenants.pop();
                break;
            }
        }
    }
}
