<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# ILSP8IdentifiableDigitalAsset

:::info Standard Specifications

[`LSP-8-IdentifiableDigitalAsset`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md)

:::
:::info Solidity implementation

[`ILSP8IdentifiableDigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol)

:::

> Interface of the LSP8

- Identifiable Digital Asset standard, a non-fungible digital asset.

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### authorizeOperator

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#authorizeoperator)
- Solidity implementation: [`ILSP8IdentifiableDigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol)
- Function signature: `authorizeOperator(address,bytes32,bytes)`
- Function selector: `0x86a10ddd`

:::

```solidity
function authorizeOperator(
  address operator,
  bytes32 tokenId,
  bytes operatorNotificationData
) external nonpayable;
```

Allow an `operator` address to transfer or burn a specific `tokenId` on behalf of its token owner. See [`isOperatorFor`](#isoperatorfor). Notify the operator based on the LSP1-UniversalReceiver standard

<blockquote>

**Requirements:**

- `tokenId` must exist.
- caller MUST be the [`tokenOwnerOf`](#tokenownerof) `tokenId`.
- the owner of a `tokenId` cannot grant itself as an `operator` (`operator` cannot be the calling address).
- `operator` cannot be the zero address.

</blockquote>

<blockquote>

**Emitted events:**

- [`OperatorAuthorizationChanged`](#operatorauthorizationchanged) event.

</blockquote>

#### Parameters

| Name                       |   Type    | Description                                     |
| -------------------------- | :-------: | ----------------------------------------------- |
| `operator`                 | `address` | The address to authorize as an operator.        |
| `tokenId`                  | `bytes32` | The token ID operator has access to.            |
| `operatorNotificationData` |  `bytes`  | The data to notify the operator about via LSP1. |

<br/>

### balanceOf

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#balanceof)
- Solidity implementation: [`ILSP8IdentifiableDigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol)
- Function signature: `balanceOf(address)`
- Function selector: `0x70a08231`

:::

```solidity
function balanceOf(address tokenOwner) external view returns (uint256);
```

Get the number of token IDs owned by `tokenOwner`.

#### Parameters

| Name         |   Type    | Description             |
| ------------ | :-------: | ----------------------- |
| `tokenOwner` | `address` | The address to query \* |

#### Returns

| Name |   Type    | Description                                           |
| ---- | :-------: | ----------------------------------------------------- |
| `0`  | `uint256` | The total number of token IDs that `tokenOwner` owns. |

<br/>

### batchCalls

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#batchcalls)
- Solidity implementation: [`ILSP8IdentifiableDigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol)
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

### getDataBatchForTokenIds

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#getdatabatchfortokenids)
- Solidity implementation: [`ILSP8IdentifiableDigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol)
- Function signature: `getDataBatchForTokenIds(bytes32[],bytes32[])`
- Function selector: `0x1d26fce6`

:::

```solidity
function getDataBatchForTokenIds(
  bytes32[] tokenIds,
  bytes32[] dataKeys
) external nonpayable returns (bytes[] dataValues);
```

_Retrieves data in batch for multiple `tokenId` and `dataKey` pairs._

#### Parameters

| Name       |    Type     | Description                                           |
| ---------- | :---------: | ----------------------------------------------------- |
| `tokenIds` | `bytes32[]` | An array of token IDs.                                |
| `dataKeys` | `bytes32[]` | An array of data keys corresponding to the token IDs. |

#### Returns

| Name         |   Type    | Description                                                       |
| ------------ | :-------: | ----------------------------------------------------------------- |
| `dataValues` | `bytes[]` | An array of data values for each pair of `tokenId` and `dataKey`. |

<br/>

### getDataForTokenId

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#getdatafortokenid)
- Solidity implementation: [`ILSP8IdentifiableDigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol)
- Function signature: `getDataForTokenId(bytes32,bytes32)`
- Function selector: `0x16e023b3`

:::

```solidity
function getDataForTokenId(
  bytes32 tokenId,
  bytes32 dataKey
) external nonpayable returns (bytes dataValues);
```

_Retrieves data for a specific `tokenId` and `dataKey`._

#### Parameters

| Name      |   Type    | Description                        |
| --------- | :-------: | ---------------------------------- |
| `tokenId` | `bytes32` | The unique identifier for a token. |
| `dataKey` | `bytes32` | The key for the data to retrieve.  |

#### Returns

| Name         |  Type   | Description                                                       |
| ------------ | :-----: | ----------------------------------------------------------------- |
| `dataValues` | `bytes` | The data value associated with the given `tokenId` and `dataKey`. |

<br/>

### getOperatorsOf

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#getoperatorsof)
- Solidity implementation: [`ILSP8IdentifiableDigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol)
- Function signature: `getOperatorsOf(bytes32)`
- Function selector: `0x49a6078d`

:::

```solidity
function getOperatorsOf(bytes32 tokenId) external view returns (address[]);
```

Returns all `operator` addresses that are allowed to transfer or burn a specific `tokenId` on behalf of its owner.

#### Parameters

| Name      |   Type    | Description                            |
| --------- | :-------: | -------------------------------------- |
| `tokenId` | `bytes32` | The token ID to get the operators for. |

#### Returns

| Name |    Type     | Description                                                                                                  |
| ---- | :---------: | ------------------------------------------------------------------------------------------------------------ |
| `0`  | `address[]` | An array of operators allowed to transfer or burn a specific `tokenId`. Requirements - `tokenId` must exist. |

<br/>

### isOperatorFor

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#isoperatorfor)
- Solidity implementation: [`ILSP8IdentifiableDigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol)
- Function signature: `isOperatorFor(address,bytes32)`
- Function selector: `0x2a3654a4`

:::

:::info

The tokenOwner is its own operator.

:::

```solidity
function isOperatorFor(
  address operator,
  bytes32 tokenId
) external view returns (bool);
```

Returns whether `operator` address is an operator for a given `tokenId`.

<blockquote>

**Requirements:**

- `tokenId` must exist.
- caller must be the current [`tokenOwnerOf`](#tokenownerof) `tokenId`.

</blockquote>

#### Parameters

| Name       |   Type    | Description                                                   |
| ---------- | :-------: | ------------------------------------------------------------- |
| `operator` | `address` | The address to query operator status for.                     |
| `tokenId`  | `bytes32` | The token ID to check if `operator` is allowed to operate on. |

#### Returns

| Name |  Type  | Description                                                           |
| ---- | :----: | --------------------------------------------------------------------- |
| `0`  | `bool` | `true` if `operator` is an operator for `tokenId`, `false` otherwise. |

<br/>

### revokeOperator

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#revokeoperator)
- Solidity implementation: [`ILSP8IdentifiableDigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol)
- Function signature: `revokeOperator(address,bytes32,bool,bytes)`
- Function selector: `0xdb8c9663`

:::

```solidity
function revokeOperator(
  address operator,
  bytes32 tokenId,
  bool notify,
  bytes operatorNotificationData
) external nonpayable;
```

Remove access of `operator` for a given `tokenId`, disallowing it to transfer `tokenId` on behalf of its owner. See also [`isOperatorFor`](#isoperatorfor).

<blockquote>

**Requirements:**

- `tokenId` must exist.
- caller must be the [`tokenOwnerOf`](#tokenownerof) `tokenId`.
- the owner of a `tokenId` cannot grant revoke itself as an `operator` (`operator` cannot be the calling address).
- `operator` cannot be the zero address.

</blockquote>

<blockquote>

**Emitted events:**

- [`OperatorRevoked`](#operatorrevoked) event with address of the operator being revoked for the caller (token owner)..

</blockquote>

#### Parameters

| Name                       |   Type    | Description                                              |
| -------------------------- | :-------: | -------------------------------------------------------- |
| `operator`                 | `address` | The address to revoke as an operator.                    |
| `tokenId`                  | `bytes32` | The tokenId `operator` is revoked from operating on.     |
| `notify`                   |  `bool`   | Boolean indicating whether to notify the operator or not |
| `operatorNotificationData` |  `bytes`  | The data to notify the operator about via LSP1.          |

<br/>

### setDataBatchForTokenIds

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#setdatabatchfortokenids)
- Solidity implementation: [`ILSP8IdentifiableDigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol)
- Function signature: `setDataBatchForTokenIds(bytes32[],bytes32[],bytes[])`
- Function selector: `0xbe9f0e6f`

:::

```solidity
function setDataBatchForTokenIds(
  bytes32[] tokenIds,
  bytes32[] dataKeys,
  bytes[] dataValues
) external nonpayable;
```

_Sets data in batch for multiple `tokenId` and `dataKey` pairs._

<blockquote>

**Emitted events:**

- [`TokenIdDataChanged`](#tokeniddatachanged) event for each pair.

</blockquote>

#### Parameters

| Name         |    Type     | Description                                           |
| ------------ | :---------: | ----------------------------------------------------- |
| `tokenIds`   | `bytes32[]` | An array of token IDs.                                |
| `dataKeys`   | `bytes32[]` | An array of data keys corresponding to the token IDs. |
| `dataValues` |  `bytes[]`  | An array of values to set for the given data keys.    |

<br/>

### setDataForTokenId

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#setdatafortokenid)
- Solidity implementation: [`ILSP8IdentifiableDigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol)
- Function signature: `setDataForTokenId(bytes32,bytes32,bytes)`
- Function selector: `0xd6c1407c`

:::

```solidity
function setDataForTokenId(
  bytes32 tokenId,
  bytes32 dataKey,
  bytes dataValue
) external nonpayable;
```

_Sets data for a specific `tokenId` and `dataKey`._

<blockquote>

**Emitted events:**

- [`TokenIdDataChanged`](#tokeniddatachanged) event.

</blockquote>

#### Parameters

| Name        |   Type    | Description                              |
| ----------- | :-------: | ---------------------------------------- |
| `tokenId`   | `bytes32` | The unique identifier for a token.       |
| `dataKey`   | `bytes32` | The key for the data to set.             |
| `dataValue` |  `bytes`  | The value to set for the given data key. |

<br/>

### tokenIdsOf

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#tokenidsof)
- Solidity implementation: [`ILSP8IdentifiableDigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol)
- Function signature: `tokenIdsOf(address)`
- Function selector: `0xa3b261f2`

:::

```solidity
function tokenIdsOf(address tokenOwner) external view returns (bytes32[]);
```

Returns the list of token IDs that the `tokenOwner` address owns.

#### Parameters

| Name         |   Type    | Description                                                |
| ------------ | :-------: | ---------------------------------------------------------- |
| `tokenOwner` | `address` | The address that we want to get the list of token IDs for. |

#### Returns

| Name |    Type     | Description                                             |
| ---- | :---------: | ------------------------------------------------------- |
| `0`  | `bytes32[]` | An array of `bytes32[] tokenIds` owned by `tokenOwner`. |

<br/>

### tokenOwnerOf

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#tokenownerof)
- Solidity implementation: [`ILSP8IdentifiableDigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol)
- Function signature: `tokenOwnerOf(bytes32)`
- Function selector: `0x217b2270`

:::

:::info

if the `tokenId` is not owned by any address, the returned address will be `address(0)`

:::

```solidity
function tokenOwnerOf(bytes32 tokenId) external view returns (address);
```

Returns the address that owns a given `tokenId`.

<blockquote>

**Requirements:**

- `tokenId` must exist.

</blockquote>

#### Parameters

| Name      |   Type    | Description                          |
| --------- | :-------: | ------------------------------------ |
| `tokenId` | `bytes32` | The token ID to query the owner for. |

#### Returns

| Name |   Type    | Description                               |
| ---- | :-------: | ----------------------------------------- |
| `0`  | `address` | The owner address of the given `tokenId`. |

<br/>

### totalSupply

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#totalsupply)
- Solidity implementation: [`ILSP8IdentifiableDigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol)
- Function signature: `totalSupply()`
- Function selector: `0x18160ddd`

:::

```solidity
function totalSupply() external view returns (uint256);
```

Returns the number of existing tokens that have been minted in this contract.

#### Returns

| Name |   Type    | Description                    |
| ---- | :-------: | ------------------------------ |
| `0`  | `uint256` | The number of existing tokens. |

<br/>

### transfer

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#transfer)
- Solidity implementation: [`ILSP8IdentifiableDigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol)
- Function signature: `transfer(address,address,bytes32,bool,bytes)`
- Function selector: `0x511b6952`

:::

:::info

if the `to` address is a contract that implements LSP1, it will always be notified via its `universalReceiver(...)` function, regardless if `force` is set to `true` or `false`.

:::

:::tip Hint

The `force` parameter **MUST be set to `true`** to transfer tokens to Externally Owned Accounts (EOAs) or contracts that do not implement the LSP1 Universal Receiver Standard. Otherwise the function will revert making the transfer fail.

:::

:::caution Warning

Be aware that when either the sender or the recipient can have logic that revert in their `universalReceiver(...)` function when being notified. This even if the `force` was set to `true`.

:::

```solidity
function transfer(
  address from,
  address to,
  bytes32 tokenId,
  bool force,
  bytes data
) external nonpayable;
```

Transfer a given `tokenId` token from the `from` address to the `to` address. If operators are set for a specific `tokenId`, all the operators are revoked after the tokenId have been transferred. The `force` parameter MUST be set to `true` when transferring tokens to Externally Owned Accounts (EOAs) or contracts that do not implement the LSP1 standard.

<blockquote>

**Requirements:**

- `from` cannot be the zero address.
- `to` cannot be the zero address.
- `from` and `to` cannot be the same address (`from` cannot send the `tokenId` to itself).
- `from` must own the given `tokenId`.
- If the caller is not `from`, it must be an operator for the `tokenId`.

</blockquote>

<blockquote>

**Emitted events:**

- [`Transfer`](#transfer) event when the `tokenId` is successfully transferred.

</blockquote>

#### Parameters

| Name      |   Type    | Description                                                                                                                                                          |
| --------- | :-------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `from`    | `address` | The address that owns the given `tokenId`.                                                                                                                           |
| `to`      | `address` | The address that will receive the `tokenId`.                                                                                                                         |
| `tokenId` | `bytes32` | The token ID to transfer.                                                                                                                                            |
| `force`   |  `bool`   | When set to `true`, the `to` address CAN be any address. When set to `false`, the `to` address MUST be a contract that supports the LSP1 UniversalReceiver standard. |
| `data`    |  `bytes`  | Any additional data the caller wants included in the emitted event, and sent in the hooks of the `from` and `to` addresses.                                          |

<br/>

### transferBatch

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#transferbatch)
- Solidity implementation: [`ILSP8IdentifiableDigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol)
- Function signature: `transferBatch(address[],address[],bytes32[],bool[],bytes[])`
- Function selector: `0x7e87632c`

:::

```solidity
function transferBatch(
  address[] from,
  address[] to,
  bytes32[] tokenId,
  bool[] force,
  bytes[] data
) external nonpayable;
```

Transfers multiple tokens at once based on the arrays of `from`, `to` and `tokenId`. If any transfer fails, the whole call will revert.

<blockquote>

**Requirements:**

- The arrays of `from`, `to` and `tokenId` must have the same length.
- no values in the `from` array can be the zero address.
- no values in the `to` array can be the zero address.
- `from` and `to` cannot be the same address at the same index on each arrays.
- each `tokenId` must be owned by `from`.
- If the caller is not `from`, it must be an operator of each `tokenId`.

</blockquote>

<blockquote>

**Emitted events:**

- [`Transfer`](#transfer) events on each successful token transfer.

</blockquote>

#### Parameters

| Name      |    Type     | Description                                                                                                                               |
| --------- | :---------: | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `from`    | `address[]` | An array of sending addresses.                                                                                                            |
| `to`      | `address[]` | An array of recipient addresses.                                                                                                          |
| `tokenId` | `bytes32[]` | An array of token IDs to transfer.                                                                                                        |
| `force`   |  `bool[]`   | When set to `true`, `to` may be any address. When set to `false`, `to` must be a contract that supports the LSP1 standard and not revert. |
| `data`    |  `bytes[]`  | Any additional data the caller wants included in the emitted event, and sent in the hooks to the `from` and `to` addresses.               |

<br/>

## Events

### OperatorAuthorizationChanged

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#operatorauthorizationchanged)
- Solidity implementation: [`ILSP8IdentifiableDigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol)
- Event signature: `OperatorAuthorizationChanged(address,address,bytes32,bytes)`
- Event topic hash: `0x1b1b58aa2ec0cec2228b2d37124556d41f5a1f7b12f089171f896cc236671215`

:::

```solidity
event OperatorAuthorizationChanged(
  address indexed operator,
  address indexed tokenOwner,
  bytes32 indexed tokenId,
  bytes operatorNotificationData
);
```

Emitted when `tokenOwner` enables `operator` to transfer or burn the `tokenId`.

#### Parameters

| Name                       |   Type    | Description                                                          |
| -------------------------- | :-------: | -------------------------------------------------------------------- |
| `operator` **`indexed`**   | `address` | The address authorized as an operator.                               |
| `tokenOwner` **`indexed`** | `address` | The owner of the `tokenId`.                                          |
| `tokenId` **`indexed`**    | `bytes32` | The tokenId `operator` address has access on behalf of `tokenOwner`. |
| `operatorNotificationData` |  `bytes`  | The data to notify the operator about via LSP1.                      |

<br/>

### OperatorRevoked

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#operatorrevoked)
- Solidity implementation: [`ILSP8IdentifiableDigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol)
- Event signature: `OperatorRevoked(address,address,bytes32,bool,bytes)`
- Event topic hash: `0xc78cd419d6136f9f1c1c6aec1d3fae098cffaf8bc86314a8f2685e32fe574e3c`

:::

```solidity
event OperatorRevoked(
  address indexed operator,
  address indexed tokenOwner,
  bytes32 indexed tokenId,
  bool notified,
  bytes operatorNotificationData
);
```

Emitted when `tokenOwner` disables `operator` to transfer or burn `tokenId` on its behalf.

#### Parameters

| Name                       |   Type    | Description                                                                        |
| -------------------------- | :-------: | ---------------------------------------------------------------------------------- |
| `operator` **`indexed`**   | `address` | The address revoked from the operator array ([`getOperatorsOf`](#getoperatorsof)). |
| `tokenOwner` **`indexed`** | `address` | The owner of the `tokenId`.                                                        |
| `tokenId` **`indexed`**    | `bytes32` | The tokenId `operator` is revoked from operating on.                               |
| `notified`                 |  `bool`   | Bool indicating whether the operator has been notified or not                      |
| `operatorNotificationData` |  `bytes`  | The data to notify the operator about via LSP1.                                    |

<br/>

### TokenIdDataChanged

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#tokeniddatachanged)
- Solidity implementation: [`ILSP8IdentifiableDigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol)
- Event signature: `TokenIdDataChanged(bytes32,bytes32,bytes)`
- Event topic hash: `0xa6e4251f855f750545fe414f120db91c76b88def14d120969e5bb2d3f05debbb`

:::

```solidity
event TokenIdDataChanged(
  bytes32 indexed tokenId,
  bytes32 indexed dataKey,
  bytes dataValue
);
```

Emitted when setting data for `tokenId`.

#### Parameters

| Name                    |   Type    | Description                                  |
| ----------------------- | :-------: | -------------------------------------------- |
| `tokenId` **`indexed`** | `bytes32` | The tokenId which data is set for.           |
| `dataKey` **`indexed`** | `bytes32` | The data key for which a bytes value is set. |
| `dataValue`             |  `bytes`  | The value to set for the given data key.     |

<br/>

### Transfer

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#transfer)
- Solidity implementation: [`ILSP8IdentifiableDigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol)
- Event signature: `Transfer(address,address,address,bytes32,bool,bytes)`
- Event topic hash: `0xb333c813a7426a7a11e2b190cad52c44119421594b47f6f32ace6d8c7207b2bf`

:::

```solidity
event Transfer(
  address operator,
  address indexed from,
  address indexed to,
  bytes32 indexed tokenId,
  bool force,
  bytes data
);
```

Emitted when `tokenId` token is transferred from the `from` to the `to` address.

#### Parameters

| Name                    |   Type    | Description                                                                                                                        |
| ----------------------- | :-------: | ---------------------------------------------------------------------------------------------------------------------------------- |
| `operator`              | `address` | The address of operator that sent the `tokenId`                                                                                    |
| `from` **`indexed`**    | `address` | The previous owner of the `tokenId`                                                                                                |
| `to` **`indexed`**      | `address` | The new owner of `tokenId`                                                                                                         |
| `tokenId` **`indexed`** | `bytes32` | The tokenId that was transferred                                                                                                   |
| `force`                 |  `bool`   | If the token transfer enforces the `to` recipient address to be a contract that implements the LSP1 standard or not.               |
| `data`                  |  `bytes`  | Any additional data the caller included by the caller during the transfer, and sent in the hooks to the `from` and `to` addresses. |

<br/>
