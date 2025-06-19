# LSP14 Ownable 2 Step &middot; [![npm version](https://img.shields.io/npm/v/@lukso/lsp14-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp14-contracts)

Package for the LSP14 Ownable 2 Step standard.

## Installation

```bash
npm install @lukso/lsp14-contracts
```

## Available Constants & Types

The `@lukso/lsp14-contracts` npm package contains useful constants such as interface IDs, and ERC725Y data keys related to the LSP14 Standard. You can import and access them as follows.

In Javascript.

```javascript
import { LSP14_TYPE_IDS, INTERFACE_ID_LSP14 } from "@lukso/lsp14-contracts";
```

In Solidity.

<!-- prettier-ignore -->
```solidity
import {
    _INTERFACEID_LSP14,
    _TYPEID_LSP14_OwnershipTransferStarted,
    _TYPEID_LSP14_OwnershipTransferred_SenderNotification,
    _TYPEID_LSP14_OwnershipTransferred_RecipientNotification
} from "@lukso/lsp14-contracts/contracts/LSP14Constants.sol";
```
