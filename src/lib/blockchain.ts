import { ethers } from 'ethers';

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID!;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL!;
const PRIVATE_KEY = process.env.PRIVATE_KEY!;

if (!CHAIN_ID || !RPC_URL) {
  throw new Error('Blockchain configuration missing in environment variables');
}

// Provider for read-only operations
export const provider = new ethers.JsonRpcProvider(RPC_URL);

// Signer for transactions (requires private key)
export function getSigner(): ethers.Wallet {
  if (!PRIVATE_KEY) {
    throw new Error('Private key required for transactions');
  }
  return new ethers.Wallet(PRIVATE_KEY, provider);
}

// Contract ABI for KYC verification
export const KYC_ABI = [
  // Events
  'event KYCVerified(address indexed user, string verificationHash, uint256 timestamp)',
  'event KYCStatusUpdated(address indexed user, bool isActive, uint256 timestamp)',
  'event AuditLogCreated(address indexed user, string action, string details, uint256 timestamp)',
  
  // Functions
  'function verifyKYC(address user, string verificationHash, uint256 riskScore) external',
  'function updateKYCStatus(address user, bool isActive) external',
  'function getKYCStatus(address user) external view returns (bool isVerified, string verificationHash, uint256 verificationDate, uint256 riskScore, bool isActive, uint256 expiresAt)',
  'function createAuditLog(address user, string action, string details) external',
  'function getAuditLogs(address user) external view returns (tuple(string action, string details, uint256 timestamp)[])',
  'function linkWallet(address user, address walletAddress) external',
  'function getLinkedWallet(address user) external view returns (address)',
  'function isKYCValid(address user) external view returns (bool)',
  'function getVerificationHash(address user) external view returns (string)',
  'function getRiskScore(address user) external view returns (uint256)',
  'function getExpirationDate(address user) external view returns (uint256)',
] as const;

// Contract ABI for audit logs
export const AUDIT_ABI = [
  'event AuditLogCreated(address indexed user, string action, string details, uint256 timestamp)',
  'function createLog(address user, string action, string details) external',
  'function getLogs(address user) external view returns (tuple(string action, string details, uint256 timestamp)[])',
  'function getLogsByDateRange(address user, uint256 startDate, uint256 endDate) external view returns (tuple(string action, string details, uint256 timestamp)[])',
] as const;

export interface KYCStatus {
  isVerified: boolean;
  verificationHash: string;
  verificationDate: bigint;
  riskScore: bigint;
  isActive: boolean;
  expiresAt: bigint;
}

export interface AuditLog {
  action: string;
  details: string;
  timestamp: bigint;
}

/**
 * Get KYC contract instance
 * @param contractAddress - Address of the deployed KYC contract
 * @returns Contract instance
 */
export function getKYCContract(contractAddress: string) {
  return new ethers.Contract(contractAddress, KYC_ABI, provider);
}

/**
 * Get KYC contract instance with signer for transactions
 * @param contractAddress - Address of the deployed KYC contract
 * @returns Contract instance with signer
 */
export function getKYCContractWithSigner(contractAddress: string) {
  return new ethers.Contract(contractAddress, KYC_ABI, getSigner());
}

/**
 * Get audit contract instance
 * @param contractAddress - Address of the deployed audit contract
 * @returns Contract instance
 */
export function getAuditContract(contractAddress: string) {
  return new ethers.Contract(contractAddress, AUDIT_ABI, provider);
}

/**
 * Get audit contract instance with signer for transactions
 * @param contractAddress - Address of the deployed audit contract
 * @returns Contract instance with signer
 */
export function getAuditContractWithSigner(contractAddress: string) {
  return new ethers.Contract(contractAddress, AUDIT_ABI, getSigner());
}

/**
 * Verify KYC on blockchain
 * @param contractAddress - KYC contract address
 * @param userAddress - User's wallet address
 * @param verificationHash - IPFS hash of verification data
 * @param riskScore - Calculated risk score (0-100)
 */
export async function verifyKYCOnChain(
  contractAddress: string,
  userAddress: string,
  verificationHash: string,
  riskScore: number
): Promise<ethers.ContractTransactionResponse> {
  const contract = getKYCContractWithSigner(contractAddress);
  return await contract.verifyKYC(userAddress, verificationHash, riskScore);
}

/**
 * Update KYC status on blockchain
 * @param contractAddress - KYC contract address
 * @param userAddress - User's wallet address
 * @param isActive - Whether KYC is active
 */
export async function updateKYCStatusOnChain(
  contractAddress: string,
  userAddress: string,
  isActive: boolean
): Promise<ethers.ContractTransactionResponse> {
  const contract = getKYCContractWithSigner(contractAddress);
  return await contract.updateKYCStatus(userAddress, isActive);
}

/**
 * Get KYC status from blockchain
 * @param contractAddress - KYC contract address
 * @param userAddress - User's wallet address
 * @returns KYC status information
 */
export async function getKYCStatusFromChain(
  contractAddress: string,
  userAddress: string
): Promise<KYCStatus> {
  const contract = getKYCContract(contractAddress);
  return await contract.getKYCStatus(userAddress);
}

/**
 * Create audit log on blockchain
 * @param contractAddress - Audit contract address
 * @param userAddress - User's wallet address
 * @param action - Action performed
 * @param details - Details of the action
 */
export async function createAuditLogOnChain(
  contractAddress: string,
  userAddress: string,
  action: string,
  details: string
): Promise<ethers.ContractTransactionResponse> {
  const contract = getAuditContractWithSigner(contractAddress);
  return await contract.createLog(userAddress, action, details);
}

/**
 * Get audit logs from blockchain
 * @param contractAddress - Audit contract address
 * @param userAddress - User's wallet address
 * @returns Array of audit logs
 */
export async function getAuditLogsFromChain(
  contractAddress: string,
  userAddress: string
): Promise<AuditLog[]> {
  const contract = getAuditContract(contractAddress);
  return await contract.getLogs(userAddress);
}

/**
 * Link wallet to user
 * @param contractAddress - KYC contract address
 * @param userAddress - User's address
 * @param walletAddress - Wallet to link
 */
export async function linkWalletOnChain(
  contractAddress: string,
  userAddress: string,
  walletAddress: string
): Promise<ethers.ContractTransactionResponse> {
  const contract = getKYCContractWithSigner(contractAddress);
  return await contract.linkWallet(userAddress, walletAddress);
}

/**
 * Check if KYC is valid
 * @param contractAddress - KYC contract address
 * @param userAddress - User's wallet address
 * @returns Whether KYC is valid
 */
export async function isKYCValidOnChain(
  contractAddress: string,
  userAddress: string
): Promise<boolean> {
  const contract = getKYCContract(contractAddress);
  return await contract.isKYCValid(userAddress);
}

/**
 * Get network information
 * @returns Network details
 */
export async function getNetworkInfo() {
  const network = await provider.getNetwork();
  const blockNumber = await provider.getBlockNumber();
  const gasPrice = await provider.getFeeData();
  
  return {
    chainId: network.chainId,
    name: network.name,
    blockNumber,
    gasPrice: gasPrice.gasPrice,
  };
}

/**
 * Wait for transaction confirmation
 * @param tx - Transaction response
 * @param confirmations - Number of confirmations to wait for
 * @returns Transaction receipt
 */
export async function waitForTransaction(
  tx: ethers.ContractTransactionResponse,
  confirmations: number = 1
): Promise<ethers.ContractTransactionReceipt | null> {
  return await tx.wait(confirmations);
} 