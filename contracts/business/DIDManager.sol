// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../storage/DIDCredentialStorage.sol";
import "../storage/AuditLogStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DIDManager
 * @dev Business logic contract for Decentralized Identity (DID) operations
 * @notice This contract handles DID credential issuance, verification, and management
 * @author Web3 KYC Team
 */
contract DIDManager is ReentrancyGuard {
    
    // ============ STATE VARIABLES ============
    
    // Storage contract references
    DIDCredentialStorage public didCredentialStorage;
    AuditLogStorage public auditLogStorage;
    
    // Access control
    mapping(address => bool) public authorizedWriters;
    mapping(address => bool) public authorizedIssuers;
    address public owner;
    
    // Version tracking
    uint256 public constant VERSION = 1;
    string public constant CONTRACT_NAME = "DIDManager";
    
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
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Constructor to initialize the contract
     * @param _didCredentialStorage Address of DIDCredentialStorage contract
     * @param _auditLogStorage Address of AuditLogStorage contract
     */
    constructor(
        address _didCredentialStorage,
        address _auditLogStorage
    ) {
        require(_didCredentialStorage != address(0), "Invalid DID credential storage address");
        require(_auditLogStorage != address(0), "Invalid audit log storage address");
        
        owner = msg.sender;
        authorizedWriters[owner] = true;
        authorizedIssuers[owner] = true;
        
        didCredentialStorage = DIDCredentialStorage(_didCredentialStorage);
        auditLogStorage = AuditLogStorage(_auditLogStorage);
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
        
        // Issue credential through storage contract
        didCredentialStorage.issueCredential(did, credentialType, credentialHash, jurisdiction, attributes);
        
        // Create audit log
        auditLogStorage.createSimpleAuditLog(
            address(0), // System-wide action
            "CREDENTIAL_ISSUED",
            string(abi.encodePacked(
                "Credential issued to DID: ",
                did,
                ", Type: ",
                credentialType,
                ", Jurisdiction: ",
                jurisdiction
            )),
            "",
            jurisdiction
        );
        
        // Get expiry time for event
        DIDCredentialStorage.DIDCredential[] memory credentials = didCredentialStorage.getDIDCredentials(did);
        uint256 expiresAt = credentials[credentials.length - 1].expiresAt;
        
        emit CredentialIssued(did, credentialType, jurisdiction, msg.sender, expiresAt);
    }
    
    /**
     * @dev Revoke a credential
     * @param did DID that owns the credential
     * @param credentialHash Hash of the credential to revoke
     * @param reason Reason for revocation
     */
    function revokeCredential(
        string memory did,
        string memory credentialHash,
        string memory reason
    ) external onlyAuthorizedIssuer validDID(did) {
        require(bytes(credentialHash).length > 0, "Invalid credential hash");
        require(bytes(reason).length > 0, "Invalid reason");
        
        // Revoke credential through storage contract
        didCredentialStorage.revokeCredential(did, credentialHash);
        
        // Create audit log
        auditLogStorage.createSimpleAuditLog(
            address(0), // System-wide action
            "CREDENTIAL_REVOKED",
            string(abi.encodePacked(
                "Credential revoked for DID: ",
                did,
                ", Hash: ",
                credentialHash,
                ", Reason: ",
                reason
            )),
            "",
            ""
        );
        
        emit CredentialRevoked(did, credentialHash, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Verify a credential
     * @param did DID that owns the credential
     * @param credentialHash Hash of the credential to verify
     * @return isValid Whether the credential is valid
     * @return isExpired Whether the credential is expired
     * @return isRevoked Whether the credential is revoked
     */
    function verifyCredential(
        string memory did,
        string memory credentialHash
    ) external view validDID(did) returns (
        bool isValid,
        bool isExpired,
        bool isRevoked
    ) {
        // Check if credential is revoked
        isRevoked = didCredentialStorage.isCredentialRevoked(credentialHash);
        
        if (isRevoked) {
            return (false, false, true);
        }
        
        // Get credential data
        DIDCredentialStorage.DIDCredential[] memory credentials = didCredentialStorage.getDIDCredentials(did);
        
        for (uint256 i = 0; i < credentials.length; i++) {
            if (keccak256(bytes(credentials[i].credentialHash)) == keccak256(bytes(credentialHash))) {
                isExpired = block.timestamp >= credentials[i].expiresAt;
                isValid = !credentials[i].isRevoked && !isExpired;
                return (isValid, isExpired, isRevoked);
            }
        }
        
        return (false, false, false); // Credential not found
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
        // Link address to DID through storage contract
        didCredentialStorage.linkDIDToAddress(did, address_);
        
        // Create audit log
        auditLogStorage.createSimpleAuditLog(
            address_,
            "DID_LINKED",
            string(abi.encodePacked(
                "Address linked to DID: ",
                did,
                ", Address: ",
                _addressToString(address_)
            )),
            "",
            ""
        );
        
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
        // Unlink address from DID through storage contract
        didCredentialStorage.unlinkDIDFromAddress(did, address_);
        
        // Create audit log
        auditLogStorage.createSimpleAuditLog(
            address_,
            "DID_UNLINKED",
            string(abi.encodePacked(
                "Address unlinked from DID: ",
                did,
                ", Address: ",
                _addressToString(address_)
            )),
            "",
            ""
        );
        
        emit DIDUnlinked(did, address_, block.timestamp);
    }
    
    /**
     * @dev Get DID for an address
     * @param address_ Address to query
     * @return DID associated with the address
     */
    function getDIDForAddress(address address_) external view validAddress(address_) returns (string memory) {
        return didCredentialStorage.getDIDForAddress(address_);
    }
    
    /**
     * @dev Get all addresses for a DID
     * @param did DID to query
     * @return Array of linked addresses
     */
    function getAddressesForDID(string memory did) external view validDID(did) returns (address[] memory) {
        return didCredentialStorage.getAddressesForDID(did);
    }
    
    // ============ CREDENTIAL QUERY FUNCTIONS ============
    
    /**
     * @dev Get all credentials for a DID
     * @param did DID to query
     * @return Array of credentials
     */
    function getDIDCredentials(string memory did) external view validDID(did) returns (DIDCredentialStorage.DIDCredential[] memory) {
        return didCredentialStorage.getDIDCredentials(did);
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
    ) external view validDID(did) validCredentialType(credentialType) returns (DIDCredentialStorage.DIDCredential[] memory) {
        return didCredentialStorage.getDIDCredentialsByType(did, credentialType);
    }
    
    /**
     * @dev Get valid credentials of a specific type for a DID
     * @param did DID to query
     * @param credentialType Type of credential
     * @return Array of valid matching credentials
     */
    function getValidDIDCredentialsByType(
        string memory did,
        string memory credentialType
    ) external view validDID(did) validCredentialType(credentialType) returns (DIDCredentialStorage.DIDCredential[] memory) {
        DIDCredentialStorage.DIDCredential[] memory allCredentials = didCredentialStorage.getDIDCredentialsByType(did, credentialType);
        
        // Count valid credentials
        uint256 validCount = 0;
        for (uint256 i = 0; i < allCredentials.length; i++) {
            if (!allCredentials[i].isRevoked && block.timestamp < allCredentials[i].expiresAt) {
                validCount++;
            }
        }
        
        // Create result array with only valid credentials
        DIDCredentialStorage.DIDCredential[] memory validCredentials = new DIDCredentialStorage.DIDCredential[](validCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allCredentials.length; i++) {
            if (!allCredentials[i].isRevoked && block.timestamp < allCredentials[i].expiresAt) {
                validCredentials[index] = allCredentials[i];
                index++;
            }
        }
        
        return validCredentials;
    }
    
    /**
     * @dev Check if a DID has a valid credential of a specific type
     * @param did DID to check
     * @param credentialType Type of credential
     * @return Whether the DID has a valid credential of the specified type
     */
    function hasValidCredential(
        string memory did,
        string memory credentialType
    ) external view validDID(did) validCredentialType(credentialType) returns (bool) {
        DIDCredentialStorage.DIDCredential[] memory credentials = didCredentialStorage.getDIDCredentialsByType(did, credentialType);
        
        for (uint256 i = 0; i < credentials.length; i++) {
            if (!credentials[i].isRevoked && block.timestamp < credentials[i].expiresAt) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * @dev Get credential count for a DID
     * @param did DID to query
     * @return Number of credentials
     */
    function getCredentialCount(string memory did) external view validDID(did) returns (uint256) {
        return didCredentialStorage.getCredentialCount(did);
    }
    
    /**
     * @dev Get DID metadata
     * @param did DID to query
     * @return DID metadata
     */
    function getDIDMetadata(string memory did) external view validDID(did) returns (DIDCredentialStorage.DIDMetadata memory) {
        return didCredentialStorage.getDIDMetadata(did);
    }
    
    // ============ BATCH OPERATIONS ============
    
    /**
     * @dev Issue multiple credentials in a single transaction
     * @param did DID to issue credentials to
     * @param credentialTypes Array of credential types
     * @param credentialHashes Array of credential hashes
     * @param jurisdiction Jurisdiction where credentials were issued
     * @param attributesArray Array of attributes arrays
     */
    function issueMultipleCredentials(
        string memory did,
        string[] memory credentialTypes,
        string[] memory credentialHashes,
        string memory jurisdiction,
        string[][] memory attributesArray
    ) external onlyAuthorizedIssuer validDID(did) {
        require(credentialTypes.length == credentialHashes.length, "Arrays length mismatch");
        require(credentialTypes.length == attributesArray.length, "Attributes array length mismatch");
        require(credentialTypes.length > 0, "Empty arrays");
        require(credentialTypes.length <= 10, "Too many credentials"); // Limit to prevent gas issues
        
        for (uint256 i = 0; i < credentialTypes.length; i++) {
            didCredentialStorage.issueCredential(
                did,
                credentialTypes[i],
                credentialHashes[i],
                jurisdiction,
                attributesArray[i]
            );
        }
        
        // Create audit log for batch operation
        auditLogStorage.createSimpleAuditLog(
            address(0),
            "BATCH_CREDENTIALS_ISSUED",
            string(abi.encodePacked(
                "Batch of ",
                _uintToString(credentialTypes.length),
                " credentials issued to DID: ",
                did,
                ", Jurisdiction: ",
                jurisdiction
            )),
            "",
            jurisdiction
        );
    }
    
    /**
     * @dev Revoke multiple credentials in a single transaction
     * @param did DID that owns the credentials
     * @param credentialHashes Array of credential hashes to revoke
     * @param reason Reason for revocation
     */
    function revokeMultipleCredentials(
        string memory did,
        string[] memory credentialHashes,
        string memory reason
    ) external onlyAuthorizedIssuer validDID(did) {
        require(credentialHashes.length > 0, "Empty array");
        require(credentialHashes.length <= 10, "Too many credentials"); // Limit to prevent gas issues
        require(bytes(reason).length > 0, "Invalid reason");
        
        for (uint256 i = 0; i < credentialHashes.length; i++) {
            didCredentialStorage.revokeCredential(did, credentialHashes[i]);
        }
        
        // Create audit log for batch operation
        auditLogStorage.createSimpleAuditLog(
            address(0),
            "BATCH_CREDENTIALS_REVOKED",
            string(abi.encodePacked(
                "Batch of ",
                _uintToString(credentialHashes.length),
                " credentials revoked for DID: ",
                did,
                ", Reason: ",
                reason
            )),
            "",
            ""
        );
    }
    
    // ============ VIEW FUNCTIONS ============
    
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
