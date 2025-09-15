// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./MultisigManager.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../utility/InputValidator.sol";

/**
 * @title EmergencyManager
 * @dev Emergency management contract for critical situations
 * @notice This contract provides emergency override capabilities for the multisig system
 * @author Web3 KYC Team
 */
contract EmergencyManager is ReentrancyGuard {
    
    // ============ STATE VARIABLES ============
    
    MultisigManager public multisigManager;
    address public owner;
    
    // Emergency system state
    bool public emergencySystemEnabled;
    bool public emergencyMode;
    uint256 public emergencyDeclaredAt;
    address public emergencyDeclaredBy;
    string public emergencyReason;
    
    // Emergency contacts
    mapping(address => bool) public emergencyContacts;
    mapping(address => bool) public emergencySigners;
    
    // Emergency actions log
    struct EmergencyAction {
        string action;
        address executor;
        uint256 timestamp;
        string reason;
        bool executed;
    }
    
    mapping(uint256 => EmergencyAction) public emergencyActions;
    uint256 public emergencyActionCounter;
    
    // Allowed functions for emergency override
    mapping(string => bool) public allowedEmergencyFunctions;
    
    // Version tracking
    uint256 public constant VERSION = 1;
    string public constant CONTRACT_NAME = "EmergencyManager";
    
    // ============ EVENTS ============
    
    event EmergencyDeclared(
        address indexed declaredBy,
        string reason,
        uint256 timestamp
    );
    
    event EmergencyResolved(
        address indexed resolvedBy,
        uint256 duration,
        uint256 timestamp
    );
    
    event EmergencyOverrideExecuted(
        string indexed functionName,
        address target,
        address executor,
        bool success,
        uint256 timestamp
    );
    
    event EmergencySignerAdded(
        address indexed signer,
        address addedBy,
        uint256 timestamp
    );
    
    event EmergencySignerRemoved(
        address indexed signer,
        address removedBy,
        uint256 timestamp
    );
    
    event EmergencyContactUpdated(
        address indexed contact,
        bool authorized,
        address updatedBy
    );
    
    event EmergencyActionLogged(
        uint256 indexed actionId,
        string action,
        address executor,
        string reason
    );
    
    event EmergencySystemEnabled(
        address indexed enabledBy,
        uint256 timestamp
    );
    
    event EmergencySystemDisabled(
        address indexed disabledBy,
        uint256 timestamp
    );
    
    // ============ MODIFIERS ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyEmergencyContact() {
        require(emergencyContacts[msg.sender] || msg.sender == owner, "Not emergency contact");
        _;
    }
    
    modifier onlyInEmergency() {
        require(emergencyMode, "Not in emergency mode");
        _;
    }
    
    modifier emergencySystemActive() {
        require(emergencySystemEnabled, "Emergency system disabled");
        _;
    }
    
    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid address");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Constructor to initialize the contract
     * @param _multisigManager Address of the MultisigManager contract
     */
    constructor(address _multisigManager) {
        require(_multisigManager != address(0), "Invalid multisig manager address");
        
        owner = msg.sender;
        multisigManager = MultisigManager(_multisigManager);
        emergencyContacts[owner] = true;
        emergencySystemEnabled = true; // Emergency system enabled by default
        
        // Initialize allowed emergency functions
        _initializeAllowedFunctions();
    }
    
    // ============ INITIALIZATION FUNCTIONS ============
    
    /**
     * @dev Initialize allowed emergency functions
     */
    function _initializeAllowedFunctions() internal {
        // Allow critical system functions for emergency override
        allowedEmergencyFunctions["updateKYCConfig"] = true;
        allowedEmergencyFunctions["updateCredentialConfig"] = true;
        allowedEmergencyFunctions["updateComplianceConfig"] = true;
        allowedEmergencyFunctions["updateAuditConfig"] = true;
        allowedEmergencyFunctions["updateJurisdictionConfig"] = true;
        allowedEmergencyFunctions["updateJurisdictionRules"] = true;
        allowedEmergencyFunctions["setSuperAdmin"] = true;
        allowedEmergencyFunctions["updateRolePermissions"] = true;
        allowedEmergencyFunctions["setAuthorizedWriter"] = true;
        allowedEmergencyFunctions["setAuthorizedIssuer"] = true;
        allowedEmergencyFunctions["registerTenant"] = true;
        allowedEmergencyFunctions["updateTenantConfig"] = true;
        allowedEmergencyFunctions["updateTenantAdmin"] = true;
        allowedEmergencyFunctions["deactivateTenant"] = true;
        allowedEmergencyFunctions["clearUserAuditLogs"] = true;
        allowedEmergencyFunctions["clearOldAuditLogs"] = true;
        allowedEmergencyFunctions["setAllowedCredentialType"] = true;
    }
    
    // ============ EMERGENCY DECLARATION FUNCTIONS ============
    
    /**
     * @dev Declare emergency mode
     * @param reason Reason for emergency declaration
     */
    function declareEmergency(string memory reason) external onlyEmergencyContact emergencySystemActive {
        require(!emergencyMode, "Already in emergency mode");
        require(bytes(reason).length > 0, "Invalid reason");
        
        emergencyMode = true;
        emergencyDeclaredAt = block.timestamp;
        emergencyDeclaredBy = msg.sender;
        emergencyReason = reason;
        
        emit EmergencyDeclared(msg.sender, reason, block.timestamp);
    }
    
    /**
     * @dev Resolve emergency mode
     */
    function resolveEmergency() external onlyEmergencyContact onlyInEmergency emergencySystemActive {
        uint256 duration = block.timestamp - emergencyDeclaredAt;
        
        emergencyMode = false;
        emergencyDeclaredAt = 0;
        emergencyDeclaredBy = address(0);
        emergencyReason = "";
        
        emit EmergencyResolved(msg.sender, duration, block.timestamp);
    }
    
    // ============ EMERGENCY OVERRIDE FUNCTIONS ============
    
    /**
     * @dev Execute emergency override for any function
     * @param functionName Name of the function to override
     * @param target Target contract address
     * @param data Function call data
     * @param reason Reason for emergency override
     */
    function emergencyOverride(
        string memory functionName,
        address target,
        bytes memory data,
        string memory reason
    ) external onlyEmergencyContact onlyInEmergency emergencySystemActive validAddress(target) nonReentrant {
        // Comprehensive input validation
        InputValidator.validateString(functionName, "functionName");
        InputValidator.validateAddressNotSelf(target, "target");
        InputValidator.validateBytes(data, "data");
        InputValidator.validateString(reason, "reason");
        
        // Validate function name against whitelist
        require(_isAllowedFunction(functionName), "Function not allowed in emergency");
        
        // Execute the function call
        (bool success, ) = target.call(data);
        
        // Log the emergency action
        uint256 actionId = ++emergencyActionCounter;
        emergencyActions[actionId] = EmergencyAction({
            action: string(abi.encodePacked("EMERGENCY_OVERRIDE: ", functionName)),
            executor: msg.sender,
            timestamp: block.timestamp,
            reason: reason,
            executed: success
        });
        
        emit EmergencyOverrideExecuted(functionName, target, msg.sender, success, block.timestamp);
        emit EmergencyActionLogged(actionId, string(abi.encodePacked("EMERGENCY_OVERRIDE: ", functionName)), msg.sender, reason);
        
        require(success, "Emergency override failed");
    }
    
    /**
     * @dev Disable all multisig requirements in emergency
     * @param reason Reason for disabling multisig
     */
    function emergencyDisableAllMultisig(string memory reason) external onlyEmergencyContact onlyInEmergency emergencySystemActive {
        require(bytes(reason).length > 0, "Invalid reason");
        
        string[] memory functions = new string[](17);
        functions[0] = "updateKYCConfig";
        functions[1] = "updateCredentialConfig";
        functions[2] = "updateComplianceConfig";
        functions[3] = "updateAuditConfig";
        functions[4] = "updateJurisdictionConfig";
        functions[5] = "updateJurisdictionRules";
        functions[6] = "setSuperAdmin";
        functions[7] = "updateRolePermissions";
        functions[8] = "setAuthorizedWriter";
        functions[9] = "setAuthorizedIssuer";
        functions[10] = "registerTenant";
        functions[11] = "updateTenantConfig";
        functions[12] = "updateTenantAdmin";
        functions[13] = "deactivateTenant";
        functions[14] = "clearUserAuditLogs";
        functions[15] = "clearOldAuditLogs";
        functions[16] = "setAllowedCredentialType";
        
        for (uint256 i = 0; i < functions.length; i++) {
            multisigManager.disableMultisig(functions[i]);
        }
        
        // Log the emergency action
        uint256 actionId = ++emergencyActionCounter;
        emergencyActions[actionId] = EmergencyAction({
            action: "EMERGENCY_DISABLE_ALL_MULTISIG",
            executor: msg.sender,
            timestamp: block.timestamp,
            reason: reason,
            executed: true
        });
        
        emit EmergencyActionLogged(actionId, "EMERGENCY_DISABLE_ALL_MULTISIG", msg.sender, reason);
    }
    
    /**
     * @dev Add emergency signer
     * @param signer Address of the emergency signer
     * @param reason Reason for adding emergency signer
     */
    function addEmergencySigner(address signer, string memory reason) external onlyEmergencyContact onlyInEmergency emergencySystemActive validAddress(signer) {
        require(bytes(reason).length > 0, "Invalid reason");
        
        multisigManager.setAuthorizedSigner(signer, true);
        emergencySigners[signer] = true;
        
        // Log the emergency action
        uint256 actionId = ++emergencyActionCounter;
        emergencyActions[actionId] = EmergencyAction({
            action: string(abi.encodePacked("ADD_EMERGENCY_SIGNER: ", _addressToString(signer))),
            executor: msg.sender,
            timestamp: block.timestamp,
            reason: reason,
            executed: true
        });
        
        emit EmergencySignerAdded(signer, msg.sender, block.timestamp);
        emit EmergencyActionLogged(actionId, string(abi.encodePacked("ADD_EMERGENCY_SIGNER: ", _addressToString(signer))), msg.sender, reason);
    }
    
    /**
     * @dev Remove emergency signer
     * @param signer Address of the emergency signer to remove
     * @param reason Reason for removing emergency signer
     */
    function removeEmergencySigner(address signer, string memory reason) external onlyEmergencyContact onlyInEmergency emergencySystemActive validAddress(signer) {
        require(bytes(reason).length > 0, "Invalid reason");
        
        multisigManager.setAuthorizedSigner(signer, false);
        emergencySigners[signer] = false;
        
        // Log the emergency action
        uint256 actionId = ++emergencyActionCounter;
        emergencyActions[actionId] = EmergencyAction({
            action: string(abi.encodePacked("REMOVE_EMERGENCY_SIGNER: ", _addressToString(signer))),
            executor: msg.sender,
            timestamp: block.timestamp,
            reason: reason,
            executed: true
        });
        
        emit EmergencySignerRemoved(signer, msg.sender, block.timestamp);
        emit EmergencyActionLogged(actionId, string(abi.encodePacked("REMOVE_EMERGENCY_SIGNER: ", _addressToString(signer))), msg.sender, reason);
    }
    
    // ============ EMERGENCY SYSTEM MANAGEMENT ============
    
    /**
     * @dev Enable the emergency system (only owner)
     * @notice This allows emergency procedures to be used
     */
    function enableEmergencySystem() external onlyOwner {
        require(!emergencySystemEnabled, "Emergency system already enabled");
        require(!emergencyMode, "Cannot enable during active emergency");
        
        emergencySystemEnabled = true;
        emit EmergencySystemEnabled(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Disable the emergency system (only owner)
     * @notice This prevents all emergency procedures from being used
     */
    function disableEmergencySystem() external onlyOwner {
        require(emergencySystemEnabled, "Emergency system already disabled");
        require(!emergencyMode, "Cannot disable during active emergency");
        
        emergencySystemEnabled = false;
        emit EmergencySystemDisabled(msg.sender, block.timestamp);
    }
    
    // ============ EMERGENCY CONTACT MANAGEMENT ============
    
    /**
     * @dev Add emergency contact
     * @param contact Address of the emergency contact
     */
    function addEmergencyContact(address contact) external onlyOwner validAddress(contact) {
        emergencyContacts[contact] = true;
        emit EmergencyContactUpdated(contact, true, msg.sender);
    }
    
    /**
     * @dev Remove emergency contact
     * @param contact Address of the emergency contact to remove
     */
    function removeEmergencyContact(address contact) external onlyOwner validAddress(contact) {
        require(contact != owner, "Cannot remove owner");
        emergencyContacts[contact] = false;
        emit EmergencyContactUpdated(contact, false, msg.sender);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get emergency system status
     * @return systemEnabled Whether emergency system is enabled
     * @return isEmergency Whether system is in emergency mode
     * @return declaredAt When emergency was declared
     * @return declaredBy Who declared the emergency
     * @return reason Reason for emergency
     * @return duration How long emergency has been active
     */
    function getEmergencySystemStatus() external view returns (
        bool systemEnabled,
        bool isEmergency,
        uint256 declaredAt,
        address declaredBy,
        string memory reason,
        uint256 duration
    ) {
        return (
            emergencySystemEnabled,
            emergencyMode,
            emergencyDeclaredAt,
            emergencyDeclaredBy,
            emergencyReason,
            emergencyMode ? block.timestamp - emergencyDeclaredAt : 0
        );
    }
    
    /**
     * @dev Get emergency status (backward compatibility)
     * @return isEmergency Whether system is in emergency mode
     * @return declaredAt When emergency was declared
     * @return declaredBy Who declared the emergency
     * @return reason Reason for emergency
     * @return duration How long emergency has been active
     */
    function getEmergencyStatus() external view returns (
        bool isEmergency,
        uint256 declaredAt,
        address declaredBy,
        string memory reason,
        uint256 duration
    ) {
        return (
            emergencyMode,
            emergencyDeclaredAt,
            emergencyDeclaredBy,
            emergencyReason,
            emergencyMode ? block.timestamp - emergencyDeclaredAt : 0
        );
    }
    
    /**
     * @dev Get emergency action details
     * @param actionId ID of the emergency action
     * @return Emergency action details
     */
    function getEmergencyAction(uint256 actionId) external view returns (EmergencyAction memory) {
        return emergencyActions[actionId];
    }
    
    /**
     * @dev Get total number of emergency actions
     * @return Total number of emergency actions
     */
    function getEmergencyActionCount() external view returns (uint256) {
        return emergencyActionCounter;
    }
    
    /**
     * @dev Check if address is emergency contact
     * @param contact Address to check
     * @return Whether address is emergency contact
     */
    function isEmergencyContact(address contact) external view returns (bool) {
        return emergencyContacts[contact] || contact == owner;
    }
    
    /**
     * @dev Check if address is emergency signer
     * @param signer Address to check
     * @return Whether address is emergency signer
     */
    function isEmergencySigner(address signer) external view returns (bool) {
        return emergencySigners[signer];
    }
    
    /**
     * @dev Check if emergency system is enabled
     * @return Whether emergency system is enabled
     */
    function isEmergencySystemEnabled() external view returns (bool) {
        return emergencySystemEnabled;
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Check if a function is allowed for emergency override
     * @param functionName Name of the function to check
     * @return Whether the function is allowed
     */
    function _isAllowedFunction(string memory functionName) internal view returns (bool) {
        return allowedEmergencyFunctions[functionName];
    }
    
    /**
     * @dev Add or remove allowed emergency function
     * @param functionName Name of the function
     * @param allowed Whether to allow this function
     */
    function setAllowedEmergencyFunction(string memory functionName, bool allowed) external onlyOwner {
        // Comprehensive input validation
        InputValidator.validateString(functionName, "functionName");
        
        allowedEmergencyFunctions[functionName] = allowed;
    }
    
    /**
     * @dev Convert address to string
     * @param addr Address to convert
     * @return String representation of address
     */
    function _addressToString(address addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
}
