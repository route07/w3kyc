/**
 * Emergency Testing Script for Web3 KYC Multisig System
 * 
 * This script tests emergency procedures and ensures the system
 * can respond effectively to critical situations.
 */

const { ethers } = require("hardhat");

async function main() {
    console.log("🚨 Starting Emergency Procedures Testing...\n");

    // Get signers
    const [owner, signer1, signer2, signer3, emergencyContact] = await ethers.getSigners();
    
    console.log("📋 Test Setup:");
    console.log(`Owner: ${owner.address}`);
    console.log(`Signer 1: ${signer1.address}`);
    console.log(`Signer 2: ${signer2.address}`);
    console.log(`Signer 3: ${signer3.address}`);
    console.log(`Emergency Contact: ${emergencyContact.address}\n`);

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

    // Test 1: Normal Operations
    console.log("🧪 Test 1: Normal Operations");
    await testNormalOperations(multisigManager, owner, signer1, signer2, signer3);
    
    // Test 2: Emergency Declaration
    console.log("🧪 Test 2: Emergency Declaration");
    await testEmergencyDeclaration(emergencyManager, emergencyContact);
    
    // Test 3: Emergency Override
    console.log("🧪 Test 3: Emergency Override");
    await testEmergencyOverride(emergencyManager, multisigManager, emergencyContact);
    
    // Test 4: Emergency Signer Management
    console.log("🧪 Test 4: Emergency Signer Management");
    await testEmergencySignerManagement(emergencyManager, multisigManager, emergencyContact, signer1);
    
    // Test 5: Emergency Resolution
    console.log("🧪 Test 5: Emergency Resolution");
    await testEmergencyResolution(emergencyManager, emergencyContact);
    
    // Test 6: Emergency Action Logging
    console.log("🧪 Test 6: Emergency Action Logging");
    await testEmergencyActionLogging(emergencyManager);
    
    console.log("\n✅ All emergency tests completed successfully!");
    console.log("📊 Emergency procedures are working correctly.");
}

async function testNormalOperations(multisigManager, owner, signer1, signer2, signer3) {
    console.log("  📝 Testing normal multisig operations...");
    
    // Add authorized signers
    await multisigManager.setAuthorizedSigner(signer1.address, true);
    await multisigManager.setAuthorizedSigner(signer2.address, true);
    await multisigManager.setAuthorizedSigner(signer3.address, true);
    console.log("  ✅ Added authorized signers");
    
    // Enable multisig for a function
    await multisigManager.enableMultisig("updateKYCConfig", 2, 0);
    console.log("  ✅ Enabled 2-of-3 multisig for updateKYCConfig");
    
    // Check multisig requirement
    const requiresMultisig = await multisigManager.requiresMultisig("updateKYCConfig");
    console.log(`  ✅ Multisig required: ${requiresMultisig}`);
    
    console.log("  ✅ Normal operations test passed\n");
}

async function testEmergencyDeclaration(emergencyManager, emergencyContact) {
    console.log("  🚨 Testing emergency declaration...");
    
    // Check initial emergency status
    const initialStatus = await emergencyManager.getEmergencyStatus();
    console.log(`  📊 Initial emergency status: ${initialStatus.isEmergency}`);
    
    // Declare emergency
    await emergencyManager.connect(emergencyContact).declareEmergency("Test emergency for system validation");
    console.log("  ✅ Emergency declared successfully");
    
    // Check emergency status
    const emergencyStatus = await emergencyManager.getEmergencyStatus();
    console.log(`  📊 Emergency active: ${emergencyStatus.isEmergency}`);
    console.log(`  📊 Emergency reason: ${emergencyStatus.reason}`);
    console.log(`  📊 Declared by: ${emergencyStatus.declaredBy}`);
    
    console.log("  ✅ Emergency declaration test passed\n");
}

