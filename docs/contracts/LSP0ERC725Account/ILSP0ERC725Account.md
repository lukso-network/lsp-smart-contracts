<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# ILSP0ERC725Account

:::info Standard Specifications

[`LSP-0-ERC725Account`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-0-ERC725Account.md)

:::
:::info Solidity implementation

[`ILSP0ERC725Account.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp0-contracts/contracts/ILSP0ERC725Account.sol)

:::

> Interface of the [LSP-0-ERC725Account] standard, an account based smart contract that represents an identity on-chain.

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### batchCalls

:::note References

- Specification details: [**LSP-0-ERC725Account**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-0-ERC725Account.md#batchcalls)
- Solidity implementation: [`ILSP0ERC725Account.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp0-contracts/contracts/ILSP0ERC725Account.sol)
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
