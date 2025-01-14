# LSP17 Extensions Package &middot; [![npm version](https://img.shields.io/npm/v/@lukso/lsp17-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp17-contracts)

Package for the LSP17 Extensions, that includes the following extensions:

- `Extension4337` extension, which contains the `validateUserOp` function from the [`ERC4337` standard](https://eips.ethereum.org/EIPS/eip-4337).
- `OnERC721ReceivedExtension` extension that contains the `onERC721Received` function from the [`ERC721` standard](https://eips.ethereum.org/EIPS/eip-721).
- `ERCTokenCallbacks` extension that contains implemented callback functions with valid returned values from ERC721, ERC1155 and ERC777 to support receiving tokens via the transfer functions that trigger these callbacks.

## Installation

```console
npm install @lukso/lsp17-contracts
```

## Available Constants & Types

The `@lukso/lsp17-contracts` npm package contains useful constants such as interface IDs related to the LSP17 Extensions. You can import and access them as follows:

```js
import { INTERFACE_ID_LSP17Extension } from "@lukso/lsp17-contracts";
```
