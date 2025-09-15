// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DIDCredentialStorage
 * @dev Dedicated storage contract for Decentralized Identity (DID) credentials
 * @notice This contract manages verifiable credentials and DID mappings
 * @author Web3 KYC Team
 */
contract DIDCredentialStorage is ReentrancyGuard {
    
    // ============ STRUCTS ============
    
    /**
     * @dev Structure to store DID credential data
     */
    struct DIDCredential {
        string did;                         // Decentralized Identifier
        string credentialType;              // Type of credential (e.g., "KYC", "AML", "Identity")
        string credentialHash;              // IPFS hash of the credential data
        string jurisdiction;                // Jurisdiction where credential was issued
        uint256 issuedAt;                   // Timestamp when credential was issued
        uint256 expiresAt;                  // Expiration timestamp
        bool isRevoked;                     // Whether credential is revoked
        address issuer;                     // Address that issued the credential
        string[] attributes;                // Credential attributes/claims
    }
    
    /**
     * @dev Configuration structure for credential settings
     */
    struct CredentialConfig {
        uint256 defaultExpiryDuration;      // Default credential expiry duration
        uint256 maxAttributesPerCredential; // Maximum attributes per credential
        bool allowCrossJurisdiction;        // Whether to allow cross-jurisdiction credentials
        bool requireIssuerVerification;     // Whether to require issuer verification
        uint256 maxCredentialsPerDID;       // Maximum credentials per DID
    }
    
    /**
     * @dev Structure to store DID metadata
     */
    struct DIDMetadata {
        string did;                         // The DID
        address primaryAddress;             // Primary linked address
        uint256 createdAt;                  // Creation timestamp
        bool isActive;                      // Whether DID is active
        string[] linkedAddresses;           // All linked addresses
        string[] credentialTypes;           // Types of credentials held
    }
    
    // ============ STATE VARIABLES ============
    
    // Storage mappings
    mapping(string => DIDCredential[]) public didCredentials;        // Credentials per DID
    mapping(string => DIDMetadata) public didMetadata;               // Metadata per DID
    mapping(address => string) public addressToDID;                  // Address to DID mapping
    mapping(string => address[]) public didToAddresses;              // DID to addresses mapping
    mapping(string => bool) public revokedCredentials;               // Revoked credential hashes
    mapping(string => uint256) public credentialCount;               // Credential count per DID
    
    // Configuration
    CredentialConfig public credentialConfig;
    mapping(string => uint256) public jurisdictionExpiryDurations;   // Per-jurisdiction expiry
    mapping(string => bool) public allowedCredentialTypes;           // Allowed credential types
    
    // Access control
    mapping(address => bool) public authorizedWriters;
    mapping(address => bool) public authorizedIssuers;               // Authorized credential issuers
    address public owner;
    
    // Version tracking
    uint256 public constant VERSION = 1;
    string public constant CONTRACT_NAME = "DIDCredentialStorage";
    
    // ============ EVENTS ============
    
    event CredentialIssued(
        string indexed did,
        string credentialType,
        string jurisdiction,
        address issuer,
        uint256 expiresAt
    );
    
    event CredentialRevoked(
        string indexed did,
        string credentialHash,
        address revoker,
        uint256 timestamp
    );
    
    event DIDLinked(
        string indexed did,
        address indexed address_,
        uint256 timestamp
    );
    
    event DIDUnlinked(
        string indexed did,
        address indexed address_,
        uint256 timestamp
    );
    
    event CredentialConfigUpdated(
        string field,
        uint256 oldValue,
        uint256 newValue
    );
    
    event AuthorizedIssuerUpdated(
        address indexed issuer,
        bool authorized
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
    
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender] || msg.sender == owner, "Not authorized issuer");
        _;
    }
    
    modifier validDID(string memory did) {
        require(bytes(did).length > 0, "Invalid DID");
        _;
    }
    
    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid address");
        _;
    }
    
    modifier validCredentialType(string memory credentialType) {
        require(bytes(credentialType).length > 0, "Invalid credential type");
        require(allowedCredentialTypes[credentialType], "Credential type not allowed");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Constructor to initialize the contract
     */
    constructor() {
        owner = msg.sender;
        authorizedWriters[owner] = true;
        authorizedIssuers[owner] = true;
        
        // Initialize default configuration
        _initializeDefaultConfig();
        
        // Initialize allowed credential types
        _initializeCredentialTypes();
        
        // Initialize jurisdiction-specific settings
        _initializeJurisdictionDefaults();
    }
    
    // ============ INITIALIZATION FUNCTIONS ============
    
    /**
     * @dev Initialize default credential configuration
     */
    function _initializeDefaultConfig() internal {
        credentialConfig = CredentialConfig({
            defaultExpiryDuration: 365 days,
            maxAttributesPerCredential: 20,
            allowCrossJurisdiction: true,
            requireIssuerVerification: true,
            maxCredentialsPerDID: 50
        });
    }
    
    /**
     * @dev Initialize allowed credential types
     */
    function _initializeCredentialTypes() internal {
        allowedCredentialTypes["KYC"] = true;
        allowedCredentialTypes["AML"] = true;
        allowedCredentialTypes["Identity"] = true;
        allowedCredentialTypes["Address"] = true;
        allowedCredentialTypes["Phone"] = true;
        allowedCredentialTypes["Email"] = true;
        allowedCredentialTypes["Employment"] = true;
        allowedCredentialTypes["Education"] = true;
    }
    
    /**
     * @dev Initialize jurisdiction-specific default settings
     */
    function _initializeJurisdictionDefaults() internal {
        // UK Configuration
        jurisdictionExpiryDurations["UK"] = 365 days;
        
        // EU Configuration
        jurisdictionExpiryDurations["EU"] = 365 days;
        
        // US Configuration
        jurisdictionExpiryDurations["US"] = 365 days;
        
        // Australia Configuration
        jurisdictionExpiryDurations["AU"] = 365 days;
        
        // South Africa Configuration
        jurisdictionExpiryDurations["ZA"] = 365 days;
    }
    
    // ============ CONFIGURATION FUNCTIONS ============
    
    /**
     * @dev Update credential configuration
     * @param _defaultExpiryDuration New default expiry duration
     * @param _maxAttributesPerCredential New maximum attributes per credential
     * @param _allowCrossJurisdiction Whether to allow cross-jurisdiction credentials
     * @param _requireIssuerVerification Whether to require issuer verification
     * @param _maxCredentialsPerDID New maximum credentials per DID
     */
    function updateCredentialConfig(
        uint256 _defaultExpiryDuration,
        uint256 _maxAttributesPerCredential,
        bool _allowCrossJurisdiction,
        bool _requireIssuerVerification,
        uint256 _maxCredentialsPerDID
    ) external onlyOwner {
        uint256 oldExpiry = credentialConfig.defaultExpiryDuration;
        uint256 oldMaxAttrs = credentialConfig.maxAttributesPerCredential;
        
        credentialConfig.defaultExpiryDuration = _defaultExpiryDuration;
        credentialConfig.maxAttributesPerCredential = _maxAttributesPerCredential;
        credentialConfig.allowCrossJurisdiction = _allowCrossJurisdiction;
        credentialConfig.requireIssuerVerification = _requireIssuerVerification;
        credentialConfig.maxCredentialsPerDID = _maxCredentialsPerDID;
        
        emit CredentialConfigUpdated("defaultExpiryDuration", oldExpiry, _defaultExpiryDuration);
        emit CredentialConfigUpdated("maxAttributesPerCredential", oldMaxAttrs, _maxAttributesPerCredential);
    }
    
    /**
     * @dev Update jurisdiction-specific configuration
     * @param jurisdiction The jurisdiction to update
     * @param expiryDuration New expiry duration for this jurisdiction
     */
    function updateJurisdictionConfig(
        string memory jurisdiction,
        uint256 expiryDuration
    ) external onlyOwner {
        require(bytes(jurisdiction).length > 0, "Invalid jurisdiction");
        
        jurisdictionExpiryDurations[jurisdiction] = expiryDuration;
    }
    
    /**
     * @dev Add or remove allowed credential type
     * @param credentialType Type of credential
     * @param allowed Whether to allow this type
     */
    function setAllowedCredentialType(string memory credentialType, bool allowed) external onlyOwner nonReentrant {
        require(bytes(credentialType).length > 0, "Invalid credential type");
        allowedCredentialTypes[credentialType] = allowed;
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
    
    /**
     * @dev Set authorized issuer
     * @param issuer Address to authorize/revoke as issuer
     * @param authorized Whether to authorize or revoke
     */
    function setAuthorizedIssuer(address issuer, bool authorized) external onlyOwner nonReentrant {
        require(issuer != address(0), "Invalid issuer address");
        authorizedIssuers[issuer] = authorized;
        emit AuthorizedIssuerUpdated(issuer, authorized);
    }
    
    // ============ CORE CREDENTIAL FUNCTIONS ============
    
    /**
     * @dev Issue a new credential
     * @param did DID to issue credential to
     * @param credentialType Type of credential
     * @param credentialHash IPFS hash of credential data
     * @param jurisdiction Jurisdiction where credential was issued
     * @param attributes Array of credential attributes
     */
    function issueCredential(
        string memory did,
        string memory credentialType,
        string memory credentialHash,
        string memory jurisdiction,
        string[] memory attributes
    ) external onlyAuthorizedIssuer validDID(did) validCredentialType(credentialType) {
        require(bytes(credentialHash).length > 0, "Invalid credential hash");
        require(bytes(jurisdiction).length > 0, "Invalid jurisdiction");
        require(attributes.length <= credentialConfig.maxAttributesPerCredential, "Too many attributes");
        require(credentialCount[did] < credentialConfig.maxCredentialsPerDID, "Max credentials reached");
        
        // Use jurisdiction-specific expiry or default
        uint256 expiryDuration = jurisdictionExpiryDurations[jurisdiction];
        if (expiryDuration == 0) {
            expiryDuration = credentialConfig.defaultExpiryDuration;
        }
        
        // Create credential
        DIDCredential memory credential = DIDCredential({
            did: did,
            credentialType: credentialType,
            credentialHash: credentialHash,
            jurisdiction: jurisdiction,
            issuedAt: block.timestamp,
            expiresAt: block.timestamp + expiryDuration,
            isRevoked: false,
            issuer: msg.sender,
            attributes: attributes
        });
        
        // Store credential
        didCredentials[did].push(credential);
        credentialCount[did]++;
        
        // Update DID metadata
        _updateDIDMetadata(did, credentialType);
        
        emit CredentialIssued(did, credentialType, jurisdiction, msg.sender, block.timestamp + expiryDuration);
    }
    
    /**
     * @dev Revoke a credential
     * @param did DID that owns the credential
     * @param credentialHash Hash of the credential to revoke
     */
    function revokeCredential(
        string memory did,
        string memory credentialHash
    ) external onlyAuthorizedIssuer validDID(did) {
        require(bytes(credentialHash).length > 0, "Invalid credential hash");
        
        // Find and revoke the credential
        DIDCredential[] storage credentials = didCredentials[did];
        for (uint256 i = 0; i < credentials.length; i++) {
            if (keccak256(bytes(credentials[i].credentialHash)) == keccak256(bytes(credentialHash))) {
                credentials[i].isRevoked = true;
                revokedCredentials[credentialHash] = true;
                emit CredentialRevoked(did, credentialHash, msg.sender, block.timestamp);
                return;
            }
        }
        
        revert("Credential not found");
    }
    
    // ============ DID MANAGEMENT FUNCTIONS ============
    
    /**
     * @dev Link an address to a DID
     * @param did DID to link
     * @param address_ Address to link
     */
    function linkDIDToAddress(
        string memory did,
        address address_
    ) external onlyAuthorized validDID(did) validAddress(address_) {
        require(bytes(addressToDID[address_]).length == 0, "Address already linked");
        
        // Link address to DID
        addressToDID[address_] = did;
        didToAddresses[did].push(address_);
        
        // Update DID metadata
        if (bytes(didMetadata[did].did).length == 0) {
            // Create new DID metadata
            didMetadata[did] = DIDMetadata({
                did: did,
                primaryAddress: address_,
                createdAt: block.timestamp,
                isActive: true,
                linkedAddresses: new string[](0),
                credentialTypes: new string[](0)
            });
        } else {
            // Update existing DID metadata
            didMetadata[did].linkedAddresses.push(_addressToString(address_));
        }
        
        emit DIDLinked(did, address_, block.timestamp);
    }
    
    /**
     * @dev Unlink an address from a DID
     * @param did DID to unlink
     * @param address_ Address to unlink
     */
    function unlinkDIDFromAddress(
        string memory did,
        address address_
    ) external onlyAuthorized validDID(did) validAddress(address_) {
        require(keccak256(bytes(addressToDID[address_])) == keccak256(bytes(did)), "Address not linked to DID");
        
        // Unlink address from DID
        delete addressToDID[address_];
        
        // Remove from DID addresses array
        address[] storage addresses = didToAddresses[did];
        for (uint256 i = 0; i < addresses.length; i++) {
            if (addresses[i] == address_) {
                addresses[i] = addresses[addresses.length - 1];
                addresses.pop();
                break;
            }
        }
        
        // Update DID metadata
        if (didMetadata[did].primaryAddress == address_) {
            // Set new primary address if available
            if (addresses.length > 0) {
                didMetadata[did].primaryAddress = addresses[0];
            } else {
                didMetadata[did].primaryAddress = address(0);
            }
        }
        
        emit DIDUnlinked(did, address_, block.timestamp);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get all credentials for a DID
     * @param did DID to query
     * @return Array of credentials
     */
    function getDIDCredentials(string memory did) external view validDID(did) returns (DIDCredential[] memory) {
        return didCredentials[did];
    }
    
    /**
     * @dev Get credentials of a specific type for a DID
     * @param did DID to query
     * @param credentialType Type of credential
     * @return Array of matching credentials
     */
    function getDIDCredentialsByType(
        string memory did,
        string memory credentialType
    ) external view validDID(did) returns (DIDCredential[] memory) {
        DIDCredential[] memory allCredentials = didCredentials[did];
        uint256 count = 0;
        
        // Count matching credentials
        for (uint256 i = 0; i < allCredentials.length; i++) {
            if (keccak256(bytes(allCredentials[i].credentialType)) == keccak256(bytes(credentialType))) {
                count++;
            }
        }
        
        // Create result array
        DIDCredential[] memory result = new DIDCredential[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allCredentials.length; i++) {
            if (keccak256(bytes(allCredentials[i].credentialType)) == keccak256(bytes(credentialType))) {
                result[index] = allCredentials[i];
                index++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev Get DID for an address
     * @param address_ Address to query
     * @return DID associated with the address
     */
    function getDIDForAddress(address address_) external view validAddress(address_) returns (string memory) {
        return addressToDID[address_];
    }
    
    /**
     * @dev Get all addresses for a DID
     * @param did DID to query
     * @return Array of linked addresses
     */
    function getAddressesForDID(string memory did) external view validDID(did) returns (address[] memory) {
        return didToAddresses[did];
    }
    
    /**
     * @dev Get DID metadata
     * @param did DID to query
     * @return DID metadata
     */
    function getDIDMetadata(string memory did) external view validDID(did) returns (DIDMetadata memory) {
        return didMetadata[did];
    }
    
    /**
     * @dev Check if a credential is valid (not revoked and not expired)
     * @param did DID that owns the credential
     * @param credentialHash Hash of the credential
     * @return Whether the credential is valid
     */
    function isCredentialValid(
        string memory did,
        string memory credentialHash
    ) external view validDID(did) returns (bool) {
        if (revokedCredentials[credentialHash]) {
            return false;
        }
        
        DIDCredential[] memory credentials = didCredentials[did];
        for (uint256 i = 0; i < credentials.length; i++) {
            if (keccak256(bytes(credentials[i].credentialHash)) == keccak256(bytes(credentialHash))) {
                return !credentials[i].isRevoked && block.timestamp < credentials[i].expiresAt;
            }
        }
        
        return false;
    }
    
    /**
     * @dev Check if a credential is revoked
     * @param credentialHash Hash of the credential
     * @return Whether the credential is revoked
     */
    function isCredentialRevoked(string memory credentialHash) external view returns (bool) {
        return revokedCredentials[credentialHash];
    }
    
    /**
     * @dev Get credential count for a DID
     * @param did DID to query
     * @return Number of credentials
     */
    function getCredentialCount(string memory did) external view validDID(did) returns (uint256) {
        return credentialCount[did];
    }
    
    /**
     * @dev Get current credential configuration
     * @return Complete credential configuration
     */
    function getCredentialConfig() external view returns (CredentialConfig memory) {
        return credentialConfig;
    }
    
    /**
     * @dev Check if an address is authorized to write
     * @param writer Address to check
     * @return Whether the address is authorized
     */
    function isAuthorizedWriter(address writer) external view returns (bool) {
        return authorizedWriters[writer] || writer == owner;
    }
    
    /**
     * @dev Check if an address is authorized to issue credentials
     * @param issuer Address to check
     * @return Whether the address is authorized
     */
    function isAuthorizedIssuer(address issuer) external view returns (bool) {
        return authorizedIssuers[issuer] || issuer == owner;
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Update DID metadata when a new credential is issued
     * @param did DID to update
     * @param credentialType Type of credential issued
     */
    function _updateDIDMetadata(string memory did, string memory credentialType) internal {
        if (bytes(didMetadata[did].did).length == 0) {
            // Create new DID metadata
            string[] memory credentialTypes = new string[](1);
            credentialTypes[0] = credentialType;
            
            didMetadata[did] = DIDMetadata({
                did: did,
                primaryAddress: address(0),
                createdAt: block.timestamp,
                isActive: true,
                linkedAddresses: new string[](0),
                credentialTypes: credentialTypes
            });
        } else {
            // Check if credential type already exists
            string[] storage existingTypes = didMetadata[did].credentialTypes;
            bool typeExists = false;
            
            for (uint256 i = 0; i < existingTypes.length; i++) {
                if (keccak256(bytes(existingTypes[i])) == keccak256(bytes(credentialType))) {
                    typeExists = true;
                    break;
                }
            }
            
            // Add new credential type if it doesn't exist
            if (!typeExists) {
                existingTypes.push(credentialType);
            }
        }
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
