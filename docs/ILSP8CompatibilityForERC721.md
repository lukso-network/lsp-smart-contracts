# ILSP8CompatibilityForERC721







*LSP8 extension, for compatibility for clients / tools that expect ERC721.*

## Methods

### approve

```solidity
function approve(address operator, uint256 tokenId) external nonpayable
```



*Compatible with ERC721 approve.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | The address to approve for `amount`
| tokenId | uint256 | The tokenId to approve

### authorizeOperator

```solidity
function authorizeOperator(address operator, bytes32 tokenId) external nonpayable
```



*Makes `operator` address an operator of `tokenId`. See {isOperatorFor}. Requirements - `tokenId` must exist. - caller must be current `tokenOwner` of `tokenId`. - `operator` cannot be the zero address. Emits an {AuthorizedOperator} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | The address to authorize as an operator.
| tokenId | bytes32 | The tokenId operator has access to.

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

### getApproved

```solidity
function getApproved(uint256 tokenId) external view returns (address)
```



*Compatible with ERC721 getApproved.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | The tokenId to query

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | The address of the operator for `tokenId`

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

### getOperatorsOf

```solidity
function getOperatorsOf(bytes32 tokenId) external view returns (address[])
```



*Returns all `operator` addresses of `tokenId`. Requirements - `tokenId` must exist.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | bytes32 | The tokenId to query

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address[] | The list of operators for the `tokenId`

### isApprovedForAll

```solidity
function isApprovedForAll(address owner, address operator) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | undefined
| operator | address | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined

### isOperatorFor

```solidity
function isOperatorFor(address operator, bytes32 tokenId) external view returns (bool)
```



*Returns whether `operator` address is an operator of `tokenId`. Operators can send and burn tokens on behalf of their owners. The tokenOwner is their own operator. Requirements - `tokenId` must exist.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | The address to query
| tokenId | bytes32 | The tokenId to query

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | True if the owner of `tokenId` is `operator` address, false otherwise

### ownerOf

```solidity
function ownerOf(uint256 tokenId) external view returns (address)
```



*Compatible with ERC721 ownerOf.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | The tokenId to query

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | The owner of the tokenId

### revokeOperator

```solidity
function revokeOperator(address operator, bytes32 tokenId) external nonpayable
```



*Removes `operator` address as an operator of `tokenId`. See {isOperatorFor}. Requirements - `tokenId` must exist. - caller must be current `tokenOwner` of `tokenId`. - `operator` cannot be the zero address. Emits a {RevokedOperator} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | The address to revoke as an operator.
| tokenId | bytes32 | The tokenId `operator` is revoked from operating

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId, bytes data) external nonpayable
```



*Compatible with ERC721 safeTransferFrom.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | The sending address
| to | address | The receiving address
| tokenId | uint256 | The tokenId to transfer
| data | bytes | The data to be sent with the transfer

### setData

```solidity
function setData(bytes32[] keys, bytes[] values) external nonpayable
```



*Sets array of data at multiple given `key` SHOULD only be callable by the owner of the contract set via ERC173 Emits a {DataChanged} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| keys | bytes32[] | The array of keys which values to set
| values | bytes[] | The array of values to set

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
| tokenOwner | address | The address to query owned tokens

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32[] | List of owned tokens by `tokenOwner` address

### tokenOwnerOf

```solidity
function tokenOwnerOf(bytes32 tokenId) external view returns (address)
```



*Returns the `tokenOwner` address of the `tokenId` token. Requirements: - `tokenId` must exist.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | bytes32 | The tokenId to query

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | The address owning the `tokenId`

### tokenURI

```solidity
function tokenURI(uint256 tokenId) external nonpayable returns (string)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined

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
function transfer(address from, address to, bytes32 tokenId, bool force, bytes data) external nonpayable
```



*Transfers `tokenId` token from `from` to `to`. Requirements: - `from` cannot be the zero address. - `to` cannot be the zero address. - `tokenId` token must be owned by `from`. - If the caller is not `from`, it must be an operator of `tokenId`. Emits a {Transfer} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | The sending address.
| to | address | The receiving address.
| tokenId | bytes32 | The tokenId to transfer.
| force | bool | When set to TRUE, to may be any address but when set to FALSE to must be a contract that supports LSP1 UniversalReceiver
| data | bytes | Additional data the caller wants included in the emitted event, and sent in the hooks to `from` and `to` addresses.

### transferBatch

```solidity
function transferBatch(address[] from, address[] to, bytes32[] tokenId, bool force, bytes[] data) external nonpayable
```



*Transfers many tokens based on the list `from`, `to`, `tokenId`. If any transfer fails the call will revert. Requirements: - `from`, `to`, `tokenId` lists are the same length. - no values in `from` can be the zero address. - no values in `to` can be the zero address. - each `tokenId` token must be owned by `from`. - If the caller is not `from`, it must be an operator of each `tokenId`. Emits {Transfer} events.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address[] | The list of sending addresses.
| to | address[] | The list of receiving addresses.
| tokenId | bytes32[] | The list of tokenId to transfer.
| force | bool | When set to TRUE, to may be any address but when set to FALSE to must be a contract that supports LSP1 UniversalReceiver
| data | bytes[] | Additional data the caller wants included in the emitted event, and sent in the hooks to `from` and `to` addresses.

### transferFrom

```solidity
function transferFrom(address from, address to, uint256 tokenId) external nonpayable
```



*Compatible with ERC721 transferFrom.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | The sending address
| to | address | The receiving address
| tokenId | uint256 | The tokenId to transfer



## Events

### Approval

```solidity
event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)
```

To provide compatibility with indexing ERC721 events.

*Emitted when `owner` enables `approved` for `tokenId`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | The address of the owner of the `tokenId` |
| approved `indexed` | address | The address set as operator |
| tokenId `indexed` | uint256 | The approved tokenId |

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

Emitted when data at a key is changed



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

To provide compatibility with indexing ERC721 events.

*Emitted when `tokenId` token is transferred from `from` to `to`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator  | address | undefined |
| from `indexed` | address | The sending address |
| to `indexed` | address | The receiving address |
| tokenId `indexed` | bytes32 | The tokenId to transfer |
| force  | bool | undefined |
| data  | bytes | undefined |



