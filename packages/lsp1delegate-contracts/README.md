# LSP1 Universal Receiver Delegate &middot; [![npm version](https://img.shields.io/npm/v/@lukso/lsp1delegate-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/lsp1delegate-contracts)

Smart contract implementations of [LSP1 Universal Receiver Delegate](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-1-UniversalReceiver.md#universalreceiver-delegation)
to register and manage:

- LSP5 Received Assets
- LSP10 Vaults

Currently there are Universal Receiver Delegate contracts for:

- [Universal Profile](./contracts/LSP1UniversalReceiverDelegateUP.sol)
- [Vault](./contracts/LSP1UniversalReceiverDelegateVault.sol)

## Installation

```bash
npm install @lukso/lsp1delegate-contracts
```

## Available Constants & Types

The `@lukso/lsp1delegate-contracts` npm package contains useful constants such as InterfaceIds related to the LSP1Delegate Standard. You can import and access them as follow:

```js
import { INTERFACE_ID_LSP1DELEGATE } from "@lukso/lsp1delegate-contracts";
```
