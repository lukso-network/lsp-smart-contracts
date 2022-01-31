# LSP1UniversalReceiverDelegateUPInit

*Fabian Vogelsteller, Yamen Merhi, Jean Cavallera*

> Deployable Proxy Implementation of contract writing the received Vaults and LSP7, LSP8 assets into your ERC725Account using        the LSP5-ReceivedAsset and LSP10-ReceivedVaults standard and removing the sent vaults and assets.



*Delegate contract of the initial universal receiver Owner of the UniversalProfile MUST be a KeyManager that allows (this) address to setData on the UniversalProfile*

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



*Allows to register arrayKeys and Map of incoming vaults and assets and removing them after being sent*

#### Parameters

| Name | Type | Description |
|---|---|---|
| sender | address | The address calling the universalReceiver function
| typeId | bytes32 | The hash of a specific standard or a hook
| data | bytes | The arbitrary data received with the call

#### Returns

| Name | Type | Description |
|---|---|---|
| result | bytes | the return value of keyManager&#39;s execute function




