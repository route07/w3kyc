const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Web3 KYC System - Refactored Deployment");
  console.log("==========================================\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  const deployedContracts = {};

  try {
    // Deploy storage contracts first
    console.log("\n📦 Deploying Storage Contracts...");
    
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
    console.log("\n⚙️ Deploying Business Logic Contracts...");
    
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

    // Deploy system contracts
    console.log("\n🔧 Deploying System Contracts...");
    
    const MultisigManager = await ethers.getContractFactory("MultisigManager");
    const multisigManager = await MultisigManager.deploy();
    await multisigManager.waitForDeployment();
    deployedContracts.MultisigManager = await multisigManager.getAddress();
    console.log("✅ MultisigManager deployed to:", deployedContracts.MultisigManager);

    const EmergencyManager = await ethers.getContractFactory("EmergencyManager");
    const emergencyManager = await EmergencyManager.deploy(deployedContracts.MultisigManager);
    await emergencyManager.waitForDeployment();
    deployedContracts.EmergencyManager = await emergencyManager.getAddress();
    console.log("✅ EmergencyManager deployed to:", deployedContracts.EmergencyManager);

    // Deploy refactored contracts
    console.log("\n🚀 Deploying Refactored Contracts...");
    
    const BatchOperationsRefactored = await ethers.getContractFactory("BatchOperationsRefactored");
    const batchOperations = await BatchOperationsRefactored.deploy(
      deployedContracts.KYCDataStorage,
      deployedContracts.AuditLogStorage,
      deployedContracts.DIDCredentialStorage
    );
    await batchOperations.waitForDeployment();
    deployedContracts.BatchOperationsRefactored = await batchOperations.getAddress();
    console.log("✅ BatchOperationsRefactored deployed to:", deployedContracts.BatchOperationsRefactored);

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

    // Test basic functionality
    console.log("\n🧪 Testing Basic Functionality...");
    
    // Test KYCDataStorage
    const owner = await kycDataStorage.owner();
    console.log("👤 KYCDataStorage Owner:", owner);
    
    // Test setting authorized writer
    const tx = await kycDataStorage.setAuthorizedWriter(deployer.address, true);
    await tx.wait();
    console.log("✅ Authorized writer set successfully");
    
    // Test updating KYC status (using authorized writer)
    const kycTx = await kycDataStorage.connect(deployer).updateKYCStatus(deployer.address, true);
    await kycTx.wait();
    console.log("✅ KYC status updated successfully");
    
    // Get KYC data
    const kycData = await kycDataStorage.getKYCData(deployer.address);
    console.log("📊 KYC Data - Active:", kycData.isActive, "Verified:", kycData.isVerified);

    console.log("\n📋 Deployment Summary:");
    console.log("=====================");
    console.log("Network:", await ethers.provider.getNetwork());
    console.log("Deployer:", deployer.address);
    console.log("Deployment Time:", new Date().toISOString());
    console.log("\nContract Addresses:");
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`${name}: ${address}`);
    });

    // Save deployment info
    const deploymentInfo = {
      network: await ethers.provider.getNetwork(),
      deployer: deployer.address,
      deploymentTime: new Date().toISOString(),
      contracts: deployedContracts
    };

    const fs = require('fs');
    fs.writeFileSync('deployment-refactored.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("\n📄 Deployment info saved to deployment-refactored.json");

    console.log("\n🎉 Web3 KYC System deployed successfully!");
    console.log("🎯 Ready for testing and validation!");

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
