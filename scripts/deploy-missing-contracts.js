const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function main() {
  console.log("🚀 Deploying missing contracts to Tractsafe...");
  
  // Create provider and wallet
  const provider = new ethers.JsonRpcProvider('https://tapi.tractsafe.com');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("📝 Deploying contracts with account:", wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    throw new Error("Insufficient balance to deploy contracts");
  }

  const deployedContracts = {};
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
      kycDataStorage: process.env.NEXT_PUBLIC_KYCDATASTORAGE_ADDRESS,
      auditLogStorage: process.env.NEXT_PUBLIC_AUDITLOGSTORAGE_ADDRESS,
      tenantConfigStorage: process.env.NEXT_PUBLIC_TENANTCONFIGSTORAGE_ADDRESS,
      inputValidator: process.env.NEXT_PUBLIC_INPUTVALIDATOR_ADDRESS,
      boundsChecker: process.env.NEXT_PUBLIC_BOUNDSCHECKER_ADDRESS
    };

    console.log("📋 Using existing storage contracts:");
    console.log("  KYCDataStorage:", existingAddresses.kycDataStorage);
    console.log("  AuditLogStorage:", existingAddresses.auditLogStorage);
    console.log("  TenantConfigStorage:", existingAddresses.tenantConfigStorage);

    // Validate that we have the required storage contracts
    if (!existingAddresses.kycDataStorage || existingAddresses.kycDataStorage === '0x0000000000000000000000000000000000000000') {
      throw new Error("KYCDataStorage not deployed. Please deploy storage contracts first.");
    }

    // PHASE 1: Deploy KYCManager
    console.log("\n🏗️ PHASE 1: Deploying KYCManager...");
    
    const KYCManager = await getContractFactory("KYCManager", "business");
    const kycManager = await KYCManager.deploy(
      existingAddresses.kycDataStorage,
      existingAddresses.auditLogStorage,
      existingAddresses.tenantConfigStorage,
      {
        gasLimit: 5000000,
        gasPrice: ethers.parseUnits("1", "gwei"),
      }
    );
    
    await kycManager.waitForDeployment();
    const kycManagerAddress = await kycManager.getAddress();
    
    deployedContracts.KYCManager = kycManagerAddress;
    deploymentLog.push({
      name: "KYCManager",
      address: kycManagerAddress,
      txHash: kycManager.deploymentTransaction().hash,
      category: "Business Logic"
    });
    
    console.log("✅ KYCManager deployed:", kycManagerAddress);

    // Verify KYCManager deployment
    try {
      const owner = await kycManager.owner();
      const version = await kycManager.VERSION();
      console.log("✅ KYCManager verification successful - Owner:", owner, "Version:", version.toString());
    } catch (error) {
      console.warn("⚠️ KYCManager verification failed:", error.message);
    }

    // PHASE 2: Deploy DIDCredentialStorage (required for DIDManager)
    console.log("\n🏗️ PHASE 2: Deploying DIDCredentialStorage...");
    
    const DIDCredentialStorage = await getContractFactory("DIDCredentialStorage", "storage");
    const didCredentialStorage = await DIDCredentialStorage.deploy({
      gasLimit: 3000000,
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

    // PHASE 3: Deploy DIDManager
    console.log("\n🏗️ PHASE 3: Deploying DIDManager...");
    
    const DIDManager = await getContractFactory("DIDManager", "business");
    const didManager = await DIDManager.deploy(
      didCredentialStorageAddress,
      existingAddresses.auditLogStorage,
      {
        gasLimit: 5000000,
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

    // Verify DIDManager deployment
    try {
      const owner = await didManager.owner();
      const version = await didManager.VERSION();
      console.log("✅ DIDManager verification successful - Owner:", owner, "Version:", version.toString());
    } catch (error) {
      console.warn("⚠️ DIDManager verification failed:", error.message);
    }

    // PHASE 4: Deploy AuthorizationManager
    console.log("\n🏗️ PHASE 4: Deploying AuthorizationManager...");
    
    const AuthorizationManager = await getContractFactory("AuthorizationManager", "access");
    const authorizationManager = await AuthorizationManager.deploy({
      gasLimit: 3000000,
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

    // PHASE 5: Deploy ComplianceChecker
    console.log("\n🏗️ PHASE 5: Deploying ComplianceChecker...");
    
    const ComplianceChecker = await getContractFactory("ComplianceChecker", "utility");
    const complianceChecker = await ComplianceChecker.deploy({
      gasLimit: 3000000,
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
    const resultsPath = path.join(__dirname, '..', 'deployment-results-missing.json');
    fs.writeFileSync(resultsPath, JSON.stringify(deploymentResults, null, 2));
    console.log("\n💾 Deployment results saved to:", resultsPath);

    // Display summary
    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("📊 Summary:");
    console.log(`  ✅ Successfully deployed ${Object.keys(deployedContracts).length} contracts`);
    console.log(`  💰 Gas used: ~${deploymentLog.reduce((total, log) => total + (log.txHash ? 1 : 0), 0)} transactions`);
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
    
    // Save partial results
    if (Object.keys(deployedContracts).length > 0) {
      const partialResults = {
        network: "Tractsafe",
        chainId: 35935,
        deployer: wallet.address,
        timestamp: new Date().toISOString(),
        contracts: deployedContracts,
        deploymentLog: deploymentLog,
        error: error.message
      };
      
      const resultsPath = path.join(__dirname, '..', 'deployment-results-partial.json');
      fs.writeFileSync(resultsPath, JSON.stringify(partialResults, null, 2));
      console.log("💾 Partial results saved to:", resultsPath);
    }
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });