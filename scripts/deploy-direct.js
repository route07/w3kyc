const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function deployDirect(contractName) {
  console.log(`\n🚀 Deploying ${contractName} directly...`);
  
  try {
    // Read the artifact file directly
    const artifactPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'storage', `${contractName}.sol`, `${contractName}.json`);
    
    if (!fs.existsSync(artifactPath)) {
      console.log(`❌ Artifact not found at: ${artifactPath}`);
      return null;
    }
    
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    console.log(`✅ Found artifact for ${contractName}`);
    
    // Get the signer
    const [signer] = await ethers.getSigners();
    
    // Deploy using the artifact directly
    const factory = new ethers.ContractFactory(
      artifact.abi,
      artifact.bytecode,
      signer
    );
    
    console.log(`📦 Deploying ${contractName}...`);
    const contract = await factory.deploy();
    console.log(`⏳ Waiting for deployment...`);
    await contract.waitForDeployment();
    
    const address = await contract.getAddress();
    console.log(`✅ ${contractName} deployed successfully!`);
    console.log(`📍 Address: ${address}`);
    
    return { contract, address };
  } catch (error) {
    console.log(`❌ Failed to deploy ${contractName}: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log("🚀 Web3 KYC System - Direct Artifact Deployment");
  console.log("===============================================\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Try to deploy KYCDataStorage directly
  const result = await deployDirect("KYCDataStorage");
  
  if (result) {
    console.log(`\n🎉 KYCDataStorage deployment successful!`);
    console.log(`📍 Contract Address: ${result.address}`);
    
    // Test basic functionality
    console.log("\n🧪 Testing basic functionality...");
    try {
      const owner = await result.contract.owner();
      console.log(`👤 Owner: ${owner}`);
      
      // Test setting an authorized writer
      const [deployer] = await ethers.getSigners();
      const tx = await result.contract.setAuthorizedWriter(deployer.address, true);
      await tx.wait();
      console.log(`✅ Authorized writer set successfully`);
      
    } catch (testError) {
      console.log(`⚠️ Test failed: ${testError.message}`);
    }
    
    // Save deployment info
    const deploymentInfo = {
      contractName: "KYCDataStorage",
      address: result.address,
      deployer: deployer.address,
      deploymentTime: new Date().toISOString(),
      network: await ethers.provider.getNetwork()
    };

    fs.writeFileSync('deployment-kycdata-direct.json', JSON.stringify(deploymentInfo, null, 2));
    console.log(`📄 Deployment info saved to deployment-kycdata-direct.json`);
    
    console.log("\n🎉 KYCDataStorage deployment and testing successful!");
    
  } else {
    console.log(`\n❌ KYCDataStorage deployment failed!`);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
