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
 *  - hardhat-gas-reporter (is this true? Why do we have it as a separate dependency?)
 *  - @typechain/hardhat
 *  - solidity-coverage
 */
import '@nomicfoundation/hardhat-toolbox';

// additional hardhat plugins
import 'hardhat-packager';
import 'hardhat-contract-sizer';
import 'hardhat-deploy';

// custom built hardhat plugins and scripts
// can be imported here (e.g: docs generation, gas benchmark, etc...)

dotenvConfig({ path: resolve(__dirname, './.env') });

function getTestnetChainConfig(): NetworkUserConfig {
  const config: NetworkUserConfig = {
    live: true,
    url: 'https://rpc.testnet.lukso.network',
    chainId: 4201,
  };

  if (process.env.CONTRACT_VERIFICATION_TESTNET_PK !== undefined) {
    config['accounts'] = [process.env.CONTRACT_VERIFICATION_TESTNET_PK];
  }

  return config;
}

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      live: false,
      saveDeployments: false,
      allowBlocksWithSameTimestamp: true,
    },
    luksoTestnet: getTestnetChainConfig(),
  },
  namedAccounts: {
    owner: 0,
  },
  // uncomment if the contracts from this LSP package must be deployed at deterministic
  // // addresses across multiple chains
  // deterministicDeployment: {
  //   luksoTestnet: {
  //     // Nick Factory. See https://github.com/Arachnid/deterministic-deployment-proxy
  //     factory: '0x4e59b44847b379578588920ca78fbf26c0b4956c',
  //     deployer: '0x3fab184622dc19b6109349b94811493bf2a45362',
  //     funding: '0x0000000000000000000000000000000000000000000000000000000000000000',
  //     signedTx:
  //       '0xf8a58085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf31ba02222222222222222222222222222222222222222222222222222222222222222a02222222222222222222222222222222222222222222222222222222222222222',
  //   },
  // },
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
  packager: {
    // What contracts to keep the artifacts and the bindings for.
    contracts: ['ILSP11SocialRecovery', 'LSP11SocialRecovery'],
    // Whether to include the TypeChain factories or not.
    // If this is enabled, you need to run the TypeChain files through the TypeScript compiler before shipping to the registry.
    includeFactories: true,
  },
  paths: {
    artifacts: 'artifacts',
    tests: 'tests',
  },
  typechain: {
    outDir: 'types',
    target: 'ethers-v6',
  },
  mocha: {
    timeout: 10000000,
  },
};

export default config;
