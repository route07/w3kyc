const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function main() {
  console.log("🚀 Starting Tractsafe actual deployment...");
  
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

    // Deploy contracts that exist and work independently

    // 1. Deploy InputValidator (no constructor args)
    console.log("\n📝 Deploying InputValidator...");
    const InputValidator = await getContractFactory("InputValidator", "utility");
    const inputValidator = await InputValidator.deploy({
      gasLimit: 2000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await inputValidator.waitForDeployment();
    const inputValidatorAddress = await inputValidator.getAddress();
    deployedContracts.InputValidator = inputValidatorAddress;
    deploymentLog.push({
      name: "InputValidator",
      address: inputValidatorAddress,
      txHash: inputValidator.deploymentTransaction()?.hash
    });
    console.log("✅ InputValidator deployed to:", inputValidatorAddress);

    // 2. Deploy BoundsChecker (no constructor args)
    console.log("\n📏 Deploying BoundsChecker...");
    const BoundsChecker = await getContractFactory("BoundsChecker", "utility");
    const boundsChecker = await BoundsChecker.deploy({
      gasLimit: 2000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await boundsChecker.waitForDeployment();
    const boundsCheckerAddress = await boundsChecker.getAddress();
    deployedContracts.BoundsChecker = boundsCheckerAddress;
    deploymentLog.push({
      name: "BoundsChecker",
      address: boundsCheckerAddress,
      txHash: boundsChecker.deploymentTransaction()?.hash
    });
    console.log("✅ BoundsChecker deployed to:", boundsCheckerAddress);

    // 3. Deploy KYCDataStorage (no constructor args)
    console.log("\n💾 Deploying KYCDataStorage...");
    const KYCDataStorage = await getContractFactory("KYCDataStorage", "storage");
    const kycDataStorage = await KYCDataStorage.deploy({
      gasLimit: 3000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await kycDataStorage.waitForDeployment();
    const kycDataStorageAddress = await kycDataStorage.getAddress();
    deployedContracts.KYCDataStorage = kycDataStorageAddress;
    deploymentLog.push({
      name: "KYCDataStorage",
      address: kycDataStorageAddress,
      txHash: kycDataStorage.deploymentTransaction()?.hash
    });
    console.log("✅ KYCDataStorage deployed to:", kycDataStorageAddress);

    // 4. Deploy TenantConfigStorage (no constructor args)
    console.log("\n🏢 Deploying TenantConfigStorage...");
    const TenantConfigStorage = await getContractFactory("TenantConfigStorage", "storage");
    const tenantConfigStorage = await TenantConfigStorage.deploy({
      gasLimit: 3000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await tenantConfigStorage.waitForDeployment();
    const tenantConfigStorageAddress = await tenantConfigStorage.getAddress();
    deployedContracts.TenantConfigStorage = tenantConfigStorageAddress;
    deploymentLog.push({
      name: "TenantConfigStorage",
      address: tenantConfigStorageAddress,
      txHash: tenantConfigStorage.deploymentTransaction()?.hash
    });
    console.log("✅ TenantConfigStorage deployed to:", tenantConfigStorageAddress);

    // 5. Deploy AuditLogStorage (no constructor args)
    console.log("\n📊 Deploying AuditLogStorage...");
    const AuditLogStorage = await getContractFactory("AuditLogStorage", "storage");
    const auditLogStorage = await AuditLogStorage.deploy({
      gasLimit: 3000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await auditLogStorage.waitForDeployment();
    const auditLogStorageAddress = await auditLogStorage.getAddress();
    deployedContracts.AuditLogStorage = auditLogStorageAddress;
    deploymentLog.push({
      name: "AuditLogStorage",
      address: auditLogStorageAddress,
      txHash: auditLogStorage.deploymentTransaction()?.hash
    });
    console.log("✅ AuditLogStorage deployed to:", auditLogStorageAddress);

    // 6. Deploy DIDCredentialStorage (no constructor args)
    console.log("\n🎫 Deploying DIDCredentialStorage...");
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
      txHash: didCredentialStorage.deploymentTransaction()?.hash
    });
    console.log("✅ DIDCredentialStorage deployed to:", didCredentialStorageAddress);

    // 7. Deploy ComplianceChecker with storage addresses
    console.log("\n🛡️ Deploying ComplianceChecker...");
    const ComplianceChecker = await getContractFactory("ComplianceChecker", "utility");
    const complianceChecker = await ComplianceChecker.deploy(
      kycDataStorageAddress,
      tenantConfigStorageAddress,
      didCredentialStorageAddress,
      {
        gasLimit: 3000000,
        gasPrice: ethers.parseUnits("1", "gwei"),
      }
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

    // 8. Deploy KYCManager
    console.log("\n🎯 Deploying KYCManager...");
    const KYCManager = await getContractFactory("KYCManager", "business");
    const kycManager = await KYCManager.deploy(
      inputValidatorAddress,
      boundsCheckerAddress,
      complianceCheckerAddress,
      auditLogStorageAddress,
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
      txHash: kycManager.deploymentTransaction()?.hash
    });
    console.log("✅ KYCManager deployed to:", kycManagerAddress);

    // 9. Deploy DIDManager
    console.log("\n🆔 Deploying DIDManager...");
    const DIDManager = await getContractFactory("DIDManager", "business");
    const didManager = await DIDManager.deploy(
      kycManagerAddress,
      didCredentialStorageAddress,
      auditLogStorageAddress,
      {
        gasLimit: 4000000,
        gasPrice: ethers.parseUnits("1", "gwei"),
      }
    );
    await didManager.waitForDeployment();
    const didManagerAddress = await didManager.getAddress();
    deployedContracts.DIDManager = didManagerAddress;
    deploymentLog.push({
      name: "DIDManager",
      address: didManagerAddress,
      txHash: didManager.deploymentTransaction()?.hash
    });
    console.log("✅ DIDManager deployed to:", didManagerAddress);

    // 10. Deploy MultisigManager
    console.log("\n🔐 Deploying MultisigManager...");
    const MultisigManager = await getContractFactory("MultisigManager", "system");
    const multisigManager = await MultisigManager.deploy([wallet.address], 1, {
      gasLimit: 4000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await multisigManager.waitForDeployment();
    const multisigManagerAddress = await multisigManager.getAddress();
    deployedContracts.MultisigManager = multisigManagerAddress;
    deploymentLog.push({
      name: "MultisigManager",
      address: multisigManagerAddress,
      txHash: multisigManager.deploymentTransaction()?.hash
    });
    console.log("✅ MultisigManager deployed to:", multisigManagerAddress);

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
    const deploymentFile = path.join(__dirname, '..', 'deployments', 'tractsafe-actual-deployment.json');
    
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

    console.log("\n🎉 Contracts deployed successfully to Tractsafe network!");
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
