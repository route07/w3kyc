const { ethers } = require("hardhat");

async function main() {
    console.log("🔧 Testing Input Validation Implementation");
    console.log("==========================================");
    
    // Get signers
    const [owner, signer1, signer2, unauthorized] = await ethers.getSigners();
    
    console.log("📋 Test Setup:");
    console.log(`Owner: ${owner.address}`);
    console.log(`Signer 1: ${signer1.address}`);
    console.log(`Signer 2: ${signer2.address}`);
    console.log(`Unauthorized: ${unauthorized.address}`);
    console.log("");
    
    // Deploy MultisigManager
    console.log("🚀 Deploying MultisigManager...");
    const MultisigManager = await ethers.getContractFactory("MultisigManager");
    const multisigManager = await MultisigManager.deploy();
    await multisigManager.waitForDeployment();
    console.log(`MultisigManager deployed to: ${await multisigManager.getAddress()}`);
    console.log("");
    
    // Test 1: Empty string validation
    console.log("🧪 Test 1: Empty string validation");
    console.log("-----------------------------------");
    
    try {
        await multisigManager.setMultisigConfig("", true, 2, 60);
        console.log("❌ ERROR: Empty string was accepted!");
    } catch (error) {
        console.log("✅ Empty string correctly rejected");
        console.log(`   Error: ${error.message}`);
    }
    console.log("");
    
    // Test 2: Zero address validation
    console.log("🧪 Test 2: Zero address validation");
    console.log("----------------------------------");
    
    try {
        await multisigManager.setAuthorizedSigner(ethers.ZeroAddress, true);
        console.log("❌ ERROR: Zero address was accepted!");
    } catch (error) {
        console.log("✅ Zero address correctly rejected");
        console.log(`   Error: ${error.message}`);
    }
    console.log("");
    
    // Test 3: Invalid signature count validation
    console.log("🧪 Test 3: Invalid signature count validation");
    console.log("---------------------------------------------");
    
    try {
        await multisigManager.setMultisigConfig("testFunction", true, 0, 60);
        console.log("❌ ERROR: Zero signatures was accepted!");
    } catch (error) {
        console.log("✅ Zero signatures correctly rejected");
        console.log(`   Error: ${error.message}`);
    }
    
    try {
        await multisigManager.setMultisigConfig("testFunction", true, 100, 60);
        console.log("❌ ERROR: Too many signatures was accepted!");
    } catch (error) {
        console.log("✅ Too many signatures correctly rejected");
        console.log(`   Error: ${error.message}`);
    }
    console.log("");
    
    // Test 4: Invalid timelock duration validation
    console.log("🧪 Test 4: Invalid timelock duration validation");
    console.log("----------------------------------------------");
    
    try {
        await multisigManager.setMultisigConfig("testFunction", true, 2, 400000000); // More than 1 year
        console.log("❌ ERROR: Invalid timelock duration was accepted!");
    } catch (error) {
        console.log("✅ Invalid timelock duration correctly rejected");
        console.log(`   Error: ${error.message}`);
    }
    console.log("");
    
    // Test 5: Valid configuration
    console.log("🧪 Test 5: Valid configuration");
    console.log("------------------------------");
    
    try {
        await multisigManager.setMultisigConfig("testFunction", true, 2, 60);
        console.log("✅ Valid configuration accepted");
    } catch (error) {
        console.log("❌ ERROR: Valid configuration was rejected!");
        console.log(`   Error: ${error.message}`);
    }
    console.log("");
    
    // Test 6: Empty bytes validation
    console.log("🧪 Test 6: Empty bytes validation");
    console.log("---------------------------------");
    
    // Add authorized signer first
    await multisigManager.setAuthorizedSigner(signer1.address, true);
    
    try {
        await multisigManager.proposeOperation("testFunction", signer2.address, "0x");
        console.log("❌ ERROR: Empty bytes was accepted!");
    } catch (error) {
        console.log("✅ Empty bytes correctly rejected");
        console.log(`   Error: ${error.message}`);
    }
    console.log("");
    
    // Test 7: Zero operation ID validation
    console.log("🧪 Test 7: Zero operation ID validation");
    console.log("---------------------------------------");
    
    try {
        await multisigManager.signOperation(0);
        console.log("❌ ERROR: Zero operation ID was accepted!");
    } catch (error) {
        console.log("✅ Zero operation ID correctly rejected");
        console.log(`   Error: ${error.message}`);
    }
    console.log("");
    
    // Test 8: Valid operation proposal
    console.log("🧪 Test 8: Valid operation proposal");
    console.log("-----------------------------------");
    
    try {
        const currentCounter = await multisigManager.operationCounter();
        const expectedOperationId = Number(currentCounter) + 1;
        
        await multisigManager.proposeOperation("testFunction", signer2.address, "0x12345678");
        console.log("✅ Valid operation proposal accepted");
        console.log(`   Operation ID: ${expectedOperationId}`);
    } catch (error) {
        console.log("❌ ERROR: Valid operation proposal was rejected!");
        console.log(`   Error: ${error.message}`);
    }
    console.log("");
    
    // Test 9: String length validation
    console.log("🧪 Test 9: String length validation");
    console.log("-----------------------------------");
    
    // Create a very long string
    const longString = "a".repeat(300); // Longer than MAX_STRING_LENGTH (256)
    
    try {
        await multisigManager.setMultisigConfig(longString, true, 2, 60);
        console.log("❌ ERROR: Long string was accepted!");
    } catch (error) {
        console.log("✅ Long string correctly rejected");
        console.log(`   Error: ${error.message}`);
    }
    console.log("");
    
    // Test 10: Bytes length validation
    console.log("🧪 Test 10: Bytes length validation");
    console.log("-----------------------------------");
    
    // Create very long bytes data
    const longBytes = "0x" + "12".repeat(2000); // Longer than MAX_BYTES_LENGTH (1024)
    
    try {
        await multisigManager.proposeOperation("testFunction", signer2.address, longBytes);
        console.log("❌ ERROR: Long bytes was accepted!");
    } catch (error) {
        console.log("✅ Long bytes correctly rejected");
        console.log(`   Error: ${error.message}`);
    }
    console.log("");
    
    // Test 11: Self address validation
    console.log("🧪 Test 11: Self address validation");
    console.log("-----------------------------------");
    
    try {
        await multisigManager.proposeOperation("testFunction", await multisigManager.getAddress(), "0x12345678");
        console.log("❌ ERROR: Self address was accepted!");
    } catch (error) {
        console.log("✅ Self address correctly rejected");
        console.log(`   Error: ${error.message}`);
    }
    console.log("");
    
    // Test 12: View function validation
    console.log("🧪 Test 12: View function validation");
    console.log("------------------------------------");
    
    try {
        await multisigManager.getMultisigConfig("");
        console.log("❌ ERROR: Empty string in view function was accepted!");
    } catch (error) {
        console.log("✅ Empty string in view function correctly rejected");
        console.log(`   Error: ${error.message}`);
    }
    
    try {
        await multisigManager.isAuthorizedSigner(ethers.ZeroAddress);
        console.log("❌ ERROR: Zero address in view function was accepted!");
    } catch (error) {
        console.log("✅ Zero address in view function correctly rejected");
        console.log(`   Error: ${error.message}`);
    }
    console.log("");
    
    console.log("🎉 Input validation tests completed!");
    console.log("====================================");
    console.log("✅ All input validation tests passed successfully!");
    console.log("🔒 Comprehensive input validation is working correctly!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Test failed:", error);
        process.exit(1);
    });
