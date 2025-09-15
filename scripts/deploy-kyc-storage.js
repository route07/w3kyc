const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying KYCDataStorage Contract");
  console.log("===================================\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  try {
    // Deploy KYCDataStorage
    console.log("\n📦 Deploying KYCDataStorage...");
    const KYCDataStorage = await ethers.getContractFactory("KYCDataStorage");
    const kycDataStorage = await KYCDataStorage.deploy();
    await kycDataStorage.waitForDeployment();
    
    const address = await kycDataStorage.getAddress();
    console.log("✅ KYCDataStorage deployed successfully!");
    console.log(`📍 Address: ${address}`);
    
    // Test basic functionality
    console.log("\n🧪 Testing basic functionality...");
    const owner = await kycDataStorage.owner();
    console.log(`👤 Owner: ${owner}`);
    
    // Save deployment info
    const deploymentInfo = {
      contractName: "KYCDataStorage",
      address: address,
      deployer: deployer.address,
      deploymentTime: new Date().toISOString(),
      network: await ethers.provider.getNetwork()
    };

    const fs = require('fs');
    fs.writeFileSync('deployment-kycdata.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("📄 Deployment info saved to deployment-kycdata.json");
    
    console.log("\n🎉 KYCDataStorage deployment and testing successful!");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
