<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP8Enumerable

:::info Standard Specifications

[`LSP-8-IdentifiableDigitalAsset`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md)

:::
:::info Solidity implementation

[`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)

:::

LSP8 extension that enables to enumerate over all the `tokenIds` ever minted.

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### fallback

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#fallback)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)

:::

```solidity
fallback(bytes calldata callData) external payable returns (bytes memory);
```

_The `fallback` function was called with the following amount of native tokens: `msg.value`; and the following calldata: `callData`._

Achieves the goal of [LSP-17-ContractExtension] standard by extending the contract to handle calls of functions that do not exist natively,
forwarding the function call to the extension address mapped to the function being called.
This function is executed when:

- Sending data of length less than 4 bytes to the contract.

- The first 4 bytes of the calldata do not match any publicly callable functions from the contract ABI.

- Receiving native tokens

1. If the data is equal or longer than 4 bytes, the [ERC-725Y] storage is queried with the following data key: [_LSP17_EXTENSION_PREFIX] + `bytes4(msg.sig)` (Check [LSP-2-ERC725YJSONSchema] for encoding the data key)

- If there is no address stored under the following data key, revert with [`NoExtensionFoundForFunctionSelector(bytes4)`](#noextensionfoundforfunctionselector). The data key relative to `bytes4(0)` is an exception, where no reverts occurs if there is no extension address stored under. This exception is made to allow users to send random data (graffiti) to the account and to be able to react on it.

- If there is an address, forward the `msg.data` to the extension using the CALL opcode, appending 52 bytes (20 bytes of `msg.sender` and 32 bytes of `msg.value`). Return what the calls returns, or revert if the call failed.

2. If the data sent to this function is of length less than 4 bytes (not a function selector), revert.

<br/>

### receive

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#receive)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)

:::

```solidity
receive() external payable;
```

_LSP8 contract cannot receive native tokens._

Reverts whenever someone tries to send native tokens to a LSP8 contract.

<br/>

### authorizeOperator

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#authorizeoperator)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
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
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
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
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Function signature: `batchCalls(bytes[])`
- Function selector: `0x6963d438`

:::

:::info

It's not possible to send value along the functions call due to the use of `delegatecall`.

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

### getData

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#getdata)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Function signature: `getData(bytes32)`
- Function selector: `0x54f6127f`

:::

```solidity
function getData(bytes32 dataKey) external view returns (bytes dataValue);
```

_Reading the ERC725Y storage for data key `dataKey` returned the following value: `dataValue`._

Get in the ERC725Y storage the bytes data stored at a specific data key `dataKey`.

#### Parameters

| Name      |   Type    | Description                                   |
| --------- | :-------: | --------------------------------------------- |
| `dataKey` | `bytes32` | The data key for which to retrieve the value. |

#### Returns

| Name        |  Type   | Description                                          |
| ----------- | :-----: | ---------------------------------------------------- |
| `dataValue` | `bytes` | The bytes value stored under the specified data key. |

<br/>

### getDataBatch

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#getdatabatch)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Function signature: `getDataBatch(bytes32[])`
- Function selector: `0xdedff9c6`

:::

```solidity
function getDataBatch(
  bytes32[] dataKeys
) external view returns (bytes[] dataValues);
```

_Reading the ERC725Y storage for data keys `dataKeys` returned the following values: `dataValues`._

Get in the ERC725Y storage the bytes data stored at multiple data keys `dataKeys`.

#### Parameters

| Name       |    Type     | Description                                |
| ---------- | :---------: | ------------------------------------------ |
| `dataKeys` | `bytes32[]` | The array of keys which values to retrieve |

#### Returns

| Name         |   Type    | Description                               |
| ------------ | :-------: | ----------------------------------------- |
| `dataValues` | `bytes[]` | The array of data stored at multiple keys |

<br/>

### getDataBatchForTokenIds

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#getdatabatchfortokenids)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Function signature: `getDataBatchForTokenIds(bytes32[],bytes32[])`
- Function selector: `0x1d26fce6`

:::

```solidity
function getDataBatchForTokenIds(
  bytes32[] tokenIds,
  bytes32[] dataKeys
) external view returns (bytes[] dataValues);
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
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Function signature: `getDataForTokenId(bytes32,bytes32)`
- Function selector: `0x16e023b3`

:::

```solidity
function getDataForTokenId(
  bytes32 tokenId,
  bytes32 dataKey
) external view returns (bytes dataValue);
```

_Retrieves data for a specific `tokenId` and `dataKey`._

#### Parameters

| Name      |   Type    | Description                        |
| --------- | :-------: | ---------------------------------- |
| `tokenId` | `bytes32` | The unique identifier for a token. |
| `dataKey` | `bytes32` | The key for the data to retrieve.  |

#### Returns

| Name        |  Type   | Description                                                       |
| ----------- | :-----: | ----------------------------------------------------------------- |
| `dataValue` | `bytes` | The data value associated with the given `tokenId` and `dataKey`. |

<br/>

### getOperatorsOf

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#getoperatorsof)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
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
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Function signature: `isOperatorFor(address,bytes32)`
- Function selector: `0x2a3654a4`

:::

```solidity
function isOperatorFor(
  address operator,
  bytes32 tokenId
) external view returns (bool);
```

Returns whether `operator` address is an operator for a given `tokenId`.

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

### owner

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#owner)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Function signature: `owner()`
- Function selector: `0x8da5cb5b`

:::

```solidity
function owner() external view returns (address);
```

Returns the address of the current owner.

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `address` | -           |

<br/>

### renounceOwnership

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#renounceownership)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Function signature: `renounceOwnership()`
- Function selector: `0x715018a6`

:::

```solidity
function renounceOwnership() external nonpayable;
```

Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.

<br/>

### revokeOperator

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#revokeoperator)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
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

#### Parameters

| Name                       |   Type    | Description                                              |
| -------------------------- | :-------: | -------------------------------------------------------- |
| `operator`                 | `address` | The address to revoke as an operator.                    |
| `tokenId`                  | `bytes32` | The tokenId `operator` is revoked from operating on.     |
| `notify`                   |  `bool`   | Boolean indicating whether to notify the operator or not |
| `operatorNotificationData` |  `bytes`  | The data to notify the operator about via LSP1.          |

<br/>

### setData

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#setdata)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Function signature: `setData(bytes32,bytes)`
- Function selector: `0x7f23690c`

:::

:::caution Warning

**Note for developers:** despite the fact that this function is set as `payable`, if the function is not intended to receive value (= native tokens), **an additional check should be implemented to ensure that `msg.value` sent was equal to 0**.

:::

```solidity
function setData(bytes32 dataKey, bytes dataValue) external payable;
```

_Setting the following data key value pair in the ERC725Y storage. Data key: `dataKey`, data value: `dataValue`._

Sets a single bytes value `dataValue` in the ERC725Y storage for a specific data key `dataKey`. The function is marked as payable to enable flexibility on child contracts. For instance to implement a fee mechanism for setting specific data.

<blockquote>

**Requirements:**

- SHOULD only be callable by the [`owner`](#owner).

</blockquote>

<blockquote>

**Emitted events:**

- [`DataChanged`](#datachanged) event.

</blockquote>

#### Parameters

| Name        |   Type    | Description                                |
| ----------- | :-------: | ------------------------------------------ |
| `dataKey`   | `bytes32` | The data key for which to set a new value. |
| `dataValue` |  `bytes`  | The new bytes value to set.                |

<br/>

### setDataBatch

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#setdatabatch)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Function signature: `setDataBatch(bytes32[],bytes[])`
- Function selector: `0x97902421`

:::

:::caution Warning

**Note for developers:** despite the fact that this function is set as `payable`, if the function is not intended to receive value (= native tokens), **an additional check should be implemented to ensure that `msg.value` sent was equal to 0**.

:::

```solidity
function setDataBatch(bytes32[] dataKeys, bytes[] dataValues) external payable;
```

_Setting the following data key value pairs in the ERC725Y storage. Data keys: `dataKeys`, data values: `dataValues`._

Batch data setting function that behaves the same as [`setData`](#setdata) but allowing to set multiple data key/value pairs in the ERC725Y storage in the same transaction.

<blockquote>

**Requirements:**

- SHOULD only be callable by the [`owner`](#owner) of the contract.

</blockquote>

<blockquote>

**Emitted events:**

- [`DataChanged`](#datachanged) event **for each data key/value pair set**.

</blockquote>

#### Parameters

| Name         |    Type     | Description                                          |
| ------------ | :---------: | ---------------------------------------------------- |
| `dataKeys`   | `bytes32[]` | An array of data keys to set bytes values for.       |
| `dataValues` |  `bytes[]`  | An array of bytes values to set for each `dataKeys`. |

<br/>

### setDataBatchForTokenIds

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#setdatabatchfortokenids)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
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
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
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

#### Parameters

| Name        |   Type    | Description                              |
| ----------- | :-------: | ---------------------------------------- |
| `tokenId`   | `bytes32` | The unique identifier for a token.       |
| `dataKey`   | `bytes32` | The key for the data to set.             |
| `dataValue` |  `bytes`  | The value to set for the given data key. |

<br/>

### supportsInterface

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#supportsinterface)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Function signature: `supportsInterface(bytes4)`
- Function selector: `0x01ffc9a7`

:::

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool);
```

Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section] to learn more about how these ids are created. This function call must use less than 30 000 gas.

#### Parameters

| Name          |   Type   | Description |
| ------------- | :------: | ----------- |
| `interfaceId` | `bytes4` | -           |

#### Returns

| Name |  Type  | Description |
| ---- | :----: | ----------- |
| `0`  | `bool` | -           |

<br/>

### tokenAt

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#tokenat)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Function signature: `tokenAt(uint256)`
- Function selector: `0x92a91a3a`

:::

```solidity
function tokenAt(uint256 index) external view returns (bytes32);
```

_Retrieving the `tokenId` for `msg.sender` located in its list at index number `index`._

Returns a token id at index. See [`totalSupply`](#totalsupply) to get total number of minted tokens.

#### Parameters

| Name    |   Type    | Description                                              |
| ------- | :-------: | -------------------------------------------------------- |
| `index` | `uint256` | The index to search to search in the enumerable mapping. |

#### Returns

| Name |   Type    | Description                                             |
| ---- | :-------: | ------------------------------------------------------- |
| `0`  | `bytes32` | TokenId or `bytes32(0)` if no tokenId exist at `index`. |

<br/>

### tokenIdsOf

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#tokenidsof)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
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
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Function signature: `tokenOwnerOf(bytes32)`
- Function selector: `0x217b2270`

:::

```solidity
function tokenOwnerOf(bytes32 tokenId) external view returns (address);
```

Returns the address that owns a given `tokenId`.

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
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
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
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Function signature: `transfer(address,address,bytes32,bool,bytes)`
- Function selector: `0x511b6952`

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

#### Parameters

| Name      |   Type    | Description                                                                                                                                                         |
| --------- | :-------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `from`    | `address` | The address that owns the given `tokenId`.                                                                                                                          |
| `to`      | `address` | The address that will receive the `tokenId`.                                                                                                                        |
| `tokenId` | `bytes32` | The token ID to transfer.                                                                                                                                           |
| `force`   |  `bool`   | When set to `true`, the `to` address CAN be any address. When set to `false`, the `to` address MUST be a contract that supports the LSP1 UniversalReceiver standard. |
| `data`    |  `bytes`  | Any additional data the caller wants included in the emitted event, and sent in the hooks of the `from` and `to` addresses.                                         |

<br/>

### transferBatch

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#transferbatch)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
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

#### Parameters

| Name      |    Type     | Description                                                                                                                               |
| --------- | :---------: | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `from`    | `address[]` | An array of sending addresses.                                                                                                            |
| `to`      | `address[]` | An array of recipient addresses.                                                                                                          |
| `tokenId` | `bytes32[]` | An array of token IDs to transfer.                                                                                                        |
| `force`   |  `bool[]`   | When set to `true`, `to` may be any address. When set to `false`, `to` must be a contract that supports the LSP1 standard and not revert. |
| `data`    |  `bytes[]`  | Any additional data the caller wants included in the emitted event, and sent in the hooks to the `from` and `to` addresses.               |

<br/>

### transferOwnership

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#transferownership)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Function signature: `transferOwnership(address)`
- Function selector: `0xf2fde38b`

:::

```solidity
function transferOwnership(address newOwner) external nonpayable;
```

Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.

#### Parameters

| Name       |   Type    | Description |
| ---------- | :-------: | ----------- |
| `newOwner` | `address` | -           |

<br/>

## Internal Methods

Any method labeled as `internal` serves as utility function within the contract. They can be used when writing solidity contracts that inherit from this contract. These methods can be extended or modified by overriding their internal behavior to suit specific needs.

Internal functions cannot be called externally, whether from other smart contracts, dApp interfaces, or backend services. Their restricted accessibility ensures that they remain exclusively available within the context of the current contract, promoting controlled and encapsulated usage of these internal utilities.

### \_checkOwner

```solidity
function _checkOwner() internal view;
```

Throws if the sender is not the owner.

<br/>

### \_setOwner

```solidity
function _setOwner(address newOwner) internal nonpayable;
```

Changes the owner if `newOwner` and oldOwner are different
This pattern is useful in inheritance.

<br/>

### \_getData

```solidity
function _getData(bytes32 dataKey) internal view returns (bytes dataValue);
```

Read the value stored under a specific `dataKey` inside the underlying ERC725Y storage,
represented as a mapping of `bytes32` data keys mapped to their `bytes` data values.

```solidity
mapping(bytes32 => bytes) _store
```

#### Parameters

| Name      |   Type    | Description                                                             |
| --------- | :-------: | ----------------------------------------------------------------------- |
| `dataKey` | `bytes32` | A bytes32 data key to read the associated `bytes` value from the store. |

#### Returns

| Name        |  Type   | Description                                                                   |
| ----------- | :-----: | ----------------------------------------------------------------------------- |
| `dataValue` | `bytes` | The `bytes` value associated with the given `dataKey` in the ERC725Y storage. |

<br/>

### \_setData

```solidity
function _setData(bytes32 dataKey, bytes dataValue) internal nonpayable;
```

The ERC725Y data key `_LSP8_TOKENID_FORMAT_KEY` cannot be changed
once the identifiable digital asset contract has been deployed.

<br/>

### \_isOperatorOrOwner

```solidity
function _isOperatorOrOwner(
  address caller,
  bytes32 tokenId
) internal view returns (bool);
```

verifies if the `caller` is operator or owner for the `tokenId`

#### Returns

| Name |  Type  | Description                                  |
| ---- | :----: | -------------------------------------------- |
| `0`  | `bool` | true if `caller` is either operator or owner |

<br/>

### \_revokeOperator

```solidity
function _revokeOperator(
  address operator,
  address tokenOwner,
  bytes32 tokenId,
  bool notified,
  bytes operatorNotificationData
) internal nonpayable;
```

removes `operator` from the list of operators for the `tokenId`

<br/>

### \_clearOperators

```solidity
function _clearOperators(
  address tokenOwner,
  bytes32 tokenId
) internal nonpayable;
```

revoke all the current operators for a specific `tokenId` token which belongs to `tokenOwner`.

#### Parameters

| Name         |   Type    | Description                                       |
| ------------ | :-------: | ------------------------------------------------- |
| `tokenOwner` | `address` | The address that is the owner of the `tokenId`.   |
| `tokenId`    | `bytes32` | The token to remove the associated operators for. |

<br/>

### \_exists

```solidity
function _exists(bytes32 tokenId) internal view returns (bool);
```

Returns whether `tokenId` exists.
Tokens start existing when they are minted ([`_mint`](#_mint)), and stop existing when they are burned ([`_burn`](#_burn)).

<br/>

### \_existsOrError

```solidity
function _existsOrError(bytes32 tokenId) internal view;
```

When `tokenId` does not exist then revert with an error.

<br/>

### \_mint

:::info

Any logic in the:

- [`_beforeTokenTransfer`](#_beforetokentransfer) function will run before updating the balances and ownership of `tokenId`s.

- [`_afterTokenTransfer`](#_aftertokentransfer) function will run after updating the balances and ownership of `tokenId`s, **but before notifying the recipient via LSP1**.

:::

```solidity
function _mint(
  address to,
  bytes32 tokenId,
  bool force,
  bytes data
) internal nonpayable;
```

Create `tokenId` by minting it and transfers it to `to`.

<blockquote>

**Emitted events:**

- [`Transfer`](#transfer) event with `address(0)` as `from` address.

</blockquote>

#### Parameters

| Name      |   Type    | Description                                                                                                                |
| --------- | :-------: | -------------------------------------------------------------------------------------------------------------------------- |
| `to`      | `address` | @param tokenId The token ID to create (= mint).                                                                            |
| `tokenId` | `bytes32` | The token ID to create (= mint).                                                                                           |
| `force`   |  `bool`   | When set to `true`, `to` may be any address. When set to `false`, `to` must be a contract that supports the LSP1 standard. |
| `data`    |  `bytes`  | Any additional data the caller wants included in the emitted event, and sent in the hook of the `to` address.              |

<br/>

### \_burn

:::info

Any logic in the:

- [`_beforeTokenTransfer`](#_beforetokentransfer) function will run before updating the balances and ownership of `tokenId`s.

- [`_afterTokenTransfer`](#_aftertokentransfer) function will run after updating the balances and ownership of `tokenId`s, **but before notifying the sender via LSP1**.

:::

:::tip Hint

In dApps, you can know which addresses are burning tokens by listening for the `Transfer` event and filter with the zero address as `to`.

:::

```solidity
function _burn(bytes32 tokenId, bytes data) internal nonpayable;
```

Burn a specific `tokenId`, removing the `tokenId` from the [`tokenIdsOf`](#tokenidsof) the caller and decreasing its [`balanceOf`](#balanceof) by -1.
This will also clear all the operators allowed to transfer the `tokenId`.
The owner of the `tokenId` will be notified about the `tokenId` being transferred through its LSP1 [`universalReceiver`](#universalreceiver)
function, if it is a contract that supports the LSP1 interface. Its [`universalReceiver`](#universalreceiver) function will receive
all the parameters in the calldata packed encoded.

<blockquote>

**Emitted events:**

- [`Transfer`](#transfer) event with `address(0)` as the `to` address.

</blockquote>

#### Parameters

| Name      |   Type    | Description                                                                                                                 |
| --------- | :-------: | --------------------------------------------------------------------------------------------------------------------------- |
| `tokenId` | `bytes32` | The token to burn.                                                                                                          |
| `data`    |  `bytes`  | Any additional data the caller wants included in the emitted event, and sent in the LSP1 hook on the token owner's address. |

<br/>

### \_transfer

:::info

Any logic in the:

- [`_beforeTokenTransfer`](#_beforetokentransfer) function will run before updating the balances and ownership of `tokenId`s.

- [`_afterTokenTransfer`](#_aftertokentransfer) function will run after updating the balances and ownership of `tokenId`s, **but before notifying the sender/recipient via LSP1**.

:::

:::danger

This internal function does not check if the sender is authorized or not to operate on the `tokenId`.

:::

```solidity
function _transfer(
  address from,
  address to,
  bytes32 tokenId,
  bool force,
  bytes data
) internal nonpayable;
```

Change the owner of the `tokenId` from `from` to `to`.
Both the sender and recipient will be notified of the `tokenId` being transferred through their LSP1 [`universalReceiver`](#universalreceiver)
function, if they are contracts that support the LSP1 interface. Their `universalReceiver` function will receive
all the parameters in the calldata packed encoded.

<blockquote>

**Emitted events:**

- [`Transfer`](#transfer) event.

</blockquote>

#### Parameters

| Name      |   Type    | Description                                                                                                                |
| --------- | :-------: | -------------------------------------------------------------------------------------------------------------------------- |
| `from`    | `address` | The sender address.                                                                                                        |
| `to`      | `address` | @param tokenId The token to transfer.                                                                                      |
| `tokenId` | `bytes32` | The token to transfer.                                                                                                     |
| `force`   |  `bool`   | When set to `true`, `to` may be any address. When set to `false`, `to` must be a contract that supports the LSP1 standard. |
| `data`    |  `bytes`  | Additional data the caller wants included in the emitted event, and sent in the hooks to `from` and `to` addresses.        |

<br/>

### \_setDataForTokenId

```solidity
function _setDataForTokenId(
  bytes32 tokenId,
  bytes32 dataKey,
  bytes dataValue
) internal nonpayable;
```

Sets data for a specific `tokenId` and `dataKey` in the ERC725Y storage
The ERC725Y data key is the hash of the `tokenId` and `dataKey` concatenated

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

### \_getDataForTokenId

```solidity
function _getDataForTokenId(
  bytes32 tokenId,
  bytes32 dataKey
) internal view returns (bytes dataValues);
```

Retrieves data for a specific `tokenId` and `dataKey` from the ERC725Y storage
The ERC725Y data key is the hash of the `tokenId` and `dataKey` concatenated

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

### \_beforeTokenTransfer

```solidity
function _beforeTokenTransfer(
  address from,
  address to,
  bytes32 tokenId,
  bytes data
) internal nonpayable;
```

#### Parameters

| Name      |   Type    | Description                                                                      |
| --------- | :-------: | -------------------------------------------------------------------------------- |
| `from`    | `address` | The address sending the `tokenId` (`address(0)` when `tokenId` is being minted). |
| `to`      | `address` | @param tokenId The bytes32 identifier of the token being transferred.            |
| `tokenId` | `bytes32` | The bytes32 identifier of the token being transferred.                           |
| `data`    |  `bytes`  | The data sent alongside the the token transfer.                                  |

<br/>

### \_afterTokenTransfer

```solidity
function _afterTokenTransfer(
  address from,
  address to,
  bytes32 tokenId,
  bytes data
) internal nonpayable;
```

Hook that is called after any token transfer, including minting and burning.
Allows to run custom logic after updating balances, but **before notifying sender/recipient via LSP1** by overriding this function.

#### Parameters

| Name      |   Type    | Description                            |
| --------- | :-------: | -------------------------------------- |
| `from`    | `address` | The sender address                     |
| `to`      | `address` | @param tokenId The tokenId to transfer |
| `tokenId` | `bytes32` | The tokenId to transfer                |
| `data`    |  `bytes`  | The data sent alongside the transfer   |

<br/>

### \_notifyTokenOperator

```solidity
function _notifyTokenOperator(
  address operator,
  bytes lsp1Data
) internal nonpayable;
```

Attempt to notify the operator `operator` about the `tokenId` being authorized.
This is done by calling its [`universalReceiver`](#universalreceiver) function with the `_TYPEID_LSP8_TOKENOPERATOR` as typeId, if `operator` is a contract that supports the LSP1 interface.
If `operator` is an EOA or a contract that does not support the LSP1 interface, nothing will happen and no notification will be sent.

#### Parameters

| Name       |   Type    | Description                                                                    |
| ---------- | :-------: | ------------------------------------------------------------------------------ |
| `operator` | `address` | The address to call the [`universalReceiver`](#universalreceiver) function on. |
| `lsp1Data` |  `bytes`  | the data to be sent to the `operator` address in the `universalReceiver` call. |

<br/>

### \_notifyTokenSender

```solidity
function _notifyTokenSender(address from, bytes lsp1Data) internal nonpayable;
```

Attempt to notify the token sender `from` about the `tokenId` being transferred.
This is done by calling its [`universalReceiver`](#universalreceiver) function with the `_TYPEID_LSP8_TOKENSSENDER` as typeId, if `from` is a contract that supports the LSP1 interface.
If `from` is an EOA or a contract that does not support the LSP1 interface, nothing will happen and no notification will be sent.

#### Parameters

| Name       |   Type    | Description                                                                    |
| ---------- | :-------: | ------------------------------------------------------------------------------ |
| `from`     | `address` | The address to call the [`universalReceiver`](#universalreceiver) function on. |
| `lsp1Data` |  `bytes`  | the data to be sent to the `from` address in the `universalReceiver` call.     |

<br/>

### \_notifyTokenReceiver

```solidity
function _notifyTokenReceiver(
  address to,
  bool force,
  bytes lsp1Data
) internal nonpayable;
```

Attempt to notify the token receiver `to` about the `tokenId` being received.
This is done by calling its [`universalReceiver`](#universalreceiver) function with the `_TYPEID_LSP8_TOKENSRECIPIENT` as typeId, if `to` is a contract that supports the LSP1 interface.
If `to` is is an EOA or a contract that does not support the LSP1 interface, the behaviour will depend on the `force` boolean flag.

- if `force` is set to `true`, nothing will happen and no notification will be sent.

- if `force` is set to `false, the transaction will revert.

#### Parameters

| Name       |   Type    | Description                                                                                         |
| ---------- | :-------: | --------------------------------------------------------------------------------------------------- |
| `to`       | `address` | The address to call the [`universalReceiver`](#universalreceiver) function on.                      |
| `force`    |  `bool`   | A boolean that describe if transfer to a `to` address that does not support LSP1 is allowed or not. |
| `lsp1Data` |  `bytes`  | The data to be sent to the `to` address in the `universalReceiver(...)` call.                       |

<br/>

### \_supportsInterfaceInERC165Extension

```solidity
function _supportsInterfaceInERC165Extension(
  bytes4 interfaceId
) internal view returns (bool);
```

Returns whether the interfaceId being checked is supported in the extension of the
[`supportsInterface`](#supportsinterface) selector.
To be used by extendable contracts wishing to extend the ERC165 interfaceIds originally
supported by reading whether the interfaceId queried is supported in the `supportsInterface`
extension if the extension is set, if not it returns false.

<br/>

### \_getExtensionAndForwardValue

```solidity
function _getExtensionAndForwardValue(
  bytes4 functionSelector
) internal view returns (address, bool);
```

Returns the extension address stored under the following data key:

- [`_LSP17_EXTENSION_PREFIX`](#_lsp17_extension_prefix) + `<bytes4>` (Check [LSP2-ERC725YJSONSchema] for encoding the data key).

- If no extension is stored, returns the address(0).

<br/>

### \_fallbackLSP17Extendable

:::info

The LSP8 Token contract should not hold any native tokens. Any native tokens received by the contract
will be forwarded to the extension address mapped to the selector from `msg.sig`.

:::

```solidity
function _fallbackLSP17Extendable(
  bytes callData
) internal nonpayable returns (bytes);
```

Forwards the call with the received value to an extension mapped to a function selector.
Calls [`_getExtensionAndForwardValue`](#_getextensionandforwardvalue) to get the address of the extension mapped to the function selector being
called on the account. If there is no extension, the address(0) will be returned.
We will always forward the value to the extension, as the LSP8 contract is not supposed to hold any native tokens.
Reverts if there is no extension for the function being called.
If there is an extension for the function selector being called, it calls the extension with the
CALL opcode, passing the [`msg.data`](#msg.data) appended with the 20 bytes of the [`msg.sender`](#msg.sender) and
32 bytes of the [`msg.value`](#msg.value)

<br/>

## Events

### DataChanged

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#datachanged)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Event signature: `DataChanged(bytes32,bytes)`
- Event topic hash: `0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2`

:::

```solidity
event DataChanged(bytes32 indexed dataKey, bytes dataValue);
```

_The following data key/value pair has been changed in the ERC725Y storage: Data key: `dataKey`, data value: `dataValue`._

Emitted when data at a specific `dataKey` was changed to a new value `dataValue`.

#### Parameters

| Name                    |   Type    | Description                                  |
| ----------------------- | :-------: | -------------------------------------------- |
| `dataKey` **`indexed`** | `bytes32` | The data key for which a bytes value is set. |
| `dataValue`             |  `bytes`  | The value to set for the given data key.     |

<br/>

### OperatorAuthorizationChanged

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#operatorauthorizationchanged)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
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
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
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

### OwnershipTransferred

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#ownershiptransferred)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Event signature: `OwnershipTransferred(address,address)`
- Event topic hash: `0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0`

:::

```solidity
event OwnershipTransferred(
  address indexed previousOwner,
  address indexed newOwner
);
```

#### Parameters

| Name                          |   Type    | Description |
| ----------------------------- | :-------: | ----------- |
| `previousOwner` **`indexed`** | `address` | -           |
| `newOwner` **`indexed`**      | `address` | -           |

<br/>

### TokenIdDataChanged

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#tokeniddatachanged)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
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
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
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

## Errors

### ERC725Y_DataKeysValuesEmptyArray

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#erc725y_datakeysvaluesemptyarray)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `ERC725Y_DataKeysValuesEmptyArray()`
- Error hash: `0x97da5f95`

:::

```solidity
error ERC725Y_DataKeysValuesEmptyArray();
```

Reverts when one of the array parameter provided to [`setDataBatch`](#setdatabatch) function is an empty array.

<br/>

### ERC725Y_DataKeysValuesLengthMismatch

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#erc725y_datakeysvalueslengthmismatch)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `ERC725Y_DataKeysValuesLengthMismatch()`
- Error hash: `0x3bcc8979`

:::

```solidity
error ERC725Y_DataKeysValuesLengthMismatch();
```

Reverts when there is not the same number of elements in the `datakeys` and `dataValues` array parameters provided when calling the [`setDataBatch`](#setdatabatch) function.

<br/>

### ERC725Y_MsgValueDisallowed

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#erc725y_msgvaluedisallowed)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `ERC725Y_MsgValueDisallowed()`
- Error hash: `0xf36ba737`

:::

```solidity
error ERC725Y_MsgValueDisallowed();
```

Reverts when sending value to the [`setData`](#setdata) or [`setDataBatch`](#setdatabatch) function.

<br/>

### InvalidExtensionAddress

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#invalidextensionaddress)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `InvalidExtensionAddress(bytes)`
- Error hash: `0x42bfe79f`

:::

```solidity
error InvalidExtensionAddress(bytes storedData);
```

reverts when the bytes retrieved from the LSP17 data key is not a valid address (not 20 bytes)

#### Parameters

| Name         |  Type   | Description |
| ------------ | :-----: | ----------- |
| `storedData` | `bytes` | -           |

<br/>

### InvalidFunctionSelector

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#invalidfunctionselector)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `InvalidFunctionSelector(bytes)`
- Error hash: `0xe5099ee3`

:::

```solidity
error InvalidFunctionSelector(bytes data);
```

reverts when the contract is called with a function selector not valid (less than 4 bytes of data)

#### Parameters

| Name   |  Type   | Description |
| ------ | :-----: | ----------- |
| `data` | `bytes` | -           |

<br/>

### LSP4TokenNameNotEditable

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp4tokennamenoteditable)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `LSP4TokenNameNotEditable()`
- Error hash: `0x85c169bd`

:::

```solidity
error LSP4TokenNameNotEditable();
```

Reverts when trying to edit the data key `LSP4TokenName` after the digital asset contract has been deployed / initialized. The `LSP4TokenName` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed / initialized.

<br/>

### LSP4TokenSymbolNotEditable

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp4tokensymbolnoteditable)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `LSP4TokenSymbolNotEditable()`
- Error hash: `0x76755b38`

:::

```solidity
error LSP4TokenSymbolNotEditable();
```

Reverts when trying to edit the data key `LSP4TokenSymbol` after the digital asset contract has been deployed / initialized. The `LSP4TokenSymbol` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed / initialized.

<br/>

### LSP4TokenTypeNotEditable

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp4tokentypenoteditable)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `LSP4TokenTypeNotEditable()`
- Error hash: `0x4ef6d7fb`

:::

```solidity
error LSP4TokenTypeNotEditable();
```

Reverts when trying to edit the data key `LSP4TokenType` after the digital asset contract has been deployed / initialized. The `LSP4TokenType` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor / initializer when the digital asset contract is being deployed / initialized.

<br/>

### LSP8BatchCallFailed

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8batchcallfailed)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `LSP8BatchCallFailed(uint256)`
- Error hash: `0x234eb819`

:::

```solidity
error LSP8BatchCallFailed(uint256 callIndex);
```

_Batch call failed._

Reverts when a batch call failed.

#### Parameters

| Name        |   Type    | Description |
| ----------- | :-------: | ----------- |
| `callIndex` | `uint256` | -           |

<br/>

### LSP8CannotSendToAddressZero

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8cannotsendtoaddresszero)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `LSP8CannotSendToAddressZero()`
- Error hash: `0x24ecef4d`

:::

```solidity
error LSP8CannotSendToAddressZero();
```

Reverts when trying to send token to the zero address.

<br/>

### LSP8CannotUseAddressZeroAsOperator

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8cannotuseaddresszeroasoperator)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `LSP8CannotUseAddressZeroAsOperator()`
- Error hash: `0x9577b8b3`

:::

```solidity
error LSP8CannotUseAddressZeroAsOperator();
```

Reverts when trying to set the zero address as an operator.

<br/>

### LSP8InvalidTransferBatch

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8invalidtransferbatch)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `LSP8InvalidTransferBatch()`
- Error hash: `0x93a83119`

:::

```solidity
error LSP8InvalidTransferBatch();
```

Reverts when the parameters used for `transferBatch` have different lengths.

<br/>

### LSP8NonExistentTokenId

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8nonexistenttokenid)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `LSP8NonExistentTokenId(bytes32)`
- Error hash: `0xae8f9a36`

:::

```solidity
error LSP8NonExistentTokenId(bytes32 tokenId);
```

Reverts when `tokenId` has not been minted.

#### Parameters

| Name      |   Type    | Description |
| --------- | :-------: | ----------- |
| `tokenId` | `bytes32` | -           |

<br/>

### LSP8NonExistingOperator

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8nonexistingoperator)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `LSP8NonExistingOperator(address,bytes32)`
- Error hash: `0x4aa31a8c`

:::

```solidity
error LSP8NonExistingOperator(address operator, bytes32 tokenId);
```

Reverts when `operator` is not an operator for the `tokenId`.

#### Parameters

| Name       |   Type    | Description |
| ---------- | :-------: | ----------- |
| `operator` | `address` | -           |
| `tokenId`  | `bytes32` | -           |

<br/>

### LSP8NotTokenOperator

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8nottokenoperator)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `LSP8NotTokenOperator(bytes32,address)`
- Error hash: `0x1294d2a9`

:::

```solidity
error LSP8NotTokenOperator(bytes32 tokenId, address caller);
```

Reverts when `caller` is not an allowed operator for `tokenId`.

#### Parameters

| Name      |   Type    | Description |
| --------- | :-------: | ----------- |
| `tokenId` | `bytes32` | -           |
| `caller`  | `address` | -           |

<br/>

### LSP8NotTokenOwner

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8nottokenowner)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `LSP8NotTokenOwner(address,bytes32,address)`
- Error hash: `0x5b271ea2`

:::

```solidity
error LSP8NotTokenOwner(address tokenOwner, bytes32 tokenId, address caller);
```

Reverts when `caller` is not the `tokenOwner` of the `tokenId`.

#### Parameters

| Name         |   Type    | Description |
| ------------ | :-------: | ----------- |
| `tokenOwner` | `address` | -           |
| `tokenId`    | `bytes32` | -           |
| `caller`     | `address` | -           |

<br/>

### LSP8NotifyTokenReceiverContractMissingLSP1Interface

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8notifytokenreceivercontractmissinglsp1interface)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `LSP8NotifyTokenReceiverContractMissingLSP1Interface(address)`
- Error hash: `0x4349776d`

:::

```solidity
error LSP8NotifyTokenReceiverContractMissingLSP1Interface(
  address tokenReceiver
);
```

Reverts if the `tokenReceiver` does not implement LSP1 when minting or transferring tokens with `bool force` set as `false`.

#### Parameters

| Name            |   Type    | Description |
| --------------- | :-------: | ----------- |
| `tokenReceiver` | `address` | -           |

<br/>

### LSP8NotifyTokenReceiverIsEOA

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8notifytokenreceiveriseoa)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `LSP8NotifyTokenReceiverIsEOA(address)`
- Error hash: `0x03173137`

:::

```solidity
error LSP8NotifyTokenReceiverIsEOA(address tokenReceiver);
```

Reverts if the `tokenReceiver` is an EOA when minting or transferring tokens with `bool force` set as `false`.

#### Parameters

| Name            |   Type    | Description |
| --------------- | :-------: | ----------- |
| `tokenReceiver` | `address` | -           |

<br/>

### LSP8OperatorAlreadyAuthorized

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8operatoralreadyauthorized)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `LSP8OperatorAlreadyAuthorized(address,bytes32)`
- Error hash: `0xa7626b68`

