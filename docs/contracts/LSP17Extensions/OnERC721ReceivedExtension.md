<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# OnERC721ReceivedExtension

:::info Standard Specifications

[`LSP-17-Extensions`](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-17-Extensions.md)

:::
:::info Solidity implementation

[`OnERC721ReceivedExtension.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP17Extensions/OnERC721ReceivedExtension.sol)

:::

LSP17 Extension that can be attached to a LSP17Extendable contract to allow it to receive ERC721 tokens via `safeTransferFrom`.

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### VERSION

:::note References

- Specification details: [**LSP-17-Extensions**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-17-Extensions.md#version)
- Solidity implementation: [`OnERC721ReceivedExtension.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP17Extensions/OnERC721ReceivedExtension.sol)
- Function signature: `VERSION()`
- Function selector: `0xffa1ad74`

:::

```solidity
function VERSION() external view returns (string);
```

_Contract version._

#### Returns

| Name |   Type   | Description |
| ---- | :------: | ----------- |
| `0`  | `string` | -           |

<br/>

### onERC721Received

:::note References

- Specification details: [**LSP-17-Extensions**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-17-Extensions.md#onerc721received)
- Solidity implementation: [`OnERC721ReceivedExtension.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP17Extensions/OnERC721ReceivedExtension.sol)
- Function signature: `onERC721Received(address,address,uint256,bytes)`
- Function selector: `0x150b7a02`

:::

```solidity
function onERC721Received(
  address,
  address,
  uint256,
  bytes
) external nonpayable returns (bytes4);
```

See [`IERC721Receiver-onERC721Received`](#ierc721receiver-onerc721received). Always returns `IERC721Receiver.onERC721Received.selector`.

#### Parameters

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `_0` | `address` | -           |
| `_1` | `address` | -           |
| `_2` | `uint256` | -           |
| `_3` |  `bytes`  | -           |

#### Returns

| Name |   Type   | Description |
| ---- | :------: | ----------- |
| `0`  | `bytes4` | -           |

<br/>

### supportsInterface

:::note References

- Specification details: [**LSP-17-Extensions**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-17-Extensions.md#supportsinterface)
- Solidity implementation: [`OnERC721ReceivedExtension.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP17Extensions/OnERC721ReceivedExtension.sol)
- Function signature: `supportsInterface(bytes4)`
- Function selector: `0x01ffc9a7`

:::

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool);
```

See [`IERC165-supportsInterface`](#ierc165-supportsinterface).

#### Parameters

| Name          |   Type   | Description |
| ------------- | :------: | ----------- |
| `interfaceId` | `bytes4` | -           |

#### Returns

| Name |  Type  | Description |
| ---- | :----: | ----------- |
| `0`  | `bool` | -           |

<br/>

## Internal Methods

Any method labeled as `internal` serves as utility function within the contract. They can be used when writing solidity contracts that inherit from this contract. These methods can be extended or modified by overriding their internal behavior to suit specific needs.

Internal functions cannot be called externally, whether from other smart contracts, dApp interfaces, or backend services. Their restricted accessibility ensures that they remain exclusively available within the context of the current contract, promoting controlled and encapsulated usage of these internal utilities.

### \_extendableMsgData

```solidity
function _extendableMsgData() internal view returns (bytes);
```

Returns the original `msg.data` passed to the extendable contract
without the appended `msg.sender` and `msg.value`.

<br/>

### \_extendableMsgSender

```solidity
function _extendableMsgSender() internal view returns (address);
```

Returns the original `msg.sender` calling the extendable contract.

<br/>

### \_extendableMsgValue

```solidity
function _extendableMsgValue() internal view returns (uint256);
```

Returns the original `msg.value` sent to the extendable contract.

<br/>
