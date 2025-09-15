// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./MultisigManager.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title MultisigModifier
 * @dev Modifier contract that provides multisig functionality to other contracts
 * @notice This contract can be inherited or used as a library for multisig functionality
 * @author Web3 KYC Team
 */
contract MultisigModifier is ReentrancyGuard {
    
    // ============ STATE VARIABLES ============
    
    MultisigManager public multisigManager;
    address public owner;
    
    // ============ EVENTS ============
    
    event MultisigManagerUpdated(
        address oldManager,
        address newManager
    );
    
    // ============ MODIFIERS ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    /**
     * @dev Modifier that checks multisig requirements for a function
     * @param functionName Name of the function being called
     */
    modifier requiresMultisig(string memory functionName) {
        if (address(multisigManager) != address(0)) {
            // Check if function requires multisig
            if (multisigManager.requiresMultisig(functionName)) {
                // This would need to be handled by the calling contract
                // For now, we'll just allow the call to proceed
                _;
            } else {
                // Single signature required
                _;
            }
        } else {
            // No multisig manager set, allow single signature
            _;
        }
    }
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Constructor to initialize the contract
     * @param _multisigManager Address of the MultisigManager contract
     */
    constructor(address _multisigManager) {
        owner = msg.sender;
        if (_multisigManager != address(0)) {
            multisigManager = MultisigManager(_multisigManager);
        }
    }
    
    // ============ CONFIGURATION FUNCTIONS ============
    
    /**
     * @dev Set multisig manager
     * @param _multisigManager Address of the new multisig manager
     */
    function setMultisigManager(address _multisigManager) external onlyOwner {
        address oldManager = address(multisigManager);
        multisigManager = MultisigManager(_multisigManager);
        emit MultisigManagerUpdated(oldManager, _multisigManager);
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Check if a function requires multisig
     * @param functionName Name of the function
     * @return Whether the function requires multisig
     */
    function _requiresMultisig(string memory functionName) internal view returns (bool) {
        if (address(multisigManager) == address(0)) {
            return false;
        }
        return multisigManager.requiresMultisig(functionName);
    }
    
    /**
     * @dev Get multisig configuration for a function
     * @param functionName Name of the function
     * @return Configuration for the function
     */
    function _getMultisigConfig(string memory functionName) internal view returns (MultisigManager.MultisigConfig memory) {
        if (address(multisigManager) == address(0)) {
            return MultisigManager.MultisigConfig({
                isEnabled: false,
                requiredSignatures: 1,
                timelockDuration: 0,
                isActive: false
            });
        }
        return multisigManager.getMultisigConfig(functionName);
    }
}
