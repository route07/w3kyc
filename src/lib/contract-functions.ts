import { ethers } from 'ethers';
import { getContractAddresses, provider } from './blockchain';

// Contract function interfaces
export interface KYCData {
  isVerified: boolean;
  verificationHash: string;
  verificationDate: bigint;
  riskScore: bigint;
  isActive: boolean;
  expiresAt: bigint;
  linkedWallet: string;
  jurisdiction: string;
  tenantId: string;
}

export interface AuditLog {
  user: string;
  action: string;
  jurisdiction: string;
  tenantId: string;
  timestamp: bigint;
  details: string;
}

export interface MultisigConfig {
  isEnabled: boolean;
  requiredSignatures: bigint;
  timelockDuration: bigint;
  isActive: boolean;
}

export interface PendingOperation {
  target: string;
  data: string;
  timestamp: bigint;
  requiredSignatures: bigint;
  timelockExpiry: bigint;
  signatureCount: bigint;
  executed: boolean;
}

// Contract interaction service
export class ContractFunctionsService {
  private addresses: any;
  private contracts: Map<string, ethers.Contract> = new Map();

  constructor() {
    this.addresses = getContractAddresses();
    this.initializeContracts();
  }

  private initializeContracts() {
    // Initialize KYCDataStorage contract
    const kycDataStorageABI = [
      'function getKYCData(address user) external view returns (tuple(bool isVerified, string verificationHash, uint256 verificationDate, uint256 riskScore, bool isActive, uint256 expiresAt, address linkedWallet, string jurisdiction, string tenantId))',
      'function getKYCStatus(address user) external view returns (bool isVerified, bool isActive, bool isExpired)',
      'function getLinkedWallets(address user) external view returns (address[])',
      'function getTenantUsers(string tenantId) external view returns (address[])',
      'function getKYCConfig() external view returns (tuple(uint256 defaultExpiryDuration, uint256 maxRiskScore, bool allowMultipleWallets, uint256 maxWalletsPerUser, bool requireJurisdictionMatch))',
      'function owner() external view returns (address)',
      'function VERSION() external view returns (uint256)'
    ];
    this.contracts.set('KYCDataStorage', new ethers.Contract(
      this.addresses.KYCDataStorage,
      kycDataStorageABI,
      provider
    ));

    // Initialize KYCManager contract
    const kycManagerABI = [
      'function getKYCData(address user) external view returns (tuple(bool isVerified, string verificationHash, uint256 verificationDate, uint256 riskScore, bool isActive, uint256 expiresAt, address linkedWallet, string jurisdiction, string tenantId))',
      'function getKYCStatus(address user) external view returns (bool isVerified, bool isActive, bool isExpired)',
      'function getLinkedWallets(address user) external view returns (address[])',
      'function getRecentUserAuditLogs(address user, uint256 limit) external view returns (tuple(address user, string action, string jurisdiction, string tenantId, uint256 timestamp, string details)[])',
      'function getTenantAuditLogs(string tenantId, uint256 limit) external view returns (tuple(address user, string action, string jurisdiction, string tenantId, uint256 timestamp, string details)[])',
      'function owner() external view returns (address)',
      'function VERSION() external view returns (uint256)'
    ];
    this.contracts.set('KYCManager', new ethers.Contract(
      this.addresses.KYCManager,
      kycManagerABI,
      provider
    ));

    // Initialize MultisigManager contract
    const multisigManagerABI = [
      'function getMultisigConfig(string functionName) external view returns (tuple(bool isEnabled, uint256 requiredSignatures, uint256 timelockDuration, bool isActive))',
      'function getPendingOperations() external view returns (bytes32[])',
      'function getOperationDetails(bytes32 operationId) external view returns (tuple(address target, bytes data, uint256 timestamp, uint256 requiredSignatures, uint256 timelockExpiry, uint256 signatureCount, bool executed))',
      'function getAuthorizedSignerCount() external view returns (uint256)',
      'function canExecuteOperation(bytes32 operationId) external view returns (bool)',
      'function owner() external view returns (address)',
      'function VERSION() external view returns (uint256)'
    ];
    this.contracts.set('MultisigManager', new ethers.Contract(
      this.addresses.MultisigManager,
      multisigManagerABI,
      provider
    ));

    // Initialize AuditLogStorage contract
    const auditLogStorageABI = [
      'function getAuditLogs(address user, uint256 limit) external view returns (tuple(address user, string action, string jurisdiction, string tenantId, uint256 timestamp, string details)[])',
      'function getAuditLogsByDateRange(address user, uint256 startDate, uint256 endDate) external view returns (tuple(address user, string action, string jurisdiction, string tenantId, uint256 timestamp, string details)[])',
      'function getAuditStatistics() external view returns (tuple(uint256 totalLogs, uint256 uniqueUsers, uint256 uniqueTenants, uint256 uniqueJurisdictions))',
      'function owner() external view returns (address)',
      'function VERSION() external view returns (uint256)'
    ];
    this.contracts.set('AuditLogStorage', new ethers.Contract(
      this.addresses.AuditLogStorage,
      auditLogStorageABI,
      provider
    ));

    // Initialize DIDManager contract
    const didManagerABI = [
      'function getDIDCredentials(string did) external view returns (tuple(string credentialHash, string credentialType, string jurisdiction, uint256 issuedAt, uint256 expiresAt, bool isRevoked)[])',
      'function getDIDStatus(string did) external view returns (bool isActive, bool isVerified)',
      'function getCredentialTypes() external view returns (string[])',
      'function owner() external view returns (address)',
      'function VERSION() external view returns (uint256)'
    ];
    this.contracts.set('DIDManager', new ethers.Contract(
      this.addresses.DIDManager,
      didManagerABI,
      provider
    ));

    // Initialize ComplianceChecker contract
    const complianceCheckerABI = [
      'function checkCompliance(address user, string jurisdiction) external view returns (bool isCompliant, string[] violations)',
      'function getJurisdictionRules(string jurisdiction) external view returns (tuple(string[] requiredDocuments, uint256 maxRiskScore, uint256 validityPeriod))',
      'function getSupportedJurisdictions() external view returns (string[])',
      'function owner() external view returns (address)',
      'function VERSION() external view returns (uint256)'
    ];
    this.contracts.set('ComplianceChecker', new ethers.Contract(
      this.addresses.ComplianceChecker,
      complianceCheckerABI,
      provider
    ));
  }

