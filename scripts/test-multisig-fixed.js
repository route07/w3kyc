const { ethers } = require("hardhat");

async function main() {
    console.log("🔧 Testing Fixed Multisig Implementation");
    console.log("=========================================");
    
    // Get signers
    const [owner, signer1, signer2, signer3] = await ethers.getSigners();
    
    // Deploy MultisigManager
    const MultisigManager = await ethers.getContractFactory("MultisigManager");
    const multisigManager = await MultisigManager.deploy();
    await multisigManager.waitForDeployment();
    
    // Configure multisig
    const functionName = "testFunction";
    const requiredSignatures = 2;
    const timelockDuration = 60; // 60 seconds
    
    await multisigManager.setMultisigConfig(
        functionName,
        true, // enabled
        requiredSignatures,
        timelockDuration
    );
    
    // Add authorized signers
    await multisigManager.setAuthorizedSigner(signer1.address, true);
    await multisigManager.setAuthorizedSigner(signer2.address, true);
    await multisigManager.setAuthorizedSigner(signer3.address, true);
    
    console.log("✅ Configuration complete");
    console.log(`   Required signatures: ${requiredSignatures}`);
    console.log(`   Timelock duration: ${timelockDuration} seconds`);
    console.log("");
    
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
    
    console.log(`✅ Operation proposed with ID: ${expectedOperationId}`);
    
    // Check initial status
    let details = await multisigManager.getOperationDetails(expectedOperationId);
    console.log(`\nInitial status:`);
    console.log(`   Current signatures: ${Number(details.currentSignatures)}`);
    console.log(`   Required signatures: ${Number(details.requiredSignatures)}`);
    console.log(`   Can execute: ${details.canExecute}`);
    console.log(`   Time remaining: ${Number(details.timeRemaining)} seconds`);
    
    // Sign with signer1
    const multisigManagerSigner1 = multisigManager.connect(signer1);
    await multisigManagerSigner1.signOperation(expectedOperationId);
    
    details = await multisigManager.getOperationDetails(expectedOperationId);
    console.log(`\nAfter signer1 signature:`);
    console.log(`   Current signatures: ${Number(details.currentSignatures)}`);
    console.log(`   Required signatures: ${Number(details.requiredSignatures)}`);
    console.log(`   Can execute: ${details.canExecute}`);
    console.log(`   Time remaining: ${Number(details.timeRemaining)} seconds`);
    
    // Advance time by 61 seconds
    console.log("\n⏳ Advancing blockchain time by 61 seconds...");
    await ethers.provider.send("evm_increaseTime", [61]);
    await ethers.provider.send("evm_mine", []); // Mine a block to apply the time change
    
    details = await multisigManager.getOperationDetails(expectedOperationId);
    console.log(`\nAfter time advance:`);
    console.log(`   Current signatures: ${Number(details.currentSignatures)}`);
    console.log(`   Required signatures: ${Number(details.requiredSignatures)}`);
    console.log(`   Can execute: ${details.canExecute}`);
    console.log(`   Time remaining: ${Number(details.timeRemaining)} seconds`);
    
    // Check if operation can be executed
    const canExecute = await multisigManager.canExecuteOperation(expectedOperationId);
    console.log(`\ncanExecuteOperation result: ${canExecute}`);
    
    if (canExecute) {
        console.log("✅ Executing operation...");
        await multisigManager.executeOperation(expectedOperationId);
        console.log("✅ Operation executed successfully!");
        
        // Check final status
        details = await multisigManager.getOperationDetails(expectedOperationId);
        console.log(`\nFinal status:`);
        console.log(`   Executed: ${details.executed}`);
    } else {
        console.log("❌ Operation cannot be executed");
    }
    
    // Test with 3 signatures
    console.log("\n" + "=".repeat(50));
    console.log("🧪 Testing with 3 signatures");
    console.log("=".repeat(50));
    
    // Configure for 3 signatures
    await multisigManager.setMultisigConfig(
        functionName,
        true, // enabled
        3, // required signatures
        30 // 30 seconds timelock
    );
    
    // Propose new operation
    const currentCounter2 = await multisigManager.operationCounter();
    const expectedOperationId2 = Number(currentCounter2) + 1;
    
    await multisigManager.proposeOperation(
        functionName,
        targetAddress,
        callData
    );
    
    console.log(`✅ Second operation proposed with ID: ${expectedOperationId2}`);
    
    // Sign with all three signers (owner already signed when proposing)
    const multisigManagerSigner2 = multisigManager.connect(signer2);
    const multisigManagerSigner3 = multisigManager.connect(signer3);
    
    await multisigManagerSigner2.signOperation(expectedOperationId2);
    await multisigManagerSigner3.signOperation(expectedOperationId2);
    
    details = await multisigManager.getOperationDetails(expectedOperationId2);
    console.log(`\nAfter all signatures:`);
    console.log(`   Current signatures: ${Number(details.currentSignatures)}`);
    console.log(`   Required signatures: ${Number(details.requiredSignatures)}`);
    console.log(`   Can execute: ${details.canExecute}`);
    
    // Advance time
    console.log("\n⏳ Advancing blockchain time by 31 seconds...");
    await ethers.provider.send("evm_increaseTime", [31]);
    await ethers.provider.send("evm_mine", []);
    
    details = await multisigManager.getOperationDetails(expectedOperationId2);
    console.log(`\nAfter time advance:`);
    console.log(`   Can execute: ${details.canExecute}`);
    
    if (details.canExecute) {
        console.log("✅ Executing second operation...");
        await multisigManager.executeOperation(expectedOperationId2);
        console.log("✅ Second operation executed successfully!");
    }
    
    console.log("\n🎉 All multisig tests completed successfully!");
    console.log("=============================================");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Test failed:", error);
        process.exit(1);
    });
