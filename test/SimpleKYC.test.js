const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Simple KYC Data Storage Test", function () {
  let kycDataStorage;
  let owner;
  let authorizedWriter;
  let user1;

  beforeEach(async function () {
    [owner, authorizedWriter, user1] = await ethers.getSigners();
    
    const KYCDataStorage = await ethers.getContractFactory("KYCDataStorage");
    kycDataStorage = await KYCDataStorage.deploy();
    await kycDataStorage.waitForDeployment();
    
    // Set authorized writer
    await kycDataStorage.setAuthorizedWriter(authorizedWriter.address, true);
  });

  describe("Basic Functionality", function () {
    it("Should deploy successfully", async function () {
      expect(await kycDataStorage.owner()).to.equal(owner.address);
    });

    it("Should allow authorized writer to update KYC status", async function () {
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

    it("Should retrieve KYC data correctly", async function () {
      // First, store KYC data to verify the user
      await kycDataStorage.connect(authorizedWriter).storeKYCData(
        user1.address,
        "QmTestHash123",
        50,
        "US",
        "tenant1"
      );
      
      await kycDataStorage.connect(authorizedWriter).updateKYCStatus(user1.address, true);
      
      const kycData = await kycDataStorage.getKYCData(user1.address);
      expect(kycData.isActive).to.be.true;
    });
  });
});
