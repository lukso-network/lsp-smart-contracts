# KeyManagerHelper





Helper contract to test internal functions of the KeyManager



## Methods

### account

```solidity
function account() external view returns (contract ERC725)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract ERC725 | undefined

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

### getAddressPermissions

```solidity
function getAddressPermissions(address _address) external view returns (bytes32)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _address | address | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined

### getAllowedAddresses

```solidity
function getAllowedAddresses(address _address) external view returns (bytes)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _address | address | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes | undefined

### getAllowedFunctions

```solidity
function getAllowedFunctions(address _address) external view returns (bytes)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _address | address | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes | undefined

### getInterfaceId

```solidity
function getInterfaceId() external pure returns (bytes4)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes4 | undefined

### getNonce

```solidity
function getNonce(address _from, uint256 _channel) external view returns (uint256)
```

get latest nonce for `_from` for channel ID: `_channel`

*use channel ID = 0 for sequential nonces, any other number for out-of-order execution (= execution in parallel)*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _from | address | undefined
| _channel | uint256 | channel id

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### hasPermission

```solidity
function hasPermission(bytes32 _permission, bytes32 _addressPermission) external pure returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _permission | bytes32 | undefined
| _addressPermission | bytes32 | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined

### isValidSignature

```solidity
function isValidSignature(bytes32 _hash, bytes _signature) external view returns (bytes4 magicValue)
```



*Should return whether the signature provided is valid for the provided data*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _hash | bytes32 | undefined
| _signature | bytes | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| magicValue | bytes4 | undefined

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

### verifyIfAllowedAddress

```solidity
function verifyIfAllowedAddress(address _sender, address _recipient) external view
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _sender | address | undefined
| _recipient | address | undefined

### verifyIfAllowedFunction

```solidity
function verifyIfAllowedFunction(address _sender, bytes4 _function) external view
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _sender | address | undefined
| _function | bytes4 | undefined



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



## Events

### NotAllowedAddress

```solidity
error NotAllowedAddress(address from, address disallowedAddress)
```



*address `from` is not authorised to interact with `disallowedAddress` via account*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | address making the request |
| disallowedAddress | address | address that `from` is not authorised to call |

### NotAllowedFunction

```solidity
error NotAllowedFunction(address from, bytes4 disallowedFunction)
```



*address `from` is not authorised to run `disallowedFunction` via account*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | address making the request |
| disallowedFunction | bytes4 | bytes4 function selector that `from` is not authorised to run |

### NotAuthorised

```solidity
error NotAuthorised(address from, string permission)
```



*address `from` is not authorised to `permission`*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | address not-authorised |
| permission | string | permission required |


