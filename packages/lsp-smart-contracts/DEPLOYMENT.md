# Deployment

You can find a deployment utility with Hardhat Ignition to easily deploy the smart contracts locally or on the LUKSO networks. If you don't have some LYXt test token visit [LUKSO Testnet Faucet](https://faucet.testnet.lukso.network).

> **Note:** all the deployment scripts for `base` contracts initialize the contract after deployment to the zero address for security.

&nbsp;

## How to deploy on Testnet with Hardhat Ignition?

1. Set your private key as an environment variable:

```bash
# for testnet
export CONTRACT_DEPLOYER_TESTNET_PK="0x..."

# for mainnet
export CONTRACT_DEPLOYER_MAINNET_PK="0x..."
```

Or add it to a `.env` file in your package directory and export the `.env` file to your shell.

```bash
source .env
```

&nbsp;

2. Run the deployment command using Hardhat Ignition:

```bash
# Deploy and verify base contracts with CREATE2 for deterministic addresses
npx hardhat ignition deploy ignition/modules/base.ts --strategy create2 --network "luksoTestnet | luksoMainnet" --verify
```

Each package has its own Ignition modules under `ignition/modules/`. Available modules vary by package - check the `ignition/modules/` directory for available options.

&nbsp;

**Examples**

```bash
# Deploy and verify LSP1 delegate contracts
npm run deploy:base --workspace=./packages/lsp1delegate-contracts -- --network luksoTestnet

# Deploy and verify LSP7 contracts
npm run deploy:base --workspace=./packages/lsp7-contracts -- --network luksoTestnet
```

## Verify Contracts on LUKSO Networks

This project uses [`@nomicfoundation/hardhat-verify`](https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify) for contract verification on LUKSO networks.

### Option 1: Verify during deployment (Default)

The `deploy:base` script automatically verifies contracts after deployment:

```bash
npm run deploy:base -- --network luksoTestnet
```

### Option 2: Verify existing deployment

If you have an existing Ignition deployment, you can verify it using the deployment ID:

```bash
npx hardhat ignition verify <deployment-id> --network luksoTestnet
```

### Option 3: Manual verification

For manual verification of individual contracts:

```bash
# verify a Universal Profile
npx hardhat verify <address of the deployed Universal Profile> "profile-owner" --network luksoTestnet --contract path/to/UniversalProfileContract.sol:ContractName

# verify a Key Manager
npx hardhat verify <address of the deployed Key Manager> "address-of-UP-linked-to-KM" --network luksoTestnet

# verify the Universal Receiver Delegate of a UP
npx hardhat verify <address of the deployed URD> --network luksoTestnet

# Verify a LSP8 contract
npx hardhat verify <address of the LSP8 contract> "token-name" "token-symbol" "owner-address" --network luksoTestnet

# Verify a LSP9 contract
npx hardhat verify <address of the LSP9 contract> "vault-owner" --network luksoTestnet
```

For base contracts (to be used as implementation behind proxies), the same commands can be used without the constructor arguments.

For LSP7 contracts, the constructor arguments provided to the command must be passed via a separate file:

```bash
npx hardhat verify <address of the LSP7 contract> --constructor-args arguments.js --network luksoTestnet
```

```js title="arguments.js"
module.exports = [
  "<token-name>",
  "<token-symbol>",
  "<owner-address>",
  false, // isNonDivisible_ (true or false)
];
```

### Chain Configuration (Hardhat v3)

The chain configuration for LUKSO networks is already set up in the hardhat configs using `chainDescriptors`. No API key is required to verify contracts via the Blockscout instance:

```ts
chainDescriptors: {
  4201: {
    name: 'luksoTestnet',
    blockExplorers: {
      etherscan: {
        name: 'LUKSO Testnet Explorer',
        url: 'https://explorer.execution.testnet.lukso.network',
        apiUrl: 'https://explorer.execution.testnet.lukso.network/api',
      },
    },
  },
  42: {
    name: 'luksoMainnet',
    blockExplorers: {
      etherscan: {
        name: 'LUKSO Mainnet Explorer',
        url: 'https://explorer.execution.mainnet.lukso.network',
        apiUrl: 'https://explorer.execution.mainnet.lukso.network/api',
      },
    },
  },
},
```

For more details, see the [Hardhat Ignition documentation](https://hardhat.org/ignition/docs/guides/verify).
