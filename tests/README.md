# Testing Guide

This document provides instructions on how to run tests for the project.

## Initial Setup

Before running the tests, ensure that you have all the necessary modules installed and the contracts are built. Follow these steps:

1. Install the required modules:

```bash
npm install
```

2. Build the contracts:

```bash
npm run build
```

## Running Tests

To run the tests, use the `npm run test:{lsp}` command. Replace `{lsp}` with the specific test script you want to execute. Here are the available test script options with their descriptions:

- `test`: Runs all tests in order.
- `test:benchmark`: Executes benchmark tests related to gas cost.
- `test:parallel`: Runs the tests in parallel, allowing for simultaneous execution.
- `test:mocks`: Executes tests for mock contracts (typically used for testing purposes), **ERC165 interface IDs and constants from `constants.ts` checks**.
- `test:up`: Runs tests for the UniversalProfile contract.
- `test:upinit`: Executes tests for the initializable version of the UniversalProfile contract.
- `test:lsp1`: Runs tests for the LSP1UniversalReceiver contracts.
- `test:lsp2`: Executes tests for the LSP2ERC725YJSONSchema contracts.
- `test:lsp4`: Runs tests for the LSP4DigitalAssetMetadata contracts.
- `test:lsp6`: Executes tests for the LSP6KeyManager contracts.
- `test:lsp6init`: Runs tests for the initializable version of the LSP6KeyManager contracts.
- `test:lsp7`: Runs tests for the LSP7DigitalAsset contracts.
- `test:lsp7init`: Executes tests for the initializable version of the LSP7DigitalAsset contracts.
- `test:lsp8`: Runs tests for the LSP8IdentifiableDigitalAsset contracts.
- `test:lsp8init`: Executes tests for the initializable version of the LSP8IdentifiableDigitalAsset contracts.
- `test:lsp9`: Runs tests for the LSP9Vault contracts.
- `test:lsp9init`: Executes tests for the initializable version of the LSP9Vault contracts.
- `test:lsp11`: Runs tests for the LSP11BasicSocialRecovery contracts.
- `test:lsp11init`: Executes tests for the initializable version of the LSP11BasicSocialRecovery contracts.
- `test:lsp17`: Runs tests for the LSP17ContractExtension contracts.
- `test:lsp17extensions`: Executes tests for extensions contracts following the LSP17 standards.
- `test:lsp20`: Runs tests for the contracts following the LSP20 standards.
- `test:lsp20init`: Executes tests for the initializable version of the contracts following the LSP20 standards.
- `test:lsp23`: Executes tests for the LSP23LinkedContractsFactory contract.
- `test:lsp25`: Runs tests for the contracts following the LSP25 standard.
- `test:universalfactory`: Executes tests for the LSP16UniversalFactory contract.
- `test:reentrancy`: Runs reentrancy tests, particularly for UniversalProfile and LSP6KeyManager.

For example, to run the `test:lsp1` script, you would use:

```bash
npm run test:lsp1
```

## Running Foundry Tests

To run the Foundry tests, use the following command:

```bash
npm run test:foundry
```
