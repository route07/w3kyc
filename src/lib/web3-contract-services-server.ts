import { ethers } from 'ethers';
import { getContractAddresses } from './blockchain';

// Server-side only contract service for admin operations
// This should only be used in API routes or server-side components

// Contract ABI definitions for all 19 contracts
const CONTRACT_ABIS = {
  KYCManager: [
    "function verifyKYC(address user, string memory documentHash) external",
    "function updateKYCStatus(address user, uint8 status) external",
    "function getKYCStatus(address user) external view returns (uint8)",
    "function approveKYC(address user) external",
    "function rejectKYC(address user, string memory reason) external",
    "function getPendingKYCRequests() external view returns (address[])",
    "function getKYCStatistics() external view returns (uint256, uint256, uint256, uint256)"
  ],
  DIDManager: [
    "function createDID(address subject, string memory didDocument) external returns (bytes32)",
    "function updateDID(bytes32 didId, string memory didDocument) external",
    "function revokeDID(bytes32 didId) external",
    "function getDID(bytes32 didId) external view returns (string memory, bool)",
    "function getDIDsBySubject(address subject) external view returns (bytes32[])",
    "function issueCredential(bytes32 didId, string memory credentialType, string memory credentialData, uint256 expiresAt) external returns (bytes32)",
    "function verifyCredential(bytes32 credentialId) external view returns (bool)",
    "function revokeCredential(bytes32 credentialId) external"
  ],
  KYCDataStorage: [
    "function storeKYCData(address user, tuple(string firstName, string lastName, string email, string phone, string address, string documentType, string documentNumber, uint256 dateOfBirth, uint8 status, uint256 verifiedAt) data) external",
    "function getKYCData(address user) external view returns (tuple(string firstName, string lastName, string email, string phone, string address, string documentType, string documentNumber, uint256 dateOfBirth, uint8 status, uint256 verifiedAt))",
    "function updateKYCData(address user, tuple(string firstName, string lastName, string email, string phone, string address, string documentType, string documentNumber, uint256 dateOfBirth, uint8 status, uint256 verifiedAt) data) external",
    "function deleteKYCData(address user) external",
    "function isKYCVerified(address user) external view returns (bool)",
    "function getKYCStatus(address user) external view returns (uint8)",
    "function getAllKYCUsers() external view returns (address[])",
    "function getKYCStatistics() external view returns (uint256, uint256, uint256, uint256)"
  ],
  AuditLogStorage: [
    "function logEvent(address user, string memory eventType, string memory details) external",
    "function getUserAuditLogs(address user) external view returns (tuple(address user, string eventType, string details, uint256 timestamp)[])",
    "function getAuditLogsByType(string memory eventType) external view returns (tuple(address user, string eventType, string details, uint256 timestamp)[])",
    "function getRecentAuditLogs(uint256 count) external view returns (tuple(address user, string eventType, string details, uint256 timestamp)[])",
    "function getAuditStatistics() external view returns (uint256, uint256, uint256)",
    "function searchAuditLogs(string memory searchTerm) external view returns (tuple(address user, string eventType, string details, uint256 timestamp)[])"
  ],
  TenantConfigStorage: [
    "function setTenantConfig(string memory tenantId, tuple(string name, string description, bool isActive, uint256 createdAt, uint256 updatedAt) config) external",
    "function getTenantConfig(string memory tenantId) external view returns (tuple(string name, string description, bool isActive, uint256 createdAt, uint256 updatedAt))",
    "function updateTenantConfig(string memory tenantId, tuple(string name, string description, bool isActive, uint256 createdAt, uint256 updatedAt) config) external",
    "function deleteTenantConfig(string memory tenantId) external",
    "function getAllTenants() external view returns (string[])",
    "function isTenantActive(string memory tenantId) external view returns (bool)"
  ],
  DIDCredentialStorage: [
    "function storeCredential(bytes32 credentialId, address issuer, address subject, string memory credentialType, string memory credentialData, uint256 issuedAt, uint256 expiresAt) external",
    "function getCredential(bytes32 credentialId) external view returns (address, address, string memory, string memory, uint256, uint256, bool)",
    "function revokeCredential(bytes32 credentialId) external",
    "function isCredentialValid(bytes32 credentialId) external view returns (bool)",
    "function getCredentialsBySubject(address subject) external view returns (bytes32[])",
    "function getCredentialsByIssuer(address issuer) external view returns (bytes32[])"
  ],
  InputValidator: [
    "function validateAddress(address addr, string memory fieldName) external pure returns (bool)",
    "function validateString(string memory str, string memory fieldName) external pure returns (bool)",
    "function validateUint(uint256 value, string memory fieldName) external pure returns (bool)",
    "function validateEmail(string memory email) external pure returns (bool)",
    "function validatePhoneNumber(string memory phone) external pure returns (bool)"
  ],
  BoundsChecker: [
    "function checkBounds(uint256 value, uint256 min, uint256 max) external pure returns (bool)",
    "function validateRange(uint256 start, uint256 end) external pure returns (bool)",
    "function checkArrayBounds(uint256 index, uint256 arrayLength) external pure returns (bool)"
  ],
  VersionManager: [
    "function setVersion(string memory version) external",
    "function isVersionSupported(string memory version) external view returns (bool)",
    "function getCurrentVersion() external view returns (string memory)",
    "function getSupportedVersions() external view returns (string[] memory)"
  ],
  JurisdictionConfig: [
    "function addJurisdiction(string memory jurisdiction, string memory rules) external",
    "function isJurisdictionSupported(string memory jurisdiction) external view returns (bool)",
    "function getJurisdictionRules(string memory jurisdiction) external view returns (string memory)",
    "function updateJurisdictionRules(string memory jurisdiction, string memory rules) external"
  ],
  FeatureFlags: [
    "function setFeature(string memory feature, bool enabled) external",
    "function isFeatureEnabled(string memory feature) external view returns (bool)",
    "function getAllFeatures() external view returns (string[] memory)",
    "function getFeatureConfig(string memory feature) external view returns (tuple(bool enabled, uint256 rolloutPercentage, string category))"
  ],
  CredentialTypeManager: [
    "function addCredentialType(string memory credentialType) external",
    "function isCredentialTypeSupported(string memory credentialType) external view returns (bool)",
    "function getSupportedCredentialTypes() external view returns (string[] memory)",
    "function updateCredentialTypeConfig(string memory type, string memory config) external"
  ],
  MultisigManager: [
    "function addSigner(address signer) external",
    "function removeSigner(address signer) external",
    "function isAuthorizedSigner(address signer) external view returns (bool)",
    "function getSigners() external view returns (address[] memory)",
    "function getRequiredSignatures() external view returns (uint256)",
    "function setRequiredSignatures(uint256 required) external"
  ],
  MultisigModifier: [
    "function checkMultisigAuthorization(address signer) external view returns (bool)",
    "function getMultisigConfig() external view returns (address, uint256)"
  ],
  EmergencyManager: [
    "function activateEmergencyMode() external",
    "function deactivateEmergencyMode() external",
    "function isEmergencyMode() external view returns (bool)",
    "function getEmergencyStatus() external view returns (bool, uint256, address)"
  ],
  AuthorizationManager: [
    "function authorizeUser(address user) external",
    "function revokeUser(address user) external",
    "function isAuthorized(address user) external view returns (bool)",
    "function getAuthorizedUsers() external view returns (address[] memory)",
    "function setUserPermissions(address user, string[] memory permissions) external",
    "function getUserPermissions(address user) external view returns (string[] memory)"
  ],
  ComplianceChecker: [
    "function checkCompliance(address user, string memory tenantId) external view returns (bool)",
    "function checkCredentialCompliance(bytes32 credentialId) external view returns (bool)",
    "function getComplianceStatus(address user) external view returns (uint8)",
    "function getComplianceReport(address user) external view returns (tuple(bool kycVerified, bool credentialValid, bool tenantActive, uint256 score))",
    "function updateComplianceRules(string memory rules) external"
  ],
  GovernanceManager: [
    "function createProposal(string memory description, uint256 duration) external returns (uint256)",
    "function vote(uint256 proposalId, bool support) external",
    "function getProposal(uint256 proposalId) external view returns (tuple(string description, uint256 votesFor, uint256 votesAgainst, uint256 startTime, uint256 endTime, bool executed))",
    "function getActiveProposals() external view returns (uint256[] memory)",
    "function executeProposal(uint256 proposalId) external"
  ],
  MultisigExample: [
    "function updateConfig(uint256 value, string memory configString) external",
    "function toggleActive() external",
    "function getConfig() external view returns (uint256, string memory, bool)",
    "function isActive() external view returns (bool)"
  ]
};

