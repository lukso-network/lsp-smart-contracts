import type { HardhatUserConfig } from 'hardhat/config';
import hardhatToolboxMochaEthers from '@nomicfoundation/hardhat-toolbox-mocha-ethers';

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthers],
  solidity: {
    version: '0.8.28',
    settings: {
      evmVersion: 'prague',
      viaIR: true,
      optimizer: {
        enabled: true,
        /**
         * Optimize for how many times you intend to run the code.
         * Lower values will optimize more for initial deployment cost, higher
         * values will optimize more for high-frequency usage.
         * @see https://docs.soliditylang.org/en/v0.8.6/internals/optimizer.html#opcode-based-optimizer-module
         */
        runs: 25000,
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
