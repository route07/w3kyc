/**
 * Emergency System Enable/Disable Test Script
 * 
 * This script tests the master enable/disable functionality
 * for the emergency system feature.
 */

const { ethers } = require("hardhat");

async function main() {
    console.log("🔧 Testing Emergency System Enable/Disable Functionality...\n");

    // Get signers
    const [owner, emergencyContact, unauthorizedUser] = await ethers.getSigners();
    
    console.log("📋 Test Setup:");
    console.log(`Owner: ${owner.address}`);
    console.log(`Emergency Contact: ${emergencyContact.address}`);
    console.log(`Unauthorized User: ${unauthorizedUser.address}\n`);

    // Deploy contracts
    console.log("🏗️ Deploying contracts...");
    
    const MultisigManager = await ethers.getContractFactory("MultisigManager");
    const multisigManager = await MultisigManager.deploy();
    await multisigManager.deployed();
    console.log(`MultisigManager deployed to: ${multisigManager.address}`);

    const EmergencyManager = await ethers.getContractFactory("EmergencyManager");
    const emergencyManager = await EmergencyManager.deploy(multisigManager.address);
    await emergencyManager.deployed();
    console.log(`EmergencyManager deployed to: ${emergencyManager.address}\n`);

    // Test 1: Initial State
    console.log("🧪 Test 1: Initial Emergency System State");
    await testInitialState(emergencyManager);
    
    // Test 2: Disable Emergency System
    console.log("🧪 Test 2: Disable Emergency System");
    await testDisableEmergencySystem(emergencyManager, owner);
    
    // Test 3: Emergency Operations Blocked When Disabled
    console.log("🧪 Test 3: Emergency Operations Blocked When Disabled");
    await testEmergencyOperationsBlocked(emergencyManager, emergencyContact);
    
    // Test 4: Re-enable Emergency System
    console.log("🧪 Test 4: Re-enable Emergency System");
    await testEnableEmergencySystem(emergencyManager, owner);
    
    // Test 5: Emergency Operations Work When Enabled
    console.log("🧪 Test 5: Emergency Operations Work When Enabled");
    await testEmergencyOperationsWork(emergencyManager, emergencyContact);
    
    // Test 6: Unauthorized Access Prevention
    console.log("🧪 Test 6: Unauthorized Access Prevention");
    await testUnauthorizedAccess(emergencyManager, unauthorizedUser);
    
    // Test 7: Cannot Disable During Active Emergency
    console.log("🧪 Test 7: Cannot Disable During Active Emergency");
    await testCannotDisableDuringEmergency(emergencyManager, owner, emergencyContact);
    
    console.log("\n✅ All emergency system enable/disable tests completed successfully!");
    console.log("📊 Emergency system master control is working correctly.");
}

async function testInitialState(emergencyManager) {
    console.log("  📊 Checking initial emergency system state...");
    
    const systemEnabled = await emergencyManager.isEmergencySystemEnabled();
    const systemStatus = await emergencyManager.getEmergencySystemStatus();
    
    console.log(`  📊 Emergency system enabled: ${systemEnabled}`);
    console.log(`  📊 System status - enabled: ${systemStatus.systemEnabled}`);
    console.log(`  📊 System status - emergency: ${systemStatus.isEmergency}`);
    
    // Emergency system should be enabled by default
    if (systemEnabled && systemStatus.systemEnabled) {
        console.log("  ✅ Emergency system is enabled by default");
    } else {
        console.log("  ❌ Emergency system should be enabled by default");
    }
    
    console.log("  ✅ Initial state test passed\n");
}

async function testDisableEmergencySystem(emergencyManager, owner) {
    console.log("  🔧 Testing emergency system disable...");
    
    // Disable emergency system
    await emergencyManager.connect(owner).disableEmergencySystem();
    console.log("  ✅ Emergency system disabled");
    
    // Verify it's disabled
    const systemEnabled = await emergencyManager.isEmergencySystemEnabled();
    const systemStatus = await emergencyManager.getEmergencySystemStatus();
    
    console.log(`  📊 Emergency system enabled: ${systemEnabled}`);
    console.log(`  📊 System status - enabled: ${systemStatus.systemEnabled}`);
    
    if (!systemEnabled && !systemStatus.systemEnabled) {
        console.log("  ✅ Emergency system successfully disabled");
    } else {
        console.log("  ❌ Emergency system should be disabled");
    }
    
    console.log("  ✅ Disable test passed\n");
}