// Server-side contract service class
export class Web3ContractServicesServer {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private contracts: Map<string, ethers.Contract> = new Map();

  constructor() {
    // Only initialize on server side
    if (typeof window !== 'undefined') {
      throw new Error('Web3ContractServicesServer can only be used on the server side');
    }

    this.provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    
    // Get private key from environment
    const privateKey = process.env.PRIVATE_KEY;
    
    if (!privateKey) {
      throw new Error('PRIVATE_KEY environment variable is required for server-side operations');
    }
    
    // Validate private key format
    if (!privateKey.startsWith('0x') || privateKey.length !== 66) {
      throw new Error(`Invalid private key format: ${privateKey.substring(0, 10)}...`);
    }
    
    try {
      this.signer = new ethers.Wallet(privateKey, this.provider);
      console.log('✅ Web3ContractServicesServer initialized with wallet:', this.signer.address);
    } catch (error) {
      console.error('❌ Failed to initialize server wallet:', error);
      throw new Error(`Invalid private key configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    this.initializeContracts();
  }

  private initializeContracts() {
    const addresses = getContractAddresses();
    
    // Initialize all contracts
    Object.entries(CONTRACT_ABIS).forEach(([name, abi]) => {
      const address = addresses[name as keyof typeof addresses] || 
                     process.env[`NEXT_PUBLIC_${name.toUpperCase()}_ADDRESS` as keyof typeof process.env];
      
      if (address && address !== '0x0000000000000000000000000000000000000000') {
        this.contracts.set(name, new ethers.Contract(address as string, abi, this.signer));
      }
    });
  }

  // KYCManager functions
  async verifyKYC(userAddress: string, documentHash: string) {
    const contract = this.contracts.get('KYCManager');
    if (!contract) throw new Error('KYCManager contract not available');
    
    return await contract.verifyKYC(userAddress, documentHash);
  }

  async updateKYCStatus(userAddress: string, status: number) {
    const contract = this.contracts.get('KYCManager');
    if (!contract) throw new Error('KYCManager contract not available');
    
    return await contract.updateKYCStatus(userAddress, status);
  }

  async getKYCStatus(userAddress: string) {
    const contract = this.contracts.get('KYCManager');
    if (!contract) throw new Error('KYCManager contract not available');
    
    return await contract.getKYCStatus(userAddress);
  }

  async approveKYC(userAddress: string) {
    const contract = this.contracts.get('KYCManager');
    if (!contract) throw new Error('KYCManager contract not available');
    
    return await contract.approveKYC(userAddress);
  }

  async rejectKYC(userAddress: string, reason: string) {
    const contract = this.contracts.get('KYCManager');
    if (!contract) throw new Error('KYCManager contract not available');
    
    return await contract.rejectKYC(userAddress, reason);
  }

  async getPendingKYCRequests() {
    const contract = this.contracts.get('KYCManager');
    if (!contract) throw new Error('KYCManager contract not available');
    
    return await contract.getPendingKYCRequests();
  }

  async getKYCStatistics() {
    const contract = this.contracts.get('KYCManager');
    if (!contract) throw new Error('KYCManager contract not available');
    
    return await contract.getKYCStatistics();
  }

  // DIDManager functions
  async createDID(subjectAddress: string, didDocument: string) {
    const contract = this.contracts.get('DIDManager');
    if (!contract) throw new Error('DIDManager contract not available');
    
    return await contract.createDID(subjectAddress, didDocument);
  }

  async updateDID(didId: string, didDocument: string) {
    const contract = this.contracts.get('DIDManager');
    if (!contract) throw new Error('DIDManager contract not available');
    
    return await contract.updateDID(didId, didDocument);
  }

  async revokeDID(didId: string) {
    const contract = this.contracts.get('DIDManager');
    if (!contract) throw new Error('DIDManager contract not available');
    
    return await contract.revokeDID(didId);
  }

  async getDID(didId: string) {
    const contract = this.contracts.get('DIDManager');
    if (!contract) throw new Error('DIDManager contract not available');
    
    return await contract.getDID(didId);
  }

  async getDIDsBySubject(subjectAddress: string) {
    const contract = this.contracts.get('DIDManager');
    if (!contract) throw new Error('DIDManager contract not available');
    
    return await contract.getDIDsBySubject(subjectAddress);
  }

  async issueCredential(didId: string, credentialType: string, credentialData: string, expiresAt: number) {
    const contract = this.contracts.get('DIDManager');
    if (!contract) throw new Error('DIDManager contract not available');
    
    return await contract.issueCredential(didId, credentialType, credentialData, expiresAt);
  }

  async verifyCredential(credentialId: string) {
    const contract = this.contracts.get('DIDManager');
    if (!contract) throw new Error('DIDManager contract not available');
    
    return await contract.verifyCredential(credentialId);
  }

  async revokeCredential(credentialId: string) {
    const contract = this.contracts.get('DIDManager');
    if (!contract) throw new Error('DIDManager contract not available');
    
    return await contract.revokeCredential(credentialId);
  }

  // Storage layer functions
  async storeKYCData(userAddress: string, kycData: any) {
    const contract = this.contracts.get('KYCDataStorage');
    if (!contract) throw new Error('KYCDataStorage contract not available');
    
    return await contract.storeKYCData(userAddress, kycData);
  }

  async getKYCData(userAddress: string) {
    const contract = this.contracts.get('KYCDataStorage');
    if (!contract) throw new Error('KYCDataStorage contract not available');
    
    return await contract.getKYCData(userAddress);
  }

  async logEvent(userAddress: string, eventType: string, details: string) {
    const contract = this.contracts.get('AuditLogStorage');
    if (!contract) throw new Error('AuditLogStorage contract not available');
    
    return await contract.logEvent(userAddress, eventType, details);
  }

  async getUserAuditLogs(userAddress: string) {
    const contract = this.contracts.get('AuditLogStorage');
    if (!contract) throw new Error('AuditLogStorage contract not available');
    
    return await contract.getUserAuditLogs(userAddress);
  }

  // Utility functions
  async validateEmail(email: string) {
    const contract = this.contracts.get('InputValidator');
    if (!contract) throw new Error('InputValidator contract not available');
    
    return await contract.validateEmail(email);
  }

  async isFeatureEnabled(feature: string) {
    const contract = this.contracts.get('FeatureFlags');
    if (!contract) throw new Error('FeatureFlags contract not available');
    
    return await contract.isFeatureEnabled(feature);
  }

  async setFeature(feature: string, enabled: boolean) {
    const contract = this.contracts.get('FeatureFlags');
    if (!contract) throw new Error('FeatureFlags contract not available');
    
    return await contract.setFeature(feature, enabled);
  }

  // System functions
  async isEmergencyMode() {
    const contract = this.contracts.get('EmergencyManager');
    if (!contract) throw new Error('EmergencyManager contract not available');
    
    return await contract.isEmergencyMode();
  }

  async activateEmergencyMode() {
    const contract = this.contracts.get('EmergencyManager');
    if (!contract) throw new Error('EmergencyManager contract not available');
    
    return await contract.activateEmergencyMode();
  }

  // Compliance functions
  async checkCompliance(userAddress: string, tenantId: string) {
    const contract = this.contracts.get('ComplianceChecker');
    if (!contract) throw new Error('ComplianceChecker contract not available');
    
    return await contract.checkCompliance(userAddress, tenantId);
  }

  // Governance functions
  async createProposal(description: string, duration: number) {
    const contract = this.contracts.get('GovernanceManager');
    if (!contract) throw new Error('GovernanceManager contract not available');
    
    return await contract.createProposal(description, duration);
  }

  async vote(proposalId: number, support: boolean) {
    const contract = this.contracts.get('GovernanceManager');
    if (!contract) throw new Error('GovernanceManager contract not available');
    
    return await contract.vote(proposalId, support);
  }

  // Get contract status
  getContractStatus() {
    const status: Record<string, boolean> = {};
    this.contracts.forEach((contract, name) => {
      status[name] = contract.target !== ethers.ZeroAddress;
    });
    return status;
  }

  // Get all available contracts
  getAvailableContracts() {
    return Array.from(this.contracts.keys());
  }
}

// Export singleton instance for server-side use
let serverInstance: Web3ContractServicesServer | null = null;

export function getWeb3ContractServicesServer(): Web3ContractServicesServer {
  if (!serverInstance) {
    serverInstance = new Web3ContractServicesServer();
  }
  return serverInstance;
}