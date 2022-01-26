# LSP6KeyManagerInit

*Fabian Vogelsteller, Jean Cavallera*

> Proxy implementation of a contract acting as a controller of an ERC725 Account, using permissions stored in the ERC725Y storage



*all the permissions can be set on the ERC725 Account using `setData(...)` with the keys constants below*

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

### initialize

```solidity
function initialize(address _account) external nonpayable
```

Initiate the account with the address of the ERC725Account contract and sets LSP6KeyManager InterfaceId



#### Parameters

| Name | Type | Description |
|---|---|---|
| _account | address | The address of the ER725Account to control

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


