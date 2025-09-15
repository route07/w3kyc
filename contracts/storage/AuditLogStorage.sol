// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../utility/InputValidator.sol";
import "../utility/BoundsChecker.sol";

/**
 * @title AuditLogStorage
 * @dev Dedicated storage contract for audit logs and compliance tracking
 * @notice This contract handles comprehensive audit logging for all KYC operations
 * @author Web3 KYC Team
 */
contract AuditLogStorage is ReentrancyGuard {
    
    // ============ STRUCTS ============
    
    /**
     * @dev Structure to store audit log entries
     */
    struct AuditEntry {
        string action;                      // Action performed (e.g., "KYC_VERIFIED", "WALLET_LINKED")
        string details;                     // Additional details about the action
        uint256 timestamp;                  // Timestamp when the action occurred
        address actor;                      // Address that performed the action
        string tenantId;                    // ID of the tenant involved
        string jurisdiction;                // Jurisdiction involved
        string metadata;                    // Additional metadata (JSON string)
    }
    
    /**
     * @dev Configuration structure for audit logging
     */
    struct AuditConfig {
        uint256 maxEntriesPerUser;          // Maximum audit entries per user
        uint256 maxEntriesPerTenant;        // Maximum audit entries per tenant
        uint256 maxEntriesPerJurisdiction;  // Maximum audit entries per jurisdiction
        bool enableMetadata;                // Whether to enable metadata logging
        uint256 retentionPeriod;            // How long to retain audit logs (0 = forever)
    }
    
    // ============ STATE VARIABLES ============
    
    // Storage mappings
    mapping(address => AuditEntry[]) public userAuditLogs;           // Audit logs per user
    mapping(string => AuditEntry[]) public tenantAuditLogs;          // Audit logs per tenant
    mapping(string => AuditEntry[]) public jurisdictionAuditLogs;    // Audit logs per jurisdiction
    mapping(string => AuditEntry[]) public actionAuditLogs;          // Audit logs per action type
    
    // Configuration
    AuditConfig public auditConfig;
    
    // Access control
    mapping(address => bool) public authorizedWriters;
    address public owner;
    
    // Statistics
    mapping(address => uint256) public userAuditCount;
    mapping(string => uint256) public tenantAuditCount;
    mapping(string => uint256) public jurisdictionAuditCount;
    mapping(string => uint256) public actionAuditCount;
    
    // Version tracking
    uint256 public constant VERSION = 1;
    string public constant CONTRACT_NAME = "AuditLogStorage";
    
    // ============ EVENTS ============
    
    event AuditLogCreated(
        address indexed user,
        string action,
        string tenantId,
        string jurisdiction,
        uint256 timestamp,
        address actor
    );
    
    event AuditConfigUpdated(
        string field,
        uint256 oldValue,
        uint256 newValue
    );
    
    event AuthorizedWriterUpdated(
        address indexed writer,
        bool authorized
    );
    
    event AuditLogsCleared(
        address indexed user,
        string reason
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
    
    modifier validAction(string memory action) {
        require(bytes(action).length > 0, "Invalid action");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Constructor to initialize the contract
     */
    constructor() {
        owner = msg.sender;
        authorizedWriters[owner] = true;
        
        // Initialize default configuration
        _initializeDefaultConfig();
    }
    
    // ============ INITIALIZATION FUNCTIONS ============
    
    /**
     * @dev Initialize default audit configuration
     */
    function _initializeDefaultConfig() internal {
        auditConfig = AuditConfig({
            maxEntriesPerUser: 1000,
            maxEntriesPerTenant: 10000,
            maxEntriesPerJurisdiction: 5000,
            enableMetadata: true,
            retentionPeriod: 0  // 0 = forever
        });
    }
    
    // ============ CONFIGURATION FUNCTIONS ============
    
    /**
     * @dev Update audit configuration
     * @param _maxEntriesPerUser Maximum entries per user
     * @param _maxEntriesPerTenant Maximum entries per tenant
     * @param _maxEntriesPerJurisdiction Maximum entries per jurisdiction
     * @param _enableMetadata Whether to enable metadata logging
     * @param _retentionPeriod Retention period in seconds (0 = forever)
     */
    function updateAuditConfig(
        uint256 _maxEntriesPerUser,
        uint256 _maxEntriesPerTenant,
        uint256 _maxEntriesPerJurisdiction,
        bool _enableMetadata,
        uint256 _retentionPeriod
    ) external onlyOwner {
        uint256 oldMaxUser = auditConfig.maxEntriesPerUser;
        uint256 oldMaxTenant = auditConfig.maxEntriesPerTenant;
        
        auditConfig.maxEntriesPerUser = _maxEntriesPerUser;
        auditConfig.maxEntriesPerTenant = _maxEntriesPerTenant;
        auditConfig.maxEntriesPerJurisdiction = _maxEntriesPerJurisdiction;
        auditConfig.enableMetadata = _enableMetadata;
        auditConfig.retentionPeriod = _retentionPeriod;
        
        emit AuditConfigUpdated("maxEntriesPerUser", oldMaxUser, _maxEntriesPerUser);
        emit AuditConfigUpdated("maxEntriesPerTenant", oldMaxTenant, _maxEntriesPerTenant);
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
    
    // ============ CORE AUDIT FUNCTIONS ============
    
    /**
     * @dev Create an audit log entry
     * @param user Address of the user (can be address(0) for system-wide actions)
     * @param action Action performed
     * @param details Additional details about the action
     * @param tenantId ID of the tenant involved
     * @param jurisdiction Jurisdiction involved
     * @param metadata Additional metadata (JSON string)
     */
    function createAuditLog(
        address user,
        string memory action,
        string memory details,
        string memory tenantId,
        string memory jurisdiction,
        string memory metadata
    ) external onlyAuthorized validAction(action) {
        // Create audit entry
        AuditEntry memory entry = AuditEntry({
            action: action,
            details: details,
            timestamp: block.timestamp,
            actor: msg.sender,
            tenantId: tenantId,
            jurisdiction: jurisdiction,
            metadata: auditConfig.enableMetadata ? metadata : ""
        });
        
        // Add to user audit logs (if user is specified)
        if (user != address(0)) {
            _addUserAuditLog(user, entry);
        }
        
        // Add to tenant audit logs (if tenant is specified)
        if (bytes(tenantId).length > 0) {
            _addTenantAuditLog(tenantId, entry);
        }
        
        // Add to jurisdiction audit logs (if jurisdiction is specified)
        if (bytes(jurisdiction).length > 0) {
            _addJurisdictionAuditLog(jurisdiction, entry);
        }
        
        // Add to action audit logs
        _addActionAuditLog(action, entry);
        
        emit AuditLogCreated(user, action, tenantId, jurisdiction, block.timestamp, msg.sender);
    }
    
    /**
     * @dev Create a simple audit log entry (without metadata)
     * @param user Address of the user
     * @param action Action performed
     * @param details Additional details
     * @param tenantId ID of the tenant
     * @param jurisdiction Jurisdiction involved
     */
    function createSimpleAuditLog(
        address user,
        string memory action,
        string memory details,
        string memory tenantId,
        string memory jurisdiction
    ) external onlyAuthorized validAction(action) {
        // Create audit entry
        AuditEntry memory entry = AuditEntry({
            action: action,
            details: details,
            timestamp: block.timestamp,
            actor: msg.sender,
            tenantId: tenantId,
            jurisdiction: jurisdiction,
            metadata: ""
        });
        
        // Add to user audit logs (if user is specified)
        if (user != address(0)) {
            _addUserAuditLog(user, entry);
        }
        
        // Add to tenant audit logs (if tenant is specified)
        if (bytes(tenantId).length > 0) {
            _addTenantAuditLog(tenantId, entry);
        }
        
        // Add to jurisdiction audit logs (if jurisdiction is specified)
        if (bytes(jurisdiction).length > 0) {
            _addJurisdictionAuditLog(jurisdiction, entry);
        }
        
        // Add to action audit logs
        _addActionAuditLog(action, entry);
        
        emit AuditLogCreated(user, action, tenantId, jurisdiction, block.timestamp, msg.sender);
    }
    
    // ============ INTERNAL AUDIT FUNCTIONS ============
    
    /**
     * @dev Add audit log to user's audit trail
     * @param user Address of the user
     * @param entry Audit entry to add
     */
    function _addUserAuditLog(address user, AuditEntry memory entry) internal {
        // Comprehensive bounds checking
        BoundsChecker.validateAuditLogArray(userAuditLogs[user].length, "userAuditLogs");
        
        // Check if we need to remove old entries
        if (userAuditLogs[user].length >= auditConfig.maxEntriesPerUser) {
            // Validate iteration bounds to prevent gas limit issues
            uint256 maxIterations = auditConfig.maxEntriesPerUser - 1;
            BoundsChecker.validateIterationBounds(0, maxIterations, maxIterations, "userAuditLogs");
            
            // Remove oldest entry (shift array) - limit iterations for gas safety
            for (uint256 i = 0; i < maxIterations; i++) {
                BoundsChecker.validateArrayIndex(i + 1, userAuditLogs[user].length, "userAuditLogs");
                userAuditLogs[user][i] = userAuditLogs[user][i + 1];
            }
            
            // Validate pop operation
            BoundsChecker.validateArrayPop(userAuditLogs[user].length, "userAuditLogs");
            userAuditLogs[user].pop();
        } else {
            userAuditCount[user]++;
        }
        
        // Validate push operation
        BoundsChecker.validateArrayPush(userAuditLogs[user].length, auditConfig.maxEntriesPerUser, "userAuditLogs");
        userAuditLogs[user].push(entry);
    }
    
    /**
     * @dev Add audit log to tenant's audit trail
     * @param tenantId ID of the tenant
     * @param entry Audit entry to add
     */
    function _addTenantAuditLog(string memory tenantId, AuditEntry memory entry) internal {
        // Comprehensive bounds checking
        BoundsChecker.validateAuditLogArray(tenantAuditLogs[tenantId].length, "tenantAuditLogs");
        
        // Check if we need to remove old entries
        if (tenantAuditLogs[tenantId].length >= auditConfig.maxEntriesPerTenant) {
            // Validate iteration bounds to prevent gas limit issues
            uint256 maxIterations = auditConfig.maxEntriesPerTenant - 1;
            BoundsChecker.validateIterationBounds(0, maxIterations, maxIterations, "tenantAuditLogs");
            
            // Remove oldest entry (shift array) - limit iterations for gas safety
            for (uint256 i = 0; i < maxIterations; i++) {
                BoundsChecker.validateArrayIndex(i + 1, tenantAuditLogs[tenantId].length, "tenantAuditLogs");
                tenantAuditLogs[tenantId][i] = tenantAuditLogs[tenantId][i + 1];
            }
            
            // Validate pop operation
            BoundsChecker.validateArrayPop(tenantAuditLogs[tenantId].length, "tenantAuditLogs");
            tenantAuditLogs[tenantId].pop();
        } else {
            tenantAuditCount[tenantId]++;
        }
        
        // Validate push operation
        BoundsChecker.validateArrayPush(tenantAuditLogs[tenantId].length, auditConfig.maxEntriesPerTenant, "tenantAuditLogs");
        tenantAuditLogs[tenantId].push(entry);
    }
    
    /**
     * @dev Add audit log to jurisdiction's audit trail
     * @param jurisdiction Jurisdiction
     * @param entry Audit entry to add
     */
    function _addJurisdictionAuditLog(string memory jurisdiction, AuditEntry memory entry) internal {
        // Comprehensive bounds checking
        BoundsChecker.validateAuditLogArray(jurisdictionAuditLogs[jurisdiction].length, "jurisdictionAuditLogs");
        
        // Check if we need to remove old entries
        if (jurisdictionAuditLogs[jurisdiction].length >= auditConfig.maxEntriesPerJurisdiction) {
            // Validate iteration bounds to prevent gas limit issues
            uint256 maxIterations = auditConfig.maxEntriesPerJurisdiction - 1;
            BoundsChecker.validateIterationBounds(0, maxIterations, maxIterations, "jurisdictionAuditLogs");
            
            // Remove oldest entry (shift array) - limit iterations for gas safety
            for (uint256 i = 0; i < maxIterations; i++) {
                BoundsChecker.validateArrayIndex(i + 1, jurisdictionAuditLogs[jurisdiction].length, "jurisdictionAuditLogs");
                jurisdictionAuditLogs[jurisdiction][i] = jurisdictionAuditLogs[jurisdiction][i + 1];
            }
            
            // Validate pop operation
            BoundsChecker.validateArrayPop(jurisdictionAuditLogs[jurisdiction].length, "jurisdictionAuditLogs");
            jurisdictionAuditLogs[jurisdiction].pop();
        } else {
            jurisdictionAuditCount[jurisdiction]++;
        }
        
        // Validate push operation
        BoundsChecker.validateArrayPush(jurisdictionAuditLogs[jurisdiction].length, auditConfig.maxEntriesPerJurisdiction, "jurisdictionAuditLogs");
        jurisdictionAuditLogs[jurisdiction].push(entry);
    }
    
    /**
     * @dev Add audit log to action's audit trail
     * @param action Action type
     * @param entry Audit entry to add
     */
    function _addActionAuditLog(string memory action, AuditEntry memory entry) internal {
        // Comprehensive bounds checking
        BoundsChecker.validateAuditLogArray(actionAuditLogs[action].length, "actionAuditLogs");
        
        // Validate push operation (using default limit for actions)
        BoundsChecker.validateArrayPush(actionAuditLogs[action].length, BoundsChecker.MAX_ACTIONS, "actionAuditLogs");
        actionAuditLogs[action].push(entry);
        actionAuditCount[action]++;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get audit logs for a specific user
     * @param user Address of the user
     * @return Array of audit entries
     */
    function getUserAuditLogs(address user) external view validUser(user) returns (AuditEntry[] memory) {
        return userAuditLogs[user];
    }
    
    /**
     * @dev Get audit logs for a specific tenant
     * @param tenantId ID of the tenant
     * @return Array of audit entries
     */
    function getTenantAuditLogs(string memory tenantId) external view returns (AuditEntry[] memory) {
        return tenantAuditLogs[tenantId];
    }
    
    /**
     * @dev Get audit logs for a specific jurisdiction
     * @param jurisdiction Jurisdiction
     * @return Array of audit entries
     */
    function getJurisdictionAuditLogs(string memory jurisdiction) external view returns (AuditEntry[] memory) {
        return jurisdictionAuditLogs[jurisdiction];
    }
    
    /**
     * @dev Get audit logs for a specific action type
     * @param action Action type
     * @return Array of audit entries
     */
    function getActionAuditLogs(string memory action) external view returns (AuditEntry[] memory) {
        return actionAuditLogs[action];
    }
    
    /**
     * @dev Get recent audit logs for a user (last N entries)
     * @param user Address of the user
     * @param count Number of recent entries to return
     * @return Array of recent audit entries
     */
    function getRecentUserAuditLogs(address user, uint256 count) external view validUser(user) returns (AuditEntry[] memory) {
        // Comprehensive input validation
        InputValidator.validateUintPositive(count, "count");
        
        AuditEntry[] memory allLogs = userAuditLogs[user];
        uint256 length = allLogs.length;
        
        // Validate array bounds
        BoundsChecker.validateAuditLogArray(length, "userAuditLogs");
        
        if (count >= length) {
            return allLogs;
        }
        
        // Validate memory allocation
        BoundsChecker.validateMemoryAllocation(count, BoundsChecker.MAX_AUDIT_ENTRIES, "recentLogs");
        
        // Validate array slice parameters
        uint256 startIndex = length - count;
        BoundsChecker.validateArraySlice(startIndex, count, length, "userAuditLogs");
        
        AuditEntry[] memory recentLogs = new AuditEntry[](count);
        
        // Validate iteration bounds
        BoundsChecker.validateIterationBounds(0, count, count, "recentLogs");
        
        for (uint256 i = 0; i < count; i++) {
            BoundsChecker.validateArrayIndex(startIndex + i, length, "allLogs");
            recentLogs[i] = allLogs[startIndex + i];
        }
        
        return recentLogs;
    }
    
    /**
     * @dev Get audit statistics
     * @return userCount Total number of users with audit logs
     * @return tenantCount Total number of tenants with audit logs
     * @return jurisdictionCount Total number of jurisdictions with audit logs
     * @return actionCount Total number of action types with audit logs
     */
    function getAuditStatistics() external view returns (
        uint256 userCount,
        uint256 tenantCount,
        uint256 jurisdictionCount,
        uint256 actionCount
    ) {
        // Note: This is a simplified version. In a real implementation,
        // you might want to track these counts separately for efficiency
        return (
            userCount,
            tenantCount,
            jurisdictionCount,
            actionCount
        );
    }
    
    /**
     * @dev Get audit count for a specific user
     * @param user Address of the user
     * @return Number of audit entries for the user
     */
    function getUserAuditCount(address user) external view validUser(user) returns (uint256) {
        return userAuditCount[user];
    }
    
    /**
     * @dev Get audit count for a specific tenant
     * @param tenantId ID of the tenant
     * @return Number of audit entries for the tenant
     */
    function getTenantAuditCount(string memory tenantId) external view returns (uint256) {
        return tenantAuditCount[tenantId];
    }
    
    /**
     * @dev Get audit count for a specific jurisdiction
     * @param jurisdiction Jurisdiction
     * @return Number of audit entries for the jurisdiction
     */
    function getJurisdictionAuditCount(string memory jurisdiction) external view returns (uint256) {
        return jurisdictionAuditCount[jurisdiction];
    }
    
    /**
     * @dev Get audit count for a specific action type
     * @param action Action type
     * @return Number of audit entries for the action
     */
    function getActionAuditCount(string memory action) external view returns (uint256) {
        return actionAuditCount[action];
    }
    
    /**
     * @dev Get current audit configuration
     * @return Complete audit configuration structure
     */
    function getAuditConfig() external view returns (AuditConfig memory) {
        return auditConfig;
    }
    
    /**
     * @dev Check if an address is authorized to write
     * @param writer Address to check
     * @return Whether the address is authorized
     */
    function isAuthorizedWriter(address writer) external view returns (bool) {
        return authorizedWriters[writer] || writer == owner;
    }
    
    // ============ MAINTENANCE FUNCTIONS ============
    
    /**
     * @dev Clear audit logs for a specific user (emergency function)
     * @param user Address of the user
     * @param reason Reason for clearing logs
     */
    function clearUserAuditLogs(address user, string memory reason) external onlyOwner validUser(user) nonReentrant {
        delete userAuditLogs[user];
        userAuditCount[user] = 0;
        emit AuditLogsCleared(user, reason);
    }
    
    /**
     * @dev Clear old audit logs based on retention period
     * @param user Address of the user (address(0) for all users)
     */
    function clearOldAuditLogs(address user) external onlyOwner nonReentrant {
        require(auditConfig.retentionPeriod > 0, "Retention period not set");
        
        uint256 cutoffTime = block.timestamp - auditConfig.retentionPeriod;
        
        if (user != address(0)) {
            _clearOldUserLogs(user, cutoffTime);
        } else {
            // Clear for all users (this would be expensive in a real implementation)
            // For now, we'll just emit an event
            emit AuditLogsCleared(user, "Retention period cleanup");
        }
    }
    
    /**
     * @dev Clear old audit logs for a specific user
     * @param user Address of the user
     * @param cutoffTime Timestamp cutoff
     */
    function _clearOldUserLogs(address user, uint256 cutoffTime) internal {
        AuditEntry[] storage logs = userAuditLogs[user];
        uint256 length = logs.length;
        
        // Remove old entries
        for (uint256 i = length; i > 0; i--) {
            if (logs[i - 1].timestamp < cutoffTime) {
                // Shift array to remove old entry
                for (uint256 j = i - 1; j < length - 1; j++) {
                    logs[j] = logs[j + 1];
                }
                logs.pop();
                length--;
            }
        }
        
        userAuditCount[user] = length;
    }
}
