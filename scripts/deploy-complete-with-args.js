const { ethers } = require("ethers");
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

async function main() {
  console.log("🚀 Web3 KYC System - Complete Deployment with Constructor Arguments");
  console.log("==================================================================\n");

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

  const deployedContracts = {};
  const failedContracts = [];

  try {
    console.log("\n📦 Phase 1: Deploying Storage Contracts...");
    
    // 1. Deploy storage contracts first (no dependencies)
    console.log("1. Deploying KYCDataStorage...");
    const kycStorageArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'storage', 'KYCDataStorage.sol', 'KYCDataStorage.json'),
      'utf8'
    ));
    const kycStorageFactory = new ethers.ContractFactory(
      kycStorageArtifact.abi,
      kycStorageArtifact.bytecode,
      wallet
    );
    const kycStorage = await kycStorageFactory.deploy();
    await kycStorage.waitForDeployment();
    deployedContracts.KYCDataStorage = await kycStorage.getAddress();
    console.log("✅ KYCDataStorage deployed to:", deployedContracts.KYCDataStorage);

    console.log("2. Deploying AuditLogStorage...");
    const auditLogArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'storage', 'AuditLogStorage.sol', 'AuditLogStorage.json'),
      'utf8'
    ));
    const auditLogFactory = new ethers.ContractFactory(
      auditLogArtifact.abi,
      auditLogArtifact.bytecode,
      wallet
    );
    const auditLog = await auditLogFactory.deploy();
    await auditLog.waitForDeployment();
    deployedContracts.AuditLogStorage = await auditLog.getAddress();
    console.log("✅ AuditLogStorage deployed to:", deployedContracts.AuditLogStorage);

    console.log("3. Deploying TenantConfigStorage...");
    const tenantConfigArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'storage', 'TenantConfigStorage.sol', 'TenantConfigStorage.json'),
      'utf8'
    ));
    const tenantConfigFactory = new ethers.ContractFactory(
      tenantConfigArtifact.abi,
      tenantConfigArtifact.bytecode,
      wallet
    );
    const tenantConfig = await tenantConfigFactory.deploy();
    await tenantConfig.waitForDeployment();
    deployedContracts.TenantConfigStorage = await tenantConfig.getAddress();
    console.log("✅ TenantConfigStorage deployed to:", deployedContracts.TenantConfigStorage);

    console.log("4. Deploying DIDCredentialStorage...");
    const didCredentialArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'storage', 'DIDCredentialStorage.sol', 'DIDCredentialStorage.json'),
      'utf8'
    ));
    const didCredentialFactory = new ethers.ContractFactory(
      didCredentialArtifact.abi,
      didCredentialArtifact.bytecode,
      wallet
    );
    const didCredential = await didCredentialFactory.deploy();
    await didCredential.waitForDeployment();
    deployedContracts.DIDCredentialStorage = await didCredential.getAddress();
    console.log("✅ DIDCredentialStorage deployed to:", deployedContracts.DIDCredentialStorage);

    console.log("\n📦 Phase 2: Deploying Utility Contracts...");
    
    // 5. Deploy utility contracts (no dependencies)
    console.log("5. Deploying InputValidator...");
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

    console.log("6. Deploying BoundsChecker...");
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

    console.log("7. Deploying JurisdictionConfig...");
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

    console.log("8. Deploying VersionManager...");
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

    console.log("9. Deploying CredentialTypeManagerRefactored...");
    const credentialTypeArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'utility', 'CredentialTypeManagerRefactored.sol', 'CredentialTypeManagerRefactored.json'),
      'utf8'
    ));
    const credentialTypeFactory = new ethers.ContractFactory(
      credentialTypeArtifact.abi,
      credentialTypeArtifact.bytecode,
      wallet
    );
    const credentialType = await credentialTypeFactory.deploy();
    await credentialType.waitForDeployment();
    deployedContracts.CredentialTypeManagerRefactored = await credentialType.getAddress();
    console.log("✅ CredentialTypeManagerRefactored deployed to:", deployedContracts.CredentialTypeManagerRefactored);

    console.log("10. Deploying FeatureFlagsRefactored...");
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

    console.log("\n📦 Phase 3: Deploying System Contracts...");
    
    // 11. Deploy MultisigManager (no dependencies)
    console.log("11. Deploying MultisigManager...");
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

    // 12. Deploy MultisigModifier (depends on MultisigManager)
    console.log("12. Deploying MultisigModifier...");
    try {
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
    } catch (error) {
      console.log("❌ MultisigModifier deployment failed:", error.message);
      failedContracts.push({ name: "MultisigModifier", error: error.message });
    }

    // 13. Deploy EmergencyManager (depends on MultisigManager)
    console.log("13. Deploying EmergencyManager...");
    try {
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
    } catch (error) {
      console.log("❌ EmergencyManager deployment failed:", error.message);
      failedContracts.push({ name: "EmergencyManager", error: error.message });
    }

    console.log("\n📦 Phase 4: Deploying Access Control Contracts...");
    
    // 14. Deploy AuthorizationManager (depends on AuditLogStorage)
    console.log("14. Deploying AuthorizationManager...");
    try {
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
    } catch (error) {
      console.log("❌ AuthorizationManager deployment failed:", error.message);
      failedContracts.push({ name: "AuthorizationManager", error: error.message });
    }

    console.log("\n📦 Phase 5: Deploying Business Logic Contracts...");
    
    // 15. Deploy KYCManager (depends on storage contracts)
    console.log("15. Deploying KYCManager...");
    try {
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
    } catch (error) {
      console.log("❌ KYCManager deployment failed:", error.message);
      failedContracts.push({ name: "KYCManager", error: error.message });
    }

    // 16. Deploy DIDManager (depends on storage contracts)
    console.log("16. Deploying DIDManager...");
    try {
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
    } catch (error) {
      console.log("❌ DIDManager deployment failed:", error.message);
      failedContracts.push({ name: "DIDManager", error: error.message });
    }

    // 17. Deploy BatchOperationsSimple (depends on storage contracts)
    console.log("17. Deploying BatchOperationsSimple...");
    try {
      const batchOpsSimpleArtifact = JSON.parse(fs.readFileSync(
        path.join(__dirname, '..', 'artifacts', 'contracts', 'business', 'BatchOperationsSimple.sol', 'BatchOperationsSimple.json'),
        'utf8'
      ));
      const batchOpsSimpleFactory = new ethers.ContractFactory(
        batchOpsSimpleArtifact.abi,
        batchOpsSimpleArtifact.bytecode,
        wallet
      );
      const batchOpsSimple = await batchOpsSimpleFactory.deploy(
        deployedContracts.KYCDataStorage,
        deployedContracts.AuditLogStorage,
        deployedContracts.DIDCredentialStorage
      );
      await batchOpsSimple.waitForDeployment();
      deployedContracts.BatchOperationsSimple = await batchOpsSimple.getAddress();
      console.log("✅ BatchOperationsSimple deployed to:", deployedContracts.BatchOperationsSimple);
    } catch (error) {
      console.log("❌ BatchOperationsSimple deployment failed:", error.message);
      failedContracts.push({ name: "BatchOperationsSimple", error: error.message });
    }

    // 18. Deploy BatchOperationsRefactored (depends on storage contracts)
    console.log("18. Deploying BatchOperationsRefactored...");
    try {
      const batchOpsRefactoredArtifact = JSON.parse(fs.readFileSync(
        path.join(__dirname, '..', 'artifacts', 'contracts', 'business', 'BatchOperationsRefactored.sol', 'BatchOperationsRefactored.json'),
        'utf8'
      ));
      const batchOpsRefactoredFactory = new ethers.ContractFactory(
        batchOpsRefactoredArtifact.abi,
        batchOpsRefactoredArtifact.bytecode,
        wallet
      );
      const batchOpsRefactored = await batchOpsRefactoredFactory.deploy(
        deployedContracts.KYCDataStorage,
        deployedContracts.AuditLogStorage,
        deployedContracts.DIDCredentialStorage
      );
      await batchOpsRefactored.waitForDeployment();
      deployedContracts.BatchOperationsRefactored = await batchOpsRefactored.getAddress();
      console.log("✅ BatchOperationsRefactored deployed to:", deployedContracts.BatchOperationsRefactored);
    } catch (error) {
      console.log("❌ BatchOperationsRefactored deployment failed:", error.message);
      failedContracts.push({ name: "BatchOperationsRefactored", error: error.message });
    }

    console.log("\n📦 Phase 6: Deploying Compliance and Governance...");
    
    // 19. Deploy ComplianceChecker (depends on storage contracts)
    console.log("19. Deploying ComplianceChecker...");
    try {
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
    } catch (error) {
      console.log("❌ ComplianceChecker deployment failed:", error.message);
      failedContracts.push({ name: "ComplianceChecker", error: error.message });
    }

    // 20. Deploy GovernanceManager (no dependencies)
    console.log("20. Deploying GovernanceManager...");
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

    // 21. Deploy MultisigExample (depends on MultisigModifier)
    console.log("21. Deploying MultisigExample...");
    try {
      const multisigExampleArtifact = JSON.parse(fs.readFileSync(
        path.join(__dirname, '..', 'artifacts', 'contracts', 'examples', 'MultisigExample.sol', 'MultisigExample.json'),
        'utf8'
      ));
      const multisigExampleFactory = new ethers.ContractFactory(
        multisigExampleArtifact.abi,
        multisigExampleArtifact.bytecode,
        wallet
      );
      const multisigExample = await multisigExampleFactory.deploy(deployedContracts.MultisigModifier);
      await multisigExample.waitForDeployment();
      deployedContracts.MultisigExample = await multisigExample.getAddress();
      console.log("✅ MultisigExample deployed to:", deployedContracts.MultisigExample);
    } catch (error) {
      console.log("❌ MultisigExample deployment failed:", error.message);
      failedContracts.push({ name: "MultisigExample", error: error.message });
    }

    console.log("\n📋 Complete Deployment Summary:");
    console.log("===============================");
    console.log("Network: Route07 Testnet");
    console.log("EVM Version: London");
    console.log("Deployer:", wallet.address);
    console.log("Deployment Time:", new Date().toISOString());
    console.log(`\nTotal Contracts Deployed: ${Object.keys(deployedContracts).length}/21`);
    
    if (failedContracts.length > 0) {
      console.log(`\nFailed Contracts: ${failedContracts.length}`);
      failedContracts.forEach(contract => {
        console.log(`❌ ${contract.name}: ${contract.error}`);
      });
    }

    console.log("\n✅ Successfully Deployed Contracts:");
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`${name}: ${address}`);
    });

    // Analysis
    const successRate = (Object.keys(deployedContracts).length / 21) * 100;
    console.log(`\n🎯 Deployment Success Rate: ${successRate.toFixed(1)}%`);
    
    if (successRate === 100) {
      console.log("🎉 PERFECT! All contracts deployed successfully with London EVM!");
      console.log("🚀 Route07 compatibility issues completely resolved!");
    } else if (successRate >= 90) {
      console.log("🎉 EXCELLENT! Nearly all contracts deployed successfully!");
      console.log("🔍 Minor issues with a few contracts");
    } else if (successRate >= 50) {
      console.log("🟡 GOOD! Most contracts deployed successfully!");
      console.log("📈 Significant improvement over Shanghai EVM");
    } else {
      console.log("⚠️ PARTIAL SUCCESS! Some contracts deployed successfully");
      console.log("🔍 Further investigation needed");
    }

    // Save deployment info
    const deploymentInfo = {
      network: "Route07 Testnet",
      chainId: 336699,
      evmVersion: "london",
      deployer: wallet.address,
      deploymentTime: new Date().toISOString(),
      totalContracts: 21,
      deployedContracts: Object.keys(deployedContracts).length,
      successRate: successRate,
      contracts: deployedContracts,
      failedContracts: failedContracts,
      analysis: `London EVM with constructor arguments - ${successRate.toFixed(1)}% success rate`,
      status: successRate === 100 ? "Complete deployment success" : "Partial deployment success"
    };

    fs.writeFileSync('deployment-london-complete-with-args.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("\n📄 Deployment info saved to deployment-london-complete-with-args.json");

    console.log("\n🌐 Explorer: https://explorer.route07.com");
    console.log("\n📋 Next Steps:");
    console.log("   1. Test deployed contracts functionality");
    console.log("   2. Update documentation with complete deployment success");
    console.log("   3. Consider mainnet deployment with London EVM");

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