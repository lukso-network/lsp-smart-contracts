# LSP4DigitalCertificate









## Methods

### allDataKeys

```solidity
function allDataKeys() external view returns (bytes32[])
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32[] | undefined

### allTokenHolders

```solidity
function allTokenHolders() external view returns (bytes32[])
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32[] | undefined

### allowance

```solidity
function allowance(address holder, address spender) external view returns (uint256)
```



*See {IERC20-allowance}. Note that operator and allowance concepts are orthogonal: operators may not have allowance, and accounts with allowance may not be operators themselves.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| holder | address | undefined
| spender | address | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### approve

```solidity
function approve(address spender, uint256 value) external nonpayable returns (bool)
```



*See {IERC20-approve}. Note that accounts cannot have allowance issued by their operators.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| spender | address | undefined
| value | uint256 | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined

### authorizeOperator

```solidity
function authorizeOperator(address operator) external nonpayable
```



*See {IERC777-authorizeOperator}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | undefined

### balanceOf

```solidity
function balanceOf(address tokenHolder) external view returns (uint256)
```



*Returns the amount of tokens owned by an account (`tokenHolder`).*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenHolder | address | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### burn

```solidity
function burn(uint256 amount, bytes data) external nonpayable
```



*See {IERC777-burn}. Also emits a {IERC20-Transfer} event for ERC20 compatibility.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | undefined
| data | bytes | undefined

### dataCount

```solidity
function dataCount() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### dataKeys

```solidity
function dataKeys(uint256) external view returns (bytes32)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined

### decimals

```solidity
function decimals() external pure returns (uint8)
```



*See {ERC20-decimals}. Always returns 18, as per the [ERC777 EIP](https://eips.ethereum.org/EIPS/eip-777#backward-compatibility).*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint8 | undefined

### defaultOperators

```solidity
function defaultOperators() external view returns (address[])
```



*See {IERC777-defaultOperators}.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address[] | undefined

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

### granularity

```solidity
function granularity() external pure returns (uint256)
```



*See {IERC777-granularity}. This implementation always returns `1`.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### isOperatorFor

```solidity
function isOperatorFor(address operator, address tokenHolder) external view returns (bool)
```



*See {IERC777-isOperatorFor}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | undefined
| tokenHolder | address | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined

### mint

```solidity
function mint(address _address, uint256 _amount) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _address | address | undefined
| _amount | uint256 | undefined

### minter

```solidity
function minter() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

### name

```solidity
function name() external view returns (string)
```



*See {IERC777-name}.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined

### operatorBurn

```solidity
function operatorBurn(address account, uint256 amount, bytes data, bytes operatorData) external nonpayable
```



*See {IERC777-operatorBurn}. Emits {Burned} and {IERC20-Transfer} events.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | undefined
| amount | uint256 | undefined
| data | bytes | undefined
| operatorData | bytes | undefined

### operatorSend

```solidity
function operatorSend(address sender, address recipient, uint256 amount, bytes data, bytes operatorData) external nonpayable
```



*See {IERC777-operatorSend}. Emits {Sent} and {IERC20-Transfer} events.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| sender | address | undefined
| recipient | address | undefined
| amount | uint256 | undefined
| data | bytes | undefined
| operatorData | bytes | undefined

### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

### pause

```solidity
function pause() external nonpayable
```






### paused

```solidity
function paused() external view returns (bool)
```



*Returns true if the contract is paused, and false otherwise.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined

### removeDefaultOperators

```solidity
function removeDefaultOperators() external nonpayable
```






### removeMinter

```solidity
function removeMinter() external nonpayable
```






### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.*


### revokeOperator

```solidity
function revokeOperator(address operator) external nonpayable
```



*See {IERC777-revokeOperator}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | undefined

### send

```solidity
function send(address recipient, uint256 amount, bytes data) external nonpayable
```



*See {IERC777-send}. Also emits a {IERC20-Transfer} event for ERC20 compatibility.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| recipient | address | undefined
| amount | uint256 | undefined
| data | bytes | undefined

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

### symbol

```solidity
function symbol() external view returns (string)
```



*See {IERC777-symbol}.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```



*See {IERC777-totalSupply}.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### transfer

```solidity
function transfer(address recipient, uint256 amount) external nonpayable returns (bool)
```



*See {IERC20-transfer}. Unlike `send`, `recipient` is _not_ required to implement the {IERC777Recipient} interface if it is a contract. Also emits a {Sent} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| recipient | address | undefined
| amount | uint256 | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined

### transferFrom

```solidity
function transferFrom(address holder, address recipient, uint256 amount) external nonpayable returns (bool)
```



*See {IERC20-transferFrom}. Note that operator and allowance concepts are orthogonal: operators cannot call `transferFrom` (unless they have allowance), and accounts with allowance cannot call `operatorSend` (unless they are operators). Emits {Sent}, {IERC20-Transfer} and {IERC20-Approval} events.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| holder | address | undefined
| recipient | address | undefined
| amount | uint256 | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```



*Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined

### unpause

```solidity
function unpause() external nonpayable
```








## Events

### Approval

```solidity
event Approval(address indexed owner, address indexed spender, uint256 value)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | undefined |
| spender `indexed` | address | undefined |
| value  | uint256 | undefined |

### AuthorizedOperator

```solidity
event AuthorizedOperator(address indexed operator, address indexed tokenHolder)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| operator `indexed` | address | undefined |
| tokenHolder `indexed` | address | undefined |

### Burned

```solidity
event Burned(address indexed operator, address indexed from, uint256 amount, bytes data, bytes operatorData)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| operator `indexed` | address | undefined |
| from `indexed` | address | undefined |
| amount  | uint256 | undefined |
| data  | bytes | undefined |
| operatorData  | bytes | undefined |

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

### Minted

```solidity
event Minted(address indexed operator, address indexed to, uint256 amount, bytes data, bytes operatorData)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| operator `indexed` | address | undefined |
| to `indexed` | address | undefined |
| amount  | uint256 | undefined |
| data  | bytes | undefined |
| operatorData  | bytes | undefined |

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |

### Paused

```solidity
event Paused(address account)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account  | address | undefined |

### RevokedOperator

```solidity
event RevokedOperator(address indexed operator, address indexed tokenHolder)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| operator `indexed` | address | undefined |
| tokenHolder `indexed` | address | undefined |

### Sent

```solidity
event Sent(address indexed operator, address indexed from, address indexed to, uint256 amount, bytes data, bytes operatorData)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| operator `indexed` | address | undefined |
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| amount  | uint256 | undefined |
| data  | bytes | undefined |
| operatorData  | bytes | undefined |

### Transfer

```solidity
event Transfer(address indexed from, address indexed to, uint256 value)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| value  | uint256 | undefined |

### Unpaused

```solidity
event Unpaused(address account)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account  | address | undefined |



