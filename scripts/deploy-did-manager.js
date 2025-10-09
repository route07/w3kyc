const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Deploying DIDManager contract...');
  
  // Get the contract factory
  const DIDManager = await ethers.getContractFactory('DIDManager');
  
  // Get deployed storage contracts from environment
  const didCredentialStorageAddress = process.env.NEXT_PUBLIC_DIDCREDENTIALSTORAGE_ADDRESS;
  const auditLogStorageAddress = process.env.NEXT_PUBLIC_AUDITLOGSTORAGE_ADDRESS;
  
  if (!didCredentialStorageAddress || !auditLogStorageAddress) {
    throw new Error('Missing required storage contract addresses in environment variables');
  }
  
  console.log('📋 Using storage contracts:');
  console.log('  DIDCredentialStorage:', didCredentialStorageAddress);
  console.log('  AuditLogStorage:', auditLogStorageAddress);
  
  // Deploy the contract with constructor arguments
  const didManager = await DIDManager.deploy(
    didCredentialStorageAddress,
    auditLogStorageAddress,
    {
      gasLimit: 5000000,
      gasPrice: ethers.parseUnits('1', 'gwei')
    }
  );
  
  await didManager.waitForDeployment();
  
  const address = await didManager.getAddress();
  console.log('✅ DIDManager deployed successfully!');
  console.log('📍 Contract Address:', address);
  console.log('🔗 Transaction Hash:', didManager.deploymentTransaction().hash);
  
  // Verify deployment
  console.log('🔍 Verifying deployment...');
  try {
    const owner = await didManager.owner();
    const version = await didManager.VERSION();
    const contractName = await didManager.CONTRACT_NAME();
    
    console.log('✅ Contract verification successful:');
    console.log('  Owner:', owner);
    console.log('  Version:', version.toString());
    console.log('  Contract Name:', contractName);
  } catch (error) {
    console.error('❌ Contract verification failed:', error.message);
  }
  
  // Test basic functionality
  console.log('🧪 Testing basic functionality...');
  try {
    // Test authorized writer check
    const isAuthorizedWriter = await didManager.isAuthorizedWriter(owner);
    const isAuthorizedIssuer = await didManager.isAuthorizedIssuer(owner);
    
    console.log('  Owner is authorized writer:', isAuthorizedWriter);
    console.log('  Owner is authorized issuer:', isAuthorizedIssuer);
    
    // Test credential count for empty DID
    const credentialCount = await didManager.getCredentialCount('did:example:test');
    console.log('  Credential count for test DID:', credentialCount.toString());
    
    console.log('✅ Basic functionality test passed');
  } catch (error) {
    console.error('❌ Basic functionality test failed:', error.message);
  }
  
  console.log('\n📝 Add this to your .env.local file:');
  console.log(`NEXT_PUBLIC_DIDMANAGER_ADDRESS=${address}`);
  
  console.log('\n🎉 DIDManager deployment completed successfully!');
  console.log('💡 You can now use this contract for DID credential management');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });