const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Web3 KYC System - Complete Deployment (All 19 Contracts)");
  console.log("========================================================\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  const deployedContracts = {};

  try {
    // Deploy storage contracts first
    console.log("\n📦 Deploying Storage Contracts (4/4)...");
    
    const KYCDataStorage = await ethers.getContractFactory("KYCDataStorage");
    const kycDataStorage = await KYCDataStorage.deploy();
    await kycDataStorage.waitForDeployment();
    deployedContracts.KYCDataStorage = await kycDataStorage.getAddress();
    console.log("✅ KYCDataStorage deployed to:", deployedContracts.KYCDataStorage);

    const AuditLogStorage = await ethers.getContractFactory("AuditLogStorage");
    const auditLogStorage = await AuditLogStorage.deploy();
    await auditLogStorage.waitForDeployment();
    deployedContracts.AuditLogStorage = await auditLogStorage.getAddress();
    console.log("✅ AuditLogStorage deployed to:", deployedContracts.AuditLogStorage);

    const TenantConfigStorage = await ethers.getContractFactory("TenantConfigStorage");
    const tenantConfigStorage = await TenantConfigStorage.deploy();
    await tenantConfigStorage.waitForDeployment();
    deployedContracts.TenantConfigStorage = await tenantConfigStorage.getAddress();
    console.log("✅ TenantConfigStorage deployed to:", deployedContracts.TenantConfigStorage);

    const DIDCredentialStorage = await ethers.getContractFactory("DIDCredentialStorage");
    const didCredentialStorage = await DIDCredentialStorage.deploy();
    await didCredentialStorage.waitForDeployment();
    deployedContracts.DIDCredentialStorage = await didCredentialStorage.getAddress();
    console.log("✅ DIDCredentialStorage deployed to:", deployedContracts.DIDCredentialStorage);

    // Deploy business logic contracts
    console.log("\n⚙️ Deploying Business Logic Contracts (2/2)...");
    
    const KYCManager = await ethers.getContractFactory("KYCManager");
    const kycManager = await KYCManager.deploy(
      deployedContracts.KYCDataStorage,
      deployedContracts.AuditLogStorage,
      deployedContracts.TenantConfigStorage
    );
    await kycManager.waitForDeployment();
    deployedContracts.KYCManager = await kycManager.getAddress();
    console.log("✅ KYCManager deployed to:", deployedContracts.KYCManager);

    const DIDManager = await ethers.getContractFactory("DIDManager");
    const didManager = await DIDManager.deploy(
      deployedContracts.DIDCredentialStorage,
      deployedContracts.AuditLogStorage
    );
    await didManager.waitForDeployment();
    deployedContracts.DIDManager = await didManager.getAddress();
    console.log("✅ DIDManager deployed to:", deployedContracts.DIDManager);

    // Deploy access control contracts
    console.log("\n🔐 Deploying Access Control Contracts (1/1)...");
    
    const AuthorizationManager = await ethers.getContractFactory("AuthorizationManager");
    const authorizationManager = await AuthorizationManager.deploy(deployedContracts.AuditLogStorage);
    await authorizationManager.waitForDeployment();
    deployedContracts.AuthorizationManager = await authorizationManager.getAddress();
    console.log("✅ AuthorizationManager deployed to:", deployedContracts.AuthorizationManager);

    // Deploy utility contracts
    console.log("\n🛠️ Deploying Utility Contracts (7/7)...");
    
    const ComplianceChecker = await ethers.getContractFactory("ComplianceChecker");
    const complianceChecker = await ComplianceChecker.deploy(
      deployedContracts.KYCDataStorage,
      deployedContracts.TenantConfigStorage,
      deployedContracts.DIDCredentialStorage
    );
    await complianceChecker.waitForDeployment();
    deployedContracts.ComplianceChecker = await complianceChecker.getAddress();
    console.log("✅ ComplianceChecker deployed to:", deployedContracts.ComplianceChecker);

    const InputValidator = await ethers.getContractFactory("InputValidator");
    const inputValidator = await InputValidator.deploy();
    await inputValidator.waitForDeployment();
    deployedContracts.InputValidator = await inputValidator.getAddress();
    console.log("✅ InputValidator deployed to:", deployedContracts.InputValidator);

    const BoundsChecker = await ethers.getContractFactory("BoundsChecker");
    const boundsChecker = await BoundsChecker.deploy();
    await boundsChecker.waitForDeployment();
    deployedContracts.BoundsChecker = await boundsChecker.getAddress();
    console.log("✅ BoundsChecker deployed to:", deployedContracts.BoundsChecker);

    const JurisdictionConfig = await ethers.getContractFactory("JurisdictionConfig");
    const jurisdictionConfig = await JurisdictionConfig.deploy();
    await jurisdictionConfig.waitForDeployment();
    deployedContracts.JurisdictionConfig = await jurisdictionConfig.getAddress();
    console.log("✅ JurisdictionConfig deployed to:", deployedContracts.JurisdictionConfig);

    const VersionManager = await ethers.getContractFactory("VersionManager");
    const versionManager = await VersionManager.deploy();
    await versionManager.waitForDeployment();
    deployedContracts.VersionManager = await versionManager.getAddress();
    console.log("✅ VersionManager deployed to:", deployedContracts.VersionManager);

    const CredentialTypeManagerRefactored = await ethers.getContractFactory("CredentialTypeManagerRefactored");
    const credentialTypeManager = await CredentialTypeManagerRefactored.deploy();
    await credentialTypeManager.waitForDeployment();
    deployedContracts.CredentialTypeManagerRefactored = await credentialTypeManager.getAddress();
    console.log("✅ CredentialTypeManagerRefactored deployed to:", deployedContracts.CredentialTypeManagerRefactored);

    const FeatureFlagsRefactored = await ethers.getContractFactory("FeatureFlagsRefactored");
    const featureFlags = await FeatureFlagsRefactored.deploy();
    await featureFlags.waitForDeployment();
    deployedContracts.FeatureFlagsRefactored = await featureFlags.getAddress();
    console.log("✅ FeatureFlagsRefactored deployed to:", deployedContracts.FeatureFlagsRefactored);

    // Deploy system contracts
    console.log("\n🔧 Deploying System Contracts (3/3)...");
    
    const MultisigManager = await ethers.getContractFactory("MultisigManager");
    const multisigManager = await MultisigManager.deploy();
    await multisigManager.waitForDeployment();
    deployedContracts.MultisigManager = await multisigManager.getAddress();
    console.log("✅ MultisigManager deployed to:", deployedContracts.MultisigManager);

    const MultisigModifier = await ethers.getContractFactory("MultisigModifier");
    const multisigModifier = await MultisigModifier.deploy(deployedContracts.MultisigManager);
    await multisigModifier.waitForDeployment();
    deployedContracts.MultisigModifier = await multisigModifier.getAddress();
    console.log("✅ MultisigModifier deployed to:", deployedContracts.MultisigModifier);

    const EmergencyManager = await ethers.getContractFactory("EmergencyManager");
    const emergencyManager = await EmergencyManager.deploy(deployedContracts.MultisigManager);
    await emergencyManager.waitForDeployment();
    deployedContracts.EmergencyManager = await emergencyManager.getAddress();
    console.log("✅ EmergencyManager deployed to:", deployedContracts.EmergencyManager);

    // Deploy governance contracts
    console.log("\n🏛️ Deploying Governance Contracts (1/1)...");
    
    const GovernanceManager = await ethers.getContractFactory("GovernanceManager");
    const governanceManager = await GovernanceManager.deploy();
    await governanceManager.waitForDeployment();
    deployedContracts.GovernanceManager = await governanceManager.getAddress();
    console.log("✅ GovernanceManager deployed to:", deployedContracts.GovernanceManager);

    // Deploy refactored contracts
    console.log("\n🚀 Deploying Refactored Contracts (1/1)...");
    
    const BatchOperationsRefactored = await ethers.getContractFactory("BatchOperationsRefactored");
    const batchOperations = await BatchOperationsRefactored.deploy(
      deployedContracts.KYCDataStorage,
      deployedContracts.AuditLogStorage,
      deployedContracts.DIDCredentialStorage
    );
    await batchOperations.waitForDeployment();
    deployedContracts.BatchOperationsRefactored = await batchOperations.getAddress();
    console.log("✅ BatchOperationsRefactored deployed to:", deployedContracts.BatchOperationsRefactored);

    // Deploy example contracts
    console.log("\n📚 Deploying Example Contracts (1/1)...");
    
    const MultisigExample = await ethers.getContractFactory("MultisigExample");
    const multisigExample = await MultisigExample.deploy(deployedContracts.MultisigManager);
    await multisigExample.waitForDeployment();
    deployedContracts.MultisigExample = await multisigExample.getAddress();
    console.log("✅ MultisigExample deployed to:", deployedContracts.MultisigExample);

    // Test basic functionality
    console.log("\n🧪 Testing Basic Functionality...");
    
    // Test KYCDataStorage
    const owner = await kycDataStorage.owner();
    console.log("👤 KYCDataStorage Owner:", owner);
    
    // Test setting authorized writer
    const tx = await kycDataStorage.setAuthorizedWriter(deployer.address, true);
    await tx.wait();
    console.log("✅ Authorized writer set successfully");

    console.log("\n📋 Complete Deployment Summary:");
    console.log("===============================");
    console.log("Network:", await ethers.provider.getNetwork());
    console.log("Deployer:", deployer.address);
    console.log("Deployment Time:", new Date().toISOString());
    console.log(`\nTotal Contracts Deployed: ${Object.keys(deployedContracts).length}/19`);
    console.log("\nContract Addresses:");
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`${name}: ${address}`);
    });

    // Save deployment info
    const deploymentInfo = {
      network: await ethers.provider.getNetwork(),
      deployer: deployer.address,
      deploymentTime: new Date().toISOString(),
      totalContracts: Object.keys(deployedContracts).length,
      contracts: deployedContracts
    };

    const fs = require('fs');
    fs.writeFileSync('deployment-complete.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("\n📄 Deployment info saved to deployment-complete.json");

    console.log("\n🎉 Web3 KYC System - ALL 19 CONTRACTS deployed successfully!");
    console.log("🎯 Complete system is now operational!");

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
