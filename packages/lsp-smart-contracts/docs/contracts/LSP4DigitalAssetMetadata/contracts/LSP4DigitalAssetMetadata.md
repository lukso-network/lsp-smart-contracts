<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP4DigitalAssetMetadata

:::info Standard Specifications

[`LSP-4-DigitalAsset-Metadata`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-4-DigitalAsset-Metadata.md)

:::
:::info Solidity implementation

[`LSP4DigitalAssetMetadata.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp4-contracts/contracts/LSP4DigitalAssetMetadata.sol)

:::

> Implementation of a LSP4DigitalAssetMetadata contract that stores the **Token-Metadata** (`LSP4TokenName` and `LSP4TokenSymbol`) in its ERC725Y data store.

Standard Implementation of the LSP4 standard.

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### getData

:::note References

- Specification details: [**LSP-4-DigitalAsset-Metadata**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-4-DigitalAsset-Metadata.md#getdata)
- Solidity implementation: [`LSP4DigitalAssetMetadata.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp4-contracts/contracts/LSP4DigitalAssetMetadata.sol)
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

- Specification details: [**LSP-4-DigitalAsset-Metadata**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-4-DigitalAsset-Metadata.md#getdatabatch)
- Solidity implementation: [`LSP4DigitalAssetMetadata.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp4-contracts/contracts/LSP4DigitalAssetMetadata.sol)
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

### owner

:::note References

- Specification details: [**LSP-4-DigitalAsset-Metadata**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-4-DigitalAsset-Metadata.md#owner)
- Solidity implementation: [`LSP4DigitalAssetMetadata.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp4-contracts/contracts/LSP4DigitalAssetMetadata.sol)
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

- Specification details: [**LSP-4-DigitalAsset-Metadata**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-4-DigitalAsset-Metadata.md#renounceownership)
- Solidity implementation: [`LSP4DigitalAssetMetadata.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp4-contracts/contracts/LSP4DigitalAssetMetadata.sol)
- Function signature: `renounceOwnership()`
- Function selector: `0x715018a6`

:::

```solidity
function renounceOwnership() external nonpayable;
```

Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.

<br/>

### setData

:::note References

- Specification details: [**LSP-4-DigitalAsset-Metadata**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-4-DigitalAsset-Metadata.md#setdata)
- Solidity implementation: [`LSP4DigitalAssetMetadata.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp4-contracts/contracts/LSP4DigitalAssetMetadata.sol)
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

- Specification details: [**LSP-4-DigitalAsset-Metadata**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-4-DigitalAsset-Metadata.md#setdatabatch)
- Solidity implementation: [`LSP4DigitalAssetMetadata.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp4-contracts/contracts/LSP4DigitalAssetMetadata.sol)
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

### supportsInterface

:::note References

- Specification details: [**LSP-4-DigitalAsset-Metadata**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-4-DigitalAsset-Metadata.md#supportsinterface)
- Solidity implementation: [`LSP4DigitalAssetMetadata.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp4-contracts/contracts/LSP4DigitalAssetMetadata.sol)
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

### transferOwnership

:::note References

- Specification details: [**LSP-4-DigitalAsset-Metadata**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-4-DigitalAsset-Metadata.md#transferownership)
- Solidity implementation: [`LSP4DigitalAssetMetadata.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp4-contracts/contracts/LSP4DigitalAssetMetadata.sol)
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

The ERC725Y data keys `LSP4TokenName` and `LSP4TokenSymbol` cannot be changed
via this function once the digital asset contract has been deployed.

<br/>

## Events

### DataChanged

:::note References

- Specification details: [**LSP-4-DigitalAsset-Metadata**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-4-DigitalAsset-Metadata.md#datachanged)
- Solidity implementation: [`LSP4DigitalAssetMetadata.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp4-contracts/contracts/LSP4DigitalAssetMetadata.sol)
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

### OwnershipTransferred

:::note References

- Specification details: [**LSP-4-DigitalAsset-Metadata**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-4-DigitalAsset-Metadata.md#ownershiptransferred)
- Solidity implementation: [`LSP4DigitalAssetMetadata.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp4-contracts/contracts/LSP4DigitalAssetMetadata.sol)
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

## Errors

### ERC725Y_DataKeysValuesEmptyArray

:::note References

- Specification details: [**LSP-4-DigitalAsset-Metadata**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-4-DigitalAsset-Metadata.md#erc725y_datakeysvaluesemptyarray)
- Solidity implementation: [`LSP4DigitalAssetMetadata.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp4-contracts/contracts/LSP4DigitalAssetMetadata.sol)
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

- Specification details: [**LSP-4-DigitalAsset-Metadata**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-4-DigitalAsset-Metadata.md#erc725y_datakeysvalueslengthmismatch)
- Solidity implementation: [`LSP4DigitalAssetMetadata.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp4-contracts/contracts/LSP4DigitalAssetMetadata.sol)
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

- Specification details: [**LSP-4-DigitalAsset-Metadata**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-4-DigitalAsset-Metadata.md#erc725y_msgvaluedisallowed)
- Solidity implementation: [`LSP4DigitalAssetMetadata.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp4-contracts/contracts/LSP4DigitalAssetMetadata.sol)
- Error signature: `ERC725Y_MsgValueDisallowed()`
- Error hash: `0xf36ba737`

:::

```solidity
error ERC725Y_MsgValueDisallowed();
```

Reverts when sending value to the [`setData`](#setdata) or [`setDataBatch`](#setdatabatch) function.

<br/>

### LSP4TokenNameNotEditable

:::note References

- Specification details: [**LSP-4-DigitalAsset-Metadata**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-4-DigitalAsset-Metadata.md#lsp4tokennamenoteditable)
- Solidity implementation: [`LSP4DigitalAssetMetadata.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp4-contracts/contracts/LSP4DigitalAssetMetadata.sol)
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

- Specification details: [**LSP-4-DigitalAsset-Metadata**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-4-DigitalAsset-Metadata.md#lsp4tokensymbolnoteditable)
- Solidity implementation: [`LSP4DigitalAssetMetadata.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp4-contracts/contracts/LSP4DigitalAssetMetadata.sol)
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

- Specification details: [**LSP-4-DigitalAsset-Metadata**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-4-DigitalAsset-Metadata.md#lsp4tokentypenoteditable)
- Solidity implementation: [`LSP4DigitalAssetMetadata.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp4-contracts/contracts/LSP4DigitalAssetMetadata.sol)
- Error signature: `LSP4TokenTypeNotEditable()`
- Error hash: `0x4ef6d7fb`

:::

```solidity
error LSP4TokenTypeNotEditable();
```

Reverts when trying to edit the data key `LSP4TokenType` after the digital asset contract has been deployed / initialized. The `LSP4TokenType` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor / initializer when the digital asset contract is being deployed / initialized.

<br/>

### OwnableCallerNotTheOwner

:::note References

- Specification details: [**LSP-4-DigitalAsset-Metadata**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-4-DigitalAsset-Metadata.md#ownablecallernottheowner)
- Solidity implementation: [`LSP4DigitalAssetMetadata.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp4-contracts/contracts/LSP4DigitalAssetMetadata.sol)
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

- Specification details: [**LSP-4-DigitalAsset-Metadata**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-4-DigitalAsset-Metadata.md#ownablecannotsetzeroaddressasowner)
- Solidity implementation: [`LSP4DigitalAssetMetadata.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp4-contracts/contracts/LSP4DigitalAssetMetadata.sol)
- Error signature: `OwnableCannotSetZeroAddressAsOwner()`
- Error hash: `0x1ad8836c`

:::

```solidity
error OwnableCannotSetZeroAddressAsOwner();
```

Reverts when trying to set `address(0)` as the contract owner when deploying the contract, initializing it or transferring ownership of the contract.

<br/>