:::

```solidity
error LSP8OperatorAlreadyAuthorized(address operator, bytes32 tokenId);
```

Reverts when `operator` is already authorized for the `tokenId`.

#### Parameters

| Name       |   Type    | Description |
| ---------- | :-------: | ----------- |
| `operator` | `address` | -           |
| `tokenId`  | `bytes32` | -           |

<br/>

### LSP8RevokeOperatorNotAuthorized

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8revokeoperatornotauthorized)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `LSP8RevokeOperatorNotAuthorized(address,address,bytes32)`
- Error hash: `0x760b5acd`

:::

```solidity
error LSP8RevokeOperatorNotAuthorized(
  address caller,
  address tokenOwner,
  bytes32 tokenId
);
```

Reverts when the call to revoke operator is not authorized.

#### Parameters

| Name         |   Type    | Description |
| ------------ | :-------: | ----------- |
| `caller`     | `address` | -           |
| `tokenOwner` | `address` | -           |
| `tokenId`    | `bytes32` | -           |

<br/>

### LSP8TokenContractCannotHoldValue

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8tokencontractcannotholdvalue)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `LSP8TokenContractCannotHoldValue()`
- Error hash: `0x61f49442`

:::

```solidity
error LSP8TokenContractCannotHoldValue();
```

_LSP8 contract cannot receive native tokens._

