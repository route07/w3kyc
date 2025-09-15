# Smart Contract Deployment Guide

## Overview

This guide outlines the deployment process for the Web3 KYC smart contracts to the Route07 private EVM testnet using Remix IDE.

## Smart Contracts

### 1. KYCVerification Contract

**File**: `contracts/KYCVerification.sol`

**Purpose**: Main contract for managing KYC verification status and reusable credentials

**Key Features**:
- KYC status storage and retrieval
- IPFS hash verification storage
- Risk score tracking
- Wallet linking functionality
- Audit log creation
- Admin/authority management
- Emergency pause functionality

## Deployment Process

### Step 1: Prepare Remix IDE

1. **Open Remix IDE**
   - Go to [remix.ethereum.org](https://remix.ethereum.org)
   - Create a new workspace or use existing one

2. **Create Contract File**
   - Create a new file named `KYCVerification.sol`
   - Copy the contract code from `contracts/KYCVerification.sol`

3. **Install Dependencies**
   - The contract uses OpenZeppelin contracts
   - Remix will automatically fetch dependencies

### Step 2: Configure Route07 Network

1. **Add Route07 Network to MetaMask**
   ```
   Network Name: Route07 Testnet
   RPC URL: [Your Route07 RPC URL]
   Chain ID: [Your Route07 Chain ID]
   Currency Symbol: [Your Token Symbol]
   ```

2. **Get Test Tokens**
   - Ensure you have test tokens for gas fees
   - Contact your Route07 network administrator if needed

### Step 3: Compile Contract

1. **Select Compiler**
   - Go to Solidity Compiler tab
   - Select compiler version: `0.8.19`
   - Enable optimization: `200` runs

2. **Compile Settings**
   ```
   Compiler Version: 0.8.19
   EVM Version: paris
   Optimization: Enabled (200 runs)
   License Type: MIT
   ```

3. **Compile Contract**
   - Click "Compile KYCVerification.sol"
   - Verify no errors or warnings

### Step 4: Deploy Contract

1. **Select Deploy Tab**
   - Go to Deploy & Run Transactions tab
   - Environment: "Injected Provider - MetaMask"
   - Account: Select your Route07 account

2. **Deploy Parameters**
   ```
   Contract: KYCVerification
   Constructor Parameters:
   - initialOwner: [Your wallet address]
   ```

3. **Deploy Transaction**
   - Click "Deploy"
   - Confirm transaction in MetaMask
   - Wait for confirmation

### Step 5: Verify Deployment

1. **Get Contract Address**
   - Copy the deployed contract address
   - Save it for future reference

2. **Verify Contract**
   - Check contract is deployed correctly
   - Verify owner is set correctly
   - Test basic functions

## Contract Configuration

### Post-Deployment Setup

1. **Authorize Verifiers**
   ```solidity
   // Call authorizeVerifier function
   function authorizeVerifier(address verifier) external onlyOwner
   
   // Add your application's verifier address
   ```

2. **Set Initial Parameters**
   - Verify KYC expiry duration (365 days)
   - Confirm max risk score (100)

### Contract Addresses

After deployment, document the following:

```env
# Add to your .env.local file
KYC_CONTRACT_ADDRESS=0x... # Deployed contract address
AUDIT_CONTRACT_ADDRESS=0x... # If separate audit contract
```

## Contract ABI

The contract ABI is already defined in `src/lib/blockchain.ts`:

```typescript
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
```

## Testing Functions

### 1. Basic KYC Verification

```solidity
// Test KYC verification
function testKYCVerification() {
    // 1. Verify a user
    verifyKYC(userAddress, "QmTestHash123", 25);
    
    // 2. Check status
    (bool isVerified, string memory hash, uint256 date, uint256 score, bool active, uint256 expires) = getKYCStatus(userAddress);
    
    // 3. Verify results
    require(isVerified == true, "KYC should be verified");
    require(keccak256(bytes(hash)) == keccak256(bytes("QmTestHash123")), "Hash should match");
    require(score == 25, "Risk score should match");
}
```

### 2. Wallet Linking

```solidity
// Test wallet linking
function testWalletLinking() {
    // 1. Link wallet
    linkWallet(userAddress, walletAddress);
    
    // 2. Check linked wallet
    address linked = getLinkedWallet(userAddress);
    require(linked == walletAddress, "Wallet should be linked");
}
```

### 3. Audit Logging

```solidity
// Test audit logging
function testAuditLogging() {
    // 1. Create audit log
    createAuditLog(userAddress, "TEST_ACTION", "Test details");
    
    // 2. Get audit logs
    AuditEntry[] memory logs = getAuditLogs(userAddress);
    require(logs.length > 0, "Should have audit logs");
    require(keccak256(bytes(logs[0].action)) == keccak256(bytes("TEST_ACTION")), "Action should match");
}
```

## Security Considerations

### 1. Access Control

- **Owner Functions**: Only contract owner can call
- **Authorized Verifiers**: Only authorized addresses can verify KYC
- **Emergency Pause**: Owner can pause contract in emergencies

### 2. Input Validation

- **Address Validation**: All addresses are validated
- **Hash Validation**: IPFS hashes are validated
- **Risk Score Limits**: Scores are capped at 100

### 3. Reentrancy Protection

- **ReentrancyGuard**: Prevents reentrancy attacks
- **State Changes**: State changes happen before external calls

## Monitoring and Maintenance

### 1. Event Monitoring

Monitor these events for system health:

```solidity
event KYCVerified(address indexed user, string verificationHash, uint256 timestamp);
event KYCStatusUpdated(address indexed user, bool isActive, uint256 timestamp);
event AuditLogCreated(address indexed user, string action, string details, uint256 timestamp);
event WalletLinked(address indexed user, address indexed wallet);
event VerifierAuthorized(address indexed verifier);
event VerifierRevoked(address indexed verifier);
```

### 2. Gas Optimization

- **Batch Operations**: Consider batching multiple operations
- **Gas Estimation**: Test gas costs for all functions
- **Optimization**: Use appropriate data types and structures

### 3. Upgrade Strategy

- **Immutable Design**: Contract is designed to be immutable
- **Data Migration**: Plan for data migration if needed
- **Backup Strategy**: Keep backup of all transaction data

## Troubleshooting

### Common Issues

1. **Compilation Errors**
   - Check Solidity version compatibility
   - Verify OpenZeppelin import paths
   - Ensure all dependencies are available

2. **Deployment Failures**
   - Check gas limit and gas price
   - Verify network configuration
   - Ensure sufficient test tokens

3. **Function Call Errors**
   - Check function permissions
   - Verify input parameters
   - Check contract state

### Debug Mode

Enable debug mode in Remix for detailed error information:

1. Go to Settings tab
2. Enable "Enable debugger"
3. Use debugger for step-by-step execution

## Best Practices

1. **Test Thoroughly**: Test all functions before production
2. **Document Everything**: Keep detailed deployment records
3. **Monitor Events**: Set up event monitoring
4. **Backup Data**: Keep backups of all transactions
5. **Security Audits**: Consider professional security audits
6. **Gas Optimization**: Optimize for gas efficiency
7. **Error Handling**: Implement proper error handling

## Next Steps

After successful deployment:

1. **Update Environment Variables**: Add contract addresses to `.env.local`
2. **Test Integration**: Test blockchain integration in the application
3. **Monitor Performance**: Monitor gas usage and performance
4. **Document Changes**: Update documentation with actual addresses
5. **Security Review**: Conduct security review of deployed contracts

This deployment guide ensures a smooth and secure deployment process for the Web3 KYC smart contracts on the Route07 testnet. 