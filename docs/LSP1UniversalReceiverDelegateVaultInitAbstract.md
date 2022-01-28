# LSP1UniversalReceiverDelegateVaultInitAbstract

*Fabian Vogelsteller, Yamen Merhi, Jean Cavallera*

> Inheritable Proxy Implementation of contract writing the received LSP7 and LSP8 assets into your Vault using        the LSP5-ReceivedAsset standard and removing the sent assets.



*Delegate contract of the initial universal receiver*

## Methods

### initialize

```solidity
function initialize() external nonpayable
```

Register the LSP1UniversalReceiverDelegate InterfaceId




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

### universalReceiverDelegate

```solidity
function universalReceiverDelegate(address sender, bytes32 typeId, bytes data) external nonpayable returns (bytes result)
```



*allows to register arrayKeys and Map of incoming assets and remove after being sent*

#### Parameters

| Name | Type | Description |
|---|---|---|
| sender | address | The address calling the universalReceiver function
| typeId | bytes32 | The hash of a specific standard or a hook
| data | bytes | The arbitrary data received with the call

#### Returns

| Name | Type | Description |
|---|---|---|
| result | bytes | The return value




