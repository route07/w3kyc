import { ethers } from 'ethers';
import { getContractAddresses, provider } from './blockchain';

// Web3 KYC Service for blockchain integration
export class Web3KYCService {
  private addresses: any;
  private contracts: Map<string, ethers.Contract> = new Map();
  private signer: ethers.Signer | null = null;

  constructor() {
    this.addresses = getContractAddresses();
    this.initializeContracts();
  }

  // Set signer for write operations
  setSigner(signer: ethers.Signer) {
    this.signer = signer;
    this.updateContractsWithSigner();
  }

  private initializeContracts() {
    // KYCManager ABI for write operations
    const kycManagerABI = [
      'function verifyKYC(address user, string memory verificationHash, uint256 riskScore, string memory jurisdiction, string memory tenantId) external',
      'function updateKYCStatus(address user, bool isActive, string memory reason) external',
      'function updateRiskScore(address user, uint256 newRiskScore, string memory reason) external',
      'function extendKYCExpiry(address user, uint256 additionalTime, string memory reason) external',
      'function linkWallet(address user, address wallet) external',
      'function unlinkWallet(address user, address wallet) external',
      'function setAuthorizedWriter(address writer, bool authorized) external',
      'function getKYCData(address user) external view returns (tuple(bool isVerified, string verificationHash, uint256 verificationDate, uint256 riskScore, bool isActive, uint256 expiresAt, address linkedWallet, string jurisdiction, string tenantId))',
      'function getKYCStatus(address user) external view returns (bool isVerified, bool isActive, bool isExpired)',
      'function getLinkedWallets(address user) external view returns (address[])',
      'function getRecentUserAuditLogs(address user, uint256 count) external view returns (tuple(address user, string action, string jurisdiction, string tenantId, uint256 timestamp, string details)[])',
      'function isKYCValid(address user) external view returns (bool)',
      'function isAuthorizedWriter(address writer) external view returns (bool)',
      'function owner() external view returns (address)',
      'function VERSION() external view returns (uint256)',
      'function CONTRACT_NAME() external view returns (string)'
    ];

    this.contracts.set('KYCManager', new ethers.Contract(
      this.addresses.KYCManager || ethers.ZeroAddress,
      kycManagerABI,
      provider
    ));

    // DIDManager ABI for credential operations
    const didManagerABI = [
      'function issueCredential(string memory did, string memory credentialType, string memory credentialHash, string memory jurisdiction, string[] memory attributes) external',
      'function revokeCredential(string memory did, string memory credentialHash, string memory reason) external',
      'function verifyCredential(string memory did, string memory credentialHash) external view returns (bool isValid, bool isExpired, bool isRevoked)',
      'function linkDIDToAddress(string memory did, address address_) external',
      'function unlinkDIDFromAddress(string memory did, address address_) external',
      'function getDIDCredentials(string memory did) external view returns (tuple(string credentialHash, string credentialType, string jurisdiction, uint256 issuedAt, uint256 expiresAt, bool isRevoked)[])',
      'function getDIDCredentialsByType(string memory did, string memory credentialType) external view returns (tuple(string credentialHash, string credentialType, string jurisdiction, uint256 issuedAt, uint256 expiresAt, bool isRevoked)[])',
      'function getValidDIDCredentialsByType(string memory did, string memory credentialType) external view returns (tuple(string credentialHash, string credentialType, string jurisdiction, uint256 issuedAt, uint256 expiresAt, bool isRevoked)[])',
      'function hasValidCredential(string memory did, string memory credentialType) external view returns (bool)',
      'function getDIDForAddress(address address_) external view returns (string)',
      'function getAddressesForDID(string memory did) external view returns (address[])',
      'function getCredentialCount(string memory did) external view returns (uint256)',
      'function setAuthorizedWriter(address writer, bool authorized) external',
      'function setAuthorizedIssuer(address issuer, bool authorized) external',
      'function isAuthorizedWriter(address writer) external view returns (bool)',
      'function isAuthorizedIssuer(address issuer) external view returns (bool)',
      'function owner() external view returns (address)',
      'function VERSION() external view returns (uint256)',
      'function CONTRACT_NAME() external view returns (string)'
    ];

    this.contracts.set('DIDManager', new ethers.Contract(
      this.addresses.DIDManager || ethers.ZeroAddress,
      didManagerABI,
      provider
    ));
  }

  private updateContractsWithSigner() {
    if (!this.signer) return;

    // Update contracts with signer for write operations
    this.contracts.forEach((contract, name) => {
      this.contracts.set(name, contract.connect(this.signer!));
    });
  }

  // ============ KYC VERIFICATION FUNCTIONS ============

  /**
   * Verify KYC on blockchain
   */
  async verifyKYC(
    userAddress: string,
    verificationHash: string,
    riskScore: number,
    jurisdiction: string,
    tenantId: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.signer) {
        throw new Error('No signer available. Please connect wallet.');
      }

