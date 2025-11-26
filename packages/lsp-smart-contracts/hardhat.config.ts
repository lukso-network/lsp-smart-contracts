import type { HardhatUserConfig } from 'hardhat/config';
import hardhatToolboxMochaEthers from '@nomicfoundation/hardhat-toolbox-mocha-ethers';
import hardhatPackager from '@lukso/hardhat-packager-v3';
import type { SolidityUserConfig } from 'hardhat/types/config';

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
  plugins: [hardhatToolboxMochaEthers, hardhatPackager],
  packager: {
    // What contracts to keep the artifacts and the bindings for.
    contracts: [
      // Standard version
      // ------------------
      'UniversalProfile',
      'LSP0ERC725Account',
      'LSP1UniversalReceiverDelegateUP',
      'LSP1UniversalReceiverDelegateVault',
      'LSP4DigitalAssetMetadata',
      'LSP6KeyManager',
      'LSP7DigitalAsset',
      'LSP7AllowlistAbstract',
      'LSP7Mintable',
      'LSP7MintableAbstract',
      'LSP7CappedBalance',
      'LSP7CappedBalanceAbstract',
      'LSP7CappedSupply',
      'LSP7CappedSupplyAbstract',
      'LSP7NonTransferable',
      'LSP7NonTransferableAbstract',
      'LSP7Burnable',
      'LSP7Votes',
      'LSP8IdentifiableDigitalAsset',
      'LSP8Burnable',
      'LSP8CappedSupply',
      'LSP8Enumerable',
      'LSP8Votes',
      'LSP8Mintable',
      'LSP9Vault',
      'LSP11SocialRecovery',

      // Proxy version
      // ------------------
      'UniversalProfileInit',
      'LSP0ERC725AccountInit',
      'LSP4DigitalAssetMetadataInitAbstract',
      'LSP6KeyManagerInit',
      'LSP7DigitalAssetInitAbstract',
      'LSP7AllowlistInitAbstract',
      'LSP7MintableInit',
      'LSP7MintableInitAbstract',
      'LSP7CappedBalanceInit',
      'LSP7CappedBalanceInitAbstract',
      'LSP7CappedSupplyInit',
      'LSP7CappedSupplyInitAbstract',
      'LSP7NonTransferableInit',
      'LSP7NonTransferableInitAbstract',
      'LSP7BurnableInitAbstract',
      'LSP7VotesInitAbstract',
      'LSP8IdentifiableDigitalAssetInitAbstract',
      'LSP8BurnableInitAbstract',
      'LSP8CappedSupplyInitAbstract',
      'LSP8EnumerableInitAbstract',
      'LSP8VotesInitAbstract',
      'LSP8MintableInit',
      'LSP9VaultInit',

      // Interfaces
      // ------------------
      'ILSP7DigitalAsset',
      'ILSP7Mintable',
      'ILSP7Allowlist',
      'ILSP7CappedBalance',
      'ILSP7CappedSupply',
      'ILSP7NonTransferable',

      // Tools
      // ------------------
      'LSP23LinkedContractsFactory',
      'LSP26FollowerSystem',
    ],
    // Whether to include the typechain-like factories or not.
    // If this is enabled, you need to run the typechain-like files through the TypeScript compiler before shipping to the registry.
    // includeTypes: true,
    // includeFactories: true,
  },
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
