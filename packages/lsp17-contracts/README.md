# LSP17 Extensions Package &middot; [![npm version](https://img.shields.io/npm/v/@lukso/lsp17-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp17-contracts)

npm package for the LSP17 Extensions, which include the following extensions contracts:

- `Extension4337` extension, which contains the `validateUserOp` function from the [`ERC4337` standard](https://eips.ethereum.org/EIPS/eip-4337).
- `OnERC721ReceivedExtension` extension that contains the `onERC721Received` function from the [`ERC721` standard](https://eips.ethereum.org/EIPS/eip-721).
- `ERCTokenCallbacks` extension that contains implemented callback functions with valid returned values from ERC721, ERC1155 and ERC777 to support receiving tokens via the transfer functions that trigger these callbacks.

## Installation

```console
npm install @lukso/lsp17-contracts
```

## Available Constants & Types

The `@lukso/lsp17-contracts` npm package contains useful constants such as interface IDs related to the LSP17 Extensions. You can import and access them as follows.

```javascript
import { INTERFACE_ID_LSP17Extension } from "@lukso/lsp17-contracts";
```

## Foundry deployment

This package includes two Foundry scripts to deploy the `ERCTokenCallbacks` implementation contract extension via `scripts/DeployERCTokenCallbacks.s.sol`.

Set your deployer key first:

```console
export PRIVATE_KEY=0x...
```

## Dry run against LUKSO Testnet

```console
FOUNDRY_PROFILE=lsp17 forge script packages/lsp17-contracts/scripts/DeployERCTokenCallbacks.s.sol:DeployERCTokenCallbacksScript --rpc-url https://rpc.testnet.lukso.network
```

## Broadcast the deployment

> Use one of the methods described in the [foundry docs](https://www.getfoundry.sh/forge/scripting#providing-a-private-key) to broadcast from a specific address

```console
FOUNDRY_PROFILE=lsp17 forge script packages/lsp17-contracts/scripts/DeployERCTokenCallbacks.s.sol:DeployERCTokenCallbacksScript --rpc-url https://rpc.testnet.lukso.network --broadcast
```

Broadcast and verify on the LUKSO Testnet Blockscout explorer:

```console
FOUNDRY_PROFILE=lsp17 forge script packages/lsp17-contracts/scripts/DeployERCTokenCallbacks.s.sol:DeployERCTokenCallbacksScript --rpc-url https://rpc.testnet.lukso.network --broadcast --verify --verifier blockscout --verifier-url https://explorer.execution.testnet.lukso.network/api/
```
