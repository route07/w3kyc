const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Very Simple Orchestrator Contract Source
const SIMPLE_ORCHESTRATOR_V2_SOURCE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SimpleKYCOnboardingOrchestratorV2
 * @dev Very simple orchestrator for KYC onboarding process
 * @author W3KYC Team
 */
contract SimpleKYCOnboardingOrchestratorV2 {
    
    // ============ ENUMS ============
    
    enum OnboardingStep {
        NOT_STARTED,
        REGISTRATION,
        INVESTOR_TYPE_SELECTION,
        ELIGIBILITY_CHECK,
        DOCUMENT_UPLOAD,
        FINAL_VERIFICATION,
        COMPLETED,
        FAILED
    }
    
    // ============ STRUCTS ============
    
    struct OnboardingSession {
        address user;
        OnboardingStep currentStep;
        uint256 startTime;
        uint256 lastUpdate;
        bool isActive;
        mapping(OnboardingStep => bool) stepCompleted;
    }
    
    // ============ STATE VARIABLES ============
    
    // Contract references
    address public kycStorage;
    address public auditStorage;
    address public kycManager;
    address public didManager;
    
    // Session management
    mapping(address => OnboardingSession) public sessions;
    mapping(address => bool) public hasActiveSession;
    
    // Configuration
    address public owner;
    
    // ============ EVENTS ============
    
    event SessionStarted(address indexed user, uint256 timestamp);
    event StepCompleted(address indexed user, OnboardingStep step, uint256 timestamp);
    event SessionCompleted(address indexed user, uint256 timestamp);
    event SessionFailed(address indexed user, string reason, uint256 timestamp);
    
    // ============ MODIFIERS ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyActiveSession() {
        require(hasActiveSession[msg.sender], "No active session");
        require(sessions[msg.sender].isActive, "Session not active");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _kycStorage,
        address _auditStorage,
        address _kycManager,
        address _didManager
    ) {
        owner = msg.sender;
        kycStorage = _kycStorage;
        auditStorage = _auditStorage;
        kycManager = _kycManager;
        didManager = _didManager;
    }
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @dev Start a new KYC onboarding session
     */
    function startSession() external {
        require(!hasActiveSession[msg.sender], "Session already active");
        
        // Create new session
        OnboardingSession storage session = sessions[msg.sender];
        session.user = msg.sender;
        session.currentStep = OnboardingStep.REGISTRATION;
        session.startTime = block.timestamp;
        session.lastUpdate = block.timestamp;
        session.isActive = true;
        
        hasActiveSession[msg.sender] = true;
        
        emit SessionStarted(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Execute a specific onboarding step
     * @param step The step to execute
     */
    function executeStep(OnboardingStep step) external onlyActiveSession {
        OnboardingSession storage session = sessions[msg.sender];
        
        require(session.currentStep == step, "Invalid step sequence");
        require(!session.stepCompleted[step], "Step already completed");
        
        // Mark step as completed
        session.stepCompleted[step] = true;
        session.lastUpdate = block.timestamp;
        
        // Determine next step
        OnboardingStep nextStep = _determineNextStep(session);
        session.currentStep = nextStep;
        
        emit StepCompleted(msg.sender, step, block.timestamp);
        
        // Check if onboarding is complete
        if (nextStep == OnboardingStep.COMPLETED) {
            _completeOnboarding(session);
        }
    }
    
    /**
     * @dev Cancel the current session
     */
    function cancelSession() external {
        require(hasActiveSession[msg.sender], "No active session");
        
        OnboardingSession storage session = sessions[msg.sender];
        session.isActive = false;
        hasActiveSession[msg.sender] = false;
        
        emit SessionFailed(msg.sender, "User cancelled", block.timestamp);
    }
    
    // ============ HELPER FUNCTIONS ============
    
    function _determineNextStep(OnboardingSession storage session) internal view returns (OnboardingStep) {
        if (session.currentStep == OnboardingStep.REGISTRATION) {
            return OnboardingStep.INVESTOR_TYPE_SELECTION;
        } else if (session.currentStep == OnboardingStep.INVESTOR_TYPE_SELECTION) {
            return OnboardingStep.ELIGIBILITY_CHECK;
        } else if (session.currentStep == OnboardingStep.ELIGIBILITY_CHECK) {
            return OnboardingStep.DOCUMENT_UPLOAD;
        } else if (session.currentStep == OnboardingStep.DOCUMENT_UPLOAD) {
            return OnboardingStep.FINAL_VERIFICATION;
        } else if (session.currentStep == OnboardingStep.FINAL_VERIFICATION) {
            return OnboardingStep.COMPLETED;
        }
        
        return OnboardingStep.FAILED;
    }
    
    function _completeOnboarding(OnboardingSession storage session) internal {
        session.currentStep = OnboardingStep.COMPLETED;
        session.isActive = false;
        hasActiveSession[session.user] = false;
        
        emit SessionCompleted(session.user, block.timestamp);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getSession(address user) external view returns (
        address sessionUser,
        OnboardingStep currentStep,
        uint256 startTime,
        uint256 lastUpdate,
        bool isActive
    ) {
        OnboardingSession storage session = sessions[user];
        return (
            session.user,
            session.currentStep,
            session.startTime,
            session.lastUpdate,
            session.isActive
        );
    }
    
    function isStepCompleted(address user, OnboardingStep step) external view returns (bool) {
        return sessions[user].stepCompleted[step];
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function forceCompleteSession(address user) external onlyOwner {
        require(hasActiveSession[user], "No active session");
        
        OnboardingSession storage session = sessions[user];
        session.currentStep = OnboardingStep.COMPLETED;
        session.isActive = false;
        hasActiveSession[user] = false;
        
        emit SessionCompleted(user, block.timestamp);
    }
    
    function forceFailSession(address user, string memory reason) external onlyOwner {
        require(hasActiveSession[user], "No active session");
        
        OnboardingSession storage session = sessions[user];
        session.currentStep = OnboardingStep.FAILED;
        session.isActive = false;
        hasActiveSession[user] = false;
        
        emit SessionFailed(user, reason, block.timestamp);
    }
}
`;

// Deploy simple orchestrator v2 contract
async function deploySimpleOrchestratorV2() {
    try {
        console.log('🚀 Starting SimpleKYCOnboardingOrchestratorV2 deployment...');
        
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
        
        console.log('📄 Contract source loaded');
        
        // Compile contract
        const solc = require('solc');
        const input = {
            language: 'Solidity',
            sources: {
                'SimpleKYCOnboardingOrchestratorV2.sol': {
                    content: SIMPLE_ORCHESTRATOR_V2_SOURCE
                }
            },
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                },
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
            output.errors.forEach(error => {
                console.error('Error:', error);
                if (error.formattedMessage) {
                    console.error('Formatted:', error.formattedMessage);
                }
            });
            throw new Error('Contract compilation failed');
        }
        
        const contract = output.contracts['SimpleKYCOnboardingOrchestratorV2.sol']['SimpleKYCOnboardingOrchestratorV2'];
        
        if (!contract) {
            console.error('Contract not found in output');
            throw new Error('Contract not found in compilation output');
        }
        
        const bytecode = contract.evm.bytecode.object;
        const abi = contract.abi;
        
        if (!bytecode || !abi) {
            console.error('Contract found but missing bytecode or ABI');
            throw new Error('Contract compilation failed - missing bytecode or ABI');
        }
        
        console.log('✅ Contract compiled successfully');
        
        // Prepare constructor arguments (only 4 contracts)
        const constructorArgs = [
            process.env.NEXT_PUBLIC_KYCDATASTORAGE_ADDRESS,
            process.env.NEXT_PUBLIC_AUDITLOGSTORAGE_ADDRESS,
            process.env.NEXT_PUBLIC_KYCMANAGER_ADDRESS,
            process.env.NEXT_PUBLIC_DIDMANAGER_ADDRESS
        ];
        
        console.log('🔧 Constructor arguments prepared');
        
        // Deploy contract
        console.log('🚀 Deploying contract...');
        const factory = new ethers.ContractFactory(abi, bytecode, signer);
        
        const deploymentTx = await factory.deploy(...constructorArgs, {
            gasLimit: 1000000, // Very low gas limit
            gasPrice: ethers.parseUnits('20', 'gwei')
        });
        
        console.log('⏳ Deployment transaction sent:', deploymentTx.deploymentTransaction().hash);
        console.log('⏳ Waiting for confirmation...');
        
        const deployedContract = await deploymentTx.waitForDeployment();
        const contractAddress = await deployedContract.getAddress();
        
        console.log('✅ SimpleKYCOnboardingOrchestratorV2 deployed successfully!');
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
        const orchestrator = new ethers.Contract(contractAddress, abi, signer);
        
        // Test owner
        const owner = await orchestrator.owner();
        console.log('👤 Contract owner:', owner);
        
        // Test KYC storage reference
        const kycStorage = await orchestrator.kycStorage();
        console.log('💾 KYC Storage:', kycStorage);
        
        console.log('✅ Basic functionality test passed');
        
        // Save contract info
        const contractInfo = {
            address: contractAddress,
            abi: abi,
            bytecode: bytecode,
            deploymentTx: deploymentTx.deploymentTransaction().hash,
            deployer: signer.address,
            network: process.env.NEXT_PUBLIC_NETWORK_NAME,
            timestamp: new Date().toISOString(),
            constructorArgs: constructorArgs
        };
        
        const outputPath = path.join(__dirname, '../deployments/simple-orchestrator-v2.json');
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, JSON.stringify(contractInfo, null, 2));
        
        console.log('💾 Contract info saved to:', outputPath);
        
        // Update .env.local
        console.log('📝 Updating .env.local...');
        updateEnvFile(contractAddress);
        
        console.log('🎉 SimpleKYCOnboardingOrchestratorV2 deployment completed successfully!');
        console.log('');
        console.log('📋 Summary:');
        console.log('  Contract Address:', contractAddress);
        console.log('  Network:', process.env.NEXT_PUBLIC_NETWORK_NAME);
        console.log('  Deployer:', signer.address);
        console.log('  Gas Used: ~1,000,000');
        console.log('');
        console.log('🔗 Next steps:');
        console.log('  1. Update frontend to use orchestrator contract');
        console.log('  2. Test orchestrator functionality');
        console.log('  3. Integrate with KYC onboarding flow');
        
        return {
            address: contractAddress,
            abi: abi,
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
        await deploySimpleOrchestratorV2();
    } catch (error) {
        console.error('❌ Script failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { deploySimpleOrchestratorV2 };