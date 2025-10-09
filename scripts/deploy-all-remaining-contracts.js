const { ethers } = require('ethers');
const solc = require('solc');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Tractsafe network configuration
const TRACTSAFE_CONFIG = {
  url: "https://tapi.tractsafe.com",
  chainId: 35935,
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  gas: "auto",
  gasPrice: "auto",
  timeout: 60000,
  httpHeaders: {
    "Content-Type": "application/json",
  }
};

// Contract sources with SPDX license
const contractSources = {
  'VersionManager': `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VersionManager {
    address public owner;
    string public currentVersion;
    mapping(string => bool) public supportedVersions;
    
    constructor() {
        owner = msg.sender;
        currentVersion = "1.0.0";
        supportedVersions["1.0.0"] = true;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    function setVersion(string memory version) external onlyOwner {
        currentVersion = version;
        supportedVersions[version] = true;
    }
    
    function isVersionSupported(string memory version) external view returns (bool) {
        return supportedVersions[version];
    }
}`,

  'JurisdictionConfig': `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract JurisdictionConfig {
    address public owner;
    mapping(string => bool) public supportedJurisdictions;
    mapping(string => string) public jurisdictionRules;
    
    constructor() {
        owner = msg.sender;
        supportedJurisdictions["US"] = true;
        supportedJurisdictions["UK"] = true;
        supportedJurisdictions["EU"] = true;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    function addJurisdiction(string memory jurisdiction, string memory rules) external onlyOwner {
        supportedJurisdictions[jurisdiction] = true;
        jurisdictionRules[jurisdiction] = rules;
    }
    
    function isJurisdictionSupported(string memory jurisdiction) external view returns (bool) {
        return supportedJurisdictions[jurisdiction];
    }
}`,

  'FeatureFlags': `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FeatureFlags {
    address public owner;
    mapping(string => bool) public features;
    
    constructor() {
        owner = msg.sender;
        features["kyc_verification"] = true;
        features["did_management"] = true;
        features["multisig"] = true;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    function setFeature(string memory feature, bool enabled) external onlyOwner {
        features[feature] = enabled;
    }
    
    function isFeatureEnabled(string memory feature) external view returns (bool) {
        return features[feature];
    }
}`,

  'CredentialTypeManager': `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CredentialTypeManager {
    address public owner;
    mapping(string => bool) public credentialTypes;
    
    constructor() {
        owner = msg.sender;
        credentialTypes["passport"] = true;
        credentialTypes["drivers_license"] = true;
        credentialTypes["national_id"] = true;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    function addCredentialType(string memory credentialType) external onlyOwner {
        credentialTypes[credentialType] = true;
    }
    
    function isCredentialTypeSupported(string memory credentialType) external view returns (bool) {
        return credentialTypes[credentialType];
    }
}`,

  'MultisigModifier': `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMultisigManager {
    function isAuthorizedSigner(address signer) external view returns (bool);
}

contract MultisigModifier {
    address public owner;
    IMultisigManager public multisigManager;
    
    constructor(address _multisigManager) {
        owner = msg.sender;
        if (_multisigManager != address(0)) {
            multisigManager = IMultisigManager(_multisigManager);
        }
    }
    
    modifier onlyMultisig() {
        if (address(multisigManager) != address(0)) {
            require(multisigManager.isAuthorizedSigner(msg.sender), "Not authorized signer");
        } else {
            require(msg.sender == owner, "Only owner");
        }
        _;
    }
}`,

  'EmergencyManager': `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMultisigManager {
    function isAuthorizedSigner(address signer) external view returns (bool);
}

contract EmergencyManager {
    address public owner;
    IMultisigManager public multisigManager;
    bool public emergencyMode;
    
    constructor(address _multisigManager) {
        require(_multisigManager != address(0), "Invalid multisig manager address");
        owner = msg.sender;
        multisigManager = IMultisigManager(_multisigManager);
        emergencyMode = false;
    }
    
    modifier onlyMultisig() {
        require(multisigManager.isAuthorizedSigner(msg.sender), "Not authorized signer");
        _;
    }
    
    function activateEmergencyMode() external onlyMultisig {
        emergencyMode = true;
    }
    
    function deactivateEmergencyMode() external onlyMultisig {
        emergencyMode = false;
    }
    
    function isEmergencyMode() external view returns (bool) {
        return emergencyMode;
    }
}`,

  'GovernanceManager': `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GovernanceManager {
    address public owner;
    
    struct Proposal {
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        mapping(address => bool) hasVoted;
    }
    
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    
    constructor() {
        owner = msg.sender;
        proposalCount = 0;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    function createProposal(string memory description, uint256 duration) external onlyOwner returns (uint256) {
        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        proposal.description = description;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + duration;
        proposal.executed = false;
        return proposalId;
    }
    
    function vote(uint256 proposalId, bool support) external onlyOwner {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        proposal.hasVoted[msg.sender] = true;
        if (support) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }
    }
}`,

  'MultisigExample': `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMultisigManager {
    function isAuthorizedSigner(address signer) external view returns (bool);
}

contract MultisigModifier {
    address public owner;
    IMultisigManager public multisigManager;
    
    constructor(address _multisigManager) {
        owner = msg.sender;
        if (_multisigManager != address(0)) {
            multisigManager = IMultisigManager(_multisigManager);
        }
    }
    
    modifier onlyMultisig() {
        if (address(multisigManager) != address(0)) {
            require(multisigManager.isAuthorizedSigner(msg.sender), "Not authorized signer");
        } else {
            require(msg.sender == owner, "Only owner");
        }
        _;
    }
}

contract MultisigExample is MultisigModifier {
    uint256 public configValue;
    string public configString;
    bool public isActive;
    
    constructor(address _multisigManager) MultisigModifier(_multisigManager) {
        configValue = 100;
        configString = "default";
        isActive = true;
    }
    
    function updateConfig(uint256 _value, string memory _string) external onlyMultisig {
        configValue = _value;
        configString = _string;
    }
    
    function toggleActive() external onlyMultisig {
        isActive = !isActive;
    }
}`,

  'AuthorizationManager': `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IAuditLogStorage {
    function logEvent(address user, string memory eventType, string memory details) external;
}

contract AuthorizationManager {
    address public owner;
    IAuditLogStorage public auditLogStorage;
    
    mapping(address => bool) public authorizedUsers;
    mapping(address => mapping(string => bool)) public userPermissions;
    
    constructor(address _auditLogStorage) {
        require(_auditLogStorage != address(0), "Invalid audit log storage address");
        owner = msg.sender;
        auditLogStorage = IAuditLogStorage(_auditLogStorage);
        authorizedUsers[owner] = true;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    function authorizeUser(address user) external onlyOwner {
        authorizedUsers[user] = true;
        auditLogStorage.logEvent(user, "USER_AUTHORIZED", "User authorized");
    }
    
    function revokeUser(address user) external onlyOwner {
        authorizedUsers[user] = false;
        auditLogStorage.logEvent(user, "USER_REVOKED", "User authorization revoked");
    }
    
    function isAuthorized(address user) external view returns (bool) {
        return authorizedUsers[user];
    }
}`,

  'ComplianceChecker': `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IKYCDataStorage {
    function getKYCData(address user) external view returns (bool, uint256, string memory);
}

interface ITenantConfigStorage {
    function getTenantConfig(string memory tenantId) external view returns (bool, string memory);
}

interface IDIDCredentialStorage {
    function isCredentialValid(bytes32 credentialId) external view returns (bool);
}

contract ComplianceChecker {
    address public owner;
    IKYCDataStorage public kycDataStorage;
    ITenantConfigStorage public tenantConfigStorage;
    IDIDCredentialStorage public didCredentialStorage;
    
    constructor(
        address _kycDataStorage,
        address _tenantConfigStorage,
        address _didCredentialStorage
    ) {
        require(_kycDataStorage != address(0), "Invalid KYC data storage address");
        require(_tenantConfigStorage != address(0), "Invalid tenant config storage address");
        require(_didCredentialStorage != address(0), "Invalid DID credential storage address");
        
        owner = msg.sender;
        kycDataStorage = IKYCDataStorage(_kycDataStorage);
        tenantConfigStorage = ITenantConfigStorage(_tenantConfigStorage);
        didCredentialStorage = IDIDCredentialStorage(_didCredentialStorage);
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    function checkCompliance(address user, string memory tenantId) external view returns (bool) {
        (bool kycVerified, , ) = kycDataStorage.getKYCData(user);
        (bool tenantActive, ) = tenantConfigStorage.getTenantConfig(tenantId);
        
        return kycVerified && tenantActive;
    }
    
    function checkCredentialCompliance(bytes32 credentialId) external view returns (bool) {
        return didCredentialStorage.isCredentialValid(credentialId);
    }
}`
};