      const contract = this.contracts.get('KYCManager');
      if (!contract || contract.target === ethers.ZeroAddress) {
        throw new Error('KYCManager contract not deployed');
      }

      console.log('🔐 Verifying KYC on blockchain...', {
        userAddress,
        verificationHash,
        riskScore,
        jurisdiction,
        tenantId
      });

      const tx = await contract.verifyKYC(
        userAddress,
        verificationHash,
        riskScore,
        jurisdiction,
        tenantId,
        {
          gasLimit: 500000,
          gasPrice: ethers.parseUnits('1', 'gwei')
        }
      );

      console.log('⏳ Transaction submitted:', tx.hash);
      const receipt = await tx.wait();
      console.log('✅ KYC verification confirmed:', receipt.hash);

      return {
        success: true,
        txHash: receipt.hash
      };
    } catch (error) {
      console.error('❌ KYC verification failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update KYC status
   */
  async updateKYCStatus(
    userAddress: string,
    isActive: boolean,
    reason: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.signer) {
        throw new Error('No signer available. Please connect wallet.');
      }

      const contract = this.contracts.get('KYCManager');
      if (!contract || contract.target === ethers.ZeroAddress) {
        throw new Error('KYCManager contract not deployed');
      }

      const tx = await contract.updateKYCStatus(userAddress, isActive, reason, {
        gasLimit: 300000,
        gasPrice: ethers.parseUnits('1', 'gwei')
      });

      const receipt = await tx.wait();
      return {
        success: true,
        txHash: receipt.hash
      };
    } catch (error) {
      console.error('❌ KYC status update failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Link wallet to user
   */
  async linkWallet(
    userAddress: string,
    walletAddress: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.signer) {
        throw new Error('No signer available. Please connect wallet.');
      }

      const contract = this.contracts.get('KYCManager');
      if (!contract || contract.target === ethers.ZeroAddress) {
        throw new Error('KYCManager contract not deployed');
      }

      const tx = await contract.linkWallet(userAddress, walletAddress, {
        gasLimit: 200000,
        gasPrice: ethers.parseUnits('1', 'gwei')
      });

      const receipt = await tx.wait();
      return {
        success: true,
        txHash: receipt.hash
      };
    } catch (error) {
      console.error('❌ Wallet linking failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ============ DID CREDENTIAL FUNCTIONS ============

  /**
   * Issue DID credential
   */
  async issueCredential(
    did: string,
    credentialType: string,
    credentialHash: string,
    jurisdiction: string,
    attributes: string[]
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.signer) {
        throw new Error('No signer available. Please connect wallet.');
      }

      const contract = this.contracts.get('DIDManager');
      if (!contract || contract.target === ethers.ZeroAddress) {
        throw new Error('DIDManager contract not deployed');
      }

      console.log('🎫 Issuing DID credential...', {
        did,
        credentialType,
        credentialHash,
        jurisdiction,
        attributes
      });

      const tx = await contract.issueCredential(
        did,
        credentialType,
        credentialHash,
        jurisdiction,
        attributes,
        {
          gasLimit: 500000,
          gasPrice: ethers.parseUnits('1', 'gwei')
        }
      );

      console.log('⏳ Credential issuance transaction:', tx.hash);
      const receipt = await tx.wait();
      console.log('✅ Credential issued successfully:', receipt.hash);

      return {
        success: true,
        txHash: receipt.hash
      };
    } catch (error) {
      console.error('❌ Credential issuance failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Link DID to address
   */
  async linkDIDToAddress(
    did: string,
    address: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.signer) {
        throw new Error('No signer available. Please connect wallet.');
      }

      const contract = this.contracts.get('DIDManager');
      if (!contract || contract.target === ethers.ZeroAddress) {
        throw new Error('DIDManager contract not deployed');
      }

      const tx = await contract.linkDIDToAddress(did, address, {
        gasLimit: 200000,
        gasPrice: ethers.parseUnits('1', 'gwei')
      });

      const receipt = await tx.wait();
      return {
        success: true,
        txHash: receipt.hash
      };
    } catch (error) {
      console.error('❌ DID linking failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ============ READ FUNCTIONS ============

  /**
   * Get KYC data from blockchain
   */
  async getKYCData(userAddress: string): Promise<any | null> {
    try {
      const contract = this.contracts.get('KYCManager');
      if (!contract || contract.target === ethers.ZeroAddress) {
        console.warn('KYCManager contract not deployed');
        return null;
      }

      const data = await contract.getKYCData(userAddress);
      return {
        isVerified: data.isVerified,
        verificationHash: data.verificationHash,
        verificationDate: Number(data.verificationDate),
        riskScore: Number(data.riskScore),
        isActive: data.isActive,
        expiresAt: Number(data.expiresAt),
        linkedWallet: data.linkedWallet,
        jurisdiction: data.jurisdiction,
        tenantId: data.tenantId
      };
    } catch (error) {
      console.error('❌ Error getting KYC data:', error);
      return null;
    }
  }

  /**
   * Get KYC status from blockchain
   */
  async getKYCStatus(userAddress: string): Promise<{isVerified: boolean, isActive: boolean, isExpired: boolean} | null> {
    try {
      const contract = this.contracts.get('KYCManager');
      if (!contract || contract.target === ethers.ZeroAddress) {
        console.warn('KYCManager contract not deployed');
        return null;
      }

      const status = await contract.getKYCStatus(userAddress);
      return {
        isVerified: status.isVerified,
        isActive: status.isActive,
        isExpired: status.isExpired
      };
    } catch (error) {
      console.error('❌ Error getting KYC status:', error);
      return null;
    }
  }

  /**
   * Get DID credentials
   */
  async getDIDCredentials(did: string): Promise<any[]> {
    try {
      const contract = this.contracts.get('DIDManager');
      if (!contract || contract.target === ethers.ZeroAddress) {
        console.warn('DIDManager contract not deployed');
        return [];
      }

      const credentials = await contract.getDIDCredentials(did);
      return credentials.map((cred: any) => ({
        credentialHash: cred.credentialHash,
        credentialType: cred.credentialType,
        jurisdiction: cred.jurisdiction,
        issuedAt: Number(cred.issuedAt),
        expiresAt: Number(cred.expiresAt),
        isRevoked: cred.isRevoked
      }));
    } catch (error) {
      console.error('❌ Error getting DID credentials:', error);
      return [];
    }
  }

  /**
   * Check if user is authorized to write
   */
  async isAuthorizedWriter(address: string): Promise<boolean> {
    try {
      const contract = this.contracts.get('KYCManager');
      if (!contract || contract.target === ethers.ZeroAddress) {
        return false;
      }

      return await contract.isAuthorizedWriter(address);
    } catch (error) {
      console.error('❌ Error checking authorization:', error);
      return false;
    }
  }

  // ============ UTILITY FUNCTIONS ============

  /**
   * Check if contracts are deployed
   */
  async checkContractStatus(): Promise<{
    kycManager: boolean, 
    didManager: boolean,
    authorizationManager: boolean,
    complianceChecker: boolean,
    versionManager: boolean,
    jurisdictionConfig: boolean,
    featureFlags: boolean,
    credentialTypeManager: boolean,
    multisigModifier: boolean,
    emergencyManager: boolean,
    governanceManager: boolean,
    multisigExample: boolean
  }> {
    return {
      kycManager: this.addresses.KYCManager !== '0x0000000000000000000000000000000000000000',
      didManager: this.addresses.DIDManager !== '0x0000000000000000000000000000000000000000',
      authorizationManager: process.env.NEXT_PUBLIC_AUTHORIZATIONMANAGER_ADDRESS !== '0x0000000000000000000000000000000000000000',
      complianceChecker: process.env.NEXT_PUBLIC_COMPLIANCECHECKER_ADDRESS !== '0x0000000000000000000000000000000000000000',
      versionManager: process.env.NEXT_PUBLIC_VERSIONMANAGER_ADDRESS !== '0x0000000000000000000000000000000000000000',
      jurisdictionConfig: process.env.NEXT_PUBLIC_JURISDICTIONCONFIG_ADDRESS !== '0x0000000000000000000000000000000000000000',
      featureFlags: process.env.NEXT_PUBLIC_FEATUREFLAGS_ADDRESS !== '0x0000000000000000000000000000000000000000',
      credentialTypeManager: process.env.NEXT_PUBLIC_CREDENTIALTYPEMANAGER_ADDRESS !== '0x0000000000000000000000000000000000000000',
      multisigModifier: process.env.NEXT_PUBLIC_MULTISIGMODIFIER_ADDRESS !== '0x0000000000000000000000000000000000000000',
      emergencyManager: process.env.NEXT_PUBLIC_EMERGENCYMANAGER_ADDRESS !== '0x0000000000000000000000000000000000000000',
      governanceManager: process.env.NEXT_PUBLIC_GOVERNANCEMANAGER_ADDRESS !== '0x0000000000000000000000000000000000000000',
      multisigExample: process.env.NEXT_PUBLIC_MULTISIGEXAMPLE_ADDRESS !== '0x0000000000000000000000000000000000000000'
    };
  }

  /**
   * Get contract addresses
   */
  getContractAddresses() {
    return {
      kycManager: this.addresses.KYCManager,
      didManager: this.addresses.DIDManager
    };
  }
}

// Singleton instance
export const web3KYCService = new Web3KYCService();