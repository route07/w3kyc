const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Contract addresses from .env.local
const CONTRACT_ADDRESSES = {
    KYCDataStorage: process.env.NEXT_PUBLIC_KYCDATASTORAGE_ADDRESS,
    AuditLogStorage: process.env.NEXT_PUBLIC_AUDITLOGSTORAGE_ADDRESS,
    TenantConfigStorage: process.env.NEXT_PUBLIC_TENANTCONFIGSTORAGE_ADDRESS,
    DIDCredentialStorage: process.env.NEXT_PUBLIC_DIDCREDENTIALSTORAGE_ADDRESS,
    KYCManager: process.env.NEXT_PUBLIC_KYCMANAGER_ADDRESS,
    DIDManager: process.env.NEXT_PUBLIC_DIDMANAGER_ADDRESS,
    InputValidator: process.env.NEXT_PUBLIC_INPUTVALIDATOR_ADDRESS,
    BoundsChecker: process.env.NEXT_PUBLIC_BOUNDSCHECKER_ADDRESS,
    VersionManager: process.env.NEXT_PUBLIC_VERSIONMANAGER_ADDRESS,
    JurisdictionConfig: process.env.NEXT_PUBLIC_JURISDICTIONCONFIG_ADDRESS,
    FeatureFlags: process.env.NEXT_PUBLIC_FEATUREFLAGS_ADDRESS,
    CredentialTypeManager: process.env.NEXT_PUBLIC_CREDENTIALTYPEMANAGER_ADDRESS,
    MultisigManager: process.env.NEXT_PUBLIC_MULTISIGMANAGER_ADDRESS,
    MultisigModifier: process.env.NEXT_PUBLIC_MULTISIGMODIFIER_ADDRESS,
    EmergencyManager: process.env.NEXT_PUBLIC_EMERGENCYMANAGER_ADDRESS,
    AuthorizationManager: process.env.NEXT_PUBLIC_AUTHORIZATIONMANAGER_ADDRESS,
    ComplianceChecker: process.env.NEXT_PUBLIC_COMPLIANCECHECKER_ADDRESS,
    GovernanceManager: process.env.NEXT_PUBLIC_GOVERNANCEMANAGER_ADDRESS,
    MultisigExample: process.env.NEXT_PUBLIC_MULTISIGEXAMPLE_ADDRESS
};

// Validate all addresses are present
function validateAddresses() {
    const missing = [];
    for (const [name, address] of Object.entries(CONTRACT_ADDRESSES)) {
        if (!address || address === '0x0000000000000000000000000000000000000000') {
            missing.push(name);
        }
    }
    
    if (missing.length > 0) {
        throw new Error(`Missing contract addresses: ${missing.join(', ')}`);
    }
    
    console.log('✅ All contract addresses validated');
}

