# LSP3 Profile Metadata &middot; [![npm version](https://img.shields.io/npm/v/@lukso/lsp3-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp3-contracts)

Package for the LSP3 Profile Metadata standard.

## Installation

```console
npm install @lukso/lsp3-contracts
```

## Available Constants & Types

The `@lukso/lsp3-contracts` npm package contains useful constants such as ERC725Y data keys related to the LSP3 Standard. You can import and access them as follows.

In Javascript.

```js
import {
  LSP3DataKeys,
  LSP3SupportedStandard,
  LSP3ProfileMetadataJSON,
  LSP3ProfileMetadata,
  LinkMetadata,
  ImageMetadata,
  AssetMetadata,
} from "@lukso/lsp3-contracts";
```

In Solidity.

<!-- prettier-ignore -->
```solidity
import {
  _LSP3_SUPPORTED_STANDARDS_KEY,
  _LSP3_SUPPORTED_STANDARDS_VALUE,
  _LSP3_PROFILE_KEY
} from "@lukso/lsp3-contracts/contracts/LSP3Constants.sol";
```
