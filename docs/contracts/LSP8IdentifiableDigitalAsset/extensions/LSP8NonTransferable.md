<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP8NonTransferable

:::info Standard Specifications

[`LSP-8-IdentifiableDigitalAsset`](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md)

:::
:::info Solidity implementation

[`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)

:::

LSP8 extension, adds the concept of a non-transferable token.

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### constructor

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#constructor)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)

:::

```solidity
constructor(string name_, string symbol_, address newOwner_);
```

_Deploying a `LSP8NonTransferable` token contract with: token name = `name_`, token symbol = `symbol_`, address `newOwner_` as the token contract owner. Switch ON the non-transferable flag._

#### Parameters

| Name | Type | Description |
| ---- | :--: | ----------- |

| `name_` | `string` | The name of the token. |

| `symbol_` | `string` | The symbol of the token. |

| `newOwner_` | `address` | The owner of the token contract. |

<br/>

### authorizeOperator

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#authorizeoperator)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Function signature: `authorizeOperator(address,bytes32)`
- Function selector: `0xcf5182ba`

:::

```solidity
function authorizeOperator(
  address operator,
  bytes32 tokenId
) external nonpayable;
```

Allow an `operator` address to transfer or burn a specific `tokenId` on behalf of its token owner. See [`isOperatorFor`](#isoperatorfor).

#### Parameters

| Name | Type | Description |
| ---- | :--: | ----------- |

| `operator` | `address` | The address to authorize as an operator. |

| `tokenId` | `bytes32` | The token ID operator has access to.. |

<br/>

### balanceOf

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#balanceof)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Function signature: `balanceOf(address)`
- Function selector: `0x70a08231`

:::

```solidity
function balanceOf(address tokenOwner) external view returns (uint256);
```

Get the number of token IDs owned by `tokenOwner`.

#### Parameters

| Name | Type | Description |
| ---- | :--: | ----------- |

| `tokenOwner` | `address` | The address to query \* |

#### Returns

| Name | Type | Description |
| ---- | :--: | ----------- |

| `0` | `uint256` | The total number of token IDs that `tokenOwner` owns. |

<br/>

### getData

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#getdata)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Function signature: `getData(bytes32)`
- Function selector: `0x54f6127f`

:::

```solidity
function getData(bytes32 dataKey) external view returns (bytes dataValue);
```

_Gets singular data at a given `dataKey`_

#### Parameters

| Name | Type | Description |
| ---- | :--: | ----------- |

| `dataKey` | `bytes32` | The key which value to retrieve |

#### Returns

| Name | Type | Description |
| ---- | :--: | ----------- |

| `dataValue` | `bytes` | The data stored at the key |

<br/>

### getDataBatch

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#getdatabatch)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
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

| Name | Type | Description |
| ---- | :--: | ----------- |

| `dataKeys` | `bytes32[]` | The array of keys which values to retrieve |

#### Returns

| Name | Type | Description |
| ---- | :--: | ----------- |

| `dataValues` | `bytes[]` | The array of data stored at multiple keys |

<br/>

### getOperatorsOf

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#getoperatorsof)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Function signature: `getOperatorsOf(bytes32)`
- Function selector: `0x49a6078d`

:::

```solidity
function getOperatorsOf(bytes32 tokenId) external view returns (address[]);
```

Returns all `operator` addresses that are allowed to transfer or burn a specific `tokenId` on behalf of its owner.

#### Parameters

| Name | Type | Description |
| ---- | :--: | ----------- |

| `tokenId` | `bytes32` | The token ID to get the operators for. |

#### Returns

| Name | Type | Description |
| ---- | :--: | ----------- |

| `0` | `address[]` | An array of operators allowed to transfer or burn a specific `tokenId`. Requirements - `tokenId` must exist. |

<br/>

### isOperatorFor

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#isoperatorfor)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
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

| Name | Type | Description |
| ---- | :--: | ----------- |

| `operator` | `address` | The address to query operator status for. |

| `tokenId` | `bytes32` | The token ID to check if `operator` is allowed to operate on. |

#### Returns

| Name | Type | Description |
| ---- | :--: | ----------- |

| `0` | `bool` | `true` if `operator` is an operator for `tokenId`, `false` otherwise. |

<br/>

### owner

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#owner)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Function signature: `owner()`
- Function selector: `0x8da5cb5b`

:::

```solidity
function owner() external view returns (address);
```

Returns the address of the current owner.

#### Returns

| Name | Type | Description |
| ---- | :--: | ----------- |

| `0` | `address` | - |

<br/>

### renounceOwnership

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#renounceownership)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
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

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#revokeoperator)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Function signature: `revokeOperator(address,bytes32)`
- Function selector: `0x0b0c6d82`

:::

```solidity
function revokeOperator(address operator, bytes32 tokenId) external nonpayable;
```

Remove access of `operator` for a given `tokenId`, disallowing it to transfer `tokenId` on behalf of its owner. See also [`isOperatorFor`](#isoperatorfor).

#### Parameters

| Name | Type | Description |
| ---- | :--: | ----------- |

| `operator` | `address` | The address to revoke as an operator. |

| `tokenId` | `bytes32` | The tokenId `operator` is revoked from operating on. |

<br/>

### setData

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#setdata)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Function signature: `setData(bytes32,bytes)`
- Function selector: `0x7f23690c`

:::

```solidity
function setData(bytes32 dataKey, bytes dataValue) external payable;
```

_Sets singular data for a given `dataKey`_

#### Parameters

| Name | Type | Description |
| ---- | :--: | ----------- |

| `dataKey` | `bytes32` | The key to retrieve stored value |

| `dataValue` | `bytes` | The value to set SHOULD only be callable by the owner of the contract set via ERC173 The function is marked as payable to enable flexibility on child contracts If the function is not intended to receive value, an additional check should be implemented to check that value equal 0. Emits a {DataChanged} event. |

<br/>

### setDataBatch

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#setdatabatch)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Function signature: `setDataBatch(bytes32[],bytes[])`
- Function selector: `0x97902421`

:::

```solidity
function setDataBatch(bytes32[] dataKeys, bytes[] dataValues) external payable;
```

Sets array of data for multiple given `dataKeys` SHOULD only be callable by the owner of the contract set via ERC173 The function is marked as payable to enable flexibility on child contracts If the function is not intended to receive value, an additional check should be implemented to check that value equal

0. Emits a [`DataChanged`](#datachanged) event.

#### Parameters

| Name | Type | Description |
| ---- | :--: | ----------- |

| `dataKeys` | `bytes32[]` | The array of data keys for values to set |

| `dataValues` | `bytes[]` | The array of values to set |

<br/>

### supportsInterface

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#supportsinterface)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Function signature: `supportsInterface(bytes4)`
- Function selector: `0x01ffc9a7`

:::

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool);
```

Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section] to learn more about how these ids are created. This function call must use less than 30 000 gas.

