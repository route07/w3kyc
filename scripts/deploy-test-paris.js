const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Testing deployment with Paris EVM version...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Check account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    throw new Error("Insufficient balance for deployment");
  }
  
  try {
    // Test 1: Deploy InputValidator (simple utility contract)
    console.log("\n📋 Testing InputValidator deployment...");
    const InputValidator = await ethers.getContractFactory("InputValidator");
    const inputValidator = await InputValidator.deploy();
    await inputValidator.waitForDeployment();
    const inputValidatorAddress = await inputValidator.getAddress();
    console.log("✅ InputValidator deployed to:", inputValidatorAddress);
    
    // Test 2: Deploy BoundsChecker (simple utility contract)
    console.log("\n📋 Testing BoundsChecker deployment...");
    const BoundsChecker = await ethers.getContractFactory("BoundsChecker");
    const boundsChecker = await BoundsChecker.deploy();
    await boundsChecker.waitForDeployment();
    const boundsCheckerAddress = await boundsChecker.getAddress();
    console.log("✅ BoundsChecker deployed to:", boundsCheckerAddress);
    
    // Test 3: Deploy KYCDataStorage (core contract)
    console.log("\n📋 Testing KYCDataStorage deployment...");
    const KYCDataStorage = await ethers.getContractFactory("KYCDataStorage");
    const kycDataStorage = await KYCDataStorage.deploy();
    await kycDataStorage.waitForDeployment();
    const kycDataStorageAddress = await kycDataStorage.getAddress();
    console.log("✅ KYCDataStorage deployed to:", kycDataStorageAddress);
    
    // Test 4: Deploy AuditLogStorage (core contract)
    console.log("\n📋 Testing AuditLogStorage deployment...");
    const AuditLogStorage = await ethers.getContractFactory("AuditLogStorage");
    const auditLogStorage = await AuditLogStorage.deploy();
    await auditLogStorage.waitForDeployment();
    const auditLogStorageAddress = await auditLogStorage.getAddress();
    console.log("✅ AuditLogStorage deployed to:", auditLogStorageAddress);
    
    // Test 5: Deploy MultisigManager (complex contract)
    console.log("\n📋 Testing MultisigManager deployment...");
    const MultisigManager = await ethers.getContractFactory("MultisigManager");
    const multisigManager = await MultisigManager.deploy();
    await multisigManager.waitForDeployment();
    const multisigManagerAddress = await multisigManager.getAddress();
    console.log("✅ MultisigManager deployed to:", multisigManagerAddress);
    
    console.log("\n🎉 Paris EVM deployment test completed successfully!");
    console.log("\n📊 Deployment Summary:");
    console.log("- InputValidator:", inputValidatorAddress);
    console.log("- BoundsChecker:", boundsCheckerAddress);
    console.log("- KYCDataStorage:", kycDataStorageAddress);
    console.log("- AuditLogStorage:", auditLogStorageAddress);
    console.log("- MultisigManager:", multisigManagerAddress);
    
    // Save deployment info
    const deploymentInfo = {
      network: "route07",
      evmVersion: "paris",
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: {
        InputValidator: inputValidatorAddress,
        BoundsChecker: boundsCheckerAddress,
        KYCDataStorage: kycDataStorageAddress,
        AuditLogStorage: auditLogStorageAddress,
        MultisigManager: multisigManagerAddress
      }
    };
    
    const fs = require('fs');
    fs.writeFileSync(
      'deployment-paris-test.json', 
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("\n💾 Deployment info saved to: deployment-paris-test.json");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    
    if (error.message.includes("opcode")) {
      console.log("\n🔍 EVM Compatibility Analysis:");
      console.log("- Error suggests EVM opcode compatibility issue");
      console.log("- Paris EVM version may still have compatibility problems");
      console.log("- Consider trying 'london' or 'berlin' EVM versions");
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