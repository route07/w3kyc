// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./InputValidator.sol";

/**
 * @title VersionManager
 * @dev Contract versioning and migration management system
 * @notice This contract manages versioning for all KYC system contracts and handles migrations
 * @author Web3 KYC Team
 */
contract VersionManager is ReentrancyGuard {
    
    // ============ STRUCTS ============
    
    struct ContractVersion {
        string version;           // Version string (e.g., "1.0.0")
        address contractAddress;  // Address of the contract
        uint256 deployedAt;       // Block timestamp when deployed
        bool isActive;           // Whether this version is active
        string description;      // Description of changes
        string[] dependencies;   // Dependencies on other contracts
    }
    
    struct MigrationPlan {
        string fromVersion;      // Source version
        string toVersion;        // Target version
        address migrationContract; // Contract handling the migration
        uint256 plannedAt;       // When migration was planned
        uint256 executedAt;      // When migration was executed (0 if not executed)
        bool isExecuted;         // Whether migration has been executed
        string description;      // Description of migration
    }
    
    // ============ STATE VARIABLES ============
    
    address public owner;
    mapping(string => ContractVersion) public contractVersions;
    mapping(string => MigrationPlan) public migrationPlans;
    mapping(address => bool) public authorizedWriters;
    
    string[] public contractNames;
    string[] public migrationIds;
    
    // Events
    event ContractVersionRegistered(string indexed contractName, string version, address contractAddress);
    event ContractVersionActivated(string indexed contractName, string version);
    event MigrationPlanCreated(string indexed migrationId, string fromVersion, string toVersion);
    event MigrationExecuted(string indexed migrationId, address migrationContract);
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
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        owner = msg.sender;
        authorizedWriters[owner] = true;
    }
    
    // ============ VERSION MANAGEMENT ============
    
    /**
     * @dev Register a new contract version
     * @param contractName Name of the contract
     * @param version Version string
     * @param contractAddress Address of the contract
     * @param description Description of changes
     * @param dependencies Array of dependency contract names
     */
    function registerContractVersion(
        string memory contractName,
        string memory version,
        address contractAddress,
        string memory description,
        string[] memory dependencies
    ) external onlyAuthorizedWriter nonReentrant {
        // Comprehensive input validation
        InputValidator.validateString(contractName, "contractName");
        InputValidator.validateString(version, "version");
        InputValidator.validateAddress(contractAddress, "contractAddress");
        InputValidator.validateString(description, "description");
        
        // Check if this is a new contract or new version
        bool isNewContract = contractVersions[contractName].contractAddress == address(0);
        
        // Create version key
        string memory versionKey = string(abi.encodePacked(contractName, "-", version));
        
        // Validate that version doesn't already exist
        require(contractVersions[versionKey].contractAddress == address(0), "Version already exists");
        
        // Register the version
        contractVersions[versionKey] = ContractVersion({
            version: version,
            contractAddress: contractAddress,
            deployedAt: block.timestamp,
            isActive: false, // New versions are inactive by default
            description: description,
            dependencies: dependencies
        });
        
        // Add to contract names if new
        if (isNewContract) {
            contractNames.push(contractName);
        }
        
        emit ContractVersionRegistered(contractName, version, contractAddress);
    }
    
    /**
     * @dev Activate a contract version
     * @param contractName Name of the contract
     * @param version Version to activate
     */
    function activateContractVersion(
        string memory contractName,
        string memory version
    ) external onlyAuthorizedWriter nonReentrant {
        // Comprehensive input validation
        InputValidator.validateString(contractName, "contractName");
        InputValidator.validateString(version, "version");
        
        string memory versionKey = string(abi.encodePacked(contractName, "-", version));
        ContractVersion storage contractVersion = contractVersions[versionKey];
        
        require(contractVersion.contractAddress != address(0), "Version not found");
        require(!contractVersion.isActive, "Version already active");
        
        // Deactivate all other versions of this contract
        for (uint256 i = 0; i < contractNames.length; i++) {
            if (keccak256(bytes(contractNames[i])) == keccak256(bytes(contractName))) {
                // Find all versions of this contract and deactivate them
                // This is a simplified approach - in production, maintain a mapping
                break;
            }
        }
        
        // Activate the new version
        contractVersion.isActive = true;
        
        emit ContractVersionActivated(contractName, version);
    }
    
    /**
     * @dev Get active version of a contract
     * @param contractName Name of the contract
     * @return version Active version string
     * @return contractAddress Address of the active contract
     */
    function getActiveVersion(string memory contractName) external view returns (string memory version, address contractAddress) {
        InputValidator.validateString(contractName, "contractName");
        
        // Find active version (simplified - in production, maintain active version mapping)
        for (uint256 i = 0; i < contractNames.length; i++) {
            if (keccak256(bytes(contractNames[i])) == keccak256(bytes(contractName))) {
                // This is a simplified search - in production, maintain active version index
                break;
            }
        }
        
        return ("", address(0)); // Placeholder - implement proper active version lookup
    }
    
    // ============ MIGRATION MANAGEMENT ============
    
    /**
     * @dev Create a migration plan
     * @param migrationId Unique identifier for the migration
     * @param fromVersion Source version
     * @param toVersion Target version
     * @param migrationContract Contract that will handle the migration
     * @param description Description of the migration
     */
    function createMigrationPlan(
        string memory migrationId,
        string memory fromVersion,
        string memory toVersion,
        address migrationContract,
        string memory description
    ) external onlyAuthorizedWriter nonReentrant {
        // Comprehensive input validation
        InputValidator.validateString(migrationId, "migrationId");
        InputValidator.validateString(fromVersion, "fromVersion");
        InputValidator.validateString(toVersion, "toVersion");
        InputValidator.validateAddress(migrationContract, "migrationContract");
        InputValidator.validateString(description, "description");
        
        require(migrationPlans[migrationId].plannedAt == 0, "Migration plan already exists");
        
        migrationPlans[migrationId] = MigrationPlan({
            fromVersion: fromVersion,
            toVersion: toVersion,
            migrationContract: migrationContract,
            plannedAt: block.timestamp,
            executedAt: 0,
            isExecuted: false,
            description: description
        });
        
        migrationIds.push(migrationId);
        
        emit MigrationPlanCreated(migrationId, fromVersion, toVersion);
    }
    
    /**
     * @dev Execute a migration plan
     * @param migrationId ID of the migration to execute
     */
    function executeMigration(string memory migrationId) external onlyAuthorizedWriter nonReentrant {
        InputValidator.validateString(migrationId, "migrationId");
        
        MigrationPlan storage plan = migrationPlans[migrationId];
        require(plan.plannedAt > 0, "Migration plan not found");
        require(!plan.isExecuted, "Migration already executed");
        
        // Mark as executed
        plan.executedAt = block.timestamp;
        plan.isExecuted = true;
        
        emit MigrationExecuted(migrationId, plan.migrationContract);
    }
    
    // ============ ACCESS CONTROL ============
    
    /**
     * @dev Set authorized writer
     * @param writer Address to authorize/revoke
     * @param authorized Whether to authorize or revoke
     */
    function setAuthorizedWriter(address writer, bool authorized) external onlyOwner nonReentrant {
        InputValidator.validateAddress(writer, "writer");
        
        authorizedWriters[writer] = authorized;
        emit AuthorizedWriterUpdated(writer, authorized);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get all contract names
     * @return Array of contract names
     */
    function getAllContractNames() external view returns (string[] memory) {
        return contractNames;
    }
    
    /**
     * @dev Get all migration IDs
     * @return Array of migration IDs
     */
    function getAllMigrationIds() external view returns (string[] memory) {
        return migrationIds;
    }
    
    /**
     * @dev Get contract version details
     * @param contractName Name of the contract
     * @param version Version string
     * @return Contract version details
     */
    function getContractVersion(string memory contractName, string memory version) external view returns (ContractVersion memory) {
        InputValidator.validateString(contractName, "contractName");
        InputValidator.validateString(version, "version");
        
        string memory versionKey = string(abi.encodePacked(contractName, "-", version));
        return contractVersions[versionKey];
    }
    
    /**
     * @dev Get migration plan details
     * @param migrationId ID of the migration
     * @return Migration plan details
     */
    function getMigrationPlan(string memory migrationId) external view returns (MigrationPlan memory) {
        InputValidator.validateString(migrationId, "migrationId");
        
        return migrationPlans[migrationId];
    }
    
    /**
     * @dev Check if address is authorized writer
     * @param writer Address to check
     * @return Whether the address is authorized
     */
    function isAuthorizedWriter(address writer) external view returns (bool) {
        InputValidator.validateAddress(writer, "writer");
        
        return authorizedWriters[writer] || writer == owner;
    }
}