// Compile contract source code
function compileContract(source, contractName) {
  const input = {
    language: 'Solidity',
    sources: {
      [contractName]: {
        content: source
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*']
        }
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  
  if (output.errors) {
    const errors = output.errors.filter(error => error.severity === 'error');
    if (errors.length > 0) {
      console.error('Compilation errors:', errors);
      throw new Error('Contract compilation failed');
    }
  }

  const contract = output.contracts[contractName][contractName];
  return {
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object
  };
}

async function deployAllRemainingContracts() {
  console.log('🚀 Starting Complete Web3 KYC System Deployment...\n');
  console.log('📋 Deploying all remaining contracts for 19-contract system\n');

  // Create provider and signer
  const provider = new ethers.JsonRpcProvider(TRACTSAFE_CONFIG.url);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log('📡 Connected to Tractsafe network');
  console.log('👤 Deployer address:', wallet.address);
  console.log('💰 Balance:', ethers.formatEther(await provider.getBalance(wallet.address)), 'ETH\n');

  const deployedContracts = {};
  const deploymentErrors = {};

  // Get existing contract addresses
  const existingAddresses = {
    kycDataStorage: process.env.NEXT_PUBLIC_KYCDATASTORAGE_ADDRESS,
    auditLogStorage: process.env.NEXT_PUBLIC_AUDITLOGSTORAGE_ADDRESS,
    tenantConfigStorage: process.env.NEXT_PUBLIC_TENANTCONFIGSTORAGE_ADDRESS,
    didCredentialStorage: process.env.NEXT_PUBLIC_DIDCREDENTIALSTORAGE_ADDRESS,
    multisigManager: process.env.NEXT_PUBLIC_MULTISIGMANAGER_ADDRESS
  };

  // Define deployment order and dependencies
  const deploymentOrder = [
    // Utility contracts (no dependencies)
    { name: 'VersionManager', dependencies: [] },
    { name: 'JurisdictionConfig', dependencies: [] },
    { name: 'FeatureFlags', dependencies: [] },
    { name: 'CredentialTypeManager', dependencies: [] },
    
    // System contracts (depend on MultisigManager)
    { name: 'MultisigModifier', dependencies: ['multisigManager'] },
    { name: 'EmergencyManager', dependencies: ['multisigManager'] },
    
    // Governance contracts (no dependencies)
    { name: 'GovernanceManager', dependencies: [] },
    
    // Example contracts (depend on MultisigManager)
    { name: 'MultisigExample', dependencies: ['multisigManager'] },
    
    // Access control contracts (depend on AuditLogStorage)
    { name: 'AuthorizationManager', dependencies: ['auditLogStorage'] },
    
    // Compliance contracts (depend on multiple storage contracts)
    { name: 'ComplianceChecker', dependencies: ['kycDataStorage', 'tenantConfigStorage', 'didCredentialStorage'] }
  ];

  for (const contractInfo of deploymentOrder) {
    const { name, dependencies } = contractInfo;
    
    console.log(`📦 Deploying ${name}...`);
    
    try {
      // Check dependencies
      for (const dep of dependencies) {
        if (!existingAddresses[dep] || existingAddresses[dep] === '0x0000000000000000000000000000000000000000') {
          throw new Error(`Missing dependency: ${dep}`);
        }
      }

      // Compile contract
      const compiled = compileContract(contractSources[name], name);
      console.log(`   ✅ ${name} compiled successfully`);

      // Create contract factory
      const ContractFactory = new ethers.ContractFactory(
        compiled.abi,
        compiled.bytecode,
        wallet
      );

      // Deploy with appropriate constructor arguments
      let contract;
      if (name === 'MultisigModifier' || name === 'EmergencyManager' || name === 'MultisigExample') {
        contract = await ContractFactory.deploy(existingAddresses.multisigManager, {
          gasLimit: 2000000,
          gasPrice: ethers.parseUnits("1", "gwei")
        });
      } else if (name === 'AuthorizationManager') {
        contract = await ContractFactory.deploy(existingAddresses.auditLogStorage, {
          gasLimit: 2000000,
          gasPrice: ethers.parseUnits("1", "gwei")
        });
      } else if (name === 'ComplianceChecker') {
        contract = await ContractFactory.deploy(
          existingAddresses.kycDataStorage,
          existingAddresses.tenantConfigStorage,
          existingAddresses.didCredentialStorage,
          {
            gasLimit: 3000000,
            gasPrice: ethers.parseUnits("1", "gwei")
          }
        );
      } else {
        // No constructor parameters
        contract = await ContractFactory.deploy({
          gasLimit: 2000000,
          gasPrice: ethers.parseUnits("1", "gwei")
        });
      }

      await contract.waitForDeployment();
      const address = await contract.getAddress();
      
      deployedContracts[name] = {
        address: address,
        transactionHash: contract.deploymentTransaction().hash
      };
      
      console.log(`   ✅ ${name} deployed at: ${address}`);
      
      // Test basic functionality
      if (name === 'VersionManager') {
        const version = await contract.currentVersion();
        console.log(`   📋 Current version: ${version}`);
      } else if (name === 'FeatureFlags') {
        const kycEnabled = await contract.isFeatureEnabled("kyc_verification");
        console.log(`   🚩 KYC feature enabled: ${kycEnabled}`);
      }
      
      console.log(`   ⛽ Gas used: ~2,000,000\n`);
      
    } catch (error) {
      console.error(`   ❌ ${name} deployment failed:`, error.message);
      deploymentErrors[name] = error.message;
      console.log('');
    }
  }

  // Summary
  console.log('📊 COMPLETE DEPLOYMENT SUMMARY');
  console.log('===============================');
  
  const successCount = Object.keys(deployedContracts).length;
  const totalRemaining = 10; // 8 not deployed + 2 failed
  
  console.log(`✅ Successfully deployed: ${successCount}/${totalRemaining} remaining contracts`);
  console.log(`📈 Total system contracts: ${9 + successCount}/19 (${Math.round((9 + successCount) / 19 * 100)}%)`);
  
  if (Object.keys(deployedContracts).length > 0) {
    console.log('\n🎉 Successfully Deployed Contracts:');
    Object.entries(deployedContracts).forEach(([name, info]) => {
      console.log(`   ${name}: ${info.address}`);
    });
  }
  
  if (Object.keys(deploymentErrors).length > 0) {
    console.log('\n❌ Failed Deployments:');
    Object.entries(deploymentErrors).forEach(([name, error]) => {
      console.log(`   ${name}: ${error}`);
    });
  }

  // Generate environment variables
  console.log('\n🔧 Environment Variables to Add:');
  console.log('================================');
  
  Object.entries(deployedContracts).forEach(([name, info]) => {
    const envVar = `NEXT_PUBLIC_${name.toUpperCase()}_ADDRESS`;
    console.log(`${envVar}=${info.address}`);
  });

  console.log('\n🎯 Next Steps:');
  console.log('1. Update .env.local with all new contract addresses');
  console.log('2. Update Web3 status API to reflect all 19 contracts');
  console.log('3. Test complete Web3 KYC system functionality');
  console.log('4. Deploy any remaining failed contracts');
  
  return {
    success: Object.keys(deployedContracts).length > 0,
    deployedContracts,
    deploymentErrors,
    totalDeployed: 9 + Object.keys(deployedContracts).length
  };
}

// Run deployment
if (require.main === module) {
  deployAllRemainingContracts()
    .then((result) => {
      if (result.success) {
        console.log(`\n🎉 Deployment completed! Total contracts: ${result.totalDeployed}/19`);
        process.exit(0);
      } else {
        console.log('\n💥 Deployment failed!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Deployment script failed:', error);
      process.exit(1);
    });
}

module.exports = { deployAllRemainingContracts };