#### Parameters

| Name | Type | Description |
| ---- | :--: | ----------- |

| `interfaceId` | `bytes4` | - |

#### Returns

| Name | Type | Description |
| ---- | :--: | ----------- |

| `0` | `bool` | - |

<br/>

### tokenIdsOf

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#tokenidsof)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Function signature: `tokenIdsOf(address)`
- Function selector: `0xa3b261f2`

:::

```solidity
function tokenIdsOf(address tokenOwner) external view returns (bytes32[]);
```

Returns the list of token IDs that the `tokenOwner` address owns.

#### Parameters

| Name | Type | Description |
| ---- | :--: | ----------- |

| `tokenOwner` | `address` | The address that we want to get the list of token IDs for. |

#### Returns

| Name | Type | Description |
| ---- | :--: | ----------- |

| `0` | `bytes32[]` | An array of `bytes32[] tokenIds` owned by `tokenOwner`. |

<br/>

### tokenOwnerOf

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#tokenownerof)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Function signature: `tokenOwnerOf(bytes32)`
- Function selector: `0x217b2270`

:::

```solidity
function tokenOwnerOf(bytes32 tokenId) external view returns (address);
```

Returns the list of `tokenIds` for the `tokenOwner` address.

#### Parameters

| Name | Type | Description |
| ---- | :--: | ----------- |

