<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP4Compatibility

:::info Standard Specifications

[`LSP-4-DigitalAssetMetadata`](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md)

:::
:::info Solidity implementation

[`LSP4Compatibility.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)

:::

> LSP4Compatibility

LSP4 extension, for compatibility with clients & tools that expect ERC20/721.

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### getData

:::note References

- Specification details: [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#getdata)
- Solidity implementation: [`LSP4Compatibility.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
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

<br/>

### getDataBatch

:::note References

- Specification details: [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#getdatabatch)
- Solidity implementation: [`LSP4Compatibility.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
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

<br/>

### name

:::note References

- Specification details: [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#name)
- Solidity implementation: [`LSP4Compatibility.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
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

<br/>

### owner

:::note References

- Specification details: [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#owner)
- Solidity implementation: [`LSP4Compatibility.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
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

- Specification details: [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#renounceownership)
- Solidity implementation: [`LSP4Compatibility.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
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

- Specification details: [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#setdata)
- Solidity implementation: [`LSP4Compatibility.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
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

<br/>

### setDataBatch

:::note References

- Specification details: [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#setdatabatch)
- Solidity implementation: [`LSP4Compatibility.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
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

<br/>

### supportsInterface

:::note References

- Specification details: [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#supportsinterface)
- Solidity implementation: [`LSP4Compatibility.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
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

### symbol

:::note References

- Specification details: [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#symbol)
- Solidity implementation: [`LSP4Compatibility.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
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

<br/>

### transferOwnership

:::note References

- Specification details: [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#transferownership)
- Solidity implementation: [`LSP4Compatibility.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
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

<br/>

### \_setData

```solidity
function _setData(bytes32 dataKey, bytes dataValue) internal nonpayable;
```

<br/>

## Events

### DataChanged

:::note References

- Specification details: [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#datachanged)
- Solidity implementation: [`LSP4Compatibility.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
- Event signature: `DataChanged(bytes32,bytes)`
- Event topic hash: `0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2`

:::

```solidity
event DataChanged(bytes32 indexed dataKey, bytes dataValue);
```

_Emitted when data at a key is changed_

#### Parameters

| Name                    |   Type    | Description                          |
| ----------------------- | :-------: | ------------------------------------ |
| `dataKey` **`indexed`** | `bytes32` | The data key which data value is set |
| `dataValue`             |  `bytes`  | The data value to set                |

<br/>

### OwnershipTransferred

:::note References

- Specification details: [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#ownershiptransferred)
- Solidity implementation: [`LSP4Compatibility.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
- Event signature: `OwnershipTransferred(address,address)`
- Event topic hash: `0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0`

:::

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
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

- Specification details: [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#erc725y_datakeysvaluesemptyarray)
- Solidity implementation: [`LSP4Compatibility.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
- Error signature: `ERC725Y_DataKeysValuesEmptyArray()`
- Error hash: `0x97da5f95`

:::

```solidity
error ERC725Y_DataKeysValuesEmptyArray();
```

reverts when one of the array parameter provided to `setDataBatch` is an empty array

<br/>

### ERC725Y_DataKeysValuesLengthMismatch

:::note References

- Specification details: [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#erc725y_datakeysvalueslengthmismatch)
- Solidity implementation: [`LSP4Compatibility.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
- Error signature: `ERC725Y_DataKeysValuesLengthMismatch()`
- Error hash: `0x3bcc8979`

:::

```solidity
error ERC725Y_DataKeysValuesLengthMismatch();
```

reverts when there is not the same number of elements in the lists of data keys and data values when calling setDataBatch.

<br/>

### ERC725Y_MsgValueDisallowed

:::note References

- Specification details: [**LSP-4-DigitalAssetMetadata**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-4-DigitalAssetMetadata.md#erc725y_msgvaluedisallowed)
- Solidity implementation: [`LSP4Compatibility.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP4DigitalAssetMetadata/LSP4Compatibility.sol)
- Error signature: `ERC725Y_MsgValueDisallowed()`
- Error hash: `0xf36ba737`

:::

```solidity
error ERC725Y_MsgValueDisallowed();
```

reverts when sending value to the `setData(..)` functions

<br/>
