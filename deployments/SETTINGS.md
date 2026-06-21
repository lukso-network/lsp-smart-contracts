# Contracts Settings

## Deployment salts

| Contract                                                    | Salt                                                                 |
| ----------------------------------------------------------- | -------------------------------------------------------------------- |
| `LSP23LinkedContractsFactory`                               | `0x12a6712f113536d8b01d99f72ce168c7e1090124db54cd16f03c20000022178c` |
| `UniversalProfileInitPostDeploymentModule`                  | `0x12a6712f113536d8b01d99f72ce168c7e10901240d73e80eeb821d01aa4c2b1a` |
| `UniversalProfilePostDeploymentModule`                      | `0x42ff55d7957589c62da54a4368b10a2bc549f2038bbb6880ec6b3e0ecae2ba58` |
| `UniversalProfileInit` (both v0.12.1 and 0.14.0)            | `0xfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeed` |
| `LSP6KeyManagerInit` (both v0.12.1 and 0.14.0)              | `0xfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeed` |
| `LSP1UniversalReceiverDelegateUP` (both v0.12.1 and 0.14.0) | `0xfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeed` |
| `LSP7MintableInit` (both v0.14.0 and v0.17.3)               | `0xfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeed` |
| `LSP8MintableInit` (both v0.14.0 and v0.17.3)               | `0xfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeed` |
| `LSP7CustomizableTokenInit` (v0.18.1)                       | `0xfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeed` |
| `LSP8CustomizableTokenInit` (v0.18.1)                       | `0xfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeed` |

## Compiler Settings

Below are the full compiler version string and the compiler settings used for the contracts deployed.

| Contract                                             | solc                    | EVM version                                                 | Optimization Runs              |
| ---------------------------------------------------- | ----------------------- | ----------------------------------------------------------- | ------------------------------ |
| `LSP23LinkedContractsFactory`                        | v0.8.17+commit.8df45f5f | London                                                      | optimizer = ON; runs=1,000     |
| `UniversalProfileInitPostDeploymentModule`           | v0.8.17+commit.8df45f5f | Marked as "Default" on explorers, <br/> but normally London | optimizer = ON; runs=9,999,999 |
| `UniversalProfilePostDeploymentModule`               | v0.8.17+commit.8df45f5f | Marked as "Default" on explorers, <br/> but normally London | optimizer = ON; runs=9,999,999 |
| `UniversalProfileInit` (v0.12.1)                     | v0.8.17+commit.8df45f5f | Marked as "Default" on explorers, <br/> but normally London | optimizer = ON; runs=1,000     |
| `UniversalProfileInit` (v0.14.0)                     | v0.8.17+commit.8df45f5f | Marked as "Default" on explorers, <br/> but normally London | optimizer = ON; runs=1,000     |
| `LSP6KeyManagerInit` (v0.12.1)                       | v0.8.17+commit.8df45f5f | Marked as "Default" on explorers, <br/> but normally London | optimizer = ON; runs=1,000     |
| `LSP6KeyManagerInit` (v0.14.0)                       | v0.8.17+commit.8df45f5f | Marked as "Default" on explorers, <br/> but normally London | optimizer = ON; runs=1,000     |
| `LSP1UniversalReceiverDelegateUP` (v0.12.1)          | v0.8.17+commit.8df45f5f | Marked as "Default" on explorers, <br/> but normally London | optimizer = ON; runs=1,000     |
| `LSP1UniversalReceiverDelegateUP` (v0.14.0)          | v0.8.17+commit.8df45f5f | Marked as "Default" on explorers, <br/> but normally London | optimizer = ON; runs=1,000     |
| `LSP7MintableInit` (v0.14.0)                         | v0.8.17+commit.8df45f5f | Marked as "Default" on explorers, <br/> but normally London | optimizer = ON; runs=1,000     |
| `LSP7MintableInit` (v0.17.3 with `disableMinting()`) | v0.8.28+commit.7893614a | Prague                                                      | optimizer = ON; runs=20,000    |
| `LSP7CustomizableTokenInit` (v0.18.1)                | v0.8.28+commit.7893614a | Prague                                                      | optimizer = ON; runs=20,000    |
| `LSP8MintableInit` (v0.14.0)                         | v0.8.17+commit.8df45f5f | Marked as "Default" on explorers, <br/> but normally London | optimizer = ON; runs=1,000     |
| `LSP8MintableInit` (v0.17.3 with `disableMinting()`) | v0.8.28+commit.7893614a | Prague                                                      | optimizer = ON; runs=20,000    |
| `LSP8CustomizableTokenInit` (v0.18.1)                | v0.8.28+commit.7893614a | Prague                                                      | optimizer = ON; runs=20,000    |

## Initialization details

| Contract                                                    | Initialization                                                  |
| ----------------------------------------------------------- | --------------------------------------------------------------- |
| `UniversalProfileInit` (both v0.12.1 and 0.14.0)            | `initialize(address initialOwner)`                              |
| `LSP6KeyManagerInit` (both v0.12.1 and 0.14.0)              | `initialize(address target_)` where `target_` is the UP address |
| `LSP1UniversalReceiverDelegateUP` (both v0.12.1 and 0.14.0) | No initialization needed.                                       |
| `LSP7MintableInit` (both v0.14.0 and v0.17.3)               | No initialization needed                                        |
| `LSP8MintableInit` (both v0.14.0 and v0.17.3)               | No initialization needed                                        |

## `deployments/contracts.json` Reference

The JSON file contains all contract build artifacts needed for deployment.

**Structure:**

- **Singletons** have a flat structure: `type`, `version`, `address`, `salt`, `compilerSettings`, `creationBytecode`, `bytecode`
- **Implementation contracts** have a `versions` array, each entry with: `version`, `address`, `salt`, `compilerSettings`, `creationBytecode`, `bytecode`, `releaseurl`

| Field              | Description                                                                      |
| ------------------ | -------------------------------------------------------------------------------- |
| `creationBytecode` | Full contract creation bytecode — concatenate with salt and send to Nick Factory |
| `bytecode`         | Runtime bytecode — what ends up on-chain after deployment, used for verification |
| `salt`             | The CREATE2 salt for deterministic address computation                           |
| `compilerSettings` | Solidity compiler version and optimization settings                              |
