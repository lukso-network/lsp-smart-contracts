# LSP17 Contract Extension Package &middot; [![npm version](https://img.shields.io/npm/v/@lukso/lsp17contractextension-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp17contractextension-contracts)

Package for the LSP17 Contract Extension

## Installation

```console
npm install @lukso/lsp17contractextension-contracts
```

## Available Constants & Types

The `@lukso/lsp17contractextension-contracts` npm package contains useful constants such as interface IDs, and ERC725Y data keys related to the LSP17 Standard. You can import and access them as follows.

In Javascript.

```javascript
import {
  INTERFACE_ID_LSP17Extendable,
  INTERFACE_ID_LSP17Extension,
  LSP17DataKeys,
} from "@lukso/lsp17contractextension-contracts";
```

In Solidity.

<!-- prettier-ignore -->
```solidity
import {
  _INTERFACEID_LSP17_EXTENDABLE,
  _INTERFACEID_LSP17_EXTENSION,
  _LSP17_EXTENSION_PREFIX
} from "@lukso/lsp17-contracts/contracts/LSP17Constants.sol";
```
