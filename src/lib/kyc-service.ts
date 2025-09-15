import { 
  getDeployedKYCDataStorage,
  getDeployedKYCDataStorageWithSigner,
  getDeployedKYCManager,
  getDeployedKYCManagerWithSigner,
  storeKYCDataOnChain,
  getKYCDataFromChain,
  verifyKYCOnChain,
  getKYCStatusFromChain,
  waitForTransaction,
  getNetworkInfo
} from './blockchain';

export interface KYCData {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  nationality: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  documents: Array<{
    id: string;
    name: string;
    type: string;
    ipfsHash: string;
    uploadedAt: string;
    status: 'pending' | 'verified' | 'rejected';
  }>;
  riskScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  status: 'not_started' | 'pending' | 'in_progress' | 'approved' | 'rejected' | 'verified' | 'expired';
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  blockchainStatus: {
    onChainVerification: boolean;
    verificationHash?: string;
    blockNumber?: number;
    transactionHash?: string;
  };
}

export interface KYCStatus {
  isVerified: boolean;
  verificationHash: string;
  verificationDate: bigint;
  riskScore: bigint;
  isActive: boolean;
  expiresAt: bigint;
}

export class KYCService {
  /**
   * Store KYC data on blockchain
   */
  static async storeKYCData(userAddress: string, dataHash: string): Promise<{
    success: boolean;
    transactionHash?: string;
    blockNumber?: number;
    error?: string;
  }> {
    try {
      // Store on blockchain
      const tx = await storeKYCDataOnChain(userAddress, dataHash);
      const receipt = await waitForTransaction(tx);
      
      if (receipt) {
        return {
          success: true,
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber,
        };
      } else {
        return {
          success: false,
          error: 'Transaction failed to confirm',
        };
      }
    } catch (error) {
      console.error('Error storing KYC data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Store KYC data object on blockchain (converts to hash first)
   */
  static async storeKYCDataObject(userAddress: string, kycData: KYCData): Promise<{
    success: boolean;
    transactionHash?: string;
    blockNumber?: number;
    error?: string;
  }> {
    try {
      // Convert KYC data to hash (in real implementation, this would be IPFS hash)
      const dataHash = await this.generateDataHash(kycData);
      
      // Store on blockchain
      return await this.storeKYCData(userAddress, dataHash);
    } catch (error) {
      console.error('Error storing KYC data object:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get KYC data from blockchain
   */
  static async getKYCData(userAddress: string): Promise<{
    success: boolean;
    data?: string;
    error?: string;
  }> {
    try {
      const dataHash = await getKYCDataFromChain(userAddress);
      return {
        success: true,
        data: dataHash,
      };
    } catch (error) {
      console.error('Error getting KYC data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verify KYC on blockchain
   */
  static async verifyKYC(
    userAddress: string, 
    verificationHash: string, 
    riskScore: number
  ): Promise<{
    success: boolean;
    transactionHash?: string;
    blockNumber?: number;
    error?: string;
  }> {
    try {
      const tx = await verifyKYCOnChain(userAddress, verificationHash, riskScore);
      const receipt = await waitForTransaction(tx);
      
      if (receipt) {
        return {
          success: true,
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber,
        };
      } else {
        return {
          success: false,
          error: 'Transaction failed to confirm',
        };
      }
    } catch (error) {
      console.error('Error verifying KYC:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get KYC status from blockchain
   */
  static async getKYCStatus(userAddress: string): Promise<{
    success: boolean;
    status?: KYCStatus;
    error?: string;
  }> {
    try {
      const status = await getKYCStatusFromChain(userAddress);
      return {
        success: true,
        status: {
          isVerified: status.isVerified,
          verificationHash: status.verificationHash,
          verificationDate: status.verificationDate,
          riskScore: status.riskScore,
          isActive: status.isActive,
          expiresAt: status.expiresAt,
        },
      };
    } catch (error) {
      console.error('Error getting KYC status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if user has valid KYC
   */
  static async isKYCValid(userAddress: string): Promise<{
    success: boolean;
    isValid?: boolean;
    error?: string;
  }> {
    try {
      const contract = getDeployedKYCManager();
      const isValid = await contract.isKYCValid(userAddress);
      return {
        success: true,
        isValid,
      };
    } catch (error) {
      console.error('Error checking KYC validity:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get network information
   */
  static async getNetworkInfo(): Promise<{
    success: boolean;
    networkInfo?: any;
    error?: string;
  }> {
    try {
      const networkInfo = await getNetworkInfo();
      return {
        success: true,
        networkInfo,
      };
    } catch (error) {
      console.error('Error getting network info:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate data hash for KYC data
   * In a real implementation, this would upload to IPFS and return the hash
   */
  private static async generateDataHash(kycData: KYCData): Promise<string> {
    // For now, create a simple hash of the data
    // In production, this would upload to IPFS and return the IPFS hash
    const dataString = JSON.stringify(kycData);
    const encoder = new TextEncoder();
    const data = encoder.encode(dataString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `0x${hashHex}`;
  }

  /**
   * Parse KYC data from hash
   * In a real implementation, this would fetch from IPFS
   */
  static async parseKYCDataFromHash(dataHash: string): Promise<KYCData | null> {
    try {
      // For now, return null as we're using simple hashes
      // In production, this would fetch from IPFS using the hash
      console.log('Parsing KYC data from hash:', dataHash);
      return null;
    } catch (error) {
      console.error('Error parsing KYC data:', error);
      return null;
    }
  }
}
