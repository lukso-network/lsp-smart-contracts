<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# ERCTokenCallbacks

:::info Solidity implementation

[`ERCTokenCallbacks.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp17contractextension-contracts/contracts/ERCTokenCallbacks.sol)

:::

> Module to create a contract that can act as an extension.

_Simple implementation of `ERC1155Receiver` that will allow a contract to hold ERC1155 tokens. IMPORTANT: When inheriting this contract, you must include a way to use the received tokens, otherwise they will be stuck._

LSP17 Extension that can be attached to a LSP17Extendable contract to allow it to receive ERC721 tokens via `safeTransferFrom`.

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### VERSION

:::note References

- Solidity implementation: [`ERCTokenCallbacks.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp17contractextension-contracts/contracts/ERCTokenCallbacks.sol)
- Function signature: `VERSION()`
- Function selector: `0xffa1ad74`

:::

```solidity
function VERSION() external view returns (string);
```

_Contract version._

Get the version of the contract.

#### Returns

| Name |   Type   | Description                      |
| ---- | :------: | -------------------------------- |
| `0`  | `string` | The version of the the contract. |

<br/>

### onERC1155BatchReceived

:::note References

- Solidity implementation: [`ERCTokenCallbacks.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp17contractextension-contracts/contracts/ERCTokenCallbacks.sol)
- Function signature: `onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)`
- Function selector: `0xbc197c81`

:::

```solidity
function onERC1155BatchReceived(
  address _0,
  address _1,
  uint256[] _2,
  uint256[] _3,
  bytes _4
) external nonpayable returns (bytes4);
```

Handles the receipt of a multiple ERC1155 token types. This function is called at the end of a `safeBatchTransferFrom` after the balances have been updated. NOTE: To accept the transfer(s), this must return `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))` (i.e. 0xbc197c81, or its own function selector).

#### Parameters

| Name |    Type     | Description |
| ---- | :---------: | ----------- |
| `_0` |  `address`  | -           |
| `_1` |  `address`  | -           |
| `_2` | `uint256[]` | -           |
| `_3` | `uint256[]` | -           |
| `_4` |   `bytes`   | -           |

#### Returns

| Name |   Type   | Description                                                                                                     |
| ---- | :------: | --------------------------------------------------------------------------------------------------------------- |
| `0`  | `bytes4` | `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))` if transfer is allowed |

<br/>

### onERC1155Received

:::note References

- Solidity implementation: [`ERCTokenCallbacks.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp17contractextension-contracts/contracts/ERCTokenCallbacks.sol)
- Function signature: `onERC1155Received(address,address,uint256,uint256,bytes)`
- Function selector: `0xf23a6e61`

:::

```solidity
function onERC1155Received(
  address _0,
  address _1,
  uint256 _2,
  uint256 _3,
  bytes _4
) external nonpayable returns (bytes4);
```

Handles the receipt of a single ERC1155 token type. This function is called at the end of a `safeTransferFrom` after the balance has been updated. NOTE: To accept the transfer, this must return `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))` (i.e. 0xf23a6e61, or its own function selector).

#### Parameters

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `_0` | `address` | -           |
| `_1` | `address` | -           |
| `_2` | `uint256` | -           |
| `_3` | `uint256` | -           |
| `_4` |  `bytes`  | -           |

#### Returns

| Name |   Type   | Description                                                                                            |
| ---- | :------: | ------------------------------------------------------------------------------------------------------ |
| `0`  | `bytes4` | `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))` if transfer is allowed |

<br/>

### onERC721Received

:::note References

- Solidity implementation: [`ERCTokenCallbacks.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp17contractextension-contracts/contracts/ERCTokenCallbacks.sol)
- Function signature: `onERC721Received(address,address,uint256,bytes)`
- Function selector: `0x150b7a02`

:::

```solidity
function onERC721Received(
  address _0,
  address _1,
  uint256 _2,
  bytes _3
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

- Solidity implementation: [`ERCTokenCallbacks.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp17contractextension-contracts/contracts/ERCTokenCallbacks.sol)
- Function signature: `supportsInterface(bytes4)`
- Function selector: `0x01ffc9a7`

:::

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool);
```

_Implements ERC165 interface support for ERC1155TokenReceiver, ERC721TokenReceiver and IERC165._

See [`IERC165-supportsInterface`](#ierc165-supportsinterface).

#### Parameters

| Name          |   Type   | Description          |
| ------------- | :------: | -------------------- |
| `interfaceId` | `bytes4` | Id of the interface. |

#### Returns

| Name |  Type  | Description                    |
| ---- | :----: | ------------------------------ |
| `0`  | `bool` | if the interface is supported. |

<br/>

### tokensReceived

:::note References

- Solidity implementation: [`ERCTokenCallbacks.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp17contractextension-contracts/contracts/ERCTokenCallbacks.sol)
- Function signature: `tokensReceived(address,address,address,uint256,bytes,bytes)`
- Function selector: `0x0023de29`

:::

```solidity
function tokensReceived(
  address operator,
  address from,
  address to,
  uint256 amount,
  bytes userData,
  bytes operatorData
) external nonpayable;
```

Called by an [`IERC777`](#ierc777) token contract whenever tokens are being moved or created into a registered account (`to`). The type of operation is conveyed by `from` being the zero address or not. This call occurs _after_ the token contract's state is updated, so [`IERC777-balanceOf`](#ierc777-balanceof), etc., can be used to query the post-operation state. This function may revert to prevent the operation from being executed.

#### Parameters

| Name           |   Type    | Description |
| -------------- | :-------: | ----------- |
| `operator`     | `address` | -           |
| `from`         | `address` | -           |
| `to`           | `address` | -           |
| `amount`       | `uint256` | -           |
| `userData`     |  `bytes`  | -           |
| `operatorData` |  `bytes`  | -           |

<br/>

## Internal Methods

Any method labeled as `internal` serves as utility function within the contract. They can be used when writing solidity contracts that inherit from this contract. These methods can be extended or modified by overriding their internal behavior to suit specific needs.

Internal functions cannot be called externally, whether from other smart contracts, dApp interfaces, or backend services. Their restricted accessibility ensures that they remain exclusively available within the context of the current contract, promoting controlled and encapsulated usage of these internal utilities.

### \_extendableMsgData

```solidity
function _extendableMsgData() internal view returns (bytes);
```

Returns the original `msg.data` passed to the extendable contract without the appended `msg.sender` and `msg.value`.

#### Returns

| Name |  Type   | Description |
| ---- | :-----: | ----------- |
| `0`  | `bytes` | -           |

<br/>

### \_extendableMsgSender

```solidity
function _extendableMsgSender() internal view returns (address);
```

Returns the original `msg.sender` calling the extendable contract.

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `address` | -           |

<br/>

### \_extendableMsgValue

```solidity
function _extendableMsgValue() internal view returns (uint256);
```

Returns the original `msg.value` sent to the extendable contract.

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `uint256` | -           |

<br/>
