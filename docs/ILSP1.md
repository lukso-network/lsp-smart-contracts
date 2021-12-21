# ILSP1







*Contract module that allows to receive arbitrary messages when assets are sent or received.*

## Methods

### universalReceiver

```solidity
function universalReceiver(bytes32 typeId, bytes data) external nonpayable returns (bytes)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| typeId | bytes32 | undefined
| data | bytes | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes | undefined



## Events

### UniversalReceiver

```solidity
event UniversalReceiver(address indexed from, bytes32 indexed typeId, bytes indexed returnedValue, bytes receivedData)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | undefined |
| typeId `indexed` | bytes32 | undefined |
| returnedValue `indexed` | bytes | undefined |
| receivedData  | bytes | undefined |



