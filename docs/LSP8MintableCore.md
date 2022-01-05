# LSP8MintableCore







*LSP8 extension*

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

### getData

```solidity
function getData(bytes32[] _keys) external view returns (bytes[])
```



*Gets array of data at multiple given `key`*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _keys | bytes32[] | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes[] | undefined

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



*Sets array of data at multiple given `key`. SHOULD only be callable by the owner of the contract set via ERC173. Emits a {DataChanged} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _keys | bytes32[] | undefined
| _values | bytes[] | undefined

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```



*Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section] to learn more about how these ids are created. This function call must use less than 30 000 gas.*

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



