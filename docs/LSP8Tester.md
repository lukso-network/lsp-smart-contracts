# LSP8Tester









## Methods

### authorizeOperator

```solidity
function authorizeOperator(address operator, bytes32 tokenId) external nonpayable
```



*Makes `operator` address an operator of `tokenId`. See {isOperatorFor}. Emits an {AuthorizedOperator} event. Requirements - `tokenId` must exist. - caller must be current `tokenOwner` of `tokenId`. - `operator` cannot be calling address.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | undefined
| tokenId | bytes32 | undefined

### balanceOf

```solidity
function balanceOf(address tokenOwner) external view returns (uint256)
```



*Returns the number of tokens in ``tokenOwner``&#39;s account.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenOwner | address | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### burn

```solidity
function burn(bytes32 tokenId, bytes data) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | bytes32 | undefined
| data | bytes | undefined

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

### getOperatorsOf

```solidity
function getOperatorsOf(bytes32 tokenId) external view returns (address[])
```



*Returns all `operator` addresses of `tokenId`. Requirements - `tokenId` must exist.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | bytes32 | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address[] | undefined

### isOperatorFor

```solidity
function isOperatorFor(address operator, bytes32 tokenId) external view returns (bool)
```



*Returns whether `operator` address is an operator of `tokenId`. Operators can send and burn tokens on behalf of their owners. The tokenOwner is their own operator. Requirements - `tokenId` must exist.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | undefined
| tokenId | bytes32 | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined

### mint

```solidity
function mint(address to, bytes32 tokenId, bool force, bytes data) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined
| tokenId | bytes32 | undefined
| force | bool | undefined
| data | bytes | undefined

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
function revokeOperator(address operator, bytes32 tokenId) external nonpayable
```



*Revoke `operator` address operator status for the `tokenId`. See {isOperatorFor}. Emits a {RevokedOperator} event. Requirements - `tokenId` must exist. - caller must be current `tokenOwner` of `tokenId`. - `operator` cannot be calling address.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | undefined
| tokenId | bytes32 | undefined

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

### tokenIdsOf

```solidity
function tokenIdsOf(address tokenOwner) external view returns (bytes32[])
```



*Returns the list of `tokenIds` for the `tokenOwner` address.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenOwner | address | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32[] | undefined

### tokenOwnerOf

```solidity
function tokenOwnerOf(bytes32 tokenId) external view returns (address)
```



*Returns the `tokenOwner` of the `tokenId`. Requirements: - `tokenId` must exist.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | bytes32 | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

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
function transfer(address from, address to, bytes32 tokenId, bool force, bytes data) external nonpayable
```



*Transfers `tokenId` token from `from` to `to`. Requirements: - `from` cannot be the zero address. - `to` cannot be the zero address. - `tokenId` token must be owned by `from`. - If the caller is not `from`, it must be an `operator` address for this `tokenId`. Emits a {Transfer} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined
| to | address | undefined
| tokenId | bytes32 | undefined
| force | bool | undefined
| data | bytes | undefined

### transferBatch

```solidity
function transferBatch(address[] from, address[] to, bytes32[] tokenId, bool force, bytes[] data) external nonpayable
```



*Transfers many tokens based on the list `from`, `to`, `tokenId`. If any transfer fails, the call will revert. Requirements: - `from`, `to`, `tokenId` lists are the same length. - no values in `from` can be the zero address. - no values in `to` can be the zero address. - each `tokenId` token must be owned by `from`. - If the caller is not `from`, it must be an operator of `tokenId`. Emits {Transfer} event for each transfered token.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address[] | undefined
| to | address[] | undefined
| tokenId | bytes32[] | undefined
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
event AuthorizedOperator(address indexed operator, address indexed tokenOwner, bytes32 indexed tokenId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| operator `indexed` | address | undefined |
| tokenOwner `indexed` | address | undefined |
| tokenId `indexed` | bytes32 | undefined |

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
event RevokedOperator(address indexed operator, address indexed tokenOwner, bytes32 indexed tokenId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| operator `indexed` | address | undefined |
| tokenOwner `indexed` | address | undefined |
| tokenId `indexed` | bytes32 | undefined |

### Transfer

```solidity
event Transfer(address operator, address indexed from, address indexed to, bytes32 indexed tokenId, bool force, bytes data)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| operator  | address | undefined |
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| tokenId `indexed` | bytes32 | undefined |
| force  | bool | undefined |
| data  | bytes | undefined |



