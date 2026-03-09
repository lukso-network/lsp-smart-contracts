<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# ILSP1UniversalReceiverDelegate

:::info Standard Specifications

[`LSP-1-UniversalReceiver`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-1-UniversalReceiver.md)

:::
:::info Solidity implementation

[`ILSP1UniversalReceiverDelegate.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp1-contracts/contracts/ILSP1UniversalReceiverDelegate.sol)

:::

> Interface of the LSP1

- Universal Receiver Delegate standard.

This interface allows contracts implementing the LSP1UniversalReceiver function to delegate the reaction logic to another contract or account. By doing so, the main logic doesn't need to reside within the `universalReceiver` function itself, offering modularity and flexibility.

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### universalReceiverDelegate

:::note References

- Specification details: [**LSP-1-UniversalReceiver**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-1-UniversalReceiver.md#universalreceiverdelegate)
- Solidity implementation: [`ILSP1UniversalReceiverDelegate.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp1-contracts/contracts/ILSP1UniversalReceiverDelegate.sol)
- Function signature: `universalReceiverDelegate(address,uint256,bytes32,bytes)`
- Function selector: `0xa245bbda`

:::

```solidity
function universalReceiverDelegate(
  address sender,
  uint256 value,
  bytes32 typeId,
  bytes data
) external nonpayable returns (bytes);
```

_Reacted on received notification forwarded from `universalReceiver` with `typeId` & `data`._

A delegate function that reacts to calls forwarded from the `universalReceiver(..)` function. This allows for modular handling of the logic based on the `typeId` and `data` provided by the initial caller.

#### Parameters

| Name     |   Type    | Description                                                                                      |
| -------- | :-------: | ------------------------------------------------------------------------------------------------ |
| `sender` | `address` | The address of the EOA or smart contract that initially called the `universalReceiver` function. |
| `value`  | `uint256` | The amount sent by the `sender` to the `universalReceiver` function.                             |
| `typeId` | `bytes32` | The hash of a specific standard or a hook.                                                       |
| `data`   |  `bytes`  | The arbitrary data received with the initial call to `universalReceiver`.                        |

#### Returns

| Name |  Type   | Description |
| ---- | :-----: | ----------- |
| `0`  | `bytes` | -           |

<br/>
