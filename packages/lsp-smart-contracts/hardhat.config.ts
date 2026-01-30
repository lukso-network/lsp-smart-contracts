import hardhatToolboxMochaEthers from '@nomicfoundation/hardhat-toolbox-mocha-ethers';
import { task } from 'hardhat/config';
import type { SolidityUserConfig } from 'hardhat/types/config';
import type { HardhatUserConfig } from 'hardhat/config';
import { ArgumentType } from 'hardhat/types/arguments';

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

const LSP8_COMPILER_SETTINGS: SolidityUserConfig = {
  version: '0.8.27',
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

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthers],
  solidity: {
    compilers: [DEFAULT_COMPILER_SETTINGS, LSP8_COMPILER_SETTINGS, LSP7_VIA_IR_SETTINGS],
    overrides: {
      // dependencies
      '@lukso/lsp4-contracts/contracts/LSP4Utils.sol': VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/LSP7DigitalAsset.sol': LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/LSP7DigitalAssetInitAbstract.sol': LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/presets/LSP7Mintable.sol': LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/presets/LSP7MintableInit.sol': LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/presets/LSP7CappedBalance.sol': LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/presets/LSP7CappedBalanceInit.sol': LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/presets/LSP7CappedSupply.sol': LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/presets/LSP7CappedSupplyInit.sol': LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/presets/LSP7NonTransferable.sol': LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/presets/LSP7NonTransferableInit.sol': LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/extensions/LSP7Burnable.sol': LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/extensions/LSP7BurnableInitAbstract.sol':
        LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/extensions/LSP7Allowlist/ILSP7Allowlist.sol':
        LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/extensions/LSP7Allowlist/LSP7AllowlistAbstract.sol':
        LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/extensions/LSP7AllowlistAbstract.sol': LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/extensions/LSP7Allowlist/LSP7AllowlistInitAbstract.sol':
        LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/extensions/LSP7CappedBalance/ILSP7CappedBalance.sol':
        LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/extensions/LSP7CappedBalance/LSP7CappedBalanceAbstract.sol':
        LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/extensions/LSP7CappedBalance/LSP7CappedBalanceInitAbstract.sol':
        LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/extensions/LSP7CappedSupply/ILSP7CappedSupply.sol':
        LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/extensions/LSP7CappedSupply/LSP7CappedSupplyAbstract.sol':
        LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/extensions/LSP7CappedSupply/LSP7CappedSupplyInitAbstract.sol':
        LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/extensions/LSP7Mintable/ILSP7Mintable.sol':
        LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/extensions/LSP7Mintable/LSP7MintableAbstract.sol':
        LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/extensions/LSP7Mintable/LSP7MintableInitAbstract.sol':
        LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/extensions/LSP7NonTransferable/ILSP7NonTransferable.sol':
        LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/extensions/LSP7NonTransferable/LSP7NonTransferableAbstract.sol':
        LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/extensions/LSP7NonTransferable/LSP7NonTransferableInitAbstract.sol':
        LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/extensions/LSP7Votes.sol': LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp7-contracts/contracts/extensions/LSP7VotesInitAbstract.sol': LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol': LSP8_COMPILER_SETTINGS,
      '@lukso/lsp8-contracts/contracts/LSP8IdentifiableDigitalAssetInitAbstract.sol':
        LSP8_COMPILER_SETTINGS,
      '@lukso/lsp8-contracts/contracts/presets/LSP8Mintable.sol': LSP8_COMPILER_SETTINGS,
      '@lukso/lsp8-contracts/contracts/presets/LSP8MintableInit.sol': LSP8_COMPILER_SETTINGS,
      '@lukso/lsp8-contracts/contracts/presets/LSP8MintableInitAbstract.sol':
        LSP8_COMPILER_SETTINGS,
      '@lukso/lsp8-contracts/contracts/extensions/LSP8Burnable.sol': LSP8_COMPILER_SETTINGS,
      '@lukso/lsp8-contracts/contracts/extensions/LSP8BurnableInitAbstract.sol':
        LSP8_COMPILER_SETTINGS,
      '@lukso/lsp8-contracts/contracts/extensions/LSP8CappedSupply.sol': LSP8_COMPILER_SETTINGS,
      '@lukso/lsp8-contracts/contracts/extensions/LSP8CappedSupplyInitAbstract.sol':
        LSP8_COMPILER_SETTINGS,
      '@lukso/lsp8-contracts/contracts/extensions/LSP8Enumerable.sol': LSP8_COMPILER_SETTINGS,
      '@lukso/lsp8-contracts/contracts/extensions/LSP8EnumerableInitAbstract.sol':
        LSP8_COMPILER_SETTINGS,
      '@lukso/lsp8-contracts/contracts/extensions/LSP8Votes.sol': LSP8_COMPILER_SETTINGS,
      '@lukso/lsp8-contracts/contracts/extensions/LSP8VotesConstants.sol': LSP8_COMPILER_SETTINGS,
      '@lukso/lsp8-contracts/contracts/extensions/LSP8VotesInitAbstract.sol':
        LSP8_COMPILER_SETTINGS,
      '@lukso/lsp1delegate-contracts/contracts/LSP1UniversalReceiverDelegateUP.sol':
        LSP7_VIA_IR_SETTINGS,
      '@lukso/lsp1delegate-contracts/contracts/LSP1UniversalReceiverDelegateVault.sol':
        LSP7_VIA_IR_SETTINGS,
      // imports into lsp-smart-contracts package
      'contracts/LSP4DigitalAssetMetadata/LSP4Utils.sol': VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/LSP7DigitalAsset.sol': LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/LSP7DigitalAssetInitAbstract.sol': LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/presets/LSP7Mintable.sol': LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/presets/LSP7MintableInit.sol': LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/presets/LSP7CappedBalance.sol': LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/presets/LSP7CappedBalanceInit.sol': LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/presets/LSP7CappedSupply.sol': LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/presets/LSP7CappedSupplyInit.sol': LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/presets/LSP7NonTransferable.sol': LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/presets/LSP7NonTransferableInit.sol': LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol': LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/extensions/LSP7BurnableInitAbstract.sol': LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/extensions/LSP7Allowlist/ILSP7Allowlist.sol':
        LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/extensions/LSP7Allowlist/LSP7AllowlistAbstract.sol':
        LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/extensions/LSP7Allowlist/LSP7AllowlistInitAbstract.sol':
        LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/extensions/LSP7CappedBalance/ILSP7CappedBalance.sol':
        LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/extensions/LSP7CappedBalance/LSP7CappedBalanceAbstract.sol':
        LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/extensions/LSP7CappedBalance/LSP7CappedBalanceInitAbstract.sol':
        LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/extensions/LSP7CappedSupply/ILSP7CappedSupply.sol':
        LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/extensions/LSP7CappedSupply/LSP7CappedSupplyAbstract.sol':
        LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/extensions/LSP7CappedSupply/LSP7CappedSupplyInitAbstract.sol':
        LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/extensions/LSP7Mintable/ILSP7Mintable.sol': LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/extensions/LSP7Mintable/LSP7MintableAbstract.sol':
        LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/extensions/LSP7Mintable/LSP7MintableInitAbstract.sol':
        LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/extensions/LSP7NonTransferable/ILSP7NonTransferable.sol':
        LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/extensions/LSP7NonTransferable/LSP7NonTransferableAbstract.sol':
        LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/extensions/LSP7NonTransferable/LSP7NonTransferableInitAbstract.sol':
        LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/extensions/LSP7Votes.sol': LSP7_VIA_IR_SETTINGS,
      'contracts/LSP7DigitalAsset/extensions/LSP7VotesInitAbstract.sol': LSP7_VIA_IR_SETTINGS,
      'contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol':
        LSP7_VIA_IR_SETTINGS,
      'contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateVault/LSP1UniversalReceiverDelegateVault.sol':
        LSP7_VIA_IR_SETTINGS,
      'contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol':
        LSP8_COMPILER_SETTINGS,
      'contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAssetInitAbstract.sol':
        LSP8_COMPILER_SETTINGS,
      'contracts/LSP8IdentifiableDigitalAsset/presets/LSP8Mintable.sol': LSP8_COMPILER_SETTINGS,
      'contracts/LSP8IdentifiableDigitalAsset/presets/LSP8MintableInit.sol': LSP8_COMPILER_SETTINGS,
      'contracts/LSP8IdentifiableDigitalAsset/presets/LSP8MintableInitAbstract.sol':
        LSP8_COMPILER_SETTINGS,
      'contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Burnable.sol': LSP8_COMPILER_SETTINGS,
      'contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8BurnableInitAbstract.sol':
        LSP8_COMPILER_SETTINGS,
      'contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8CappedSupply.sol':
        LSP8_COMPILER_SETTINGS,
      'contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8CappedSupplyInitAbstract.sol':
        LSP8_COMPILER_SETTINGS,
      'contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol':
        LSP8_COMPILER_SETTINGS,
      'contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8EnumerableInitAbstract.sol':
        LSP8_COMPILER_SETTINGS,
      'contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8VotesInitAbstract.sol':
        LSP8_COMPILER_SETTINGS,
      'contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Votes.sol': LSP8_COMPILER_SETTINGS,
      'contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Allowlist/ILSP8Allowlist.sol':
        LSP8_COMPILER_SETTINGS,
      'contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8CappedBalance/ILSP8CappedBalance.sol':
        LSP8_COMPILER_SETTINGS,
      'contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8CappedSupply/ILSP8CappedSupply.sol':
        LSP8_COMPILER_SETTINGS,
      'contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Mintable/ILSP8Mintable.sol':
        LSP8_COMPILER_SETTINGS,
      'contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable/ILSP8NonTransferable.sol':
        LSP8_COMPILER_SETTINGS,
      'contracts/LSP8IdentifiableDigitalAsset/CustomizableLSP8Token.sol': LSP8_COMPILER_SETTINGS,
      'contracts/LSP8IdentifiableDigitalAsset/CustomizableLSP8TokenInit.sol':
        LSP8_COMPILER_SETTINGS,
      '@lukso/lsp8-contracts/contracts/CustomizableLSP8Token.sol': LSP8_COMPILER_SETTINGS,
      '@lukso/lsp8-contracts/contracts/CustomizableLSP8TokenInit.sol': LSP8_COMPILER_SETTINGS,
      '@lukso/lsp8-contracts/contracts/extensions/LSP8Allowlist/ILSP8Allowlist.sol':
        LSP8_COMPILER_SETTINGS,
      '@lukso/lsp8-contracts/contracts/extensions/LSP8Allowlist/LSP8AllowlistAbstract.sol':
        LSP8_COMPILER_SETTINGS,
      '@lukso/lsp8-contracts/contracts/extensions/LSP8Allowlist/LSP8AllowlistInitAbstract.sol':
        LSP8_COMPILER_SETTINGS,
      '@lukso/lsp8-contracts/contracts/extensions/LSP8CappedBalance/ILSP8CappedBalance.sol':
        LSP8_COMPILER_SETTINGS,
      '@lukso/lsp8-contracts/contracts/extensions/LSP8CappedBalance/LSP8CappedBalanceAbstract.sol':
        LSP8_COMPILER_SETTINGS,
      '@lukso/lsp8-contracts/contracts/extensions/LSP8CappedBalance/LSP8CappedBalanceInitAbstract.sol':
        LSP8_COMPILER_SETTINGS,
      '@lukso/lsp8-contracts/contracts/extensions/LSP8Mintable/ILSP8Mintable.sol':
        LSP8_COMPILER_SETTINGS,
      '@lukso/lsp8-contracts/contracts/extensions/LSP8Mintable/LSP8MintableAbstract.sol':
        LSP8_COMPILER_SETTINGS,
      '@lukso/lsp8-contracts/contracts/extensions/LSP8Mintable/LSP8MintableInitAbstract.sol':
        LSP8_COMPILER_SETTINGS,
      '@lukso/lsp8-contracts/contracts/extensions/LSP8NonTransferable/ILSP8NonTransferable.sol':
        LSP8_COMPILER_SETTINGS,
      '@lukso/lsp8-contracts/contracts/extensions/LSP8NonTransferable/LSP8NonTransferableAbstract.sol':
        LSP8_COMPILER_SETTINGS,
      '@lukso/lsp8-contracts/contracts/extensions/LSP8NonTransferable/LSP8NonTransferableInitAbstract.sol':
        LSP8_COMPILER_SETTINGS,
      // Mock contracts for testing
      'contracts/Mocks/Tokens/LSP7CappedSupplyTester.sol': LSP7_VIA_IR_SETTINGS,
      'contracts/Mocks/Tokens/LSP7CappedSupplyInitTester.sol': LSP7_VIA_IR_SETTINGS,
      'contracts/Mocks/Tokens/LSP7Tester.sol': LSP7_VIA_IR_SETTINGS,
      'contracts/Mocks/Tokens/LSP7InitTester.sol': LSP7_VIA_IR_SETTINGS,
      'contracts/Mocks/Tokens/LSP7MintWhenDeployed.sol': LSP7_VIA_IR_SETTINGS,
      'contracts/Mocks/Tokens/LSP8BurnableInitTester.sol': LSP8_COMPILER_SETTINGS,
      'contracts/Mocks/Tokens/LSP8BurnableTester.sol': LSP8_COMPILER_SETTINGS,
      'contracts/Mocks/Tokens/LSP8CappedSupplyInitTester.sol': LSP8_COMPILER_SETTINGS,
      'contracts/Mocks/Tokens/LSP8CappedSupplyTester.sol': LSP8_COMPILER_SETTINGS,
      'contracts/Mocks/Tokens/LSP8EnumerableInitTester.sol': LSP8_COMPILER_SETTINGS,
      'contracts/Mocks/Tokens/LSP8EnumerableTester.sol': LSP8_COMPILER_SETTINGS,
      'contracts/Mocks/Tokens/LSP8InitTester.sol': LSP8_COMPILER_SETTINGS,
      'contracts/Mocks/Tokens/LSP8Tester.sol': LSP8_COMPILER_SETTINGS,
      'contracts/Mocks/Tokens/LSP8TransferOwnerChange.sol': LSP8_COMPILER_SETTINGS,
    },
  },
  tasks: [
    task(
      'gas-benchmark',
      'Benchmark gas usage of the smart contracts based on predefined scenarios',
    )
      .addOption({
        name: 'compare',
        description:
          'The `.json` file that contains the gas costs of the currently compiled contracts (e.g: current working branch)',
        type: ArgumentType.FILE,
        defaultValue: 'gas_benchmark_after.json',
      })
      .addOption({
        name: 'against',
        description:
          'The `.json` file that contains the gas costs to compare against (e.g: the `develop` branch)',
        type: ArgumentType.FILE,
        defaultValue: 'gas_benchmark_before.json',
      })
      .setAction(() => import('./tasks/gas-benchmark.js'))
      .build(),
  ],
};

export default config;
