# ILSP4Compatibility







*LSP4 extension, for compatibility with clients &amp; tools that expect ERC20/721.*

## Methods

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

### name

```solidity
function name() external view returns (string)
```



*Returns the name of the token.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | The name of the token

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

### symbol

```solidity
function symbol() external view returns (string)
```



*Returns the symbol of the token, usually a shorter version of the name.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | The symbol of the token



## Events

### DataChanged

```solidity
event DataChanged(bytes32 indexed key, bytes value)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| key `indexed` | bytes32 | undefined |
| value  | bytes | undefined |



