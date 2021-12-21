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





#### Parameters

| Name | Type | Description |
|---|---|---|
| sender | address | undefined
| typeId | bytes32 | undefined
| data | bytes | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes | undefined



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



