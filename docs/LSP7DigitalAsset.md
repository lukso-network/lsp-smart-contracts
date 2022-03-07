# LSP7DigitalAsset

*Matthew Stevens*

> LSP7DigitalAsset contract



*Implementation of a LSP7 compliant contract.*

## Methods

### authorizeOperator

```solidity
function authorizeOperator(address operator, uint256 amount) external nonpayable
```



*Sets `amount` as the amount of tokens `operator` address has access to from callers tokens. See {isOperatorFor}. Requirements - `operator` cannot be the zero address. Emits an {AuthorizedOperator} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | The address to authorize as an operator.
| amount | uint256 | The amount of tokens operator has access to.

### balanceOf

```solidity
function balanceOf(address tokenOwner) external view returns (uint256)
```



*Returns the number of tokens owned by `tokenOwner`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenOwner | address | The address to query

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The number of tokens owned by this address

### decimals

```solidity
function decimals() external view returns (uint256)
```



*Returns the number of decimals used to get its user representation If the contract represents a NFT then 0 SHOULD be used, otherwise 18 is the common value NOTE: This information is only used for _display_ purposes: it in no way affects any of the arithmetic of the contract, including {balanceOf} and {transfer}.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### getData

```solidity
function getData(bytes32[] keys) external view returns (bytes[] values)
```

Gets array of data at multiple given keys



#### Parameters

| Name | Type | Description |
|---|---|---|
| keys | bytes32[] | The array of keys which values to retrieve

#### Returns

| Name | Type | Description |
|---|---|---|
| values | bytes[] | The array of data stored at multiple keys

### isOperatorFor

```solidity
function isOperatorFor(address operator, address tokenOwner) external view returns (uint256)
```



*Returns amount of tokens `operator` address has access to from `tokenOwner`. Operators can send and burn tokens on behalf of their owners. The tokenOwner is their own operator.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | The address to query operator status for.
| tokenOwner | address | The token owner.

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The amount of tokens `operator` address has access to from `tokenOwner`.

### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.*


### revokeOperator

```solidity
function revokeOperator(address operator) external nonpayable
```



*Removes `operator` address as an operator of callers tokens. See {isOperatorFor}. Requirements - `operator` cannot be the zero address. Emits a {RevokedOperator} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | The address to revoke as an operator.

### setData

```solidity
function setData(bytes32[] _keys, bytes[] _values) external nonpayable
```



*Sets array of data at multiple given `key` SHOULD only be callable by the owner of the contract set via ERC173 Emits a {DataChanged} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _keys | bytes32[] | undefined
| _values | bytes[] | undefined

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```



*See {IERC165-supportsInterface}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| interfaceId | bytes4 | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```



*Returns the number of existing tokens.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The number of existing tokens

### transfer

```solidity
function transfer(address from, address to, uint256 amount, bool force, bytes data) external nonpayable
```



*Transfers `amount` of tokens from `from` to `to`. The `force` parameter will be used when notifying the token sender and receiver. Requirements: - `from` cannot be the zero address. - `to` cannot be the zero address. - `amount` tokens must be owned by `from`. - If the caller is not `from`, it must be an operator for `from` with access to at least `amount` tokens. Emits a {Transfer} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | The sending address.
| to | address | The receiving address.
| amount | uint256 | The amount of tokens to transfer.
| force | bool | When set to TRUE, to may be any address but when set to FALSE to must be a contract that supports LSP1 UniversalReceiver
| data | bytes | Additional data the caller wants included in the emitted event, and sent in the hooks to `from` and `to` addresses.

### transferBatch

```solidity
function transferBatch(address[] from, address[] to, uint256[] amount, bool force, bytes[] data) external nonpayable
```



*Transfers many tokens based on the list `from`, `to`, `amount`. If any transfer fails the call will revert. Requirements: - `from`, `to`, `amount` lists are the same length. - no values in `from` can be the zero address. - no values in `to` can be the zero address. - each `amount` tokens must be owned by `from`. - If the caller is not `from`, it must be an operator for `from` with access to at least `amount` tokens. Emits {Transfer} events.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address[] | The list of sending addresses.
| to | address[] | The list of receiving addresses.
| amount | uint256[] | The amount of tokens to transfer.
| force | bool | When set to TRUE, to may be any address but when set to FALSE to must be a contract that supports LSP1 UniversalReceiver
| data | bytes[] | Additional data the caller wants included in the emitted event, and sent in the hooks to `from` and `to` addresses.

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```



*Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined



## Events

### AuthorizedOperator

```solidity
event AuthorizedOperator(address indexed operator, address indexed tokenOwner, uint256 indexed amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| operator `indexed` | address | undefined |
| tokenOwner `indexed` | address | undefined |
| amount `indexed` | uint256 | undefined |

### DataChanged

```solidity
event DataChanged(bytes32 indexed key, bytes value)
```

Emitted when data at a key is changed



#### Parameters

| Name | Type | Description |
|---|---|---|
| key `indexed` | bytes32 | undefined |
| value  | bytes | undefined |

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |

### RevokedOperator

```solidity
event RevokedOperator(address indexed operator, address indexed tokenOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| operator `indexed` | address | undefined |
| tokenOwner `indexed` | address | undefined |

### Transfer

```solidity
event Transfer(address indexed operator, address indexed from, address indexed to, uint256 amount, bool force, bytes data)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| operator `indexed` | address | undefined |
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| amount  | uint256 | undefined |
| force  | bool | undefined |
| data  | bytes | undefined |



## Events

### LSP7AmountExceedsAuthorizedAmount

```solidity
error LSP7AmountExceedsAuthorizedAmount(address tokenOwner, uint256 authorizedAmount, address operator, uint256 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenOwner | address | undefined |
| authorizedAmount | uint256 | undefined |
| operator | address | undefined |
| amount | uint256 | undefined |

### LSP7AmountExceedsBalance

```solidity
error LSP7AmountExceedsBalance(uint256 balance, address tokenOwner, uint256 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| balance | uint256 | undefined |
| tokenOwner | address | undefined |
| amount | uint256 | undefined |

### LSP7CannotSendWithAddressZero

```solidity
error LSP7CannotSendWithAddressZero()
```






### LSP7CannotUseAddressZeroAsOperator

```solidity
error LSP7CannotUseAddressZeroAsOperator()
```






### LSP7InvalidTransferBatch

```solidity
error LSP7InvalidTransferBatch()
```






### LSP7NotifyTokenReceiverContractMissingLSP1Interface

```solidity
error LSP7NotifyTokenReceiverContractMissingLSP1Interface(address tokenReceiver)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenReceiver | address | undefined |

### LSP7NotifyTokenReceiverIsEOA

```solidity
error LSP7NotifyTokenReceiverIsEOA(address tokenReceiver)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenReceiver | address | undefined |


