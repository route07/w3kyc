const { ethers } = require("hardhat");

async function deploySingleContract(contractName, constructorArgs = []) {
  console.log(`\n🚀 Deploying ${contractName}...`);
  
  try {
    // Get the contract factory
    const Contract = await ethers.getContractFactory(contractName);
    
    // Deploy the contract
    const contract = await Contract.deploy(...constructorArgs);
    await contract.waitForDeployment();
    
    const address = await contract.getAddress();
    console.log(`✅ ${contractName} deployed successfully!`);
    console.log(`📍 Address: ${address}`);
    
    return { contract, address };
  } catch (error) {
    console.log(`❌ Failed to deploy ${contractName}`);
    console.log(`🔍 Error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log("🚀 Web3 KYC System - Single Contract Deployment");
  console.log("===============================================\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Get contract name from command line argument
  const contractName = process.env.CONTRACT_NAME || process.argv[2];
  
  if (!contractName) {
    console.log("❌ Please provide a contract name as argument");
    console.log("Usage: npx hardhat run scripts/deploy-single.js --network localhost <ContractName>");
    console.log("\nAvailable contracts:");
    console.log("- KYCDataStorage");
    console.log("- AuditLogStorage");
    console.log("- TenantConfigStorage");
    console.log("- DIDCredentialStorage");
    console.log("- KYCManager");
    console.log("- DIDManager");
    console.log("- AuthorizationManager");
    console.log("- ComplianceChecker");
    console.log("- MultisigManager");
    console.log("- EmergencyManager");
    console.log("- VersionManager");
    console.log("- BatchOperationsSimple");
    console.log("- JurisdictionConfig");
    console.log("- CredentialTypeManagerSimple");
    console.log("- FeatureFlags");
    process.exit(1);
  }

  // Deploy the specified contract
  const result = await deploySingleContract(contractName);
  
  if (result) {
    console.log(`\n🎉 ${contractName} deployment successful!`);
    console.log(`📍 Contract Address: ${result.address}`);
    
    // Save deployment info
    const deploymentInfo = {
      contractName: contractName,
      address: result.address,
      deployer: deployer.address,
      deploymentTime: new Date().toISOString(),
      network: await ethers.provider.getNetwork()
    };

    const fs = require('fs');
    const filename = `deployment-${contractName.toLowerCase()}.json`;
    fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
    console.log(`📄 Deployment info saved to ${filename}`);
  } else {
    console.log(`\n❌ ${contractName} deployment failed!`);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
