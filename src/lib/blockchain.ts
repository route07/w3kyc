import { ethers } from 'ethers';

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID!;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL!;
const PRIVATE_KEY = process.env.PRIVATE_KEY!;

// For development, use local Hardhat network
const LOCAL_RPC_URL = 'http://127.0.0.1:8545';
const LOCAL_CHAIN_ID = '31337';

// Use Route07 testnet for all environments (since we deployed there)
// Only use local network if explicitly configured
const useLocalNetwork = process.env.USE_LOCAL_NETWORK === 'true';

const effectiveRpcUrl = useLocalNetwork ? LOCAL_RPC_URL : RPC_URL;
const effectiveChainId = useLocalNetwork ? LOCAL_CHAIN_ID : CHAIN_ID;

if (!effectiveChainId || !effectiveRpcUrl) {
  throw new Error('Blockchain configuration missing in environment variables');
}

// Provider for read-only operations
export const provider = new ethers.JsonRpcProvider(effectiveRpcUrl);

// Deployed Contract Addresses - Route07 Testnet (London EVM)
export const CONTRACT_ADDRESSES = {
  local: {
    KYCDataStorage: "0x5eb3bc0a489c5a8288765d2336659ebca68fcd00",
    KYCManager: "0x1291be112d480055dafd8a610b7d1e203891c274",
    DIDManager: "0x5f3f1dbd7b74c6b46e8c44f98792a1daf8d69154",
    AuthorizationManager: "0xb7278a61aa25c888815afc32ad3cc52ff24fe575",
    ComplianceChecker: "0xcd8a1c3ba11cf5ecfa6267617243239504a98d90",
    InputValidator: "0x82e01223d51eb87e16a03e24687edf0f294da6f1",
    BoundsChecker: "0x2bdcc0de6be1f7d2ee689a0342d76f52e8efaba3",
    JurisdictionConfig: "0x7969c5ed335650692bc04293b07f5bf2e7a673c0",
    VersionManager: "0x7bc06c482dead17c0e297afbc32f6e63d3846650",
    CredentialTypeManagerRefactored: "0xc351628eb244ec633d5f21fbd6621e1a683b1181",
    FeatureFlagsRefactored: "0xfd471836031dc5108809d173a067e8486b9047a3",
    MultisigManager: "0xcbeaf3bde82155f56486fb5a1072cb8baaf547cc",
    MultisigModifier: "0x1429859428c0abc9c2c47c8ee9fbaf82cfa0f20f",
    EmergencyManager: "0xb0d4afd8879ed9f52b28595d31b441d079b2ca07",
    GovernanceManager: "0x162a433068f51e18b7d13932f27e66a3f99e6890",
    BatchOperationsRefactored: "0x922d6956c99e12dfeb3224dea977d0939758a1fe",
    MultisigExample: "0x5081a39b8a5f0e35a8d959395a630b68b74dd30f",
    AuditLogStorage: "0x36C02dA8a0983159322a80FFE9F24b1acfF8B570",
  },
  // Route07 Testnet - All 21 contracts deployed successfully (London EVM)
  testnet: {
    // Storage Layer
    KYCDataStorage: "0x5f4f4a6Ddb4a10AB2842c0414c490Fdc33b9d2Ba",
    AuditLogStorage: "0xf07BDad5f0Fd8b2f7DA548C2eFB68a699704a5c4",
    TenantConfigStorage: "0xDdd5B33D7b9D943712ddF5180d0aB472A4dFA07C",
    DIDCredentialStorage: "0xc7812E5f4Ab5E9Bb2b421c8E8bfE178d81696bC8",
    
    // Business Logic Layer
    KYCManager: "0x9966fF8E8D04c19B2d3337d7F3b6A27F769B4F85",
    DIDManager: "0x19026Ce391b35c205191b91E5Ae929ED0e20B261",
    BatchOperationsSimple: "0xdE2E4150AA04AB879a88302cA2430b3B13B63dc4",
    BatchOperationsRefactored: "0xa721012f2Fa362977C952485Fc068A44Ff940d34",
    
    // Access Control Layer
    AuthorizationManager: "0xF2Df465954265Bf59DeF33DFE271d09ecfDB1d44",
    
    // Utility Layer
    ComplianceChecker: "0xA6465F8C41991Bc8Bf90AcB71f14E82822347560",
    InputValidator: "0x0DC8D172E1Dd777f5B98bAE0913A5DED41c6E971",
    BoundsChecker: "0x7b9eA0b99B73998e8558CCD0C6612Dcb6CaFD8E9",
    JurisdictionConfig: "0x9a8BdA52EC7E2E8795d74C41e21047eb2DA85c18",
    VersionManager: "0x9db689Af1a4A7Cd58322C983296dEA0920337630",
    CredentialTypeManagerRefactored: "0xdAfB73F91D5a2FDE7F6EF6161bCB3e892f8c514E",
    FeatureFlagsRefactored: "0x1e830E3eB31350511844D4ABC7e8f5E4C1Ab6d07",
    
    // System Layer
    MultisigManager: "0xfD979F006135e5E459AE56FDe027db0B2c92a7be",
    MultisigModifier: "0x5Ce264B230398DD339F295563E1969E7AaCDE2F4",
    EmergencyManager: "0x4AdC91C27F9B4933eb08cD6ee48251b3132Ae227",
    
    // Governance Layer
    GovernanceManager: "0x9d9d2F136d17505BE4F0789ff90383901645dF92",
    
    // Examples
    MultisigExample: "0x98a0392b090FA90D85012064dcfebaCdD0EB866f",
  }
};

