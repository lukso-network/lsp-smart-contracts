# LSP8 Identifiable Digital Asset &middot; [![npm version](https://img.shields.io/npm/v/@lukso/lsp8-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp8-contracts)

Package for the LSP8 Identifiable Digital Asset Standard.

> The contracts [`LSP8Votes`](contracts/extensions/LSP8Votes.sol) and [`LSP8VotesInitiAbstract`](contracts/extensions/LSP8VotesInitAbstract.sol) have not been formally audited by an external third party and are not recommended to be used in production without undergoing an independent security audit.

## Installation

```console
npm install @lukso/lsp8-contracts
```

## Available Constants & Types

The `@lukso/lsp8-contracts` npm package contains useful constants such as interface IDs or ERC725Y data keys related to the LSP8 Standard. You can import and access them as follows.

In Javascript.

```js
import {
  INTERFACE_ID_LSP8,
  INTERFACE_ID_LSP8_PREVIOUS,
  LSP8DataKeys,
  LSP8_TYPE_IDS,
  LSP8_TOKEN_ID_FORMAT,
} from "@lukso/lsp8-contracts";
```

In Solidity.

<!-- prettier-ignore -->
```solidity
import {
  _INTERFACEID_LSP8,
  _INTERFACEID_LSP8_V0_12_0,
  _INTERFACEID_LSP8_V0_14_0,
  _LSP8_TOKENID_FORMAT_KEY,
  _LSP8_TOKEN_METADATA_BASE_URI,
  _LSP8_REFERENCE_CONTRACT,
  _TYPEID_LSP8_TOKENSSENDER,
  _TYPEID_LSP8_TOKENSRECIPIENT,
  _TYPEID_LSP8_TOKENOPERATOR,
  _LSP8_TOKENID_FORMAT_NUMBER,
  _LSP8_TOKENID_FORMAT_STRING,
  _LSP8_TOKENID_FORMAT_ADDRESS,
  _LSP8_TOKENID_FORMAT_UNIQUE_ID,
  _LSP8_TOKENID_FORMAT_HASH,
  _LSP8_TOKENID_FORMAT_MIXED_DEFAULT_NUMBER,
  _LSP8_TOKENID_FORMAT_MIXED_DEFAULT_STRING,
  _LSP8_TOKENID_FORMAT_MIXED_DEFAULT_ADDRESS,
  _LSP8_TOKENID_FORMAT_MIXED_DEFAULT_UNIQUE_ID,
  _LSP8_TOKENID_FORMAT_MIXED_DEFAULT_HASH
} from "@lukso/lsp8-contracts/contracts/LSP8Constants.sol";
```

## Typescript types

You can also import the [type-safe ABI](https://abitype.dev/) from the `/abi` path.

```ts
import {
    // standard version
    lsp8IdentifiableDigitalAssetAbi,
    lsp8CappedSupplyAbi,
    lsp8MintableAbi,
    lsp8VotesAbi
    // proxy version
    lsp8CappedSupplyInitAbstractAbi,
    lsp8IdentifiableDigitalAssetInitAbstractAbi,
    lsp8MintableInitAbi,
 } from '@lukso/lsp8-contracts/abi';
```
