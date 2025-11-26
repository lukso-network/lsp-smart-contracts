import type { HardhatUserConfig } from 'hardhat/config';
import hardhatToolboxMochaEthers from '@nomicfoundation/hardhat-toolbox-mocha-ethers';
import hardhatPackager from '@lukso/hardhat-packager-v3';

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthers, hardhatPackager],
  packager: {
    contracts: [
      'ILSP8IdentifiableDigitalAsset',
      'LSP8IdentifiableDigitalAsset',
      'LSP8Burnable',
      'LSP8CappedSupply',
      'LSP8Enumerable',
      'LSP8Votes',
      'LSP8Mintable',
      'LSP8IdentifiableDigitalAssetInitAbstract',
      'LSP8BurnableInitAbstract',
      'LSP8CappedSupplyInitAbstract',
      'LSP8EnumerableInitAbstract',
      'LSP8VotesInitAbstract',
      'LSP8MintableInit',
    ],
    // Whether to include the typechain-like factories or not.
    // If this is enabled, you need to run the typechain-like files through the TypeScript compiler before shipping to the registry.
    // includeTypes: true,
    // includeFactories: true,
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
