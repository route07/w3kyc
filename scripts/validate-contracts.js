const fs = require('fs');
const path = require('path');

console.log("🔍 Web3 KYC System Contract Validation");
console.log("=====================================\n");

// List of all contracts to validate
const contracts = [
  // Storage Contracts
  'contracts/storage/KYCDataStorage.sol',
  'contracts/storage/AuditLogStorage.sol',
  'contracts/storage/TenantConfigStorage.sol',
  'contracts/storage/DIDCredentialStorage.sol',
  
  // Business Logic Contracts
  'contracts/business/KYCManager.sol',
  'contracts/business/DIDManager.sol',
  
  // Access Control Contracts
  'contracts/access/AuthorizationManager.sol',
  
  // Utility Contracts
  'contracts/utility/ComplianceChecker.sol',
  'contracts/utility/InputValidator.sol',
  'contracts/utility/BoundsChecker.sol',
  
  // System Contracts
  'contracts/system/MultisigManager.sol',
  'contracts/system/MultisigModifier.sol',
  'contracts/system/EmergencyManager.sol',
  
  // Phase 3 Advanced Features
  'contracts/utility/VersionManager.sol',
  'contracts/business/BatchOperationsSimple.sol',
  'contracts/utility/JurisdictionConfig.sol',
  'contracts/utility/CredentialTypeManagerSimple.sol',
  'contracts/utility/FeatureFlags.sol',
  
  // Examples
  'contracts/examples/MultisigExample.sol'
];

// Validation results
const results = {
  total: contracts.length,
  exists: 0,
  missing: 0,
  hasReentrancyGuard: 0,
  hasInputValidation: 0,
  hasEvents: 0,
  hasDocumentation: 0,
  issues: []
};

console.log("📋 Contract Validation Results:");
console.log("==============================\n");

contracts.forEach(contractPath => {
  const contractName = path.basename(contractPath, '.sol');
  const fullPath = path.join(process.cwd(), contractPath);
  
  console.log(`🔍 Validating ${contractName}...`);
  
  if (fs.existsSync(fullPath)) {
    results.exists++;
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for ReentrancyGuard (either direct import or inheritance)
    if (content.includes('ReentrancyGuard') || content.includes('nonReentrant')) {
      results.hasReentrancyGuard++;
      console.log(`  ✅ ReentrancyGuard protection`);
    } else {
      results.issues.push(`${contractName}: Missing ReentrancyGuard protection`);
      console.log(`  ❌ Missing ReentrancyGuard protection`);
    }
    
    // Check for Input Validation
    if (content.includes('InputValidator') || content.includes('validateAddress') || content.includes('require(')) {
      results.hasInputValidation++;
      console.log(`  ✅ Input validation present`);
    } else {
      results.issues.push(`${contractName}: Missing input validation`);
      console.log(`  ❌ Missing input validation`);
    }
    
    // Check for Events
    if (content.includes('event ') && content.includes('emit ')) {
      results.hasEvents++;
      console.log(`  ✅ Events defined and emitted`);
    } else {
      results.issues.push(`${contractName}: Missing events`);
      console.log(`  ❌ Missing events`);
    }
    
    // Check for Documentation
    if (content.includes('/**') && content.includes('@dev') && content.includes('@notice')) {
      results.hasDocumentation++;
      console.log(`  ✅ Comprehensive documentation`);
    } else {
      results.issues.push(`${contractName}: Missing comprehensive documentation`);
      console.log(`  ❌ Missing comprehensive documentation`);
    }
    
    console.log(`  ✅ Contract exists and is readable`);
  } else {
    results.missing++;
    results.issues.push(`${contractName}: Contract file not found`);
    console.log(`  ❌ Contract file not found`);
  }
  
  console.log('');
});

// Summary
console.log("📊 Validation Summary:");
console.log("=====================");
console.log(`Total Contracts: ${results.total}`);
console.log(`✅ Exists: ${results.exists}`);
console.log(`❌ Missing: ${results.missing}`);
console.log(`🛡️ ReentrancyGuard: ${results.hasReentrancyGuard}/${results.exists}`);
console.log(`🔍 Input Validation: ${results.hasInputValidation}/${results.exists}`);
console.log(`📢 Events: ${results.hasEvents}/${results.exists}`);
console.log(`📚 Documentation: ${results.hasDocumentation}/${results.exists}`);

