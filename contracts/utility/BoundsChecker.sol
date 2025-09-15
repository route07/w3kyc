// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title BoundsChecker
 * @dev Utility library for comprehensive bounds checking on array operations
 * @notice This library provides standardized bounds checking functions for all contracts
 * @author Web3 KYC Team
 */
library BoundsChecker {
    
    // ============ CONSTANTS ============
    
    uint256 public constant MAX_ARRAY_LENGTH = 1000;
    uint256 public constant MAX_AUDIT_ENTRIES = 500;
    uint256 public constant MAX_SIGNERS = 50;
    uint256 public constant MAX_OPERATIONS = 100;
    uint256 public constant MAX_CREDENTIALS = 200;
    uint256 public constant MAX_TENANTS = 100;
    uint256 public constant MAX_JURISDICTIONS = 50;
    uint256 public constant MAX_ACTIONS = 100;
    
    // ============ ARRAY LENGTH VALIDATION ============
    
    /**
     * @dev Validate that an array length is within bounds
     * @param length Current array length
     * @param maxLength Maximum allowed length
     * @param arrayName Name of the array for error messages
     */
    function validateArrayLength(uint256 length, uint256 maxLength, string memory arrayName) internal pure {
        require(length <= maxLength, string(abi.encodePacked("Array ", arrayName, " exceeds maximum length")));
    }
    
    /**
     * @dev Validate that an array length is within default bounds
     * @param length Current array length
     * @param arrayName Name of the array for error messages
     */
    function validateDefaultArrayLength(uint256 length, string memory arrayName) internal pure {
        validateArrayLength(length, MAX_ARRAY_LENGTH, arrayName);
    }
    
    // ============ ARRAY ACCESS VALIDATION ============
    
    /**
     * @dev Validate that an index is within array bounds
     * @param index Index to validate
     * @param arrayLength Current array length
     * @param arrayName Name of the array for error messages
     */
    function validateArrayIndex(uint256 index, uint256 arrayLength, string memory arrayName) internal pure {
        require(index < arrayLength, string(abi.encodePacked("Index out of bounds for ", arrayName)));
    }
    
    /**
     * @dev Validate that an index is within array bounds (inclusive)
     * @param index Index to validate
     * @param arrayLength Current array length
     * @param arrayName Name of the array for error messages
     */
    function validateArrayIndexInclusive(uint256 index, uint256 arrayLength, string memory arrayName) internal pure {
        require(index <= arrayLength, string(abi.encodePacked("Index out of bounds for ", arrayName)));
    }
    
    // ============ ARRAY OPERATION VALIDATION ============
    
    /**
     * @dev Validate that an array can be pushed to
     * @param currentLength Current array length
     * @param maxLength Maximum allowed length
     * @param arrayName Name of the array for error messages
     */
    function validateCanPush(uint256 currentLength, uint256 maxLength, string memory arrayName) internal pure {
        require(currentLength < maxLength, string(abi.encodePacked("Cannot push to ", arrayName, ": array is full")));
    }
    
    /**
     * @dev Validate that an array can be pushed to with default bounds
     * @param currentLength Current array length
     * @param arrayName Name of the array for error messages
     */
    function validateCanPushDefault(uint256 currentLength, string memory arrayName) internal pure {
        validateCanPush(currentLength, MAX_ARRAY_LENGTH, arrayName);
    }
    
    /**
     * @dev Validate that an array can be popped from
     * @param currentLength Current array length
     * @param arrayName Name of the array for error messages
     */
    function validateCanPop(uint256 currentLength, string memory arrayName) internal pure {
        require(currentLength > 0, string(abi.encodePacked("Cannot pop from empty ", arrayName)));
    }
    
    // ============ SPECIFIC ARRAY TYPE VALIDATION ============
    
    /**
     * @dev Validate audit log array bounds
     * @param length Current array length
     * @param arrayName Name of the array for error messages
     */
    function validateAuditLogArray(uint256 length, string memory arrayName) internal pure {
        validateArrayLength(length, MAX_AUDIT_ENTRIES, arrayName);
    }
    
    /**
     * @dev Validate signer array bounds
     * @param length Current array length
     * @param arrayName Name of the array for error messages
     */
    function validateSignerArray(uint256 length, string memory arrayName) internal pure {
        validateArrayLength(length, MAX_SIGNERS, arrayName);
    }
    
    /**
     * @dev Validate operation array bounds
     * @param length Current array length
     * @param arrayName Name of the array for error messages
     */
    function validateOperationArray(uint256 length, string memory arrayName) internal pure {
        validateArrayLength(length, MAX_OPERATIONS, arrayName);
    }
    
    /**
     * @dev Validate credential array bounds
     * @param length Current array length
     * @param arrayName Name of the array for error messages
     */
    function validateCredentialArray(uint256 length, string memory arrayName) internal pure {
        validateArrayLength(length, MAX_CREDENTIALS, arrayName);
    }
    
    /**
     * @dev Validate tenant array bounds
     * @param length Current array length
     * @param arrayName Name of the array for error messages
     */
    function validateTenantArray(uint256 length, string memory arrayName) internal pure {
        validateArrayLength(length, MAX_TENANTS, arrayName);
    }
    
    /**
     * @dev Validate jurisdiction array bounds
     * @param length Current array length
     * @param arrayName Name of the array for error messages
     */
    function validateJurisdictionArray(uint256 length, string memory arrayName) internal pure {
        validateArrayLength(length, MAX_JURISDICTIONS, arrayName);
    }
    
    /**
     * @dev Validate action array bounds
     * @param length Current array length
     * @param arrayName Name of the array for error messages
     */
    function validateActionArray(uint256 length, string memory arrayName) internal pure {
        validateArrayLength(length, MAX_ACTIONS, arrayName);
    }
    
    // ============ ARRAY SLICING VALIDATION ============
    
    /**
     * @dev Validate array slice parameters
     * @param startIndex Starting index for slice
     * @param count Number of elements to slice
     * @param arrayLength Total array length
     * @param arrayName Name of the array for error messages
     */
    function validateArraySlice(uint256 startIndex, uint256 count, uint256 arrayLength, string memory arrayName) internal pure {
        require(startIndex < arrayLength, string(abi.encodePacked("Start index out of bounds for ", arrayName)));
        require(count > 0, string(abi.encodePacked("Count must be positive for ", arrayName)));
        require(startIndex + count <= arrayLength, string(abi.encodePacked("Slice exceeds array bounds for ", arrayName)));
    }
    
    // ============ ARRAY ITERATION VALIDATION ============
    
    /**
     * @dev Validate iteration bounds to prevent gas limit issues
     * @param startIndex Starting index for iteration
     * @param endIndex Ending index for iteration
     * @param maxIterations Maximum allowed iterations
     * @param arrayName Name of the array for error messages
     */
    function validateIterationBounds(uint256 startIndex, uint256 endIndex, uint256 maxIterations, string memory arrayName) internal pure {
        require(startIndex <= endIndex, string(abi.encodePacked("Invalid iteration bounds for ", arrayName)));
        require(endIndex - startIndex <= maxIterations, string(abi.encodePacked("Too many iterations for ", arrayName)));
    }
    
    // ============ ARRAY MEMORY ALLOCATION VALIDATION ============
    
    /**
     * @dev Validate memory allocation size
     * @param size Size to allocate
     * @param maxSize Maximum allowed size
     * @param arrayName Name of the array for error messages
     */
    function validateMemoryAllocation(uint256 size, uint256 maxSize, string memory arrayName) internal pure {
        require(size <= maxSize, string(abi.encodePacked("Memory allocation too large for ", arrayName)));
        require(size > 0, string(abi.encodePacked("Memory allocation size must be positive for ", arrayName)));
    }
    
    /**
     * @dev Validate memory allocation size with default bounds
     * @param size Size to allocate
     * @param arrayName Name of the array for error messages
     */
    function validateDefaultMemoryAllocation(uint256 size, string memory arrayName) internal pure {
        validateMemoryAllocation(size, MAX_ARRAY_LENGTH, arrayName);
    }
    
    // ============ COMPOSITE VALIDATION ============
    
    /**
     * @dev Validate complete array operation (push with bounds checking)
     * @param currentLength Current array length
     * @param maxLength Maximum allowed length
     * @param arrayName Name of the array for error messages
     */
    function validateArrayPush(uint256 currentLength, uint256 maxLength, string memory arrayName) internal pure {
        validateCanPush(currentLength, maxLength, arrayName);
    }
    
    /**
     * @dev Validate complete array operation (pop with bounds checking)
     * @param currentLength Current array length
     * @param arrayName Name of the array for error messages
     */
    function validateArrayPop(uint256 currentLength, string memory arrayName) internal pure {
        validateCanPop(currentLength, arrayName);
    }
    
    /**
     * @dev Validate complete array operation (access with bounds checking)
     * @param index Index to access
     * @param arrayLength Current array length
     * @param arrayName Name of the array for error messages
     */
    function validateArrayAccess(uint256 index, uint256 arrayLength, string memory arrayName) internal pure {
        validateArrayIndex(index, arrayLength, arrayName);
    }
}
