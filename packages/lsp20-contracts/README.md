# LSP20 Call Verification &middot; [![npm version](https://img.shields.io/npm/v/@lukso/lsp20-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp20-contracts)

Package for the LSP20 Call Verification standard.

## Installation

```bash
npm i @lukso/lsp20-contracts
```

## Available Constants & Types

The `@lukso/lsp20-contracts` npm package contains useful constants such as interface IDs, and specific constants related to the LSP20 Standard. You can import and access them as follows.

In Javascript.

```javascript
import {
  LSP20_SUCCESS_VALUES,
  INTERFACE_ID_LSP20CallVerifier,
  INTERFACE_ID_LSP20CallVerification,
} from "@lukso/lsp20-contracts";
```

In Solidity.

<!-- prettier-ignore -->
```solidity
import {
  _INTERFACEID_LSP20_CALL_VERIFICATION,
  _INTERFACEID_LSP20_CALL_VERIFIER,
  _LSP20_VERIFY_CALL_SUCCESS_VALUE_WITH_POST_VERIFICATION,
  _LSP20_VERIFY_CALL_SUCCESS_VALUE_WITHOUT_POST_VERIFICATION,
  _LSP20_VERIFY_CALL_RESULT_SUCCESS_VALUE
} from "@lukso/lsp20-contracts/contracts/LSP20Constants.sol";
```