const successRate = ((results.exists / results.total) * 100).toFixed(1);
console.log(`\n🎯 Overall Success Rate: ${successRate}%`);

if (results.issues.length > 0) {
  console.log("\n⚠️ Issues Found:");
  console.log("================");
  results.issues.forEach(issue => {
    console.log(`- ${issue}`);
  });
} else {
  console.log("\n🎉 All contracts validated successfully!");
}

// Contract Architecture Analysis
console.log("\n🏗️ Contract Architecture Analysis:");
console.log("==================================");

const architecture = {
  storage: contracts.filter(c => c.includes('storage/')).length,
  business: contracts.filter(c => c.includes('business/')).length,
  access: contracts.filter(c => c.includes('access/')).length,
  utility: contracts.filter(c => c.includes('utility/')).length,
  system: contracts.filter(c => c.includes('system/')).length,
  examples: contracts.filter(c => c.includes('examples/')).length
};

console.log(`📦 Storage Contracts: ${architecture.storage}`);
console.log(`⚙️ Business Logic: ${architecture.business}`);
console.log(`🔐 Access Control: ${architecture.access}`);
console.log(`🛠️ Utility Contracts: ${architecture.utility}`);
console.log(`🔧 System Contracts: ${architecture.system}`);
console.log(`📚 Examples: ${architecture.examples}`);

// Security Features Analysis
console.log("\n🛡️ Security Features Analysis:");
console.log("==============================");

const securityFeatures = {
  reentrancyProtection: results.hasReentrancyGuard,
  inputValidation: results.hasInputValidation,
  accessControl: contracts.filter(c => c.includes('Authorization') || c.includes('Multisig')).length,
  emergencyControls: contracts.filter(c => c.includes('Emergency')).length,
  auditLogging: contracts.filter(c => c.includes('AuditLog')).length
};

console.log(`🔄 Reentrancy Protection: ${securityFeatures.reentrancyProtection} contracts`);
console.log(`🔍 Input Validation: ${securityFeatures.inputValidation} contracts`);
console.log(`🔐 Access Control: ${securityFeatures.accessControl} contracts`);
console.log(`🚨 Emergency Controls: ${securityFeatures.emergencyControls} contracts`);
console.log(`📝 Audit Logging: ${securityFeatures.auditLogging} contracts`);

// Phase 3 Features Analysis
console.log("\n🚀 Phase 3 Advanced Features:");
console.log("=============================");

const phase3Features = {
  versioning: contracts.filter(c => c.includes('Version')).length,
  batchOperations: contracts.filter(c => c.includes('Batch')).length,
  jurisdictionConfig: contracts.filter(c => c.includes('Jurisdiction')).length,
  credentialTypes: contracts.filter(c => c.includes('CredentialType')).length,
  featureFlags: contracts.filter(c => c.includes('Feature')).length
};

console.log(`📋 Versioning: ${phase3Features.versioning} contracts`);
console.log(`⚡ Batch Operations: ${phase3Features.batchOperations} contracts`);
console.log(`🌍 Jurisdiction Config: ${phase3Features.jurisdictionConfig} contracts`);
console.log(`🎫 Credential Types: ${phase3Features.credentialTypes} contracts`);
console.log(`🚩 Feature Flags: ${phase3Features.featureFlags} contracts`);

// Recommendations
console.log("\n💡 Recommendations:");
console.log("===================");

if (results.missing > 0) {
  console.log("❌ Fix missing contracts before deployment");
}

if (results.hasReentrancyGuard < results.exists) {
  console.log("🛡️ Add ReentrancyGuard to remaining contracts");
}

if (results.hasInputValidation < results.exists) {
  console.log("🔍 Add input validation to remaining contracts");
}

if (results.hasEvents < results.exists) {
  console.log("📢 Add events to remaining contracts");
}

if (results.hasDocumentation < results.exists) {
  console.log("📚 Add comprehensive documentation to remaining contracts");
}

console.log("\n🎯 Next Steps:");
console.log("==============");
console.log("1. Fix any identified issues");
console.log("2. Deploy to testnet for real-world testing");
console.log("3. Conduct security audit");
console.log("4. Perform integration testing");
console.log("5. Deploy to mainnet");

console.log("\n✅ Contract validation completed!");
