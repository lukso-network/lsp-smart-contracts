# IERC725Y



> The interface for ERC725Y General key/value store



*ERC725Y provides the ability to set arbitrary key value sets that can be changed over time It is intended to standardise certain keys value pairs to allow automated retrievals and interactions from interfaces and other smart contracts*

## Methods

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



## Events

### DataChanged

```solidity
event DataChanged(bytes32 indexed key, bytes value)
```

Emitted when data at a key is changed



#### Parameters

| Name | Type | Description |
|---|---|---|
| key `indexed` | bytes32 | The key which value is set |
| value  | bytes | The value to set |



