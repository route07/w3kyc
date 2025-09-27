const { ethers } = require("ethers");
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

async function main() {
  console.log("🧪 Web3 KYC System - Testing Deployed Contracts");
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

  console.log("Testing with account:", wallet.address);
  
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

  // Load deployment info
  let deploymentInfo;
  try {
    const deploymentData = fs.readFileSync('deployment-london-complete-with-args.json', 'utf8');
    deploymentInfo = JSON.parse(deploymentData);
    console.log(`📄 Loaded deployment info: ${deploymentInfo.deployedContracts}/21 contracts`);
  } catch (error) {
    console.log("❌ Failed to load deployment info:", error.message);
    process.exit(1);
  }

  const testResults = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    contractTests: {}
  };

  try {
    console.log("\n🧪 Phase 1: Testing Storage Contracts...");
    
    // Test KYCDataStorage
    console.log("1. Testing KYCDataStorage...");
    testResults.totalTests++;
    try {
      const kycStorageArtifact = JSON.parse(fs.readFileSync(
        path.join(__dirname, '..', 'artifacts', 'contracts', 'storage', 'KYCDataStorage.sol', 'KYCDataStorage.json'),
        'utf8'
      ));
      const kycStorage = new ethers.Contract(
        deploymentInfo.contracts.KYCDataStorage,
        kycStorageArtifact.abi,
        wallet
      );
      
      // Test basic functions
      const owner = await kycStorage.owner();
      const version = await kycStorage.VERSION();
      const contractName = await kycStorage.CONTRACT_NAME();
      
      console.log(`   ✅ Owner: ${owner}`);
      console.log(`   ✅ Version: ${version}`);
      console.log(`   ✅ Contract Name: ${contractName}`);
      
      testResults.passedTests++;
      testResults.contractTests.KYCDataStorage = "PASSED";
    } catch (error) {
      console.log(`   ❌ KYCDataStorage test failed: ${error.message}`);
      testResults.failedTests++;
      testResults.contractTests.KYCDataStorage = `FAILED: ${error.message}`;
    }

    // Test AuditLogStorage
    console.log("2. Testing AuditLogStorage...");
    testResults.totalTests++;
    try {
      const auditLogArtifact = JSON.parse(fs.readFileSync(
        path.join(__dirname, '..', 'artifacts', 'contracts', 'storage', 'AuditLogStorage.sol', 'AuditLogStorage.json'),
        'utf8'
      ));
      const auditLog = new ethers.Contract(
        deploymentInfo.contracts.AuditLogStorage,
        auditLogArtifact.abi,
        wallet
      );
      
      const owner = await auditLog.owner();
      const version = await auditLog.VERSION();
      
      console.log(`   ✅ Owner: ${owner}`);
      console.log(`   ✅ Version: ${version}`);
      
      testResults.passedTests++;
      testResults.contractTests.AuditLogStorage = "PASSED";
    } catch (error) {
      console.log(`   ❌ AuditLogStorage test failed: ${error.message}`);
      testResults.failedTests++;
      testResults.contractTests.AuditLogStorage = `FAILED: ${error.message}`;
    }

    // Test TenantConfigStorage
    console.log("3. Testing TenantConfigStorage...");
    testResults.totalTests++;
    try {
      const tenantConfigArtifact = JSON.parse(fs.readFileSync(
        path.join(__dirname, '..', 'artifacts', 'contracts', 'storage', 'TenantConfigStorage.sol', 'TenantConfigStorage.json'),
        'utf8'
      ));
      const tenantConfig = new ethers.Contract(
        deploymentInfo.contracts.TenantConfigStorage,
        tenantConfigArtifact.abi,
        wallet
      );
      
      const owner = await tenantConfig.owner();
      const version = await tenantConfig.VERSION();
      
      console.log(`   ✅ Owner: ${owner}`);
      console.log(`   ✅ Version: ${version}`);
      
      testResults.passedTests++;
      testResults.contractTests.TenantConfigStorage = "PASSED";
    } catch (error) {
      console.log(`   ❌ TenantConfigStorage test failed: ${error.message}`);
      testResults.failedTests++;
      testResults.contractTests.TenantConfigStorage = `FAILED: ${error.message}`;
    }

    // Test DIDCredentialStorage
    console.log("4. Testing DIDCredentialStorage...");
    testResults.totalTests++;
    try {
      const didCredentialArtifact = JSON.parse(fs.readFileSync(
        path.join(__dirname, '..', 'artifacts', 'contracts', 'storage', 'DIDCredentialStorage.sol', 'DIDCredentialStorage.json'),
        'utf8'
      ));
      const didCredential = new ethers.Contract(
        deploymentInfo.contracts.DIDCredentialStorage,
        didCredentialArtifact.abi,
        wallet
      );
      
      const owner = await didCredential.owner();
      const version = await didCredential.VERSION();
      
      console.log(`   ✅ Owner: ${owner}`);
      console.log(`   ✅ Version: ${version}`);
      
      testResults.passedTests++;
      testResults.contractTests.DIDCredentialStorage = "PASSED";
    } catch (error) {
      console.log(`   ❌ DIDCredentialStorage test failed: ${error.message}`);
      testResults.failedTests++;
      testResults.contractTests.DIDCredentialStorage = `FAILED: ${error.message}`;
    }

    console.log("\n🧪 Phase 2: Testing Business Logic Contracts...");
    
    // Test KYCManager
    console.log("5. Testing KYCManager...");
    testResults.totalTests++;
    try {
      const kycManagerArtifact = JSON.parse(fs.readFileSync(
        path.join(__dirname, '..', 'artifacts', 'contracts', 'business', 'KYCManager.sol', 'KYCManager.json'),
        'utf8'
      ));
      const kycManager = new ethers.Contract(
        deploymentInfo.contracts.KYCManager,
        kycManagerArtifact.abi,
        wallet
      );
      
      const owner = await kycManager.owner();
      const version = await kycManager.VERSION();
      const kycDataStorage = await kycManager.kycDataStorage();
      
      console.log(`   ✅ Owner: ${owner}`);
      console.log(`   ✅ Version: ${version}`);
      console.log(`   ✅ KYC Data Storage: ${kycDataStorage}`);
      
      testResults.passedTests++;
      testResults.contractTests.KYCManager = "PASSED";
    } catch (error) {
      console.log(`   ❌ KYCManager test failed: ${error.message}`);
      testResults.failedTests++;
      testResults.contractTests.KYCManager = `FAILED: ${error.message}`;
    }

    // Test DIDManager
    console.log("6. Testing DIDManager...");
    testResults.totalTests++;
    try {
      const didManagerArtifact = JSON.parse(fs.readFileSync(
        path.join(__dirname, '..', 'artifacts', 'contracts', 'business', 'DIDManager.sol', 'DIDManager.json'),
        'utf8'
      ));
      const didManager = new ethers.Contract(
        deploymentInfo.contracts.DIDManager,
        didManagerArtifact.abi,
        wallet
      );
      
      const owner = await didManager.owner();
      const version = await didManager.VERSION();
      const didCredentialStorage = await didManager.didCredentialStorage();
      
      console.log(`   ✅ Owner: ${owner}`);
      console.log(`   ✅ Version: ${version}`);
      console.log(`   ✅ DID Credential Storage: ${didCredentialStorage}`);
      
      testResults.passedTests++;
      testResults.contractTests.DIDManager = "PASSED";
    } catch (error) {
      console.log(`   ❌ DIDManager test failed: ${error.message}`);
      testResults.failedTests++;
      testResults.contractTests.DIDManager = `FAILED: ${error.message}`;
    }

    console.log("\n🧪 Phase 3: Testing System Contracts...");
    
    // Test MultisigManager
    console.log("7. Testing MultisigManager...");
    testResults.totalTests++;
    try {
      const multisigManagerArtifact = JSON.parse(fs.readFileSync(
        path.join(__dirname, '..', 'artifacts', 'contracts', 'system', 'MultisigManager.sol', 'MultisigManager.json'),
        'utf8'
      ));
      const multisigManager = new ethers.Contract(
        deploymentInfo.contracts.MultisigManager,
        multisigManagerArtifact.abi,
        wallet
      );
      
      const owner = await multisigManager.owner();
      const authorizedSignerCount = await multisigManager.getAuthorizedSignerCount();
      
      console.log(`   ✅ Owner: ${owner}`);
      console.log(`   ✅ Authorized Signer Count: ${authorizedSignerCount}`);
      
      testResults.passedTests++;
      testResults.contractTests.MultisigManager = "PASSED";
    } catch (error) {
      console.log(`   ❌ MultisigManager test failed: ${error.message}`);
      testResults.failedTests++;
      testResults.contractTests.MultisigManager = `FAILED: ${error.message}`;
    }

    // Test EmergencyManager
    console.log("8. Testing EmergencyManager...");
    testResults.totalTests++;
    try {
      const emergencyManagerArtifact = JSON.parse(fs.readFileSync(
        path.join(__dirname, '..', 'artifacts', 'contracts', 'system', 'EmergencyManager.sol', 'EmergencyManager.json'),
        'utf8'
      ));
      const emergencyManager = new ethers.Contract(
        deploymentInfo.contracts.EmergencyManager,
        emergencyManagerArtifact.abi,
        wallet
      );
      
      const owner = await emergencyManager.owner();
      const multisigManager = await emergencyManager.multisigManager();
      
      console.log(`   ✅ Owner: ${owner}`);
      console.log(`   ✅ Multisig Manager: ${multisigManager}`);
      
      testResults.passedTests++;
      testResults.contractTests.EmergencyManager = "PASSED";
    } catch (error) {
      console.log(`   ❌ EmergencyManager test failed: ${error.message}`);
      testResults.failedTests++;
      testResults.contractTests.EmergencyManager = `FAILED: ${error.message}`;
    }

    console.log("\n🧪 Phase 4: Testing Utility Contracts...");
    
    // Test InputValidator
    console.log("9. Testing InputValidator...");
    testResults.totalTests++;
    try {
      const inputValidatorArtifact = JSON.parse(fs.readFileSync(
        path.join(__dirname, '..', 'artifacts', 'contracts', 'utility', 'InputValidator.sol', 'InputValidator.json'),
        'utf8'
      ));
      const inputValidator = new ethers.Contract(
        deploymentInfo.contracts.InputValidator,
        inputValidatorArtifact.abi,
        wallet
      );
      
      // Test a validation function
      const isValidAddress = await inputValidator.isValidAddress(wallet.address);
      console.log(`   ✅ Address validation test: ${isValidAddress}`);
      
      testResults.passedTests++;
      testResults.contractTests.InputValidator = "PASSED";
    } catch (error) {
      console.log(`   ❌ InputValidator test failed: ${error.message}`);
      testResults.failedTests++;
      testResults.contractTests.InputValidator = `FAILED: ${error.message}`;
    }

    // Test BoundsChecker
    console.log("10. Testing BoundsChecker...");
    testResults.totalTests++;
    try {
      const boundsCheckerArtifact = JSON.parse(fs.readFileSync(
        path.join(__dirname, '..', 'artifacts', 'contracts', 'utility', 'BoundsChecker.sol', 'BoundsChecker.json'),
        'utf8'
      ));
      const boundsChecker = new ethers.Contract(
        deploymentInfo.contracts.BoundsChecker,
        boundsCheckerArtifact.abi,
        wallet
      );
      
      // Test bounds checking function
      const isValidIndex = await boundsChecker.isValidIndex(5, 10);
      console.log(`   ✅ Index validation test: ${isValidIndex}`);
      
      testResults.passedTests++;
      testResults.contractTests.BoundsChecker = "PASSED";
    } catch (error) {
      console.log(`   ❌ BoundsChecker test failed: ${error.message}`);
      testResults.failedTests++;
      testResults.contractTests.BoundsChecker = `FAILED: ${error.message}`;
    }

    console.log("\n🧪 Phase 5: Testing Advanced Contracts...");
    
    // Test ComplianceChecker
    console.log("11. Testing ComplianceChecker...");
    testResults.totalTests++;
    try {
      const complianceCheckerArtifact = JSON.parse(fs.readFileSync(
        path.join(__dirname, '..', 'artifacts', 'contracts', 'utility', 'ComplianceChecker.sol', 'ComplianceChecker.json'),
        'utf8'
      ));
      const complianceChecker = new ethers.Contract(
        deploymentInfo.contracts.ComplianceChecker,
        complianceCheckerArtifact.abi,
        wallet
      );
      
      const owner = await complianceChecker.owner();
      const version = await complianceChecker.VERSION();
      
      console.log(`   ✅ Owner: ${owner}`);
      console.log(`   ✅ Version: ${version}`);
      
      testResults.passedTests++;
      testResults.contractTests.ComplianceChecker = "PASSED";
    } catch (error) {
      console.log(`   ❌ ComplianceChecker test failed: ${error.message}`);
      testResults.failedTests++;
      testResults.contractTests.ComplianceChecker = `FAILED: ${error.message}`;
    }

    // Test GovernanceManager
    console.log("12. Testing GovernanceManager...");
    testResults.totalTests++;
    try {
      const governanceManagerArtifact = JSON.parse(fs.readFileSync(
        path.join(__dirname, '..', 'artifacts', 'contracts', 'governance', 'GovernanceManager.sol', 'GovernanceManager.json'),
        'utf8'
      ));
      const governanceManager = new ethers.Contract(
        deploymentInfo.contracts.GovernanceManager,
        governanceManagerArtifact.abi,
        wallet
      );
      
      const owner = await governanceManager.owner();
      const version = await governanceManager.VERSION();
      
      console.log(`   ✅ Owner: ${owner}`);
      console.log(`   ✅ Version: ${version}`);
      
      testResults.passedTests++;
      testResults.contractTests.GovernanceManager = "PASSED";
    } catch (error) {
      console.log(`   ❌ GovernanceManager test failed: ${error.message}`);
      testResults.failedTests++;
      testResults.contractTests.GovernanceManager = `FAILED: ${error.message}`;
    }

    console.log("\n📋 Contract Testing Summary:");
    console.log("============================");
    console.log(`Total Tests: ${testResults.totalTests}`);
    console.log(`Passed Tests: ${testResults.passedTests}`);
    console.log(`Failed Tests: ${testResults.failedTests}`);
    console.log(`Success Rate: ${((testResults.passedTests / testResults.totalTests) * 100).toFixed(1)}%`);

    console.log("\n📊 Detailed Test Results:");
    Object.entries(testResults.contractTests).forEach(([contract, result]) => {
      const status = result.startsWith("PASSED") ? "✅" : "❌";
      console.log(`${status} ${contract}: ${result}`);
    });

    // Analysis
    const successRate = (testResults.passedTests / testResults.totalTests) * 100;
    if (successRate === 100) {
      console.log("\n🎉 PERFECT! All contract tests passed!");
      console.log("🚀 All deployed contracts are fully functional!");
    } else if (successRate >= 90) {
      console.log("\n🎉 EXCELLENT! Nearly all contract tests passed!");
      console.log("🔍 Minor issues with a few contracts");
    } else if (successRate >= 75) {
      console.log("\n🟡 GOOD! Most contract tests passed!");
      console.log("📈 System is largely functional");
    } else {
      console.log("\n⚠️ PARTIAL SUCCESS! Some contract tests passed");
      console.log("🔍 Further investigation needed");
    }

    // Save test results
    const testInfo = {
      network: "Route07 Testnet",
      evmVersion: "london",
      tester: wallet.address,
      testTime: new Date().toISOString(),
      totalTests: testResults.totalTests,
      passedTests: testResults.passedTests,
      failedTests: testResults.failedTests,
      successRate: successRate,
      contractTests: testResults.contractTests,
      analysis: `Contract functionality test - ${successRate.toFixed(1)}% success rate`,
      status: successRate === 100 ? "All contracts functional" : "Partial functionality"
    };

    fs.writeFileSync('contract-test-results.json', JSON.stringify(testInfo, null, 2));
    console.log("\n📄 Test results saved to contract-test-results.json");

    console.log("\n🌐 Explorer: https://explorer.route07.com");
    console.log("\n📋 Next Steps:");
    console.log("   1. Review any failed tests and investigate issues");
    console.log("   2. Update documentation with test results");
    console.log("   3. Consider production deployment with London EVM");
    console.log("   4. Implement comprehensive integration testing");

  } catch (error) {
    console.error("❌ Testing failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });