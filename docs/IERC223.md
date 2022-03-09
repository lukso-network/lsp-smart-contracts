# IERC223







*Interface of the ERC223 standard token as defined in the EIP.      see: https://github.com/Dexaran/ERC223-token-standard/blob/development/token/ERC223/IERC223.sol*

## Methods

### balanceOf

```solidity
function balanceOf(address who) external view returns (uint256)
```



*Returns the balance of the `who` address.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| who | address | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### decimals

```solidity
function decimals() external view returns (uint8)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint8 | undefined

### name

```solidity
function name() external view returns (string)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined

### standard

```solidity
function standard() external view returns (string)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined

### symbol

```solidity
function symbol() external view returns (string)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### transfer

```solidity
function transfer(address to, uint256 value, bytes data) external nonpayable returns (bool success)
```



*Transfers `value` tokens from `msg.sender` to `to` address with `data` parameter and returns `true` on success.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined
| value | uint256 | undefined
| data | bytes | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| success | bool | undefined



## Events

### Transfer

```solidity
event Transfer(address indexed from, address indexed to, uint256 value)
```



*Event that is fired on successful transfer.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| value  | uint256 | undefined |

### TransferData

```solidity
event TransferData(bytes data)
```



*Additional event that is fired on successful transfer and logs transfer metadata,      this event is implemented to keep Transfer event compatible with ERC20.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| data  | bytes | undefined |



