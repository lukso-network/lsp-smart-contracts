# ERC777UniversalReceiver







*Implementation of the `IERC777` interface. WITHOUT the use of ERC1820, but LSP1UniversalReceiver. This implementation is agnostic to the way tokens are created. This means that a supply mechanism has to be added in a derived contract using `_mint`. Support for ERC20 is included in this contract, as specified by the EIP: both the ERC777 and ERC20 interfaces can be safely used when interacting with it. Both `IERC777.Sent` and `IERC20.Transfer` events are emitted on token movements. Additionally, the `granularity` value is hard-coded to `1`, meaning that there are no special restrictions in the amount of tokens that created, moved, or destroyed. This makes integration with ERC20 applications seamless.*

## Methods

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



