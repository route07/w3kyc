const { ethers } = require("ethers");
require('dotenv').config();

async function testBlockchainConnection() {
  console.log("🔗 Testing Blockchain Connection");
  console.log("================================\n");

  try {
    // Check environment variables
    console.log("📋 Environment Variables:");
    console.log(`RPC URL: ${process.env.NEXT_PUBLIC_RPC_URL || 'Not set'}`);
    console.log(`Chain ID: ${process.env.NEXT_PUBLIC_CHAIN_ID || 'Not set'}`);
    console.log(`Private Key: ${process.env.PRIVATE_KEY ? 'Set' : 'Not set'}\n`);

    // Use local network for testing
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545';
    const chainId = process.env.NEXT_PUBLIC_CHAIN_ID || '31337';
    
    console.log(`🔧 Using RPC URL: ${rpcUrl}`);
    console.log(`🔧 Using Chain ID: ${chainId}\n`);

    // Create provider
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Test network connection
    console.log("🌐 Testing Network Connection...");
    const network = await provider.getNetwork();
    console.log(`✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Get latest block
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ Latest block number: ${blockNumber}`);
    
    // Get gas price
    const feeData = await provider.getFeeData();
    console.log(`✅ Gas price: ${ethers.formatUnits(feeData.gasPrice, 'gwei')} gwei\n`);

    // Test contract connection
    console.log("📦 Testing Contract Connection...");
    
    // Check if we're on local network or testnet
    const isLocal = rpcUrl.includes('localhost') || rpcUrl.includes('127.0.0.1');
    
    const contractAddresses = isLocal ? {
      // Local Hardhat network contracts
      KYCDataStorage: "0x5eb3bc0a489c5a8288765d2336659ebca68fcd00",
      KYCManager: "0x1291be112d480055dafd8a610b7d1e203891c274",
      InputValidator: "0x82e01223d51eb87e16a03e24687edf0f294da6f1",
      BoundsChecker: "0x2bdcc0de6be1f7d2ee689a0342d76f52e8efaba3"
    } : {
      // Route07 testnet contracts (only utility contracts deployed)
      InputValidator: "0xA74E223CC1D51F1cFaF3594B01A0335DD5F0Cf29",
      BoundsChecker: "0xe6a30fb8727a8D27f19c4170bEaE4e7C4d0C527e"
    };
    
    console.log(`📍 Network: ${isLocal ? 'Local Hardhat' : 'Route07 Testnet'}`);
    console.log(`📋 Available contracts: ${Object.keys(contractAddresses).join(', ')}\n`);

    // Test contracts based on network
    if (isLocal && contractAddresses.KYCDataStorage) {
      // Test KYCDataStorage contract (local only)
      const kycDataStorageABI = [
        'function owner() external view returns (address)',
        'function isAuthorizedWriter(address writer) external view returns (bool)'
      ];
      
      const kycDataStorage = new ethers.Contract(contractAddresses.KYCDataStorage, kycDataStorageABI, provider);
      
      try {
        const owner = await kycDataStorage.owner();
        console.log(`✅ KYCDataStorage contract connected - Owner: ${owner}`);
      } catch (error) {
        console.log(`❌ KYCDataStorage contract error: ${error.message}`);
      }
    }

    // Test KYCManager contract (local only)
    if (isLocal && contractAddresses.KYCManager) {
      const kycManagerABI = [
        'function getKYCStatus(address user) external view returns (bool isVerified, string memory verificationHash, uint256 verificationDate, uint256 riskScore, bool isActive, uint256 expiresAt)',
        'function isKYCValid(address user) external view returns (bool)'
      ];
      
      const kycManager = new ethers.Contract(contractAddresses.KYCManager, kycManagerABI, provider);
      
      try {
        const testAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
        const isValid = await kycManager.isKYCValid(testAddress);
        console.log(`✅ KYCManager contract connected - KYC validity check: ${isValid}`);
      } catch (error) {
        console.log(`❌ KYCManager contract error: ${error.message}`);
      }
    }

    // Note: InputValidator and BoundsChecker are libraries, not contracts
    // They don't have external functions and are used internally by other contracts

    // Test with signer if private key is available
    const privateKey = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    if (privateKey) {
      console.log("\n🔐 Testing with Signer...");
      const wallet = new ethers.Wallet(privateKey, provider);
      console.log(`✅ Wallet address: ${wallet.address}`);
      
      const balance = await provider.getBalance(wallet.address);
      console.log(`✅ Wallet balance: ${ethers.formatEther(balance)} ETH`);
    }

    console.log("\n🎉 Blockchain connection test completed successfully!");
    
  } catch (error) {
    console.error("❌ Blockchain connection test failed:", error.message);
    process.exit(1);
  }
}

// Run the test
testBlockchainConnection();
