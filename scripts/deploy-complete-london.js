const { ethers } = require("ethers");
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

async function main() {
  console.log("🚀 Web3 KYC System - Complete London EVM Deployment");
  console.log("===================================================\n");

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

  // Define all contracts to deploy
  const contractsToDeploy = [
    // Storage Layer
    { name: "KYCDataStorage", path: "storage/KYCDataStorage.sol" },
    { name: "AuditLogStorage", path: "storage/AuditLogStorage.sol" },
    { name: "TenantConfigStorage", path: "storage/TenantConfigStorage.sol" },
    { name: "DIDCredentialStorage", path: "storage/DIDCredentialStorage.sol" },
    
    // Business Logic Layer
    { name: "KYCManager", path: "business/KYCManager.sol" },
    { name: "DIDManager", path: "business/DIDManager.sol" },
    { name: "BatchOperationsSimple", path: "business/BatchOperationsSimple.sol" },
    { name: "BatchOperationsRefactored", path: "business/BatchOperationsRefactored.sol" },
    
    // Access Control Layer
    { name: "AuthorizationManager", path: "access/AuthorizationManager.sol" },
    
    // Utility Layer
    { name: "ComplianceChecker", path: "utility/ComplianceChecker.sol" },
    { name: "InputValidator", path: "utility/InputValidator.sol" },
    { name: "BoundsChecker", path: "utility/BoundsChecker.sol" },
    { name: "JurisdictionConfig", path: "utility/JurisdictionConfig.sol" },
    { name: "VersionManager", path: "utility/VersionManager.sol" },
    { name: "CredentialTypeManagerRefactored", path: "utility/CredentialTypeManagerRefactored.sol" },
    { name: "FeatureFlagsRefactored", path: "utility/FeatureFlagsRefactored.sol" },
    
    // System Layer
    { name: "MultisigManager", path: "system/MultisigManager.sol" },
    { name: "MultisigModifier", path: "system/MultisigModifier.sol" },
    { name: "EmergencyManager", path: "system/EmergencyManager.sol" },
    
    // Governance Layer
    { name: "GovernanceManager", path: "governance/GovernanceManager.sol" },
    
    // Examples
    { name: "MultisigExample", path: "examples/MultisigExample.sol" }
  ];

  try {
    console.log(`\n📦 Deploying All ${contractsToDeploy.length} Contracts with London EVM...`);
    
    for (let i = 0; i < contractsToDeploy.length; i++) {
      const contract = contractsToDeploy[i];
      console.log(`${i + 1}. Deploying ${contract.name}...`);
      
      try {
        const artifactPath = path.join(__dirname, '..', 'artifacts', 'contracts', contract.path, `${contract.name}.json`);
        const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
        
        const factory = new ethers.ContractFactory(
          artifact.abi,
          artifact.bytecode,
          wallet
        );
        
        const contractInstance = await factory.deploy();
        await contractInstance.waitForDeployment();
        const address = await contractInstance.getAddress();
        
        deployedContracts[contract.name] = address;
        console.log(`✅ ${contract.name} deployed to: ${address}`);
        
      } catch (error) {
        console.log(`❌ ${contract.name} deployment failed: ${error.message}`);
        failedContracts.push({ name: contract.name, error: error.message });
      }
    }

    console.log("\n📋 Complete London EVM Deployment Summary:");
    console.log("==========================================");
    console.log("Network: Route07 Testnet");
    console.log("EVM Version: London");
    console.log("Deployer:", wallet.address);
    console.log("Deployment Time:", new Date().toISOString());
    console.log(`\nTotal Contracts Deployed: ${Object.keys(deployedContracts).length}/${contractsToDeploy.length}`);
    
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
    const successRate = (Object.keys(deployedContracts).length / contractsToDeploy.length) * 100;
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
      totalContracts: contractsToDeploy.length,
      deployedContracts: Object.keys(deployedContracts).length,
      successRate: successRate,
      contracts: deployedContracts,
      failedContracts: failedContracts,
      analysis: `London EVM resolved compatibility issues - ${successRate.toFixed(1)}% success rate`,
      status: successRate === 100 ? "Complete deployment success" : "Partial deployment success"
    };

    fs.writeFileSync('deployment-london-complete.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("\n📄 Deployment info saved to deployment-london-complete.json");

    console.log("\n🌐 Explorer: https://explorer.route07.com");
    console.log("\n📋 Next Steps:");
    console.log("   1. Update hardhat.config.refactored.js to use London EVM permanently");
    console.log("   2. Test deployed contracts functionality");
    console.log("   3. Update documentation with London EVM solution");
    console.log("   4. Consider mainnet deployment with London EVM");

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