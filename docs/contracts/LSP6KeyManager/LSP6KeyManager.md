# LSP6KeyManager

:::info Soldity contract

[`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)

:::

> Implementation of a contract acting as a controller of an ERC725 Account, using permissions stored in the ERC725Y storage

all the permissions can be set on the ERC725 Account using `setData(...)` with the keys constants below

## Methods

### constructor

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#constructor)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)

:::

```solidity
constructor(address target_);
```

_Initiate the account with the address of the ERC725Account contract and sets LSP6KeyManager InterfaceId_

#### Parameters

| Name      |   Type    | Description                                |
| --------- | :-------: | ------------------------------------------ |
| `target_` | `address` | The address of the ER725Account to control |

### execute

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#execute)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Function signature: `execute(bytes)`
- Function selector: `0x09c5eabe`

:::

```solidity
function execute(bytes payload) external payable returns (bytes);
```

_execute the following payload on the ERC725Account: `payload`_

the ERC725Account will return some data on successful call, or revert on failure

#### Parameters

| Name      |  Type   | Description                                              |
| --------- | :-----: | -------------------------------------------------------- |
| `payload` | `bytes` | the payload to execute. Obtained in web3 via encodeABI() |

#### Returns

| Name |  Type   | Description                                   |
| ---- | :-----: | --------------------------------------------- |
| `0`  | `bytes` | the data being returned by the ERC725 Account |

### executeBatch

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#executebatch)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Function signature: `executeBatch(uint256[],bytes[])`
- Function selector: `0xbf0176ff`

:::

```solidity
function executeBatch(
  uint256[] values,
  bytes[] payloads
) external payable returns (bytes[]);
```

batch `execute(bytes)`

#### Parameters

| Name       |    Type     | Description |
| ---------- | :---------: | ----------- |
| `values`   | `uint256[]` | -           |
| `payloads` |  `bytes[]`  | -           |

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `bytes[]` | -           |

### executeRelayCall

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#executerelaycall)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Function signature: `executeRelayCall(bytes,uint256,uint256,bytes)`
- Function selector: `0x4c8a4e74`

:::

```solidity
function executeRelayCall(
  bytes signature,
  uint256 nonce,
  uint256 validityTimestamps,
  bytes payload
) external payable returns (bytes);
```

allows anybody to execute given they have a signed message from an executor

#### Parameters

| Name                 |   Type    | Description                                                                                                                                                                                                                                                     |
| -------------------- | :-------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signature`          |  `bytes`  | bytes32 ethereum signature                                                                                                                                                                                                                                      |
| `nonce`              | `uint256` | the address&#39; nonce (in a specific `_channel`), obtained via `getNonce(...)`. Used to prevent replay attack                                                                                                                                                  |
| `validityTimestamps` | `uint256` | two `uint128` timestamps concatenated, the first timestamp determines from when the payload can be executed, the second timestamp delimits the end of the validity of the payload. If `validityTimestamps` is 0, the checks regardin the timestamps are skipped |
| `payload`            |  `bytes`  | obtained via encodeABI() in web3                                                                                                                                                                                                                                |

#### Returns

| Name |  Type   | Description                                   |
| ---- | :-----: | --------------------------------------------- |
| `0`  | `bytes` | the data being returned by the ERC725 Account |

### executeRelayCallBatch

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#executerelaycallbatch)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Function signature: `executeRelayCallBatch(bytes[],uint256[],uint256[],uint256[],bytes[])`
- Function selector: `0xa20856a5`

:::

```solidity
function executeRelayCallBatch(
  bytes[] signatures,
  uint256[] nonces,
  uint256[] validityTimestamps,
  uint256[] values,
  bytes[] payloads
) external payable returns (bytes[]);
```

batch `executeRelayCall(...)`

#### Parameters

| Name                 |    Type     | Description |
| -------------------- | :---------: | ----------- |
| `signatures`         |  `bytes[]`  | -           |
| `nonces`             | `uint256[]` | -           |
| `validityTimestamps` | `uint256[]` | -           |
| `values`             | `uint256[]` | -           |
| `payloads`           |  `bytes[]`  | -           |

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `bytes[]` | -           |

### getNonce

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#getnonce)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Function signature: `getNonce(address,uint128)`
- Function selector: `0xb44581d9`

:::

```solidity
function getNonce(
  address from,
  uint128 channelId
) external view returns (uint256);
```

_get latest nonce for `from` in channel ID: `channelId`_

use channel ID = 0 for sequential nonces, any other number for out-of-order execution (= execution in parallel)

#### Parameters

| Name        |   Type    | Description                               |
| ----------- | :-------: | ----------------------------------------- |
| `from`      | `address` | the caller or signer address              |
| `channelId` | `uint128` | the channel id to retrieve the nonce from |

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `uint256` | -           |

### isValidSignature

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#isvalidsignature)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Function signature: `isValidSignature(bytes32,bytes)`
- Function selector: `0x1626ba7e`

:::

```solidity
function isValidSignature(
  bytes32 dataHash,
  bytes signature
) external view returns (bytes4 magicValue);
```

Should return whether the signature provided is valid for the provided data

#### Parameters

| Name        |   Type    | Description                                 |
| ----------- | :-------: | ------------------------------------------- |
| `dataHash`  | `bytes32` | -                                           |
| `signature` |  `bytes`  | Signature byte array associated with \_data |

#### Returns

| Name         |   Type   | Description |
| ------------ | :------: | ----------- |
| `magicValue` | `bytes4` | -           |

### lsp20VerifyCall

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#lsp20verifycall)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Function signature: `lsp20VerifyCall(address,uint256,bytes)`
- Function selector: `0x9bf04b11`

:::

```solidity
function lsp20VerifyCall(
  address caller,
  uint256 msgValue,
  bytes data
) external nonpayable returns (bytes4);
```

#### Parameters

| Name       |   Type    | Description                                           |
| ---------- | :-------: | ----------------------------------------------------- |
| `caller`   | `address` | The address who called the function on the msg.sender |
| `msgValue` | `uint256` | -                                                     |
| `data`     |  `bytes`  | -                                                     |

#### Returns

| Name |   Type   | Description                                                                                                                                                                                                                                                                                                                                     |
| ---- | :------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0`  | `bytes4` | MUST return the first 3 bytes of `lsp20VerifyCall(address,uint256,bytes)` function selector if the call to the function is allowed, concatened with a byte that determines if the lsp20VerifyCallResult function should be called after the original function call. The byte that invoke the lsp20VerifyCallResult function is strictly `0x01`. |

### lsp20VerifyCallResult

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#,))
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Function signature: `,)`
- Function selector: `0x9f47dbd3`

:::

```solidity
function lsp20VerifyCallResult(
  bytes32,
  bytes
) external nonpayable returns (bytes4);
```

#### Parameters

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `_0` | `bytes32` | -           |
| `_1` |  `bytes`  | -           |

#### Returns

| Name |   Type   | Description                                                                                    |
| ---- | :------: | ---------------------------------------------------------------------------------------------- |
| `0`  | `bytes4` | MUST return the lsp20VerifyCallResult function selector if the call to the function is allowed |

### supportsInterface

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#supportsinterface)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Function signature: `supportsInterface(bytes4)`
- Function selector: `0x01ffc9a7`

:::

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool);
```