| `tokenId` | `bytes32` | tokenOwner The address to query owned tokens |

#### Returns

| Name | Type | Description |
| ---- | :--: | ----------- |

| `0` | `address` | The owner address of the given `tokenId`. |

<br/>

### totalSupply

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#totalsupply)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Function signature: `totalSupply()`
- Function selector: `0x18160ddd`

:::

```solidity
function totalSupply() external view returns (uint256);
```

Returns the number of existing tokens that have been minted in this contract.

#### Returns

| Name | Type | Description |
| ---- | :--: | ----------- |

| `0` | `uint256` | The number of existing tokens. |

<br/>

### transfer

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#transfer)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
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

Transfer a given `tokenId` token from the `from` address to the `to` address. If operators are set for a specific `tokenId`, all the operators are revoked after the tokenId have been transferred. The `allowNonLSP1Recipient` parameter MUST be set to `true` when transferring tokens to Externally Owned Accounts (EOAs) or contracts that do not implement the LSP1 standard.

#### Parameters

| Name | Type | Description |
| ---- | :--: | ----------- |

| `from` | `address` | The address that owns the given `tokenId`. |

| `to` | `address` | The address that will receive the `tokenId`. |

| `tokenId` | `bytes32` | The token ID to transfer. |

| `allowNonLSP1Recipient` | `bool` | When set to `true`, the `to` address CAN be any addres. When set to `false`, the `to` address MUST be a contract that supports the LSP1 UniversalReceiver standard. |

| `data` | `bytes` | Any additional data the caller wants included in the emitted event, and sent in the hooks of the `from` and `to` addresses. |

<br/>

### transferBatch

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#transferbatch)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
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

Transfers multiple tokens at once based on the arrays of `from`, `to` and `tokenId`. If any transfer fails, the whole call will revert.

#### Parameters

| Name | Type | Description |
| ---- | :--: | ----------- |

| `from` | `address[]` | An array of sending addresses. |

| `to` | `address[]` | An array of recipient addresses. |

| `tokenId` | `bytes32[]` | An array of token IDs to transfer. |

| `allowNonLSP1Recipient` | `bool[]` | When set to `true`, `to` may be any address. When set to `false`, `to` must be a contract that supports the LSP1 standard and not revert. |

| `data` | `bytes[]` | Any additional data the caller wants included in the emitted event, and sent in the hooks to the `from` and `to` addresses. |

<br/>

### transferOwnership

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#transferownership)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Function signature: `transferOwnership(address)`
- Function selector: `0xf2fde38b`

:::

```solidity
function transferOwnership(address newOwner) external nonpayable;
```

Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.

#### Parameters

| Name | Type | Description |
| ---- | :--: | ----------- |

| `newOwner` | `address` | - |

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

_This function override the \_setData function to make the non-transferable flag not editable_

the ERC725Y data key `LSP8NonTransferable` cannot be changed
via this function once the digital asset contract has been deployed.

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

| Name | Type | Description |
| ---- | :--: | ----------- |

| `0` | `bool` | true if `caller` is either operator or owner |

<br/>

### \_revokeOperator

