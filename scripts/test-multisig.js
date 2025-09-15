const { ethers } = require("hardhat");

async function main() {
    console.log("🔧 Testing Multisig Implementation");
    console.log("==================================");
    
    // Get signers
    const [owner, signer1, signer2, signer3, unauthorized] = await ethers.getSigners();
    
    console.log("📋 Test Setup:");
    console.log(`Owner: ${owner.address}`);
    console.log(`Signer 1: ${signer1.address}`);
    console.log(`Signer 2: ${signer2.address}`);
    console.log(`Signer 3: ${signer3.address}`);
    console.log(`Unauthorized: ${unauthorized.address}`);
    console.log("");
    
    // Deploy MultisigManager
    console.log("🚀 Deploying MultisigManager...");
    const MultisigManager = await ethers.getContractFactory("MultisigManager");
    const multisigManager = await MultisigManager.deploy();
    await multisigManager.waitForDeployment();
    console.log(`MultisigManager deployed to: ${await multisigManager.getAddress()}`);
    console.log("");
    
    // Test 1: Configure multisig for a function
    console.log("🧪 Test 1: Configure multisig for a function");
    console.log("---------------------------------------------");
    
    const functionName = "testFunction";
    const requiredSignatures = 3;
    const timelockDuration = 60; // 1 minute
    
    await multisigManager.setMultisigConfig(
        functionName,
        true, // enabled
        requiredSignatures,
        timelockDuration
    );
    
    console.log(`✅ Configured multisig for "${functionName}"`);
    console.log(`   Required signatures: ${requiredSignatures}`);
    console.log(`   Timelock duration: ${timelockDuration} seconds`);
    console.log("");
    
    // Test 2: Add authorized signers
    console.log("🧪 Test 2: Add authorized signers");
    console.log("----------------------------------");
    
    await multisigManager.setAuthorizedSigner(signer1.address, true);
    await multisigManager.setAuthorizedSigner(signer2.address, true);
    await multisigManager.setAuthorizedSigner(signer3.address, true);
    
    console.log("✅ Added authorized signers:");
    console.log(`   - ${signer1.address}`);
    console.log(`   - ${signer2.address}`);
    console.log(`   - ${signer3.address}`);
    console.log("");
    
    // Test 3: Verify signer authorization
    console.log("🧪 Test 3: Verify signer authorization");
    console.log("--------------------------------------");
    
    const isOwnerAuthorized = await multisigManager.isAuthorizedSigner(owner.address);
    const isSigner1Authorized = await multisigManager.isAuthorizedSigner(signer1.address);
    const isUnauthorizedAuthorized = await multisigManager.isAuthorizedSigner(unauthorized.address);
    
    console.log(`Owner authorized: ${isOwnerAuthorized}`);
    console.log(`Signer 1 authorized: ${isSigner1Authorized}`);
    console.log(`Unauthorized authorized: ${isUnauthorizedAuthorized}`);
    console.log("");
    
    // Test 4: Propose operation
    console.log("🧪 Test 4: Propose operation");
    console.log("-----------------------------");
    
    const targetAddress = signer1.address; // Mock target
    const callData = "0x12345678"; // Mock call data
    
    // Get the current operation counter to predict the operation ID
    const currentCounter = await multisigManager.operationCounter();
    const expectedOperationId = Number(currentCounter) + 1;
    
    const tx = await multisigManager.proposeOperation(
        functionName,
        targetAddress,
        callData
    );
    
    await tx.wait();
    const operationId = expectedOperationId;
    
    console.log(`✅ Operation proposed with ID: ${operationId}`);
    console.log(`   Target: ${targetAddress}`);
    console.log(`   Call data: ${callData}`);
    console.log("");
    
    // Test 5: Check operation details
    console.log("🧪 Test 5: Check operation details");
    console.log("-----------------------------------");
    
    const operationDetails = await multisigManager.getOperationDetails(operationId);
    console.log("Operation details:");
    console.log(`   Target: ${operationDetails.target}`);
    console.log(`   Required signatures: ${Number(operationDetails.requiredSignatures)}`);
    console.log(`   Current signatures: ${Number(operationDetails.currentSignatures)}`);
    console.log(`   Timelock expiry: ${new Date(Number(operationDetails.timelockExpiry) * 1000)}`);
    console.log(`   Executed: ${operationDetails.executed}`);
    console.log(`   Can execute: ${operationDetails.canExecute}`);
    console.log(`   Time remaining: ${Number(operationDetails.timeRemaining)} seconds`);
    console.log("");
    
    // Test 6: Check signature status
    console.log("🧪 Test 6: Check signature status");
    console.log("----------------------------------");
    
    const signatureStatus = await multisigManager.getSignatureStatus(operationId);
    console.log("Signature status:");
    console.log(`   Current signatures: ${Number(signatureStatus.currentSignatures)}`);
    console.log(`   Required signatures: ${Number(signatureStatus.requiredSignatures)}`);
    console.log(`   Is complete: ${signatureStatus.isComplete}`);
    console.log("");
    
    // Test 7: Sign operation with signer1
    console.log("🧪 Test 7: Sign operation with signer1");
    console.log("---------------------------------------");
    
    const multisigManagerSigner1 = multisigManager.connect(signer1);
    await multisigManagerSigner1.signOperation(operationId);
    
    const signatureStatusAfter1 = await multisigManager.getSignatureStatus(operationId);
    console.log(`✅ Signer 1 signed the operation`);
    console.log(`   Current signatures: ${Number(signatureStatusAfter1.currentSignatures)}`);
    console.log(`   Required signatures: ${Number(signatureStatusAfter1.requiredSignatures)}`);
    console.log(`   Is complete: ${signatureStatusAfter1.isComplete}`);
    console.log("");
    
    // Test 8: Sign operation with signer2
    console.log("🧪 Test 8: Sign operation with signer2");
    console.log("---------------------------------------");
    
    const multisigManagerSigner2 = multisigManager.connect(signer2);
    await multisigManagerSigner2.signOperation(operationId);
    
    const signatureStatusAfter2 = await multisigManager.getSignatureStatus(operationId);
    console.log(`✅ Signer 2 signed the operation`);
    console.log(`   Current signatures: ${Number(signatureStatusAfter2.currentSignatures)}`);
    console.log(`   Required signatures: ${Number(signatureStatusAfter2.requiredSignatures)}`);
    console.log(`   Is complete: ${signatureStatusAfter2.isComplete}`);
    console.log("");
    
    // Test 9: Check if operation can be executed (should be false due to timelock)
    console.log("🧪 Test 9: Check if operation can be executed");
    console.log("----------------------------------------------");
    
    const canExecute = await multisigManager.canExecuteOperation(operationId);
    console.log(`Can execute operation: ${canExecute}`);
    console.log("(Should be false due to timelock)");
    console.log("");
    
    // Test 10: Try to sign with unauthorized address (should fail)
    console.log("🧪 Test 10: Try to sign with unauthorized address");
    console.log("--------------------------------------------------");
    
    try {
        const multisigManagerUnauthorized = multisigManager.connect(unauthorized);
        await multisigManagerUnauthorized.signOperation(operationId);
        console.log("❌ ERROR: Unauthorized signer was able to sign!");
    } catch (error) {
        console.log("✅ Unauthorized signer correctly rejected");
        console.log(`   Error: ${error.message}`);
    }
    console.log("");
    
    // Test 11: Try to sign twice with same signer (should fail)
    console.log("🧪 Test 11: Try to sign twice with same signer");
    console.log("-----------------------------------------------");
    
    try {
        await multisigManagerSigner1.signOperation(operationId);
        console.log("❌ ERROR: Signer was able to sign twice!");
    } catch (error) {
        console.log("✅ Duplicate signature correctly rejected");
        console.log(`   Error: ${error.message}`);
    }
    console.log("");
    
    // Test 12: Check if specific addresses have signed
    console.log("🧪 Test 12: Check if specific addresses have signed");
    console.log("---------------------------------------------------");
    
    const ownerSigned = await multisigManager.hasSignedOperation(operationId, owner.address);
    const signer1Signed = await multisigManager.hasSignedOperation(operationId, signer1.address);
    const signer2Signed = await multisigManager.hasSignedOperation(operationId, signer2.address);
    const signer3Signed = await multisigManager.hasSignedOperation(operationId, signer3.address);
    
    console.log("Signature status by address:");
    console.log(`   Owner signed: ${ownerSigned}`);
    console.log(`   Signer 1 signed: ${signer1Signed}`);
    console.log(`   Signer 2 signed: ${signer2Signed}`);
    console.log(`   Signer 3 signed: ${signer3Signed}`);
    console.log("");
    
    // Test 13: Wait for timelock and execute
    console.log("🧪 Test 13: Wait for timelock and execute");
    console.log("------------------------------------------");
    
    console.log("⏳ Waiting for timelock to expire...");
    await new Promise(resolve => setTimeout(resolve, 61000)); // Wait 61 seconds
    
    const canExecuteAfterWait = await multisigManager.canExecuteOperation(operationId);
    console.log(`Can execute after wait: ${canExecuteAfterWait}`);
    
    if (canExecuteAfterWait) {
        console.log("✅ Timelock expired, operation can be executed");
        
        // Execute the operation
        await multisigManager.executeOperation(operationId);
        console.log("✅ Operation executed successfully");
        
        // Check final status
        const finalDetails = await multisigManager.getOperationDetails(operationId);
        console.log(`   Final executed status: ${finalDetails.executed}`);
    } else {
        console.log("❌ Operation still cannot be executed");
    }
    console.log("");
    
    console.log("🎉 Multisig implementation test completed!");
    console.log("==========================================");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Test failed:", error);
        process.exit(1);
    });
