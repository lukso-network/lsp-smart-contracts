import 'dotenv/config';
import type { HardhatUserConfig } from 'hardhat/config';
import hardhatToolboxMochaEthers from '@nomicfoundation/hardhat-toolbox-mocha-ethers';
import hardhatIgnitionEthers from '@nomicfoundation/hardhat-ignition-ethers';
import hardhatPackager from '@lukso/hardhat-packager-v3';
import hardhatVerifyBalance from '@lukso/hardhat-verify-balance';

const config: HardhatUserConfig = {
  plugins: [
    hardhatToolboxMochaEthers,
    hardhatIgnitionEthers,
    hardhatPackager,
    hardhatVerifyBalance,
  ],
  packager: {
    contracts: ['UniversalProfile', 'UniversalProfileInit'],
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
  verify: {
    etherscan: {
      apiKey: 'no-api-key-needed',
    },
  },
  chainDescriptors: {
    4201: {
      name: 'luksoTestnet',
      blockExplorers: {
        etherscan: {
          name: 'LUKSO Testnet Explorer',
          url: 'https://explorer.execution.testnet.lukso.network',
          apiUrl: 'https://api.explorer.execution.testnet.lukso.network/api',
        },
      },
    },
    42: {
      name: 'luksoMainnet',
      blockExplorers: {
        etherscan: {
          name: 'LUKSO Mainnet Explorer',
          url: 'https://explorer.execution.mainnet.lukso.network',
          apiUrl: 'https://api.explorer.execution.mainnet.lukso.network/api',
        },
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
