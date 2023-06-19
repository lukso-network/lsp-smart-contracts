# LSP8Enumerable

:::info Soldity contract

[`LSP8Enumerable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)

:::

LSP8 extension.

## Methods

### authorizeOperator

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#authorizeoperator)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Function signature: `authorizeOperator(address,bytes32)`
- Function selector: `0xcf5182ba`

:::

```solidity
function authorizeOperator(
  address operator,
  bytes32 tokenId
) external nonpayable;
```

Makes `operator` address an operator of `tokenId`. See [`isOperatorFor`](#isoperatorfor). Requirements

- `tokenId` must exist.

- caller must be current `tokenOwner` of `tokenId`.

- `operator` cannot be the zero address. Emits an [`AuthorizedOperator`](#authorizedoperator) event.

#### Parameters

| Name       |   Type    | Description                              |
| ---------- | :-------: | ---------------------------------------- |
| `operator` | `address` | The address to authorize as an operator. |
| `tokenId`  | `bytes32` | The tokenId operator has access to.      |

### balanceOf

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#balanceof)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
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

### getData

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#getdata)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
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

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#getdatabatch)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
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

### getOperatorsOf

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#getoperatorsof)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Function signature: `getOperatorsOf(bytes32)`
- Function selector: `0x49a6078d`

:::

```solidity
function getOperatorsOf(bytes32 tokenId) external view returns (address[]);
```

Returns all `operator` addresses of `tokenId`. Requirements

- `tokenId` must exist.

#### Parameters

| Name      |   Type    | Description          |
| --------- | :-------: | -------------------- |
| `tokenId` | `bytes32` | The tokenId to query |

#### Returns

| Name |    Type     | Description                             |
| ---- | :---------: | --------------------------------------- |
| `0`  | `address[]` | The list of operators for the `tokenId` |

### isOperatorFor

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#isoperatorfor)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Function signature: `isOperatorFor(address,bytes32)`
- Function selector: `0x2a3654a4`

:::

```solidity
function isOperatorFor(
  address operator,
  bytes32 tokenId
) external view returns (bool);
```

Returns whether `operator` address is an operator of `tokenId`. Operators can send and burn tokens on behalf of their owners. The tokenOwner is their own operator. Requirements

- `tokenId` must exist.

#### Parameters

| Name       |   Type    | Description          |
| ---------- | :-------: | -------------------- |
| `operator` | `address` | The address to query |
| `tokenId`  | `bytes32` | The tokenId to query |

#### Returns

| Name |  Type  | Description                                                           |
| ---- | :----: | --------------------------------------------------------------------- |
| `0`  | `bool` | True if the owner of `tokenId` is `operator` address, false otherwise |

### owner

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#owner)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
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

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#renounceownership)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Function signature: `renounceOwnership()`
- Function selector: `0x715018a6`

:::

```solidity
function renounceOwnership() external nonpayable;
```

Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.

### revokeOperator

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#revokeoperator)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Function signature: `revokeOperator(address,bytes32)`
- Function selector: `0x0b0c6d82`

:::

```solidity
function revokeOperator(address operator, bytes32 tokenId) external nonpayable;
```

Removes `operator` address as an operator of `tokenId`. See [`isOperatorFor`](#isoperatorfor). Requirements

- `tokenId` must exist.

- caller must be current `tokenOwner` of `tokenId`.

- `operator` cannot be the zero address. Emits a [`RevokedOperator`](#revokedoperator) event.

#### Parameters

| Name       |   Type    | Description                                      |
| ---------- | :-------: | ------------------------------------------------ |
| `operator` | `address` | The address to revoke as an operator.            |
| `tokenId`  | `bytes32` | The tokenId `operator` is revoked from operating |

### setData

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#setdata)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
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

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#setdatabatch)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
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

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#supportsinterface)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
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

### tokenAt

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#tokenat)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Function signature: `tokenAt(uint256)`
- Function selector: `0x92a91a3a`

:::

```solidity
function tokenAt(uint256 index) external view returns (bytes32);
```

Returns a token id at index. See totalSupply() to get total number of minted tokens.

#### Parameters

| Name    |   Type    | Description |
| ------- | :-------: | ----------- |
| `index` | `uint256` | -           |

#### Returns

| Name |   Type    | Description                                            |
| ---- | :-------: | ------------------------------------------------------ |
| `0`  | `bytes32` | TokenId or 0x00 if no token exist at the index `index` |

### tokenIdsOf

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#tokenidsof)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Function signature: `tokenIdsOf(address)`
- Function selector: `0xa3b261f2`

:::

```solidity
function tokenIdsOf(address tokenOwner) external view returns (bytes32[]);
```

Returns the list of `tokenIds` for the `tokenOwner` address.

#### Parameters

| Name         |   Type    | Description                       |
| ------------ | :-------: | --------------------------------- |
| `tokenOwner` | `address` | The address to query owned tokens |

#### Returns

| Name |    Type     | Description                                  |
| ---- | :---------: | -------------------------------------------- |
| `0`  | `bytes32[]` | List of owned tokens by `tokenOwner` address |

### tokenOwnerOf

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#tokenownerof)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Function signature: `tokenOwnerOf(bytes32)`
- Function selector: `0x217b2270`

:::

```solidity
function tokenOwnerOf(bytes32 tokenId) external view returns (address);
```

Returns the `tokenOwner` address of the `tokenId` token. Requirements:

- `tokenId` must exist.

#### Parameters

| Name      |   Type    | Description          |
| --------- | :-------: | -------------------- |
| `tokenId` | `bytes32` | The tokenId to query |

#### Returns

| Name |   Type    | Description                      |
| ---- | :-------: | -------------------------------- |
| `0`  | `address` | The address owning the `tokenId` |

### totalSupply

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#totalsupply)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
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

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#transfer)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Function signature: `transfer(address,address,bytes32,bool,bytes)`
- Function selector: `0x511b6952`

:::

```solidity
function transfer(
  address from,
  address to,
  bytes32 tokenId,
  bool allowNonLSP1Recipient,
  bytes data
) external nonpayable;
```

Transfers `tokenId` token from `from` to `to`. Requirements:

- `from` cannot be the zero address.

- `to` cannot be the zero address.

- `from` and `to` cannot be the same address.

- `tokenId` token must be owned by `from`.

- If the caller is not `from`, it must be an operator of `tokenId`. Emits a [`Transfer`](#transfer) event.

#### Parameters

| Name                    |   Type    | Description                                                                                                              |
| ----------------------- | :-------: | ------------------------------------------------------------------------------------------------------------------------ |
| `from`                  | `address` | The sending address.                                                                                                     |
| `to`                    | `address` | The receiving address.                                                                                                   |
| `tokenId`               | `bytes32` | The tokenId to transfer.                                                                                                 |
| `allowNonLSP1Recipient` |  `bool`   | When set to TRUE, to may be any address but when set to FALSE to must be a contract that supports LSP1 UniversalReceiver |
| `data`                  |  `bytes`  | Additional data the caller wants included in the emitted event, and sent in the hooks to `from` and `to` addresses.      |

### transferBatch

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#transferbatch)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Function signature: `transferBatch(address[],address[],bytes32[],bool[],bytes[])`
- Function selector: `0x7e87632c`

:::

```solidity
function transferBatch(
  address[] from,
  address[] to,
  bytes32[] tokenId,
  bool[] allowNonLSP1Recipient,
  bytes[] data
) external nonpayable;
```

Transfers many tokens based on the list `from`, `to`, `tokenId`. If any transfer fails the call will revert. Requirements:

- `from`, `to`, `tokenId` lists are the same length.

- no values in `from` can be the zero address.

- no values in `to` can be the zero address.

- `from` and `to` cannot be the same address at the same index of each lists.

- each `tokenId` token must be owned by `from`.

- If the caller is not `from`, it must be an operator of each `tokenId`. Emits [`Transfer`](#transfer) events.

#### Parameters

| Name                    |    Type     | Description                                                                                                              |
| ----------------------- | :---------: | ------------------------------------------------------------------------------------------------------------------------ |
| `from`                  | `address[]` | The list of sending addresses.                                                                                           |
| `to`                    | `address[]` | The list of receiving addresses.                                                                                         |
| `tokenId`               | `bytes32[]` | The list of tokenId to transfer.                                                                                         |
| `allowNonLSP1Recipient` |  `bool[]`   | When set to TRUE, to may be any address but when set to FALSE to must be a contract that supports LSP1 UniversalReceiver |
| `data`                  |  `bytes[]`  | Additional data the caller wants included in the emitted event, and sent in the hooks to `from` and `to` addresses.      |

### transferOwnership

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#transferownership)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
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

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#authorizedoperator)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Event signature: `AuthorizedOperator(address,address,bytes32)`
- Event hash: `0x34b797fc5a526f7bf1d2b5de25f6564fd85ae364e3ee939aee7c1ac27871a988`

:::

```solidity
event AuthorizedOperator(address indexed operator, address indexed tokenOwner, bytes32 indexed tokenId);
```

#### Parameters

| Name                       |   Type    | Description |
| -------------------------- | :-------: | ----------- |
| `operator` **`indexed`**   | `address` | -           |
| `tokenOwner` **`indexed`** | `address` | -           |
| `tokenId` **`indexed`**    | `bytes32` | -           |

### DataChanged

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#datachanged)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
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

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#ownershiptransferred)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
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

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#revokedoperator)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Event signature: `RevokedOperator(address,address,bytes32)`
- Event hash: `0x17d5389f6ab6adb2647dfa0aa365c323d37adacc30b33a65310b6158ce1373d5`

:::

```solidity
event RevokedOperator(address indexed operator, address indexed tokenOwner, bytes32 indexed tokenId);
```

#### Parameters

| Name                       |   Type    | Description |
| -------------------------- | :-------: | ----------- |
| `operator` **`indexed`**   | `address` | -           |
| `tokenOwner` **`indexed`** | `address` | -           |
| `tokenId` **`indexed`**    | `bytes32` | -           |

### Transfer

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#transfer)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Event signature: `Transfer(address,address,address,bytes32,bool,bytes)`
- Event hash: `0xb333c813a7426a7a11e2b190cad52c44119421594b47f6f32ace6d8c7207b2bf`

:::

```solidity
event Transfer(address operator, address indexed from, address indexed to, bytes32 indexed tokenId, bool allowNonLSP1Recipient, bytes data);
```

#### Parameters

| Name                    |   Type    | Description |
| ----------------------- | :-------: | ----------- |
| `operator`              | `address` | -           |
| `from` **`indexed`**    | `address` | -           |
| `to` **`indexed`**      | `address` | -           |
| `tokenId` **`indexed`** | `bytes32` | -           |
| `allowNonLSP1Recipient` |  `bool`   | -           |
| `data`                  |  `bytes`  | -           |

## Errors

### ERC725Y_DataKeysValuesEmptyArray

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#erc725y_datakeysvaluesemptyarray)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Error signature: `ERC725Y_DataKeysValuesEmptyArray()`
- Error hash: `0x97da5f95`

:::

```solidity
error ERC725Y_DataKeysValuesEmptyArray();
```

reverts when one of the array parameter provided to `setDataBatch` is an empty array

### ERC725Y_DataKeysValuesLengthMismatch

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#erc725y_datakeysvalueslengthmismatch)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Error signature: `ERC725Y_DataKeysValuesLengthMismatch()`
- Error hash: `0x3bcc8979`

:::

```solidity
error ERC725Y_DataKeysValuesLengthMismatch();
```

reverts when there is not the same number of elements in the lists of data keys and data values when calling setDataBatch.

### ERC725Y_MsgValueDisallowed

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#erc725y_msgvaluedisallowed)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Error signature: `ERC725Y_MsgValueDisallowed()`
- Error hash: `0xf36ba737`

:::

```solidity
error ERC725Y_MsgValueDisallowed();
```

reverts when sending value to the `setData(..)` functions

### LSP4TokenNameNotEditable

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp4tokennamenoteditable)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Error signature: `LSP4TokenNameNotEditable()`
- Error hash: `0x85c169bd`

:::

```solidity
error LSP4TokenNameNotEditable();
```

Reverts when trying to edit the data key `LSP4TokenName` after the digital asset contract has been deployed. The `LSP4TokenName` data key is located inside the ERC725Y Data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed.

### LSP4TokenSymbolNotEditable

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp4tokensymbolnoteditable)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Error signature: `LSP4TokenSymbolNotEditable()`
- Error hash: `0x76755b38`

:::

```solidity
error LSP4TokenSymbolNotEditable();
```

Reverts when trying to edit the data key `LSP4TokenSymbol` after the digital asset contract has been deployed. The `LSP4TokenSymbol` data key is located inside the ERC725Y Data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed.

### LSP8CannotSendToAddressZero

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8cannotsendtoaddresszero)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Error signature: `LSP8CannotSendToAddressZero()`
- Error hash: `0x24ecef4d`

:::

```solidity
error LSP8CannotSendToAddressZero();
```

reverts when trying to send token to the zero address.

### LSP8CannotSendToSelf

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8cannotsendtoself)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Error signature: `LSP8CannotSendToSelf()`
- Error hash: `0x5d67d6c1`

:::

```solidity
error LSP8CannotSendToSelf();
```

reverts when specifying the same address for `from` and `to` in a token transfer.

### LSP8CannotUseAddressZeroAsOperator

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8cannotuseaddresszeroasoperator)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Error signature: `LSP8CannotUseAddressZeroAsOperator()`
- Error hash: `0x9577b8b3`

:::

```solidity
error LSP8CannotUseAddressZeroAsOperator();
```

reverts when trying to set the zero address as an operator.

### LSP8InvalidTransferBatch

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8invalidtransferbatch)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Error signature: `LSP8InvalidTransferBatch()`
- Error hash: `0x93a83119`

:::

```solidity
error LSP8InvalidTransferBatch();
```

reverts when the parameters used for `transferBatch` have different lengths.

### LSP8NonExistentTokenId

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8nonexistenttokenid)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Error signature: `LSP8NonExistentTokenId(bytes32)`
- Error hash: `0xae8f9a36`

:::

```solidity
error LSP8NonExistentTokenId(bytes32 tokenId);
```

reverts when `tokenId` has not been minted.

#### Parameters

| Name      |   Type    | Description |
| --------- | :-------: | ----------- |
| `tokenId` | `bytes32` | -           |

### LSP8NonExistingOperator

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8nonexistingoperator)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Error signature: `LSP8NonExistingOperator(address,bytes32)`
- Error hash: `0x4aa31a8c`

:::

```solidity
error LSP8NonExistingOperator(address operator, bytes32 tokenId);
```

reverts when `operator` is not an operator for the `tokenId`.

#### Parameters

| Name       |   Type    | Description |
| ---------- | :-------: | ----------- |
| `operator` | `address` | -           |
| `tokenId`  | `bytes32` | -           |

### LSP8NotTokenOperator

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8nottokenoperator)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Error signature: `LSP8NotTokenOperator(bytes32,address)`
- Error hash: `0x1294d2a9`

:::

```solidity
error LSP8NotTokenOperator(bytes32 tokenId, address caller);
```

reverts when `caller` is not an allowed operator for `tokenId`.

#### Parameters

| Name      |   Type    | Description |
| --------- | :-------: | ----------- |
| `tokenId` | `bytes32` | -           |
| `caller`  | `address` | -           |

### LSP8NotTokenOwner

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8nottokenowner)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Error signature: `LSP8NotTokenOwner(address,bytes32,address)`
- Error hash: `0x5b271ea2`

:::

```solidity
error LSP8NotTokenOwner(address tokenOwner, bytes32 tokenId, address caller);
```

reverts when `caller` is not the `tokenOwner` of the `tokenId`.

#### Parameters

| Name         |   Type    | Description |
| ------------ | :-------: | ----------- |
| `tokenOwner` | `address` | -           |
| `tokenId`    | `bytes32` | -           |
| `caller`     | `address` | -           |

### LSP8NotifyTokenReceiverContractMissingLSP1Interface

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8notifytokenreceivercontractmissinglsp1interface)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Error signature: `LSP8NotifyTokenReceiverContractMissingLSP1Interface(address)`
- Error hash: `0x4349776d`

:::

```solidity
error LSP8NotifyTokenReceiverContractMissingLSP1Interface(
  address tokenReceiver
);
```

reverts if the `tokenReceiver` does not implement LSP1 when minting or transferring tokens with `bool allowNonLSP1Recipient` set as `false`.

#### Parameters

| Name            |   Type    | Description |
| --------------- | :-------: | ----------- |
| `tokenReceiver` | `address` | -           |

### LSP8NotifyTokenReceiverIsEOA

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8notifytokenreceiveriseoa)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Error signature: `LSP8NotifyTokenReceiverIsEOA(address)`
- Error hash: `0x03173137`

:::

```solidity
error LSP8NotifyTokenReceiverIsEOA(address tokenReceiver);
```

reverts if the `tokenReceiver` is an EOA when minting or transferring tokens with `bool allowNonLSP1Recipient` set as `false`.

#### Parameters

| Name            |   Type    | Description |
| --------------- | :-------: | ----------- |
| `tokenReceiver` | `address` | -           |

### LSP8OperatorAlreadyAuthorized

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8operatoralreadyauthorized)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Error signature: `LSP8OperatorAlreadyAuthorized(address,bytes32)`
- Error hash: `0xa7626b68`

:::

```solidity
error LSP8OperatorAlreadyAuthorized(address operator, bytes32 tokenId);
```

reverts when `operator` is already authorized for the `tokenId`.

#### Parameters

| Name       |   Type    | Description |
| ---------- | :-------: | ----------- |
| `operator` | `address` | -           |
| `tokenId`  | `bytes32` | -           |

### LSP8TokenOwnerCannotBeOperator

:::note Links

- Specification details in [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8tokenownercannotbeoperator)
- Solidity implementation in [**LSP8Enumerable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol)
- Error signature: `LSP8TokenOwnerCannotBeOperator()`
- Error hash: `0x89fdad62`

:::

```solidity
error LSP8TokenOwnerCannotBeOperator();
```

reverts when trying to authorize or revoke the token's owner as an operator.
