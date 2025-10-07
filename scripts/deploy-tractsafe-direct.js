const { ethers } = require("ethers");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Starting Tractsafe deployment...");
  
  // Tractsafe network configuration
  const tractsafeConfig = {
    url: "https://tapi.tractsafe.com",
    chainId: 35935,
    gasPrice: ethers.parseUnits("1", "gwei"), // 1 gwei
    gasLimit: 5000000
  };

  // Create provider
  const provider = new ethers.JsonRpcProvider(tractsafeConfig.url);
  
  // Create wallet from private key
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY environment variable is required");
  }
  
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log("📝 Deploying contracts with account:", wallet.address);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    throw new Error("Insufficient balance to deploy contracts");
  }

  const deployedContracts = {};
  const deploymentLog = [];

  try {
    // Gas settings for Tractsafe network
    const gasSettings = {
      gasLimit: tractsafeConfig.gasLimit,
      gasPrice: tractsafeConfig.gasPrice,
    };

    // Read contract artifacts
    const artifactsDir = path.join(__dirname, '..', 'artifacts', 'contracts');
    
    function getContractArtifact(contractName) {
      // Search for the contract in all subdirectories
      const searchPaths = [
        path.join(artifactsDir, `${contractName}.sol`, `${contractName}.json`),
        path.join(artifactsDir, 'utility', `${contractName}.sol`, `${contractName}.json`),
        path.join(artifactsDir, 'business', `${contractName}.sol`, `${contractName}.json`),
        path.join(artifactsDir, 'storage', `${contractName}.sol`, `${contractName}.json`),
        path.join(artifactsDir, 'access', `${contractName}.sol`, `${contractName}.json`),
        path.join(artifactsDir, 'governance', `${contractName}.sol`, `${contractName}.json`),
        path.join(artifactsDir, 'system', `${contractName}.sol`, `${contractName}.json`),
        path.join(artifactsDir, 'examples', `${contractName}.sol`, `${contractName}.json`)
      ];
      
      for (const contractPath of searchPaths) {
        if (fs.existsSync(contractPath)) {
          return JSON.parse(fs.readFileSync(contractPath, 'utf8'));
        }
      }
      
      throw new Error(`Contract artifact not found for ${contractName}. Searched paths: ${searchPaths.join(', ')}`);
    }

    // 1. Deploy InputValidator
    console.log("\n📝 Deploying InputValidator...");
    const inputValidatorArtifact = getContractArtifact("InputValidator");
    const inputValidatorFactory = new ethers.ContractFactory(
      inputValidatorArtifact.abi,
      inputValidatorArtifact.bytecode,
      wallet
    );
    const inputValidator = await inputValidatorFactory.deploy(gasSettings);
    await inputValidator.waitForDeployment();
    const inputValidatorAddress = await inputValidator.getAddress();
    deployedContracts.InputValidator = inputValidatorAddress;
    deploymentLog.push({
      name: "InputValidator",
      address: inputValidatorAddress,
      txHash: inputValidator.deploymentTransaction()?.hash
    });
    console.log("✅ InputValidator deployed to:", inputValidatorAddress);

    // 2. Deploy BoundsChecker
    console.log("\n📏 Deploying BoundsChecker...");
    const boundsCheckerArtifact = getContractArtifact("BoundsChecker");
    const boundsCheckerFactory = new ethers.ContractFactory(
      boundsCheckerArtifact.abi,
      boundsCheckerArtifact.bytecode,
      wallet
    );
    const boundsChecker = await boundsCheckerFactory.deploy(gasSettings);
    await boundsChecker.waitForDeployment();
    const boundsCheckerAddress = await boundsChecker.getAddress();
    deployedContracts.BoundsChecker = boundsCheckerAddress;
    deploymentLog.push({
      name: "BoundsChecker",
      address: boundsCheckerAddress,
      txHash: boundsChecker.deploymentTransaction()?.hash
    });
    console.log("✅ BoundsChecker deployed to:", boundsCheckerAddress);

    // 3. Deploy KYCDataStorage (needed for ComplianceChecker)
    console.log("\n💾 Deploying KYCDataStorage...");
    const kycDataStorageArtifact = getContractArtifact("KYCDataStorage");
    const kycDataStorageFactory = new ethers.ContractFactory(
      kycDataStorageArtifact.abi,
      kycDataStorageArtifact.bytecode,
      wallet
    );
    const kycDataStorage = await kycDataStorageFactory.deploy(gasSettings);
    await kycDataStorage.waitForDeployment();
    const kycDataStorageAddress = await kycDataStorage.getAddress();
    deployedContracts.KYCDataStorage = kycDataStorageAddress;
    deploymentLog.push({
      name: "KYCDataStorage",
      address: kycDataStorageAddress,
      txHash: kycDataStorage.deploymentTransaction()?.hash
    });
    console.log("✅ KYCDataStorage deployed to:", kycDataStorageAddress);

    // 4. Deploy TenantConfigStorage (needed for ComplianceChecker)
    console.log("\n🏢 Deploying TenantConfigStorage...");
    const tenantConfigStorageArtifact = getContractArtifact("TenantConfigStorage");
    const tenantConfigStorageFactory = new ethers.ContractFactory(
      tenantConfigStorageArtifact.abi,
      tenantConfigStorageArtifact.bytecode,
      wallet
    );
    const tenantConfigStorage = await tenantConfigStorageFactory.deploy(gasSettings);
    await tenantConfigStorage.waitForDeployment();
    const tenantConfigStorageAddress = await tenantConfigStorage.getAddress();
    deployedContracts.TenantConfigStorage = tenantConfigStorageAddress;
    deploymentLog.push({
      name: "TenantConfigStorage",
      address: tenantConfigStorageAddress,
      txHash: tenantConfigStorage.deploymentTransaction()?.hash
    });
    console.log("✅ TenantConfigStorage deployed to:", tenantConfigStorageAddress);

    // 5. Deploy DIDCredentialStorage (needed for ComplianceChecker)
    console.log("\n🎫 Deploying DIDCredentialStorage...");
    const didCredentialStorageArtifact = getContractArtifact("DIDCredentialStorage");
    const didCredentialStorageFactory = new ethers.ContractFactory(
      didCredentialStorageArtifact.abi,
      didCredentialStorageArtifact.bytecode,
      wallet
    );
    const didCredentialStorage = await didCredentialStorageFactory.deploy(gasSettings);
    await didCredentialStorage.waitForDeployment();
    const didCredentialStorageAddress = await didCredentialStorage.getAddress();
    deployedContracts.DIDCredentialStorage = didCredentialStorageAddress;
    deploymentLog.push({
      name: "DIDCredentialStorage",
      address: didCredentialStorageAddress,
      txHash: didCredentialStorage.deploymentTransaction()?.hash
    });
    console.log("✅ DIDCredentialStorage deployed to:", didCredentialStorageAddress);

    // 6. Deploy ComplianceChecker
    console.log("\n🛡️ Deploying ComplianceChecker...");
    const complianceCheckerArtifact = getContractArtifact("ComplianceChecker");
    const complianceCheckerFactory = new ethers.ContractFactory(
      complianceCheckerArtifact.abi,
      complianceCheckerArtifact.bytecode,
      wallet
    );
    const complianceChecker = await complianceCheckerFactory.deploy(
      kycDataStorageAddress,
      tenantConfigStorageAddress,
      didCredentialStorageAddress,
      gasSettings
    );
    await complianceChecker.waitForDeployment();
    const complianceCheckerAddress = await complianceChecker.getAddress();
    deployedContracts.ComplianceChecker = complianceCheckerAddress;
    deploymentLog.push({
      name: "ComplianceChecker",
      address: complianceCheckerAddress,
      txHash: complianceChecker.deploymentTransaction()?.hash
    });
    console.log("✅ ComplianceChecker deployed to:", complianceCheckerAddress);

    // 7. Deploy DIDManager
    console.log("\n🎫 Deploying DIDManager...");
    const didManagerArtifact = getContractArtifact("DIDManager");
    const didManagerFactory = new ethers.ContractFactory(
      didManagerArtifact.abi,
      didManagerArtifact.bytecode,
      wallet
    );
    const didManager = await didManagerFactory.deploy(gasSettings);
    await didManager.waitForDeployment();
    const didManagerAddress = await didManager.getAddress();
    deployedContracts.DIDManager = didManagerAddress;
    deploymentLog.push({
      name: "DIDManager",
      address: didManagerAddress,
      txHash: didManager.deploymentTransaction()?.hash
    });
    console.log("✅ DIDManager deployed to:", didManagerAddress);

    // 8. Deploy RiskAssessment
    console.log("\n⚠️ Deploying RiskAssessment...");
    const riskAssessmentArtifact = getContractArtifact("RiskAssessment");
    const riskAssessmentFactory = new ethers.ContractFactory(
      riskAssessmentArtifact.abi,
      riskAssessmentArtifact.bytecode,
      wallet
    );
    const riskAssessment = await riskAssessmentFactory.deploy(gasSettings);
    await riskAssessment.waitForDeployment();
    const riskAssessmentAddress = await riskAssessment.getAddress();
    deployedContracts.RiskAssessment = riskAssessmentAddress;
    deploymentLog.push({
      name: "RiskAssessment",
      address: riskAssessmentAddress,
      txHash: riskAssessment.deploymentTransaction()?.hash
    });
    console.log("✅ RiskAssessment deployed to:", riskAssessmentAddress);

    // 9. Deploy AuditLogger
    console.log("\n📊 Deploying AuditLogger...");
    const auditLoggerArtifact = getContractArtifact("AuditLogger");
    const auditLoggerFactory = new ethers.ContractFactory(
      auditLoggerArtifact.abi,
      auditLoggerArtifact.bytecode,
      wallet
    );
    const auditLogger = await auditLoggerFactory.deploy(gasSettings);
    await auditLogger.waitForDeployment();
    const auditLoggerAddress = await auditLogger.getAddress();
    deployedContracts.AuditLogger = auditLoggerAddress;
    deploymentLog.push({
      name: "AuditLogger",
      address: auditLoggerAddress,
      txHash: auditLogger.deploymentTransaction()?.hash
    });
    console.log("✅ AuditLogger deployed to:", auditLoggerAddress);

    // 10. Deploy MultisigWallet
    console.log("\n🔐 Deploying MultisigWallet...");
    const multisigWalletArtifact = getContractArtifact("MultisigWallet");
    const multisigWalletFactory = new ethers.ContractFactory(
      multisigWalletArtifact.abi,
      multisigWalletArtifact.bytecode,
      wallet
    );
    const multisigWallet = await multisigWalletFactory.deploy([wallet.address], 1, gasSettings);
    await multisigWallet.waitForDeployment();
    const multisigWalletAddress = await multisigWallet.getAddress();
    deployedContracts.MultisigWallet = multisigWalletAddress;
    deploymentLog.push({
      name: "MultisigWallet",
      address: multisigWalletAddress,
      txHash: multisigWallet.deploymentTransaction()?.hash
    });
    console.log("✅ MultisigWallet deployed to:", multisigWalletAddress);

    // 11. Deploy AuditLogStorage (needed for KYCManager)
    console.log("\n📊 Deploying AuditLogStorage...");
    const auditLogStorageArtifact = getContractArtifact("AuditLogStorage");
    const auditLogStorageFactory = new ethers.ContractFactory(
      auditLogStorageArtifact.abi,
      auditLogStorageArtifact.bytecode,
      wallet
    );
    const auditLogStorage = await auditLogStorageFactory.deploy(gasSettings);
    await auditLogStorage.waitForDeployment();
    const auditLogStorageAddress = await auditLogStorage.getAddress();
    deployedContracts.AuditLogStorage = auditLogStorageAddress;
    deploymentLog.push({
      name: "AuditLogStorage",
      address: auditLogStorageAddress,
      txHash: auditLogStorage.deploymentTransaction()?.hash
    });
    console.log("✅ AuditLogStorage deployed to:", auditLogStorageAddress);

    // 12. Deploy KYCManager with dependencies
    console.log("\n🎯 Deploying KYCManager...");
    const kycManagerArtifact = getContractArtifact("KYCManager");
    const kycManagerFactory = new ethers.ContractFactory(
      kycManagerArtifact.abi,
      kycManagerArtifact.bytecode,
      wallet
    );
    const kycManager = await kycManagerFactory.deploy(
      kycDataStorageAddress,
      auditLogStorageAddress,
      tenantConfigStorageAddress,
      gasSettings
    );
    await kycManager.waitForDeployment();
    const kycManagerAddress = await kycManager.getAddress();
    deployedContracts.KYCManager = kycManagerAddress;
    deploymentLog.push({
      name: "KYCManager",
      address: kycManagerAddress,
      txHash: kycManager.deploymentTransaction()?.hash
    });
    console.log("✅ KYCManager deployed to:", kycManagerAddress);

    // Final balance check
    const finalBalance = await provider.getBalance(wallet.address);
    const gasUsed = balance - finalBalance;
    console.log("\n💰 Gas used:", ethers.formatEther(gasUsed), "ETH");
    console.log("💰 Remaining balance:", ethers.formatEther(finalBalance), "ETH");

    // Save deployment results
    const deploymentResults = {
      network: "tractsafe",
      chainId: 35935,
      deployer: wallet.address,
      timestamp: new Date().toISOString(),
      contracts: deployedContracts,
      deploymentLog: deploymentLog,
      gasUsed: ethers.formatEther(gasUsed),
      finalBalance: ethers.formatEther(finalBalance)
    };

    // Write to file
    const deploymentFile = path.join(__dirname, '..', 'deployments', 'tractsafe-deployment.json');
    
    // Ensure deployments directory exists
    const deploymentsDir = path.dirname(deploymentFile);
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentResults, null, 2));
    console.log("\n📁 Deployment results saved to:", deploymentFile);

    // Generate .env format
    console.log("\n📋 Add these to your .env.local file:");
    console.log("=" .repeat(50));
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`NEXT_PUBLIC_${name.toUpperCase()}_ADDRESS=${address}`);
    });
    console.log("=" .repeat(50));

    console.log("\n🎉 All contracts deployed successfully to Tractsafe network!");
    console.log(`📊 Total contracts deployed: ${Object.keys(deployedContracts).length}`);
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
