# ExternalERC777UniversalReceiverTester









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
function universalReceiverDelegate(address sender, bytes32 typeId, bytes data) external nonpayable returns (bytes)
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
| _0 | bytes | Any useful data could be returned



## Events

### ReceivedERC777

```solidity
event ReceivedERC777(address indexed token, address indexed _operator, address indexed _from, address _to, uint256 _amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token `indexed` | address | undefined |
| _operator `indexed` | address | undefined |
| _from `indexed` | address | undefined |
| _to  | address | undefined |
| _amount  | uint256 | undefined |



