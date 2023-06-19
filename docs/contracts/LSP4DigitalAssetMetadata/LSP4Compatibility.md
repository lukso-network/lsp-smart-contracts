# LSP4Compatibility

:::info Soldity contract

[`LSP4Compatibility.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)

:::

> LSP4Compatibility

LSP4 extension, for compatibility with clients & tools that expect ERC20/721.

## Methods

### getData

:::note Links

- Specification details in [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#getdata)
- Solidity implementation in [**LSP4Compatibility**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
- Function signature: `getData(bytes32)`
- Function selector: `0x54f6127f`

:::

```solidity
function getData(bytes32 dataKey) external view returns (bytes dataValue);
```

_Gets singular data at a given `dataKey`_

#### Parameters

| Name      |   Type    | Description                     |
| --------- | :-------: | ------------------------------- |
| `dataKey` | `bytes32` | The key which value to retrieve |

#### Returns

| Name        |  Type   | Description                |
| ----------- | :-----: | -------------------------- |
| `dataValue` | `bytes` | The data stored at the key |

### getDataBatch

:::note Links

- Specification details in [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#getdatabatch)
- Solidity implementation in [**LSP4Compatibility**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
- Function signature: `getDataBatch(bytes32[])`
- Function selector: `0xdedff9c6`

:::

```solidity
function getDataBatch(
  bytes32[] dataKeys
) external view returns (bytes[] dataValues);
```

_Gets array of data for multiple given keys_

#### Parameters

| Name       |    Type     | Description                                |
| ---------- | :---------: | ------------------------------------------ |
| `dataKeys` | `bytes32[]` | The array of keys which values to retrieve |

#### Returns

| Name         |   Type    | Description                               |
| ------------ | :-------: | ----------------------------------------- |
| `dataValues` | `bytes[]` | The array of data stored at multiple keys |

### name

:::note Links

- Specification details in [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#name)
- Solidity implementation in [**LSP4Compatibility**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
- Function signature: `name()`
- Function selector: `0x06fdde03`

:::

```solidity
function name() external view returns (string);
```

Returns the name of the token.

#### Returns

| Name |   Type   | Description           |
| ---- | :------: | --------------------- |
| `0`  | `string` | The name of the token |

### owner

:::note Links

- Specification details in [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#owner)
- Solidity implementation in [**LSP4Compatibility**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
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

### renounceOwnership

:::note Links

- Specification details in [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#renounceownership)
- Solidity implementation in [**LSP4Compatibility**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
- Function signature: `renounceOwnership()`
- Function selector: `0x715018a6`

:::

```solidity
function renounceOwnership() external nonpayable;
```

Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.

### setData

:::note Links

- Specification details in [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#setdata)
- Solidity implementation in [**LSP4Compatibility**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
- Function signature: `setData(bytes32,bytes)`
- Function selector: `0x7f23690c`

:::

```solidity
function setData(bytes32 dataKey, bytes dataValue) external payable;
```

_Sets singular data for a given `dataKey`_

#### Parameters

| Name        |   Type    | Description                                                                                                                                                                                                                                                                                                           |
| ----------- | :-------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dataKey`   | `bytes32` | The key to retrieve stored value                                                                                                                                                                                                                                                                                      |
| `dataValue` |  `bytes`  | The value to set SHOULD only be callable by the owner of the contract set via ERC173 The function is marked as payable to enable flexibility on child contracts If the function is not intended to receive value, an additional check should be implemented to check that value equal 0. Emits a {DataChanged} event. |

### setDataBatch

:::note Links

- Specification details in [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#setdatabatch)
- Solidity implementation in [**LSP4Compatibility**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
- Function signature: `setDataBatch(bytes32[],bytes[])`
- Function selector: `0x97902421`

:::

```solidity
function setDataBatch(bytes32[] dataKeys, bytes[] dataValues) external payable;
```

Sets array of data for multiple given `dataKeys` SHOULD only be callable by the owner of the contract set via ERC173 The function is marked as payable to enable flexibility on child contracts If the function is not intended to receive value, an additional check should be implemented to check that value equal

0. Emits a [`DataChanged`](#datachanged) event.

#### Parameters

| Name         |    Type     | Description                              |
| ------------ | :---------: | ---------------------------------------- |
| `dataKeys`   | `bytes32[]` | The array of data keys for values to set |
| `dataValues` |  `bytes[]`  | The array of values to set               |

### supportsInterface

:::note Links

- Specification details in [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#supportsinterface)
- Solidity implementation in [**LSP4Compatibility**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
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

### symbol

:::note Links

- Specification details in [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#symbol)
- Solidity implementation in [**LSP4Compatibility**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
- Function signature: `symbol()`
- Function selector: `0x95d89b41`

:::

```solidity
function symbol() external view returns (string);
```

Returns the symbol of the token, usually a shorter version of the name.

#### Returns

| Name |   Type   | Description             |
| ---- | :------: | ----------------------- |
| `0`  | `string` | The symbol of the token |

### transferOwnership

:::note Links

- Specification details in [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#transferownership)
- Solidity implementation in [**LSP4Compatibility**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
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

## Events

### DataChanged

:::note Links

- Specification details in [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#datachanged)
- Solidity implementation in [**LSP4Compatibility**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
- Event signature: `DataChanged(bytes32,bytes)`
- Event hash: `0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2`

:::

```solidity
event DataChanged(bytes32 indexed dataKey, bytes dataValue);
```

_Emitted when data at a key is changed_

#### Parameters

| Name                    |   Type    | Description |
| ----------------------- | :-------: | ----------- |
| `dataKey` **`indexed`** | `bytes32` | -           |
| `dataValue`             |  `bytes`  | -           |

### OwnershipTransferred

:::note Links

- Specification details in [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#ownershiptransferred)
- Solidity implementation in [**LSP4Compatibility**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
- Event signature: `OwnershipTransferred(address,address)`
- Event hash: `0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0`

:::

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
```

#### Parameters

| Name                          |   Type    | Description |
| ----------------------------- | :-------: | ----------- |
| `previousOwner` **`indexed`** | `address` | -           |
| `newOwner` **`indexed`**      | `address` | -           |

## Errors

### ERC725Y_DataKeysValuesEmptyArray

:::note Links

- Specification details in [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#erc725y_datakeysvaluesemptyarray)
- Solidity implementation in [**LSP4Compatibility**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
- Error signature: `ERC725Y_DataKeysValuesEmptyArray()`
- Error hash: `0x97da5f95`

:::

```solidity
error ERC725Y_DataKeysValuesEmptyArray();
```

reverts when one of the array parameter provided to `setDataBatch` is an empty array

### ERC725Y_DataKeysValuesLengthMismatch

:::note Links

- Specification details in [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#erc725y_datakeysvalueslengthmismatch)
- Solidity implementation in [**LSP4Compatibility**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
- Error signature: `ERC725Y_DataKeysValuesLengthMismatch()`
- Error hash: `0x3bcc8979`

:::

```solidity
error ERC725Y_DataKeysValuesLengthMismatch();
```

reverts when there is not the same number of elements in the lists of data keys and data values when calling setDataBatch.

### ERC725Y_MsgValueDisallowed

:::note Links

- Specification details in [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#erc725y_msgvaluedisallowed)
- Solidity implementation in [**LSP4Compatibility**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
- Error signature: `ERC725Y_MsgValueDisallowed()`
- Error hash: `0xf36ba737`

:::

```solidity
error ERC725Y_MsgValueDisallowed();
```

reverts when sending value to the `setData(..)` functions