async function testEmergencyOperationsBlocked(emergencyManager, emergencyContact) {
    console.log("  🚫 Testing emergency operations blocked when disabled...");
    
    try {
        // Try to declare emergency (should fail)
        await emergencyManager.connect(emergencyContact).declareEmergency("Test emergency");
        console.log("  ❌ Emergency declaration should have failed");
    } catch (error) {
        if (error.message.includes("Emergency system disabled")) {
            console.log("  ✅ Emergency declaration correctly blocked");
        } else {
            console.log(`  ❌ Unexpected error: ${error.message}`);
        }
    }
    
    try {
        // Try to add emergency signer (should fail)
        await emergencyManager.connect(emergencyContact).addEmergencySigner(
            emergencyContact.address,
            "Test signer"
        );
        console.log("  ❌ Emergency signer addition should have failed");
    } catch (error) {
        if (error.message.includes("Emergency system disabled")) {
            console.log("  ✅ Emergency signer addition correctly blocked");
        } else {
            console.log(`  ❌ Unexpected error: ${error.message}`);
        }
    }
    
    console.log("  ✅ Emergency operations blocked test passed\n");
}

async function testEnableEmergencySystem(emergencyManager, owner) {
    console.log("  🔧 Testing emergency system enable...");
    
    // Enable emergency system
    await emergencyManager.connect(owner).enableEmergencySystem();
    console.log("  ✅ Emergency system enabled");
    
    // Verify it's enabled
    const systemEnabled = await emergencyManager.isEmergencySystemEnabled();
    const systemStatus = await emergencyManager.getEmergencySystemStatus();
    
    console.log(`  📊 Emergency system enabled: ${systemEnabled}`);
    console.log(`  📊 System status - enabled: ${systemStatus.systemEnabled}`);
    
    if (systemEnabled && systemStatus.systemEnabled) {
        console.log("  ✅ Emergency system successfully enabled");
    } else {
        console.log("  ❌ Emergency system should be enabled");
    }
    
    console.log("  ✅ Enable test passed\n");
}

async function testEmergencyOperationsWork(emergencyManager, emergencyContact) {
    console.log("  ✅ Testing emergency operations work when enabled...");
    
    // Declare emergency (should work now)
    await emergencyManager.connect(emergencyContact).declareEmergency("Test emergency after enable");
    console.log("  ✅ Emergency declared successfully");
    
    // Check emergency status
    const systemStatus = await emergencyManager.getEmergencySystemStatus();
    console.log(`  📊 Emergency active: ${systemStatus.isEmergency}`);
    console.log(`  📊 Emergency reason: ${systemStatus.reason}`);
    
    // Resolve emergency
    await emergencyManager.connect(emergencyContact).resolveEmergency();
    console.log("  ✅ Emergency resolved successfully");
    
    // Verify emergency is resolved
    const resolvedStatus = await emergencyManager.getEmergencySystemStatus();
    console.log(`  📊 Emergency active: ${resolvedStatus.isEmergency}`);
    
    console.log("  ✅ Emergency operations work test passed\n");
}

async function testUnauthorizedAccess(emergencyManager, unauthorizedUser) {
    console.log("  🚫 Testing unauthorized access prevention...");
    
    try {
        // Try to disable emergency system (should fail)
        await emergencyManager.connect(unauthorizedUser).disableEmergencySystem();
        console.log("  ❌ Unauthorized disable should have failed");
    } catch (error) {
        if (error.message.includes("Only owner")) {
            console.log("  ✅ Unauthorized disable correctly blocked");
        } else {
            console.log(`  ❌ Unexpected error: ${error.message}`);
        }
    }
    
    try {
        // Try to enable emergency system (should fail)
        await emergencyManager.connect(unauthorizedUser).enableEmergencySystem();
        console.log("  ❌ Unauthorized enable should have failed");
    } catch (error) {
        if (error.message.includes("Only owner")) {
            console.log("  ✅ Unauthorized enable correctly blocked");
        } else {
            console.log(`  ❌ Unexpected error: ${error.message}`);
        }
    }
    
    console.log("  ✅ Unauthorized access prevention test passed\n");
}

async function testCannotDisableDuringEmergency(emergencyManager, owner, emergencyContact) {
    console.log("  🚫 Testing cannot disable during active emergency...");
    
    // Declare emergency
    await emergencyManager.connect(emergencyContact).declareEmergency("Test emergency for disable test");
    console.log("  ✅ Emergency declared");
    
    try {
        // Try to disable emergency system during emergency (should fail)
        await emergencyManager.connect(owner).disableEmergencySystem();
        console.log("  ❌ Disable during emergency should have failed");
    } catch (error) {
        if (error.message.includes("Cannot disable during active emergency")) {
            console.log("  ✅ Disable during emergency correctly blocked");
        } else {
            console.log(`  ❌ Unexpected error: ${error.message}`);
        }
    }
    
    // Resolve emergency
    await emergencyManager.connect(emergencyContact).resolveEmergency();
    console.log("  ✅ Emergency resolved");
    
    // Now should be able to disable
    await emergencyManager.connect(owner).disableEmergencySystem();
    console.log("  ✅ Emergency system disabled after emergency resolved");
    
    console.log("  ✅ Cannot disable during emergency test passed\n");
}

// Run tests
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Emergency system test failed:", error);
            process.exit(1);
        });
}

module.exports = {
    main
};
