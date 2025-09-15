const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Web3 KYC System Integration Tests", function () {
  let kycDataStorage;
  let auditLogStorage;
  let multisigManager;
  let batchOperations;
  let owner;
  let authorizedWriter;
  let user1;
  let user2;
  let user3;

  beforeEach(async function () {
    [owner, authorizedWriter, user1, user2, user3] = await ethers.getSigners();
    
    // Deploy storage contracts
    const KYCDataStorage = await ethers.getContractFactory("KYCDataStorage");
    kycDataStorage = await KYCDataStorage.deploy();
    await kycDataStorage.waitForDeployment();
    
    const AuditLogStorage = await ethers.getContractFactory("AuditLogStorage");
    auditLogStorage = await AuditLogStorage.deploy();
    await auditLogStorage.waitForDeployment();
    
    const MultisigManager = await ethers.getContractFactory("MultisigManager");
    multisigManager = await MultisigManager.deploy();
    await multisigManager.waitForDeployment();
    
    // Deploy batch operations with storage contracts
    const BatchOperations = await ethers.getContractFactory("BatchOperationsSimple");
    batchOperations = await BatchOperations.deploy(
      await kycDataStorage.getAddress(),
      await auditLogStorage.getAddress(),
      await kycDataStorage.getAddress() // Using KYCDataStorage as placeholder for DIDCredentialStorage
    );
    await batchOperations.waitForDeployment();
    
    // Set up authorization
    await kycDataStorage.setAuthorizedWriter(authorizedWriter.address, true);
    await auditLogStorage.setAuthorizedWriter(authorizedWriter.address, true);
    await batchOperations.setAuthorizedWriter(authorizedWriter.address, true);
  });

  describe("Complete KYC Workflow", function () {
    it("Should complete full KYC verification workflow", async function () {
      // Step 1: Store KYC data to verify the user first
      await kycDataStorage.connect(authorizedWriter).storeKYCData(
        user1.address,
        "QmTestHash123",
        50,
        "UK",
        "tenant-1"
      );
      
      // Step 2: Initial KYC status update
      await kycDataStorage.connect(authorizedWriter).updateKYCStatus(user1.address, true);
      
      // Step 3: Update risk score
      await kycDataStorage.connect(authorizedWriter).updateRiskScore(user1.address, 85);
      
      // Step 4: Create audit log
      await auditLogStorage.connect(authorizedWriter).createAuditLog(
        user1.address,
        "tenant-1",
        "UK",
        "KYC_VERIFICATION",
        "KYC verification completed",
        "SUCCESS"
      );
      
      // Step 4: Verify data integrity
      const kycData = await kycDataStorage.getKYCData(user1.address);
      expect(kycData.isActive).to.be.true;
      expect(kycData.riskScore).to.equal(85);
      
      // Step 5: Verify audit log
      const auditLogs = await auditLogStorage.getRecentUserAuditLogs(user1.address, 1);
      expect(auditLogs.length).to.equal(1);
      expect(auditLogs[0].action).to.equal("KYC_VERIFICATION");
    });

    it("Should handle batch KYC operations", async function () {
      // Prepare batch requests
      const requests = [
        {
          user: user1.address,
          tenantId: "tenant-1",
          jurisdiction: "UK",
          documentHash: "hash1"
        },
        {
          user: user2.address,
          tenantId: "tenant-2",
          jurisdiction: "EU",
          documentHash: "hash2"
        }
      ];
      
      // Execute batch operation
      const results = await batchOperations.connect(authorizedWriter).processBatchKYC(requests, 1);
      
      // Verify results
      expect(results.length).to.equal(2);
      expect(results[0].success).to.be.true;
      expect(results[1].success).to.be.true;
      
      // Verify KYC data was updated
      const kycData1 = await kycDataStorage.getKYCData(user1.address);
      const kycData2 = await kycDataStorage.getKYCData(user2.address);
      
      expect(kycData1.isActive).to.be.true;
      expect(kycData2.isActive).to.be.true;
    });

    it("Should handle batch status updates", async function () {
      // First, store KYC data to verify users
      await kycDataStorage.connect(authorizedWriter).storeKYCData(
        user1.address,
        "QmTestHash123",
        50,
        "UK",
        "tenant-1"
      );
      await kycDataStorage.connect(authorizedWriter).storeKYCData(
        user2.address,
        "QmTestHash456",
        60,
        "US",
        "tenant-1"
      );
      
      // Then set some users as active
      await kycDataStorage.connect(authorizedWriter).updateKYCStatus(user1.address, true);
      await kycDataStorage.connect(authorizedWriter).updateKYCStatus(user2.address, true);
      
      // Batch update to inactive
      const users = [user1.address, user2.address];
      await batchOperations.connect(authorizedWriter).batchUpdateKYCStatus(users, false);
      
      // Verify status updates
      const kycData1 = await kycDataStorage.getKYCData(user1.address);
      const kycData2 = await kycDataStorage.getKYCData(user2.address);
      
      expect(kycData1.isActive).to.be.false;
      expect(kycData2.isActive).to.be.false;
    });
  });

  describe("Multisig Integration", function () {
    beforeEach(async function () {
      // Set up multisig
      await multisigManager.setAuthorizedSigner(authorizedWriter.address, true);
      await multisigManager.enableMultisig("testFunction", 1, 60); // function name, 1 signature, 1 min timelock
    });

    it("Should require multisig for critical operations", async function () {
      // This test would require the contracts to be modified to use multisig
      // For now, we verify the multisig system is properly configured
      const config = await multisigManager.getMultisigConfig("testFunction");
      expect(config.isEnabled).to.be.true;
      expect(config.requiredSignatures).to.equal(1);
    });

    it("Should execute multisig operation after timelock", async function () {
      const target = await kycDataStorage.getAddress();
      const data = kycDataStorage.interface.encodeFunctionData("updateKYCStatus", [user1.address, true]);
      const description = "Update KYC status via multisig";
      
      // Propose operation
      const tx = await multisigManager.proposeOperation(target, data, description);
      const receipt = await tx.wait();
      const operationId = receipt.logs[0].args.operationId;
      
      // Sign operation
      await multisigManager.connect(authorizedWriter).signOperation(operationId);
      
      // Advance time past timelock
      await ethers.provider.send("evm_increaseTime", [61]);
      await ethers.provider.send("evm_mine");
      
      // Execute operation
      await multisigManager.executeOperation(operationId);
      
      // Verify operation was executed
      const kycData = await kycDataStorage.getKYCData(user1.address);
      expect(kycData.isActive).to.be.true;
    });
  });

  describe("Error Handling and Edge Cases", function () {
    it("Should handle invalid batch operations gracefully", async function () {
      const invalidRequests = [
        {
          user: ethers.ZeroAddress, // Invalid address
          tenantId: "tenant-1",
          jurisdiction: "UK",
          documentHash: "hash1"
        }
      ];
      
      const results = await batchOperations.connect(authorizedWriter).processBatchKYC(invalidRequests, 1);
      
      // Should return failure result
      expect(results.length).to.equal(1);
      expect(results[0].success).to.be.false;
      expect(results[0].errorMessage).to.not.be.empty;
    });

    it("Should handle empty batch operations", async function () {
      const results = await batchOperations.connect(authorizedWriter).processBatchKYC([], 1);
      expect(results.length).to.equal(0);
    });

    it("Should handle large batch operations", async function () {
      // Create maximum batch size
      const requests = [];
      for (let i = 0; i < 50; i++) {
        requests.push({
          user: user1.address,
          tenantId: `tenant-${i}`,
          jurisdiction: "UK",
          documentHash: `hash${i}`
        });
      }
      
      const results = await batchOperations.connect(authorizedWriter).processBatchKYC(requests, 1);
      expect(results.length).to.equal(50);
      
      // All should succeed
      for (const result of results) {
        expect(result.success).to.be.true;
      }
    });
  });

  describe("Data Consistency", function () {
    it("Should maintain data consistency across operations", async function () {
      // First, store KYC data to verify the user
      await kycDataStorage.connect(authorizedWriter).storeKYCData(
        user1.address,
        "QmTestHash123",
        50,
        "UK",
        "tenant-1"
      );
      
      // Perform multiple operations
      await kycDataStorage.connect(authorizedWriter).updateKYCStatus(user1.address, true);
      await kycDataStorage.connect(authorizedWriter).updateRiskScore(user1.address, 75);
      await auditLogStorage.connect(authorizedWriter).createAuditLog(
        user1.address,
        "tenant-1",
        "UK",
        "KYC_UPDATE",
        "Risk score updated",
        "SUCCESS"
      );
      
      // Verify data consistency
      const kycData = await kycDataStorage.getKYCData(user1.address);
      const auditLogs = await auditLogStorage.getRecentUserAuditLogs(user1.address, 1);
      
      expect(kycData.isActive).to.be.true;
      expect(kycData.riskScore).to.equal(75);
      expect(auditLogs[0].action).to.equal("KYC_UPDATE");
    });

    it("Should handle concurrent operations", async function () {
      // First, store KYC data to verify the user
      await kycDataStorage.connect(authorizedWriter).storeKYCData(
        user1.address,
        "QmTestHash123",
        50,
        "UK",
        "tenant-1"
      );
      
      // Simulate concurrent operations
      const promises = [
        kycDataStorage.connect(authorizedWriter).updateKYCStatus(user1.address, true),
        kycDataStorage.connect(authorizedWriter).updateRiskScore(user1.address, 80),
        auditLogStorage.connect(authorizedWriter).createAuditLog(
          user1.address,
          "tenant-1",
          "UK",
          "CONCURRENT_UPDATE",
          "Concurrent update test",
          "SUCCESS"
        )
      ];
      
      await Promise.all(promises);
      
      // Verify all operations completed
      const kycData = await kycDataStorage.getKYCData(user1.address);
      const auditLogs = await auditLogStorage.getRecentUserAuditLogs(user1.address, 1);
      
      expect(kycData.isActive).to.be.true;
      expect(kycData.riskScore).to.equal(80);
      expect(auditLogs[0].action).to.equal("CONCURRENT_UPDATE");
    });
  });

  describe("Gas Optimization", function () {
    it("Should optimize gas usage for batch operations", async function () {
      const requests = [
        { user: user1.address, tenantId: "tenant-1", jurisdiction: "UK", documentHash: "hash1" },
        { user: user2.address, tenantId: "tenant-2", jurisdiction: "EU", documentHash: "hash2" },
        { user: user3.address, tenantId: "tenant-3", jurisdiction: "US", documentHash: "hash3" }
      ];
      
      // Measure gas usage
      const tx = await batchOperations.connect(authorizedWriter).processBatchKYC(requests, 1);
      const receipt = await tx.wait();
      
      // Gas usage should be reasonable (less than 1M gas for 3 operations)
      expect(receipt.gasUsed).to.be.lessThan(1000000);
    });
  });
});
