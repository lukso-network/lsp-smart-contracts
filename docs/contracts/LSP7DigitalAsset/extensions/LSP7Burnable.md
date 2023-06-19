# LSP7Burnable

:::info Soldity contract

[`LSP7Burnable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)

:::

LSP7 extension that allows token holders to destroy both their own tokens and those that they have an allowance for as an operator.

## Methods

### authorizeOperator

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#authorizeoperator)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Function signature: `authorizeOperator(address,uint256)`
- Function selector: `0x47980aa3`

:::

```solidity
function authorizeOperator(
  address operator,
  uint256 amount
) external nonpayable;
```

To avoid front-running and Allowance Double-Spend Exploit when increasing or decreasing the authorized amount of an operator, it is advised to:

1. call [`revokeOperator`](#revokeoperator) first, and

2. then re-call [`authorizeOperator`](#authorizeoperator) with the new amount for more information, see: https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/

#### Parameters

| Name       |   Type    | Description                                  |
| ---------- | :-------: | -------------------------------------------- |
| `operator` | `address` | The address to authorize as an operator.     |
| `amount`   | `uint256` | The amount of tokens operator has access to. |

### authorizedAmountFor

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#authorizedamountfor)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Function signature: `authorizedAmountFor(address,address)`
- Function selector: `0x65aeaa95`

:::

```solidity
function authorizedAmountFor(
  address operator,
  address tokenOwner
) external view returns (uint256);
```

Returns amount of tokens `operator` address has access to from `tokenOwner`. Operators can send and burn tokens on behalf of their owners. The tokenOwner is their own operator.

#### Parameters

| Name         |   Type    | Description                               |
| ------------ | :-------: | ----------------------------------------- |
| `operator`   | `address` | The address to query operator status for. |
| `tokenOwner` | `address` | The token owner.                          |

#### Returns

| Name |   Type    | Description                                                              |
| ---- | :-------: | ------------------------------------------------------------------------ |
| `0`  | `uint256` | The amount of tokens `operator` address has access to from `tokenOwner`. |

### balanceOf

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#balanceof)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Function signature: `balanceOf(address)`
- Function selector: `0x70a08231`

:::

```solidity
function balanceOf(address tokenOwner) external view returns (uint256);
```

Returns the number of tokens owned by `tokenOwner`.

#### Parameters

| Name         |   Type    | Description          |
| ------------ | :-------: | -------------------- |
| `tokenOwner` | `address` | The address to query |

#### Returns

| Name |   Type    | Description                                |
| ---- | :-------: | ------------------------------------------ |
| `0`  | `uint256` | The number of tokens owned by this address |

### burn

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#burn)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Function signature: `burn(address,uint256,bytes)`
- Function selector: `0x44d17187`

:::

```solidity
function burn(address from, uint256 amount, bytes data) external nonpayable;
```

Destroys `amount` tokens from the `from` address. See internal \_burn function for more details

#### Parameters

| Name     |   Type    | Description |
| -------- | :-------: | ----------- |
| `from`   | `address` | -           |
| `amount` | `uint256` | -           |
| `data`   |  `bytes`  | -           |

### decimals

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#decimals)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Function signature: `decimals()`
- Function selector: `0x313ce567`

:::

```solidity
function decimals() external view returns (uint8);
```

Returns the number of decimals used to get its user representation If the contract represents a NFT then 0 SHOULD be used, otherwise 18 is the common value NOTE: This information is only used for _display_ purposes: it in no way affects any of the arithmetic of the contract, including [`balanceOf`](#balanceof) and [`transfer`](#transfer).

#### Returns

| Name |  Type   | Description |
| ---- | :-----: | ----------- |
| `0`  | `uint8` | -           |

### decreaseAllowance

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#decreaseallowance)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Function signature: `decreaseAllowance(address,uint256)`
- Function selector: `0xa457c2d7`

:::

```solidity
function decreaseAllowance(
  address operator,
  uint256 substractedAmount
) external nonpayable;
```

_Decrease the allowance of `operator` by -`substractedAmount`_

Atomically decreases the allowance granted to `operator` by the caller. This is an alternative approach to [`authorizeOperator`](#authorizeoperator) that can be used as a mitigation for problems described in [`ILSP7DigitalAsset`](#ilsp7digitalasset) Emits:

- an [`AuthorizedOperator`](#authorizedoperator) event indicating the updated allowance after decreasing it.

- a [`RevokeOperator`](#revokeoperator) event if `substractedAmount` is the full allowance, indicating `operator` does not have any allowance left for `msg.sender`.Requirements:

- `operator` cannot be the zero address.

- operator`must have allowance for the caller of at least`substractedAmount`.

#### Parameters

| Name                |   Type    | Description                                                |
| ------------------- | :-------: | ---------------------------------------------------------- |
| `operator`          | `address` | the operator to decrease allowance for `msg.sender`        |
| `substractedAmount` | `uint256` | the amount to decrease by in the operator&#39;s allowance. |

### getData

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#getdata)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
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

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#getdatabatch)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
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

### increaseAllowance

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#increaseallowance)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Function signature: `increaseAllowance(address,uint256)`
- Function selector: `0x39509351`

:::

```solidity
function increaseAllowance(
  address operator,
  uint256 addedAmount
) external nonpayable;
```

_Increase the allowance of `operator` by +`addedAmount`_

Atomically increases the allowance granted to `operator` by the caller. This is an alternative approach to [`authorizeOperator`](#authorizeoperator) that can be used as a mitigation for problems described in [`ILSP7DigitalAsset`](#ilsp7digitalasset). Emits an [`AuthorizedOperator`](#authorizedoperator) event indicating the updated allowance.Requirements:

- `operator` cannot be the same address as `msg.sender`

- `operator` cannot be the zero address.

#### Parameters

| Name          |   Type    | Description                                                                 |
| ------------- | :-------: | --------------------------------------------------------------------------- |
| `operator`    | `address` | the operator to increase the allowance for `msg.sender`                     |
| `addedAmount` | `uint256` | the additional amount to add on top of the current operator&#39;s allowance |

### owner

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#owner)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
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

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#renounceownership)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Function signature: `renounceOwnership()`
- Function selector: `0x715018a6`

:::

```solidity
function renounceOwnership() external nonpayable;
```

Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.

### revokeOperator

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#revokeoperator)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Function signature: `revokeOperator(address)`
- Function selector: `0xfad8b32a`

:::

```solidity
function revokeOperator(address operator) external nonpayable;
```

Removes `operator` address as an operator of callers tokens. See [`authorizedAmountFor`](#authorizedamountfor). Requirements

- `operator` cannot be the zero address. Emits a [`RevokedOperator`](#revokedoperator) event.

#### Parameters

| Name       |   Type    | Description                           |
| ---------- | :-------: | ------------------------------------- |
| `operator` | `address` | The address to revoke as an operator. |

### setData

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#setdata)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
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

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#setdatabatch)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
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

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#supportsinterface)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
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

### totalSupply

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#totalsupply)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Function signature: `totalSupply()`
- Function selector: `0x18160ddd`

:::

```solidity
function totalSupply() external view returns (uint256);
```

Returns the number of existing tokens.

#### Returns

| Name |   Type    | Description                   |
| ---- | :-------: | ----------------------------- |
| `0`  | `uint256` | The number of existing tokens |

### transfer

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#transfer)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Function signature: `transfer(address,address,uint256,bool,bytes)`
- Function selector: `0x760d9bba`

:::

```solidity
function transfer(
  address from,
  address to,
  uint256 amount,
  bool allowNonLSP1Recipient,
  bytes data
) external nonpayable;
```

Transfers `amount` of tokens from `from` to `to`. The `allowNonLSP1Recipient` parameter will be used when notifying the token sender and receiver. Requirements:

- `from` cannot be the zero address.

- `to` cannot be the zero address.

- `amount` tokens must be owned by `from`.

- If the caller is not `from`, it must be an operator for `from` with access to at least `amount` tokens. Emits a [`Transfer`](#transfer) event.

#### Parameters

| Name                    |   Type    | Description                                                                                                              |
| ----------------------- | :-------: | ------------------------------------------------------------------------------------------------------------------------ |
| `from`                  | `address` | The sending address.                                                                                                     |
| `to`                    | `address` | The receiving address.                                                                                                   |
| `amount`                | `uint256` | The amount of tokens to transfer.                                                                                        |
| `allowNonLSP1Recipient` |  `bool`   | When set to TRUE, to may be any address but when set to FALSE to must be a contract that supports LSP1 UniversalReceiver |
| `data`                  |  `bytes`  | Additional data the caller wants included in the emitted event, and sent in the hooks to `from` and `to` addresses.      |

### transferBatch

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#transferbatch)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Function signature: `transferBatch(address[],address[],uint256[],bool[],bytes[])`
- Function selector: `0x2d7667c9`

:::

```solidity
function transferBatch(
  address[] from,
  address[] to,
  uint256[] amount,
  bool[] allowNonLSP1Recipient,
  bytes[] data
) external nonpayable;
```

Transfers many tokens based on the list `from`, `to`, `amount`. If any transfer fails the call will revert. Requirements:

- `from`, `to`, `amount` lists are the same length.

- no values in `from` can be the zero address.

- no values in `to` can be the zero address.

- each `amount` tokens must be owned by `from`.

- If the caller is not `from`, it must be an operator for `from` with access to at least `amount` tokens. Emits [`Transfer`](#transfer) events.

#### Parameters

| Name                    |    Type     | Description                                                                                                              |
| ----------------------- | :---------: | ------------------------------------------------------------------------------------------------------------------------ |
| `from`                  | `address[]` | The list of sending addresses.                                                                                           |
| `to`                    | `address[]` | The list of receiving addresses.                                                                                         |
| `amount`                | `uint256[]` | The amount of tokens to transfer.                                                                                        |
| `allowNonLSP1Recipient` |  `bool[]`   | When set to TRUE, to may be any address but when set to FALSE to must be a contract that supports LSP1 UniversalReceiver |
| `data`                  |  `bytes[]`  | Additional data the caller wants included in the emitted event, and sent in the hooks to `from` and `to` addresses.      |

### transferOwnership

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#transferownership)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
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

### AuthorizedOperator

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#authorizedoperator)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Event signature: `AuthorizedOperator(address,address,uint256)`
- Event hash: `0xd66aff874162a96578e919097b6f6d153dfd89a5cec41bb331fdb0c4aec16e2c`

:::

```solidity
event AuthorizedOperator(address indexed operator, address indexed tokenOwner, uint256 indexed amount);
```

#### Parameters

| Name                       |   Type    | Description |
| -------------------------- | :-------: | ----------- |
| `operator` **`indexed`**   | `address` | -           |
| `tokenOwner` **`indexed`** | `address` | -           |
| `amount` **`indexed`**     | `uint256` | -           |

### DataChanged

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#datachanged)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
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

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#ownershiptransferred)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
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

### RevokedOperator

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#revokedoperator)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Event signature: `RevokedOperator(address,address)`
- Event hash: `0x50546e66e5f44d728365dc3908c63bc5cfeeab470722c1677e3073a6ac294aa1`

:::

```solidity
event RevokedOperator(address indexed operator, address indexed tokenOwner);
```

#### Parameters

| Name                       |   Type    | Description |
| -------------------------- | :-------: | ----------- |
| `operator` **`indexed`**   | `address` | -           |
| `tokenOwner` **`indexed`** | `address` | -           |

### Transfer

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#transfer)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Event signature: `Transfer(address,address,address,uint256,bool,bytes)`
- Event hash: `0x3997e418d2cef0b3b0e907b1e39605c3f7d32dbd061e82ea5b4a770d46a160a6`

:::

```solidity
event Transfer(address indexed operator, address indexed from, address indexed to, uint256 amount, bool allowNonLSP1Recipient, bytes data);
```

#### Parameters

| Name                     |   Type    | Description |
| ------------------------ | :-------: | ----------- |
| `operator` **`indexed`** | `address` | -           |
| `from` **`indexed`**     | `address` | -           |
| `to` **`indexed`**       | `address` | -           |
| `amount`                 | `uint256` | -           |
| `allowNonLSP1Recipient`  |  `bool`   | -           |
| `data`                   |  `bytes`  | -           |

## Errors

### ERC725Y_DataKeysValuesEmptyArray

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#erc725y_datakeysvaluesemptyarray)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Error signature: `ERC725Y_DataKeysValuesEmptyArray()`
- Error hash: `0x97da5f95`

:::

```solidity
error ERC725Y_DataKeysValuesEmptyArray();
```

reverts when one of the array parameter provided to `setDataBatch` is an empty array

### ERC725Y_DataKeysValuesLengthMismatch

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#erc725y_datakeysvalueslengthmismatch)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Error signature: `ERC725Y_DataKeysValuesLengthMismatch()`
- Error hash: `0x3bcc8979`

:::

```solidity
error ERC725Y_DataKeysValuesLengthMismatch();
```

reverts when there is not the same number of elements in the lists of data keys and data values when calling setDataBatch.

### ERC725Y_MsgValueDisallowed

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#erc725y_msgvaluedisallowed)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Error signature: `ERC725Y_MsgValueDisallowed()`
- Error hash: `0xf36ba737`

:::

```solidity
error ERC725Y_MsgValueDisallowed();
```

reverts when sending value to the `setData(..)` functions

### LSP4TokenNameNotEditable

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#lsp4tokennamenoteditable)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Error signature: `LSP4TokenNameNotEditable()`
- Error hash: `0x85c169bd`

:::

```solidity
error LSP4TokenNameNotEditable();
```

Reverts when trying to edit the data key `LSP4TokenName` after the digital asset contract has been deployed. The `LSP4TokenName` data key is located inside the ERC725Y Data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed.

### LSP4TokenSymbolNotEditable

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#lsp4tokensymbolnoteditable)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Error signature: `LSP4TokenSymbolNotEditable()`
- Error hash: `0x76755b38`

:::

```solidity
error LSP4TokenSymbolNotEditable();
```

Reverts when trying to edit the data key `LSP4TokenSymbol` after the digital asset contract has been deployed. The `LSP4TokenSymbol` data key is located inside the ERC725Y Data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed.

### LSP7AmountExceedsAuthorizedAmount

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#lsp7amountexceedsauthorizedamount)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Error signature: `LSP7AmountExceedsAuthorizedAmount(address,uint256,address,uint256)`
- Error hash: `0xf3a6b691`

:::

```solidity
error LSP7AmountExceedsAuthorizedAmount(
  address tokenOwner,
  uint256 authorizedAmount,
  address operator,
  uint256 amount
);
```

reverts when `operator` of `tokenOwner` send an `amount` of tokens larger than the `authorizedAmount`.

#### Parameters

| Name               |   Type    | Description |
| ------------------ | :-------: | ----------- |
| `tokenOwner`       | `address` | -           |
| `authorizedAmount` | `uint256` | -           |
| `operator`         | `address` | -           |
| `amount`           | `uint256` | -           |

### LSP7AmountExceedsBalance

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#lsp7amountexceedsbalance)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Error signature: `LSP7AmountExceedsBalance(uint256,address,uint256)`
- Error hash: `0x08d47949`

:::

```solidity
error LSP7AmountExceedsBalance(
  uint256 balance,
  address tokenOwner,
  uint256 amount
);
```

reverts when sending an `amount` of tokens larger than the current `balance` of the `tokenOwner`.

#### Parameters

| Name         |   Type    | Description |
| ------------ | :-------: | ----------- |
| `balance`    | `uint256` | -           |
| `tokenOwner` | `address` | -           |
| `amount`     | `uint256` | -           |

### LSP7CannotSendToSelf

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#lsp7cannotsendtoself)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Error signature: `LSP7CannotSendToSelf()`
- Error hash: `0xb9afb000`

:::

```solidity
error LSP7CannotSendToSelf();
```

reverts when specifying the same address for `from` or `to` in a token transfer.

### LSP7CannotSendWithAddressZero

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#lsp7cannotsendwithaddresszero)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Error signature: `LSP7CannotSendWithAddressZero()`
- Error hash: `0xd2d5ec30`

:::

```solidity
error LSP7CannotSendWithAddressZero();
```

reverts when one tries to send tokens to or from the zero address.

### LSP7CannotUseAddressZeroAsOperator

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#lsp7cannotuseaddresszeroasoperator)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Error signature: `LSP7CannotUseAddressZeroAsOperator()`
- Error hash: `0x6355e766`

:::

```solidity
error LSP7CannotUseAddressZeroAsOperator();
```

reverts when trying to set the zero address as an operator.

### LSP7DecreasedAllowanceBelowZero

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#lsp7decreasedallowancebelowzero)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Error signature: `LSP7DecreasedAllowanceBelowZero()`
- Error hash: `0x0ef76c35`

:::

```solidity
error LSP7DecreasedAllowanceBelowZero();
```

Reverts when trying to decrease an operator's allowance to more than his current allowance

### LSP7InvalidTransferBatch

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#lsp7invalidtransferbatch)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Error signature: `LSP7InvalidTransferBatch()`
- Error hash: `0x263eee8d`

:::

```solidity
error LSP7InvalidTransferBatch();
```

reverts when the parameters used for `transferBatch` have different lengths.

### LSP7NotifyTokenReceiverContractMissingLSP1Interface

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#lsp7notifytokenreceivercontractmissinglsp1interface)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Error signature: `LSP7NotifyTokenReceiverContractMissingLSP1Interface(address)`
- Error hash: `0xa608fbb6`

:::

```solidity
error LSP7NotifyTokenReceiverContractMissingLSP1Interface(
  address tokenReceiver
);
```

reverts if the `tokenReceiver` does not implement LSP1 when minting or transferring tokens with `bool allowNonLSP1Recipient` set as `false`.

#### Parameters

| Name            |   Type    | Description |
| --------------- | :-------: | ----------- |
| `tokenReceiver` | `address` | -           |

### LSP7NotifyTokenReceiverIsEOA

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#lsp7notifytokenreceiveriseoa)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Error signature: `LSP7NotifyTokenReceiverIsEOA(address)`
- Error hash: `0x26c247f4`

:::

```solidity
error LSP7NotifyTokenReceiverIsEOA(address tokenReceiver);
```

reverts if the `tokenReceiver` is an EOA when minting or transferring tokens with `bool allowNonLSP1Recipient` set as `false`.

#### Parameters

| Name            |   Type    | Description |
| --------------- | :-------: | ----------- |
| `tokenReceiver` | `address` | -           |

### LSP7TokenOwnerCannotBeOperator

:::note Links

- Specification details in [**LSP-7-DigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-7-DigitalAsset.md#lsp7tokenownercannotbeoperator)
- Solidity implementation in [**LSP7Burnable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol)
- Error signature: `LSP7TokenOwnerCannotBeOperator()`
- Error hash: `0xdab75047`

:::

```solidity
error LSP7TokenOwnerCannotBeOperator();
```

reverts when trying to authorize or revoke the token's owner as an operator.