```solidity
function _revokeOperator(
  address operator,
  address tokenOwner,
  bytes32 tokenId
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

| Name | Type | Description |
| ---- | :--: | ----------- |

| `tokenOwner` | `address` | The address that is the owner of the `tokenId`. |

| `tokenId` | `bytes32` | The token to remove the associated operators for. |

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

```solidity
function _mint(
  address to,
  bytes32 tokenId,
  bool allowNonLSP1Recipient,
  bytes data
) internal nonpayable;
```

Create `tokenId` by minting it and transfers it to `to`.

<blockquote>

**Emitted events:**

- [`Transfer`](#transfer) event with `address(0)` as `from` address.

</blockquote>

#### Parameters

| Name | Type | Description |
| ---- | :--: | ----------- |

| `to` | `address` | @param tokenId The token ID to create (= mint). |

| `tokenId` | `bytes32` | The token ID to create (= mint). |

| `allowNonLSP1Recipient` | `bool` | When set to `true`, `to` may be any address. When set to `false`, `to` must be a contract that supports the LSP1 standard. |

| `data` | `bytes` | Any additional data the caller wants included in the emitted event, and sent in the hook of the `to` address. |

<br/>

### \_burn

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
Any logic in the [`_beforeTokenTransfer`](#_beforetokentransfer) function will run before burning `tokenId` and updating the balances.

<blockquote>

**Emitted events:**

- [`Transfer`](#transfer) event with `address(0)` as the `to` address.

</blockquote>

#### Parameters

| Name | Type | Description |
| ---- | :--: | ----------- |

| `tokenId` | `bytes32` | The token to burn. |

| `data` | `bytes` | Any additional data the caller wants included in the emitted event, and sent in the LSP1 hook on the token owner's address. |

<br/>

### \_transfer

```solidity
function _transfer(address, address, bytes32, bool, bytes) internal nonpayable;
```

This function override the internal `_transfer` function to make it non-transferable

<br/>

### \_beforeTokenTransfer

```solidity
function _beforeTokenTransfer(
  address from,
  address to,
  bytes32 tokenId
) internal nonpayable;
```

Hook that is called before any token transfer, including minting and burning.

- Allows to run custom logic before updating balances and notifiying sender/recipient by overriding this function.

#### Parameters

| Name | Type | Description |
| ---- | :--: | ----------- |

| `from` | `address` | The sender address |

| `to` | `address` | @param tokenId The tokenId to transfer |

| `tokenId` | `bytes32` | The tokenId to transfer |

<br/>

### \_notifyTokenSender

```solidity
function _notifyTokenSender(address from, bytes lsp1Data) internal nonpayable;
```

An attempt is made to notify the token sender about the `tokenId` changing owners using
LSP1 interface.

<br/>

### \_notifyTokenReceiver

```solidity
function _notifyTokenReceiver(
  address to,
  bool allowNonLSP1Recipient,
  bytes lsp1Data
) internal nonpayable;
```

An attempt is made to notify the token receiver about the `tokenId` changing owners
using LSP1 interface. When allowNonLSP1Recipient is FALSE the token receiver MUST support LSP1.
The receiver may revert when the token being sent is not wanted.

<br/>

## Events

### AuthorizedOperator

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#authorizedoperator)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Event signature: `AuthorizedOperator(address,address,bytes32)`
- Event topic hash: `0x34b797fc5a526f7bf1d2b5de25f6564fd85ae364e3ee939aee7c1ac27871a988`

:::

```solidity
event AuthorizedOperator(address indexed operator, address indexed tokenOwner, bytes32 indexed tokenId);
```

Emitted when `tokenOwner` enables `operator` to transfer or burn the `tokenId`.

#### Parameters

| Name | Type | Description |
| ---- | :--: | ----------- |

| `operator` **`indexed`** | `address` | The address authorized as an operator. |

| `tokenOwner` **`indexed`** | `address` | The owner of the `tokenId`. |

| `tokenId` **`indexed`** | `bytes32` | The tokenId `operator` address has access on behalf of `tokenOwner`. |

<br/>

### DataChanged

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#datachanged)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Event signature: `DataChanged(bytes32,bytes)`
- Event topic hash: `0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2`

:::

```solidity
event DataChanged(bytes32 indexed dataKey, bytes dataValue);
```

_Emitted when data at a key is changed_

#### Parameters

| Name | Type | Description |
| ---- | :--: | ----------- |

| `dataKey` **`indexed`** | `bytes32` | The data key which data value is set |

| `dataValue` | `bytes` | The data value to set |

<br/>

### OwnershipTransferred

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#ownershiptransferred)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Event signature: `OwnershipTransferred(address,address)`
- Event topic hash: `0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0`

:::

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
```

