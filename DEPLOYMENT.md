# Deployment

You can find a deployment utility with hardhat to easily deploy the smart contracts locally or on the LUKSO Testnet,
if you don't have some LYX test token visit [LUKSO Testnet Faucet](https://faucet.testnet.lukso.network).

> **Note:** all the deployment scripts for `base` contracts initialize the contract after deployment to the zero address for security.

&nbsp;

## How to deploy on Testnet with Hardhat?

1. write a private key for an address you control in the `hardhat.config.ts` file. For instance for LUKSO Testnet:

```ts
    // public LUKSO Testnet
    luksoTestnet: {
      live: true,
      url: "https://rpc.testnet.lukso.network",
      chainId: 4201,
      accounts: ["0x.."] // your private key here
    },
```

&nbsp;

2. run the command using one of the available `--tags`

```
npx hardhat deploy --network luksoTestnet --tags <options> --reset
```

Available `--tags <options>` are:

- `UniversalProfile`: deploy a Universal Profile with the deployer as the owner.

- `UniversalProfileInit`: deploy + initialize (= lock) a Universal Profile as a base contract that can be used as implementation behind proxy.

- `LSP6KeyManager`: deploy a `UniversalProfile` + `KeyManager`, with the Universal Profile address linked to the Key Manager.

- `LSP6KeyManagerInit`: deploy at deterministic address + initialize (= lock) both a `UniversalProfileInit` + `KeyManagerInit`, as base contracts (**NB:** the Key Manager will be initialized with reference to `address(0)`).

- `LSP1UniversalReceiverDelegateUP`: deploy at deterministic address a Universal Receiver Delegate contract that can be used to register assets and vaults received by a Universal Profile.

- `LSP1UniversalReceiverDelegateVault`: deploy at deterministic address a Universal Receiver Delegate contract that can be used to register assets received by a LSP9Vault.

- `LSP7Mintable`: deploy a `LSP7Mintable` contract (Token), using the deployer address as the owner and allowing this deployer address to then mint tokens. The `isNFT_` parameter is set to `false`, making the token divisible.

- `LSP8Mintable`: deploy a `LSP7Mintable` contract (NFT), using the deployer address as the owner and allowing this deployer address to then mint tokens.

- `LSP7MintableInit`: deploy at deterministic address + initialize (= lock) a `LSP7MintableInit` contract (Token), that can be used as implementation behind proxy. The base contract is deployed with the `isNonDivisible_` parameter set to `false`, making the implementation token divisible.

- `LSP8MintableInit`: deploy at deterministic address + initialize (= lock) a `LSP8MintableInit` contract, that can be used as implementation behind proxy.

- `LSP9Vault`: deploy a `LSP9Vault` contract with the deployer as the owner.

- `LSP9VaultInit`: deploy at deterministic address + initialize (= lock) a `LSP9VaultInit` contract that can be used as implementation behind proxy.

- `standard`: deploy the 4 standard contract above.

- `base`: deploy the 4 base contract above (for proxy use) at deterministic addresses.

> **Note:** all the contracts marked as `base` or `Init` are deployed at deterministic addresses, so that they can be used as implementation behind proxies. If the contract is already deployed on the network, the address where the contract exists already will be returned.
> Moreover, **these contracts use `bytes32(0)` as their `salt` to deploy with CREATE2.**

&nbsp;

**Examples**

```
// Deploy the 3 contracts
npx hardhat deploy --network luksoTestnet --tags standard --reset


// Deploy the 3 contracts as base contracts (to be used behind proxies)
npx hardhat deploy --network luksoTestnet --tags base --reset

// Deploy a specific contract
npx hardhat deploy --network luksoTestnet --tags UniversalProfile --reset
```

## Verify Contracts on LUKSO Testnet

We recommend using [`@nomiclabs/hardhat-etherscan`](https://hardhat.org/hardhat-runner/plugins/nomiclabs-hardhat-etherscan) plugin to verify the lsp-smart-contracts deployed on LUKSO Testnet.

### 1. add the LUKSO Testnet in your hardhat config under `etherscan`

In your hardhat config file, under the `etherscan` property, add the following configurations for the [LUKSO Testnet](https://docs.lukso.tech/networks/testnet/parameters).

```js
etherscan: {
    // no API is required to verify contracts
    // via the Blockscout instance of LUKSO Testnet
    apiKey: "no-api-key-needed",
    customChains: [
      {
        network: "luksoTestnet",
        chainId: 4201,
        urls: {
          apiURL: "https://explorer.execution.testnet.lukso.network/api",
          browserURL: "https://explorer.execution.testnet.lukso.network",
        },
      },
    ],
  },
```

### 2. run `npx hardhat verify`.

See the following commands below for examples.

```bash
# verify a Universal Profile
npx hardhat verify <address of the deployed Universal Profile> "profile-owner" --network luksoTestnet --contract path/to/UniversalProfileContract.sol:ContractName

# verify a Key Manager
npx hardhat verify <address of the deployed Key Manager> "address-of-UP-linked-to-KM" --network luksoTestnet

# verify the Universal Receiver Delegate of a UP
npx hardhat verify <address of the deployed URD> --network luksoTestnet

## Verify a LSP8 contract
npx hardhat verify <address of the LSP8 contract> "token-name" "token-symbol" "owner-address" --network luksoTestnet

## Verify a LSP9 contracts
npx hardhat verify <address of the LSP9 contract> "vault-owner" --network luksoTestnet
```

For base contracts (to be used as implementation behind proxies), the same commands can be used without the constructor arguments.

For LSP7 contracts, the constructor arguments provided to the command must be passed via a separate file. You can also use an external file for the arguments when verifying other contracts as well.

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
