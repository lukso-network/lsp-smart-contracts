# LSP7DigitalAsset







*Implementation of a LSP7 compliant contract.*

## Methods

### authorizeOperator

```solidity
function authorizeOperator(address operator, uint256 amount) external nonpayable
```



*Sets `amount` as the amount of tokens `operator` address has access to from callers tokens. See {isOperatorFor}. Emits an {AuthorizedOperator} event. Requirements - `operator` cannot be calling address. - `operator` cannot be the zero address.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | undefined
| amount | uint256 | undefined

### balanceOf

```solidity
function balanceOf(address tokenOwner) external view returns (uint256)
```



*Returns the number of tokens owned by `tokenOwner`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenOwner | address | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### decimals

```solidity
function decimals() external view returns (uint256)
```



*Returns the number of decimals used to get its user representation. NOTE: This information is only used for _display_ purposes: it in no way affects any of the arithmetic of the contract, including {balanceOf} and {transfer}.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### getData

```solidity
function getData(bytes32[] _keys) external view returns (bytes[] values)
```

Gets array of data at multiple given `key`



#### Parameters

| Name | Type | Description |
|---|---|---|
| _keys | bytes32[] | the keys which values to retrieve

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
| operator | address | undefined
| tokenOwner | address | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

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



*Removes `operator` address as an operator of callers tokens. See {isOperatorFor}. Emits a {RevokedOperator} event. Requirements - `operator` cannot be calling address. - `operator` cannot be the zero address.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | undefined

### setData

```solidity
function setData(bytes32[] _keys, bytes[] _values) external nonpayable
```

Sets array of data at multiple given `key`



#### Parameters

| Name | Type | Description |
|---|---|---|
| _keys | bytes32[] | the keys which values to retrieve
| _values | bytes[] | the array of bytes to set.

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
| _0 | uint256 | undefined

### transfer

```solidity
function transfer(address from, address to, uint256 amount, bool force, bytes data) external nonpayable
```



*Transfers `amount` tokens from `from` to `to`. Requirements: - `from` cannot be the zero address. - `to` cannot be the zero address. - `amount` tokens must be owned by `from`. - If the caller is not `from`, it must be an operator for `from` with access to at least `amount` tokens. Emits a {Transfer} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined
| to | address | undefined
| amount | uint256 | undefined
| force | bool | undefined
| data | bytes | undefined

### transferBatch

```solidity
function transferBatch(address[] from, address[] to, uint256[] amount, bool force, bytes[] data) external nonpayable
```



*Transfers many tokens based on the list `from`, `to`, `amount`. If any transfer fails, the call will revert. Requirements: - `from`, `to`, `amount` lists are the same length. - no values in `from` can be the zero address. - no values in `to` can be the zero address. - each `amount` tokens must be owned by `from`. - If the caller is not `from`, it must be an operator for `from` with access to at least `amount` tokens. Emits {Transfer} event for each transfered token.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address[] | undefined
| to | address[] | undefined
| amount | uint256[] | undefined
| force | bool | undefined
| data | bytes[] | undefined

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



