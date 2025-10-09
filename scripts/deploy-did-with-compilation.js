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

// DIDCredentialStorage contract source
const DIDCredentialStorageSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DIDCredentialStorage {
    address public owner;
    
    struct Credential {
        address issuer;
        address subject;
        string credentialType;
        string credentialData;
        uint256 issuedAt;
        uint256 expiresAt;
        bool revoked;
    }
    
    mapping(bytes32 => Credential) public credentials;
    mapping(bytes32 => bool) public credentialExists;
    mapping(address => bytes32[]) public subjectCredentials;
    mapping(address => bytes32[]) public issuerCredentials;
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    function storeCredential(
        bytes32 credentialId,
        address issuer,
        address subject,
        string memory credentialType,
        string memory credentialData_,
        uint256 issuedAt_,
        uint256 expiresAt_
    ) external onlyOwner {
        require(!credentialExists[credentialId], "Credential already exists");
        
        credentials[credentialId] = Credential({
            issuer: issuer,
            subject: subject,
            credentialType: credentialType,
            credentialData: credentialData_,
            issuedAt: issuedAt_,
            expiresAt: expiresAt_,
            revoked: false
        });
        
        credentialExists[credentialId] = true;
        subjectCredentials[subject].push(credentialId);
        issuerCredentials[issuer].push(credentialId);
    }
    
    function getCredential(bytes32 credentialId) external view returns (
        address,
        address,
        string memory,
        string memory,
        uint256,
        uint256,
        bool
    ) {
        require(credentialExists[credentialId], "Credential does not exist");
        Credential memory cred = credentials[credentialId];
        return (
            cred.issuer,
            cred.subject,
            cred.credentialType,
            cred.credentialData,
            cred.issuedAt,
            cred.expiresAt,
            cred.revoked
        );
    }
    
    function revokeCredential(bytes32 credentialId) external onlyOwner {
        require(credentialExists[credentialId], "Credential does not exist");
        credentials[credentialId].revoked = true;
    }
    
    function isCredentialValid(bytes32 credentialId) external view returns (bool) {
        if (!credentialExists[credentialId]) return false;
        Credential memory cred = credentials[credentialId];
        if (cred.revoked) return false;
        if (cred.expiresAt > 0 && block.timestamp > cred.expiresAt) return false;
        return true;
    }
    
    function getCredentialsBySubject(address subject) external view returns (bytes32[] memory) {
        return subjectCredentials[subject];
    }
    
    function getCredentialsByIssuer(address issuer) external view returns (bytes32[] memory) {
        return issuerCredentials[issuer];
    }
}
`;

// DIDManager contract source
const DIDManagerSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IDIDCredentialStorage {
    function storeCredential(bytes32 credentialId, address issuer, address subject, string memory credentialType, string memory credentialData, uint256 issuedAt, uint256 expiresAt) external;
    function getCredential(bytes32 credentialId) external view returns (address, address, string memory, string memory, uint256, uint256, bool);
    function revokeCredential(bytes32 credentialId) external;
    function isCredentialValid(bytes32 credentialId) external view returns (bool);
}

interface IAuditLogStorage {
    function logEvent(address user, string memory eventType, string memory details) external;
}

contract DIDManager {
    address public owner;
    IDIDCredentialStorage public didCredentialStorage;
    IAuditLogStorage public auditLogStorage;
    
    struct DID {
        string didDocument;
        bool active;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    mapping(bytes32 => DID) public dids;
    mapping(address => bytes32[]) public subjectDIDs;
    mapping(bytes32 => bool) public didExists;
    
    constructor(address _didCredentialStorage, address _auditLogStorage) {
        require(_didCredentialStorage != address(0), "Invalid DID credential storage address");
        require(_auditLogStorage != address(0), "Invalid audit log storage address");
        
        owner = msg.sender;
        didCredentialStorage = IDIDCredentialStorage(_didCredentialStorage);
        auditLogStorage = IAuditLogStorage(_auditLogStorage);
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    function createDID(address subject, string memory didDocument) external onlyOwner returns (bytes32) {
        bytes32 didId = keccak256(abi.encodePacked(subject, block.timestamp, block.number));
        
        require(!didExists[didId], "DID already exists");
        
        dids[didId] = DID({
            didDocument: didDocument,
            active: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        didExists[didId] = true;
        subjectDIDs[subject].push(didId);
        
        // Log the event
        auditLogStorage.logEvent(subject, "DID_CREATED", string(abi.encodePacked("DID created: ", didId)));
        
        return didId;
    }
    
    function updateDID(bytes32 didId, string memory didDocument) external onlyOwner {
        require(didExists[didId], "DID does not exist");
        require(dids[didId].active, "DID is not active");
        
        dids[didId].didDocument = didDocument;
        dids[didId].updatedAt = block.timestamp;
        
        // Log the event
        auditLogStorage.logEvent(msg.sender, "DID_UPDATED", string(abi.encodePacked("DID updated: ", didId)));
    }
    
    function revokeDID(bytes32 didId) external onlyOwner {
        require(didExists[didId], "DID does not exist");
        require(dids[didId].active, "DID is already inactive");
        
        dids[didId].active = false;
        dids[didId].updatedAt = block.timestamp;
        
        // Log the event
        auditLogStorage.logEvent(msg.sender, "DID_REVOKED", string(abi.encodePacked("DID revoked: ", didId)));
    }
    
    function getDID(bytes32 didId) external view returns (string memory, bool) {
        require(didExists[didId], "DID does not exist");
        DID memory did = dids[didId];
        return (did.didDocument, did.active);
    }
    
    function getDIDsBySubject(address subject) external view returns (bytes32[] memory) {
        return subjectDIDs[subject];
    }
    
    function issueCredential(bytes32 didId, string memory credentialType, string memory credentialData, uint256 expiresAt) external onlyOwner returns (bytes32) {
        require(didExists[didId], "DID does not exist");
        require(dids[didId].active, "DID is not active");
        
        bytes32 credentialId = keccak256(abi.encodePacked(didId, credentialType, block.timestamp));
        
        didCredentialStorage.storeCredential(
            credentialId,
            msg.sender,
            msg.sender, // For simplicity, using msg.sender as subject
            credentialType,
            credentialData,
            block.timestamp,
            expiresAt
        );
        
        // Log the event
        auditLogStorage.logEvent(msg.sender, "CREDENTIAL_ISSUED", string(abi.encodePacked("Credential issued: ", credentialId)));
        
        return credentialId;
    }
    
    function verifyCredential(bytes32 credentialId) external view returns (bool) {
        return didCredentialStorage.isCredentialValid(credentialId);
    }
    
    function revokeCredential(bytes32 credentialId) external onlyOwner {
        didCredentialStorage.revokeCredential(credentialId);
        
        // Log the event
        auditLogStorage.logEvent(msg.sender, "CREDENTIAL_REVOKED", string(abi.encodePacked("Credential revoked: ", credentialId)));
    }
}
`;

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
    console.error('Compilation errors:', output.errors);
    throw new Error('Contract compilation failed');
  }

  const contract = output.contracts[contractName][contractName];
  return {
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object
  };
}

