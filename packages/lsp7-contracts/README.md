# LSP7 Digital Asset &middot; [![npm version](https://img.shields.io/npm/v/@lukso/lsp7-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp7-contracts)

Package for the LSP7 Digital Asset standard.

> The contracts [`LSP7Votes`](contracts/extensions/LSP7Votes.sol) and [`LSP7VotesInitiAbstract`](contracts/extensions/LSP7VotesInitAbstract.sol) have not been formally audited by an external third party and are not recommended to be used in production without undergoing an independent security audit.

## Installation

```console
npm install @lukso/lsp7-contracts
```

## Available Constants & Types

The `@lukso/lsp7-contracts` npm package contains useful constants such as interface IDs or ERC725Y data keys related to the LSP7 Standard. You can import and access them as follows.

In Javascript.

```js
import {
  INTERFACE_ID_LSP7,
  INTERFACE_ID_LSP7_PREVIOUS,
  LSP7_TYPE_IDS,
} from "@lukso/lsp7-contracts";
```

In Solidity.

<!-- prettier-ignore -->
```solidity
import {
  _INTERFACEID_LSP7,
  _INTERFACEID_LSP7_V0_12_0,
  _INTERFACEID_LSP7_V0_14_0,
  _TYPEID_LSP7_DELEGATOR,
  _TYPEID_LSP7_DELEGATEE,
  _TYPEID_LSP7_TOKENSSENDER,
  _TYPEID_LSP7_TOKENSRECIPIENT,
  _TYPEID_LSP7_TOKENOPERATOR
} from "@lukso/lsp7-contracts/contracts/LSP7Constants.sol";
```

The `LSP7_TYPE_IDS` includes type IDs for the following type of notifications:

```console
'LSP7Tokens_SenderNotification';
'LSP7Tokens_RecipientNotification';
'LSP7Tokens_OperatorNotification';
'LSP7Tokens_VotesDelegatorNotification';
'LSP7Tokens_VotesDelegateeNotification';
```

## Typescript types

You can also import the [type-safe ABI](https://abitype.dev/) from the `/abi` path.

```ts
import {
    // standard version
    lsp7DigitalAssetAbi,
    lsp7CappedSupplyAbi,
    lsp7MintableAbi,
    lsp7VotesAbi
    // proxy version
    lsp7CappedSupplyInitAbstractAbi,
    lsp7DigitalAssetInitAbstractAbi,
    lsp7MintableInitAbi,
 } from '@lukso/lsp7-contracts/abi';
```
