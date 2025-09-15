const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function deployWithArtifacts(contractName) {
  console.log(`\n🚀 Deploying ${contractName} using artifacts...`);
  
  try {
    // Try to find the artifact file
    const artifactPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'storage', `${contractName}.sol`, `${contractName}.json`);
    
    if (!fs.existsSync(artifactPath)) {
      console.log(`❌ Artifact not found at: ${artifactPath}`);
      return null;
    }
    
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    console.log(`✅ Found artifact for ${contractName}`);
    
    // Deploy using the artifact
    const factory = new ethers.ContractFactory(
      artifact.abi,
      artifact.bytecode,
      await ethers.getSigner()
    );
    
    const contract = await factory.deploy();
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
  console.log("🚀 Web3 KYC System - Artifact-based Deployment");
  console.log("===============================================\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Try to deploy KYCDataStorage using artifacts
  const result = await deployWithArtifacts("KYCDataStorage");
  
  if (result) {
    console.log(`\n🎉 KYCDataStorage deployment successful!`);
    console.log(`📍 Contract Address: ${result.address}`);
    
    // Save deployment info
    const deploymentInfo = {
      contractName: "KYCDataStorage",
      address: result.address,
      deployer: deployer.address,
      deploymentTime: new Date().toISOString(),
      network: await ethers.provider.getNetwork()
    };

    fs.writeFileSync('deployment-kycdata-artifacts.json', JSON.stringify(deploymentInfo, null, 2));
    console.log(`📄 Deployment info saved to deployment-kycdata-artifacts.json`);
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
