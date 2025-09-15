const { ethers } = require("hardhat");

async function main() {
    console.log("🔧 Debugging Timelock Issue");
    console.log("============================");
    
    // Get signers
    const [owner, signer1] = await ethers.getSigners();
    
    // Deploy MultisigManager
    const MultisigManager = await ethers.getContractFactory("MultisigManager");
    const multisigManager = await MultisigManager.deploy();
    await multisigManager.waitForDeployment();
    
    // Configure multisig with very short timelock
    const functionName = "testFunction";
    const requiredSignatures = 1;
    const timelockDuration = 2; // 2 seconds
    
    await multisigManager.setMultisigConfig(
        functionName,
        true, // enabled
        requiredSignatures,
        timelockDuration
    );
    
    // Add authorized signer
    await multisigManager.setAuthorizedSigner(signer1.address, true);
    
    // Propose operation
    const targetAddress = signer1.address;
    const callData = "0x12345678";
    
    const currentCounter = await multisigManager.operationCounter();
    const expectedOperationId = Number(currentCounter) + 1;
    
    const tx = await multisigManager.proposeOperation(
        functionName,
        targetAddress,
        callData
    );
    
    const receipt = await tx.wait();
    const blockNumber = receipt.blockNumber;
    const block = await ethers.provider.getBlock(blockNumber);
    const proposalTime = block.timestamp;
    
    console.log(`Operation ID: ${expectedOperationId}`);
    console.log(`Proposal time: ${proposalTime}`);
    console.log(`Timelock duration: ${timelockDuration} seconds`);
    
    // Check initial status
    let details = await multisigManager.getOperationDetails(expectedOperationId);
    console.log(`\nInitial status:`);
    console.log(`  Timelock expiry: ${Number(details.timelockExpiry)}`);
    console.log(`  Current time: ${proposalTime}`);
    console.log(`  Time remaining: ${Number(details.timeRemaining)} seconds`);
    console.log(`  Can execute: ${details.canExecute}`);
    console.log(`  Current signatures: ${Number(details.currentSignatures)}`);
    console.log(`  Required signatures: ${Number(details.requiredSignatures)}`);
    
    // Wait a bit and check again
    console.log("\n⏳ Waiting 3 seconds...");
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const currentBlock = await ethers.provider.getBlock('latest');
    const currentTime = currentBlock.timestamp;
    
    details = await multisigManager.getOperationDetails(expectedOperationId);
    console.log(`\nAfter wait:`);
    console.log(`  Timelock expiry: ${Number(details.timelockExpiry)}`);
    console.log(`  Current time: ${currentTime}`);
    console.log(`  Time remaining: ${Number(details.timeRemaining)} seconds`);
    console.log(`  Can execute: ${details.canExecute}`);
    console.log(`  Current signatures: ${Number(details.currentSignatures)}`);
    console.log(`  Required signatures: ${Number(details.requiredSignatures)}`);
    
    // Check if timelock should be expired
    const shouldBeExpired = currentTime >= Number(details.timelockExpiry);
    console.log(`\nTimelock should be expired: ${shouldBeExpired}`);
    console.log(`Time difference: ${currentTime - Number(details.timelockExpiry)} seconds`);
    
    // Try to execute
    const canExecute = await multisigManager.canExecuteOperation(expectedOperationId);
    console.log(`canExecuteOperation result: ${canExecute}`);
    
    if (canExecute) {
        console.log("✅ Executing operation...");
        await multisigManager.executeOperation(expectedOperationId);
        console.log("✅ Operation executed successfully!");
    } else {
        console.log("❌ Operation cannot be executed");
        
        // Let's try to execute anyway to see the error
        try {
            await multisigManager.executeOperation(expectedOperationId);
        } catch (error) {
            console.log(`Execution error: ${error.message}`);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Debug failed:", error);
        process.exit(1);
    });
