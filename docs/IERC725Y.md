# IERC725Y



> ERC725 Y data store



*Contract module which provides the ability to set arbitrary key value sets that can be changed over time. It is intended to standardise certain keys value pairs to allow automated retrievals and interactions from interfaces and other smart contracts. `setData` should only be callable by the owner of the contract set via ERC173.*

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



## Events

### DataChanged

```solidity
event DataChanged(bytes32 indexed key, bytes value)
```



*Emitted when data at a key is changed.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| key `indexed` | bytes32 | undefined |
| value  | bytes | undefined |



