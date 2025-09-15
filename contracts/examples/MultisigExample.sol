// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../system/MultisigModifier.sol";

/**
 * @title MultisigExample
 * @dev Example contract showing how to use multisig functionality
 * @notice This demonstrates the multisig system without inheritance conflicts
 * @author Web3 KYC Team
 */
contract MultisigExample is MultisigModifier {
    
    // ============ STATE VARIABLES ============
    
    uint256 public configValue;
    string public configString;
    bool public isActive;
    
    // ============ EVENTS ============
    
    event ConfigValueUpdated(uint256 oldValue, uint256 newValue);
    event ConfigStringUpdated(string oldValue, string newValue);
    event ActiveStatusUpdated(bool oldStatus, bool newStatus);
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Constructor to initialize the contract
     * @param _multisigManager Address of the MultisigManager contract
     */
    constructor(address _multisigManager) MultisigModifier(_multisigManager) {
        configValue = 100;
        configString = "default";
        isActive = true;
    }
    
    // ============ FUNCTIONS WITH MULTISIG ============
    
    /**
     * @dev Update configuration value with multisig support
     * @param newValue New configuration value
     */
    function updateConfigValue(uint256 newValue) external requiresMultisig("updateConfigValue") {
        uint256 oldValue = configValue;
        configValue = newValue;
        emit ConfigValueUpdated(oldValue, newValue);
    }
    
    /**
     * @dev Update configuration string with multisig support
     * @param newString New configuration string
     */
    function updateConfigString(string memory newString) external requiresMultisig("updateConfigString") {
        string memory oldString = configString;
        configString = newString;
        emit ConfigStringUpdated(oldString, newString);
    }
    
    /**
     * @dev Update active status with multisig support
     * @param newStatus New active status
     */
    function updateActiveStatus(bool newStatus) external requiresMultisig("updateActiveStatus") {
        bool oldStatus = isActive;
        isActive = newStatus;
        emit ActiveStatusUpdated(oldStatus, newStatus);
    }
    
    // ============ MULTISIG CONFIGURATION FUNCTIONS ============
    
    /**
     * @dev Enable multisig for configuration value updates
     * @param requiredSignatures Number of signatures required
     * @param timelockDuration Timelock duration in seconds
     */
    function enableMultisigForConfigValue(
        uint256 requiredSignatures,
        uint256 timelockDuration
    ) external onlyOwner {
        require(address(multisigManager) != address(0), "Multisig manager not set");
        multisigManager.enableMultisig("updateConfigValue", requiredSignatures, timelockDuration);
    }
    
    /**
     * @dev Disable multisig for configuration value updates
     */
    function disableMultisigForConfigValue() external onlyOwner {
        require(address(multisigManager) != address(0), "Multisig manager not set");
        multisigManager.disableMultisig("updateConfigValue");
    }
    
    /**
     * @dev Enable multisig for configuration string updates
     * @param requiredSignatures Number of signatures required
     * @param timelockDuration Timelock duration in seconds
     */
    function enableMultisigForConfigString(
        uint256 requiredSignatures,
        uint256 timelockDuration
    ) external onlyOwner {
        require(address(multisigManager) != address(0), "Multisig manager not set");
        multisigManager.enableMultisig("updateConfigString", requiredSignatures, timelockDuration);
    }
    
    /**
     * @dev Disable multisig for configuration string updates
     */
    function disableMultisigForConfigString() external onlyOwner {
        require(address(multisigManager) != address(0), "Multisig manager not set");
        multisigManager.disableMultisig("updateConfigString");
    }
    
    /**
     * @dev Enable multisig for active status updates
     * @param requiredSignatures Number of signatures required
     * @param timelockDuration Timelock duration in seconds
     */
    function enableMultisigForActiveStatus(
        uint256 requiredSignatures,
        uint256 timelockDuration
    ) external onlyOwner {
        require(address(multisigManager) != address(0), "Multisig manager not set");
        multisigManager.enableMultisig("updateActiveStatus", requiredSignatures, timelockDuration);
    }
    
    /**
     * @dev Disable multisig for active status updates
     */
    function disableMultisigForActiveStatus() external onlyOwner {
        require(address(multisigManager) != address(0), "Multisig manager not set");
        multisigManager.disableMultisig("updateActiveStatus");
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Check if configuration value updates require multisig
     * @return Whether multisig is required
     */
    function isConfigValueMultisigRequired() external view returns (bool) {
        return _requiresMultisig("updateConfigValue");
    }
    
    /**
     * @dev Check if configuration string updates require multisig
     * @return Whether multisig is required
     */
    function isConfigStringMultisigRequired() external view returns (bool) {
        return _requiresMultisig("updateConfigString");
    }
    
    /**
     * @dev Check if active status updates require multisig
     * @return Whether multisig is required
     */
    function isActiveStatusMultisigRequired() external view returns (bool) {
        return _requiresMultisig("updateActiveStatus");
    }
    
    /**
     * @dev Get multisig configuration for configuration value updates
     * @return Configuration for configuration value updates
     */
    function getConfigValueMultisigConfig() external view returns (MultisigManager.MultisigConfig memory) {
        return _getMultisigConfig("updateConfigValue");
    }
    
    /**
     * @dev Get multisig configuration for configuration string updates
     * @return Configuration for configuration string updates
     */
    function getConfigStringMultisigConfig() external view returns (MultisigManager.MultisigConfig memory) {
        return _getMultisigConfig("updateConfigString");
    }
    
    /**
     * @dev Get multisig configuration for active status updates
     * @return Configuration for active status updates
     */
    function getActiveStatusMultisigConfig() external view returns (MultisigManager.MultisigConfig memory) {
        return _getMultisigConfig("updateActiveStatus");
    }
    
    // ============ UTILITY FUNCTIONS ============
    
    /**
     * @dev Get current configuration
     * @return value Current configuration value
     * @return stringValue Current configuration string
     * @return active Current active status
     */
    function getConfiguration() external view returns (
        uint256 value,
        string memory stringValue,
        bool active
    ) {
        return (configValue, configString, isActive);
    }
    
    /**
     * @dev Check if multisig manager is set
     * @return Whether multisig manager is configured
     */
    function isMultisigManagerSet() external view returns (bool) {
        return address(multisigManager) != address(0);
    }
}
