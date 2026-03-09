<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# ILSP9Vault

:::info Standard Specifications

[`LSP-9-Vault`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-9-Vault.md)

:::
:::info Solidity implementation

[`ILSP9Vault.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp9-contracts/contracts/ILSP9Vault.sol)

:::

> Interface of LSP9

- Vault standard, a blockchain vault that can hold assets and interact with other smart contracts.

Could be owned by an EOA or by a contract and is able to receive and send assets. Also allows for registering received assets by leveraging the key-value storage.

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### batchCalls

:::note References

- Specification details: [**LSP-9-Vault**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-9-Vault.md#batchcalls)
- Solidity implementation: [`ILSP9Vault.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp9-contracts/contracts/ILSP9Vault.sol)
- Function signature: `batchCalls(bytes[])`
- Function selector: `0x6963d438`

:::

```solidity
function batchCalls(bytes[] data) external nonpayable returns (bytes[] results);
```

_Executing the following batch of abi-encoded function calls on the contract: `data`._

Allows a caller to batch different function calls in one call. Perform a `delegatecall` on self, to call different functions with preserving the context.

#### Parameters

| Name   |   Type    | Description                                                          |
| ------ | :-------: | -------------------------------------------------------------------- |
| `data` | `bytes[]` | An array of ABI encoded function calls to be called on the contract. |

#### Returns

| Name      |   Type    | Description                                                      |
| --------- | :-------: | ---------------------------------------------------------------- |
| `results` | `bytes[]` | An array of abi-encoded data returned by the functions executed. |

<br/>
