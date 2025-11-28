import type { HardhatUserConfig } from 'hardhat/config';
import hardhatToolboxMochaEthers from '@nomicfoundation/hardhat-toolbox-mocha-ethers';
import hardhatPackager from '@lukso/hardhat-packager-v3';

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthers, hardhatPackager],
  packager: {
    contracts: ['ILSP1UniversalReceiver', 'ILSP1UniversalReceiverDelegate'],
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
