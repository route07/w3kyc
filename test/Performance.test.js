const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Web3 KYC System Performance Tests", function () {
  let kycDataStorage;
  let auditLogStorage;
  let batchOperations;
  let owner;
  let authorizedWriter;
  let users;

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    owner = signers[0];
    authorizedWriter = signers[1];
    users = signers.slice(2, 12); // 10 test users
    
    // Deploy contracts
    const KYCDataStorage = await ethers.getContractFactory("KYCDataStorage");
    kycDataStorage = await KYCDataStorage.deploy();
    await kycDataStorage.waitForDeployment();
    
    const AuditLogStorage = await ethers.getContractFactory("AuditLogStorage");
    auditLogStorage = await AuditLogStorage.deploy();
    await auditLogStorage.waitForDeployment();
    
    const BatchOperations = await ethers.getContractFactory("BatchOperationsSimple");
    batchOperations = await BatchOperations.deploy(
      await kycDataStorage.getAddress(),
      await auditLogStorage.getAddress(),
      await kycDataStorage.getAddress()
    );
    await batchOperations.waitForDeployment();
    
    // Set up authorization
    await kycDataStorage.setAuthorizedWriter(authorizedWriter.address, true);
    await auditLogStorage.setAuthorizedWriter(authorizedWriter.address, true);
    await batchOperations.setAuthorizedWriter(authorizedWriter.address, true);
  });

  describe("Gas Usage Analysis", function () {
    it("Should measure gas usage for individual KYC operations", async function () {
      const gasUsages = [];
      
      for (let i = 0; i < 5; i++) {
        const tx = await kycDataStorage.connect(authorizedWriter).updateKYCStatus(users[i].address, true);
        const receipt = await tx.wait();
        gasUsages.push(receipt.gasUsed);
      }
      
      // Calculate average gas usage
      const averageGas = gasUsages.reduce((sum, gas) => sum + gas, 0) / gasUsages.length;
      
      console.log(`Average gas usage for individual KYC operations: ${averageGas}`);
      
      // Gas usage should be reasonable (less than 100k gas per operation)
      expect(averageGas).to.be.lessThan(100000);
    });

    it("Should measure gas usage for batch operations", async function () {
      const batchSizes = [1, 5, 10, 20, 50];
      const gasUsages = [];
      
      for (const batchSize of batchSizes) {
        const requests = [];
        for (let i = 0; i < batchSize; i++) {
          requests.push({
            user: users[i % users.length].address,
            tenantId: `tenant-${i}`,
            jurisdiction: "UK",
            documentHash: `hash${i}`
          });
        }
        
        const tx = await batchOperations.connect(authorizedWriter).processBatchKYC(requests, batchSize);
        const receipt = await tx.wait();
        gasUsages.push(receipt.gasUsed);
        
        console.log(`Batch size ${batchSize}: ${receipt.gasUsed} gas`);
      }
      
      // Verify gas usage scales reasonably with batch size
      for (let i = 1; i < gasUsages.length; i++) {
        const gasPerOperation = gasUsages[i] / batchSizes[i];
        const previousGasPerOperation = gasUsages[i-1] / batchSizes[i-1];
        
        // Gas per operation should decrease with larger batches (economies of scale)
        expect(gasPerOperation).to.be.lessThanOrEqual(previousGasPerOperation * 1.1); // Allow 10% variance
      }
    });

    it("Should measure gas usage for audit log operations", async function () {
      const gasUsages = [];
      
      for (let i = 0; i < 10; i++) {
        const tx = await auditLogStorage.connect(authorizedWriter).createAuditLog(
          users[i].address,
          `tenant-${i}`,
          "UK",
          "PERFORMANCE_TEST",
          `Test audit log ${i}`,
          "SUCCESS"
        );
        const receipt = await tx.wait();
        gasUsages.push(receipt.gasUsed);
      }
      
      const averageGas = gasUsages.reduce((sum, gas) => sum + gas, 0) / gasUsages.length;
      
      console.log(`Average gas usage for audit log operations: ${averageGas}`);
      
      // Audit log operations should be efficient
      expect(averageGas).to.be.lessThan(150000);
    });
  });

  describe("Scalability Tests", function () {
    it("Should handle maximum batch size efficiently", async function () {
      const maxBatchSize = 50;
      const requests = [];
      
      for (let i = 0; i < maxBatchSize; i++) {
        requests.push({
          user: users[i % users.length].address,
          tenantId: `tenant-${i}`,
          jurisdiction: "UK",
          documentHash: `hash${i}`
        });
      }
      
      const tx = await batchOperations.connect(authorizedWriter).processBatchKYC(requests, maxBatchSize);
      const receipt = await tx.wait();
      
      console.log(`Maximum batch size (${maxBatchSize}) gas usage: ${receipt.gasUsed}`);
      
      // Should complete within reasonable gas limit
      expect(receipt.gasUsed).to.be.lessThan(5000000); // 5M gas limit
    });

    it("Should handle multiple concurrent batch operations", async function () {
      const batchPromises = [];
      
      // Create 5 concurrent batch operations
      for (let batchId = 0; batchId < 5; batchId++) {
        const requests = [];
        for (let i = 0; i < 10; i++) {
          requests.push({
            user: users[(batchId * 10 + i) % users.length].address,
            tenantId: `tenant-${batchId}-${i}`,
            jurisdiction: "UK",
            documentHash: `hash${batchId}-${i}`
          });
        }
        
        batchPromises.push(
          batchOperations.connect(authorizedWriter).processBatchKYC(requests, batchId)
        );
      }
      
      const startTime = Date.now();
      const results = await Promise.all(batchPromises);
      const endTime = Date.now();
      
      console.log(`5 concurrent batch operations completed in ${endTime - startTime}ms`);
      
      // All operations should succeed
      for (const result of results) {
        expect(result.length).to.equal(10);
        for (const operationResult of result) {
          expect(operationResult.success).to.be.true;
        }
      }
    });

    it("Should handle large audit log volumes", async function () {
      const auditLogPromises = [];
      
      // Create 100 audit logs concurrently
      for (let i = 0; i < 100; i++) {
        auditLogPromises.push(
          auditLogStorage.connect(authorizedWriter).createAuditLog(
            users[i % users.length].address,
            `tenant-${i}`,
            "UK",
            "SCALABILITY_TEST",
            `Scalability test audit log ${i}`,
            "SUCCESS"
          )
        );
      }
      
      const startTime = Date.now();
      await Promise.all(auditLogPromises);
      const endTime = Date.now();
      
      console.log(`100 audit logs created in ${endTime - startTime}ms`);
      
      // Verify all audit logs were created
      const auditLogs = await auditLogStorage.getRecentUserAuditLogs(users[0].address, 100);
      expect(auditLogs.length).to.be.greaterThan(0);
    });
  });

  describe("Memory and Storage Optimization", function () {
    it("Should handle large data structures efficiently", async function () {
      // Test with large metadata strings
      const largeMetadata = "x".repeat(1000); // 1KB string
      
      const tx = await auditLogStorage.connect(authorizedWriter).createAuditLog(
        users[0].address,
        "tenant-1",
        "UK",
        "LARGE_DATA_TEST",
        largeMetadata,
        "SUCCESS"
      );
      const receipt = await tx.wait();
      
      console.log(`Large data audit log gas usage: ${receipt.gasUsed}`);
      
      // Should handle large data without excessive gas usage
      expect(receipt.gasUsed).to.be.lessThan(200000);
    });

    it("Should optimize storage for repeated operations", async function () {
      // Perform same operation multiple times to test storage optimization
      const gasUsages = [];
      
      for (let i = 0; i < 10; i++) {
        const tx = await kycDataStorage.connect(authorizedWriter).updateKYCStatus(users[0].address, true);
        const receipt = await tx.wait();
        gasUsages.push(receipt.gasUsed);
      }
      
      // Gas usage should be consistent (no significant increase due to storage growth)
      const firstGas = gasUsages[0];
      const lastGas = gasUsages[gasUsages.length - 1];
      
      expect(lastGas).to.be.lessThanOrEqual(firstGas * 1.1); // Allow 10% variance
    });
  });

  describe("Network Performance", function () {
    it("Should handle rapid sequential operations", async function () {
      const startTime = Date.now();
      
      // Perform 50 rapid sequential operations
      for (let i = 0; i < 50; i++) {
        await kycDataStorage.connect(authorizedWriter).updateKYCStatus(users[i % users.length].address, true);
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      console.log(`50 sequential operations completed in ${totalTime}ms`);
      
      // Should complete within reasonable time
      expect(totalTime).to.be.lessThan(30000); // 30 seconds
    });

    it("Should maintain performance under load", async function () {
      const operationCount = 100;
      const startTime = Date.now();
      
      // Create mixed load of different operations
      const promises = [];
      for (let i = 0; i < operationCount; i++) {
        if (i % 3 === 0) {
          promises.push(
            kycDataStorage.connect(authorizedWriter).updateKYCStatus(users[i % users.length].address, true)
          );
        } else if (i % 3 === 1) {
          promises.push(
            kycDataStorage.connect(authorizedWriter).updateRiskScore(users[i % users.length].address, 75)
          );
        } else {
          promises.push(
            auditLogStorage.connect(authorizedWriter).createAuditLog(
              users[i % users.length].address,
              `tenant-${i}`,
              "UK",
              "LOAD_TEST",
              `Load test operation ${i}`,
              "SUCCESS"
            )
          );
        }
      }
      
      await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      console.log(`${operationCount} mixed operations completed in ${totalTime}ms`);
      
      // Should maintain reasonable performance
      expect(totalTime).to.be.lessThan(60000); // 1 minute
    });
  });
});
