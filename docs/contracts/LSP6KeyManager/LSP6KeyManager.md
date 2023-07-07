# LSP6KeyManager

:::info Solidity contract

[`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)

:::

> Implementation of a contract acting as a controller of an ERC725 Account, using permissions stored in the ERC725Y storage.

All the permissions can be set on the ERC725 Account using `setData(bytes32,bytes)` or `setData(bytes32[],bytes[])`.

## Methods

### constructor

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#constructor)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)

:::

```solidity
constructor(address target_);
```

_Deploying a LSP6KeyManager linked to contract at address `target_`._

Deploy a Key Manager and set the `target_` address in the contract storage, making this Key Manager linked to this `target_` contract.

#### Parameters

| Name      |   Type    | Description                                                              |
| --------- | :-------: | ------------------------------------------------------------------------ |
| `target_` | `address` | The address of the contract to control and forward calldata payloads to. |

### execute

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#execute)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Function signature: `execute(bytes)`
- Function selector: `0x09c5eabe`

:::

```solidity
function execute(bytes payload) external payable returns (bytes);
```

_execute the following payload on the linked contract: `payload`_

execute a `payload` on the linked [`target`](#target) after having verified the permissions associated with the function being run. The `payload` MUST be a valid abi-encoded function call of one of the functions present in the linked [`target`](#target), otherwise the call will fail. The linked [`target`](#target) will return some data on successful execution, or revert on failure.

<blockquote>

**Emitted events:**

- VerifiedCall event when the permissions related to `payload` have been verified successfully.

</blockquote>

#### Parameters

| Name      |  Type   | Description                                                      |
| --------- | :-----: | ---------------------------------------------------------------- |
| `payload` | `bytes` | the abi-encoded function call to execute on the linked {target}. |

#### Returns

| Name |  Type   | Description                                                                  |
| ---- | :-----: | ---------------------------------------------------------------------------- |
| `0`  | `bytes` | the abi-decoded data returned by the function called on the linked {target}. |

### executeBatch

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#executebatch)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Function signature: `executeBatch(uint256[],bytes[])`
- Function selector: `0xbf0176ff`

:::

```solidity
function executeBatch(
  uint256[] values,
  bytes[] payloads
) external payable returns (bytes[]);
```

Same as [`execute`](#execute) but execute a batch of payloads (abi-encoded function calls) in a single transaction.

<blockquote>

**Emitted events:**

- VerifiedCall event for each permissions related to each `payload` that have been verified successfully.

</blockquote>

#### Parameters

| Name       |    Type     | Description                                                                            |
| ---------- | :---------: | -------------------------------------------------------------------------------------- |
| `values`   | `uint256[]` | An array of amount of native tokens to be transferred for each `payload`.              |
| `payloads` |  `bytes[]`  | An array of abi-encoded function calls to execute successively on the linked {target}. |

#### Returns

| Name |   Type    | Description                                                                                     |
| ---- | :-------: | ----------------------------------------------------------------------------------------------- |
| `0`  | `bytes[]` | An array of abi-decoded of return data returned by the functions called on the linked {target}. |

### executeRelayCall

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#executerelaycall)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Function signature: `executeRelayCall(bytes,uint256,uint256,bytes)`
- Function selector: `0x4c8a4e74`

:::

:::tip Hint

If you are looking to learn how to sign and execute relay transactions via the Key Manager, see our Javascript step by step guide [_&quot;Execute Relay Transactions&quot;_](../../guides/key-manager/execute-relay-transactions.md). See the LSP6 Standard page for more details on how to [generate a valid signature for Execute Relay Call](../universal-profile/lsp6-key-manager.md#how-to-sign-relay-transactions).

:::

```solidity
function executeRelayCall(
  bytes signature,
  uint256 nonce,
  uint256 validityTimestamps,
  bytes payload
) external payable returns (bytes);
```

Allows any address (executor) to execute a payload (= abi-encoded function call) in the linked [`target`](#target) given they have a signed message from a controller with some permissions.

<blockquote>

**Emitted events:**

- [`VerifiedCall`](#verifiedcall) event when the permissions related to `payload` have been verified successfully.

</blockquote>

#### Parameters

| Name                 |   Type    | Description                                                                                                                                                                                   |
| -------------------- | :-------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signature`          |  `bytes`  | a 65 bytes long signature for a meta transaction according to LSP6.                                                                                                                           |
| `nonce`              | `uint256` | the nonce of the address that signed the calldata (in a specific `_channel`), obtained via {getNonce}. Used to prevent replay attack.                                                         |
| `validityTimestamps` | `uint256` | \* Two `uint128` timestamps concatenated together that describes when the relay transaction is valid &quot;from&quot; (left `uint128`) and &quot;until&quot; as a deadline (right `uint128`). |
| `payload`            |  `bytes`  | the abi-encoded function call to execute on the linked {target}.                                                                                                                              |

#### Returns

| Name |  Type   | Description                                                            |
| ---- | :-----: | ---------------------------------------------------------------------- |
| `0`  | `bytes` | the data being returned by the function called on the linked {target}. |

### executeRelayCallBatch

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#executerelaycallbatch)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
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

Same as [`executeRelayCall`](#executerelaycall) but execute a batch of signed calldata payloads (abi-encoded function calls) in a single transaction. The signed transactions can be from multiple controllers, not necessarely the same controller signer, as long as each of these controllers that signed have the right permissions related to the calldata `payload` they signed.

<blockquote>

**Requirements:**

- the length of `signatures`, `nonces`, `validityTimestamps`, `values` and `payloads` MUST be the same.
- the value sent to this function (`msg.value`) MUST be equal to the sum of all `values` in the batch. There should not be any excess value sent to this function.

</blockquote>

#### Parameters

| Name                 |    Type     | Description                                                                                                                                                                    |
| -------------------- | :---------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `signatures`         |  `bytes[]`  | An array of 65 bytes long signatures for meta transactions according to LSP6.                                                                                                  |
| `nonces`             | `uint256[]` | An array of nonces of the addresses that signed the calldata payloads (in specific channels). Obtained via {getNonce}. Used to prevent replay attack.                          |
| `validityTimestamps` | `uint256[]` | An array of two `uint128` concatenated timestamps that describe when the relay transaction is valid &quot;from&quot; (left `uint128`) and &quot;until&quot; (right `uint128`). |
| `values`             | `uint256[]` | An array of amount of native tokens to be transferred for each calldata `payload`.                                                                                             |
| `payloads`           |  `bytes[]`  | An array of abi-encoded function calls to execute successively on the linked {target}.                                                                                         |

#### Returns

| Name |   Type    | Description                                                                                  |
| ---- | :-------: | -------------------------------------------------------------------------------------------- |
| `0`  | `bytes[]` | An array of abi-decoded return data returned by the functions called on the linked {target}. |

### getNonce

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#getnonce)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Function signature: `getNonce(address,uint128)`
- Function selector: `0xb44581d9`

:::

:::info

A signer can choose its channel number arbitrarily. Channel ID = 0 can be used for sequential nonces (transactions that are order dependant), any other channel ID for out-of-order execution (= execution in parallel).

:::

```solidity
function getNonce(
  address from,
  uint128 channelId
) external view returns (uint256);
```

_Get latest nonce for `from` in channel ID: `channelId`._

Get the nonce for a specific controller `from` address that can be used for signing relay transaction.

#### Parameters

| Name        |   Type    | Description                                                                |
| ----------- | :-------: | -------------------------------------------------------------------------- |
| `from`      | `address` | the address of the signer of the transaction.                              |
| `channelId` | `uint128` | the channel id that the signer wants to use for executing the transaction. |

#### Returns

| Name |   Type    | Description                                 |
| ---- | :-------: | ------------------------------------------- |
| `0`  | `uint256` | the current nonce on a specific `channelId` |

### isValidSignature

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#isvalidsignature)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Function signature: `isValidSignature(bytes32,bytes)`
- Function selector: `0x1626ba7e`

:::

```solidity
function isValidSignature(
  bytes32 dataHash,
  bytes signature
) external view returns (bytes4 magicValue);
```

Checks if a signature was signed by a controller that has the permission `SIGN`. If the signer is a controller with the permission `SIGN`, it will return the ERC1271 magic value.

#### Parameters

| Name        |   Type    | Description                                 |
| ----------- | :-------: | ------------------------------------------- |
| `dataHash`  | `bytes32` | -                                           |
| `signature` |  `bytes`  | Signature byte array associated with \_data |

#### Returns

| Name         |   Type   | Description                                          |
| ------------ | :------: | ---------------------------------------------------- |
| `magicValue` | `bytes4` | `0x1626ba7e` on success, or `0xffffffff` on failure. |

### lsp20VerifyCall

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#lsp20verifycall)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
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
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
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
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
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
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Function signature: `target()`
- Function selector: `0xd4b83992`

:::

```solidity
function target() external view returns (address);
```

Get the address of the contract linked to this Key Manager.

#### Returns

| Name |   Type    | Description                       |
| ---- | :-------: | --------------------------------- |
| `0`  | `address` | the address of the linked account |

---

## Events

### VerifiedCall

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#verifiedcall)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Event signature: `VerifiedCall(address,uint256,bytes4)`
- Event hash: `0xa54458b75709e42f79700ffb6cfc57c7e224d8a77a52c457ee7ecb8e22636280`

:::

```solidity
event VerifiedCall(address indexed signer, uint256 indexed value, bytes4 indexed selector);
```

Emitted when the LSP6KeyManager contract verified the permissions of the `signer` successfully.

#### Parameters

| Name                     |   Type    | Description                                                                                                                                        |
| ------------------------ | :-------: | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signer` **`indexed`**   | `address` | the address of the controller that executed the calldata payload (either directly via {execute} or via meta transaction using {executeRelayCall}). |
| `value` **`indexed`**    | `uint256` | the amount of native token to be transferred in the calldata payload.                                                                              |
| `selector` **`indexed`** | `bytes4`  | the bytes4 function of the function that was executed on the linked {target}                                                                       |

---

## Errors

### AddressPermissionArrayIndexValueNotAnAddress

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#addresspermissionarrayindexvaluenotanaddress)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `AddressPermissionArrayIndexValueNotAnAddress(bytes32,bytes)`
- Error hash: `0x8f4afa38`

:::

```solidity
error AddressPermissionArrayIndexValueNotAnAddress(
  bytes32 dataKey,
  bytes invalidValue
);
```

Reverts when trying to set a value that is not 20 bytes long (not an `address`) under the `AddressPermissions[index]` data key.

#### Parameters

| Name           |   Type    | Description                                                                                           |
| -------------- | :-------: | ----------------------------------------------------------------------------------------------------- |
| `dataKey`      | `bytes32` | The `AddressPermissions[index]` data key, that specify the index in the `AddressPermissions[]` array. |
| `invalidValue` |  `bytes`  | The invalid value that was attempted to be set under `AddressPermissions[index]`.                     |

### BatchExecuteParamsLengthMismatch

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#batchexecuteparamslengthmismatch)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `BatchExecuteParamsLengthMismatch()`
- Error hash: `0x55a187db`

:::

```solidity
error BatchExecuteParamsLengthMismatch();
```

Reverts when the array parameters `uint256[] value` and `bytes[] payload` have different sizes. There should be the same number of elements for each array parameters.

### BatchExecuteRelayCallParamsLengthMismatch

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#batchexecuterelaycallparamslengthmismatch)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `BatchExecuteRelayCallParamsLengthMismatch()`
- Error hash: `0xb4d50d21`

:::

```solidity
error BatchExecuteRelayCallParamsLengthMismatch();
```

Reverts when providing array parameters of different sizes to `executeRelayCall(bytes[],uint256[],bytes[])`

### CallingKeyManagerNotAllowed

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#callingkeymanagernotallowed)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `CallingKeyManagerNotAllowed()`
- Error hash: `0xa431b236`

:::

```solidity
error CallingKeyManagerNotAllowed();
```

Reverts when calling the KeyManager through `execute(uint256,address,uint256,bytes)`.

### CannotSendValueToSetData

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#cannotsendvaluetosetdata)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `CannotSendValueToSetData()`
- Error hash: `0x59a529fc`

:::

```solidity
error CannotSendValueToSetData();
```

Reverts when trying to call to the `setData(byte32,bytes)` or `setData(bytes32[],bytes[]) functions on the linked [`target`](#target) while sending value.

### DelegateCallDisallowedViaKeyManager

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#delegatecalldisallowedviakeymanager)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `DelegateCallDisallowedViaKeyManager()`
- Error hash: `0x80d6ebae`

:::

```solidity
error DelegateCallDisallowedViaKeyManager();
```

Reverts when trying to do a `delegatecall` via the ERC725X.execute(uint256,address,uint256,bytes) (operation type 4) function of the linked [`target`](#target). `DELEGATECALL` is disallowed by default on the LSP6KeyManager.

### ERC725Y_DataKeysValuesLengthMismatch

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#erc725y_datakeysvalueslengthmismatch)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
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
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `InvalidERC725Function(bytes4)`
- Error hash: `0x2ba8851c`

:::

```solidity
error InvalidERC725Function(bytes4 invalidFunction);
```

Reverts when trying to call a function on the linked [`target`](#target), that is not any of the following:

- `setData(bytes32,bytes)` (ERC725Y)

- `setDataBatch(bytes32[],bytes[])` (ERC725Y)

- `execute(uint256,address,uint256,bytes)` (ERC725X)

- `transferOwnership(address)`

- `acceptOwnership()` (LSP14)

#### Parameters

| Name              |   Type   | Description                                                                                                               |
| ----------------- | :------: | ------------------------------------------------------------------------------------------------------------------------- |
| `invalidFunction` | `bytes4` | The `bytes4` selector of the function selector that was attempted to be called on the linked {target} but not recognised. |

### InvalidEncodedAllowedCalls

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#invalidencodedallowedcalls)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `InvalidEncodedAllowedCalls(bytes)`
- Error hash: `0x187e77ab`

:::

```solidity
error InvalidEncodedAllowedCalls(bytes allowedCallsValue);
```

Reverts when `allowedCallsValue` is not properly encoded as a `(bytes4,address,bytes4,bytes4)[CompactBytesArray]` (CompactBytesArray made of tuples that are 32 bytes long each). See LSP2 value type `CompactBytesArray` for more infos.

#### Parameters

| Name                |  Type   | Description                                                                                                       |
| ------------------- | :-----: | ----------------------------------------------------------------------------------------------------------------- |
| `allowedCallsValue` | `bytes` | The list of allowedCalls that are not encoded correctly as a `(bytes4,address,bytes4,bytes4)[CompactBytesArray]`. |

### InvalidEncodedAllowedERC725YDataKeys

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#invalidencodedallowederc725ydatakeys)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `InvalidEncodedAllowedERC725YDataKeys(bytes,string)`
- Error hash: `0xae6cbd37`

:::

```solidity
error InvalidEncodedAllowedERC725YDataKeys(bytes value, string context);
```

Reverts when `value` is not encoded properly as a `bytes32[CompactBytesArray]`. The `context` string provides context on when this error occured (\_e.g: when fetching the `AllowedERC725YDataKeys` to verify the permissions of a controller, or when validating the `AllowedERC725YDataKeys` when setting them for a controller).

#### Parameters

| Name      |   Type   | Description                                                |
| --------- | :------: | ---------------------------------------------------------- |
| `value`   | `bytes`  | The value that is not a valid `bytes32[CompactBytesArray]` |
| `context` | `string` | A brief description of where the error occured.            |

### InvalidLSP6Target

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#invalidlsp6target)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `InvalidLSP6Target()`
- Error hash: `0xfc854579`

:::

```solidity
error InvalidLSP6Target();
```

Reverts when the address provided to set as the [`target`](#target) linked to this KeyManager is invalid (_e.g. `address(0)`_).

### InvalidPayload

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#invalidpayload)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `InvalidPayload(bytes)`
- Error hash: `0x3621bbcc`

:::

```solidity
error InvalidPayload(bytes payload);
```

Reverst when the payload is invalid.

#### Parameters

| Name      |  Type   | Description |
| --------- | :-----: | ----------- |
| `payload` | `bytes` | -           |

### InvalidRelayNonce

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#invalidrelaynonce)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `InvalidRelayNonce(address,uint256,bytes)`
- Error hash: `0xc9bd9eb9`

:::

```solidity
error InvalidRelayNonce(address signer, uint256 invalidNonce, bytes signature);
```

Reverts when the `signer` address retrieved from the `signature` has an invalid nonce: `invalidNonce`.

#### Parameters

| Name           |   Type    | Description                                         |
| -------------- | :-------: | --------------------------------------------------- |
| `signer`       | `address` | The address of the signer                           |
| `invalidNonce` | `uint256` | The nonce retrieved for the `signer` address        |
| `signature`    |  `bytes`  | The signature used to retrieve the `signer` address |

### InvalidWhitelistedCall

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#invalidwhitelistedcall)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `InvalidWhitelistedCall(address)`
- Error hash: `0x6fd203c5`

:::

```solidity
error InvalidWhitelistedCall(address from);
```

Reverts when verifying the permissions of a `from` address for its allowed calls, and has a "any whitelisted call" allowed call set. A `from` address is not allowed to have 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff in its list of `AddressPermissions:AllowedCalls:<address>`, as this allows any STANDARD:ADDRESS:FUNCTION. This is equivalent to granting the SUPER permission and should never be valid.

#### Parameters

| Name   |   Type    | Description                                                        |
| ------ | :-------: | ------------------------------------------------------------------ |
| `from` | `address` | The controller address that has any allowed calls whitelisted set. |

### LSP6BatchExcessiveValueSent

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#lsp6batchexcessivevaluesent)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `LSP6BatchExcessiveValueSent(uint256,uint256)`
- Error hash: `0xa51868b6`

:::

```solidity
error LSP6BatchExcessiveValueSent(uint256 totalValues, uint256 msgValue);
```

This error occurs when there was too much funds sent to the batch functions `execute(uint256[],bytes[])` or `executeRelayCall(bytes[],uint256[],uint256[],bytes[])` to cover the sum of all the values forwarded on Reverts to avoid the KeyManager to holds some remaining funds sent to the following batch functions:

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
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `LSP6BatchInsufficientValueSent(uint256,uint256)`
- Error hash: `0x30a324ac`

:::

```solidity
error LSP6BatchInsufficientValueSent(uint256 totalValues, uint256 msgValue);
```

This error occurs when there was not enough funds sent to the batch functions `execute(uint256[],bytes[])` or `executeRelayCall(bytes[],uint256[],uint256[],bytes[])` to cover the sum of all the values forwarded on each payloads (`values[]` parameter from the batch functions above). This mean that `msg.value` is less than the sum of all the values being forwarded on each payloads (`values[]` parameters).

#### Parameters

| Name          |   Type    | Description                                                                                                                                      |
| ------------- | :-------: | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `totalValues` | `uint256` | The sum of all the values forwarded on each payloads (`values[]` parameter from the batch functions above).                                      |
| `msgValue`    | `uint256` | The amount of native tokens sent to the batch functions `execute(uint256[],bytes[])` or `executeRelayCall(bytes[],uint256[],uint256[],bytes[])`. |

### NoCallsAllowed

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#nocallsallowed)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `NoCallsAllowed(address)`
- Error hash: `0x6cb60587`

:::

```solidity
error NoCallsAllowed(address from);
```

Reverts when the `from` address has no `AllowedCalls` set and cannot interact with any address using the linked [`target`](#target).

#### Parameters

| Name   |   Type    | Description                           |
| ------ | :-------: | ------------------------------------- |
| `from` | `address` | The address that has no AllowedCalls. |

### NoERC725YDataKeysAllowed

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#noerc725ydatakeysallowed)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `NoERC725YDataKeysAllowed(address)`
- Error hash: `0xed7fa509`

:::

```solidity
error NoERC725YDataKeysAllowed(address from);
```

Reverts when the `from` address has no AllowedERC725YDataKeys set and cannot set any ERC725Y data key on the ERC725Y storage of the linked [`target`](#target).

#### Parameters

| Name   |   Type    | Description                                           |
| ------ | :-------: | ----------------------------------------------------- |
| `from` | `address` | The address that has no `AllowedERC725YDataKeys` set. |

### NoPermissionsSet

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#nopermissionsset)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `NoPermissionsSet(address)`
- Error hash: `0xf292052a`

:::

```solidity
error NoPermissionsSet(address from);
```

Reverts when address `from` does not have any permissions set on the account linked to this Key Manager

#### Parameters

| Name   |   Type    | Description                                |
| ------ | :-------: | ------------------------------------------ |
| `from` | `address` | the address that does not have permissions |

### NotAllowedCall

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#notallowedcall)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `NotAllowedCall(address,address,bytes4)`
- Error hash: `0x45147bce`

:::

```solidity
error NotAllowedCall(address from, address to, bytes4 selector);
```

Reverts when `from` is not authorised to call the `execute(uint256,address,uint256,bytes)` function because of a not allowed callType, address, standard or function.

#### Parameters

| Name       |   Type    | Description                                                                                                                                                              |
| ---------- | :-------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `from`     | `address` | address The controller that tried to call the `execute(uint256,address,uint256,bytes)` function.                                                                         |
| `to`       | `address` | The address of an EOA or contract that `from` tried to call using the linked {target}                                                                                    |
| `selector` | `bytes4`  | If `to` is a contract, the bytes4 selector of the function that `from` is trying to call. If no function is called (e.g: a native token transfer), selector = 0x00000000 |

### NotAllowedERC725YDataKey

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#notallowederc725ydatakey)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `NotAllowedERC725YDataKey(address,bytes32)`
- Error hash: `0x557ae079`

:::

```solidity
error NotAllowedERC725YDataKey(address from, bytes32 disallowedKey);
```

Reverts when address `from` is not authorised to set the key `disallowedKey` on the linked [`target`](#target).

#### Parameters

| Name            |   Type    | Description                                                                                            |
| --------------- | :-------: | ------------------------------------------------------------------------------------------------------ |
| `from`          | `address` | address The controller that tried to `setData` on the linked {target}.                                 |
| `disallowedKey` | `bytes32` | A bytes32 data key that `from` is not authorised to set on the ERC725Y storage of the linked {target}. |

### NotAuthorised

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#notauthorised)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `NotAuthorised(address,string)`
- Error hash: `0x3bdad6e6`

:::

```solidity
error NotAuthorised(address from, string permission);
```

Reverts when address `from` is not authorised and does not have `permission` on the linked [`target`](#target)

#### Parameters

| Name         |   Type    | Description                                                                    |
| ------------ | :-------: | ------------------------------------------------------------------------------ |
| `from`       | `address` | address The address that was not authorised.                                   |
| `permission` | `string`  | permission The permission required (\_e.g: `SETDATA`, `CALL`, `TRANSFERVALUE`) |

### NotRecognisedPermissionKey

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#notrecognisedpermissionkey)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `NotRecognisedPermissionKey(bytes32)`
- Error hash: `0x0f7d735b`

:::

```solidity
error NotRecognisedPermissionKey(bytes32 dataKey);
```

Reverts when `dataKey` is a bytes32 value that does not adhere to any of the permission data keys defined by the LSP6 standard

#### Parameters

| Name      |   Type    | Description                                                                    |
| --------- | :-------: | ------------------------------------------------------------------------------ |
| `dataKey` | `bytes32` | The dataKey that does not match any of the standard LSP6 permission data keys. |

### RelayCallBeforeStartTime

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#relaycallbeforestarttime)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `RelayCallBeforeStartTime()`
- Error hash: `0x00de4b8a`

:::

```solidity
error RelayCallBeforeStartTime();
```

Reverts when the start timestamp provided to [`executeRelayCall`](#executerelaycall) function is bigger than the current timestamp.

### RelayCallExpired

:::note Links

- Specification details in [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#relaycallexpired)
- Solidity implementation in [**LSP6KeyManager**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `RelayCallExpired()`
- Error hash: `0x5c53a98c`

:::

```solidity
error RelayCallExpired();
```

Reverts when the period to execute the relay call has expired.
