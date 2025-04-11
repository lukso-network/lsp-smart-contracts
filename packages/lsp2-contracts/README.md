# LSP2 ERC725Y JSON Schema &middot; [![npm version](https://img.shields.io/npm/v/@lukso/lsp2-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp2-contracts)

Package for the LSP2 ERC725Y JSON Schema standard.

## Installation

```bash
npm install @lukso/lsp2-contracts
```

## Available Constants & Types

The `@lukso/lsp2-contracts` npm package contains useful constants such as ERC725Y Data Keys related to the LSP2 Standard. You can import and access them as follows.

In Javascript.

```js
import { LSP2ArrayKey, Verification } from "@lukso/lsp2-contracts";
```

In Solidity.

<!-- prettier-ignore -->
```solidity
import {
    _KECCAK256_UTF8,
    _KECCAK256_BYTES,
    _KECCAK256_ECDSA
} from "@lukso/lsp2-contracts/contracts/LSP2Constants.sol";
```
