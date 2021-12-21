# LSP1UniversalReceiverDelegateVault

*Fabian Vogelsteller, Yamen Merhi, Jean Cavallera*

> Implementation of contract writing the received LSP7 and LSP8 assets into your Vault using        the LSP5-ReceivedAsset standard and removing the sent assets.



*Delegate contract of the initial universal receiver*

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

### universalReceiverDelegate

```solidity
function universalReceiverDelegate(address sender, bytes32 typeId, bytes data) external nonpayable returns (bytes result)
```



*allows to register arrayKeys and Map of incoming assets and remove them on balance = 0*

#### Parameters

| Name | Type | Description |
|---|---|---|
| sender | address | token address
| typeId | bytes32 | token hooks
| data | bytes | concatenated data about token transfer

#### Returns

| Name | Type | Description |
|---|---|---|
| result | bytes | the return value




