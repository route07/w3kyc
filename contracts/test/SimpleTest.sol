// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SimpleTest
 * @dev Minimal test contract to verify compilation
 */
contract SimpleTest is ReentrancyGuard {
    
    address public owner;
    uint256 public value;
    
    event ValueUpdated(uint256 oldValue, uint256 newValue);
    
    constructor() {
        owner = msg.sender;
        value = 0;
    }
    
    function updateValue(uint256 newValue) external nonReentrant {
        require(msg.sender == owner, "Only owner");
        uint256 oldValue = value;
        value = newValue;
        emit ValueUpdated(oldValue, newValue);
    }
    
    function getValue() external view returns (uint256) {
        return value;
    }
}
