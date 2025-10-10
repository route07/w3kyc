const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Very simple test contract
const TEST_CONTRACT_SOURCE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TestOrchestrator {
    address public owner;
    address public kycStorage;
    address public auditStorage;
    
    event SessionStarted(address indexed user, uint256 timestamp);
    event StepCompleted(address indexed user, uint256 step, uint256 timestamp);
    
    constructor(address _kycStorage, address _auditStorage) {
        owner = msg.sender;
        kycStorage = _kycStorage;
        auditStorage = _auditStorage;
    }
    
    function startSession(address user) external {
        emit SessionStarted(user, block.timestamp);
    }
    
    function completeStep(address user, uint256 step) external {
        emit StepCompleted(user, step, block.timestamp);
    }
    
    function getOwner() external view returns (address) {
        return owner;
    }
}
`;

// Deploy test contract
async function deployTestContract() {
    try {
        console.log('🚀 Starting TestOrchestrator deployment...');
        
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
                'TestOrchestrator.sol': {
                    content: TEST_CONTRACT_SOURCE
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
        
        console.log('Compilation output keys:', Object.keys(output));
        if (output.contracts) {
            console.log('Contracts keys:', Object.keys(output.contracts));
        }
        
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
        
        console.log('Contract file contents:', Object.keys(output.contracts['TestOrchestrator.sol']));
        
        const contract = output.contracts['TestOrchestrator.sol']['TestOrchestrator'];
        
        if (!contract) {
            console.error('Contract not found in output');
            console.error('Available contracts:', Object.keys(output.contracts['TestOrchestrator.sol']));
            throw new Error('Contract not found in compilation output');
        }
        
        console.log('Contract object keys:', Object.keys(contract));
        console.log('EVM object keys:', Object.keys(contract.evm));
        
        const bytecode = contract.evm.bytecode.object;
        const abi = contract.abi;
        
        console.log('Bytecode length:', bytecode ? bytecode.length : 'undefined');
        console.log('ABI length:', abi ? abi.length : 'undefined');
        
        if (!bytecode || !abi) {
            console.error('Contract found but missing bytecode or ABI');
            throw new Error('Contract compilation failed - missing bytecode or ABI');
        }
        
        console.log('✅ Contract compiled successfully');
        
        // Prepare constructor arguments
        const constructorArgs = [
            process.env.NEXT_PUBLIC_KYCDATASTORAGE_ADDRESS,
            process.env.NEXT_PUBLIC_AUDITLOGSTORAGE_ADDRESS
        ];
        
        console.log('🔧 Constructor arguments prepared');
        
        // Deploy contract
        console.log('🚀 Deploying contract...');
        const factory = new ethers.ContractFactory(abi, bytecode, signer);
        
        const deploymentTx = await factory.deploy(...constructorArgs, {
            gasLimit: 1000000,
            gasPrice: ethers.parseUnits('20', 'gwei')
        });
        
        console.log('⏳ Deployment transaction sent:', deploymentTx.deploymentTransaction().hash);
        console.log('⏳ Waiting for confirmation...');
        
        const deployedContract = await deploymentTx.waitForDeployment();
        const contractAddress = await deployedContract.getAddress();
        
        console.log('✅ TestOrchestrator deployed successfully!');
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
        const testContract = new ethers.Contract(contractAddress, abi, signer);
        
        // Test owner
        const owner = await testContract.getOwner();
        console.log('👤 Contract owner:', owner);
        
        console.log('✅ Basic functionality test passed');
        
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

// Main execution
async function main() {
    try {
        await deployTestContract();
    } catch (error) {
        console.error('❌ Script failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { deployTestContract };