# Deploying LUKSO LSP Smart Contracts on new EVM networks

This guide covers how to deploy the LUKSO smart contract infrastructure on a new EVM-compatible network using deterministic CREATE2 deployments via the [Nick Factory](https://github.com/Arachnid/deterministic-deployment-proxy).

All contract build artifacts (creation bytecodes, runtime bytecodes, salts, compiler settings) are stored in [`deployments/contracts.json`](./deployments/contracts.json).

## Deployed Contracts by Network

All contracts are deployed with CREATE2 via the Nick Factory, so to have the **same address on every chain**. Scanned 19 networks via `cast code` — contracts are live on 8.

> **Legend:** Links go to the block explorer for that contract on that network. A dash (—) means not deployed.

### Singletons

#### Mainnet

| Contract                     | Address                                                                                             | LUKSO                                                                                  | Ethereum                                                                     | Base                                                                         | Arbitrum                                                                    | Optimism                                                                                |
| ---------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| LSP23LinkedContractsFactory  | [`0x2300...a30`](https://explorer.lukso.network/address/0x2300000A84D25dF63081feAa37ba6b62C4c89a30) | [✔](https://explorer.lukso.network/address/0x2300000A84D25dF63081feAa37ba6b62C4c89a30) | [✔](https://etherscan.io/address/0x2300000A84D25dF63081feAa37ba6b62C4c89a30) | [✔](https://basescan.org/address/0x2300000A84D25dF63081feAa37ba6b62C4c89a30) | [✔](https://arbiscan.io/address/0x2300000A84D25dF63081feAa37ba6b62C4c89a30) | [✔](https://optimistic.etherscan.io/address/0x2300000A84D25dF63081feAa37ba6b62C4c89a30) |
| UP Init PostDeploymentModule | [`0x0000...F00`](https://explorer.lukso.network/address/0x000000000066093407b6704B89793beFfD0D8F00) | [✔](https://explorer.lukso.network/address/0x000000000066093407b6704B89793beFfD0D8F00) | [✔](https://etherscan.io/address/0x000000000066093407b6704B89793beFfD0D8F00) | [✔](https://basescan.org/address/0x000000000066093407b6704B89793beFfD0D8F00) | [✔](https://arbiscan.io/address/0x000000000066093407b6704B89793beFfD0D8F00) | [✔](https://optimistic.etherscan.io/address/0x000000000066093407b6704B89793beFfD0D8F00) |
| UP PostDeploymentModule      | [`0x0000...cD7`](https://explorer.lukso.network/address/0x0000005aD606bcFEF9Ea6D0BbE5b79847054BcD7) | —                                                                                      | —                                                                            | —                                                                            | —                                                                           | [✔](https://optimistic.etherscan.io/address/0x0000005aD606bcFEF9Ea6D0BbE5b79847054BcD7) |

#### Testnet

| Contract                     | Address                                                                                             | LUKSO Testnet                                                                                            | Sepolia                                                                              | Base Sepolia                                                                         |
| ---------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| LSP23LinkedContractsFactory  | [`0x2300...a30`](https://explorer.lukso.network/address/0x2300000A84D25dF63081feAa37ba6b62C4c89a30) | [✔](https://explorer.execution.testnet.lukso.network/address/0x2300000A84D25dF63081feAa37ba6b62C4c89a30) | [✔](https://sepolia.etherscan.io/address/0x2300000A84D25dF63081feAa37ba6b62C4c89a30) | [✔](https://sepolia.basescan.org/address/0x2300000A84D25dF63081feAa37ba6b62C4c89a30) |
| UP Init PostDeploymentModule | [`0x0000...F00`](https://explorer.lukso.network/address/0x000000000066093407b6704B89793beFfD0D8F00) | [✔](https://explorer.execution.testnet.lukso.network/address/0x000000000066093407b6704B89793beFfD0D8F00) | [✔](https://sepolia.etherscan.io/address/0x000000000066093407b6704B89793beFfD0D8F00) | [✔](https://sepolia.basescan.org/address/0x000000000066093407b6704B89793beFfD0D8F00) |
| UP PostDeploymentModule      | [`0x0000...cD7`](https://explorer.lukso.network/address/0x0000005aD606bcFEF9Ea6D0BbE5b79847054BcD7) | [✔](https://explorer.execution.testnet.lukso.network/address/0x0000005aD606bcFEF9Ea6D0BbE5b79847054BcD7) | —                                                                                    | —                                                                                    |

### Implementation Contracts

#### Mainnet

| Contract                        | Version | Address                                                                                             | LUKSO                                                                                  | Ethereum                                                                     | Base                                                                         | Arbitrum                                                                    | Optimism                                                                                |
| ------------------------------- | ------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| UniversalProfileInit            | 0.14.0  | [`0x3024...D4F`](https://explorer.lukso.network/address/0x3024D38EA2434BA6635003Dc1BDC0daB5882ED4F) | [✔](https://explorer.lukso.network/address/0x3024D38EA2434BA6635003Dc1BDC0daB5882ED4F) | [✔](https://etherscan.io/address/0x3024D38EA2434BA6635003Dc1BDC0daB5882ED4F) | [✔](https://basescan.org/address/0x3024D38EA2434BA6635003Dc1BDC0daB5882ED4F) | —                                                                           | [✔](https://optimistic.etherscan.io/address/0x3024D38EA2434BA6635003Dc1BDC0daB5882ED4F) |
| UniversalProfileInit            | 0.12.1  | [`0x52c9...2A9`](https://explorer.lukso.network/address/0x52c90985AF970D4E0DC26Cb5D052505278aF32A9) | [✔](https://explorer.lukso.network/address/0x52c90985AF970D4E0DC26Cb5D052505278aF32A9) | [✔](https://etherscan.io/address/0x52c90985AF970D4E0DC26Cb5D052505278aF32A9) | [✔](https://basescan.org/address/0x52c90985AF970D4E0DC26Cb5D052505278aF32A9) | [✔](https://arbiscan.io/address/0x52c90985AF970D4E0DC26Cb5D052505278aF32A9) | —                                                                                       |
| LSP6KeyManagerInit              | 0.14.0  | [`0x2Fe3...8a4`](https://explorer.lukso.network/address/0x2Fe3AeD98684E7351aD2D408A43cE09a738BF8a4) | [✔](https://explorer.lukso.network/address/0x2Fe3AeD98684E7351aD2D408A43cE09a738BF8a4) | [✔](https://etherscan.io/address/0x2Fe3AeD98684E7351aD2D408A43cE09a738BF8a4) | [✔](https://basescan.org/address/0x2Fe3AeD98684E7351aD2D408A43cE09a738BF8a4) | —                                                                           | [✔](https://optimistic.etherscan.io/address/0x2Fe3AeD98684E7351aD2D408A43cE09a738BF8a4) |
| LSP6KeyManagerInit              | 0.12.1  | [`0xa756...64C`](https://explorer.lukso.network/address/0xa75684d7D048704a2DB851D05Ba0c3cbe226264C) | [✔](https://explorer.lukso.network/address/0xa75684d7D048704a2DB851D05Ba0c3cbe226264C) | [✔](https://etherscan.io/address/0xa75684d7D048704a2DB851D05Ba0c3cbe226264C) | [✔](https://basescan.org/address/0xa75684d7D048704a2DB851D05Ba0c3cbe226264C) | [✔](https://arbiscan.io/address/0xa75684d7D048704a2DB851D05Ba0c3cbe226264C) | —                                                                                       |
| LSP1UniversalReceiverDelegateUP | 0.14.0  | [`0x7870...00D`](https://explorer.lukso.network/address/0x7870C5B8BC9572A8001C3f96f7ff59961B23500D) | [✔](https://explorer.lukso.network/address/0x7870C5B8BC9572A8001C3f96f7ff59961B23500D) | [✔](https://etherscan.io/address/0x7870C5B8BC9572A8001C3f96f7ff59961B23500D) | [✔](https://basescan.org/address/0x7870C5B8BC9572A8001C3f96f7ff59961B23500D) | —                                                                           | [✔](https://optimistic.etherscan.io/address/0x7870C5B8BC9572A8001C3f96f7ff59961B23500D) |
| LSP1UniversalReceiverDelegateUP | 0.12.1  | [`0xA546...8c8`](https://explorer.lukso.network/address/0xA5467dfe7019bF2C7C5F7A707711B9d4cAD118c8) | [✔](https://explorer.lukso.network/address/0xA5467dfe7019bF2C7C5F7A707711B9d4cAD118c8) | [✔](https://etherscan.io/address/0xA5467dfe7019bF2C7C5F7A707711B9d4cAD118c8) | [✔](https://basescan.org/address/0xA5467dfe7019bF2C7C5F7A707711B9d4cAD118c8) | [✔](https://arbiscan.io/address/0xA5467dfe7019bF2C7C5F7A707711B9d4cAD118c8) | —                                                                                       |
| LSP7MintableInit                | 0.14.0  | [`0x28B7...2d8`](https://explorer.lukso.network/address/0x28B7CcdaD1E15cCbDf380c439Cc1F2EBe7f5B2d8) | [✔](https://explorer.lukso.network/address/0x28B7CcdaD1E15cCbDf380c439Cc1F2EBe7f5B2d8) | —                                                                            | —                                                                            | —                                                                           | —                                                                                       |
| LSP8MintableInit                | 0.14.0  | [`0xd787...997`](https://explorer.lukso.network/address/0xd787a2f6B14d4dcC2fb897f40b87f2Ff63a07997) | [✔](https://explorer.lukso.network/address/0xd787a2f6B14d4dcC2fb897f40b87f2Ff63a07997) | —                                                                            | —                                                                            | —                                                                           | —                                                                                       |

#### Testnet

| Contract                        | Version | Address                                                                                             | LUKSO Testnet                                                                                            | Sepolia                                                                              | Base Sepolia                                                                         |
| ------------------------------- | ------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| UniversalProfileInit            | 0.14.0  | [`0x3024...D4F`](https://explorer.lukso.network/address/0x3024D38EA2434BA6635003Dc1BDC0daB5882ED4F) | [✔](https://explorer.execution.testnet.lukso.network/address/0x3024D38EA2434BA6635003Dc1BDC0daB5882ED4F) | [✔](https://sepolia.etherscan.io/address/0x3024D38EA2434BA6635003Dc1BDC0daB5882ED4F) | [✔](https://sepolia.basescan.org/address/0x3024D38EA2434BA6635003Dc1BDC0daB5882ED4F) |
| UniversalProfileInit            | 0.12.1  | [`0x52c9...2A9`](https://explorer.lukso.network/address/0x52c90985AF970D4E0DC26Cb5D052505278aF32A9) | [✔](https://explorer.execution.testnet.lukso.network/address/0x52c90985AF970D4E0DC26Cb5D052505278aF32A9) | [✔](https://sepolia.etherscan.io/address/0x52c90985AF970D4E0DC26Cb5D052505278aF32A9) | [✔](https://sepolia.basescan.org/address/0x52c90985AF970D4E0DC26Cb5D052505278aF32A9) |
| LSP6KeyManagerInit              | 0.14.0  | [`0x2Fe3...8a4`](https://explorer.lukso.network/address/0x2Fe3AeD98684E7351aD2D408A43cE09a738BF8a4) | [✔](https://explorer.execution.testnet.lukso.network/address/0x2Fe3AeD98684E7351aD2D408A43cE09a738BF8a4) | [✔](https://sepolia.etherscan.io/address/0x2Fe3AeD98684E7351aD2D408A43cE09a738BF8a4) | [✔](https://sepolia.basescan.org/address/0x2Fe3AeD98684E7351aD2D408A43cE09a738BF8a4) |
| LSP6KeyManagerInit              | 0.12.1  | [`0xa756...64C`](https://explorer.lukso.network/address/0xa75684d7D048704a2DB851D05Ba0c3cbe226264C) | [✔](https://explorer.execution.testnet.lukso.network/address/0xa75684d7D048704a2DB851D05Ba0c3cbe226264C) | [✔](https://sepolia.etherscan.io/address/0xa75684d7D048704a2DB851D05Ba0c3cbe226264C) | [✔](https://sepolia.basescan.org/address/0xa75684d7D048704a2DB851D05Ba0c3cbe226264C) |
| LSP1UniversalReceiverDelegateUP | 0.14.0  | [`0x7870...00D`](https://explorer.lukso.network/address/0x7870C5B8BC9572A8001C3f96f7ff59961B23500D) | [✔](https://explorer.execution.testnet.lukso.network/address/0x7870C5B8BC9572A8001C3f96f7ff59961B23500D) | [✔](https://sepolia.etherscan.io/address/0x7870C5B8BC9572A8001C3f96f7ff59961B23500D) | [✔](https://sepolia.basescan.org/address/0x7870C5B8BC9572A8001C3f96f7ff59961B23500D) |
| LSP1UniversalReceiverDelegateUP | 0.12.1  | [`0xA546...8c8`](https://explorer.lukso.network/address/0xA5467dfe7019bF2C7C5F7A707711B9d4cAD118c8) | [✔](https://explorer.execution.testnet.lukso.network/address/0xA5467dfe7019bF2C7C5F7A707711B9d4cAD118c8) | [✔](https://sepolia.etherscan.io/address/0xA5467dfe7019bF2C7C5F7A707711B9d4cAD118c8) | [✔](https://sepolia.basescan.org/address/0xA5467dfe7019bF2C7C5F7A707711B9d4cAD118c8) |
| LSP7MintableInit                | 0.14.0  | [`0x28B7...2d8`](https://explorer.lukso.network/address/0x28B7CcdaD1E15cCbDf380c439Cc1F2EBe7f5B2d8) | [✔](https://explorer.execution.testnet.lukso.network/address/0x28B7CcdaD1E15cCbDf380c439Cc1F2EBe7f5B2d8) | —                                                                                    | —                                                                                    |
| LSP8MintableInit                | 0.14.0  | [`0xd787...997`](https://explorer.lukso.network/address/0xd787a2f6B14d4dcC2fb897f40b87f2Ff63a07997) | [✔](https://explorer.execution.testnet.lukso.network/address/0xd787a2f6B14d4dcC2fb897f40b87f2Ff63a07997) | —                                                                                    | —                                                                                    |

### Summary by Network

| Network       | Type    | Singletons | Implementations | Total     |
| ------------- | ------- | ---------- | --------------- | --------- |
| LUKSO Mainnet | mainnet | 2/3        | 8/8             | 10/11     |
| LUKSO Testnet | testnet | 3/3        | 8/8             | **11/11** |
| Ethereum      | mainnet | 2/3        | 6/8             | 8/11      |
| Sepolia       | testnet | 2/3        | 6/8             | 8/11      |
| Base          | mainnet | 2/3        | 6/8             | 8/11      |
| Base Sepolia  | testnet | 2/3        | 6/8             | 8/11      |
| Arbitrum      | mainnet | 2/3        | 3/8             | 5/11      |
| Optimism      | mainnet | 3/3        | 3/8             | 6/11      |

---

## Contracts Overview

There are two categories of contracts:

1. **Singletons** — Deployed once per network. Same address everywhere via CREATE2.
2. **Implementation Contracts** — Base contracts behind [ERC-1167](https://eips.ethereum.org/EIPS/eip-1167) minimal proxies. Also deployed via CREATE2 for deterministic addresses.

### Singletons

| Contract                                 | Address                                      | Purpose                                                                  |
| ---------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------ |
| LSP23LinkedContractsFactory              | `0x2300000A84D25dF63081feAa37ba6b62C4c89a30` | Factory for deploying linked contract pairs (UP + KeyManager)            |
| UniversalProfileInitPostDeploymentModule | `0x000000000066093407b6704B89793beFfD0D8F00` | Sets initial data keys and transfers ownership after UP proxy deployment |
| UniversalProfilePostDeploymentModule     | `0x0000005aD606bcFEF9Ea6D0BbE5b79847054BcD7` | Same as above but for non-proxy UP deployments                           |

### Implementation Contracts

| Contract                        | Version | Address                                      | Source                                                                                                                                                                                                                |
| ------------------------------- | ------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UniversalProfileInit            | 0.14.0  | `0x3024D38EA2434BA6635003Dc1BDC0daB5882ED4F` | [**Solidity source code**](https://github.com/lukso-network/lsp-smart-contracts/blob/lsp-smart-contracts-v0.14.0/contracts/UniversalProfileInit.sol)                                                                  |
| UniversalProfileInit            | 0.12.1  | `0x52c90985AF970D4E0DC26Cb5D052505278aF32A9` | [**Solidity source code**](https://github.com/lukso-network/lsp-smart-contracts/blob/v0.12.1/contracts/UniversalProfileInit.sol)                                                                                      |
| LSP6KeyManagerInit              | 0.14.0  | `0x2Fe3AeD98684E7351aD2D408A43cE09a738BF8a4` | [**Solidity source code**](https://github.com/lukso-network/lsp-smart-contracts/blob/lsp-smart-contracts-v0.14.0/contracts/LSP6KeyManager/LSP6KeyManagerInit.sol)                                                     |
| LSP6KeyManagerInit              | 0.12.1  | `0xa75684d7D048704a2DB851D05Ba0c3cbe226264C` | [**Solidity source code**](https://github.com/lukso-network/lsp-smart-contracts/blob/v0.12.1/contracts/LSP6KeyManager/LSP6KeyManagerInit.sol)                                                                         |
| LSP1UniversalReceiverDelegateUP | 0.14.0  | `0x7870C5B8BC9572A8001C3f96f7ff59961B23500D` | [**Solidity source code**](https://github.com/lukso-network/lsp-smart-contracts/blob/lsp-smart-contracts-v0.14.0/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol) |
| LSP1UniversalReceiverDelegateUP | 0.12.1  | `0xA5467dfe7019bF2C7C5F7A707711B9d4cAD118c8` | [**Solidity source code**](https://github.com/lukso-network/lsp-smart-contracts/blob/v0.12.1/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol)                     |
| LSP7MintableInit                | 0.14.0  | `0x28B7CcdaD1E15cCbDf380c439Cc1F2EBe7f5B2d8` | [**Solidity source code**](https://github.com/lukso-network/lsp-smart-contracts/blob/lsp-smart-contracts-v0.14.0/contracts/LSP7DigitalAsset/presets/LSP7MintableInit.sol)                                             |
| LSP8MintableInit                | 0.14.0  | `0xd787a2f6B14d4dcC2fb897f40b87f2Ff63a07997` | [**Solidity source code**](https://github.com/lukso-network/lsp-smart-contracts/blob/lsp-smart-contracts-v0.14.0/contracts/LSP8IdentifiableDigitalAsset/presets/LSP8MintableInit.sol)                                 |

---

## Prerequisites

1. **A funded deployer account** on the target network
2. **An RPC endpoint** for the target network
3. **[Foundry](https://getfoundry.sh)** installed (specifically `cast`)
4. **The Nick Factory** contract must exist on the target network at address `0x4e59b44847b379578588920cA78FbF26c0B4956C`. To check if it exists:

```bash
cast code 0x4e59b44847b379578588920cA78FbF26c0B4956C --rpc-url $RPC_URL
```

If the result is `0x`, deploy it by funding `0x3fab184622dc19b6109349b94811493bf2a45362` with `0.0247 ETH` and broadcasting the [pre-signed transaction](https://github.com/Arachnid/deterministic-deployment-proxy?tab=readme-ov-file#deployment-transaction). Some networks include the Nick Factory at genesis.

---

## Step 1: Deploy Singletons

All singletons are deployed by sending `salt + creationBytecode` as calldata to the Nick Factory. The salt and creation bytecodes are in [`deployments/contracts.json`](./deployments/contracts.json).

```bash
# Generic pattern — send (salt ++ creationBytecode) to Nick Factory
cast send 0x4e59b44847b379578588920cA78FbF26c0B4956C \
  "$(cast concat-hex $SALT $CREATION_BYTECODE)" \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_PK
```

### 1.1 LSP23LinkedContractsFactory

The central factory for deploying linked contract pairs. See the [LSP-23 spec](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-23-LinkedContractsFactory.md#lsp23linkedcontractsfactory-deployment) for the full deployment transaction data.

| Field            | Value                                                                |
| ---------------- | -------------------------------------------------------------------- |
| Expected address | `0x2300000A84D25dF63081feAa37ba6b62C4c89a30`                         |
| Salt             | `0x12a6712f113536d8b01d99f72ce168c7e1090124db54cd16f03c20000022178c` |
| Compiler         | solc 0.8.17, 1,000 optimization runs                                 |

### 1.2 UniversalProfileInitPostDeploymentModule

Called by LSP23 after deploying a UP + KeyManager proxy pair. Sets initial data keys via `delegatecall` on the UP, then transfers ownership to the KeyManager. See [deployment details](./packages/lsp23-contracts/contracts/modules/deployment-UP-init-module.md).

| Field            | Value                                                                |
| ---------------- | -------------------------------------------------------------------- |
| Expected address | `0x000000000066093407b6704B89793beFfD0D8F00`                         |
| Salt             | `0x12a6712f113536d8b01d99f72ce168c7e10901240d73e80eeb821d01aa4c2b1a` |
| Compiler         | solc 0.8.17, 9,999,999 optimization runs                             |

### 1.3 UniversalProfilePostDeploymentModule

Same role as above, but for non-proxy (direct) UP deployments. See [deployment details](./packages/lsp23-contracts/contracts/modules/deployment-UP-module.md).

| Field            | Value                                                                |
| ---------------- | -------------------------------------------------------------------- |
| Expected address | `0x0000005aD606bcFEF9Ea6D0BbE5b79847054BcD7`                         |
| Salt             | `0x42ff55d7957589c62da54a4368b10a2bc549f2038bbb6880ec6b3e0ecae2ba58` |
| Compiler         | solc 0.8.17, 9,999,999 optimization runs                             |

**Verify each deployment:**

```bash
# Should return non-empty bytecode
cast code 0x2300000A84D25dF63081feAa37ba6b62C4c89a30 --rpc-url $RPC_URL
cast code 0x000000000066093407b6704B89793beFfD0D8F00 --rpc-url $RPC_URL
cast code 0x0000005aD606bcFEF9Ea6D0BbE5b79847054BcD7 --rpc-url $RPC_URL
```

---

## Step 2: Deploy Implementation Contracts

Implementation contracts are base contracts behind ERC-1167 minimal proxies. Each disables initializers in its constructor — only proxies should be initialized.

All implementation contracts use the same salt and deployment pattern:

| Field    | Value                                                                |
| -------- | -------------------------------------------------------------------- |
| Salt     | `0xfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeed` |
| Compiler | solc 0.8.17, 1,000 optimization runs                                 |

Deploy each by extracting its creation bytecode from `deployments/contracts.json` and sending `salt + creationBytecode` to the Nick Factory (same pattern as singletons).

### Contract Details

**UniversalProfileInit** — Proxy-deployable Universal Profile (ERC725Account + LSP1 + LSP3).

- Initialization: `initialize(address initialOwner)`

**LSP6KeyManagerInit** — Proxy-deployable Key Manager (permission controller for ERC725Account).

- Initialization: `initialize(address target_)` where `target_` is the UP address

**LSP1UniversalReceiverDelegateUP** — Stateless delegate that auto-registers LSP5 ReceivedAssets and LSP10 ReceivedVaults data keys. No initialization needed.

**LSP7MintableInit / LSP8MintableInit** — Proxy-deployable mintable token implementations (fungible / non-fungible).

---

## Step 3: Deploy a Universal Profile via LSP23

Once singletons and implementations are deployed, create Universal Profile + Key Manager pairs using `deployERC1167Proxies`:

```solidity
function deployERC1167Proxies(
  PrimaryContractDeploymentInit calldata primaryContractDeploymentInit,
  SecondaryContractDeploymentInit calldata secondaryContractDeploymentInit,
  address postDeploymentModule,
  bytes calldata postDeploymentModuleCalldata
)
  external
  payable
  returns (address primaryContractAddress, address secondaryContractAddress);
```

### How it works

1. LSP23 deploys two ERC-1167 proxies — one for the UP (primary) and one for the Key Manager (secondary)
2. The UP proxy is initialized with the PostDeploymentModule as its temporary owner
3. The KM proxy is initialized with the UP address as its target (via `addPrimaryContractAddress = true`)
4. LSP23 calls the PostDeploymentModule which:
   - Decodes `postDeploymentModuleCalldata` as `(bytes32[] dataKeys, bytes[] dataValues)`
   - `delegatecall`s into the UP to set all data keys (LSP3 profile, LSP1 delegate, controller permissions)
   - Transfers UP ownership to the Key Manager

### Parameters

| Parameter                                                   | Value                                                                           |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `primaryContractDeploymentInit.implementationContract`      | UniversalProfileInit address                                                    |
| `primaryContractDeploymentInit.initializationCalldata`      | `abi.encodeWithSignature("initialize(address)", postDeploymentModuleAddress)`   |
| `secondaryContractDeploymentInit.implementationContract`    | LSP6KeyManagerInit address                                                      |
| `secondaryContractDeploymentInit.initializationCalldata`    | `abi.encodeWithSignature("initialize(address)")` — UP address appended by LSP23 |
| `secondaryContractDeploymentInit.addPrimaryContractAddress` | `true`                                                                          |
| `postDeploymentModule`                                      | `0x000000000066093407b6704B89793beFfD0D8F00`                                    |
| `postDeploymentModuleCalldata`                              | ABI-encoded `(bytes32[], bytes[])` — the data keys/values to set on the UP      |

The `postDeploymentModuleCalldata` typically sets:

- `SupportedStandards:LSP3Profile` — profile metadata
- `LSP1UniversalReceiverDelegate` — points to the LSP1 delegate address
- `AddressPermissions:Permissions:<controller>` — permissions for the controller EOA
- `AddressPermissions[]` — the array of controllers

> See the [LSP23 modules README](./packages/lsp23-contracts/contracts/modules/README.md) and the [PostDeploymentModule source](./packages/lsp23-contracts/contracts/modules/UniversalProfileInitPostDeploymentModule.sol) for the complete flow.

---

## Verification

### Bytecode Comparison

After deployment, verify the on-chain bytecode matches `deployments/contracts.json`:

```bash
ON_CHAIN=$(cast code $CONTRACT_ADDRESS --rpc-url $RPC_URL)
EXPECTED=$(python3 -c "import json; print(json.load(open('deployments/contracts.json'))['LSP23LinkedContractsFactory']['bytecode'])")
[ "$ON_CHAIN" = "$EXPECTED" ] && echo "Bytecode matches" || echo "Bytecode mismatch"
```

### Block Explorer Verification

```bash
forge verify-contract \
  --chain-id $CHAIN_ID \
  --compiler-version v0.8.17+commit.8df45f5f \
  --optimizer-runs 1000 \
  $CONTRACT_ADDRESS \
  ContractName \
  --etherscan-api-key $API_KEY
```

### Compiler Settings

| Contract                                 | solc   | Optimization Runs |
| ---------------------------------------- | ------ | ----------------- |
| LSP23LinkedContractsFactory              | 0.8.17 | 1,000             |
| UniversalProfileInitPostDeploymentModule | 0.8.17 | 9,999,999         |
| UniversalProfilePostDeploymentModule     | 0.8.17 | 9,999,999         |
| All implementation contracts             | 0.8.17 | 1,000             |

---

## `deployments/contracts.json` Reference

The JSON file contains all contract build artifacts needed for deployment.

**Structure:**

- **Singletons** have a flat structure: `type`, `version`, `address`, `salt`, `compilerSettings`, `creationBytecode`, `bytecode`
- **Implementation contracts** have a `versions` array, each entry with: `version`, `address`, `salt`, `compilerSettings`, `creationBytecode`, `bytecode`, `releaseurl`

| Field              | Description                                                                      |
| ------------------ | -------------------------------------------------------------------------------- |
| `creationBytecode` | Full contract creation bytecode — concatenate with salt and send to Nick Factory |
| `bytecode`         | Runtime bytecode — what ends up on-chain after deployment, used for verification |
| `salt`             | The CREATE2 salt for deterministic address computation                           |
| `compilerSettings` | Solidity compiler version and optimization settings                              |

## Further Reading

- [LSP-23 Linked Contracts Factory spec](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-23-LinkedContractsFactory.md)
- [LSP23 modules README](./packages/lsp23-contracts/contracts/modules/README.md)
- [PostDeploymentModule (Init) deployment guide](./packages/lsp23-contracts/contracts/modules/deployment-UP-init-module.md)
- [PostDeploymentModule deployment guide](./packages/lsp23-contracts/contracts/modules/deployment-UP-module.md)
- [Nick Factory / Deterministic Deployment Proxy](https://github.com/Arachnid/deterministic-deployment-proxy)
