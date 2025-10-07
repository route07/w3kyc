const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting Tractsafe deployment...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  const deployedContracts = {};
  const deploymentLog = [];

  try {
    // 1. Deploy InputValidator
    console.log("\n📝 Deploying InputValidator...");
    const InputValidator = await ethers.getContractFactory("InputValidator");
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
    const BoundsChecker = await ethers.getContractFactory("BoundsChecker");
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
    const ComplianceChecker = await ethers.getContractFactory("ComplianceChecker");
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
    const DocumentManager = await ethers.getContractFactory("DocumentManager");
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
    const RiskAssessment = await ethers.getContractFactory("RiskAssessment");
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
    const AuditLogger = await ethers.getContractFactory("AuditLogger");
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
    const MultisigWallet = await ethers.getContractFactory("MultisigWallet");
    const multisigWallet = await MultisigWallet.deploy([deployer.address], 1, {
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
    const KYCManager = await ethers.getContractFactory("KYCManager");
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
    const CredentialManager = await ethers.getContractFactory("CredentialManager");
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

    // 10. Deploy TenantManager
    console.log("\n🏢 Deploying TenantManager...");
    const TenantManager = await ethers.getContractFactory("TenantManager");
    const tenantManager = await TenantManager.deploy(
      kycManagerAddress,
      auditLoggerAddress,
      {
        gasLimit: 3000000,
        gasPrice: ethers.parseUnits("1", "gwei"),
      }
    );
    await tenantManager.waitForDeployment();
    const tenantManagerAddress = await tenantManager.getAddress();
    deployedContracts.TenantManager = tenantManagerAddress;
    deploymentLog.push({
      name: "TenantManager",
      address: tenantManagerAddress,
      txHash: tenantManager.deploymentTransaction()?.hash
    });
    console.log("✅ TenantManager deployed to:", tenantManagerAddress);

    // 11. Deploy AuthorizationManager
    console.log("\n🔑 Deploying AuthorizationManager...");
    const AuthorizationManager = await ethers.getContractFactory("AuthorizationManager");
    const authorizationManager = await AuthorizationManager.deploy(
      kycManagerAddress,
      auditLoggerAddress,
      {
        gasLimit: 3000000,
        gasPrice: ethers.parseUnits("1", "gwei"),
      }
    );
    await authorizationManager.waitForDeployment();
    const authorizationManagerAddress = await authorizationManager.getAddress();
    deployedContracts.AuthorizationManager = authorizationManagerAddress;
    deploymentLog.push({
      name: "AuthorizationManager",
      address: authorizationManagerAddress,
      txHash: authorizationManager.deploymentTransaction()?.hash
    });
    console.log("✅ AuthorizationManager deployed to:", authorizationManagerAddress);

    // 12. Deploy GovernanceManager
    console.log("\n🏛️ Deploying GovernanceManager...");
    const GovernanceManager = await ethers.getContractFactory("GovernanceManager");
    const governanceManager = await GovernanceManager.deploy(
      kycManagerAddress,
      multisigWalletAddress,
      auditLoggerAddress,
      {
        gasLimit: 4000000,
        gasPrice: ethers.parseUnits("1", "gwei"),
      }
    );
    await governanceManager.waitForDeployment();
    const governanceManagerAddress = await governanceManager.getAddress();
    deployedContracts.GovernanceManager = governanceManagerAddress;
    deploymentLog.push({
      name: "GovernanceManager",
      address: governanceManagerAddress,
      txHash: governanceManager.deploymentTransaction()?.hash
    });
    console.log("✅ GovernanceManager deployed to:", governanceManagerAddress);

    // 13. Deploy SystemManager
    console.log("\n⚙️ Deploying SystemManager...");
    const SystemManager = await ethers.getContractFactory("SystemManager");
    const systemManager = await SystemManager.deploy(
      kycManagerAddress,
      auditLoggerAddress,
      {
        gasLimit: 3000000,
        gasPrice: ethers.parseUnits("1", "gwei"),
      }
    );
    await systemManager.waitForDeployment();
    const systemManagerAddress = await systemManager.getAddress();
    deployedContracts.SystemManager = systemManagerAddress;
    deploymentLog.push({
      name: "SystemManager",
      address: systemManagerAddress,
      txHash: systemManager.deploymentTransaction()?.hash
    });
    console.log("✅ SystemManager deployed to:", systemManagerAddress);

    // 14. Deploy KYCDataStorage
    console.log("\n💾 Deploying KYCDataStorage...");
    const KYCDataStorage = await ethers.getContractFactory("KYCDataStorage");
    const kycDataStorage = await KYCDataStorage.deploy(
      kycManagerAddress,
      auditLoggerAddress,
      {
        gasLimit: 3000000,
        gasPrice: ethers.parseUnits("1", "gwei"),
      }
    );
    await kycDataStorage.waitForDeployment();
    const kycDataStorageAddress = await kycDataStorage.getAddress();
    deployedContracts.KYCDataStorage = kycDataStorageAddress;
    deploymentLog.push({
      name: "KYCDataStorage",
      address: kycDataStorageAddress,
      txHash: kycDataStorage.deploymentTransaction()?.hash
    });
    console.log("✅ KYCDataStorage deployed to:", kycDataStorageAddress);

    // 15. Deploy KYCAnalytics
    console.log("\n📈 Deploying KYCAnalytics...");
    const KYCAnalytics = await ethers.getContractFactory("KYCAnalytics");
    const kycAnalytics = await KYCAnalytics.deploy(
      kycManagerAddress,
      auditLoggerAddress,
      {
        gasLimit: 3000000,
        gasPrice: ethers.parseUnits("1", "gwei"),
      }
    );
    await kycAnalytics.waitForDeployment();
    const kycAnalyticsAddress = await kycAnalytics.getAddress();
    deployedContracts.KYCAnalytics = kycAnalyticsAddress;
    deploymentLog.push({
      name: "KYCAnalytics",
      address: kycAnalyticsAddress,
      txHash: kycAnalytics.deploymentTransaction()?.hash
    });
    console.log("✅ KYCAnalytics deployed to:", kycAnalyticsAddress);

    // 16. Deploy KYCCompliance
    console.log("\n📋 Deploying KYCCompliance...");
    const KYCCompliance = await ethers.getContractFactory("KYCCompliance");
    const kycCompliance = await KYCCompliance.deploy(
      kycManagerAddress,
      complianceCheckerAddress,
      auditLoggerAddress,
      {
        gasLimit: 3000000,
        gasPrice: ethers.parseUnits("1", "gwei"),
      }
    );
    await kycCompliance.waitForDeployment();
    const kycComplianceAddress = await kycCompliance.getAddress();
    deployedContracts.KYCCompliance = kycComplianceAddress;
    deploymentLog.push({
      name: "KYCCompliance",
      address: kycComplianceAddress,
      txHash: kycCompliance.deploymentTransaction()?.hash
    });
    console.log("✅ KYCCompliance deployed to:", kycComplianceAddress);

    // 17. Deploy KYCSecurity
    console.log("\n🔒 Deploying KYCSecurity...");
    const KYCSecurity = await ethers.getContractFactory("KYCSecurity");
    const kycSecurity = await KYCSecurity.deploy(
      kycManagerAddress,
      auditLoggerAddress,
      {
        gasLimit: 3000000,
        gasPrice: ethers.parseUnits("1", "gwei"),
      }
    );
    await kycSecurity.waitForDeployment();
    const kycSecurityAddress = await kycSecurity.getAddress();
    deployedContracts.KYCSecurity = kycSecurityAddress;
    deploymentLog.push({
      name: "KYCSecurity",
      address: kycSecurityAddress,
      txHash: kycSecurity.deploymentTransaction()?.hash
    });
    console.log("✅ KYCSecurity deployed to:", kycSecurityAddress);

    // 18. Deploy KYCIntegration
    console.log("\n🔗 Deploying KYCIntegration...");
    const KYCIntegration = await ethers.getContractFactory("KYCIntegration");
    const kycIntegration = await KYCIntegration.deploy(
      kycManagerAddress,
      auditLoggerAddress,
      {
        gasLimit: 3000000,
        gasPrice: ethers.parseUnits("1", "gwei"),
      }
    );
    await kycIntegration.waitForDeployment();
    const kycIntegrationAddress = await kycIntegration.getAddress();
    deployedContracts.KYCIntegration = kycIntegrationAddress;
    deploymentLog.push({
      name: "KYCIntegration",
      address: kycIntegrationAddress,
      txHash: kycIntegration.deploymentTransaction()?.hash
    });
    console.log("✅ KYCIntegration deployed to:", kycIntegrationAddress);

    // 19. Deploy KYCReporting
    console.log("\n📊 Deploying KYCReporting...");
    const KYCReporting = await ethers.getContractFactory("KYCReporting");
    const kycReporting = await KYCReporting.deploy(
      kycManagerAddress,
      auditLoggerAddress,
      {
        gasLimit: 3000000,
        gasPrice: ethers.parseUnits("1", "gwei"),
      }
    );
    await kycReporting.waitForDeployment();
    const kycReportingAddress = await kycReporting.getAddress();
    deployedContracts.KYCReporting = kycReportingAddress;
    deploymentLog.push({
      name: "KYCReporting",
      address: kycReportingAddress,
      txHash: kycReporting.deploymentTransaction()?.hash
    });
    console.log("✅ KYCReporting deployed to:", kycReportingAddress);

    // 20. Deploy KYCNotifications
    console.log("\n🔔 Deploying KYCNotifications...");
    const KYCNotifications = await ethers.getContractFactory("KYCNotifications");
    const kycNotifications = await KYCNotifications.deploy(
      kycManagerAddress,
      auditLoggerAddress,
      {
        gasLimit: 3000000,
        gasPrice: ethers.parseUnits("1", "gwei"),
      }
    );
    await kycNotifications.waitForDeployment();
    const kycNotificationsAddress = await kycNotifications.getAddress();
    deployedContracts.KYCNotifications = kycNotificationsAddress;
    deploymentLog.push({
      name: "KYCNotifications",
      address: kycNotificationsAddress,
      txHash: kycNotifications.deploymentTransaction()?.hash
    });
    console.log("✅ KYCNotifications deployed to:", kycNotificationsAddress);

    // 21. Deploy KYCMaintenance
    console.log("\n🔧 Deploying KYCMaintenance...");
    const KYCMaintenance = await ethers.getContractFactory("KYCMaintenance");
    const kycMaintenance = await KYCMaintenance.deploy(
      kycManagerAddress,
      auditLoggerAddress,
      {
        gasLimit: 3000000,
        gasPrice: ethers.parseUnits("1", "gwei"),
      }
    );
    await kycMaintenance.waitForDeployment();
    const kycMaintenanceAddress = await kycMaintenance.getAddress();
    deployedContracts.KYCMaintenance = kycMaintenanceAddress;
    deploymentLog.push({
      name: "KYCMaintenance",
      address: kycMaintenanceAddress,
      txHash: kycMaintenance.deploymentTransaction()?.hash
    });
    console.log("✅ KYCMaintenance deployed to:", kycMaintenanceAddress);

    // Final balance check
    const finalBalance = await ethers.provider.getBalance(deployer.address);
    const gasUsed = balance - finalBalance;
    console.log("\n💰 Gas used:", ethers.formatEther(gasUsed), "ETH");
    console.log("💰 Remaining balance:", ethers.formatEther(finalBalance), "ETH");

    // Save deployment results
    const deploymentResults = {
      network: "tractsafe",
      chainId: 35935,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployedContracts,
      deploymentLog: deploymentLog,
      gasUsed: ethers.formatEther(gasUsed),
      finalBalance: ethers.formatEther(finalBalance)
    };

    // Write to file
    const fs = require('fs');
    const path = require('path');
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

    console.log("\n🎉 All contracts deployed successfully to Tractsafe network!");
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