Error occurs when sending native tokens to the LSP8 contract without sending any data. E.g. Sending value without passing a bytes4 function selector to call a LSP17 Extension.

<br/>

### LSP8TokenIdFormatNotEditable

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8tokenidformatnoteditable)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `LSP8TokenIdFormatNotEditable()`
- Error hash: `0x3664800a`

:::

```solidity
error LSP8TokenIdFormatNotEditable();
```

Reverts when trying to edit the data key `LSP8TokenIdFormat` after the identifiable digital asset contract has been deployed. The `LSP8TokenIdFormat` data key is located inside the ERC725Y Data key-value store of the identifiable digital asset contract. It can be set only once inside the constructor/initializer when the identifiable digital asset contract is being deployed.

<br/>

### LSP8TokenIdsDataEmptyArray

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8tokenidsdataemptyarray)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `LSP8TokenIdsDataEmptyArray()`
- Error hash: `0x80c98305`

:::

```solidity
error LSP8TokenIdsDataEmptyArray();
```

Reverts when empty arrays is passed to the function

<br/>

### LSP8TokenIdsDataLengthMismatch

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8tokenidsdatalengthmismatch)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `LSP8TokenIdsDataLengthMismatch()`
- Error hash: `0x2fa71dfe`

:::

```solidity
error LSP8TokenIdsDataLengthMismatch();
```

