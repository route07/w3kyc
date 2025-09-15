const { ethers } = require("ethers");
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

async function main() {
  console.log("🚀 Web3 KYC System - Route07 Testnet Deployment");
  console.log("===============================================\n");

  // Check environment variables
  if (!process.env.PRIVATE_KEY) {
    console.log("❌ PRIVATE_KEY environment variable not set");
    console.log("Please set your private key in .env file");
    process.exit(1);
  }

  if (!process.env.NEXT_PUBLIC_RPC_URL) {
    console.log("❌ NEXT_PUBLIC_RPC_URL environment variable not set");
    console.log("Please set your RPC URL in .env file");
    process.exit(1);
  }

  // Create provider and wallet
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  // Check network info
  try {
    const network = await provider.getNetwork();
    console.log("Network:", network);
  } catch (error) {
    console.log("Network info error:", error.message);
  }

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

  const deployedContracts = {};

  try {
    // Deploy storage contracts first
    console.log("\n📦 Deploying Storage Contracts (4/4)...");
    
    // KYCDataStorage
    const kycDataStorageArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'storage', 'KYCDataStorage.sol', 'KYCDataStorage.json'),
      'utf8'
    ));
    const kycDataStorageFactory = new ethers.ContractFactory(
      kycDataStorageArtifact.abi,
      kycDataStorageArtifact.bytecode,
      wallet
    );
    const kycDataStorage = await kycDataStorageFactory.deploy();
    await kycDataStorage.waitForDeployment();
    deployedContracts.KYCDataStorage = await kycDataStorage.getAddress();
    console.log("✅ KYCDataStorage deployed to:", deployedContracts.KYCDataStorage);

    // AuditLogStorage
    const auditLogStorageArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'storage', 'AuditLogStorage.sol', 'AuditLogStorage.json'),
      'utf8'
    ));
    const auditLogStorageFactory = new ethers.ContractFactory(
      auditLogStorageArtifact.abi,
      auditLogStorageArtifact.bytecode,
      wallet
    );
    const auditLogStorage = await auditLogStorageFactory.deploy();
    await auditLogStorage.waitForDeployment();
    deployedContracts.AuditLogStorage = await auditLogStorage.getAddress();
    console.log("✅ AuditLogStorage deployed to:", deployedContracts.AuditLogStorage);

    // TenantConfigStorage
    const tenantConfigStorageArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'storage', 'TenantConfigStorage.sol', 'TenantConfigStorage.json'),
      'utf8'
    ));
    const tenantConfigStorageFactory = new ethers.ContractFactory(
      tenantConfigStorageArtifact.abi,
      tenantConfigStorageArtifact.bytecode,
      wallet
    );
    const tenantConfigStorage = await tenantConfigStorageFactory.deploy();
    await tenantConfigStorage.waitForDeployment();
    deployedContracts.TenantConfigStorage = await tenantConfigStorage.getAddress();
    console.log("✅ TenantConfigStorage deployed to:", deployedContracts.TenantConfigStorage);

    // DIDCredentialStorage
    const didCredentialStorageArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'storage', 'DIDCredentialStorage.sol', 'DIDCredentialStorage.json'),
      'utf8'
    ));
    const didCredentialStorageFactory = new ethers.ContractFactory(
      didCredentialStorageArtifact.abi,
      didCredentialStorageArtifact.bytecode,
      wallet
    );
    const didCredentialStorage = await didCredentialStorageFactory.deploy();
    await didCredentialStorage.waitForDeployment();
    deployedContracts.DIDCredentialStorage = await didCredentialStorage.getAddress();
    console.log("✅ DIDCredentialStorage deployed to:", deployedContracts.DIDCredentialStorage);

    // Deploy business logic contracts
    console.log("\n⚙️ Deploying Business Logic Contracts (2/2)...");
    
    // KYCManager
    const kycManagerArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'business', 'KYCManager.sol', 'KYCManager.json'),
      'utf8'
    ));
    const kycManagerFactory = new ethers.ContractFactory(
      kycManagerArtifact.abi,
      kycManagerArtifact.bytecode,
      wallet
    );
    const kycManager = await kycManagerFactory.deploy(
      deployedContracts.KYCDataStorage,
      deployedContracts.AuditLogStorage,
      deployedContracts.TenantConfigStorage
    );
    await kycManager.waitForDeployment();
    deployedContracts.KYCManager = await kycManager.getAddress();
    console.log("✅ KYCManager deployed to:", deployedContracts.KYCManager);

    // DIDManager
    const didManagerArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'business', 'DIDManager.sol', 'DIDManager.json'),
      'utf8'
    ));
    const didManagerFactory = new ethers.ContractFactory(
      didManagerArtifact.abi,
      didManagerArtifact.bytecode,
      wallet
    );
    const didManager = await didManagerFactory.deploy(
      deployedContracts.DIDCredentialStorage,
      deployedContracts.AuditLogStorage
    );
    await didManager.waitForDeployment();
    deployedContracts.DIDManager = await didManager.getAddress();
    console.log("✅ DIDManager deployed to:", deployedContracts.DIDManager);

    // Deploy access control contracts
    console.log("\n🔐 Deploying Access Control Contracts (1/1)...");
    
    // AuthorizationManager
    const authorizationManagerArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'access', 'AuthorizationManager.sol', 'AuthorizationManager.json'),
      'utf8'
    ));
    const authorizationManagerFactory = new ethers.ContractFactory(
      authorizationManagerArtifact.abi,
      authorizationManagerArtifact.bytecode,
      wallet
    );
    const authorizationManager = await authorizationManagerFactory.deploy(deployedContracts.AuditLogStorage);
    await authorizationManager.waitForDeployment();
    deployedContracts.AuthorizationManager = await authorizationManager.getAddress();
    console.log("✅ AuthorizationManager deployed to:", deployedContracts.AuthorizationManager);

    // Deploy utility contracts
    console.log("\n🛠️ Deploying Utility Contracts (7/7)...");
    
    // ComplianceChecker
    const complianceCheckerArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'utility', 'ComplianceChecker.sol', 'ComplianceChecker.json'),
      'utf8'
    ));
    const complianceCheckerFactory = new ethers.ContractFactory(
      complianceCheckerArtifact.abi,
      complianceCheckerArtifact.bytecode,
      wallet
    );
    const complianceChecker = await complianceCheckerFactory.deploy(
      deployedContracts.KYCDataStorage,
      deployedContracts.TenantConfigStorage,
      deployedContracts.DIDCredentialStorage
    );
    await complianceChecker.waitForDeployment();
    deployedContracts.ComplianceChecker = await complianceChecker.getAddress();
    console.log("✅ ComplianceChecker deployed to:", deployedContracts.ComplianceChecker);

    // InputValidator
    const inputValidatorArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'utility', 'InputValidator.sol', 'InputValidator.json'),
      'utf8'
    ));
    const inputValidatorFactory = new ethers.ContractFactory(
      inputValidatorArtifact.abi,
      inputValidatorArtifact.bytecode,
      wallet
    );
    const inputValidator = await inputValidatorFactory.deploy();
    await inputValidator.waitForDeployment();
    deployedContracts.InputValidator = await inputValidator.getAddress();
    console.log("✅ InputValidator deployed to:", deployedContracts.InputValidator);

    // BoundsChecker
    const boundsCheckerArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'utility', 'BoundsChecker.sol', 'BoundsChecker.json'),
      'utf8'
    ));
    const boundsCheckerFactory = new ethers.ContractFactory(
      boundsCheckerArtifact.abi,
      boundsCheckerArtifact.bytecode,
      wallet
    );
    const boundsChecker = await boundsCheckerFactory.deploy();
    await boundsChecker.waitForDeployment();
    deployedContracts.BoundsChecker = await boundsChecker.getAddress();
    console.log("✅ BoundsChecker deployed to:", deployedContracts.BoundsChecker);

    // JurisdictionConfig
    const jurisdictionConfigArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'utility', 'JurisdictionConfig.sol', 'JurisdictionConfig.json'),
      'utf8'
    ));
    const jurisdictionConfigFactory = new ethers.ContractFactory(
      jurisdictionConfigArtifact.abi,
      jurisdictionConfigArtifact.bytecode,
      wallet
    );
    const jurisdictionConfig = await jurisdictionConfigFactory.deploy();
    await jurisdictionConfig.waitForDeployment();
    deployedContracts.JurisdictionConfig = await jurisdictionConfig.getAddress();
    console.log("✅ JurisdictionConfig deployed to:", deployedContracts.JurisdictionConfig);

    // VersionManager
    const versionManagerArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'utility', 'VersionManager.sol', 'VersionManager.json'),
      'utf8'
    ));
    const versionManagerFactory = new ethers.ContractFactory(
      versionManagerArtifact.abi,
      versionManagerArtifact.bytecode,
      wallet
    );
    const versionManager = await versionManagerFactory.deploy();
    await versionManager.waitForDeployment();
    deployedContracts.VersionManager = await versionManager.getAddress();
    console.log("✅ VersionManager deployed to:", deployedContracts.VersionManager);

    // CredentialTypeManagerRefactored
    const credentialTypeManagerArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'utility', 'CredentialTypeManagerRefactored.sol', 'CredentialTypeManagerRefactored.json'),
      'utf8'
    ));
    const credentialTypeManagerFactory = new ethers.ContractFactory(
      credentialTypeManagerArtifact.abi,
      credentialTypeManagerArtifact.bytecode,
      wallet
    );
    const credentialTypeManager = await credentialTypeManagerFactory.deploy();
    await credentialTypeManager.waitForDeployment();
    deployedContracts.CredentialTypeManagerRefactored = await credentialTypeManager.getAddress();
    console.log("✅ CredentialTypeManagerRefactored deployed to:", deployedContracts.CredentialTypeManagerRefactored);

    // FeatureFlagsRefactored
    const featureFlagsArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'utility', 'FeatureFlagsRefactored.sol', 'FeatureFlagsRefactored.json'),
      'utf8'
    ));
    const featureFlagsFactory = new ethers.ContractFactory(
      featureFlagsArtifact.abi,
      featureFlagsArtifact.bytecode,
      wallet
    );
    const featureFlags = await featureFlagsFactory.deploy();
    await featureFlags.waitForDeployment();
    deployedContracts.FeatureFlagsRefactored = await featureFlags.getAddress();
    console.log("✅ FeatureFlagsRefactored deployed to:", deployedContracts.FeatureFlagsRefactored);

    // Deploy system contracts
    console.log("\n🔧 Deploying System Contracts (3/3)...");
    
    // MultisigManager
    const multisigManagerArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'system', 'MultisigManager.sol', 'MultisigManager.json'),
      'utf8'
    ));
    const multisigManagerFactory = new ethers.ContractFactory(
      multisigManagerArtifact.abi,
      multisigManagerArtifact.bytecode,
      wallet
    );
    const multisigManager = await multisigManagerFactory.deploy();
    await multisigManager.waitForDeployment();
    deployedContracts.MultisigManager = await multisigManager.getAddress();
    console.log("✅ MultisigManager deployed to:", deployedContracts.MultisigManager);

    // MultisigModifier
    const multisigModifierArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'system', 'MultisigModifier.sol', 'MultisigModifier.json'),
      'utf8'
    ));
    const multisigModifierFactory = new ethers.ContractFactory(
      multisigModifierArtifact.abi,
      multisigModifierArtifact.bytecode,
      wallet
    );
    const multisigModifier = await multisigModifierFactory.deploy(deployedContracts.MultisigManager);
    await multisigModifier.waitForDeployment();
    deployedContracts.MultisigModifier = await multisigModifier.getAddress();
    console.log("✅ MultisigModifier deployed to:", deployedContracts.MultisigModifier);

    // EmergencyManager
    const emergencyManagerArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'system', 'EmergencyManager.sol', 'EmergencyManager.json'),
      'utf8'
    ));
    const emergencyManagerFactory = new ethers.ContractFactory(
      emergencyManagerArtifact.abi,
      emergencyManagerArtifact.bytecode,
      wallet
    );
    const emergencyManager = await emergencyManagerFactory.deploy(deployedContracts.MultisigManager);
    await emergencyManager.waitForDeployment();
    deployedContracts.EmergencyManager = await emergencyManager.getAddress();
    console.log("✅ EmergencyManager deployed to:", deployedContracts.EmergencyManager);

    // Deploy governance contracts
    console.log("\n🏛️ Deploying Governance Contracts (1/1)...");
    
    // GovernanceManager
    const governanceManagerArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'governance', 'GovernanceManager.sol', 'GovernanceManager.json'),
      'utf8'
    ));
    const governanceManagerFactory = new ethers.ContractFactory(
      governanceManagerArtifact.abi,
      governanceManagerArtifact.bytecode,
      wallet
    );
    const governanceManager = await governanceManagerFactory.deploy();
    await governanceManager.waitForDeployment();
    deployedContracts.GovernanceManager = await governanceManager.getAddress();
    console.log("✅ GovernanceManager deployed to:", deployedContracts.GovernanceManager);

    // Deploy refactored contracts
    console.log("\n🚀 Deploying Refactored Contracts (1/1)...");
    
    // BatchOperationsRefactored
    const batchOperationsArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'business', 'BatchOperationsRefactored.sol', 'BatchOperationsRefactored.json'),
      'utf8'
    ));
    const batchOperationsFactory = new ethers.ContractFactory(
      batchOperationsArtifact.abi,
      batchOperationsArtifact.bytecode,
      wallet
    );
    const batchOperations = await batchOperationsFactory.deploy(
      deployedContracts.KYCDataStorage,
      deployedContracts.AuditLogStorage,
      deployedContracts.DIDCredentialStorage
    );
    await batchOperations.waitForDeployment();
    deployedContracts.BatchOperationsRefactored = await batchOperations.getAddress();
    console.log("✅ BatchOperationsRefactored deployed to:", deployedContracts.BatchOperationsRefactored);

    // Deploy example contracts
    console.log("\n📚 Deploying Example Contracts (1/1)...");
    
    // MultisigExample
    const multisigExampleArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'examples', 'MultisigExample.sol', 'MultisigExample.json'),
      'utf8'
    ));
    const multisigExampleFactory = new ethers.ContractFactory(
      multisigExampleArtifact.abi,
      multisigExampleArtifact.bytecode,
      wallet
    );
    const multisigExample = await multisigExampleFactory.deploy(deployedContracts.MultisigManager);
    await multisigExample.waitForDeployment();
    deployedContracts.MultisigExample = await multisigExample.getAddress();
    console.log("✅ MultisigExample deployed to:", deployedContracts.MultisigExample);

    // Test basic functionality
    console.log("\n🧪 Testing Basic Functionality...");
    
    // Test KYCDataStorage
    const owner = await kycDataStorage.owner();
    console.log("👤 KYCDataStorage Owner:", owner);
    
    // Test setting authorized writer
    const tx = await kycDataStorage.setAuthorizedWriter(wallet.address, true);
    await tx.wait();
    console.log("✅ Authorized writer set successfully");

    console.log("\n📋 Complete Deployment Summary:");
    console.log("===============================");
    console.log("Network: Route07 Testnet");
    console.log("Deployer:", wallet.address);
    console.log("Deployment Time:", new Date().toISOString());
    console.log(`\nTotal Contracts Deployed: ${Object.keys(deployedContracts).length}/19`);
    console.log("\nContract Addresses:");
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`${name}: ${address}`);
    });

    // Save deployment info
    const deploymentInfo = {
      network: "Route07 Testnet",
      chainId: 336699,
      deployer: wallet.address,
      deploymentTime: new Date().toISOString(),
      totalContracts: Object.keys(deployedContracts).length,
      contracts: deployedContracts
    };

    fs.writeFileSync('deployment-route07.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("\n📄 Deployment info saved to deployment-route07.json");

    console.log("\n🎉 Web3 KYC System - ALL 19 CONTRACTS deployed successfully to Route07!");
    console.log("🎯 Complete system is now operational on Route07 testnet!");
    console.log(`\n🌐 Explorer: ${process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://explorer.route07.com'}`);

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