// Get contract addresses based on environment
export function getContractAddresses() {
  // Use testnet addresses by default (since we deployed there)
  // Only use local addresses if explicitly configured
  return useLocalNetwork ? CONTRACT_ADDRESSES.local : CONTRACT_ADDRESSES.testnet;
}

// For development, prefer local network if available
export function getPreferredContractAddresses() {
  // Try to detect if local network is available
  if (typeof window !== 'undefined') {
    // In browser, we'll use the environment variables
    return getContractAddresses();
  } else {
    // In server-side, prefer local network for development
    return CONTRACT_ADDRESSES.local;
  }
}

// Signer for transactions (requires private key)
export function getSigner(): ethers.Wallet {
  if (!PRIVATE_KEY) {
    throw new Error('Private key required for transactions');
  }
  return new ethers.Wallet(PRIVATE_KEY, provider);
}

// Contract ABIs for deployed contracts
export const KYC_DATA_STORAGE_ABI = [
  // Events
  'event KYCDataStored(address indexed user, string dataHash, uint256 timestamp)',
  'event KYCDataUpdated(address indexed user, string dataHash, uint256 timestamp)',
  'event AuthorizedWriterUpdated(address indexed writer, bool authorized)',
  
  // Functions
  'function storeKYCData(address user, string dataHash) external',
  'function updateKYCData(address user, string dataHash) external',
  'function getKYCData(address user) external view returns (string)',
  'function setAuthorizedWriter(address writer, bool authorized) external',
  'function isAuthorizedWriter(address writer) external view returns (bool)',
  'function owner() external view returns (address)',
] as const;