  // KYC Data Functions
  async getKYCData(userAddress: string): Promise<KYCData | null> {
    try {
      const contract = this.contracts.get('KYCDataStorage');
      if (!contract) throw new Error('KYCDataStorage contract not initialized');
      
      const data = await contract.getKYCData(userAddress);
      return {
        isVerified: data.isVerified,
        verificationHash: data.verificationHash,
        verificationDate: data.verificationDate,
        riskScore: data.riskScore,
        isActive: data.isActive,
        expiresAt: data.expiresAt,
        linkedWallet: data.linkedWallet,
        jurisdiction: data.jurisdiction,
        tenantId: data.tenantId
      };
    } catch (error) {
      console.error('Error getting KYC data:', error);
      return null;
    }
  }

  async getKYCStatus(userAddress: string): Promise<{isVerified: boolean, isActive: boolean, isExpired: boolean} | null> {
    try {
      const contract = this.contracts.get('KYCDataStorage');
      if (!contract) throw new Error('KYCDataStorage contract not initialized');
      
      const status = await contract.getKYCStatus(userAddress);
      return {
        isVerified: status.isVerified,
        isActive: status.isActive,
        isExpired: status.isExpired
      };
    } catch (error) {
      console.error('Error getting KYC status:', error);
      return null;
    }
  }

  async getLinkedWallets(userAddress: string): Promise<string[]> {
    try {
      const contract = this.contracts.get('KYCDataStorage');
      if (!contract) throw new Error('KYCDataStorage contract not initialized');
      
      return await contract.getLinkedWallets(userAddress);
    } catch (error) {
      console.error('Error getting linked wallets:', error);
      return [];
    }
  }

  // Audit Log Functions
  async getRecentUserAuditLogs(userAddress: string, limit: number = 10): Promise<AuditLog[]> {
    try {
      const contract = this.contracts.get('KYCManager');
      if (!contract) {
        console.warn('KYCManager contract not initialized, returning empty audit logs');
        return [];
      }
      
      try {
        const logs = await contract.getRecentUserAuditLogs(userAddress, limit);
        
        // Check if logs is valid
        if (!logs || !Array.isArray(logs)) {
          console.warn('KYCManager returned invalid audit logs, returning empty array');
          return [];
        }
        
        return logs.map((log: any) => ({
          user: log.user || '',
          action: log.action || '',
          jurisdiction: log.jurisdiction || '',
          tenantId: log.tenantId || '',
          timestamp: log.timestamp ? Number(log.timestamp) : 0,
          details: log.details || ''
        }));
      } catch (contractError) {
        console.warn('KYCManager audit logs function call failed, returning empty array:', contractError.message);
        return [];
      }
    } catch (error) {
      console.warn('Error getting audit logs, returning empty array:', error.message);
      return [];
    }
  }

  async getAuditStatistics(): Promise<{totalLogs: number, uniqueUsers: number, uniqueTenants: number, uniqueJurisdictions: number} | null> {
    try {
      const contract = this.contracts.get('AuditLogStorage');
      if (!contract) {
        console.warn('AuditLogStorage contract not initialized, returning default stats');
        return {
          totalLogs: 0,
          uniqueUsers: 0,
          uniqueTenants: 0,
          uniqueJurisdictions: 0
        };
      }
      
      try {
        const stats = await contract.getAuditStatistics();
        
        // Convert BigInt to number for JSON serialization
        return {
          totalLogs: stats.totalLogs ? Number(stats.totalLogs) : 0,
          uniqueUsers: stats.uniqueUsers ? Number(stats.uniqueUsers) : 0,
          uniqueTenants: stats.uniqueTenants ? Number(stats.uniqueTenants) : 0,
          uniqueJurisdictions: stats.uniqueJurisdictions ? Number(stats.uniqueJurisdictions) : 0
        };
      } catch (contractError) {
        console.warn('AuditLogStorage function call failed, returning default stats:', contractError.message);
        return {
          totalLogs: 0,
          uniqueUsers: 0,
          uniqueTenants: 0,
          uniqueJurisdictions: 0
        };
      }
    } catch (error) {
      console.warn('Error getting audit statistics, returning default stats:', error.message);
      return {
        totalLogs: 0,
        uniqueUsers: 0,
        uniqueTenants: 0,
        uniqueJurisdictions: 0
      };
    }
  }

