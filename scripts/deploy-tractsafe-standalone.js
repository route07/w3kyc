const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function main() {
  console.log("🚀 Starting Tractsafe deployment...");
  
  // Create provider and wallet
  const provider = new ethers.JsonRpcProvider('https://tapi.tractsafe.com');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("📝 Deploying contracts with account:", wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    throw new Error("Insufficient balance to deploy contracts");
  }

  const deployedContracts = {};
  const deploymentLog = [];

  try {
    // Read contract artifacts
    const artifactsDir = path.join(__dirname, '..', 'artifacts', 'contracts');
    
    // Helper function to get contract factory
    const getContractFactory = async (contractName, category = 'utility') => {
      const artifactPath = path.join(artifactsDir, category, contractName + '.sol', contractName + '.json');
      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      return new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    };

    // 1. Deploy InputValidator
    console.log("\n📝 Deploying InputValidator...");
    const InputValidator = await getContractFactory("InputValidator", "utility");
    const inputValidator = await InputValidator.deploy({
      gasLimit: 2000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await inputValidator.waitForDeployment();
    const inputValidatorAddress = await inputValidator.getAddress();
    deployedContracts.InputValidator = inputValidatorAddress;
    deploymentLog.push({
      name: "InputValidator",
      address: inputValidatorAddress,
      txHash: inputValidator.deploymentTransaction()?.hash
    });
    console.log("✅ InputValidator deployed to:", inputValidatorAddress);

    // 2. Deploy BoundsChecker
    console.log("\n📏 Deploying BoundsChecker...");
    const BoundsChecker = await getContractFactory("BoundsChecker", "utility");
    const boundsChecker = await BoundsChecker.deploy({
      gasLimit: 2000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await boundsChecker.waitForDeployment();
    const boundsCheckerAddress = await boundsChecker.getAddress();
    deployedContracts.BoundsChecker = boundsCheckerAddress;
    deploymentLog.push({
      name: "BoundsChecker",
      address: boundsCheckerAddress,
      txHash: boundsChecker.deploymentTransaction()?.hash
    });
    console.log("✅ BoundsChecker deployed to:", boundsCheckerAddress);

    // 3. Deploy ComplianceChecker
    console.log("\n🛡️ Deploying ComplianceChecker...");
    const ComplianceChecker = await getContractFactory("ComplianceChecker", "utility");
    const complianceChecker = await ComplianceChecker.deploy({
      gasLimit: 3000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await complianceChecker.waitForDeployment();
    const complianceCheckerAddress = await complianceChecker.getAddress();
    deployedContracts.ComplianceChecker = complianceCheckerAddress;
    deploymentLog.push({
      name: "ComplianceChecker",
      address: complianceCheckerAddress,
      txHash: complianceChecker.deploymentTransaction()?.hash
    });
    console.log("✅ ComplianceChecker deployed to:", complianceCheckerAddress);

    // 4. Deploy DocumentManager
    console.log("\n📄 Deploying DocumentManager...");
    const DocumentManager = await getContractFactory("DocumentManager", "business");
    const documentManager = await DocumentManager.deploy({
      gasLimit: 3000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await documentManager.waitForDeployment();
    const documentManagerAddress = await documentManager.getAddress();
    deployedContracts.DocumentManager = documentManagerAddress;
    deploymentLog.push({
      name: "DocumentManager",
      address: documentManagerAddress,
      txHash: documentManager.deploymentTransaction()?.hash
    });
    console.log("✅ DocumentManager deployed to:", documentManagerAddress);

    // 5. Deploy RiskAssessment
    console.log("\n⚠️ Deploying RiskAssessment...");
    const RiskAssessment = await getContractFactory("RiskAssessment", "business");
    const riskAssessment = await RiskAssessment.deploy({
      gasLimit: 3000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await riskAssessment.waitForDeployment();
    const riskAssessmentAddress = await riskAssessment.getAddress();
    deployedContracts.RiskAssessment = riskAssessmentAddress;
    deploymentLog.push({
      name: "RiskAssessment",
      address: riskAssessmentAddress,
      txHash: riskAssessment.deploymentTransaction()?.hash
    });
    console.log("✅ RiskAssessment deployed to:", riskAssessmentAddress);

    // 6. Deploy AuditLogger
    console.log("\n📊 Deploying AuditLogger...");
    const AuditLogger = await getContractFactory("AuditLogger", "business");
    const auditLogger = await AuditLogger.deploy({
      gasLimit: 3000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await auditLogger.waitForDeployment();
    const auditLoggerAddress = await auditLogger.getAddress();
    deployedContracts.AuditLogger = auditLoggerAddress;
    deploymentLog.push({
      name: "AuditLogger",
      address: auditLoggerAddress,
      txHash: auditLogger.deploymentTransaction()?.hash
    });
    console.log("✅ AuditLogger deployed to:", auditLoggerAddress);

    // 7. Deploy MultisigWallet
    console.log("\n🔐 Deploying MultisigWallet...");
    const MultisigWallet = await getContractFactory("MultisigWallet", "system");
    const multisigWallet = await MultisigWallet.deploy([wallet.address], 1, {
      gasLimit: 4000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await multisigWallet.waitForDeployment();
    const multisigWalletAddress = await multisigWallet.getAddress();
    deployedContracts.MultisigWallet = multisigWalletAddress;
    deploymentLog.push({
      name: "MultisigWallet",
      address: multisigWalletAddress,
      txHash: multisigWallet.deploymentTransaction()?.hash
    });
    console.log("✅ MultisigWallet deployed to:", multisigWalletAddress);

    // 8. Deploy KYCManager with dependencies
    console.log("\n🎯 Deploying KYCManager...");
    const KYCManager = await getContractFactory("KYCManager", "business");
    const kycManager = await KYCManager.deploy(
      inputValidatorAddress,
      boundsCheckerAddress,
      complianceCheckerAddress,
      documentManagerAddress,
      riskAssessmentAddress,
      auditLoggerAddress,
      multisigWalletAddress,
      {
        gasLimit: 5000000,
        gasPrice: ethers.parseUnits("1", "gwei"),
      }
    );
    await kycManager.waitForDeployment();
    const kycManagerAddress = await kycManager.getAddress();
    deployedContracts.KYCManager = kycManagerAddress;
    deploymentLog.push({
      name: "KYCManager",
      address: kycManagerAddress,
      txHash: kycManager.deploymentTransaction()?.hash
    });
    console.log("✅ KYCManager deployed to:", kycManagerAddress);

    // 9. Deploy CredentialManager
    console.log("\n🎫 Deploying CredentialManager...");
    const CredentialManager = await getContractFactory("CredentialManager", "business");
    const credentialManager = await CredentialManager.deploy(
      kycManagerAddress,
      auditLoggerAddress,
      {
        gasLimit: 3000000,
        gasPrice: ethers.parseUnits("1", "gwei"),
      }
    );
    await credentialManager.waitForDeployment();
    const credentialManagerAddress = await credentialManager.getAddress();
    deployedContracts.CredentialManager = credentialManagerAddress;
    deploymentLog.push({
      name: "CredentialManager",
      address: credentialManagerAddress,
      txHash: credentialManager.deploymentTransaction()?.hash
    });
    console.log("✅ CredentialManager deployed to:", credentialManagerAddress);

    // Final balance check
    const finalBalance = await provider.getBalance(wallet.address);
    const gasUsed = balance - finalBalance;
    console.log("\n💰 Gas used:", ethers.formatEther(gasUsed), "ETH");
    console.log("💰 Remaining balance:", ethers.formatEther(finalBalance), "ETH");

    // Save deployment results
    const deploymentResults = {
      network: "tractsafe",
      chainId: 35935,
      deployer: wallet.address,
      timestamp: new Date().toISOString(),
      contracts: deployedContracts,
      deploymentLog: deploymentLog,
      gasUsed: ethers.formatEther(gasUsed),
      finalBalance: ethers.formatEther(finalBalance)
    };

    // Write to file
    const deploymentFile = path.join(__dirname, '..', 'deployments', 'tractsafe-deployment.json');
    
    // Ensure deployments directory exists
    const deploymentsDir = path.dirname(deploymentFile);
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentResults, null, 2));
    console.log("\n📁 Deployment results saved to:", deploymentFile);

    // Generate .env format
    console.log("\n📋 Add these to your .env.local file:");
    console.log("=" .repeat(50));
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`NEXT_PUBLIC_${name.toUpperCase()}_ADDRESS=${address}`);
    });
    console.log("=" .repeat(50));

    console.log("\n🎉 Contracts deployed successfully to Tractsafe network!");
    console.log(`📊 Total contracts deployed: ${Object.keys(deployedContracts).length}`);

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
