<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# ILSP1UniversalReceiver

:::info Standard Specifications

[`LSP-1-UniversalReceiver`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-1-UniversalReceiver.md)

:::
:::info Solidity implementation

[`ILSP1UniversalReceiver.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp1-contracts/contracts/ILSP1UniversalReceiver.sol)

:::

> Interface of the LSP1

- Universal Receiver standard, an entry function for a contract to receive arbitrary information.

LSP1UniversalReceiver allows to receive arbitrary messages and to be informed when assets are sent or received.

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### universalReceiver

:::note References

- Specification details: [**LSP-1-UniversalReceiver**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-1-UniversalReceiver.md#universalreceiver)
- Solidity implementation: [`ILSP1UniversalReceiver.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp1-contracts/contracts/ILSP1UniversalReceiver.sol)
- Function signature: `universalReceiver(bytes32,bytes)`
- Function selector: `0x6bb56a14`

:::

```solidity
function universalReceiver(
  bytes32 typeId,
  bytes data
) external payable returns (bytes);
```

_Reacted on received notification with `typeId` & `data`._

Generic function that can be used to notify the contract about specific incoming transactions or events like asset transfers, vault transfers, etc. Allows for custom on-chain and off-chain reactions based on the `typeId` and `data`.

<blockquote>

**Emitted events:**

- [`UniversalReceiver`](#universalreceiver) event.

</blockquote>

#### Parameters

| Name     |   Type    | Description                                |
| -------- | :-------: | ------------------------------------------ |
| `typeId` | `bytes32` | The hash of a specific standard or a hook. |
| `data`   |  `bytes`  | The arbitrary data received with the call. |

#### Returns

| Name |  Type   | Description |
| ---- | :-----: | ----------- |
| `0`  | `bytes` | -           |

<br/>

## Events

### UniversalReceiver

:::note References

- Specification details: [**LSP-1-UniversalReceiver**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-1-UniversalReceiver.md#universalreceiver)
- Solidity implementation: [`ILSP1UniversalReceiver.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp1-contracts/contracts/ILSP1UniversalReceiver.sol)
- Event signature: `UniversalReceiver(address,uint256,bytes32,bytes,bytes)`
- Event topic hash: `0x9c3ba68eb5742b8e3961aea0afc7371a71bf433c8a67a831803b64c064a178c2`

:::

```solidity
event UniversalReceiver(
  address indexed from,
  uint256 indexed value,
  bytes32 indexed typeId,
  bytes receivedData,
  bytes returnedValue
);
```

\*Address `from` called the `universalReceiver(...)` function while sending `value` LYX. Notification type (typeId): `typeId`

- Data received: `receivedData`.\*

Emitted when the [`universalReceiver`](#universalreceiver) function was called with a specific `typeId` and some `receivedData`

#### Parameters

| Name                   |   Type    | Description                                                                                                                                                                              |
| ---------------------- | :-------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `from` **`indexed`**   | `address` | The address of the EOA or smart contract that called the [`universalReceiver(...)`](#universalreceiver) function.                                                                        |
| `value` **`indexed`**  | `uint256` | The amount sent to the [`universalReceiver(...)`](#universalreceiver) function.                                                                                                          |
| `typeId` **`indexed`** | `bytes32` | A `bytes32` unique identifier (= _"hook"_) that describe the type of notification, information or transaction received by the contract. Can be related to a specific standard or a hook. |
| `receivedData`         |  `bytes`  | Any arbitrary data that was sent to the [`universalReceiver(...)`](#universalreceiver) function.                                                                                         |
| `returnedValue`        |  `bytes`  | The value returned by the [`universalReceiver(...)`](#universalreceiver) function.                                                                                                       |

<br/>
