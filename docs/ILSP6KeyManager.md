# ILSP6KeyManager







*Contract acting as a controller of an ERC725 Account, using permissions stored in the ERC725Y storage*

## Methods

### execute

```solidity
function execute(bytes _data) external payable returns (bytes)
```

execute the following payload on the ERC725Account: `_data`

*the ERC725Account will return some data on successful call, or revert on failure*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _data | bytes | the payload to execute. Obtained in web3 via encodeABI()

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes | result_ the data being returned by the ERC725 Account

### executeRelayCall

```solidity
function executeRelayCall(address _signedFor, uint256 _nonce, bytes _data, bytes _signature) external payable returns (bytes)
```



*allows anybody to execute given they have a signed message from an executor*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _signedFor | address | this KeyManager
| _nonce | uint256 | the address&#39; nonce (in a specific `_channel`), obtained via `getNonce(...)`. Used to prevent replay attack
| _data | bytes | obtained via encodeABI() in web3
| _signature | bytes | bytes32 ethereum signature

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes | result_ the data being returned by the ERC725 Account

### getNonce

```solidity
function getNonce(address _address, uint256 _channel) external view returns (uint256)
```

get latest nonce for `_from` for channel ID: `_channel`

*use channel ID = 0 for sequential nonces, any other number for out-of-order execution (= execution in parallel)*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _address | address | caller address
| _channel | uint256 | channel id

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### isValidSignature

```solidity
function isValidSignature(bytes32 hash, bytes signature) external view returns (bytes4 magicValue)
```



*Should return whether the signature provided is valid for the provided data*

#### Parameters

| Name | Type | Description |
|---|---|---|
| hash | bytes32 | Hash of the data to be signed
| signature | bytes | Signature byte array associated with _data

#### Returns

| Name | Type | Description |
|---|---|---|
| magicValue | bytes4 | undefined



## Events

### Executed

```solidity
event Executed(uint256 indexed _value, bytes _data)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _value `indexed` | uint256 | undefined |
| _data  | bytes | undefined |



