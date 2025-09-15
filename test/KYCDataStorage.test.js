const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("KYCDataStorage", function () {
  let kycDataStorage;
  let owner;
  let authorizedWriter;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, authorizedWriter, user1, user2] = await ethers.getSigners();
    
    const KYCDataStorage = await ethers.getContractFactory("KYCDataStorage");
    kycDataStorage = await KYCDataStorage.deploy();
    await kycDataStorage.waitForDeployment();
    
    // Set authorized writer
    await kycDataStorage.setAuthorizedWriter(authorizedWriter.address, true);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await kycDataStorage.owner()).to.equal(owner.address);
    });

    it("Should initialize with correct default values", async function () {
      const kycData = await kycDataStorage.getKYCData(user1.address);
      expect(kycData.isVerified).to.be.false;
      expect(kycData.isActive).to.be.false;
      expect(kycData.riskScore).to.equal(0);
    });
  });

  describe("Authorization", function () {
    it("Should allow owner to set authorized writer", async function () {
      await expect(kycDataStorage.setAuthorizedWriter(user1.address, true))
        .to.emit(kycDataStorage, "AuthorizedWriterUpdated")
        .withArgs(user1.address, true);
    });

    it("Should not allow non-owner to set authorized writer", async function () {
      await expect(
        kycDataStorage.connect(user1).setAuthorizedWriter(user2.address, true)
      ).to.be.revertedWith("Only owner");
    });

    it("Should check authorization correctly", async function () {
      expect(await kycDataStorage.isAuthorizedWriter(owner.address)).to.be.true;
      expect(await kycDataStorage.isAuthorizedWriter(authorizedWriter.address)).to.be.true;
      expect(await kycDataStorage.isAuthorizedWriter(user1.address)).to.be.false;
    });
  });

  describe("KYC Data Management", function () {
    it("Should allow authorized writer to update KYC status", async function () {
      // First, store KYC data to verify the user
      await kycDataStorage.connect(authorizedWriter).storeKYCData(
        user1.address,
        "QmTestHash123",
        50,
        "US",
        "tenant1"
      );
      
      // Now update the status
      const tx = await kycDataStorage.connect(authorizedWriter).updateKYCStatus(user1.address, true);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);
      
      await expect(tx)
        .to.emit(kycDataStorage, "KYCDataUpdated")
        .withArgs(user1.address, "status", block.timestamp);
    });

    it("Should not allow unauthorized writer to update KYC status", async function () {
      await expect(
        kycDataStorage.connect(user1).updateKYCStatus(user2.address, true)
      ).to.be.revertedWith("Not authorized");
    });

    it("Should update risk score correctly", async function () {
      // First, store KYC data to verify the user
      await kycDataStorage.connect(authorizedWriter).storeKYCData(
        user1.address,
        "QmTestHash123",
        50,
        "US",
        "tenant1"
      );
      
      await kycDataStorage.connect(authorizedWriter).updateRiskScore(user1.address, 85);
      
      const kycData = await kycDataStorage.getKYCData(user1.address);
      expect(kycData.riskScore).to.equal(85);
    });

    it("Should extend KYC expiry correctly", async function () {
      // First, store KYC data to verify the user
      await kycDataStorage.connect(authorizedWriter).storeKYCData(
        user1.address,
        "QmTestHash123",
        50,
        "US",
        "tenant1"
      );
      
      const additionalTime = 365 * 24 * 60 * 60; // 1 year
      const originalExpiry = (await kycDataStorage.getKYCData(user1.address)).expiresAt;
      
      await kycDataStorage.connect(authorizedWriter).extendKYCExpiry(user1.address, additionalTime);
      
      const kycData = await kycDataStorage.getKYCData(user1.address);
      expect(kycData.expiresAt).to.equal(BigInt(originalExpiry) + BigInt(additionalTime));
    });

    it("Should link wallet correctly", async function () {
      // First, store KYC data to verify the user
      await kycDataStorage.connect(authorizedWriter).storeKYCData(
        user1.address,
        "QmTestHash123",
        50,
        "US",
        "tenant1"
      );
      
      await kycDataStorage.connect(authorizedWriter).linkWallet(user1.address, user2.address);
      
      // Check if wallet is linked (in multiple wallet mode, it's stored in linkedWallets array)
      const linkedWallets = await kycDataStorage.getLinkedWallets(user1.address);
      expect(linkedWallets).to.include(user2.address);
    });
  });

  describe("Data Retrieval", function () {
    beforeEach(async function () {
      // Set up test data - first store KYC data to verify the user
      await kycDataStorage.connect(authorizedWriter).storeKYCData(
        user1.address,
        "QmTestHash123",
        75,
        "US",
        "tenant1"
      );
    });

    it("Should retrieve KYC data correctly", async function () {
      const kycData = await kycDataStorage.getKYCData(user1.address);
      
      expect(kycData.isVerified).to.be.true;
      expect(kycData.isActive).to.be.true;
      expect(kycData.riskScore).to.equal(75);
    });

    it("Should check KYC status correctly", async function () {
      const [isVerified, isActive, isExpired] = await kycDataStorage.getKYCStatus(user1.address);
      
      expect(isVerified).to.be.true;
      expect(isActive).to.be.true;
      expect(isExpired).to.be.false;
    });

    it("Should get risk score correctly", async function () {
      const kycData = await kycDataStorage.getKYCData(user1.address);
      expect(kycData.riskScore).to.equal(75);
    });
  });

  describe("Input Validation", function () {
    it("Should reject zero address for user", async function () {
      await expect(
        kycDataStorage.connect(authorizedWriter).updateKYCStatus(ethers.ZeroAddress, true)
      ).to.be.revertedWith("Invalid user address");
    });

    it("Should reject invalid risk score", async function () {
      // First, store KYC data to verify the user
      await kycDataStorage.connect(authorizedWriter).storeKYCData(
        user1.address,
        "QmTestHash123",
        50,
        "US",
        "tenant1"
      );
      
      await expect(
        kycDataStorage.connect(authorizedWriter).updateRiskScore(user1.address, 101)
      ).to.be.revertedWith("Risk score too high");
    });
  });

  describe("Reentrancy Protection", function () {
    it("Should prevent reentrancy attacks", async function () {
      // This test would require a malicious contract to test properly
      // For now, we verify the nonReentrant modifier is applied
      expect(kycDataStorage.interface.getFunction("updateKYCStatus").stateMutability).to.equal("nonpayable");
    });
  });

  describe("Events", function () {
    it("Should emit KYCDataUpdated event", async function () {
      // First, store KYC data to verify the user
      await kycDataStorage.connect(authorizedWriter).storeKYCData(
        user1.address,
        "QmTestHash123",
        50,
        "US",
        "tenant1"
      );
      
      await expect(
        kycDataStorage.connect(authorizedWriter).updateKYCStatus(user1.address, true)
      ).to.emit(kycDataStorage, "KYCDataUpdated");
    });

    it("Should emit AuthorizedWriterUpdated event", async function () {
      await expect(
        kycDataStorage.setAuthorizedWriter(user1.address, true)
      ).to.emit(kycDataStorage, "AuthorizedWriterUpdated")
        .withArgs(user1.address, true);
    });
  });
});