See [`IERC165-supportsInterface`](#ierc165-supportsinterface).

#### Parameters

| Name          |   Type   | Description |
| ------------- | :------: | ----------- |
| `interfaceId` | `bytes4` | -           |

#### Returns

| Name |  Type  | Description |
| ---- | :----: | ----------- |
| `0`  | `bool` | -           |

### target

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#target)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Function signature: `target()`
- Function selector: `0xd4b83992`

:::

```solidity
function target() external view returns (address);
```

_returns the address of the account linked to this KeyManager_

this can be a contract that implements

- ERC725X only

- ERC725Y only

- any ERC725 based contract (so implementing both ERC725X and ERC725Y)

#### Returns

| Name |   Type    | Description                       |
| ---- | :-------: | --------------------------------- |
| `0`  | `address` | the address of the linked account |

## Events

### VerifiedCall

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#verifiedcall)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Event signature: `VerifiedCall(address,uint256,bytes4)`
- Event hash: `0xa54458b75709e42f79700ffb6cfc57c7e224d8a77a52c457ee7ecb8e22636280`

:::

```solidity
event VerifiedCall(address indexed signer, uint256 indexed value, bytes4 indexed selector);
```

#### Parameters

| Name                     |   Type    | Description |
| ------------------------ | :-------: | ----------- |
| `signer` **`indexed`**   | `address` | -           |
| `value` **`indexed`**    | `uint256` | -           |
| `selector` **`indexed`** | `bytes4`  | -           |

## Errors

### AddressPermissionArrayIndexValueNotAnAddress

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#addresspermissionarrayindexvaluenotanaddress)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `AddressPermissionArrayIndexValueNotAnAddress(bytes32,bytes)`
- Error hash: `0x8f4afa38`

:::

```solidity
error AddressPermissionArrayIndexValueNotAnAddress(
  bytes32 dataKey,
  bytes invalidValue
);
```

reverts when trying to set a value that is not 20 bytes long under AddressPermissions[index]

#### Parameters

| Name           |   Type    | Description                                                                    |
| -------------- | :-------: | ------------------------------------------------------------------------------ |
| `dataKey`      | `bytes32` | the AddressPermissions[index] data key                                         |
| `invalidValue` |  `bytes`  | the invalid value that was attempted to be set under AddressPermissions[index] |

### BatchExecuteParamsLengthMismatch

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#batchexecuteparamslengthmismatch)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `BatchExecuteParamsLengthMismatch()`
- Error hash: `0x55a187db`

:::

```solidity
error BatchExecuteParamsLengthMismatch();
```

there should be the same number of elements for each array parameters in the following batch functions:

- execute(uint256[],bytes[])

- executeRelayCall(bytes[],uint256[],uint256[],bytes[])

### BatchExecuteRelayCallParamsLengthMismatch

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#batchexecuterelaycallparamslengthmismatch)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `BatchExecuteRelayCallParamsLengthMismatch()`
- Error hash: `0xb4d50d21`

:::

```solidity
error BatchExecuteRelayCallParamsLengthMismatch();
```

reverts when providing array parameters of different sizes to `executeRelayCall(bytes[],uint256[],bytes[])`

### CallingKeyManagerNotAllowed

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#callingkeymanagernotallowed)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `CallingKeyManagerNotAllowed()`
- Error hash: `0xa431b236`

:::

```solidity
error CallingKeyManagerNotAllowed();
```

reverts when calling the KeyManager through execute(..)

### CannotSendValueToSetData

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#cannotsendvaluetosetdata)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `CannotSendValueToSetData()`
- Error hash: `0x59a529fc`

:::

```solidity
error CannotSendValueToSetData();
```

reverts when sending value to the `setData(..)` functions

### DelegateCallDisallowedViaKeyManager

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#delegatecalldisallowedviakeymanager)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `DelegateCallDisallowedViaKeyManager()`
- Error hash: `0x80d6ebae`

:::

```solidity
error DelegateCallDisallowedViaKeyManager();
```

ERC725X operation type 4 (DELEGATECALL) is disallowed by default

### ERC725Y_DataKeysValuesLengthMismatch

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#erc725y_datakeysvalueslengthmismatch)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `ERC725Y_DataKeysValuesLengthMismatch()`
- Error hash: `0x3bcc8979`

:::

```solidity
error ERC725Y_DataKeysValuesLengthMismatch();
```

reverts when there is not the same number of elements in the lists of data keys and data values when calling setDataBatch.

### InvalidERC725Function

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#invaliderc725function)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `InvalidERC725Function(bytes4)`
- Error hash: `0x2ba8851c`

:::

```solidity
error InvalidERC725Function(bytes4 invalidFunction);
```

reverts when trying to run an invalid function on the linked target account via the Key Manager.

#### Parameters

| Name              |   Type   | Description                                 |
| ----------------- | :------: | ------------------------------------------- |
| `invalidFunction` | `bytes4` | the bytes4 selector of the invalid function |

### InvalidEncodedAllowedCalls

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#invalidencodedallowedcalls)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `InvalidEncodedAllowedCalls(bytes)`
- Error hash: `0x187e77ab`

:::

```solidity
error InvalidEncodedAllowedCalls(bytes allowedCallsValue);
```

reverts when `allowedCallsValue` is not properly encoded as a bytes28[CompactBytesArray] (CompactBytesArray of bytes28 entries). See LSP2 value type `CompactBytesArray` for details.

#### Parameters

| Name                |  Type   | Description              |
| ------------------- | :-----: | ------------------------ |
| `allowedCallsValue` | `bytes` | the list of allowedCalls |

### InvalidEncodedAllowedERC725YDataKeys

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#invalidencodedallowederc725ydatakeys)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `InvalidEncodedAllowedERC725YDataKeys(bytes,string)`
- Error hash: `0xae6cbd37`

:::

```solidity
error InvalidEncodedAllowedERC725YDataKeys(bytes value, string context);
```

reverts when `value` is not encoded properly using the CompactBytesArray

#### Parameters

| Name      |   Type   | Description                                    |
| --------- | :------: | ---------------------------------------------- |
| `value`   | `bytes`  | the value to check for an CompactBytesArray    |
| `context` | `string` | a brief description of where the error occured |

### InvalidLSP6Target

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#invalidlsp6target)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `InvalidLSP6Target()`
- Error hash: `0xfc854579`

:::

```solidity
error InvalidLSP6Target();
```

reverts when the address provided as a target (= account) linked to this KeyManager is invalid e.g. address(0)

### InvalidPayload

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#invalidpayload)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `InvalidPayload(bytes)`
- Error hash: `0x3621bbcc`

:::

```solidity
error InvalidPayload(bytes payload);
```

reverts when the payload is invalid.

#### Parameters

| Name      |  Type   | Description |
| --------- | :-----: | ----------- |
| `payload` | `bytes` | -           |

### InvalidRelayNonce

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#invalidrelaynonce)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `InvalidRelayNonce(address,uint256,bytes)`
- Error hash: `0xc9bd9eb9`

:::

```solidity
error InvalidRelayNonce(address signer, uint256 invalidNonce, bytes signature);
```

reverts when the `signer` address retrieved from the `signature` has an invalid nonce: `invalidNonce`.

#### Parameters

| Name           |   Type    | Description                                         |
| -------------- | :-------: | --------------------------------------------------- |
| `signer`       | `address` | the address of the signer                           |
| `invalidNonce` | `uint256` | the nonce retrieved for the `signer` address        |
| `signature`    |  `bytes`  | the signature used to retrieve the `signer` address |

### InvalidWhitelistedCall

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#invalidwhitelistedcall)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `InvalidWhitelistedCall(address)`
- Error hash: `0x6fd203c5`

:::

```solidity
error InvalidWhitelistedCall(address from);
```

a `from` address is not allowed to have 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff in its list of AddressPermissions:AllowedCalls:<address>, as this allows any STANDARD:ADDRESS:FUNCTION. This is equivalent to granting the SUPER permission and should never be valid.

#### Parameters

| Name   |   Type    | Description                                         |
| ------ | :-------: | --------------------------------------------------- |
| `from` | `address` | the address that has any allowed calls whitelisted. |

### LSP6BatchExcessiveValueSent

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#lsp6batchexcessivevaluesent)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `LSP6BatchExcessiveValueSent(uint256,uint256)`
- Error hash: `0xa51868b6`

:::

```solidity
error LSP6BatchExcessiveValueSent(uint256 totalValues, uint256 msgValue);
```

reverts to avoid the KeyManager to holds some remaining funds sent to the following batch functions:

- execute(uint256[],bytes[])

- executeRelayCall(bytes[],uint256[],uint256[],bytes[]) This error occurs when `msg.value` is more than the sum of all the values being forwarded on each payloads (`values[]` parameter from the batch functions above).

#### Parameters

| Name          |   Type    | Description |
| ------------- | :-------: | ----------- |
| `totalValues` | `uint256` | -           |
| `msgValue`    | `uint256` | -           |

### LSP6BatchInsufficientValueSent

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#lsp6batchinsufficientvaluesent)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `LSP6BatchInsufficientValueSent(uint256,uint256)`
- Error hash: `0x30a324ac`

:::

```solidity
error LSP6BatchInsufficientValueSent(uint256 totalValues, uint256 msgValue);
```

the `msg.value` sent is not enough to cover the sum of all the values being forwarded on each payloads (`values[]` parameter) in the following batch functions:

- execute(uint256[],bytes[])

- executeRelayCall(bytes[],uint256[],uint256[],bytes[])

#### Parameters

| Name          |   Type    | Description |
| ------------- | :-------: | ----------- |
| `totalValues` | `uint256` | -           |
| `msgValue`    | `uint256` | -           |

### NoCallsAllowed

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#nocallsallowed)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `NoCallsAllowed(address)`
- Error hash: `0x6cb60587`

:::

```solidity
error NoCallsAllowed(address from);
```

reverts if there are no allowed calls set for `from`

#### Parameters

| Name   |   Type    | Description                          |
| ------ | :-------: | ------------------------------------ |
| `from` | `address` | the address that has no AllowedCalls |

### NoERC725YDataKeysAllowed

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#noerc725ydatakeysallowed)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `NoERC725YDataKeysAllowed(address)`
- Error hash: `0xed7fa509`

:::

```solidity
error NoERC725YDataKeysAllowed(address from);
```

reverts if there are no AllowedERC725YDataKeys set for the caller

#### Parameters

| Name   |   Type    | Description                                    |
| ------ | :-------: | ---------------------------------------------- |
| `from` | `address` | the address that has no AllowedERC725YDataKeys |

### NoPermissionsSet

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#nopermissionsset)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `NoPermissionsSet(address)`
- Error hash: `0xf292052a`

:::

```solidity
error NoPermissionsSet(address from);
```

reverts when address `from` does not have any permissions set on the account linked to this Key Manager

#### Parameters

| Name   |   Type    | Description                                |
| ------ | :-------: | ------------------------------------------ |
| `from` | `address` | the address that does not have permissions |

### NotAllowedCall

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#notallowedcall)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `NotAllowedCall(address,address,bytes4)`
- Error hash: `0x45147bce`

:::

```solidity
error NotAllowedCall(address from, address to, bytes4 selector);
```

reverts when `from` is not authorised to make the call because of a not allowed standard, address or function.

#### Parameters

| Name       |   Type    | Description                                                                                                                                                              |
| ---------- | :-------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `from`     | `address` | address making the request                                                                                                                                               |
| `to`       | `address` | the address of an EOA or contract that `from` is trying to interact with                                                                                                 |
| `selector` | `bytes4`  | if `to` is a contract, the bytes4 selector of the function that `from` is trying to call. If no function is called (e.g: a native token transfer), selector = 0x00000000 |

### NotAllowedERC725YDataKey

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#notallowederc725ydatakey)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `NotAllowedERC725YDataKey(address,bytes32)`
- Error hash: `0x557ae079`

:::

```solidity
error NotAllowedERC725YDataKey(address from, bytes32 disallowedKey);
```

reverts when address `from` is not authorised to set the key `disallowedKey` on the linked account

#### Parameters

| Name            |   Type    | Description                                                               |
| --------------- | :-------: | ------------------------------------------------------------------------- |
| `from`          | `address` | address making the request                                                |
| `disallowedKey` | `bytes32` | a bytes32 key that `from` is not authorised to set on the ERC725Y storage |

### NotAuthorised

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#notauthorised)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `NotAuthorised(address,string)`
- Error hash: `0x3bdad6e6`

:::

```solidity
error NotAuthorised(address from, string permission);
```

reverts when address `from` is not authorised to perform `permission` on the linked account

#### Parameters

| Name         |   Type    | Description            |
| ------------ | :-------: | ---------------------- |
| `from`       | `address` | address not-authorised |
| `permission` | `string`  | permission required    |

### NotRecognisedPermissionKey

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#notrecognisedpermissionkey)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `NotRecognisedPermissionKey(bytes32)`
- Error hash: `0x0f7d735b`

:::

```solidity
error NotRecognisedPermissionKey(bytes32 dataKey);
```

reverts when `dataKey` is a bytes32 that does not adhere to any of the permission data keys specified by the LSP6 standard

#### Parameters

| Name      |   Type    | Description                                                                        |
| --------- | :-------: | ---------------------------------------------------------------------------------- |
| `dataKey` | `bytes32` | the dataKey that does not match with any of the standard LSP6 permission data keys |

### RelayCallBeforeStartTime

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#relaycallbeforestarttime)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `RelayCallBeforeStartTime()`
- Error hash: `0x00de4b8a`

:::

```solidity
error RelayCallBeforeStartTime();
```

reverts when relay call start timestamp is bigger than the current timestamp

### RelayCallExpired

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#relaycallexpired)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `RelayCallExpired()`
- Error hash: `0x5c53a98c`

:::

```solidity
error RelayCallExpired();
```

reverts when the period to execute the relay call has expired
