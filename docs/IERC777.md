# IERC777







*Interface of the ERC777Token standard as defined in the EIP. This contract uses the https://eips.ethereum.org/EIPS/eip-1820[ERC1820 registry standard] to let token holders and recipients react to token movements by using setting implementers for the associated interfaces in said registry. See {IERC1820Registry} and {ERC1820Implementer}.*

## Methods

### authorizeOperator

```solidity
function authorizeOperator(address operator) external nonpayable
```



*Make an account an operator of the caller. See {isOperatorFor}. Emits an {AuthorizedOperator} event. Requirements - `operator` cannot be calling address.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | undefined

### balanceOf

```solidity
function balanceOf(address owner) external view returns (uint256)
```



*Returns the amount of tokens owned by an account (`owner`).*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### burn

```solidity
function burn(uint256 amount, bytes data) external nonpayable
```



*Destroys `amount` tokens from the caller&#39;s account, reducing the total supply. If a send hook is registered for the caller, the corresponding function will be called with `data` and empty `operatorData`. See {IERC777Sender}. Emits a {Burned} event. Requirements - the caller must have at least `amount` tokens.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | undefined
| data | bytes | undefined

### defaultOperators

```solidity
function defaultOperators() external view returns (address[])
```



*Returns the list of default operators. These accounts are operators for all token holders, even if {authorizeOperator} was never called on them. This list is immutable, but individual holders may revoke these via {revokeOperator}, in which case {isOperatorFor} will return false.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address[] | undefined

### granularity

```solidity
function granularity() external view returns (uint256)
```



*Returns the smallest part of the token that is not divisible. This means all token operations (creation, movement and destruction) must have amounts that are a multiple of this number. For most token contracts, this value will equal 1.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### isOperatorFor

```solidity
function isOperatorFor(address operator, address tokenHolder) external view returns (bool)
```



*Returns true if an account is an operator of `tokenHolder`. Operators can send and burn tokens on behalf of their owners. All accounts are their own operator. See {operatorSend} and {operatorBurn}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | undefined
| tokenHolder | address | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined

### name

```solidity
function name() external view returns (string)
```



*Returns the name of the token.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined

### operatorBurn

```solidity
function operatorBurn(address account, uint256 amount, bytes data, bytes operatorData) external nonpayable
```



*Destroys `amount` tokens from `account`, reducing the total supply. The caller must be an operator of `account`. If a send hook is registered for `account`, the corresponding function will be called with `data` and `operatorData`. See {IERC777Sender}. Emits a {Burned} event. Requirements - `account` cannot be the zero address. - `account` must have at least `amount` tokens. - the caller must be an operator for `account`.*

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



*Moves `amount` tokens from `sender` to `recipient`. The caller must be an operator of `sender`. If send or receive hooks are registered for `sender` and `recipient`, the corresponding functions will be called with `data` and `operatorData`. See {IERC777Sender} and {IERC777Recipient}. Emits a {Sent} event. Requirements - `sender` cannot be the zero address. - `sender` must have at least `amount` tokens. - the caller must be an operator for `sender`. - `recipient` cannot be the zero address. - if `recipient` is a contract, it must implement the {IERC777Recipient} interface.*

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



*Revoke an account&#39;s operator status for the caller. See {isOperatorFor} and {defaultOperators}. Emits a {RevokedOperator} event. Requirements - `operator` cannot be calling address.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | undefined

### send

```solidity
function send(address recipient, uint256 amount, bytes data) external nonpayable
```



*Moves `amount` tokens from the caller&#39;s account to `recipient`. If send or receive hooks are registered for the caller and `recipient`, the corresponding functions will be called with `data` and empty `operatorData`. See {IERC777Sender} and {IERC777Recipient}. Emits a {Sent} event. Requirements - the caller must have at least `amount` tokens. - `recipient` cannot be the zero address. - if `recipient` is a contract, it must implement the {IERC777Recipient} interface.*

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



*Returns the symbol of the token, usually a shorter version of the name.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```



*Returns the amount of tokens in existence.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined



## Events

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



