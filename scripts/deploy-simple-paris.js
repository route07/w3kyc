const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Testing Paris EVM deployment to Route07...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  try {
    // Test with InputValidator (simple contract that worked before)
    console.log("\n📋 Deploying InputValidator...");
    const InputValidator = await ethers.getContractFactory("InputValidator");
    const inputValidator = await InputValidator.deploy();
    await inputValidator.waitForDeployment();
    const address = await inputValidator.getAddress();
    console.log("✅ InputValidator deployed to:", address);
    
    // Test with a more complex contract
    console.log("\n📋 Deploying KYCDataStorage...");
    const KYCDataStorage = await ethers.getContractFactory("KYCDataStorage");
    const kycStorage = await KYCDataStorage.deploy();
    await kycStorage.waitForDeployment();
    const kycAddress = await kycStorage.getAddress();
    console.log("✅ KYCDataStorage deployed to:", kycAddress);
    
    console.log("\n🎉 Paris EVM deployment successful!");
    console.log("📊 Results:");
    console.log("- InputValidator:", address);
    console.log("- KYCDataStorage:", kycAddress);
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    
    if (error.message.includes("opcode")) {
      console.log("\n🔍 EVM Analysis:");
      console.log("- Still getting opcode errors with Paris");
      console.log("- Route07 may not support Paris EVM opcodes either");
      console.log("- Consider trying older EVM versions: london, berlin, istanbul");
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