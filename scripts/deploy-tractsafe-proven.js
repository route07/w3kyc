const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function main() {
  console.log("🚀 Starting Tractsafe proven contracts deployment...");
  
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

    // Deploy only the contracts that we know work

    // PHASE 1: Storage Contracts (no dependencies)
    console.log("\n🏗️ PHASE 1: Deploying Storage Contracts...");

    // 1. KYCDataStorage
    console.log("\n💾 Deploying KYCDataStorage...");
    const KYCDataStorage = await getContractFactory("KYCDataStorage", "storage");
    const kycDataStorage = await KYCDataStorage.deploy({
      gasLimit: 3000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await kycDataStorage.waitForDeployment();
    const kycDataStorageAddress = await kycDataStorage.getAddress();
    deployedContracts.KYCDataStorage = kycDataStorageAddress;
    deploymentLog.push({
      name: "KYCDataStorage",
      address: kycDataStorageAddress,
      txHash: kycDataStorage.deploymentTransaction()?.hash
    });
    console.log("✅ KYCDataStorage deployed to:", kycDataStorageAddress);

    // 2. TenantConfigStorage
    console.log("\n🏢 Deploying TenantConfigStorage...");
    const TenantConfigStorage = await getContractFactory("TenantConfigStorage", "storage");
    const tenantConfigStorage = await TenantConfigStorage.deploy({
      gasLimit: 3000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await tenantConfigStorage.waitForDeployment();
    const tenantConfigStorageAddress = await tenantConfigStorage.getAddress();
    deployedContracts.TenantConfigStorage = tenantConfigStorageAddress;
    deploymentLog.push({
      name: "TenantConfigStorage",
      address: tenantConfigStorageAddress,
      txHash: tenantConfigStorage.deploymentTransaction()?.hash
    });
    console.log("✅ TenantConfigStorage deployed to:", tenantConfigStorageAddress);

    // 3. AuditLogStorage
    console.log("\n📊 Deploying AuditLogStorage...");
    const AuditLogStorage = await getContractFactory("AuditLogStorage", "storage");
    const auditLogStorage = await AuditLogStorage.deploy({
      gasLimit: 3000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await auditLogStorage.waitForDeployment();
    const auditLogStorageAddress = await auditLogStorage.getAddress();
    deployedContracts.AuditLogStorage = auditLogStorageAddress;
    deploymentLog.push({
      name: "AuditLogStorage",
      address: auditLogStorageAddress,
      txHash: auditLogStorage.deploymentTransaction()?.hash
    });
    console.log("✅ AuditLogStorage deployed to:", auditLogStorageAddress);

    // PHASE 2: Utility Contracts
    console.log("\n🔧 PHASE 2: Deploying Utility Contracts...");

    // 4. InputValidator
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

    // 5. BoundsChecker
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

    // PHASE 3: System Contracts
    console.log("\n⚙️ PHASE 3: Deploying System Contracts...");

    // 6. MultisigManager
    console.log("\n🔐 Deploying MultisigManager...");
    const MultisigManager = await getContractFactory("MultisigManager", "system");
    const multisigManager = await MultisigManager.deploy([wallet.address], 1, {
      gasLimit: 4000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await multisigManager.waitForDeployment();
    const multisigManagerAddress = await multisigManager.getAddress();
    deployedContracts.MultisigManager = multisigManagerAddress;
    deploymentLog.push({
      name: "MultisigManager",
      address: multisigManagerAddress,
      txHash: multisigManager.deploymentTransaction()?.hash
    });
    console.log("✅ MultisigManager deployed to:", multisigManagerAddress);

    // PHASE 4: Business Logic Contracts
    console.log("\n💼 PHASE 4: Deploying Business Logic Contracts...");

    // 7. KYCManager
    console.log("\n🎯 Deploying KYCManager...");
    const KYCManager = await getContractFactory("KYCManager", "business");
    const kycManager = await KYCManager.deploy(
      kycDataStorageAddress,
      auditLogStorageAddress,
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

    // PHASE 5: Access Control Contracts
    console.log("\n🔒 PHASE 5: Deploying Access Control Contracts...");

    // 8. AuthorizationManager
    console.log("\n👤 Deploying AuthorizationManager...");
    const AuthorizationManager = await getContractFactory("AuthorizationManager", "access");
    const authorizationManager = await AuthorizationManager.deploy(auditLogStorageAddress, {
      gasLimit: 3000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await authorizationManager.waitForDeployment();
    const authorizationManagerAddress = await authorizationManager.getAddress();
    deployedContracts.AuthorizationManager = authorizationManagerAddress;
    deploymentLog.push({
      name: "AuthorizationManager",
      address: authorizationManagerAddress,
      txHash: authorizationManager.deploymentTransaction()?.hash
    });
    console.log("✅ AuthorizationManager deployed to:", authorizationManagerAddress);

    // PHASE 6: Governance Contracts
    console.log("\n🏛️ PHASE 6: Deploying Governance Contracts...");

    // 9. GovernanceManager
    console.log("\n🏛️ Deploying GovernanceManager...");
    const GovernanceManager = await getContractFactory("GovernanceManager", "governance");
    const governanceManager = await GovernanceManager.deploy({
      gasLimit: 3000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await governanceManager.waitForDeployment();
    const governanceManagerAddress = await governanceManager.getAddress();
    deployedContracts.GovernanceManager = governanceManagerAddress;
    deploymentLog.push({
      name: "GovernanceManager",
      address: governanceManagerAddress,
      txHash: governanceManager.deploymentTransaction()?.hash
    });
    console.log("✅ GovernanceManager deployed to:", governanceManagerAddress);

    // PHASE 7: Example Contracts
    console.log("\n📚 PHASE 7: Deploying Example Contracts...");

    // 10. MultisigExample
    console.log("\n🔐 Deploying MultisigExample...");
    const MultisigExample = await getContractFactory("MultisigExample", "examples");
    const multisigExample = await MultisigExample.deploy(multisigManagerAddress, {
      gasLimit: 3000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await multisigExample.waitForDeployment();
    const multisigExampleAddress = await multisigExample.getAddress();
    deployedContracts.MultisigExample = multisigExampleAddress;
    deploymentLog.push({
      name: "MultisigExample",
      address: multisigExampleAddress,
      txHash: multisigExample.deploymentTransaction()?.hash
    });
    console.log("✅ MultisigExample deployed to:", multisigExampleAddress);

    // 11. SimpleTest
    console.log("\n🧪 Deploying SimpleTest...");
    const SimpleTest = await getContractFactory("SimpleTest", "test");
    const simpleTest = await SimpleTest.deploy({
      gasLimit: 2000000,
      gasPrice: ethers.parseUnits("1", "gwei"),
    });
    await simpleTest.waitForDeployment();
    const simpleTestAddress = await simpleTest.getAddress();
    deployedContracts.SimpleTest = simpleTestAddress;
    deploymentLog.push({
      name: "SimpleTest",
      address: simpleTestAddress,
      txHash: simpleTest.deploymentTransaction()?.hash
    });
    console.log("✅ SimpleTest deployed to:", simpleTestAddress);

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
    const deploymentFile = path.join(__dirname, '..', 'deployments', 'tractsafe-proven-deployment.json');
    
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

    console.log("\n🎉 Proven contracts deployed successfully to Tractsafe network!");
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