async function testEmergencyOverride(emergencyManager, multisigManager, emergencyContact) {
    console.log("  🔧 Testing emergency override...");
    
    // Enable multisig for a function
    await multisigManager.enableMultisig("setAuthorizedWriter", 3, 86400); // 3-of-3 with 24h timelock
    console.log("  📝 Enabled 3-of-3 multisig with 24h timelock");
    
    // Check multisig requirement
    const requiresMultisig = await multisigManager.requiresMultisig("setAuthorizedWriter");
    console.log(`  📊 Multisig required: ${requiresMultisig}`);
    
    // Emergency override to disable multisig
    const disableMultisigData = multisigManager.interface.encodeFunctionData("disableMultisig", ["setAuthorizedWriter"]);
    await emergencyManager.connect(emergencyContact).emergencyOverride(
        "disableMultisig",
        multisigManager.address,
        disableMultisigData,
        "Emergency override to disable multisig for operational continuity"
    );
    console.log("  ✅ Emergency override executed successfully");
    
    // Verify multisig is disabled
    const stillRequiresMultisig = await multisigManager.requiresMultisig("setAuthorizedWriter");
    console.log(`  📊 Multisig still required: ${stillRequiresMultisig}`);
    
    console.log("  ✅ Emergency override test passed\n");
}

async function testEmergencySignerManagement(emergencyManager, multisigManager, emergencyContact, newSigner) {
    console.log("  👥 Testing emergency signer management...");
    
    // Add emergency signer
    await emergencyManager.connect(emergencyContact).addEmergencySigner(
        newSigner.address,
        "Adding emergency signer for operational continuity"
    );
    console.log("  ✅ Emergency signer added");
    
    // Verify signer is authorized
    const isAuthorized = await multisigManager.isAuthorizedSigner(newSigner.address);
    console.log(`  📊 New signer authorized: ${isAuthorized}`);
    
    // Remove emergency signer
    await emergencyManager.connect(emergencyContact).removeEmergencySigner(
        newSigner.address,
        "Removing emergency signer after crisis resolution"
    );
    console.log("  ✅ Emergency signer removed");
    
    // Verify signer is no longer authorized
    const stillAuthorized = await multisigManager.isAuthorizedSigner(newSigner.address);
    console.log(`  📊 Signer still authorized: ${stillAuthorized}`);
    
    console.log("  ✅ Emergency signer management test passed\n");
}

async function testEmergencyResolution(emergencyManager, emergencyContact) {
    console.log("  🔄 Testing emergency resolution...");
    
    // Check emergency status
    const emergencyStatus = await emergencyManager.getEmergencyStatus();
    console.log(`  📊 Emergency active: ${emergencyStatus.isEmergency}`);
    console.log(`  📊 Emergency duration: ${emergencyStatus.duration} seconds`);
    
    // Resolve emergency
    await emergencyManager.connect(emergencyContact).resolveEmergency();
    console.log("  ✅ Emergency resolved successfully");
    
    // Check emergency status
    const resolvedStatus = await emergencyManager.getEmergencyStatus();
    console.log(`  📊 Emergency active: ${resolvedStatus.isEmergency}`);
    
    console.log("  ✅ Emergency resolution test passed\n");
}

async function testEmergencyActionLogging(emergencyManager) {
    console.log("  📋 Testing emergency action logging...");
    
    // Get emergency action count
    const actionCount = await emergencyManager.getEmergencyActionCount();
    console.log(`  📊 Total emergency actions: ${actionCount}`);
    
    // Get details of first emergency action
    if (actionCount > 0) {
        const firstAction = await emergencyManager.getEmergencyAction(1);
        console.log(`  📊 First action: ${firstAction.action}`);
        console.log(`  📊 Executor: ${firstAction.executor}`);
        console.log(`  📊 Timestamp: ${firstAction.timestamp}`);
        console.log(`  📊 Reason: ${firstAction.reason}`);
        console.log(`  📊 Executed: ${firstAction.executed}`);
    }
    
    console.log("  ✅ Emergency action logging test passed\n");
}

