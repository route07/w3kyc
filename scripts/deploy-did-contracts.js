const { ethers } = require('ethers');
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
    // 1. Deploy DIDCredentialStorage (no constructor parameters)
    console.log('📦 Deploying DIDCredentialStorage...');
    try {
      const DIDCredentialStorageFactory = new ethers.ContractFactory(
        [
          "constructor()",
          "function storeCredential(bytes32 indexed credentialId, address issuer, address subject, string memory credentialType, string memory credentialData, uint256 issuedAt, uint256 expiresAt) external",
          "function getCredential(bytes32 credentialId) external view returns (address, address, string memory, string memory, uint256, uint256, bool)",
          "function revokeCredential(bytes32 credentialId) external",
          "function isCredentialValid(bytes32 credentialId) external view returns (bool)",
          "function getCredentialsBySubject(address subject) external view returns (bytes32[])",
          "function getCredentialsByIssuer(address issuer) external view returns (bytes32[])",
          "function owner() external view returns (address)",
          "function authorizedWriters(address) external view returns (bool)",
          "function authorizedIssuers(address) external view returns (bool)"
        ],
        "contracts/storage/DIDCredentialStorage.sol",
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

    // 2. Deploy DIDManager (requires DIDCredentialStorage and AuditLogStorage addresses)
    if (deployedContracts.DIDCredentialStorage) {
      console.log('📦 Deploying DIDManager...');
      try {
        const auditLogStorageAddress = process.env.NEXT_PUBLIC_AUDITLOGSTORAGE_ADDRESS;
        
        if (!auditLogStorageAddress || auditLogStorageAddress === '0x0000000000000000000000000000000000000000') {
          throw new Error('AuditLogStorage address not found in environment variables');
        }

        const DIDManagerFactory = new ethers.ContractFactory(
          [
            "constructor(address _didCredentialStorage, address _auditLogStorage)",
            "function createDID(address subject, string memory didDocument) external returns (bytes32)",
            "function updateDID(bytes32 didId, string memory didDocument) external",
            "function revokeDID(bytes32 didId) external",
            "function getDID(bytes32 didId) external view returns (string memory, bool)",
            "function getDIDsBySubject(address subject) external view returns (bytes32[])",
            "function issueCredential(bytes32 didId, string memory credentialType, string memory credentialData, uint256 expiresAt) external returns (bytes32)",
            "function verifyCredential(bytes32 credentialId) external view returns (bool)",
            "function revokeCredential(bytes32 credentialId) external"
          ],
          "contracts/business/DIDManager.sol",
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