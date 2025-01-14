# `@lukso/lsp-smart-contracts`

This is the _"umbrella"_ package for the LSP smart contracts. It contains all the individual `@lukso/lspN-contracts` packages (where `N` is an LSP number) as dependencies.

## Installation

```console
npm install @lukso/lsp-smart-contracts
```

## Available Constants & Types

The `@lukso/lsp-smart-contracts` npm package contains useful constants such as interface IDs, and ERC725Y data keys related to the LSP Standards. You can import and access them as follows:

```js
import {
  INTERFACE_IDS,
  LSP8_TOKEN_ID_FORMAT,
  LSP1_TYPE_IDS,
  OPERATIONS,
  SupportedStandards,
  ERC725YDataKeys,
  INTERFACE_ID_LSP1DELEGATE,
  LSP6DataKeys,
  LSP25_VERSION,
  LSPSupportedStandard,
} from "@lukso/lsp-smart-contracts";
```
