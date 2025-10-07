require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20", // Updated to match refactored config
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000, // Increased for better optimization
      },
      viaIR: true, // Enable Yul IR for stack too deep fixes
      evmVersion: "london" // Use London EVM for Route07 compatibility
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    route07: {
      url: "https://rpc.route07.com",
      chainId: 35935,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: "auto",
      gasPrice: "auto",
      timeout: 60000,
      httpHeaders: {
        "Content-Type": "application/json",
      }
    },
    tractsafe: {
      url: "https://tapi.tractsafe.com",
      chainId: 35935,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: "auto",
      gasPrice: "auto",
      timeout: 60000, // 60 seconds timeout for Besu
      httpHeaders: {
        "Content-Type": "application/json",
      }
    },
    // Add other networks as needed
    // sepolia: {
    //   url: process.env.SEPOLIA_URL || "",
    //   accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    // },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
};