// Deploy orchestrator contract
async function deployOrchestrator() {
    try {
        console.log('🚀 Starting KYCOnboardingOrchestrator deployment...');
        
        // Validate addresses
        validateAddresses();
        
        // Setup provider and signer
        const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        console.log('📡 Connected to network:', process.env.NEXT_PUBLIC_NETWORK_NAME);
        console.log('👤 Deployer address:', signer.address);
        
        // Check balance
        const balance = await provider.getBalance(signer.address);
        console.log('💰 Deployer balance:', ethers.formatEther(balance), 'ETH');
        
        if (balance < ethers.parseEther('0.01')) {
            throw new Error('Insufficient balance for deployment');
        }
        
        // Read contract source
        const contractPath = path.join(__dirname, '../contracts/orchestrator/KYCOnboardingOrchestrator.sol');
        const contractSource = fs.readFileSync(contractPath, 'utf8');
        
        console.log('📄 Contract source loaded');
        
        // Compile contract
        const solc = require('solc');
        const input = {
            language: 'Solidity',
            sources: {
                'KYCOnboardingOrchestrator.sol': {
                    content: contractSource
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
        
        console.log('🔨 Compiling contract...');
        const output = JSON.parse(solc.compile(JSON.stringify(input)));
        
        if (output.errors && output.errors.length > 0) {
            console.error('❌ Compilation errors:');
            output.errors.forEach(error => console.error(error));
            throw new Error('Contract compilation failed');
        }
        
        const contract = output.contracts['KYCOnboardingOrchestrator.sol']['KYCOnboardingOrchestrator'];
        
        if (!contract || !contract.bytecode || !contract.abi) {
            throw new Error('Contract compilation failed - missing bytecode or ABI');
        }
        
        console.log('✅ Contract compiled successfully');
        
        // Prepare constructor arguments
        const constructorArgs = [
            CONTRACT_ADDRESSES.KYCDataStorage,
            CONTRACT_ADDRESSES.AuditLogStorage,
            CONTRACT_ADDRESSES.TenantConfigStorage,
            CONTRACT_ADDRESSES.DIDCredentialStorage,
            CONTRACT_ADDRESSES.KYCManager,
            CONTRACT_ADDRESSES.DIDManager,
            CONTRACT_ADDRESSES.InputValidator,
            CONTRACT_ADDRESSES.BoundsChecker,
            CONTRACT_ADDRESSES.VersionManager,
            CONTRACT_ADDRESSES.JurisdictionConfig,
            CONTRACT_ADDRESSES.FeatureFlags,
            CONTRACT_ADDRESSES.CredentialTypeManager,
            CONTRACT_ADDRESSES.MultisigManager,
            CONTRACT_ADDRESSES.MultisigModifier,
            CONTRACT_ADDRESSES.EmergencyManager,
            CONTRACT_ADDRESSES.AuthorizationManager,
            CONTRACT_ADDRESSES.ComplianceChecker,
            CONTRACT_ADDRESSES.GovernanceManager,
            CONTRACT_ADDRESSES.MultisigExample
        ];
        
        console.log('🔧 Constructor arguments prepared');
        
        // Deploy contract
        console.log('🚀 Deploying contract...');
        const factory = new ethers.ContractFactory(contract.abi, contract.bytecode, signer);
        
        const deploymentTx = await factory.deploy(...constructorArgs, {
            gasLimit: 5000000, // Set high gas limit for complex contract
            gasPrice: ethers.parseUnits('20', 'gwei')
        });
        
        console.log('⏳ Deployment transaction sent:', deploymentTx.deploymentTransaction().hash);
        console.log('⏳ Waiting for confirmation...');
        
        const deployedContract = await deploymentTx.waitForDeployment();
        const contractAddress = await deployedContract.getAddress();
        
        console.log('✅ KYCOnboardingOrchestrator deployed successfully!');
        console.log('📍 Contract address:', contractAddress);
        console.log('🔗 Explorer URL:', `${process.env.NEXT_PUBLIC_EXPLORER_URL}/address/${contractAddress}`);
        
        // Verify deployment
        console.log('🔍 Verifying deployment...');
        const code = await provider.getCode(contractAddress);
        if (code === '0x') {
            throw new Error('Contract deployment verification failed');
        }
        console.log('✅ Contract deployment verified');
        
        // Test basic functionality
        console.log('🧪 Testing basic functionality...');
        const orchestrator = new ethers.Contract(contractAddress, contract.abi, signer);
        
        // Test owner
        const owner = await orchestrator.owner();
        console.log('👤 Contract owner:', owner);
        
        // Test emergency manager reference
        const emergencyManager = await orchestrator.emergencyManager();
        console.log('🚨 Emergency manager:', emergencyManager);
        
        console.log('✅ Basic functionality test passed');
        
        // Save contract info
        const contractInfo = {
            address: contractAddress,
            abi: contract.abi,
            bytecode: contract.bytecode,
            deploymentTx: deploymentTx.deploymentTransaction().hash,
            deployer: signer.address,
            network: process.env.NEXT_PUBLIC_NETWORK_NAME,
            timestamp: new Date().toISOString(),
            constructorArgs: constructorArgs
        };
        
        const outputPath = path.join(__dirname, '../deployments/orchestrator.json');
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, JSON.stringify(contractInfo, null, 2));
        
        console.log('💾 Contract info saved to:', outputPath);
        
        // Update .env.local
        console.log('📝 Updating .env.local...');
        updateEnvFile(contractAddress);
        
        console.log('🎉 KYCOnboardingOrchestrator deployment completed successfully!');
        console.log('');
        console.log('📋 Summary:');
        console.log('  Contract Address:', contractAddress);
        console.log('  Network:', process.env.NEXT_PUBLIC_NETWORK_NAME);
        console.log('  Deployer:', signer.address);
        console.log('  Gas Used: ~5,000,000');
        console.log('');
        console.log('🔗 Next steps:');
        console.log('  1. Update frontend to use orchestrator contract');
        console.log('  2. Test orchestrator functionality');
        console.log('  3. Integrate with KYC onboarding flow');
        
        return {
            address: contractAddress,
            abi: contract.abi,
            deploymentTx: deploymentTx.deploymentTransaction().hash
        };
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        throw error;
    }
}

// Update .env.local with orchestrator address
function updateEnvFile(contractAddress) {
    const envPath = '.env.local';
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Remove existing orchestrator address if present
    envContent = envContent.replace(/NEXT_PUBLIC_ORCHESTRATOR_ADDRESS=.*\n/g, '');
    
    // Add new orchestrator address
    envContent += `\n# Orchestrator Contract\n`;
    envContent += `NEXT_PUBLIC_ORCHESTRATOR_ADDRESS=${contractAddress}\n`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local updated with orchestrator address');
}

// Main execution
async function main() {
    try {
        await deployOrchestrator();
    } catch (error) {
        console.error('❌ Script failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { deployOrchestrator };