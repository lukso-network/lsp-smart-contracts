# LSP26 Follower System &middot; [![npm version](https://img.shields.io/npm/v/@lukso/lsp26-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp26-contracts)

Package for the LSP26 Follower System standard.

## Installation

```console
npm i @lukso/lsp26-contracts
```

## Available Constants & Types

The `@lukso/lsp26-contracts` npm package contains useful constants such as interface IDs, and specific constants related to the LSP26 Standard. You can import and access them as follows.

In Javascript.

```js
import { INTERFACE_ID_LSP26, LSP26_TYPE_IDS } from "@lukso/lsp26-contracts";
```

In Solidity.

<!-- prettier-ignore -->
```solidity
import {
    _INTERFACEID_LSP26,
    _TYPEID_LSP26_FOLLOW,
    _TYPEID_LSP26_UNFOLLOW
} from "@lukso/lsp26-contracts/contracts/LSP26Constants.sol";
```
