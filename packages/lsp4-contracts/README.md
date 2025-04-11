# LSP4 Digital Asset Metadata &middot; [![npm version](https://img.shields.io/npm/v/@lukso/lsp4-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp4-contracts)

Package for the LSP4 Digital Asset Metadata standard.

## Installation

```console
npm install @lukso/lsp4-contracts
```

## Available Constants & Types

The `@lukso/lsp4-contracts` npm package contains useful constants such as ERC725Y data keys related to the LSP4 Standard. You can import and access them as follows.

In Javascript.

```js
import {
  LSP4_TOKEN_TYPES,
  LSP4SupportedStandard,
  LSP4DataKeys,
  LSP4DigitalAssetMetadataJSON,
  LSP4DigitalAssetMetadata,
  LinkMetadata,
  ImageMetadata,
  AssetMetadata,
  AttributeMetadata,
} from "@lukso/lsp4-contracts";
```

In Solidity.

<!-- prettier-ignore -->
```solidity
import {
  _LSP4_TOKEN_TYPE_TOKEN,
  _LSP4_TOKEN_TYPE_NFT,
  _LSP4_TOKEN_TYPE_COLLECTION,
  _LSP4_SUPPORTED_STANDARDS_KEY,
  _LSP4_SUPPORTED_STANDARDS_VALUE,
  _LSP4_TOKEN_NAME_KEY,
  _LSP4_TOKEN_SYMBOL_KEY,
  _LSP4_TOKEN_TYPE_KEY,
  _LSP4_CREATORS_ARRAY_KEY,
  _LSP4_CREATORS_MAP_KEY_PREFIX,
  _LSP4_METADATA_KEY
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
```
