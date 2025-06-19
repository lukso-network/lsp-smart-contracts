# LSP5 Received Assets &middot; [![npm version](https://img.shields.io/npm/v/@lukso/lsp5-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp5-contracts)

Package for the LSP5 Received Assets standard.

## Installation

```bash
npm install @lukso/lsp5-contracts
```

## Available Constants & Types

The `@lukso/lsp5-contracts` npm package contains useful constants such as ERC725Y Data Keys related to the LSP5 Standard. You can import and access them as follows.

In Javascript.

```javascript
import { LSP5DataKeys } from "@lukso/lsp5-contracts";
```

In Solidity.

<!-- prettier-ignore -->
```solidity
import {
    _LSP5_RECEIVED_ASSETS_ARRAY_KEY,
    _LSP5_RECEIVED_ASSETS_MAP_KEY_PREFIX
} from "@lukso/lsp5-contracts/contracts/LSP5Constants.sol";
```
