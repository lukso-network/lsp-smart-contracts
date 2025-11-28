import type { HardhatUserConfig } from 'hardhat/config';
import hardhatToolboxMochaEthers from '@nomicfoundation/hardhat-toolbox-mocha-ethers';
import hardhatPackager from '@lukso/hardhat-packager-v3';

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthers, hardhatPackager],
  packager: {
    contracts: [
      // Base
      'LSP7DigitalAsset',
      'LSP7DigitalAssetInitAbstract',

      // Extensions
      'LSP7AllowlistAbstract',
      'LSP7AllowlistInitAbstract',
      'LSP7Mintable',
      'LSP7MintableAbstract',
      'LSP7MintableInit',
      'LSP7MintableInitAbstract',
      'LSP7CappedBalance',
      'LSP7CappedBalanceAbstract',
      'LSP7CappedBalanceInit',
      'LSP7CappedBalanceInitAbstract',
      'LSP7CappedSupply',
      'LSP7CappedSupplyAbstract',
      'LSP7CappedSupplyInit',
      'LSP7CappedSupplyInitAbstract',
      'LSP7NonTransferable',
      'LSP7NonTransferableAbstract',
      'LSP7NonTransferableInit',
      'LSP7NonTransferableInitAbstract',
      'LSP7Burnable',
      'LSP7BurnableInitAbstract',
      'LSP7Votes',
      'LSP7VotesInitAbstract',

      // Interfaces
      'ILSP7DigitalAsset',
      'ILSP7Mintable',
      'ILSP7Allowlist',
      'ILSP7CappedBalance',
      'ILSP7CappedSupply',
      'ILSP7NonTransferable',
    ],
  },
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
