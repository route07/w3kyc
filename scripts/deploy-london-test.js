const { ethers } = require("ethers");
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

async function main() {
  console.log("🚀 Web3 KYC System - London EVM Deployment Test");
  console.log("===============================================\n");

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

  try {
    console.log("\n📦 Testing London EVM Deployment...");
    
    // Test 1: InputValidator (known to work)
    console.log("1. Deploying InputValidator...");
    const inputValidatorArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'utility', 'InputValidator.sol', 'InputValidator.json'),
      'utf8'
    ));
    const inputValidatorFactory = new ethers.ContractFactory(
      inputValidatorArtifact.abi,
      inputValidatorArtifact.bytecode,
      wallet
    );
    const inputValidator = await inputValidatorFactory.deploy();
    await inputValidator.waitForDeployment();
    deployedContracts.InputValidator = await inputValidator.getAddress();
    console.log("✅ InputValidator deployed to:", deployedContracts.InputValidator);

    // Test 2: BoundsChecker (known to work)
    console.log("2. Deploying BoundsChecker...");
    const boundsCheckerArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts', 'contracts', 'utility', 'BoundsChecker.sol', 'BoundsChecker.json'),
      'utf8'
    ));
    const boundsCheckerFactory = new ethers.ContractFactory(
      boundsCheckerArtifact.abi,
      boundsCheckerArtifact.bytecode,
      wallet
    );
    const boundsChecker = await boundsCheckerFactory.deploy();
    await boundsChecker.waitForDeployment();
    deployedContracts.BoundsChecker = await boundsChecker.getAddress();
    console.log("✅ BoundsChecker deployed to:", deployedContracts.BoundsChecker);

    // Test 3: KYCDataStorage (core contract - test if London EVM helps)
    console.log("3. Testing KYCDataStorage deployment...");
    try {
      const kycStorageArtifact = JSON.parse(fs.readFileSync(
        path.join(__dirname, '..', 'artifacts', 'contracts', 'storage', 'KYCDataStorage.sol', 'KYCDataStorage.json'),
        'utf8'
      ));
      const kycStorageFactory = new ethers.ContractFactory(
        kycStorageArtifact.abi,
        kycStorageArtifact.bytecode,
        wallet
      );
      const kycStorage = await kycStorageFactory.deploy();
      await kycStorage.waitForDeployment();
      deployedContracts.KYCDataStorage = await kycStorage.getAddress();
      console.log("✅ KYCDataStorage deployed to:", deployedContracts.KYCDataStorage);
    } catch (error) {
      console.log("❌ KYCDataStorage deployment failed:", error.message);
      if (error.message.includes("opcode")) {
        console.log("   🔍 Still getting opcode errors with London EVM");
      }
    }

    // Test 4: AuditLogStorage (core contract)
    console.log("4. Testing AuditLogStorage deployment...");
    try {
      const auditLogArtifact = JSON.parse(fs.readFileSync(
        path.join(__dirname, '..', 'artifacts', 'contracts', 'storage', 'AuditLogStorage.sol', 'AuditLogStorage.json'),
        'utf8'
      ));
      const auditLogFactory = new ethers.ContractFactory(
        auditLogArtifact.abi,
        auditLogArtifact.bytecode,
        wallet
      );
      const auditLog = await auditLogFactory.deploy();
      await auditLog.waitForDeployment();
      deployedContracts.AuditLogStorage = await auditLog.getAddress();
      console.log("✅ AuditLogStorage deployed to:", deployedContracts.AuditLogStorage);
    } catch (error) {
      console.log("❌ AuditLogStorage deployment failed:", error.message);
      if (error.message.includes("opcode")) {
        console.log("   🔍 Still getting opcode errors with London EVM");
      }
    }

    // Test 5: MultisigManager (complex contract)
    console.log("5. Testing MultisigManager deployment...");
    try {
      const multisigArtifact = JSON.parse(fs.readFileSync(
        path.join(__dirname, '..', 'artifacts', 'contracts', 'system', 'MultisigManager.sol', 'MultisigManager.json'),
        'utf8'
      ));
      const multisigFactory = new ethers.ContractFactory(
        multisigArtifact.abi,
        multisigArtifact.bytecode,
        wallet
      );
      const multisig = await multisigFactory.deploy();
      await multisig.waitForDeployment();
      deployedContracts.MultisigManager = await multisig.getAddress();
      console.log("✅ MultisigManager deployed to:", deployedContracts.MultisigManager);
    } catch (error) {
      console.log("❌ MultisigManager deployment failed:", error.message);
      if (error.message.includes("opcode")) {
        console.log("   🔍 Still getting opcode errors with London EVM");
      }
    }

    console.log("\n📋 London EVM Deployment Summary:");
    console.log("================================");
    console.log("Network: Route07 Testnet");
    console.log("EVM Version: London");
    console.log("Deployer:", wallet.address);
    console.log("Deployment Time:", new Date().toISOString());
    console.log(`\nTotal Contracts Deployed: ${Object.keys(deployedContracts).length}/5 tested`);
    console.log("\nContract Addresses:");
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`${name}: ${address}`);
    });

    // Analysis
    console.log("\n🔍 EVM Compatibility Analysis:");
    if (Object.keys(deployedContracts).length === 5) {
      console.log("✅ London EVM version resolved compatibility issues!");
      console.log("🎉 All tested contracts deployed successfully");
    } else if (Object.keys(deployedContracts).length > 2) {
      console.log("🟡 London EVM version partially resolved issues");
      console.log("📈 More contracts deployed than with Shanghai/Paris");
    } else {
      console.log("❌ London EVM version did not resolve compatibility issues");
      console.log("💡 Route07 may need even older EVM versions (Berlin, Istanbul)");
    }

    // Save deployment info
    const deploymentInfo = {
      network: "Route07 Testnet",
      chainId: 336699,
      evmVersion: "london",
      deployer: wallet.address,
      deploymentTime: new Date().toISOString(),
      totalContracts: Object.keys(deployedContracts).length,
      contracts: deployedContracts,
      analysis: Object.keys(deployedContracts).length === 5 ? "London EVM resolved compatibility issues" : "Partial resolution with London EVM",
      status: Object.keys(deployedContracts).length === 5 ? "Full deployment success" : "Partial deployment"
    };

    fs.writeFileSync('deployment-london-test.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("\n📄 Deployment info saved to deployment-london-test.json");

    if (Object.keys(deployedContracts).length === 5) {
      console.log("\n🎉 London EVM deployment test SUCCESSFUL!");
      console.log("🚀 Route07 compatibility issues resolved with London EVM!");
    } else {
      console.log("\n⚠️ London EVM deployment test PARTIAL SUCCESS");
      console.log("🔍 Further EVM version testing may be needed");
    }

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