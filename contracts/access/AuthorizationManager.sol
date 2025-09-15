// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../storage/AuditLogStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title AuthorizationManager
 * @dev Centralized access control contract for the KYC system
 * @notice This contract manages roles, permissions, and access control across all system components
 * @author Web3 KYC Team
 */
contract AuthorizationManager is ReentrancyGuard {
    
    // ============ ENUMS ============
    
    /**
     * @dev Enumeration of system roles
     */
    enum Role {
        NONE,           // No role assigned
        VERIFIER,       // Can verify KYC documents
        ISSUER,         // Can issue credentials
        ADMIN,          // Can manage tenant configurations
        SUPER_ADMIN     // Can manage system-wide settings
    }
    
    // ============ STRUCTS ============
    
    /**
     * @dev Structure to store user role information
     */
    struct UserRole {
        Role role;                      // User's primary role
        string[] tenantIds;             // Tenants the user has access to
        uint256 assignedAt;             // When the role was assigned
        address assignedBy;             // Who assigned the role
        bool isActive;                  // Whether the role is active
        uint256 expiresAt;              // When the role expires (0 = never)
    }
    
    /**
     * @dev Structure to store role permissions
     */
    struct RolePermissions {
        bool canVerifyKYC;              // Can verify KYC documents
        bool canIssueCredentials;       // Can issue DID credentials
        bool canManageTenants;          // Can manage tenant configurations
        bool canManageUsers;            // Can manage user roles
        bool canViewAuditLogs;          // Can view audit logs
        bool canManageSystem;           // Can manage system settings
        bool canAccessAllTenants;       // Can access all tenants
    }
    
    // ============ STATE VARIABLES ============
    
    // Storage contract references
    AuditLogStorage public auditLogStorage;
    
    // Role management
    mapping(address => UserRole) public userRoles;
    mapping(Role => RolePermissions) public rolePermissions;
    mapping(address => bool) public authorizedWriters;
    
    // Access control
    address public owner;
    mapping(address => bool) public superAdmins;
    
    // Version tracking
    uint256 public constant VERSION = 1;
    string public constant CONTRACT_NAME = "AuthorizationManager";
    
    // ============ EVENTS ============
    
    event RoleAssigned(
        address indexed user,
        Role role,
        string[] tenantIds,
        address assignedBy,
        uint256 expiresAt
    );
    
    event RoleRevoked(
        address indexed user,
        Role role,
        address revokedBy
    );
    
    event RolePermissionsUpdated(
        Role role,
        string field,
        bool value
    );
    
    event SuperAdminUpdated(
        address indexed admin,
        bool isSuperAdmin
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
    
    modifier onlySuperAdmin() {
        require(superAdmins[msg.sender] || msg.sender == owner, "Only super admin");
        _;
    }
    
    modifier onlyAuthorized() {
        require(authorizedWriters[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }
    
    modifier hasRole(Role requiredRole) {
        require(_hasRole(msg.sender, requiredRole), "Insufficient role");
        _;
    }
    
    modifier hasPermission(string memory permission) {
        require(_hasPermission(msg.sender, permission), "Insufficient permission");
        _;
    }
    
    modifier validUser(address user) {
        require(user != address(0), "Invalid user address");
        _;
    }
    
    modifier validRole(Role role) {
        require(role != Role.NONE, "Invalid role");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Constructor to initialize the contract
     * @param _auditLogStorage Address of AuditLogStorage contract
     */
    constructor(address _auditLogStorage) {
        require(_auditLogStorage != address(0), "Invalid audit log storage address");
        
        owner = msg.sender;
        superAdmins[owner] = true;
        authorizedWriters[owner] = true;
        
        auditLogStorage = AuditLogStorage(_auditLogStorage);
        
        // Initialize role permissions
        _initializeRolePermissions();
    }
    
    // ============ INITIALIZATION FUNCTIONS ============
    
    /**
     * @dev Initialize default role permissions
     */
    function _initializeRolePermissions() internal {
        // VERIFIER role permissions
        rolePermissions[Role.VERIFIER] = RolePermissions({
            canVerifyKYC: true,
            canIssueCredentials: false,
            canManageTenants: false,
            canManageUsers: false,
            canViewAuditLogs: true,
            canManageSystem: false,
            canAccessAllTenants: false
        });
        
        // ISSUER role permissions
        rolePermissions[Role.ISSUER] = RolePermissions({
            canVerifyKYC: false,
            canIssueCredentials: true,
            canManageTenants: false,
            canManageUsers: false,
            canViewAuditLogs: true,
            canManageSystem: false,
            canAccessAllTenants: false
        });
        
        // ADMIN role permissions
        rolePermissions[Role.ADMIN] = RolePermissions({
            canVerifyKYC: true,
            canIssueCredentials: true,
            canManageTenants: true,
            canManageUsers: true,
            canViewAuditLogs: true,
            canManageSystem: false,
            canAccessAllTenants: false
        });
        
        // SUPER_ADMIN role permissions
        rolePermissions[Role.SUPER_ADMIN] = RolePermissions({
            canVerifyKYC: true,
            canIssueCredentials: true,
            canManageTenants: true,
            canManageUsers: true,
            canViewAuditLogs: true,
            canManageSystem: true,
            canAccessAllTenants: true
        });
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
    
    /**
     * @dev Set super admin
     * @param admin Address to set as super admin
     * @param isSuperAdminStatus Whether to grant or revoke super admin status
     */
    function setSuperAdmin(address admin, bool isSuperAdminStatus) external onlyOwner nonReentrant {
        require(admin != address(0), "Invalid admin address");
        superAdmins[admin] = isSuperAdminStatus;
        emit SuperAdminUpdated(admin, isSuperAdminStatus);
    }
    
    /**
     * @dev Update role permissions
     * @param role Role to update
     * @param canVerifyKYC Whether role can verify KYC
     * @param canIssueCredentials Whether role can issue credentials
     * @param canManageTenants Whether role can manage tenants
     * @param canManageUsers Whether role can manage users
     * @param canViewAuditLogs Whether role can view audit logs
     * @param canManageSystem Whether role can manage system
     * @param canAccessAllTenants Whether role can access all tenants
     */
    function updateRolePermissions(
        Role role,
        bool canVerifyKYC,
        bool canIssueCredentials,
        bool canManageTenants,
        bool canManageUsers,
        bool canViewAuditLogs,
        bool canManageSystem,
        bool canAccessAllTenants
    ) external onlySuperAdmin validRole(role) {
        rolePermissions[role] = RolePermissions({
            canVerifyKYC: canVerifyKYC,
            canIssueCredentials: canIssueCredentials,
            canManageTenants: canManageTenants,
            canManageUsers: canManageUsers,
            canViewAuditLogs: canViewAuditLogs,
            canManageSystem: canManageSystem,
            canAccessAllTenants: canAccessAllTenants
        });
        
        emit RolePermissionsUpdated(role, "permissions", true);
    }
    
    // ============ ROLE MANAGEMENT FUNCTIONS ============
    
    /**
     * @dev Assign a role to a user
     * @param user Address of the user
     * @param role Role to assign
     * @param tenantIds Array of tenant IDs the user has access to
     * @param expiresAt When the role expires (0 = never)
     */
    function assignRole(
        address user,
        Role role,
        string[] memory tenantIds,
        uint256 expiresAt
    ) external onlyAuthorized validUser(user) validRole(role) {
        require(expiresAt == 0 || expiresAt > block.timestamp, "Invalid expiry time");
        
        // Revoke existing role if any
        if (userRoles[user].role != Role.NONE) {
            _revokeRole(user);
        }
        
        // Assign new role
        userRoles[user] = UserRole({
            role: role,
            tenantIds: tenantIds,
            assignedAt: block.timestamp,
            assignedBy: msg.sender,
            isActive: true,
            expiresAt: expiresAt
        });
        
        // Create audit log
        auditLogStorage.createSimpleAuditLog(
            user,
            "ROLE_ASSIGNED",
            string(abi.encodePacked(
                "Role assigned: ",
                _roleToString(role),
                ", Tenants: ",
                _stringArrayToString(tenantIds),
                ", Expires: ",
                expiresAt == 0 ? "Never" : _uintToString(expiresAt)
            )),
            "",
            ""
        );
        
        emit RoleAssigned(user, role, tenantIds, msg.sender, expiresAt);
    }
    
    /**
     * @dev Revoke a user's role
     * @param user Address of the user
     */
    function revokeRole(address user) external onlyAuthorized validUser(user) nonReentrant {
        require(userRoles[user].role != Role.NONE, "User has no role");
        _revokeRole(user);
    }
    
    /**
     * @dev Internal function to revoke a role
     * @param user Address of the user
     */
    function _revokeRole(address user) internal {
        Role oldRole = userRoles[user].role;
        
        // Create audit log
        auditLogStorage.createSimpleAuditLog(
            user,
            "ROLE_REVOKED",
            string(abi.encodePacked("Role revoked: ", _roleToString(oldRole))),
            "",
            ""
        );
        
        // Clear user role
        delete userRoles[user];
        
        emit RoleRevoked(user, oldRole, msg.sender);
    }
    
    /**
     * @dev Update user's tenant access
     * @param user Address of the user
     * @param tenantIds New array of tenant IDs
     */
    function updateUserTenantAccess(
        address user,
        string[] memory tenantIds
    ) external onlyAuthorized validUser(user) {
        require(userRoles[user].role != Role.NONE, "User has no role");
        require(!_isRoleExpired(user), "User role expired");
        
        userRoles[user].tenantIds = tenantIds;
        
        // Create audit log
        auditLogStorage.createSimpleAuditLog(
            user,
            "TENANT_ACCESS_UPDATED",
            string(abi.encodePacked("Tenant access updated: ", _stringArrayToString(tenantIds))),
            "",
            ""
        );
    }
    
    // ============ ACCESS CONTROL FUNCTIONS ============
    
    /**
     * @dev Check if a user has a specific role
     * @param user Address of the user
     * @param requiredRole Required role
     * @return Whether the user has the required role
     */
    function userHasRole(address user, Role requiredRole) external view validUser(user) returns (bool) {
        return _hasRole(user, requiredRole);
    }
    
    /**
     * @dev Check if a user has access to a specific tenant
     * @param user Address of the user
     * @param tenantId Tenant ID to check
     * @return Whether the user has access to the tenant
     */
    function hasTenantAccess(address user, string memory tenantId) external view validUser(user) returns (bool) {
        if (userRoles[user].role == Role.NONE || !userRoles[user].isActive || _isRoleExpired(user)) {
            return false;
        }
        
        // Super admins and users with access to all tenants
        if (rolePermissions[userRoles[user].role].canAccessAllTenants) {
            return true;
        }
        
        // Check if user has access to specific tenant
        string[] memory userTenants = userRoles[user].tenantIds;
        for (uint256 i = 0; i < userTenants.length; i++) {
            if (keccak256(bytes(userTenants[i])) == keccak256(bytes(tenantId))) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * @dev Check if a user has a specific permission
     * @param user Address of the user
     * @param permission Permission to check
     * @return Whether the user has the permission
     */
    function userHasPermission(address user, string memory permission) external view validUser(user) returns (bool) {
        return _hasPermission(user, permission);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get user's role information
     * @param user Address of the user
     * @return User's role information
     */
    function getUserRole(address user) external view validUser(user) returns (UserRole memory) {
        return userRoles[user];
    }
    
    /**
     * @dev Get role permissions
     * @param role Role to query
     * @return Role permissions
     */
    function getRolePermissions(Role role) external view validRole(role) returns (RolePermissions memory) {
        return rolePermissions[role];
    }
    
    /**
     * @dev Check if a user is a super admin
     * @param user Address of the user
     * @return Whether the user is a super admin
     */
    function isSuperAdmin(address user) external view validUser(user) returns (bool) {
        return superAdmins[user] || user == owner;
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
     * @dev Check if a user has a specific role (internal)
     * @param user Address of the user
     * @param requiredRole Required role
     * @return Whether the user has the required role
     */
    function _hasRole(address user, Role requiredRole) internal view returns (bool) {
        if (userRoles[user].role == Role.NONE || !userRoles[user].isActive || _isRoleExpired(user)) {
            return false;
        }
        
        return userRoles[user].role == requiredRole;
    }
    
    /**
     * @dev Check if a user has a specific permission (internal)
     * @param user Address of the user
     * @param permission Permission to check
     * @return Whether the user has the permission
     */
    function _hasPermission(address user, string memory permission) internal view returns (bool) {
        if (userRoles[user].role == Role.NONE || !userRoles[user].isActive || _isRoleExpired(user)) {
            return false;
        }
        
        RolePermissions memory permissions = rolePermissions[userRoles[user].role];
        
        if (keccak256(bytes(permission)) == keccak256("verifyKYC")) {
            return permissions.canVerifyKYC;
        } else if (keccak256(bytes(permission)) == keccak256("issueCredentials")) {
            return permissions.canIssueCredentials;
        } else if (keccak256(bytes(permission)) == keccak256("manageTenants")) {
            return permissions.canManageTenants;
        } else if (keccak256(bytes(permission)) == keccak256("manageUsers")) {
            return permissions.canManageUsers;
        } else if (keccak256(bytes(permission)) == keccak256("viewAuditLogs")) {
            return permissions.canViewAuditLogs;
        } else if (keccak256(bytes(permission)) == keccak256("manageSystem")) {
            return permissions.canManageSystem;
        }
        
        return false;
    }
    
    /**
     * @dev Check if a user's role is expired
     * @param user Address of the user
     * @return Whether the role is expired
     */
    function _isRoleExpired(address user) internal view returns (bool) {
        return userRoles[user].expiresAt > 0 && block.timestamp >= userRoles[user].expiresAt;
    }
    
    /**
     * @dev Convert role enum to string
     * @param role Role to convert
     * @return String representation of the role
     */
    function _roleToString(Role role) internal pure returns (string memory) {
        if (role == Role.VERIFIER) return "VERIFIER";
        if (role == Role.ISSUER) return "ISSUER";
        if (role == Role.ADMIN) return "ADMIN";
        if (role == Role.SUPER_ADMIN) return "SUPER_ADMIN";
        return "NONE";
    }
    
    /**
     * @dev Convert string array to string
     * @param arr Array to convert
     * @return String representation of the array
     */
    function _stringArrayToString(string[] memory arr) internal pure returns (string memory) {
        if (arr.length == 0) return "[]";
        
        string memory result = "[";
        for (uint256 i = 0; i < arr.length; i++) {
            result = string(abi.encodePacked(result, arr[i]));
            if (i < arr.length - 1) {
                result = string(abi.encodePacked(result, ", "));
            }
        }
        result = string(abi.encodePacked(result, "]"));
        return result;
    }
    
    /**
     * @dev Convert uint256 to string
     * @param value Value to convert
     * @return String representation of the value
     */
    function _uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        
        uint256 temp = value;
        uint256 digits;
        
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }
}
