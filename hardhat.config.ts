import { HardhatUserConfig } from "hardhat/config";
import { NetworkUserConfig } from "hardhat/types";
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";

/**
 * this package includes:
 *  - @nomiclabs/hardhat-ethers
 *  - @nomicfoundation/hardhat-chai-matchers
 *  - @nomicfoundation/hardhat-network-helpers
 *  - @nomiclabs/hardhat-etherscan
 *  - @typechain/hardhat
 *  - solidity-coverage
 */
import "@nomicfoundation/hardhat-toolbox";

// additional hardhat plugins
import "hardhat-packager";
import "hardhat-contract-sizer";
import "hardhat-deploy";
import "./scripts/ci/docs-generate";

// Typescript types for web3.js
import "@nomiclabs/hardhat-web3";

/**
 * @dev uncomment to generate contract docs in Markdown
 */
// import "@primitivefi/hardhat-dodoc";

dotenvConfig({ path: resolve(__dirname, "./.env") });

function getL16ChainConfig(): NetworkUserConfig {
  const config: NetworkUserConfig = {
    live: true,
    url: "https://rpc.l16.lukso.network",
    chainId: 2828,
  };

  if (process.env.CONTRACT_VERIFICATION_PK !== undefined) {
    config["accounts"] = [process.env.CONTRACT_VERIFICATION_PK];
  }

  return config;
}

function getTestnetChainConfig(): NetworkUserConfig {
  const config: NetworkUserConfig = {
    live: true,
    url: "https://rpc.testnet.lukso.network",
    chainId: 4201,
  };

  if (process.env.CONTRACT_VERIFICATION_TESTNET_PK !== undefined) {
    config["accounts"] = [process.env.CONTRACT_VERIFICATION_TESTNET_PK];
  }

  return config;
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      live: false,
      saveDeployments: false,
      allowBlocksWithSameTimestamp: true,
    },
    // public L14 test network
    luksoL14: {
      live: true,
      url: "https://rpc.l14.lukso.network",
      chainId: 22,
      //   accounts: [privateKey1, privateKey2, ...]
    },
    luksoL16: getL16ChainConfig(),
    luksoTestnet: getTestnetChainConfig(),
  },
  namedAccounts: {
    owner: 0,
  },
  etherscan: {
    // no API is required to verify contracts
    // via the Blockscout instance of L14 or L16 network
    apiKey: "no-api-key-needed",
    customChains: [
      {
        network: "luksoL14",
        chainId: 22,
        urls: {
          apiURL: "https://blockscout.com/lukso/l14/api",
          browserURL: "https://blockscout.com/lukso/l14",
        },
      },
      {
        network: "luksoL16",
        chainId: 2828,
        urls: {
          apiURL: "https://explorer.execution.l16.lukso.network/api",
          browserURL: "https://explorer.execution.l16.lukso.network/",
        },
      },
      {
        network: "luksoTestnet",
        chainId: 4201,
        urls: {
          apiURL: "https://explorer.execution.testnet.lukso.network/api",
          browserURL: "https://explorer.execution.testnet.lukso.network/",
        },
      },
    ],
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    gasPrice: 21,
    excludeContracts: ["Helpers/"],
    src: "./contracts",
    showMethodSig: true,
  },
  solidity: {
    version: "0.8.15",
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
        "*": {
          "*": ["storageLayout"],
        },
      },
    },
  },
  packager: {
    // What contracts to keep the artifacts and the bindings for.
    contracts: [
      // Standard version
      // ------------------
      "UniversalProfile",
      "LSP0ERC725Account",
      "LSP1UniversalReceiverDelegateUP",
      "LSP1UniversalReceiverDelegateVault",
      "LSP4DigitalAssetMetadata",
      "LSP6KeyManager",
      "LSP7DigitalAsset",
      "LSP7CappedSupply",
      "LSP7Mintable",
      "LSP8IdentifiableDigitalAsset",
      "LSP8CappedSupply",
      "LSP8Mintable",
      "LSP9Vault",
      "LSP11BasicSocialRecovery",
      // Proxy version
      // ------------------
      "UniversalProfileInit",
      "LSP0ERC725AccountInit",
      "LSP4DigitalAssetMetadataInitAbstract",
      "LSP6KeyManagerInit",
      "LSP7DigitalAssetInitAbstract",
      "LSP7CappedSupplyInitAbstract",
      "LSP7MintableInit",
      "LSP8IdentifiableDigitalAssetInitAbstract",
      "LSP8CappedSupplyInitAbstract",
      "LSP8MintableInit",
      "LSP9VaultInit",
      "LSP11BasicSocialRecoveryInit",
      // ERC Compatible tokens
      // ------------------
      "LSP4Compatibility",
      "LSP7CompatibleERC20",
      "LSP7CompatibleERC20InitAbstract",
      "LSP7CompatibleERC20Mintable",
      "LSP7CompatibleERC20MintableInit",
      "LSP8CompatibleERC721",
      "LSP8CompatibleERC721InitAbstract",
      "LSP8CompatibleERC721Mintable",
      "LSP8CompatibleERC721MintableInit",
      // Legacy L14
      // ------------------
      "UniversalReceiverAddressStore",
      // Tools
      // ------------------
      "Create2Factory",
      "LSP16UniversalFactory",
    ],
    // Whether to include the TypeChain factories or not.
    // If this is enabled, you need to run the TypeChain files through the TypeScript compiler before shipping to the registry.
    includeFactories: true,
  },
  paths: {
    artifacts: "artifacts",
    tests: "tests",
  },
  typechain: {
    outDir: "types",
    target: "ethers-v5",
  },
};

export default config;