  // Multisig Functions
  async getMultisigConfig(functionName: string): Promise<MultisigConfig | null> {
    try {
      const contract = this.contracts.get('MultisigManager');
      if (!contract) {
        console.warn('MultisigManager contract not initialized');
        return {
          isEnabled: false,
          requiredSignatures: 1,
          timelockDuration: 0,
          isActive: false
        };
      }
      
      // Check if the contract has the function
      try {
        const config = await contract.getMultisigConfig(functionName);
        
        // Check if config is valid (not empty)
        if (!config || config.requiredSignatures === undefined) {
          console.warn('MultisigManager returned empty config, using defaults');
          return {
            isEnabled: false,
            requiredSignatures: 1,
            timelockDuration: 0,
            isActive: false
          };
        }
        
        return {
          isEnabled: config.isEnabled,
          requiredSignatures: config.requiredSignatures,
          timelockDuration: config.timelockDuration,
          isActive: config.isActive
        };
      } catch (contractError) {
        console.warn('MultisigManager function call failed, using defaults:', contractError.message);
        return {
          isEnabled: false,
          requiredSignatures: 1,
          timelockDuration: 0,
          isActive: false
        };
      }
    } catch (error) {
      console.error('Error getting multisig config:', error);
      return {
        isEnabled: false,
        requiredSignatures: 1,
        timelockDuration: 0,
        isActive: false
      };
    }
  }

  async getPendingOperations(): Promise<string[]> {
    try {
      const contract = this.contracts.get('MultisigManager');
      if (!contract) {
        console.warn('MultisigManager contract not initialized');
        return [];
      }
      
      return await contract.getPendingOperations();
    } catch (error) {
      console.warn('Error getting pending operations, returning empty array:', error.message);
      return [];
    }
  }

  async getAuthorizedSignerCount(): Promise<number> {
    try {
      const contract = this.contracts.get('MultisigManager');
      if (!contract) {
        console.warn('MultisigManager contract not initialized, returning 0 signers');
        return 0;
      }
      
      try {
        const count = await contract.getAuthorizedSignerCount();
        return count ? Number(count) : 0;
      } catch (contractError) {
        console.warn('MultisigManager signer count function call failed, returning 0:', contractError.message);
        return 0;
      }
    } catch (error) {
      console.warn('Error getting authorized signer count, returning 0:', error.message);
      return 0;
    }
  }

  // DID Functions
  async getDIDCredentials(did: string): Promise<any[]> {
    try {
      const contract = this.contracts.get('DIDManager');
      if (!contract) throw new Error('DIDManager contract not initialized');
      
      return await contract.getDIDCredentials(did);
    } catch (error) {
      console.error('Error getting DID credentials:', error);
      return [];
    }
  }

  // Compliance Functions
  async checkCompliance(userAddress: string, jurisdiction: string): Promise<{isCompliant: boolean, violations: string[]} | null> {
    try {
      const contract = this.contracts.get('ComplianceChecker');
      if (!contract) throw new Error('ComplianceChecker contract not initialized');
      
      const result = await contract.checkCompliance(userAddress, jurisdiction);
      return {
        isCompliant: result.isCompliant,
        violations: result.violations
      };
    } catch (error) {
      console.error('Error checking compliance:', error);
      return null;
    }
  }

  async getSupportedJurisdictions(): Promise<string[]> {
    try {
      const contract = this.contracts.get('ComplianceChecker');
      if (!contract) throw new Error('ComplianceChecker contract not initialized');
      
      return await contract.getSupportedJurisdictions();
    } catch (error) {
      console.error('Error getting supported jurisdictions:', error);
      return [];
    }
  }

  // Utility Functions
  async getContractInfo(contractName: string): Promise<{owner: string, version: string} | null> {
    try {
      const contract = this.contracts.get(contractName);
      if (!contract) throw new Error(`${contractName} contract not initialized`);
      
      const [owner, version] = await Promise.all([
        contract.owner(),
        contract.VERSION()
      ]);
      
      return {
        owner,
        version: version.toString()
      };
    } catch (error) {
      console.error(`Error getting ${contractName} info:`, error);
      return null;
    }
  }

  // Get all contract addresses
  getContractAddresses() {
    return this.addresses;
  }
}

// Singleton instance
export const contractFunctions = new ContractFunctionsService();