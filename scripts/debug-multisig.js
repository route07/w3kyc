const { ethers } = require("hardhat");

async function main() {
    console.log("🔧 Debugging Multisig Implementation");
    console.log("====================================");
    
    // Get signers
    const [owner, signer1, signer2] = await ethers.getSigners();
    
    // Deploy MultisigManager
    const MultisigManager = await ethers.getContractFactory("MultisigManager");
    const multisigManager = await MultisigManager.deploy();
    await multisigManager.waitForDeployment();
    
    // Configure multisig with short timelock
    const functionName = "testFunction";
    const requiredSignatures = 2;
    const timelockDuration = 5; // 5 seconds
    
    await multisigManager.setMultisigConfig(
        functionName,
        true, // enabled
        requiredSignatures,
        timelockDuration
    );
    
    // Add authorized signers
    await multisigManager.setAuthorizedSigner(signer1.address, true);
    await multisigManager.setAuthorizedSigner(signer2.address, true);
    
    // Propose operation
    const targetAddress = signer1.address;
    const callData = "0x12345678";
    
    const currentCounter = await multisigManager.operationCounter();
    const expectedOperationId = Number(currentCounter) + 1;
    
    await multisigManager.proposeOperation(
        functionName,
        targetAddress,
        callData
    );
    
    console.log(`Operation ID: ${expectedOperationId}`);
    
    // Check initial status
    let details = await multisigManager.getOperationDetails(expectedOperationId);
    console.log(`Initial status - Can execute: ${details.canExecute}`);
    console.log(`Time remaining: ${Number(details.timeRemaining)} seconds`);
    
    // Sign with signer1
    const multisigManagerSigner1 = multisigManager.connect(signer1);
    await multisigManagerSigner1.signOperation(expectedOperationId);
    
    details = await multisigManager.getOperationDetails(expectedOperationId);
    console.log(`After signer1 - Can execute: ${details.canExecute}`);
    console.log(`Current signatures: ${Number(details.currentSignatures)}`);
    console.log(`Required signatures: ${Number(details.requiredSignatures)}`);
    
    // Wait for timelock
    console.log("⏳ Waiting for timelock...");
    await new Promise(resolve => setTimeout(resolve, 6000)); // Wait 6 seconds
    
    details = await multisigManager.getOperationDetails(expectedOperationId);
    console.log(`After timelock - Can execute: ${details.canExecute}`);
    console.log(`Time remaining: ${Number(details.timeRemaining)} seconds`);
    console.log(`Current signatures: ${Number(details.currentSignatures)}`);
    console.log(`Required signatures: ${Number(details.requiredSignatures)}`);
    console.log(`Executed: ${details.executed}`);
    
    // Try to execute
    const canExecute = await multisigManager.canExecuteOperation(expectedOperationId);
    console.log(`canExecuteOperation result: ${canExecute}`);
    
    if (canExecute) {
        console.log("✅ Executing operation...");
        await multisigManager.executeOperation(expectedOperationId);
        console.log("✅ Operation executed successfully!");
    } else {
        console.log("❌ Operation cannot be executed");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Debug failed:", error);
        process.exit(1);
    });
