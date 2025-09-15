const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MultisigManager", function () {
  let multisigManager;
  let owner;
  let signer1;
  let signer2;
  let signer3;
  let unauthorizedUser;

  beforeEach(async function () {
    [owner, signer1, signer2, signer3, unauthorizedUser] = await ethers.getSigners();
    
    const MultisigManager = await ethers.getContractFactory("MultisigManager");
    multisigManager = await MultisigManager.deploy();
    await multisigManager.waitForDeployment();
    
    // Set up authorized signers
    await multisigManager.setAuthorizedSigner(signer1.address, true);
    await multisigManager.setAuthorizedSigner(signer2.address, true);
    await multisigManager.setAuthorizedSigner(signer3.address, true);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await multisigManager.owner()).to.equal(owner.address);
    });

    it("Should initialize with multisig disabled", async function () {
      const config = await multisigManager.getMultisigConfig("testFunction");
      expect(config.isEnabled).to.be.false;
    });
  });

  describe("Multisig Configuration", function () {
    it("Should enable multisig with correct parameters", async function () {
      await multisigManager.enableMultisig("testFunction", 2, 300); // function name, 2 signatures, 5 min timelock
      
      const config = await multisigManager.getMultisigConfig("testFunction");
      expect(config.isEnabled).to.be.true;
      expect(config.requiredSignatures).to.equal(2);
      expect(config.timelockDuration).to.equal(300);
    });

    it("Should disable multisig", async function () {
      await multisigManager.enableMultisig("testFunction", 2, 300);
      await multisigManager.disableMultisig("testFunction");
      
      const config = await multisigManager.getMultisigConfig("testFunction");
      expect(config.isEnabled).to.be.false;
    });

    it("Should not allow invalid configuration", async function () {
      await expect(
        multisigManager.enableMultisig("testFunction", 0, 300)
      ).to.be.revertedWith("Invalid requiredSignatures: below minimum");
    });
  });

  describe("Signer Management", function () {
    it("Should add authorized signer", async function () {
      await expect(
        multisigManager.setAuthorizedSigner(unauthorizedUser.address, true)
      ).to.emit(multisigManager, "AuthorizedSignerUpdated")
        .withArgs(unauthorizedUser.address, true);
    });

    it("Should remove authorized signer", async function () {
      await expect(
        multisigManager.setAuthorizedSigner(signer1.address, false)
      ).to.emit(multisigManager, "AuthorizedSignerUpdated")
        .withArgs(signer1.address, false);
    });

    it("Should check if address is authorized signer", async function () {
      expect(await multisigManager.isAuthorizedSigner(signer1.address)).to.be.true;
      expect(await multisigManager.isAuthorizedSigner(unauthorizedUser.address)).to.be.false;
    });
  });

  describe("Operation Management", function () {
    beforeEach(async function () {
      await multisigManager.enableMultisig("testFunction", 3, 60); // function name, 3 signatures, 1 min timelock
    });

    it("Should propose operation", async function () {
      const target = signer1.address; // Use a different address as target
      const data = "0x1234";
      const functionName = "testFunction";
      
      await expect(
        multisigManager.proposeOperation(functionName, target, data)
      ).to.emit(multisigManager, "OperationProposed");
    });

    it("Should sign operation", async function () {
      const target = signer1.address;
      const data = "0x1234";
      const functionName = "testFunction";
      
      const tx = await multisigManager.proposeOperation(functionName, target, data);
      const receipt = await tx.wait();
      const operationId = receipt.logs[0].args.operationId;
      
      await expect(
        multisigManager.connect(signer1).signOperation(operationId)
      ).to.emit(multisigManager, "OperationSigned");
    });

    it("Should not allow duplicate signatures", async function () {
      const target = signer1.address;
      const data = "0x1234";
      const functionName = "testFunction";
      
      const tx = await multisigManager.proposeOperation(functionName, target, data);
      const receipt = await tx.wait();
      const operationId = receipt.logs[0].args.operationId;
      
      await multisigManager.connect(signer1).signOperation(operationId);
      
      await expect(
        multisigManager.connect(signer1).signOperation(operationId)
      ).to.be.revertedWith("Already signed");
    });

    it("Should execute operation after timelock", async function () {
      const target = signer1.address;
      const data = "0x1234";
      const functionName = "testFunction";
      
      const tx = await multisigManager.proposeOperation(functionName, target, data);
      const receipt = await tx.wait();
      const operationId = receipt.logs[0].args.operationId;
      
      // Sign with required number of signers
      await multisigManager.connect(signer1).signOperation(operationId);
      await multisigManager.connect(signer2).signOperation(operationId);
      
      // Advance time past timelock
      await ethers.provider.send("evm_increaseTime", [61]);
      await ethers.provider.send("evm_mine");
      
      await expect(
        multisigManager.executeOperation(operationId)
      ).to.emit(multisigManager, "OperationExecuted");
    });

    it("Should not execute operation before timelock", async function () {
      const target = signer1.address;
      const data = "0x1234";
      const functionName = "testFunction";
      
      const tx = await multisigManager.proposeOperation(functionName, target, data);
      const receipt = await tx.wait();
      const operationId = receipt.logs[0].args.operationId;
      
      // Sign with required number of signers
      await multisigManager.connect(signer1).signOperation(operationId);
      await multisigManager.connect(signer2).signOperation(operationId);
      
      // Try to execute before timelock expires
      await expect(
        multisigManager.executeOperation(operationId)
      ).to.be.revertedWith("Timelock not expired");
    });
  });

  describe("Access Control", function () {
    it("Should not allow unauthorized user to propose operation", async function () {
      await multisigManager.enableMultisig("testFunction", 2, 60);
      
      await expect(
        multisigManager.connect(unauthorizedUser).proposeOperation(
          "testFunction",
          signer1.address,
          "0x1234"
        )
      ).to.be.revertedWith("Not authorized signer");
    });

    it("Should not allow unauthorized user to sign operation", async function () {
      await multisigManager.enableMultisig("testFunction", 2, 60);
      
      const target = signer1.address;
      const data = "0x1234";
      const functionName = "testFunction";
      
      const tx = await multisigManager.proposeOperation(functionName, target, data);
      const receipt = await tx.wait();
      const operationId = receipt.logs[0].args.operationId;
      
      await expect(
        multisigManager.connect(unauthorizedUser).signOperation(operationId)
      ).to.be.revertedWith("Not authorized signer");
    });
  });

  describe("Input Validation", function () {
    it("Should reject empty function name", async function () {
      await multisigManager.enableMultisig("testFunction", 2, 60);
      
      await expect(
        multisigManager.proposeOperation(
          "",
          signer1.address,
          "0x1234"
        )
      ).to.be.revertedWith("Invalid functionName: empty string");
    });

    it("Should reject zero address target", async function () {
      await multisigManager.enableMultisig("testFunction", 2, 60);
      
      await expect(
        multisigManager.proposeOperation(
          "testFunction",
          ethers.ZeroAddress,
          "0x1234"
        )
      ).to.be.revertedWith("Invalid target: zero address");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await multisigManager.enableMultisig("testFunction", 4, 60);
    });

    it("Should get operation details", async function () {
      const target = signer1.address;
      const data = "0x1234";
      const functionName = "testFunction";
      
      const tx = await multisigManager.proposeOperation(functionName, target, data);
      const receipt = await tx.wait();
      const operationId = receipt.logs[0].args.operationId;
      
      const details = await multisigManager.getOperationDetails(operationId);
      expect(details.target).to.equal(target);
      expect(details.data).to.equal(data);
    });

    it("Should check if operation can be executed", async function () {
      const target = signer1.address;
      const data = "0x1234";
      const functionName = "testFunction";
      
      const tx = await multisigManager.proposeOperation(functionName, target, data);
      const receipt = await tx.wait();
      const operationId = receipt.logs[0].args.operationId;
      
      // Initially should not be executable
      expect(await multisigManager.canExecuteOperation(operationId)).to.be.false;
      
      // Sign with required number of signers
      await multisigManager.connect(signer1).signOperation(operationId);
      await multisigManager.connect(signer2).signOperation(operationId);
      await multisigManager.connect(signer3).signOperation(operationId);
      
      // Still not executable due to timelock
      expect(await multisigManager.canExecuteOperation(operationId)).to.be.false;
      
      // Advance time past timelock
      await ethers.provider.send("evm_increaseTime", [61]);
      await ethers.provider.send("evm_mine");
      
      // Now should be executable
      expect(await multisigManager.canExecuteOperation(operationId)).to.be.true;
    });
  });
});
