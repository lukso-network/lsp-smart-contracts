# `@lukso/lsp-smart-contracts`

This is the _"umbrella"_ package for the LSP smart contracts. It contains all the individual `@lukso/lspN-contracts` packages (where `N` is an LSP number) as dependencies.

## Installation

```console
npm install @lukso/lsp-smart-contracts
```

## Usage

### in Javascript

The JSON ABIs of the smart contracts can be imported as follow:

```javascript
import LSP0ERC725Account from "@lukso/lsp-smart-contracts/artifacts/LSP0ERC725Account.json";

const myContract = new web3.eth.Contract(
  LSP0ERC725Account.abi,
  "",
  defaultOptions
);
```

### in Solidity

```sol
import "@lukso/lsp-smart-contracts/contracts/LSP0ERC725Account/LSP0ERC725Account.sol";

contract MyAccount is LSP0ERC725Account {
  constructor(address _newOwner) LSP0ERC725Account(_newOwner) {}
}
```

## Available Constants & Types

The `@lukso/lsp-smart-contracts` npm package contains useful constants such as interface IDs, and ERC725Y data keys related to the LSP Standards. You can import and access them as follows.

```js
import {
  INTERFACE_IDS,
  ERC1271,
  LSP8_TOKEN_ID_FORMAT,
  LSP1_TYPE_IDS,
  OPERATION_TYPES,
  PERMISSIONS,
  ALL_PERMISSIONS,
  SupportedStandards,
  ERC725YDataKeys,
  INTERFACE_ID_LSP1DELEGATE,
  LSP6DataKeys,
  LSP25_VERSION,
  LSPSupportedStandard,
  ErrorSelectors,
  EventSigHashes,
  FunctionSelectors,
  ContractsDocs,
  StateVariables,
} from "@lukso/lsp-smart-contracts";
```

> **Note:** we also export it as `@lukso/lsp-smart-contracts/constants` or `@lukso/lsp-smart-contracts/constants.js` to keep it backward compatible.

It also includes constant values [Array data keys](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md#Array) to retrieve both the array length and for index access.

```js
'LSP5ReceivedAssets[]': {
    length: '0x6460ee3c0aac563ccbf76d6e1d07bada78e3a9514e6382b736ed3f478ab7b90b',
    index: '0x6460ee3c0aac563ccbf76d6e1d07bada',
},
```

### Note for Hardhat Typescript projects

If you are trying to import the constants in a Hardhat project that uses Typescript, you will need to import the constants from the `dist` folder directly, as shown in the code snippet:

```js
import { INTERFACE_IDS } from "@lukso/lsp-smart-contracts/dist/constants.cjs.js";

// This will raise an error if you have ES Lint enabled,
// but will allow you to import the constants in a Hardhat + Typescript based project.
const LSP0InterfaceId = INTERFACE_IDS.LSP0ERC725Account;
```

See the [issue related to Hardhat Typescript + ES Modules](https://hardhat.org/hardhat-runner/docs/advanced/using-esm#esm-and-typescript-projects) in the Hardhat docs for more infos.

## Typescript types

The following additional typescript types are also available, including types for the JSON format of the LSP3 Profile and LSP4 Digital Asset metadata.

```ts
import {
  LSP2ArrayKey,
  LSPSupportedStandard,
  LSP6PermissionName,
  LSP3ProfileMetadataJSON,
  LSP3ProfileMetadata,
  LSP4DigitalAssetMetadataJSON,
  LSP4DigitalAssetMetadata,
  ImageMetadata,
  LinkMetadata,
  AssetMetadata,
} from "@lukso/lsp-smart-contracts";
```

You can also import the [type-safe ABI](https://abitype.dev/) of each LSP smart contracts from the `/abi` path.

```ts
import {
  lsp0Erc725AccountAbi,
  lsp6KeyManagerAbi,
  lsp7DigitalAssetAbi,
  lsp8IdentifiableDigitalAssetAbi,
} from "@lukso/lsp-smart-contracts/abi";
```