async function deployDIDContracts() {
  console.log('🚀 Starting DID Contracts Deployment to Tractsafe Network...\n');

  // Create provider and signer
  const provider = new ethers.JsonRpcProvider(TRACTSAFE_CONFIG.url);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log('📡 Connected to Tractsafe network');
  console.log('👤 Deployer address:', wallet.address);
  console.log('💰 Balance:', ethers.formatEther(await provider.getBalance(wallet.address)), 'ETH\n');

  const deployedContracts = {};
  const deploymentErrors = {};

  try {
    // 1. Compile and Deploy DIDCredentialStorage
    console.log('📦 Compiling DIDCredentialStorage...');
    try {
      const didCredentialStorageCompiled = compileContract(DIDCredentialStorageSource, 'DIDCredentialStorage');
      console.log('✅ DIDCredentialStorage compiled successfully');
      
      console.log('📦 Deploying DIDCredentialStorage...');
      const DIDCredentialStorageFactory = new ethers.ContractFactory(
        didCredentialStorageCompiled.abi,
        didCredentialStorageCompiled.bytecode,
        wallet
      );

      const didCredentialStorage = await DIDCredentialStorageFactory.deploy({
        gasLimit: 2000000,
        gasPrice: ethers.parseUnits("1", "gwei")
      });
      
      await didCredentialStorage.waitForDeployment();
      const didCredentialStorageAddress = await didCredentialStorage.getAddress();
      
      deployedContracts.DIDCredentialStorage = {
        address: didCredentialStorageAddress,
        transactionHash: didCredentialStorage.deploymentTransaction().hash
      };
      
      console.log('✅ DIDCredentialStorage deployed at:', didCredentialStorageAddress);
      
      // Test basic functionality
      const owner = await didCredentialStorage.owner();
      console.log('   Owner:', owner);
      console.log('   Gas used: ~2,000,000\n');
      
    } catch (error) {
      console.error('❌ DIDCredentialStorage deployment failed:', error.message);
      deploymentErrors.DIDCredentialStorage = error.message;
    }

    // 2. Compile and Deploy DIDManager
    if (deployedContracts.DIDCredentialStorage) {
      console.log('📦 Compiling DIDManager...');
      try {
        const auditLogStorageAddress = process.env.NEXT_PUBLIC_AUDITLOGSTORAGE_ADDRESS;
        
        if (!auditLogStorageAddress || auditLogStorageAddress === '0x0000000000000000000000000000000000000000') {
          throw new Error('AuditLogStorage address not found in environment variables');
        }

        const didManagerCompiled = compileContract(DIDManagerSource, 'DIDManager');
        console.log('✅ DIDManager compiled successfully');
        
        console.log('📦 Deploying DIDManager...');
        const DIDManagerFactory = new ethers.ContractFactory(
          didManagerCompiled.abi,
          didManagerCompiled.bytecode,
          wallet
        );

        const didManager = await DIDManagerFactory.deploy(
          deployedContracts.DIDCredentialStorage.address,
          auditLogStorageAddress,
          {
            gasLimit: 3000000,
            gasPrice: ethers.parseUnits("1", "gwei")
          }
        );
        
        await didManager.waitForDeployment();
        const didManagerAddress = await didManager.getAddress();
        
        deployedContracts.DIDManager = {
          address: didManagerAddress,
          transactionHash: didManager.deploymentTransaction().hash
        };
        
        console.log('✅ DIDManager deployed at:', didManagerAddress);
        console.log('   DIDCredentialStorage:', deployedContracts.DIDCredentialStorage.address);
        console.log('   AuditLogStorage:', auditLogStorageAddress);
        console.log('   Gas used: ~3,000,000\n');
        
      } catch (error) {
        console.error('❌ DIDManager deployment failed:', error.message);
        deploymentErrors.DIDManager = error.message;
      }
    } else {
      console.log('⏭️  Skipping DIDManager deployment (DIDCredentialStorage not deployed)\n');
    }

  } catch (error) {
    console.error('💥 Deployment process failed:', error.message);
  }

  // Summary
  console.log('📊 DEPLOYMENT SUMMARY');
  console.log('====================');
  
  const successCount = Object.keys(deployedContracts).length;
  const totalCount = 2;
  
  console.log(`✅ Successfully deployed: ${successCount}/${totalCount} contracts`);
  
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
  
  if (deployedContracts.DIDCredentialStorage) {
    console.log(`NEXT_PUBLIC_DIDCREDENTIALSTORAGE_ADDRESS=${deployedContracts.DIDCredentialStorage.address}`);
  }
  
  if (deployedContracts.DIDManager) {
    console.log(`NEXT_PUBLIC_DIDMANAGER_ADDRESS=${deployedContracts.DIDManager.address}`);
  }

  console.log('\n🎯 Next Steps:');
  console.log('1. Update .env.local with the new contract addresses');
  console.log('2. Test the deployed contracts');
  console.log('3. Update the Web3 status API');
  
  return {
    success: Object.keys(deployedContracts).length > 0,
    deployedContracts,
    deploymentErrors
  };
}

// Run deployment
if (require.main === module) {
  deployDIDContracts()
    .then((result) => {
      if (result.success) {
        console.log('\n🎉 DID contracts deployment completed!');
        process.exit(0);
      } else {
        console.log('\n💥 DID contracts deployment failed!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Deployment script failed:', error);
      process.exit(1);
    });
}

module.exports = { deployDIDContracts };