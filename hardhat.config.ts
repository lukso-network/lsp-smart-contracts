import { HardhatUserConfig } from "hardhat/config";

import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-web3";

import "@typechain/hardhat";
import "hardhat-packager";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    // public L14 test network
    l14: {
      url: "http://34.76.61.201:8545", // bootnode
      chainId: 22,
      // accounts: [privateKey1, privateKey2, ...]
    },
    // ephemeral network
    // l15: {
    //   url: "http://35.198.139.247:8565", // bootnode
    //   chainId: null
    // }
  },
  solidity: {
    version: "0.8.7",
    settings: {
      optimizer: {
        enabled: true,
        /**
         * Optimize for how many times you intend to run the code.
         * Lower values will optimize more for initial deployment cost, higher
         * values will optimize more for high-frequency usage.
         * @see https://docs.soliditylang.org/en/v0.8.6/internals/optimizer.html#opcode-based-optimizer-module
         */
        runs: 1000,
      },
    },
  },
  packager: {
    // What contracts to keep the artifacts and the bindings for.
    contracts: [
      // Standard version
      // ------------------
      "UniversalProfile",
      "KeyManager",
      "UniversalReceiverDelegate",
      "LSP7",
      "LSP7CappedSupply",
      "LSP8",
      "LSP8CappedSupply",
      // Proxy version
      // ------------------
      "UniversalProfileInit",
      "KeyManagerInit",
      "UniversalReceiverDelegateInit",
      "LSP7Init",
      "LSP7CappedSupplyInit",
      "LSP8Init",
      "LSP8CappedSupplyInit",
      // ERC Compatible tokens
      // ------------------
      "LSP7CompatibilityForERC20",
      "LSP8CompatibilityForERC721",
      // Tools
      // ------------------
      "Create2Factory",
    ],
    // Whether to include the TypeChain factories or not.
    // If this is enabled, you need to run the TypeChain files through the TypeScript compiler before shipping to the registry.
    includeFactories: true,
  },
  paths: {
    artifacts: "build/artifacts",
  },
  typechain: {
    outDir: "build/types",
    target: "ethers-v5",
  },
};

export default config;
