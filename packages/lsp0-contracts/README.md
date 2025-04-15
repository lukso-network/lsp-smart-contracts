# LSP0 ERC725Account &middot; [![npm version](https://img.shields.io/npm/v/@lukso/lsp0-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp0-contracts)

Package for the LSP0 ERC725Account standard.

## Installation

```bash
npm install @lukso/lsp0-contracts
```

## Available Constants & Types

The `@lukso/lsp0-contracts` npm package contains useful constants such as interface Ids, and ERC725Y data keys related to the LSP0 Standard. You can import and access them as follows.

In Javascript.

```js
import {
  INTERFACE_ID_LSP0,
  OPERATION_TYPES,
  LSP0_TYPE_IDS,
  ERC1271_VALUES,
} from "@lukso/lsp0-contracts";
```

In Solidity.

<!-- prettier-ignore -->
```solidity
import {
  _INTERFACEID_LSP0,
  _INTERFACEID_ERC1271,
  _ERC1271_SUCCESSVALUE,
  _ERC1271_FAILVALUE,
  _TYPEID_LSP0_VALUE_RECEIVED,
  _TYPEID_LSP0_OwnershipTransferStarted,
  _TYPEID_LSP0_OwnershipTransferred_SenderNotification,
  _TYPEID_LSP0_OwnershipTransferred_RecipientNotification
} from "@lukso/lsp0-contracts/contracts/LSP0Constants.sol";
```

## Typescript types

You can also import the [type-safe ABI](https://abitype.dev/) of each LSP smart contracts from the `/abi` path.

```ts
import {
  lsp0Erc725AccountAbi,
  lsp0Erc725AccountInitAbi,
} from "@lukso/lsp0-contracts/abi";
```
