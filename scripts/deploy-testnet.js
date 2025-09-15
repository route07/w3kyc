const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Web3 KYC System - Testnet Deployment");
  console.log("=======================================\n");

  // Check if we have the required environment variables
  if (!process.env.PRIVATE_KEY) {
    console.log("❌ PRIVATE_KEY environment variable not set");
    console.log("Please set your private key: export PRIVATE_KEY=your_private_key");
    process.exit(1);
  }

  if (!process.env.RPC_URL) {
    console.log("❌ RPC_URL environment variable not set");
    console.log("Please set your RPC URL: export RPC_URL=your_rpc_url");
    process.exit(1);
  }

  // Create provider and wallet
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("Deploying with account:", wallet.address);
  console.log("Account balance:", (await provider.getBalance(wallet.address)).toString());

  try {
    // Try to deploy a simple contract first
    console.log("\n📦 Attempting to deploy KYCDataStorage...");
    
    // This is a simplified approach - we'll use the existing artifacts
    const artifactPath = require('path').join(__dirname, '..', 'artifacts', 'contracts', 'storage', 'KYCDataStorage.sol', 'KYCDataStorage.json');
    
    if (require('fs').existsSync(artifactPath)) {
      const artifact = JSON.parse(require('fs').readFileSync(artifactPath, 'utf8'));
      
      const factory = new ethers.ContractFactory(
        artifact.abi,
        artifact.bytecode,
        wallet
      );
      
      const contract = await factory.deploy();
      await contract.waitForDeployment();
      
      const address = await contract.getAddress();
      console.log("✅ KYCDataStorage deployed successfully!");
      console.log(`📍 Address: ${address}`);
      
      // Save deployment info
      const deploymentInfo = {
        contractName: "KYCDataStorage",
        address: address,
        deployer: wallet.address,
        deploymentTime: new Date().toISOString(),
        network: await provider.getNetwork()
      };

      require('fs').writeFileSync('deployment-testnet.json', JSON.stringify(deploymentInfo, null, 2));
      console.log("📄 Deployment info saved to deployment-testnet.json");
      
    } else {
      console.log("❌ Artifact not found. Please compile contracts first.");
    }
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });