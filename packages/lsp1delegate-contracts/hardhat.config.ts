import type { HardhatUserConfig } from 'hardhat/config';
import hardhatToolboxMochaEthers from '@nomicfoundation/hardhat-toolbox-mocha-ethers';
import hardhatIgnitionEthers from '@nomicfoundation/hardhat-ignition-ethers';
import hardhatPackager from '@lukso/hardhat-packager-v3';

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthers, hardhatIgnitionEthers, hardhatPackager],
  packager: {
    contracts: ['LSP1UniversalReceiverDelegateUP', 'LSP1UniversalReceiverDelegateVault'],
  },
  networks: {
    luksoTestnet: {
      type: 'http',
      url: 'https://rpc.testnet.lukso.network',
      chainId: 4201,
      accounts: process.env.CONTRACT_DEPLOYER_TESTNET_PK
        ? [process.env.CONTRACT_DEPLOYER_TESTNET_PK]
        : undefined,
    },
    luksoMainnet: {
      type: 'http',
      url: 'https://rpc.mainnet.lukso.network',
      chainId: 42,
      accounts: process.env.CONTRACT_DEPLOYER_MAINNET_PK
        ? [process.env.CONTRACT_DEPLOYER_MAINNET_PK]
        : undefined,
    },
  },
  ignition: {
    strategyConfig: {
      create2: {
        salt: '0xfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeed',
      },
    },
  },
  solidity: {
    version: '0.8.17',
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
      outputSelection: {
        '*': {
          '*': ['storageLayout'],
        },
      },
    },
  },
};

export default config;
