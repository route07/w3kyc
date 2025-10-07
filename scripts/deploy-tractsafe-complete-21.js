const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function main() {
  console.log("🚀 Starting Tractsafe complete deployment (21 contracts)...");
  
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

    // Deploy contracts in dependency order

    // PHASE 1: Storage Contracts (no dependencies)
    console.log("\n🏗️ PHASE 1: Deploying Storage Contracts...");

    // 1. KYCDataStorage (already deployed, but let's redeploy for completeness)
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

    // 2. TenantConfigStorage
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

    // 3. AuditLogStorage
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

    // 4. DIDCredentialStorage
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

    // PHASE 2: Utility Contracts
    console.log("\n🔧 PHASE 2: Deploying Utility Contracts...");

    // 5. InputValidator
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

    // 6. BoundsChecker
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

    // 7. ComplianceChecker
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

    // 8. FeatureFlags
    console.log("\n🚩 Deploying FeatureFlags...");
    const FeatureFlags = await getContractFactory("FeatureFlags", "utility");
    const featureFlags = await FeatureFlags.deploy({
      gasLimit: 2000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await featureFlags.waitForDeployment();
    const featureFlagsAddress = await featureFlags.getAddress();
    deployedContracts.FeatureFlags = featureFlagsAddress;
    deploymentLog.push({
      name: "FeatureFlags",
      address: featureFlagsAddress,
      txHash: featureFlags.deploymentTransaction()?.hash
    });
    console.log("✅ FeatureFlags deployed to:", featureFlagsAddress);

    // 9. JurisdictionConfig
    console.log("\n🌍 Deploying JurisdictionConfig...");
    const JurisdictionConfig = await getContractFactory("JurisdictionConfig", "utility");
    const jurisdictionConfig = await JurisdictionConfig.deploy({
      gasLimit: 2000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await jurisdictionConfig.waitForDeployment();
    const jurisdictionConfigAddress = await jurisdictionConfig.getAddress();
    deployedContracts.JurisdictionConfig = jurisdictionConfigAddress;
    deploymentLog.push({
      name: "JurisdictionConfig",
      address: jurisdictionConfigAddress,
      txHash: jurisdictionConfig.deploymentTransaction()?.hash
    });
    console.log("✅ JurisdictionConfig deployed to:", jurisdictionConfigAddress);

    // 10. VersionManager
    console.log("\n📋 Deploying VersionManager...");
    const VersionManager = await getContractFactory("VersionManager", "utility");
    const versionManager = await VersionManager.deploy({
      gasLimit: 2000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await versionManager.waitForDeployment();
    const versionManagerAddress = await versionManager.getAddress();
    deployedContracts.VersionManager = versionManagerAddress;
    deploymentLog.push({
      name: "VersionManager",
      address: versionManagerAddress,
      txHash: versionManager.deploymentTransaction()?.hash
    });
    console.log("✅ VersionManager deployed to:", versionManagerAddress);

    // 11. CredentialTypeManager
    console.log("\n🎫 Deploying CredentialTypeManager...");
    const CredentialTypeManager = await getContractFactory("CredentialTypeManager", "utility");
    const credentialTypeManager = await CredentialTypeManager.deploy({
      gasLimit: 2000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await credentialTypeManager.waitForDeployment();
    const credentialTypeManagerAddress = await credentialTypeManager.getAddress();
    deployedContracts.CredentialTypeManager = credentialTypeManagerAddress;
    deploymentLog.push({
      name: "CredentialTypeManager",
      address: credentialTypeManagerAddress,
      txHash: credentialTypeManager.deploymentTransaction()?.hash
    });
    console.log("✅ CredentialTypeManager deployed to:", credentialTypeManagerAddress);

    // PHASE 3: System Contracts
    console.log("\n⚙️ PHASE 3: Deploying System Contracts...");

    // 12. MultisigManager
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

    // 13. MultisigModifier
    console.log("\n🔧 Deploying MultisigModifier...");
    const MultisigModifier = await getContractFactory("MultisigModifier", "system");
    const multisigModifier = await MultisigModifier.deploy(multisigManagerAddress, {
      gasLimit: 3000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await multisigModifier.waitForDeployment();
    const multisigModifierAddress = await multisigModifier.getAddress();
    deployedContracts.MultisigModifier = multisigModifierAddress;
    deploymentLog.push({
      name: "MultisigModifier",
      address: multisigModifierAddress,
      txHash: multisigModifier.deploymentTransaction()?.hash
    });
    console.log("✅ MultisigModifier deployed to:", multisigModifierAddress);

    // 14. EmergencyManager
    console.log("\n🚨 Deploying EmergencyManager...");
    const EmergencyManager = await getContractFactory("EmergencyManager", "system");
    const emergencyManager = await EmergencyManager.deploy(multisigManagerAddress, {
      gasLimit: 3000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await emergencyManager.waitForDeployment();
    const emergencyManagerAddress = await emergencyManager.getAddress();
    deployedContracts.EmergencyManager = emergencyManagerAddress;
    deploymentLog.push({
      name: "EmergencyManager",
      address: emergencyManagerAddress,
      txHash: emergencyManager.deploymentTransaction()?.hash
    });
    console.log("✅ EmergencyManager deployed to:", emergencyManagerAddress);

    // PHASE 4: Business Logic Contracts
    console.log("\n💼 PHASE 4: Deploying Business Logic Contracts...");

    // 15. KYCManager
    console.log("\n🎯 Deploying KYCManager...");
    const KYCManager = await getContractFactory("KYCManager", "business");
    const kycManager = await KYCManager.deploy(
      kycDataStorageAddress,
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

    // 16. DIDManager
    console.log("\n🆔 Deploying DIDManager...");
    const DIDManager = await getContractFactory("DIDManager", "business");
    const didManager = await DIDManager.deploy(
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

    // 17. BatchOperationsSimple
    console.log("\n📦 Deploying BatchOperationsSimple...");
    const BatchOperationsSimple = await getContractFactory("BatchOperationsSimple", "business");
    const batchOperationsSimple = await BatchOperationsSimple.deploy(
      kycDataStorageAddress,
      auditLogStorageAddress,
      {
        gasLimit: 4000000,
        gasPrice: ethers.parseUnits("1", "gwei"),
      }
    );
    await batchOperationsSimple.waitForDeployment();
    const batchOperationsSimpleAddress = await batchOperationsSimple.getAddress();
    deployedContracts.BatchOperationsSimple = batchOperationsSimpleAddress;
    deploymentLog.push({
      name: "BatchOperationsSimple",
      address: batchOperationsSimpleAddress,
      txHash: batchOperationsSimple.deploymentTransaction()?.hash
    });
    console.log("✅ BatchOperationsSimple deployed to:", batchOperationsSimpleAddress);

    // PHASE 5: Access Control Contracts
    console.log("\n🔒 PHASE 5: Deploying Access Control Contracts...");

    // 18. AuthorizationManager
    console.log("\n👤 Deploying AuthorizationManager...");
    const AuthorizationManager = await getContractFactory("AuthorizationManager", "access");
    const authorizationManager = await AuthorizationManager.deploy(auditLogStorageAddress, {
      gasLimit: 3000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await authorizationManager.waitForDeployment();
    const authorizationManagerAddress = await authorizationManager.getAddress();
    deployedContracts.AuthorizationManager = authorizationManagerAddress;
    deploymentLog.push({
      name: "AuthorizationManager",
      address: authorizationManagerAddress,
      txHash: authorizationManager.deploymentTransaction()?.hash
    });
    console.log("✅ AuthorizationManager deployed to:", authorizationManagerAddress);

    // PHASE 6: Governance Contracts
    console.log("\n🏛️ PHASE 6: Deploying Governance Contracts...");

    // 19. GovernanceManager
    console.log("\n🏛️ Deploying GovernanceManager...");
    const GovernanceManager = await getContractFactory("GovernanceManager", "governance");
    const governanceManager = await GovernanceManager.deploy({
      gasLimit: 3000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await governanceManager.waitForDeployment();
    const governanceManagerAddress = await governanceManager.getAddress();
    deployedContracts.GovernanceManager = governanceManagerAddress;
    deploymentLog.push({
      name: "GovernanceManager",
      address: governanceManagerAddress,
      txHash: governanceManager.deploymentTransaction()?.hash
    });
    console.log("✅ GovernanceManager deployed to:", governanceManagerAddress);

    // PHASE 7: Example Contracts
    console.log("\n📚 PHASE 7: Deploying Example Contracts...");

    // 20. MultisigExample
    console.log("\n🔐 Deploying MultisigExample...");
    const MultisigExample = await getContractFactory("MultisigExample", "examples");
    const multisigExample = await MultisigExample.deploy(multisigManagerAddress, {
      gasLimit: 3000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await multisigExample.waitForDeployment();
    const multisigExampleAddress = await multisigExample.getAddress();
    deployedContracts.MultisigExample = multisigExampleAddress;
    deploymentLog.push({
      name: "MultisigExample",
      address: multisigExampleAddress,
      txHash: multisigExample.deploymentTransaction()?.hash
    });
    console.log("✅ MultisigExample deployed to:", multisigExampleAddress);

    // 21. SimpleTest
    console.log("\n🧪 Deploying SimpleTest...");
    const SimpleTest = await getContractFactory("SimpleTest", "test");
    const simpleTest = await SimpleTest.deploy({
      gasLimit: 2000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await simpleTest.waitForDeployment();
    const simpleTestAddress = await simpleTest.getAddress();
    deployedContracts.SimpleTest = simpleTestAddress;
    deploymentLog.push({
      name: "SimpleTest",
      address: simpleTestAddress,
      txHash: simpleTest.deploymentTransaction()?.hash
    });
    console.log("✅ SimpleTest deployed to:", simpleTestAddress);

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
    const deploymentFile = path.join(__dirname, '..', 'deployments', 'tractsafe-complete-21-deployment.json');
    
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

    console.log("\n🎉 All 21 contracts deployed successfully to Tractsafe network!");
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
