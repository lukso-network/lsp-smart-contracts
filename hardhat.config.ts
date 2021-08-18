import { HardhatUserConfig } from "hardhat/config";

import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-truffle5";
import "@nomiclabs/hardhat-web3";

import "@typechain/hardhat";
import "hardhat-packager";

const config: HardhatUserConfig = {
  solidity: "0.8.6",
  packager: {
    // What contracts to keep the artifacts and the bindings for.
    contracts: ["LSP3Account", "KeyManager", "BasicUniversalReceiver", "ERC725Account"],
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