#### Parameters

| Name | Type | Description |
| ---- | :--: | ----------- |

| `previousOwner` **`indexed`** | `address` | - |

| `newOwner` **`indexed`** | `address` | - |

<br/>

### RevokedOperator

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#revokedoperator)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Event signature: `RevokedOperator(address,address,bytes32)`
- Event topic hash: `0x17d5389f6ab6adb2647dfa0aa365c323d37adacc30b33a65310b6158ce1373d5`

:::

```solidity
event RevokedOperator(address indexed operator, address indexed tokenOwner, bytes32 indexed tokenId);
```

Emitted when `tokenOwner` disables `operator` to transfer or burn `tokenId` on its behalf.

#### Parameters

| Name | Type | Description |
| ---- | :--: | ----------- |

| `operator` **`indexed`** | `address` | The address revoked from the operator array ({getOperatorsOf}). |

| `tokenOwner` **`indexed`** | `address` | The owner of the `tokenId`. |

| `tokenId` **`indexed`** | `bytes32` | The tokenId `operator` is revoked from operating on. |

<br/>

### Transfer

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#transfer)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Event signature: `Transfer(address,address,address,bytes32,bool,bytes)`
- Event topic hash: `0xb333c813a7426a7a11e2b190cad52c44119421594b47f6f32ace6d8c7207b2bf`

:::

```solidity
event Transfer(address operator, address indexed from, address indexed to, bytes32 indexed tokenId, bool allowNonLSP1Recipient, bytes data);
```

Emitted when `tokenId` token is transferred from the `from` to the `to` address.

#### Parameters

| Name | Type | Description |
| ---- | :--: | ----------- |

| `operator` | `address` | The address of operator that sent the `tokenId` |

| `from` **`indexed`** | `address` | The previous owner of the `tokenId` |

| `to` **`indexed`** | `address` | The new owner of `tokenId` |

| `tokenId` **`indexed`** | `bytes32` | The tokenId that was transferred |

| `allowNonLSP1Recipient` | `bool` | If the token transfer enforces the `to` recipient address to be a contract that implements the LSP1 standard or not. |

| `data` | `bytes` | Any additional data the caller included by the caller during the transfer, and sent in the hooks to the `from` and `to` addresses. |

<br/>

## Errors

### ERC725Y_DataKeysValuesEmptyArray

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#erc725y_datakeysvaluesemptyarray)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
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

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#erc725y_datakeysvalueslengthmismatch)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
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

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#erc725y_msgvaluedisallowed)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Error signature: `ERC725Y_MsgValueDisallowed()`
- Error hash: `0xf36ba737`

:::

```solidity
error ERC725Y_MsgValueDisallowed();
```

reverts when sending value to the `setData(..)` functions

<br/>

### LSP4TokenNameNotEditable

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp4tokennamenoteditable)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Error signature: `LSP4TokenNameNotEditable()`
- Error hash: `0x85c169bd`

:::

```solidity
error LSP4TokenNameNotEditable();
```

Reverts when trying to edit the data key `LSP4TokenName` after the digital asset contract has been deployed. The `LSP4TokenName` data key is located inside the ERC725Y Data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed.

<br/>

### LSP4TokenSymbolNotEditable

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp4tokensymbolnoteditable)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Error signature: `LSP4TokenSymbolNotEditable()`
- Error hash: `0x76755b38`

:::

```solidity
error LSP4TokenSymbolNotEditable();
```

Reverts when trying to edit the data key `LSP4TokenSymbol` after the digital asset contract has been deployed. The `LSP4TokenSymbol` data key is located inside the ERC725Y Data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed.

<br/>

### LSP8CannotUseAddressZeroAsOperator

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8cannotuseaddresszeroasoperator)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Error signature: `LSP8CannotUseAddressZeroAsOperator()`
- Error hash: `0x9577b8b3`