export const KYC_MANAGER_ABI = [
  // Events
  'event KYCVerified(address indexed user, string verificationHash, uint256 timestamp)',
  'event KYCStatusUpdated(address indexed user, bool isActive, uint256 timestamp)',
  'event AuditLogCreated(address indexed user, string action, string details, uint256 timestamp)',
  
  // Functions
  'function verifyKYC(address user, string verificationHash, uint256 riskScore) external',
  'function updateKYCStatus(address user, bool isActive) external',
  'function getKYCStatus(address user) external view returns (bool isVerified, bool isActive, bool isExpired)',
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
 * Get KYC Data Storage contract instance
 * @param contractAddress - Address of the deployed KYC Data Storage contract
 * @returns Contract instance
 */
export function getKYCDataStorageContract(contractAddress: string) {
  return new ethers.Contract(contractAddress, KYC_DATA_STORAGE_ABI, provider);
}

/**
 * Get KYC Data Storage contract instance with signer for transactions
 * @param contractAddress - Address of the deployed KYC Data Storage contract
 * @returns Contract instance with signer
 */
export function getKYCDataStorageContractWithSigner(contractAddress: string) {
  return new ethers.Contract(contractAddress, KYC_DATA_STORAGE_ABI, getSigner());
}

/**
 * Get KYC Manager contract instance
 * @param contractAddress - Address of the deployed KYC Manager contract
 * @returns Contract instance
 */
export function getKYCManagerContract(contractAddress: string) {
  return new ethers.Contract(contractAddress, KYC_MANAGER_ABI, provider);
}

/**
 * Get KYC Manager contract instance with signer for transactions
 * @param contractAddress - Address of the deployed KYC Manager contract
 * @returns Contract instance with signer
 */
export function getKYCManagerContractWithSigner(contractAddress: string) {
  return new ethers.Contract(contractAddress, KYC_MANAGER_ABI, getSigner());
}

/**
 * Get KYC contract instance (legacy function for backward compatibility)
 * @param contractAddress - Address of the deployed KYC contract
 * @returns Contract instance
 */
export function getKYCContract(contractAddress: string) {
  return new ethers.Contract(contractAddress, KYC_MANAGER_ABI, provider);
}

/**
 * Get KYC contract instance with signer for transactions (legacy function for backward compatibility)
 * @param contractAddress - Address of the deployed KYC contract
 * @returns Contract instance with signer
 */
export function getKYCContractWithSigner(contractAddress: string) {
  return new ethers.Contract(contractAddress, KYC_MANAGER_ABI, getSigner());
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

// Convenience functions to get contracts using deployed addresses
export function getDeployedKYCDataStorage() {
  const addresses = getContractAddresses();
  return getKYCDataStorageContract(addresses.KYCDataStorage);
}

export function getDeployedKYCDataStorageWithSigner() {
  const addresses = getContractAddresses();
  return getKYCDataStorageContractWithSigner(addresses.KYCDataStorage);
}

export function getDeployedKYCManager() {
  // For development, always use local addresses since that's where all contracts are deployed
  const addresses = CONTRACT_ADDRESSES.local;
  if (!addresses.KYCManager) {
    throw new Error('KYCManager contract address not found in local addresses');
  }
  return getKYCManagerContract(addresses.KYCManager);
}

export function getDeployedKYCManagerWithSigner() {
  // For development, always use local addresses since that's where all contracts are deployed
  const addresses = CONTRACT_ADDRESSES.local;
  if (!addresses.KYCManager) {
    throw new Error('KYCManager contract address not found in local addresses');
  }
  return getKYCManagerContractWithSigner(addresses.KYCManager);
}

// High-level functions for common operations
export async function storeKYCDataOnChain(userAddress: string, dataHash: string) {
  const contract = getDeployedKYCDataStorageWithSigner();
  return await contract.storeKYCData(userAddress, dataHash);
}

export async function getKYCDataFromChain(userAddress: string) {
  const contract = getDeployedKYCDataStorage();
  return await contract.getKYCData(userAddress);
}

export async function verifyKYCOnChain(userAddress: string, verificationHash: string, riskScore: number) {
  const contract = getDeployedKYCManagerWithSigner();
  return await contract.verifyKYC(userAddress, verificationHash, riskScore);
}

export async function getKYCStatusFromChain(userAddress: string) {
  const contract = getDeployedKYCManager();
  return await contract.getKYCStatus(userAddress);
} 