# LSP6 Key Manager &middot; [![npm version](https://img.shields.io/npm/v/@lukso/lsp6-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp6-contracts)

npm package for the LSP6 Key Manager standard. It can be used with a Universal Profile or an LSP7/8 Token contract to manage these contracts from multiple addresses (_"controllers"_), with multiple permissions and fine-grained access control.

## Installation

```bash
npm install @lukso/lsp6-contracts
```

## Available Constants & Types

The `@lukso/lsp6-contracts` npm package contains useful constants such as interface IDs or ERC725Y Data Keys related to the LSP6 Standard. You can import and access them as follows.

In JavaScript.

```javascript
import {
  INTERFACE_ID_LSP6,
  LSP6DataKeys,
  ERC1271_VALUES,
  CALLTYPE,
  ALL_PERMISSIONS,
  PERMISSIONS,
  LSP6PermissionName,
} from "@lukso/lsp6-contracts";
```

In Solidity.

<!-- prettier-ignore -->
```solidity
import {
  _INTERFACEID_ERC1271,
  _ERC1271_SUCCESSVALUE,
  _ERC1271_FAILVALUE
} from "@lukso/lsp6-contracts/contracts/constants.sol";
```

## TypeScript types

You can also import the [type-safe ABI](https://abitype.dev/) from the `/abi` path.

```ts
import {
  lsp6KeyManagerAbi,
  lsp6KeyManagerInitAbi,
} from "@lukso/lsp6-contracts/abi";
```
