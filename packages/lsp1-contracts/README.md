# LSP1 Universal Receiver &middot; [![npm version](https://img.shields.io/npm/v/@lukso/lsp1-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp1-contracts)

Package for the LSP1 Universal Receiver standard.

## Installation

```bash
npm install @lukso/lsp1-contracts
```

## Available Constants & Types

The `@lukso/lsp1-contracts` npm package contains useful constants such as interface IDs, and ERC725Y data keys related to the LSP1 Standard. You can import and access them as follows.

In Javascript.

```js
import { INTERFACE_ID_LSP1, LSP1DataKeys } from "@lukso/lsp1-contracts";
```

In Solidity.

<!-- prettier-ignore -->
```solidity
import {
    _INTERFACEID_LSP1,
    _INTERFACEID_LSP1_DELEGATE,
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY
} from "@lukso/lsp1-contracts/contracts/LSP1Constants.sol";
```
