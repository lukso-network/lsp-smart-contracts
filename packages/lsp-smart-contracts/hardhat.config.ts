import type { HardhatUserConfig } from 'hardhat/config';
import hardhatToolboxMochaEthers from '@nomicfoundation/hardhat-toolbox-mocha-ethers';
import { SolidityUserConfig } from 'hardhat/types';

// custom built hardhat plugins for CI
// import './scripts/ci/gas_benchmark';
// import './scripts/ci/check-deployer-balance';
// import './scripts/ci/verify-all-contracts';

// Workflow temporarily disabled
// import './scripts/ci/docs-generate';

const DEFAULT_COMPILER_SETTINGS: SolidityUserConfig = {
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
};

const VIA_IR_SETTINGS: SolidityUserConfig = {
  version: '0.8.24',
  settings: {
    viaIR: true,
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
};

const LSP7_VIA_IR_SETTINGS: SolidityUserConfig = {
  version: '0.8.28',
  settings: {
    viaIR: true,
    evmVersion: 'prague',
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
};

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthers],
  solidity: {
    compilers: [DEFAULT_COMPILER_SETTINGS],
    overrides: {
      '@lukso/lsp4-contracts/contracts/LSP4Utils.sol': VIA_IR_SETTINGS,
      'contracts/LSP4DigitalAssetMetadata/LSP4Utils.sol': VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/presets/LSP7Mintable.sol': LSP7_VIA_IR_SETTINGS,
    },
  },
};

export default config;
