const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Minimal Orchestrator Contract Source
const MINIMAL_ORCHESTRATOR_SOURCE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MinimalKYCOnboardingOrchestrator
 * @dev Minimal orchestrator for KYC onboarding process
 * @author W3KYC Team
 */
contract MinimalKYCOnboardingOrchestrator {
    
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
        mapping(string => string) userData;
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
     * @param userData Initial user data (email, jurisdiction, etc.)
     */
    function startSession(bytes calldata userData) external {
        require(!hasActiveSession[msg.sender], "Session already active");
        
        (string memory email, string memory jurisdiction) = abi.decode(userData, (string, string));
        
        // Basic validation
        require(bytes(email).length > 0, "Email required");
        require(bytes(jurisdiction).length > 0, "Jurisdiction required");
        
        // Create new session
        OnboardingSession storage session = sessions[msg.sender];
        session.user = msg.sender;
        session.currentStep = OnboardingStep.REGISTRATION;
        session.startTime = block.timestamp;
        session.lastUpdate = block.timestamp;
        session.isActive = true;
        
        // Store initial data
        session.userData["email"] = email;
        session.userData["jurisdiction"] = jurisdiction;
        
        hasActiveSession[msg.sender] = true;
        
        // Log to audit storage
        _callContract(auditStorage, "logEvent(address,string,uint256,bytes)", 
            abi.encode(msg.sender, "SESSION_STARTED", 0, userData));
        
        emit SessionStarted(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Execute a specific onboarding step
     * @param step The step to execute
     * @param stepData Encoded data for the step
     */
    function executeStep(
        OnboardingStep step,
        bytes calldata stepData
    ) external onlyActiveSession {
        OnboardingSession storage session = sessions[msg.sender];
        
        require(session.currentStep == step, "Invalid step sequence");
        require(!session.stepCompleted[step], "Step already completed");
        
        // Execute step
        _executeStep(step, stepData);
        
        // Mark step as completed
        session.stepCompleted[step] = true;
        session.lastUpdate = block.timestamp;
        
        // Determine next step
        OnboardingStep nextStep = _determineNextStep(session);
        session.currentStep = nextStep;
        
        // Log completion
        _callContract(auditStorage, "logEvent(address,string,uint256,bytes)", 
            abi.encode(msg.sender, "STEP_COMPLETED", uint256(step), stepData));
        
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
        
        _callContract(auditStorage, "logEvent(address,string,uint256,bytes)", 
            abi.encode(msg.sender, "SESSION_CANCELLED", 0, ""));
        emit SessionFailed(msg.sender, "User cancelled", block.timestamp);
    }
    
    // ============ STEP EXECUTION FUNCTIONS ============
    
    function _executeStep(OnboardingStep step, bytes calldata stepData) internal {
        if (step == OnboardingStep.REGISTRATION) {
            _executeRegistration(stepData);
        } else if (step == OnboardingStep.INVESTOR_TYPE_SELECTION) {
            _executeInvestorTypeSelection(stepData);
        } else if (step == OnboardingStep.ELIGIBILITY_CHECK) {
            _executeEligibilityCheck(stepData);
        } else if (step == OnboardingStep.DOCUMENT_UPLOAD) {
            _executeDocumentUpload(stepData);
        } else if (step == OnboardingStep.FINAL_VERIFICATION) {
            _executeFinalVerification(stepData);
        }
    }
    
    function _executeRegistration(bytes calldata data) internal {
        (string memory email, string memory password, string memory firstName, string memory lastName) = 
            abi.decode(data, (string, string, string, string));
        
        // Basic validation
        require(bytes(email).length > 0, "Email required");
        require(bytes(password).length > 0, "Password required");
        require(bytes(firstName).length > 0, "First name required");
        require(bytes(lastName).length > 0, "Last name required");
        
        // Store in KYC storage
        _callContract(kycStorage, "storeKYCData(address,string,string)", 
            abi.encode(msg.sender, "email", email));
        _callContract(kycStorage, "storeKYCData(address,string,string)", 
            abi.encode(msg.sender, "password_hash", _hashPassword(password)));
        _callContract(kycStorage, "storeKYCData(address,string,string)", 
            abi.encode(msg.sender, "first_name", firstName));
        _callContract(kycStorage, "storeKYCData(address,string,string)", 
            abi.encode(msg.sender, "last_name", lastName));
        
        // Update KYC status
        _callContract(kycManager, "updateKYCStatus(address,string)", 
            abi.encode(msg.sender, "PENDING"));
        
        // Log audit event
        _callContract(auditStorage, "logEvent(address,string,uint256,bytes)", 
            abi.encode(msg.sender, "USER_REGISTERED", 0, data));
    }
    
    function _executeInvestorTypeSelection(bytes calldata data) internal {
        (string memory investorType) = abi.decode(data, (string));
        
        // Basic validation
        require(bytes(investorType).length > 0, "Investor type required");
        
        // Store investor type
        _callContract(kycStorage, "storeKYCData(address,string,string)", 
            abi.encode(msg.sender, "investor_type", investorType));
        
        // Log audit event
        _callContract(auditStorage, "logEvent(address,string,uint256,bytes)", 
            abi.encode(msg.sender, "INVESTOR_TYPE_SELECTED", 0, data));
    }
    
    function _executeEligibilityCheck(bytes calldata data) internal {
        (string memory country, string memory age, string memory income) = 
            abi.decode(data, (string, string, string));
        
        // Basic validation
        require(bytes(country).length > 0, "Country required");
        require(bytes(age).length > 0, "Age required");
        require(bytes(income).length > 0, "Income required");
        
        // Store eligibility data
        _callContract(kycStorage, "storeKYCData(address,string,string)", 
            abi.encode(msg.sender, "country", country));
        _callContract(kycStorage, "storeKYCData(address,string,string)", 
            abi.encode(msg.sender, "age", age));
        _callContract(kycStorage, "storeKYCData(address,string,string)", 
            abi.encode(msg.sender, "income", income));
        
        // Log audit event
        _callContract(auditStorage, "logEvent(address,string,uint256,bytes)", 
            abi.encode(msg.sender, "ELIGIBILITY_CHECKED", 0, data));
    }
    
    function _executeDocumentUpload(bytes calldata data) internal {
        (string[] memory documentHashes, string[] memory documentTypes) = 
            abi.decode(data, (string[], string[]));
        
        // Basic validation
        require(documentHashes.length > 0, "At least one document required");
        require(documentHashes.length == documentTypes.length, "Documents data mismatch");
        
        // Store documents as DID credentials
        for (uint i = 0; i < documentHashes.length; i++) {
            _callContract(didManager, "storeCredential(address,string,string,uint256)", 
                abi.encode(msg.sender, documentTypes[i], documentHashes[i], block.timestamp));
        }
        
        // Log audit event
        _callContract(auditStorage, "logEvent(address,string,uint256,bytes)", 
            abi.encode(msg.sender, "DOCUMENTS_UPLOADED", documentHashes.length, data));
    }
    
    function _executeFinalVerification(bytes calldata data) internal {
        // Create DID for user
        string memory did = _generateDID(msg.sender);
        _callContract(didManager, "createDID(address,string)", 
            abi.encode(msg.sender, did));
        
        // Update KYC status to verified
        _callContract(kycManager, "updateKYCStatus(address,string)", 
            abi.encode(msg.sender, "VERIFIED"));
        
        // Log audit event
        _callContract(auditStorage, "logEvent(address,string,uint256,bytes)", 
            abi.encode(msg.sender, "FINAL_VERIFICATION_COMPLETED", 0, data));
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
        
        // Log completion
        _callContract(auditStorage, "logEvent(address,string,uint256,bytes)", 
            abi.encode(session.user, "ONBOARDING_COMPLETED", 0, ""));
        
        emit SessionCompleted(session.user, block.timestamp);
    }
    
    function _callContract(address contractAddr, string memory signature, bytes memory data) internal {
        (bool success,) = contractAddr.call(
            abi.encodeWithSignature(signature, data)
        );
        require(success, "Contract call failed");
    }
    
    function _hashPassword(string memory password) internal pure returns (string memory) {
        return _uintToString(uint256(keccak256(abi.encodePacked(password))));
    }
    
    function _generateDID(address user) internal pure returns (string memory) {
        return string(abi.encodePacked("did:w3kyc:", _addressToString(user)));
    }
    
    function _addressToString(address addr) internal pure returns (string memory) {
        return _uintToString(uint256(uint160(addr)));
    }
    
    function _uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
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
    
    function getUserData(address user, string memory key) external view returns (string memory) {
        return sessions[user].userData[key];
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function forceCompleteSession(address user) external onlyOwner {
        require(hasActiveSession[user], "No active session");
        
        OnboardingSession storage session = sessions[user];
        session.currentStep = OnboardingStep.COMPLETED;
        session.isActive = false;
        hasActiveSession[user] = false;
        
        _callContract(auditStorage, "logEvent(address,string,uint256,bytes)", 
            abi.encode(user, "SESSION_FORCE_COMPLETED", 0, ""));
        emit SessionCompleted(user, block.timestamp);
    }
    
    function forceFailSession(address user, string memory reason) external onlyOwner {
        require(hasActiveSession[user], "No active session");
        
        OnboardingSession storage session = sessions[user];
        session.currentStep = OnboardingStep.FAILED;
        session.isActive = false;
        hasActiveSession[user] = false;
        
        _callContract(auditStorage, "logEvent(address,string,uint256,bytes)", 
            abi.encode(user, "SESSION_FORCE_FAILED", 0, abi.encode(reason)));
        emit SessionFailed(user, reason, block.timestamp);
    }
}
`;

// Deploy minimal orchestrator contract
async function deployMinimalOrchestrator() {
    try {
        console.log('🚀 Starting MinimalKYCOnboardingOrchestrator deployment...');
        
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
                'MinimalKYCOnboardingOrchestrator.sol': {
                    content: MINIMAL_ORCHESTRATOR_SOURCE
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
        
        const contract = output.contracts['MinimalKYCOnboardingOrchestrator.sol']['MinimalKYCOnboardingOrchestrator'];
        
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
            gasLimit: 2000000, // Reduced gas limit
            gasPrice: ethers.parseUnits('20', 'gwei')
        });
        
        console.log('⏳ Deployment transaction sent:', deploymentTx.deploymentTransaction().hash);
        console.log('⏳ Waiting for confirmation...');
        
        const deployedContract = await deploymentTx.waitForDeployment();
        const contractAddress = await deployedContract.getAddress();
        
        console.log('✅ MinimalKYCOnboardingOrchestrator deployed successfully!');
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
        
        const outputPath = path.join(__dirname, '../deployments/minimal-orchestrator.json');
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, JSON.stringify(contractInfo, null, 2));
        
        console.log('💾 Contract info saved to:', outputPath);
        
        // Update .env.local
        console.log('📝 Updating .env.local...');
        updateEnvFile(contractAddress);
        
        console.log('🎉 MinimalKYCOnboardingOrchestrator deployment completed successfully!');
        console.log('');
        console.log('📋 Summary:');
        console.log('  Contract Address:', contractAddress);
        console.log('  Network:', process.env.NEXT_PUBLIC_NETWORK_NAME);
        console.log('  Deployer:', signer.address);
        console.log('  Gas Used: ~2,000,000');
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
        await deployMinimalOrchestrator();
    } catch (error) {
        console.error('❌ Script failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { deployMinimalOrchestrator };