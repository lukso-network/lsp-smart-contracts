# ILSP1UniversalReceiverDelegate



> The interface for LSP1UniversalReceiverDelegate



*LSP1UniversalReceiverDelegate allows for an external universal receiver smart contract, that is the delegate of the initial universal receiver*

## Methods

### universalReceiverDelegate

```solidity
function universalReceiverDelegate(address sender, bytes32 typeId, bytes data) external nonpayable returns (bytes result)
```



*Get called by the universalReceiver function, can be customized to have a specific logic*

#### Parameters

| Name | Type | Description |
|---|---|---|
| sender | address | The address calling the universalReceiver function
| typeId | bytes32 | The hash of a specific standard or a hook
| data | bytes | The arbitrary data received with the call

#### Returns

| Name | Type | Description |
|---|---|---|
| result | bytes | Any useful data could be returned




