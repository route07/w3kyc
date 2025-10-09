const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Deploying KYCManager contract...');
  
  // Get the contract factory
  const KYCManager = await ethers.getContractFactory('KYCManager');
  
  // Get deployed storage contracts from environment
  const kycDataStorageAddress = process.env.NEXT_PUBLIC_KYCDATASTORAGE_ADDRESS;
  const auditLogStorageAddress = process.env.NEXT_PUBLIC_AUDITLOGSTORAGE_ADDRESS;
  const tenantConfigStorageAddress = process.env.NEXT_PUBLIC_TENANTCONFIGSTORAGE_ADDRESS;
  
  if (!kycDataStorageAddress || !auditLogStorageAddress || !tenantConfigStorageAddress) {
    throw new Error('Missing required storage contract addresses in environment variables');
  }
  
  console.log('📋 Using storage contracts:');
  console.log('  KYCDataStorage:', kycDataStorageAddress);
  console.log('  AuditLogStorage:', auditLogStorageAddress);
  console.log('  TenantConfigStorage:', tenantConfigStorageAddress);
  
  // Deploy the contract with constructor arguments
  const kycManager = await KYCManager.deploy(
    kycDataStorageAddress,
    auditLogStorageAddress,
    tenantConfigStorageAddress,
    {
      gasLimit: 5000000,
      gasPrice: ethers.parseUnits('1', 'gwei')
    }
  );
  
  await kycManager.waitForDeployment();
  
  const address = await kycManager.getAddress();
  console.log('✅ KYCManager deployed successfully!');
  console.log('📍 Contract Address:', address);
  console.log('🔗 Transaction Hash:', kycManager.deploymentTransaction().hash);
  
  // Verify deployment
  console.log('🔍 Verifying deployment...');
  try {
    const owner = await kycManager.owner();
    const version = await kycManager.VERSION();
    const contractName = await kycManager.CONTRACT_NAME();
    
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
    const isAuthorized = await kycManager.isAuthorizedWriter(owner);
    console.log('  Owner is authorized writer:', isAuthorized);
    
    // Test KYC status for zero address (should return false)
    const kycStatus = await kycManager.getKYCStatus(ethers.ZeroAddress);
    console.log('  KYC status for zero address:', {
      isVerified: kycStatus.isVerified,
      isActive: kycStatus.isActive,
      isExpired: kycStatus.isExpired
    });
    
    console.log('✅ Basic functionality test passed');
  } catch (error) {
    console.error('❌ Basic functionality test failed:', error.message);
  }
  
  console.log('\n📝 Add this to your .env.local file:');
  console.log(`NEXT_PUBLIC_KYCMANAGER_ADDRESS=${address}`);
  
  console.log('\n🎉 KYCManager deployment completed successfully!');
  console.log('💡 You can now use this contract for on-chain KYC verification');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });