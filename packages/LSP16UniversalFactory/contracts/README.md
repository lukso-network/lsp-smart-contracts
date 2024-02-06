# LSP16UniversalFactory.sol

## Overview

According to [LSP16-UniversalFactory](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-16-UniversalFactory.md) specification, [`LSP16UniversalFactory.sol`](./LSP16UniversalFactory.sol) is a universal factory smart contract, that will allow to deploy different types of smart contracts using [CREATE2] opcode after being deployed with [Nick Factory] in order to produce the same address on different chains.

## Bytecode Stability

**It is crucial to note that the bytecode of this factory must remain unchanged. Therefore, any modifications to the contract's code are not permitted.** While contributions in the form of new features, ideas, or adjustments to the Natspec documentation are appreciated, such changes are unfortunately not feasible. This is because any alteration to the contract would result in a new bytecode, which contradicts the contract's fundamental design principle.

## Deployment Guidelines

The factory should not be deployed directly from a floating branch in the repository or the package. Instead, it must be deployed from a specific commit, adhering to the configuration listed below:

- Openzeppelin package version: `"@openzeppelin/contracts": "^4.9.2"`
- The source code is generated with `0.8.17` compiler version and with `9999999` optimization runs.
- Checkout to `9e1519f94293b96efa2ebc8f459fde65cc43fecd` commit in the [lsp-smart-contract](https://github.com/lukso-network/lsp-smart-contracts) repo to obtain the exact copy of the code, change the compiler settings in `hardhat.config.ts` and compile to produce the same bytecode.

[CREATE2]: https://eips.ethereum.org/EIPS/eip-1014
[Nick Factory]: https://github.com/Arachnid/deterministic-deployment-proxy