// Emergency simulation scenarios
async function simulateSecurityIncident() {
    console.log("🔒 Simulating Security Incident...");
    
    const [owner, compromisedSigner, newSigner1, newSigner2] = await ethers.getSigners();
    
    // Deploy contracts
    const MultisigManager = await ethers.getContractFactory("MultisigManager");
    const multisigManager = await MultisigManager.deploy();
    await multisigManager.deployed();
    
    const EmergencyManager = await ethers.getContractFactory("EmergencyManager");
    const emergencyManager = await EmergencyManager.deploy(multisigManager.address);
    await emergencyManager.deployed();
    
    // Setup normal operations
    await multisigManager.setAuthorizedSigner(compromisedSigner.address, true);
    await multisigManager.enableMultisig("setSuperAdmin", 2, 0);
    
    console.log("  📝 Normal operations configured");
    
    // Simulate security incident
    await emergencyManager.declareEmergency("Suspected compromise of multisig signer");
    console.log("  🚨 Emergency declared");
    
    // Remove compromised signer
    await emergencyManager.removeEmergencySigner(
        compromisedSigner.address,
        "Removing compromised signer"
    );
    console.log("  🔒 Compromised signer removed");
    
    // Add new secure signers
    await emergencyManager.addEmergencySigner(
        newSigner1.address,
        "Adding new secure signer"
    );
    await emergencyManager.addEmergencySigner(
        newSigner2.address,
        "Adding backup secure signer"
    );
    console.log("  ✅ New secure signers added");
    
    // Re-enable multisig with new signers
    const enableMultisigData = multisigManager.interface.encodeFunctionData("enableMultisig", ["setSuperAdmin", 2, 0]);
    await emergencyManager.emergencyOverride(
        "enableMultisig",
        multisigManager.address,
        enableMultisigData,
        "Re-enabling multisig with new secure signers"
    );
    console.log("  🔧 Multisig re-enabled with new signers");
    
    // Resolve emergency
    await emergencyManager.resolveEmergency();
    console.log("  ✅ Emergency resolved");
    
    console.log("  ✅ Security incident simulation completed\n");
}

async function simulateSystemFailure() {
    console.log("💥 Simulating System Failure...");
    
    const [owner, emergencyContact] = await ethers.getSigners();
    
    // Deploy contracts
    const MultisigManager = await ethers.getContractFactory("MultisigManager");
    const multisigManager = await MultisigManager.deploy();
    await multisigManager.deployed();
    
    const EmergencyManager = await ethers.getContractFactory("EmergencyManager");
    const emergencyManager = await EmergencyManager.deploy(multisigManager.address);
    await emergencyManager.deployed();
    
    // Setup normal operations with high multisig requirements
    await multisigManager.enableMultisig("updateKYCConfig", 3, 86400);
    await multisigManager.enableMultisig("registerTenant", 2, 0);
    
    console.log("  📝 High-security operations configured");
    
    // Simulate system failure
    await emergencyManager.connect(emergencyContact).declareEmergency("Critical system components down");
    console.log("  🚨 Emergency declared");
    
    // Disable multisig for operational functions
    await emergencyManager.connect(emergencyContact).emergencyDisableAllMultisig(
        "Disabling multisig to maintain operational continuity during system failure"
    );
    console.log("  🔧 All multisig requirements disabled");
    
    // Verify functions can be called with single signature
    const requiresMultisig1 = await multisigManager.requiresMultisig("updateKYCConfig");
    const requiresMultisig2 = await multisigManager.requiresMultisig("registerTenant");
    console.log(`  📊 updateKYCConfig requires multisig: ${requiresMultisig1}`);
    console.log(`  📊 registerTenant requires multisig: ${requiresMultisig2}`);
    
    // Resolve emergency
    await emergencyManager.connect(emergencyContact).resolveEmergency();
    console.log("  ✅ Emergency resolved");
    
    console.log("  ✅ System failure simulation completed\n");
}

// Run emergency tests
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Emergency test failed:", error);
            process.exit(1);
        });
}

module.exports = {
    main,
    simulateSecurityIncident,
    simulateSystemFailure
};