Reverts when the length of the token IDs data arrays is not equal

<br/>

### LSP8TokenOwnerCannotBeOperator

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8tokenownercannotbeoperator)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `LSP8TokenOwnerCannotBeOperator()`
- Error hash: `0x89fdad62`

:::

```solidity
error LSP8TokenOwnerCannotBeOperator();
```

Reverts when trying to authorize or revoke the token's owner as an operator.

<br/>

### LSP8TokenOwnerChanged

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8tokenownerchanged)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `LSP8TokenOwnerChanged(bytes32,address,address)`
- Error hash: `0x5a9c31d3`

:::

```solidity
error LSP8TokenOwnerChanged(
  bytes32 tokenId,
  address oldOwner,
  address newOwner
);
```

Reverts when the token owner changed inside the [`_beforeTokenTransfer`](#_beforetokentransfer) hook.

#### Parameters

| Name       |   Type    | Description |
| ---------- | :-------: | ----------- |
| `tokenId`  | `bytes32` | -           |
| `oldOwner` | `address` | -           |
| `newOwner` | `address` | -           |

<br/>

### NoExtensionFoundForFunctionSelector

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#noextensionfoundforfunctionselector)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `NoExtensionFoundForFunctionSelector(bytes4)`
- Error hash: `0xbb370b2b`

:::

```solidity
error NoExtensionFoundForFunctionSelector(bytes4 functionSelector);
```

reverts when there is no extension for the function selector being called with

#### Parameters

| Name               |   Type   | Description |
| ------------------ | :------: | ----------- |
| `functionSelector` | `bytes4` | -           |

<br/>

### OwnableCallerNotTheOwner

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#ownablecallernottheowner)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `OwnableCallerNotTheOwner(address)`
- Error hash: `0xbf1169c5`

:::

```solidity
error OwnableCallerNotTheOwner(address callerAddress);
```

Reverts when only the owner is allowed to call the function.

#### Parameters

| Name            |   Type    | Description                              |
| --------------- | :-------: | ---------------------------------------- |
| `callerAddress` | `address` | The address that tried to make the call. |

<br/>

### OwnableCannotSetZeroAddressAsOwner

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#ownablecannotsetzeroaddressasowner)
- Solidity implementation: [`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol)
- Error signature: `OwnableCannotSetZeroAddressAsOwner()`
- Error hash: `0x1ad8836c`

:::

```solidity
error OwnableCannotSetZeroAddressAsOwner();
```

Reverts when trying to set `address(0)` as the contract owner when deploying the contract, initializing it or transferring ownership of the contract.

<br/>
