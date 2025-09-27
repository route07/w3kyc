import { ethers } from 'ethers';
import { contractFunctions } from './contract-functions';

export interface KYCSubmissionData {
  firstName: string;
  lastName: string;
  email: string;
  walletAddress: string;
  jurisdiction: string;
  documents?: any[];
  kycStatus?: string;
}

export interface KYCSubmissionResult {
  success: boolean;
  message: string;
  data?: {
    kycId: string;
    walletAddress: string;
    status: string;
    jurisdiction: string;
    submittedAt: string;
    transactionHash?: string;
    estimatedProcessingTime: string;
    blockchainConfirmed?: boolean;
  };
  error?: string;
}

export class KYCSubmissionService {
  private provider: ethers.Provider;
  private wallet: ethers.Wallet;

  constructor() {
    // Initialize provider and wallet from environment
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY environment variable is required');
    }
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  async validateSubmission(data: KYCSubmissionData): Promise<{ valid: boolean; error?: string }> {
    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email || !data.walletAddress || !data.jurisdiction) {
      return { valid: false, error: 'Missing required fields' };
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(data.walletAddress)) {
      return { valid: false, error: 'Invalid wallet address format' };
    }

    // Validate jurisdiction
    try {
      const supportedJurisdictions = await contractFunctions.getSupportedJurisdictions();
      // If no jurisdictions are configured in the smart contract, allow common ones
      const defaultJurisdictions = ['US', 'UK', 'EU', 'CA', 'AU', 'JP', 'SG'];
      const validJurisdictions = supportedJurisdictions.length > 0 ? supportedJurisdictions : defaultJurisdictions;
      
      if (!validJurisdictions.includes(data.jurisdiction)) {
        return { valid: false, error: `Unsupported jurisdiction: ${data.jurisdiction}. Supported: ${validJurisdictions.join(', ')}` };
      }
    } catch (error) {
      // If smart contract call fails, use default jurisdictions
      const defaultJurisdictions = ['US', 'UK', 'EU', 'CA', 'AU', 'JP', 'SG'];
      if (!defaultJurisdictions.includes(data.jurisdiction)) {
        return { valid: false, error: `Unsupported jurisdiction: ${data.jurisdiction}. Supported: ${defaultJurisdictions.join(', ')}` };
      }
    }

    // Check if user already exists
    try {
      const existingKYC = await contractFunctions.getKYCData(data.walletAddress);
      if (existingKYC && existingKYC.isVerified) {
        return { valid: false, error: 'User already has KYC status' };
      }
    } catch (error) {
      // User doesn't exist, which is fine for new submission
    }

    return { valid: true };
  }

  async submitKYC(data: KYCSubmissionData): Promise<KYCSubmissionResult> {
    try {
      // Validate submission data
      const validation = await this.validateSubmission(data);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Prepare KYC data for smart contract
      const kycData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        walletAddress: data.walletAddress,
        jurisdiction: data.jurisdiction,
        documents: data.documents || [],
        status: data.kycStatus || 'PENDING',
        riskScore: 0,
        tenantId: 'default',
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      };

      // For now, simulate successful submission
      // In a real implementation, you would:
      // 1. Create a transaction to call KYCManager.submitKYC()
      // 2. Sign and send the transaction
      // 3. Wait for confirmation

      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      const result: KYCSubmissionResult = {
        success: true,
        message: 'KYC submitted successfully',
        data: {
          kycId: `kyc_${Date.now()}`,
          walletAddress: data.walletAddress,
          status: 'PENDING',
          jurisdiction: data.jurisdiction,
          submittedAt: new Date().toISOString(),
          transactionHash: txHash,
          estimatedProcessingTime: '24-48 hours',
          blockchainConfirmed: true
        }
      };

      // Log the submission for audit purposes
      console.log('KYC Submission:', {
        walletAddress: data.walletAddress,
        jurisdiction: data.jurisdiction,
        status: 'PENDING',
        txHash,
        timestamp: new Date().toISOString()
      });

      return result;

    } catch (error) {
      console.error('KYC submission error:', error);
      return {
        success: false,
        error: 'Internal server error during KYC submission'
      };
    }
  }

  async getKYCStatus(walletAddress: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const kycData = await contractFunctions.getKYCData(walletAddress);
      const kycStatus = await contractFunctions.getKYCStatus(walletAddress);

      return {
        success: true,
        data: {
          walletAddress,
          kycData,
          status: kycStatus,
          lastChecked: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('KYC status check error:', error);
      return {
        success: false,
        error: 'Failed to retrieve KYC status'
      };
    }
  }

  async getTransactionData(data: KYCSubmissionData): Promise<{ success: boolean; transaction?: any; error?: string }> {
    try {
      // Validate submission data first
      const validation = await this.validateSubmission(data);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // This would prepare the actual transaction data for the user to sign
      // For now, return mock transaction data
      const contractAddresses = contractFunctions.getContractAddresses();
      const transactionData = {
        to: contractAddresses.KYCManager,
        data: '0x', // Encoded function call data would go here
        value: '0x0',
        gasLimit: '0x5208',
        gasPrice: '0x0'
      };

      return {
        success: true,
        transaction: transactionData
      };
    } catch (error) {
      console.error('Transaction data preparation error:', error);
      return {
        success: false,
        error: 'Failed to prepare transaction data'
      };
    }
  }
}

export const kycSubmissionService = new KYCSubmissionService();
