const { ethers } = require("hardhat");

async function deployContract(contractName, constructorArgs = []) {
  console.log(`\n📦 Deploying ${contractName}...`);
  
  try {
    const Contract = await ethers.getContractFactory(contractName);
    const contract = await Contract.deploy(...constructorArgs);
    await contract.waitForDeployment();
    
    const address = await contract.getAddress();
    console.log(`✅ ${contractName} deployed to: ${address}`);
    
    return { contract, address };
  } catch (error) {
    console.log(`❌ Failed to deploy ${contractName}: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log("🚀 Web3 KYC System - Individual Contract Deployment");
  console.log("==================================================\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  const deployedContracts = {};

  // Deploy contracts individually to avoid compilation issues
  console.log("\n🏗️ Phase 1: Storage Contracts");
  console.log("===============================");
  
  const kycDataStorage = await deployContract("KYCDataStorage");
  if (kycDataStorage) deployedContracts.KYCDataStorage = kycDataStorage.address;

  const auditLogStorage = await deployContract("AuditLogStorage");
  if (auditLogStorage) deployedContracts.AuditLogStorage = auditLogStorage.address;

  const tenantConfigStorage = await deployContract("TenantConfigStorage");
  if (tenantConfigStorage) deployedContracts.TenantConfigStorage = tenantConfigStorage.address;

  const didCredentialStorage = await deployContract("DIDCredentialStorage");
  if (didCredentialStorage) deployedContracts.DIDCredentialStorage = didCredentialStorage.address;

  console.log("\n⚙️ Phase 2: Business Logic Contracts");
  console.log("=====================================");
  
  if (kycDataStorage && auditLogStorage && tenantConfigStorage) {
    const kycManager = await deployContract("KYCManager", [
      kycDataStorage.address,
      auditLogStorage.address,
      tenantConfigStorage.address
    ]);
    if (kycManager) deployedContracts.KYCManager = kycManager.address;
  }

  if (didCredentialStorage && auditLogStorage) {
    const didManager = await deployContract("DIDManager", [
      didCredentialStorage.address,
      auditLogStorage.address
    ]);
    if (didManager) deployedContracts.DIDManager = didManager.address;
  }

  console.log("\n🔐 Phase 3: Access Control Contracts");
  console.log("=====================================");
  
  const authorizationManager = await deployContract("AuthorizationManager");
  if (authorizationManager) deployedContracts.AuthorizationManager = authorizationManager.address;

  console.log("\n🛠️ Phase 4: Utility Contracts");
  console.log("==============================");
  
  const inputValidator = await deployContract("InputValidator");
  if (inputValidator) deployedContracts.InputValidator = inputValidator.address;

  const boundsChecker = await deployContract("BoundsChecker");
  if (boundsChecker) deployedContracts.BoundsChecker = boundsChecker.address;

  if (kycDataStorage && tenantConfigStorage) {
    const complianceChecker = await deployContract("ComplianceChecker", [
      kycDataStorage.address,
      tenantConfigStorage.address
    ]);
    if (complianceChecker) deployedContracts.ComplianceChecker = complianceChecker.address;
  }

  console.log("\n🔧 Phase 5: System Contracts");
  console.log("=============================");
  
  const multisigManager = await deployContract("MultisigManager");
  if (multisigManager) deployedContracts.MultisigManager = multisigManager.address;

  const emergencyManager = await deployContract("EmergencyManager");
  if (emergencyManager) deployedContracts.EmergencyManager = emergencyManager.address;

  console.log("\n🚀 Phase 6: Advanced Features (Phase 3)");
  console.log("=======================================");
  
  const versionManager = await deployContract("VersionManager");
  if (versionManager) deployedContracts.VersionManager = versionManager.address;

  if (kycDataStorage && auditLogStorage && didCredentialStorage) {
    const batchOperations = await deployContract("BatchOperationsSimple", [
      kycDataStorage.address,
      auditLogStorage.address,
      didCredentialStorage.address
    ]);
    if (batchOperations) deployedContracts.BatchOperationsSimple = batchOperations.address;
  }

  const jurisdictionConfig = await deployContract("JurisdictionConfig");
  if (jurisdictionConfig) deployedContracts.JurisdictionConfig = jurisdictionConfig.address;

  const credentialTypeManager = await deployContract("CredentialTypeManagerSimple");
  if (credentialTypeManager) deployedContracts.CredentialTypeManagerSimple = credentialTypeManager.address;

  const featureFlags = await deployContract("FeatureFlags");
  if (featureFlags) deployedContracts.FeatureFlags = featureFlags.address;

  console.log("\n📊 Deployment Summary");
  console.log("====================");
  console.log(`Total Contracts Attempted: ${Object.keys(deployedContracts).length + (19 - Object.keys(deployedContracts).length)}`);
  console.log(`Successfully Deployed: ${Object.keys(deployedContracts).length}`);
  console.log(`Failed Deployments: ${19 - Object.keys(deployedContracts).length}`);

  if (Object.keys(deployedContracts).length > 0) {
    console.log("\n✅ Successfully Deployed Contracts:");
    console.log("===================================");
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
    fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("\n📄 Deployment info saved to deployment-info.json");
  }

  console.log("\n🎯 Next Steps:");
  console.log("==============");
  console.log("1. Review deployment results");
  console.log("2. Fix any failed deployments");
  console.log("3. Set up contract connections");
  console.log("4. Test deployed contracts");
  console.log("5. Deploy to testnet");

  console.log("\n✅ Individual contract deployment completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
