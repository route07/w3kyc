const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function main() {
  console.log("🚀 Deploying remaining contracts to Tractsafe...");
  
  // Create provider and wallet
  const provider = new ethers.JsonRpcProvider('https://tapi.tractsafe.com');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("📝 Deploying contracts with account:", wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    throw new Error("Insufficient balance to deploy contracts");
  }

  const deployedContracts = {
    KYCManager: "0x8d6c862136A215feb99F7D163563Ddd0A9Fe4FC9" // Already deployed
  };
  const deploymentLog = [];

  try {
    // Read contract artifacts
    const artifactsDir = path.join(__dirname, '..', 'artifacts', 'contracts');
    
    // Helper function to get contract factory
    const getContractFactory = async (contractName, category = 'utility') => {
      const artifactPath = path.join(artifactsDir, category, contractName + '.sol', contractName + '.json');
      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      return new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    };

    // Get existing deployed contract addresses from environment
    const existingAddresses = {
      auditLogStorage: process.env.NEXT_PUBLIC_AUDITLOGSTORAGE_ADDRESS
    };

    console.log("📋 Using existing storage contracts:");
    console.log("  AuditLogStorage:", existingAddresses.auditLogStorage);

    // PHASE 1: Deploy ComplianceChecker (simpler contract)
    console.log("\n🏗️ PHASE 1: Deploying ComplianceChecker...");
    
    try {
      const ComplianceChecker = await getContractFactory("ComplianceChecker", "utility");
      const complianceChecker = await ComplianceChecker.deploy({
        gasLimit: 2000000,
        gasPrice: ethers.parseUnits("1", "gwei"),
      });
      
      await complianceChecker.waitForDeployment();
      const complianceCheckerAddress = await complianceChecker.getAddress();
      
      deployedContracts.ComplianceChecker = complianceCheckerAddress;
      deploymentLog.push({
        name: "ComplianceChecker",
        address: complianceCheckerAddress,
        txHash: complianceChecker.deploymentTransaction().hash,
        category: "Utility"
      });
      
      console.log("✅ ComplianceChecker deployed:", complianceCheckerAddress);
    } catch (error) {
      console.warn("⚠️ ComplianceChecker deployment failed:", error.message);
    }

    // PHASE 2: Deploy AuthorizationManager (simpler contract)
    console.log("\n🏗️ PHASE 2: Deploying AuthorizationManager...");
    
    try {
      const AuthorizationManager = await getContractFactory("AuthorizationManager", "access");
      const authorizationManager = await AuthorizationManager.deploy({
        gasLimit: 2000000,
        gasPrice: ethers.parseUnits("1", "gwei"),
      });
      
      await authorizationManager.waitForDeployment();
      const authorizationManagerAddress = await authorizationManager.getAddress();
      
      deployedContracts.AuthorizationManager = authorizationManagerAddress;
      deploymentLog.push({
        name: "AuthorizationManager",
        address: authorizationManagerAddress,
        txHash: authorizationManager.deploymentTransaction().hash,
        category: "Access Control"
      });
      
      console.log("✅ AuthorizationManager deployed:", authorizationManagerAddress);
    } catch (error) {
      console.warn("⚠️ AuthorizationManager deployment failed:", error.message);
    }

    // PHASE 3: Try to deploy DIDCredentialStorage with lower gas limit
    console.log("\n🏗️ PHASE 3: Deploying DIDCredentialStorage...");
    
    try {
      const DIDCredentialStorage = await getContractFactory("DIDCredentialStorage", "storage");
      const didCredentialStorage = await DIDCredentialStorage.deploy({
        gasLimit: 2000000,
        gasPrice: ethers.parseUnits("1", "gwei"),
      });
      
      await didCredentialStorage.waitForDeployment();
      const didCredentialStorageAddress = await didCredentialStorage.getAddress();
      
      deployedContracts.DIDCredentialStorage = didCredentialStorageAddress;
      deploymentLog.push({
        name: "DIDCredentialStorage",
        address: didCredentialStorageAddress,
        txHash: didCredentialStorage.deploymentTransaction().hash,
        category: "Storage"
      });
      
      console.log("✅ DIDCredentialStorage deployed:", didCredentialStorageAddress);

      // PHASE 4: Deploy DIDManager if DIDCredentialStorage succeeded
      console.log("\n🏗️ PHASE 4: Deploying DIDManager...");
      
      try {
        const DIDManager = await getContractFactory("DIDManager", "business");
        const didManager = await DIDManager.deploy(
          didCredentialStorageAddress,
          existingAddresses.auditLogStorage,
          {
            gasLimit: 3000000,
            gasPrice: ethers.parseUnits("1", "gwei"),
          }
        );
        
        await didManager.waitForDeployment();
        const didManagerAddress = await didManager.getAddress();
        
        deployedContracts.DIDManager = didManagerAddress;
        deploymentLog.push({
          name: "DIDManager",
          address: didManagerAddress,
          txHash: didManager.deploymentTransaction().hash,
          category: "Business Logic"
        });
        
        console.log("✅ DIDManager deployed:", didManagerAddress);
      } catch (error) {
        console.warn("⚠️ DIDManager deployment failed:", error.message);
      }

    } catch (error) {
      console.warn("⚠️ DIDCredentialStorage deployment failed:", error.message);
    }

    // Save deployment results
    const deploymentResults = {
      network: "Tractsafe",
      chainId: 35935,
      deployer: wallet.address,
      timestamp: new Date().toISOString(),
      contracts: deployedContracts,
      deploymentLog: deploymentLog
    };

    // Save to file
    const resultsPath = path.join(__dirname, '..', 'deployment-results-remaining.json');
    fs.writeFileSync(resultsPath, JSON.stringify(deploymentResults, null, 2));
    console.log("\n💾 Deployment results saved to:", resultsPath);

    // Display summary
    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("📊 Summary:");
    console.log(`  ✅ Successfully deployed ${Object.keys(deployedContracts).length} contracts`);
    console.log(`  💰 Gas used: ~${deploymentLog.length} transactions`);
    console.log(`  🌐 Network: Tractsafe (Chain ID: 35935)`);
    console.log(`  👤 Deployer: ${wallet.address}`);

    console.log("\n📝 Contract Addresses:");
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`  ${name}: ${address}`);
    });

    console.log("\n🔧 Environment Variables to add to .env.local:");
    console.log("# Missing Contracts - Deployed Successfully");
    Object.entries(deployedContracts).forEach(([name, address]) => {
      const envVar = `NEXT_PUBLIC_${name.toUpperCase()}_ADDRESS`;
      console.log(`${envVar}=${address}`);
    });

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });