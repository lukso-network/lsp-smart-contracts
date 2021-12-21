# LSP1UniversalReceiverDelegateUPCore

*Fabian Vogelsteller, Yamen Merhi, Jean Cavallera*

> Core Implementation of contract writing the received Vaults and LSP7, LSP8 assets into your ERC725Account using        the LSP5-ReceivedAsset and LSP10-ReceivedVaults standard and removing the sent vaults and assets.



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



*allows to register arrayKeys and Map of incoming vaults and assets and remove them on balance = 0*

#### Parameters

| Name | Type | Description |
|---|---|---|
| sender | address | token/vault address
| typeId | bytes32 | token/vault hooks
| data | bytes | concatenated data about token/vault transfer

#### Returns

| Name | Type | Description |
|---|---|---|
| result | bytes | the return value of keyManager&#39;s execute function




