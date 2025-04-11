# &middot; [![npm version](https://img.shields.io/npm/v/@lukso/lsp12-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp12-contracts)

Package for the LSP12 Issued Assets standard.

## Installation

```bash
npm install @lukso/lsp12-contracts
```

## Available Constants & Types

The `@lukso/lsp12-contracts` npm package contains useful constants such as ERC725Y Data Keys related to the LSP12 Standard. You can import and access them as follows.

In Javascript.

```js
import { LSP12DataKeys } from "@lukso/lsp12-contracts";
```

In Solidity.

<!-- prettier-ignore -->
```solidity
import {
    _LSP12_ISSUED_ASSETS_ARRAY_KEY,
    _LSP12_ISSUED_ASSETS_MAP_KEY_PREFIX
} from "@lukso/lsp12-contracts/contracts/LSP12Constants.sol";
```