:::

```solidity
error LSP8CannotUseAddressZeroAsOperator();
```

reverts when trying to set the zero address as an operator.

<br/>

### LSP8InvalidTransferBatch

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8invalidtransferbatch)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Error signature: `LSP8InvalidTransferBatch()`
- Error hash: `0x93a83119`

:::

```solidity
error LSP8InvalidTransferBatch();
```

reverts when the parameters used for `transferBatch` have different lengths.

<br/>

### LSP8NonExistentTokenId

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8nonexistenttokenid)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Error signature: `LSP8NonExistentTokenId(bytes32)`
- Error hash: `0xae8f9a36`

:::

```solidity
error LSP8NonExistentTokenId(bytes32 tokenId);
```

reverts when `tokenId` has not been minted.

#### Parameters

| Name | Type | Description |
| ---- | :--: | ----------- |

| `tokenId` | `bytes32` | - |

<br/>

### LSP8NonExistingOperator

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8nonexistingoperator)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Error signature: `LSP8NonExistingOperator(address,bytes32)`
- Error hash: `0x4aa31a8c`

:::

```solidity
error LSP8NonExistingOperator(address operator, bytes32 tokenId);
```

reverts when `operator` is not an operator for the `tokenId`.

#### Parameters

| Name | Type | Description |
| ---- | :--: | ----------- |

| `operator` | `address` | - |

| `tokenId` | `bytes32` | - |

<br/>

### LSP8NonTransferableNotEditable

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8nontransferablenoteditable)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Error signature: `LSP8NonTransferableNotEditable()`
- Error hash: `0xd34e8077`

:::

```solidity
error LSP8NonTransferableNotEditable();
```

Reverts when trying to edit the data key `LSP8NonTransferable` after the digital asset contract has been deployed. The `LSP8NonTransferable` data key is located inside the ERC725Y Data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed.

<br/>

### LSP8NotTokenOperator

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8nottokenoperator)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Error signature: `LSP8NotTokenOperator(bytes32,address)`
- Error hash: `0x1294d2a9`

:::

```solidity
error LSP8NotTokenOperator(bytes32 tokenId, address caller);
```

reverts when `caller` is not an allowed operator for `tokenId`.

#### Parameters

| Name | Type | Description |
| ---- | :--: | ----------- |

| `tokenId` | `bytes32` | - |

| `caller` | `address` | - |

<br/>

### LSP8NotTokenOwner

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8nottokenowner)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Error signature: `LSP8NotTokenOwner(address,bytes32,address)`
- Error hash: `0x5b271ea2`

:::

```solidity
error LSP8NotTokenOwner(address tokenOwner, bytes32 tokenId, address caller);
```

reverts when `caller` is not the `tokenOwner` of the `tokenId`.

#### Parameters

| Name | Type | Description |
| ---- | :--: | ----------- |

| `tokenOwner` | `address` | - |

| `tokenId` | `bytes32` | - |

| `caller` | `address` | - |

<br/>

### LSP8OperatorAlreadyAuthorized

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8operatoralreadyauthorized)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Error signature: `LSP8OperatorAlreadyAuthorized(address,bytes32)`
- Error hash: `0xa7626b68`

:::

```solidity
error LSP8OperatorAlreadyAuthorized(address operator, bytes32 tokenId);
```

reverts when `operator` is already authorized for the `tokenId`.

#### Parameters

| Name | Type | Description |
| ---- | :--: | ----------- |

| `operator` | `address` | - |

| `tokenId` | `bytes32` | - |

<br/>

### LSP8TokenOwnerCannotBeOperator

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8tokenownercannotbeoperator)
- Solidity implementation: [`LSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol)
- Error signature: `LSP8TokenOwnerCannotBeOperator()`
- Error hash: `0x89fdad62`

:::

```solidity
error LSP8TokenOwnerCannotBeOperator();
```

reverts when trying to authorize or revoke the token's owner as an operator.

<br/>
