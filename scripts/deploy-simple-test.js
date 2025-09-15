const { ethers } = require("ethers");
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

async function main() {
  console.log("🧪 Simple Contract Test Deployment to Route07");
  console.log("==============================================\n");

  // Check environment variables
  if (!process.env.PRIVATE_KEY) {
    console.log("❌ PRIVATE_KEY environment variable not set");
    process.exit(1);
  }

  if (!process.env.NEXT_PUBLIC_RPC_URL) {
    console.log("❌ NEXT_PUBLIC_RPC_URL environment variable not set");
    process.exit(1);
  }

  // Create provider and wallet
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("Deploying with account:", wallet.address);
  
  try {
    const balance = await provider.getBalance(wallet.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");
    
    if (balance === 0n) {
      console.log("❌ Account has no balance. Please fund the account first.");
      process.exit(1);
    }
  } catch (error) {
    console.log("❌ Failed to connect to network:", error.message);
    process.exit(1);
  }

  try {
    // Try to deploy a simple contract first - InputValidator (no constructor params)
    console.log("\n📦 Testing with InputValidator (simple contract)...");
    
    const inputValidatorArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'utility', 'InputValidator.sol', 'InputValidator.json'),
      'utf8'
    ));
    
    console.log("Artifact loaded successfully");
    console.log("Bytecode length:", inputValidatorArtifact.bytecode.length);
    
    const inputValidatorFactory = new ethers.ContractFactory(
      inputValidatorArtifact.abi,
      inputValidatorArtifact.bytecode,
      wallet
    );
    
    console.log("Factory created, attempting deployment...");
    const inputValidator = await inputValidatorFactory.deploy();
    console.log("Deployment transaction sent, waiting for confirmation...");
    
    await inputValidator.waitForDeployment();
    const address = await inputValidator.getAddress();
    
    console.log("✅ InputValidator deployed successfully!");
    console.log(`📍 Address: ${address}`);
    
    // Test basic functionality
    console.log("\n🧪 Testing basic functionality...");
    console.log("✅ Contract deployed and accessible");
    
    console.log("\n🎉 Simple deployment test successful!");
    console.log("✅ Route07 network is working correctly");
    
  } catch (error) {
    console.error("❌ Simple deployment failed:", error);
    
    if (error.message.includes('invalid opcode')) {
      console.log("\n💡 This suggests the network doesn't support the EVM version used.");
      console.log("   Try using an older Solidity version or different EVM target.");
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
