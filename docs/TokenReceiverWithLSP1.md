# TokenReceiverWithLSP1









## Methods

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

### universalReceiver

```solidity
function universalReceiver(bytes32 typeId, bytes data) external nonpayable returns (bytes returnValue)
```



*Emits an event when it&#39;s succesfully executed Call the universalReceiverDelegate function in the UniversalReceiverDelegate (URD) contract, if the address of the URD was set as a value for the `_UniversalReceiverKey` in the account key/value value store of the same contract implementing the universalReceiver function and if the URD contract has the LSP1UniversalReceiverDelegate Interface Id registred using ERC165 Emits a {UniversalReceiver} event*

#### Parameters

| Name | Type | Description |
|---|---|---|
| typeId | bytes32 | The hash of a specific standard or a hook
| data | bytes | The arbitrary data received with the call

#### Returns

| Name | Type | Description |
|---|---|---|
| returnValue | bytes | undefined



## Events

### UniversalReceiver

```solidity
event UniversalReceiver(address indexed from, bytes32 indexed typeId, bytes indexed returnedValue, bytes receivedData)
```

Emitted when the universalReceiver function is succesfully executed



#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | undefined |
| typeId `indexed` | bytes32 | undefined |
| returnedValue `indexed` | bytes | undefined |
| receivedData  | bytes | undefined |

### UniversalReceiverCalled

```solidity
event UniversalReceiverCalled(bytes32 typeId, bytes data)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| typeId  | bytes32 | undefined |
| data  | bytes | undefined |



