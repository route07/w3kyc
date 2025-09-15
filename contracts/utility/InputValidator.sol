// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title InputValidator
 * @dev Utility library for comprehensive input validation
 * @notice This library provides standardized input validation functions for all contracts
 * @author Web3 KYC Team
 */
library InputValidator {
    
    // ============ CONSTANTS ============
    
    uint256 public constant MAX_STRING_LENGTH = 256;
    uint256 public constant MAX_BYTES_LENGTH = 1024;
    uint256 public constant MAX_UINT256 = type(uint256).max;
    uint256 public constant MIN_TIMELOCK_DURATION = 0;
    uint256 public constant MAX_TIMELOCK_DURATION = 365 days; // 1 year
    uint256 public constant MIN_SIGNATURES = 1;
    uint256 public constant MAX_SIGNATURES = 50;
    
    // ============ ADDRESS VALIDATION ============
    
    /**
     * @dev Validate that an address is not zero
     * @param addr Address to validate
     * @param paramName Name of the parameter for error messages
     */
    function validateAddress(address addr, string memory paramName) internal pure {
        require(addr != address(0), string(abi.encodePacked("Invalid ", paramName, ": zero address")));
    }
    
    /**
     * @dev Validate that an address is not zero and not the contract itself
     * @param addr Address to validate
     * @param paramName Name of the parameter for error messages
     */
    function validateAddressNotSelf(address addr, string memory paramName) internal view {
        validateAddress(addr, paramName);
        require(addr != address(this), string(abi.encodePacked("Invalid ", paramName, ": cannot be self")));
    }
    
    /**
     * @dev Validate that an address is not zero and not the contract itself
     * @param addr Address to validate
     * @param paramName Name of the parameter for error messages
     * @param contractAddr Contract address to compare against
     */
    function validateAddressNotContract(address addr, string memory paramName, address contractAddr) internal pure {
        validateAddress(addr, paramName);
        require(addr != contractAddr, string(abi.encodePacked("Invalid ", paramName, ": cannot be contract")));
    }
    
    // ============ STRING VALIDATION ============
    
    /**
     * @dev Validate that a string is not empty
     * @param str String to validate
     * @param paramName Name of the parameter for error messages
     */
    function validateStringNotEmpty(string memory str, string memory paramName) internal pure {
        require(bytes(str).length > 0, string(abi.encodePacked("Invalid ", paramName, ": empty string")));
    }
    
    /**
     * @dev Validate that a string is not empty and within length limits
     * @param str String to validate
     * @param paramName Name of the parameter for error messages
     */
    function validateString(string memory str, string memory paramName) internal pure {
        validateStringNotEmpty(str, paramName);
        require(bytes(str).length <= MAX_STRING_LENGTH, string(abi.encodePacked("Invalid ", paramName, ": string too long")));
    }
    
    /**
     * @dev Validate that a string is not empty and within custom length limits
     * @param str String to validate
     * @param paramName Name of the parameter for error messages
     * @param maxLength Maximum allowed length
     */
    function validateStringLength(string memory str, string memory paramName, uint256 maxLength) internal pure {
        validateStringNotEmpty(str, paramName);
        require(bytes(str).length <= maxLength, string(abi.encodePacked("Invalid ", paramName, ": string too long")));
    }
    
    // ============ BYTES VALIDATION ============
    
    /**
     * @dev Validate that bytes data is not empty
     * @param data Bytes data to validate
     * @param paramName Name of the parameter for error messages
     */
    function validateBytesNotEmpty(bytes memory data, string memory paramName) internal pure {
        require(data.length > 0, string(abi.encodePacked("Invalid ", paramName, ": empty bytes")));
    }
    
    /**
     * @dev Validate that bytes data is not empty and within length limits
     * @param data Bytes data to validate
     * @param paramName Name of the parameter for error messages
     */
    function validateBytes(bytes memory data, string memory paramName) internal pure {
        validateBytesNotEmpty(data, paramName);
        require(data.length <= MAX_BYTES_LENGTH, string(abi.encodePacked("Invalid ", paramName, ": bytes too long")));
    }
    
    /**
     * @dev Validate that bytes data is not empty and within custom length limits
     * @param data Bytes data to validate
     * @param paramName Name of the parameter for error messages
     * @param maxLength Maximum allowed length
     */
    function validateBytesLength(bytes memory data, string memory paramName, uint256 maxLength) internal pure {
        validateBytesNotEmpty(data, paramName);
        require(data.length <= maxLength, string(abi.encodePacked("Invalid ", paramName, ": bytes too long")));
    }
    
    // ============ UINT VALIDATION ============
    
    /**
     * @dev Validate that a uint256 is within a range
     * @param value Value to validate
     * @param paramName Name of the parameter for error messages
     * @param minValue Minimum allowed value
     * @param maxValue Maximum allowed value
     */
    function validateUintRange(uint256 value, string memory paramName, uint256 minValue, uint256 maxValue) internal pure {
        require(value >= minValue, string(abi.encodePacked("Invalid ", paramName, ": below minimum")));
        require(value <= maxValue, string(abi.encodePacked("Invalid ", paramName, ": above maximum")));
    }
    
    /**
     * @dev Validate that a uint256 is greater than zero
     * @param value Value to validate
     * @param paramName Name of the parameter for error messages
     */
    function validateUintPositive(uint256 value, string memory paramName) internal pure {
        require(value > 0, string(abi.encodePacked("Invalid ", paramName, ": must be positive")));
    }
    
    /**
     * @dev Validate that a uint256 is greater than or equal to zero
     * @param value Value to validate
     * @param paramName Name of the parameter for error messages
     */
    function validateUintNonNegative(uint256 value, string memory paramName) internal pure {
        require(value >= 0, string(abi.encodePacked("Invalid ", paramName, ": must be non-negative")));
    }
    
    /**
     * @dev Validate signature count
     * @param signatures Number of signatures
     * @param paramName Name of the parameter for error messages
     */
    function validateSignatureCount(uint256 signatures, string memory paramName) internal pure {
        validateUintRange(signatures, paramName, MIN_SIGNATURES, MAX_SIGNATURES);
    }
    
    /**
     * @dev Validate timelock duration
     * @param duration Timelock duration in seconds
     * @param paramName Name of the parameter for error messages
     */
    function validateTimelockDuration(uint256 duration, string memory paramName) internal pure {
        validateUintRange(duration, paramName, MIN_TIMELOCK_DURATION, MAX_TIMELOCK_DURATION);
    }
    
    // ============ ARRAY VALIDATION ============
    
    /**
     * @dev Validate that an array is not empty
     * @param arr Array to validate
     * @param paramName Name of the parameter for error messages
     */
    function validateArrayNotEmpty(address[] memory arr, string memory paramName) internal pure {
        require(arr.length > 0, string(abi.encodePacked("Invalid ", paramName, ": empty array")));
    }
    
    /**
     * @dev Validate that an array is not empty and within length limits
     * @param arr Array to validate
     * @param paramName Name of the parameter for error messages
     * @param maxLength Maximum allowed length
     */
    function validateArrayLength(address[] memory arr, string memory paramName, uint256 maxLength) internal pure {
        validateArrayNotEmpty(arr, paramName);
        require(arr.length <= maxLength, string(abi.encodePacked("Invalid ", paramName, ": array too long")));
    }
    
    // ============ COMPOSITE VALIDATION ============
    
    /**
     * @dev Validate operation parameters
     * @param functionName Function name
     * @param target Target address
     * @param data Call data
     */
    function validateOperationParams(
        string memory functionName,
        address target,
        bytes memory data
    ) internal view {
        validateString(functionName, "functionName");
        validateAddressNotSelf(target, "target");
        validateBytes(data, "data");
    }
    
    /**
     * @dev Validate multisig configuration parameters
     * @param requiredSignatures Number of required signatures
     * @param timelockDuration Timelock duration
     */
    function validateMultisigConfig(uint256 requiredSignatures, uint256 timelockDuration) internal pure {
        validateSignatureCount(requiredSignatures, "requiredSignatures");
        validateTimelockDuration(timelockDuration, "timelockDuration");
    }
    
    /**
     * @dev Validate operation ID
     * @param operationId Operation ID to validate
     */
    function validateOperationId(uint256 operationId) internal pure {
        validateUintPositive(operationId, "operationId");
    }
}
