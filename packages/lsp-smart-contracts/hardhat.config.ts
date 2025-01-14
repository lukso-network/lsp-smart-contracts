import { HardhatUserConfig } from 'hardhat/config';
import { NetworkUserConfig } from 'hardhat/types';
import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

/**
 * this package includes:
 *  - @nomiclabs/hardhat-ethers
 *  - @nomicfoundation/hardhat-chai-matchers
 *  - @nomicfoundation/hardhat-network-helpers
 *  - @nomiclabs/hardhat-etherscan
 *  - @typechain/hardhat
 *  - solidity-coverage
 */
import '@nomicfoundation/hardhat-toolbox';

// additional hardhat plugins
import 'hardhat-packager';
import 'hardhat-contract-sizer';
import 'hardhat-deploy';

// custom built hardhat plugins for CI
import './scripts/ci/docs-generate';
import './scripts/ci/gas_benchmark';
import './scripts/ci/check-deployer-balance';
import './scripts/ci/verify-all-contracts';

// Typescript types for web3.js
import '@nomiclabs/hardhat-web3';

/**
 * @dev uncomment to generate contract docs in Markdown
 */
import '@b00ste/hardhat-dodoc';
import { dodocConfig } from './dodoc/config';

dotenvConfig({ path: resolve(__dirname, './.env') });

const DEFAULT_COMPILER_SETTINGS = {
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

const VIA_IR_SETTINGS = {
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

function getTestnetChainConfig(): NetworkUserConfig {
  const config: NetworkUserConfig = {
    live: true,
    url: 'https://rpc.testnet.lukso.network',
    chainId: 4201,
    saveDeployments: true,
    tags: ['standard', 'base'],
  };

  if (process.env.CONTRACT_VERIFICATION_TESTNET_PK !== undefined) {
    config['accounts'] = [process.env.CONTRACT_VERIFICATION_TESTNET_PK];
  }

  return config;
}

function getMainnetChainConfig(): NetworkUserConfig {
  const config: NetworkUserConfig = {
    live: true,
    url: 'https://42.rpc.thirdweb.com',
    chainId: 42,
    saveDeployments: true,
    // We do not deploy the standard contracts on mainnet for the following reasons:
    // 1) standard contracts are expensive to deploy on mainnet
    // 2) user's universal profiles use the minimal proxy pattern,
    //
    // therefore we only need the base contracts to be deployed on mainnet.
    tags: ['base'],
  };

  if (process.env.CONTRACT_VERIFICATION_MAINNET_PK !== undefined) {
    config['accounts'] = [process.env.CONTRACT_VERIFICATION_MAINNET_PK];
  }

  return config;
}

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      live: false,
      saveDeployments: true,
      allowBlocksWithSameTimestamp: true,
    },
    luksoTestnet: getTestnetChainConfig(),
    luksoMainnet: getMainnetChainConfig(),
  },
  namedAccounts: {
    owner: 0,
  },
  deterministicDeployment: {
    luksoTestnet: {
      // Nick Factory. See https://github.com/Arachnid/deterministic-deployment-proxy
      factory: '0x4e59b44847b379578588920ca78fbf26c0b4956c',
      deployer: '0x3fab184622dc19b6109349b94811493bf2a45362',
      funding: '0x0000000000000000000000000000000000000000000000000000000000000000',
      signedTx:
        '0xf8a58085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf31ba02222222222222222222222222222222222222222222222222222222222222222a02222222222222222222222222222222222222222222222222222222222222222',
    },
  },
  etherscan: {
    apiKey: 'no-api-key-needed',
    customChains: [
      {
        network: 'luksoTestnet',
        chainId: 4201,
        urls: {
          apiURL: 'https://api.explorer.execution.testnet.lukso.network/api',
          browserURL: 'https://explorer.execution.testnet.lukso.network/',
        },
      },
      {
        network: 'luksoMainnet',
        chainId: 42,
        urls: {
          apiURL: 'https://api.explorer.execution.mainnet.lukso.network/api',
          browserURL: 'https://explorer.execution.mainnet.lukso.network/',
        },
      },
    ],
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    gasPrice: 21,
    excludeContracts: ['Helpers/'],
    src: './contracts',
    showMethodSig: true,
  },
  solidity: {
    compilers: [DEFAULT_COMPILER_SETTINGS],
    overrides: {
      '@lukso/lsp4-contracts/contracts/LSP4Utils.sol': VIA_IR_SETTINGS,
      'contracts/LSP4DigitalAssetMetadata/LSP4Utils.sol': VIA_IR_SETTINGS,
    },
  },
  mocha: {
    timeout: 10000000,
  },
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
      'LSP7Votes',
      'LSP7CappedSupply',
      'LSP7Mintable',
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
      'LSP7CappedSupplyInitAbstract',
      'LSP7MintableInit',
      'LSP8IdentifiableDigitalAssetInitAbstract',
      'LSP8BurnableInitAbstract',
      'LSP8CappedSupplyInitAbstract',
      'LSP8EnumerableInitAbstract',
      'LSP8VotesInitAbstract',
      'LSP8MintableInit',
      'LSP9VaultInit',
      // Tools
      // ------------------
      'LSP23LinkedContractsFactory',
      'LSP26FollowerSystem',
    ],
    // Whether to include the TypeChain factories or not.
    // If this is enabled, you need to run the TypeChain files through the TypeScript compiler before shipping to the registry.
    // includeFactories: true,
  },
  paths: {
    artifacts: 'artifacts',
    tests: 'tests',
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v6',
  },
  dodoc: dodocConfig,
};

export default config;
