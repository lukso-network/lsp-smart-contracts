require("@nomiclabs/hardhat-waffle");
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    // public L14 test network
    l14: {
      url: "http://34.76.61.201:8545", // bootnode
      chainId: 22
      // accounts: [privateKey1, privateKey2, ...]
    },
    // ephemeral network
    l15: {
      url: "",
      chainId: ""
    }
  },
  solidity: {
    version: "0.8.6",
    settings: {
      optimizer: {
        enabled: true,
        /**
         * Optimize for how many times you intend to run the code.
         * Lower values will optimize more for initial deployment cost, higher
         * values will optimize more for high-frequency usage.
         * @see https://docs.soliditylang.org/en/v0.8.6/internals/optimizer.html#opcode-based-optimizer-module
         */
        runs: 1000
      }
    }
  },
  paths: {
    sources: "./contracts",
    // tests: "./test",
    cache: "./cache",
    // artifacts: "./artifacts"
  },
  mocha: {
    timeout: 20000
  }
};
