require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20", // Try newer version
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000, // Increase runs
      },
      viaIR: true,
      evmVersion: "london" // Permanently set to London EVM for Route07 compatibility
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
      url: process.env.NEXT_PUBLIC_RPC_URL || "https://thetapi.route07.com",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID) || 336699,
      gasPrice: 20000000000, // 20 gwei
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
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
