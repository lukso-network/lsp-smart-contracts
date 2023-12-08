<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP6KeyManager

:::info Standard Specifications

[`LSP-6-KeyManager`](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md)

:::
:::info Solidity implementation

[`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)

:::

> Implementation of a contract acting as a controller of an ERC725 Account, using permissions stored in the ERC725Y storage.

All the permissions can be set on the ERC725 Account using `setData(bytes32,bytes)` or `setData(bytes32[],bytes[])`.

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### constructor

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#constructor)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)

:::

```solidity
constructor(address target_);
```

_Deploying a LSP6KeyManager linked to the contract at address `target_`.\_

Deploy a Key Manager and set the `target_` address in the contract storage, making this Key Manager linked to this `target_` contract.

#### Parameters

| Name      |   Type    | Description                                                              |
| --------- | :-------: | ------------------------------------------------------------------------ |
| `target_` | `address` | The address of the contract to control and forward calldata payloads to. |

<br/>

### VERSION

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#version)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Function signature: `VERSION()`
- Function selector: `0xffa1ad74`

:::

```solidity
function VERSION() external view returns (string);
```

_Contract version._

#### Returns

| Name |   Type   | Description |
| ---- | :------: | ----------- |
| `0`  | `string` | -           |

<br/>

### execute

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#execute)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Function signature: `execute(bytes)`
- Function selector: `0x09c5eabe`

:::

```solidity
function execute(bytes payload) external payable returns (bytes);
```

_Executing the following payload on the linked contract: `payload`_

Execute A `payload` on the linked [`target`](#target) contract after having verified the permissions associated with the function being run. The `payload` MUST be a valid abi-encoded function call of one of the functions present in the linked [`target`](#target), otherwise the call will fail. The linked [`target`](#target) will return some data on successful execution, or revert on failure.

<blockquote>

**Emitted events:**

- [`PermissionsVerified`](#permissionsverified) event when the permissions related to `payload` have been verified successfully.

</blockquote>

#### Parameters

| Name      |  Type   | Description                                                                 |
| --------- | :-----: | --------------------------------------------------------------------------- |
| `payload` | `bytes` | The abi-encoded function call to execute on the linked [`target`](#target). |

#### Returns

| Name |  Type   | Description                                                                             |
| ---- | :-----: | --------------------------------------------------------------------------------------- |
| `0`  | `bytes` | The abi-decoded data returned by the function called on the linked [`target`](#target). |

<br/>

### executeBatch

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#executebatch)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Function signature: `executeBatch(uint256[],bytes[])`
- Function selector: `0xbf0176ff`

:::

```solidity
function executeBatch(
  uint256[] values,
  bytes[] payloads
) external payable returns (bytes[]);
```

\*Executing the following batch of payloads and sensind on the linked contract.

- payloads: `payloads`

- values transferred for each payload: `values`\*

Same as [`execute`](#execute) but execute a batch of payloads (abi-encoded function calls) in a single transaction.

<blockquote>

**Emitted events:**

- [`PermissionsVerified`](#permissionsverified) event for each permissions related to each `payload` that have been verified successfully.

</blockquote>

#### Parameters

| Name       |    Type     | Description                                                                                       |
| ---------- | :---------: | ------------------------------------------------------------------------------------------------- |
| `values`   | `uint256[]` | An array of amount of native tokens to be transferred for each `payload`.                         |
| `payloads` |  `bytes[]`  | An array of abi-encoded function calls to execute successively on the linked [`target`](#target). |

#### Returns

| Name |   Type    | Description                                                                                      |
| ---- | :-------: | ------------------------------------------------------------------------------------------------ |
| `0`  | `bytes[]` | An array of abi-decoded data returned by the functions called on the linked [`target`](#target). |

<br/>

### executeRelayCall

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#executerelaycall)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Function signature: `executeRelayCall(bytes,uint256,uint256,bytes)`
- Function selector: `0x4c8a4e74`

:::

:::tip Hint

If you are looking to learn how to sign and execute relay transactions via the Key Manager, see our Javascript step by step guide [_"Execute Relay Transactions"_](../../../learn/expert-guides/key-manager/execute-relay-transactions.md). See the LSP6 Standard page for more details on how to [generate a valid signature for Execute Relay Call](../../../standards/universal-profile/lsp6-key-manager.md#how-to-sign-relay-transactions).

:::

```solidity
function executeRelayCall(
  bytes signature,
  uint256 nonce,
  uint256 validityTimestamps,
  bytes payload
) external payable returns (bytes);
```

_Executing the following payload given the nonce `nonce` and signature `signature`. Payload: `payload`_

Allows any address (executor) to execute a payload (= abi-encoded function call), given they have a valid signature from a signer address and a valid `nonce` for this signer. The signature MUST be generated according to the signature format defined by the LSP25 standard. The signer that generated the `signature` MUST be a controller with some permissions on the linked [`target`](#target). The `payload` will be executed on the [`target`](#target) contract once the LSP25 signature and the permissions of the signer have been verified.

<blockquote>

**Emitted events:**

- [`PermissionsVerified`](#permissionsverified) event when the permissions related to `payload` have been verified successfully.

</blockquote>

#### Parameters

| Name                 |   Type    | Description                                                                                                                                                            |
| -------------------- | :-------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signature`          |  `bytes`  | A 65 bytes long signature for a meta transaction according to LSP25.                                                                                                   |
| `nonce`              | `uint256` | The nonce of the address that signed the calldata (in a specific `_channel`), obtained via [`getNonce`](#getnonce). Used to prevent replay attack.                     |
| `validityTimestamps` | `uint256` | Two `uint128` timestamps concatenated together that describes when the relay transaction is valid "from" (left `uint128`) and "until" as a deadline (right `uint128`). |
| `payload`            |  `bytes`  | The abi-encoded function call to execute.                                                                                                                              |

#### Returns

| Name |  Type   | Description                                       |
| ---- | :-----: | ------------------------------------------------- |
| `0`  | `bytes` | The data being returned by the function executed. |

<br/>

### executeRelayCallBatch

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#executerelaycallbatch)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
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

_Executing a batch of relay calls (= meta-transactions)._

Same as [`executeRelayCall`](#executerelaycall) but execute a batch of signed calldata payloads (abi-encoded function calls) in a single transaction. The `signatures` can be from multiple controllers, not necessarely the same controller, as long as each of these controllers that signed have the right permissions related to the calldata `payload` they signed.

<blockquote>

**Requirements:**

- the length of `signatures`, `nonces`, `validityTimestamps`, `values` and `payloads` MUST be the same.
- the value sent to this function (`msg.value`) MUST be equal to the sum of all `values` in the batch. There should not be any excess value sent to this function.

</blockquote>

#### Parameters

| Name                 |    Type     | Description                                                                                                                                                        |
| -------------------- | :---------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `signatures`         |  `bytes[]`  | An array of 65 bytes long signatures for meta transactions according to LSP25.                                                                                     |
| `nonces`             | `uint256[]` | An array of nonces of the addresses that signed the calldata payloads (in specific channels). Obtained via [`getNonce`](#getnonce). Used to prevent replay attack. |
| `validityTimestamps` | `uint256[]` | An array of two `uint128` concatenated timestamps that describe when the relay transaction is valid "from" (left `uint128`) and "until" (right `uint128`).         |
| `values`             | `uint256[]` | An array of amount of native tokens to be transferred for each calldata `payload`.                                                                                 |
| `payloads`           |  `bytes[]`  | An array of abi-encoded function calls to be executed successively.                                                                                                |

#### Returns

| Name |   Type    | Description                                                      |
| ---- | :-------: | ---------------------------------------------------------------- |
| `0`  | `bytes[]` | An array of abi-decoded data returned by the functions executed. |

<br/>

### getNonce

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#getnonce)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Function signature: `getNonce(address,uint128)`
- Function selector: `0xb44581d9`

:::

:::tip Hint

A signer can choose its channel number arbitrarily. The recommended practice is to:

- use `channelId == 0` for transactions for which the ordering of execution matters.abi _Example: you have two transactions A and B, and transaction A must be executed first and complete successfully before transaction B should be executed)._
- use any other `channelId` number for transactions that you want to be order independant (out-of-order execution, execution _"in parallel"_). \_Example: you have two transactions A and B. You want transaction B to be executed a) without having to wait for transaction A to complete, or b) regardless if transaction A completed successfully or not.

:::

```solidity
function getNonce(
  address from,
  uint128 channelId
) external view returns (uint256);
```

_Reading the latest nonce of address `from` in the channel ID `channelId`._

Get the nonce for a specific `from` address that can be used for signing relay transactions via [`executeRelayCall`](#executerelaycall).

#### Parameters

| Name        |   Type    | Description                                                                |
| ----------- | :-------: | -------------------------------------------------------------------------- |
| `from`      | `address` | The address of the signer of the transaction.                              |
| `channelId` | `uint128` | The channel id that the signer wants to use for executing the transaction. |

#### Returns

| Name |   Type    | Description                                  |
| ---- | :-------: | -------------------------------------------- |
| `0`  | `uint256` | The current nonce on a specific `channelId`. |

<br/>

### isValidSignature

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#isvalidsignature)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Function signature: `isValidSignature(bytes32,bytes)`
- Function selector: `0x1626ba7e`

:::

:::caution Warning

This function does not enforce by default the inclusion of the address of this contract in the signature digest. It is recommended that protocols or applications using this contract include the targeted address (= this contract) in the data to sign. To ensure that a signature is valid for a specific LSP6KeyManager and prevent signatures from the same EOA to be replayed across different LSP6KeyManager.

:::

```solidity
function isValidSignature(
  bytes32 dataHash,
  bytes signature
) external view returns (bytes4 returnedStatus);
```

Checks if a signature was signed by a controller that has the permission `SIGN`. If the signer is a controller with the permission `SIGN`, it will return the ERC1271 success value.

#### Parameters

| Name        |   Type    | Description                                 |
| ----------- | :-------: | ------------------------------------------- |
| `dataHash`  | `bytes32` | -                                           |
| `signature` |  `bytes`  | Signature byte array associated with \_data |

#### Returns

| Name             |   Type   | Description                                          |
| ---------------- | :------: | ---------------------------------------------------- |
| `returnedStatus` | `bytes4` | `0x1626ba7e` on success, or `0xffffffff` on failure. |

<br/>

### lsp20VerifyCall

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#lsp20verifycall)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Function signature: `lsp20VerifyCall(address,address,address,uint256,bytes)`
- Function selector: `0xde928f14`

:::

:::tip Hint

This function can call by any other address than the [`target`](#`target`). This allows to verify permissions in a _"read-only"_ manner. Anyone can call this function to verify if the `caller` has the right permissions to perform the abi-encoded function call `data` on the [`target`](#`target`) contract (while sending `msgValue` alongside the call). If the permissions have been verified successfully and `caller` is authorized, one of the following two LSP20 success value will be returned:

- `0x1a238000`: LSP20 success value **without** post verification (last byte is `0x00`).
- `0x1a238001`: LSP20 success value **with** post-verification (last byte is `0x01`).

:::

```solidity
function lsp20VerifyCall(
  address,
  address targetContract,
  address caller,
  uint256 msgValue,
  bytes callData
) external nonpayable returns (bytes4);
```

#### Parameters

| Name             |   Type    | Description                                                   |
| ---------------- | :-------: | ------------------------------------------------------------- |
| `_0`             | `address` | -                                                             |
| `targetContract` | `address` | -                                                             |
| `caller`         | `address` | The address who called the function on the `target` contract. |
| `msgValue`       | `uint256` | -                                                             |
| `callData`       |  `bytes`  | The calldata sent by the caller to the msg.sender             |

#### Returns

| Name |   Type   | Description                                                                                                                                                                                                                                                                                                                                     |
| ---- | :------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0`  | `bytes4` | MUST return the first 3 bytes of `lsp20VerifyCall(address,uint256,bytes)` function selector if the call to the function is allowed, concatened with a byte that determines if the lsp20VerifyCallResult function should be called after the original function call. The byte that invoke the lsp20VerifyCallResult function is strictly `0x01`. |

<br/>

### lsp20VerifyCallResult

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#lsp20verifycallresult)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Function signature: `lsp20VerifyCallResult(bytes32,bytes)`
- Function selector: `0xd3fc45d3`

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

<br/>

### supportsInterface

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#supportsinterface)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
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

<br/>

### target

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#target)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Function signature: `target()`
- Function selector: `0xd4b83992`

:::

```solidity
function target() external view returns (address);
```

Get The address of the contract linked to this Key Manager.

#### Returns

| Name |   Type    | Description                        |
| ---- | :-------: | ---------------------------------- |
| `0`  | `address` | The address of the linked contract |

<br/>

## Internal Methods

Any method labeled as `internal` serves as utility function within the contract. They can be used when writing solidity contracts that inherit from this contract. These methods can be extended or modified by overriding their internal behavior to suit specific needs.

Internal functions cannot be called externally, whether from other smart contracts, dApp interfaces, or backend services. Their restricted accessibility ensures that they remain exclusively available within the context of the current contract, promoting controlled and encapsulated usage of these internal utilities.

### \_verifyCanSetData

```solidity
function _verifyCanSetData(
  address controlledContract,
  address controllerAddress,
  bytes32 controllerPermissions,
  bytes32 inputDataKey,
  bytes inputDataValue
) internal view;
```

verify if the `controllerAddress` has the permissions required to set a data key on the ERC725Y storage of the `controlledContract`.

#### Parameters

| Name                    |   Type    | Description                                                    |
| ----------------------- | :-------: | -------------------------------------------------------------- |
| `controlledContract`    | `address` | the address of the ERC725Y contract where the data key is set. |
| `controllerAddress`     | `address` | the address of the controller who wants to set the data key.   |
| `controllerPermissions` | `bytes32` | the permissions of the controller address.                     |
| `inputDataKey`          | `bytes32` | the data key to set on the `controlledContract`.               |
| `inputDataValue`        |  `bytes`  | the data value to set for the `inputDataKey`.                  |

<br/>

### \_verifyCanSetData

```solidity
function _verifyCanSetData(
  address controlledContract,
  address controller,
  bytes32 permissions,
  bytes32[] inputDataKeys,
  bytes[] inputDataValues
) internal view;
```

verify if the `controllerAddress` has the permissions required to set an array of data keys on the ERC725Y storage of the `controlledContract`.

#### Parameters

| Name                 |    Type     | Description                                                    |
| -------------------- | :---------: | -------------------------------------------------------------- |
| `controlledContract` |  `address`  | the address of the ERC725Y contract where the data key is set. |
| `controller`         |  `address`  | the address of the controller who wants to set the data key.   |
| `permissions`        |  `bytes32`  | the permissions of the controller address.                     |
| `inputDataKeys`      | `bytes32[]` | an array of data keys to set on the `controlledContract`.      |
| `inputDataValues`    |  `bytes[]`  | an array of data values to set for the `inputDataKeys`.        |

<br/>

### \_getPermissionRequiredToSetDataKey

```solidity
function _getPermissionRequiredToSetDataKey(
  address controlledContract,
  bytes32 controllerPermissions,
  bytes32 inputDataKey,
  bytes inputDataValue
) internal view returns (bytes32);
```

retrieve the permission required based on the data key to be set on the `controlledContract`.

#### Parameters

| Name                    |   Type    | Description                                                                                                             |
| ----------------------- | :-------: | ----------------------------------------------------------------------------------------------------------------------- |
| `controlledContract`    | `address` | the address of the ERC725Y contract where the data key is verified.                                                     |
| `controllerPermissions` | `bytes32` | -                                                                                                                       |
| `inputDataKey`          | `bytes32` | the data key to set on the `controlledContract`. Can be related to LSP6 Permissions, LSP1 Delegate or LSP17 Extensions. |
| `inputDataValue`        |  `bytes`  | the data value to set for the `inputDataKey`.                                                                           |

#### Returns

| Name |   Type    | Description                                                                    |
| ---- | :-------: | ------------------------------------------------------------------------------ |
| `0`  | `bytes32` | the permission required to set the `inputDataKey` on the `controlledContract`. |

<br/>

### \_getPermissionToSetPermissionsArray

```solidity
function _getPermissionToSetPermissionsArray(
  address controlledContract,
  bytes32 inputDataKey,
  bytes inputDataValue,
  bool hasBothAddControllerAndEditPermissions
) internal view returns (bytes32);
```

retrieve the permission required to update the `AddressPermissions[]` array data key defined in LSP6.

#### Parameters

| Name                                     |   Type    | Description                                                                               |
| ---------------------------------------- | :-------: | ----------------------------------------------------------------------------------------- |
| `controlledContract`                     | `address` | the address of the ERC725Y contract where the data key is verified.                       |
| `inputDataKey`                           | `bytes32` | either `AddressPermissions[]` (array length) or `AddressPermissions[index]` (array index) |
| `inputDataValue`                         |  `bytes`  | the updated value for the `inputDataKey`. MUST be:                                        |
| `hasBothAddControllerAndEditPermissions` |  `bool`   | -                                                                                         |

#### Returns

| Name |   Type    | Description                       |
| ---- | :-------: | --------------------------------- |
| `0`  | `bytes32` | either ADD or CHANGE PERMISSIONS. |

<br/>

### \_getPermissionToSetControllerPermissions

```solidity
function _getPermissionToSetControllerPermissions(
  address controlledContract,
  bytes32 inputPermissionDataKey
) internal view returns (bytes32);
```

retrieve the permission required to set permissions for a controller address.

#### Parameters

| Name                     |   Type    | Description                                                         |
| ------------------------ | :-------: | ------------------------------------------------------------------- |
| `controlledContract`     | `address` | the address of the ERC725Y contract where the data key is verified. |
| `inputPermissionDataKey` | `bytes32` | `AddressPermissions:Permissions:<controller-address>`.              |

#### Returns

| Name |   Type    | Description                       |
| ---- | :-------: | --------------------------------- |
| `0`  | `bytes32` | either ADD or CHANGE PERMISSIONS. |

<br/>

### \_getPermissionToSetAllowedCalls

```solidity
function _getPermissionToSetAllowedCalls(
  address controlledContract,
  bytes32 dataKey,
  bytes dataValue,
  bool hasBothAddControllerAndEditPermissions
) internal view returns (bytes32);
```

Retrieve the permission required to set some AllowedCalls for a controller.

#### Parameters

| Name                                     |   Type    | Description                                                                                 |
| ---------------------------------------- | :-------: | ------------------------------------------------------------------------------------------- |
| `controlledContract`                     | `address` | The address of the ERC725Y contract from which to fetch the value of `dataKey`.             |
| `dataKey`                                | `bytes32` | A data key ion the format `AddressPermissions:AllowedCalls:<controller-address>`.           |
| `dataValue`                              |  `bytes`  | The updated value for the `dataKey`. MUST be a bytes32[CompactBytesArray] of Allowed Calls. |
| `hasBothAddControllerAndEditPermissions` |  `bool`   | -                                                                                           |

#### Returns

| Name |   Type    | Description                     |
| ---- | :-------: | ------------------------------- |
| `0`  | `bytes32` | Either ADD or EDIT PERMISSIONS. |

<br/>

### \_getPermissionToSetAllowedERC725YDataKeys

```solidity
function _getPermissionToSetAllowedERC725YDataKeys(
  address controlledContract,
  bytes32 dataKey,
  bytes dataValue,
  bool hasBothAddControllerAndEditPermissions
) internal view returns (bytes32);
```

Retrieve the permission required to set some Allowed ERC725Y Data Keys for a controller.

#### Parameters

| Name                                     |   Type    | Description                                                                                           |
| ---------------------------------------- | :-------: | ----------------------------------------------------------------------------------------------------- |
| `controlledContract`                     | `address` | the address of the ERC725Y contract from which to fetch the value of `dataKey`.                       |
| `dataKey`                                | `bytes32` | A data key in the format `AddressPermissions:AllowedERC725YDataKeys:<controller-address>`.            |
| `dataValue`                              |  `bytes`  | The updated value for the `dataKey`. MUST be a bytes[CompactBytesArray] of Allowed ERC725Y Data Keys. |
| `hasBothAddControllerAndEditPermissions` |  `bool`   | -                                                                                                     |

#### Returns

| Name |   Type    | Description                     |
| ---- | :-------: | ------------------------------- |
| `0`  | `bytes32` | Either ADD or EDIT PERMISSIONS. |

<br/>

### \_getPermissionToSetLSP1Delegate

```solidity
function _getPermissionToSetLSP1Delegate(
  address controlledContract,
  bytes32 lsp1DelegateDataKey
) internal view returns (bytes32);
```

retrieve the permission required to either add or change the address
of a LSP1 Universal Receiver Delegate stored under a specific LSP1 data key.

#### Parameters

| Name                  |   Type    | Description                                                          |
| --------------------- | :-------: | -------------------------------------------------------------------- |
| `controlledContract`  | `address` | the address of the ERC725Y contract where the data key is verified.  |
| `lsp1DelegateDataKey` | `bytes32` | either the data key for the default `LSP1UniversalReceiverDelegate`, |

#### Returns

| Name |   Type    | Description                                     |
| ---- | :-------: | ----------------------------------------------- |
| `0`  | `bytes32` | either ADD or CHANGE UNIVERSALRECEIVERDELEGATE. |

<br/>

### \_getPermissionToSetLSP17Extension

```solidity
function _getPermissionToSetLSP17Extension(
  address controlledContract,
  bytes32 lsp17ExtensionDataKey
) internal view returns (bytes32);
```

Verify if `controller` has the required permissions to either add or change the address
of an LSP0 Extension stored under a specific LSP17Extension data key

#### Parameters

| Name                    |   Type    | Description                                                         |
| ----------------------- | :-------: | ------------------------------------------------------------------- |
| `controlledContract`    | `address` | the address of the ERC725Y contract where the data key is verified. |
| `lsp17ExtensionDataKey` | `bytes32` | the dataKey to set with `_LSP17_EXTENSION_PREFIX` as prefix.        |

<br/>

### \_verifyAllowedERC725YSingleKey

```solidity
function _verifyAllowedERC725YSingleKey(
  address controllerAddress,
  bytes32 inputDataKey,
  bytes allowedERC725YDataKeysCompacted
) internal pure;
```

Verify if the `inputKey` is present in the list of `allowedERC725KeysCompacted` for the `controllerAddress`.

#### Parameters

| Name                              |   Type    | Description                                                                               |
| --------------------------------- | :-------: | ----------------------------------------------------------------------------------------- |
| `controllerAddress`               | `address` | the address of the controller.                                                            |
| `inputDataKey`                    | `bytes32` | the data key to verify against the allowed ERC725Y Data Keys for the `controllerAddress`. |
| `allowedERC725YDataKeysCompacted` |  `bytes`  | a CompactBytesArray of allowed ERC725Y Data Keys for the `controllerAddress`.             |

<br/>

### \_verifyAllowedERC725YDataKeys

```solidity
function _verifyAllowedERC725YDataKeys(
  address controllerAddress,
  bytes32[] inputDataKeys,
  bytes allowedERC725YDataKeysCompacted,
  bool[] validatedInputKeysList,
  uint256 allowedDataKeysFound
) internal pure;
```

Verify if all the `inputDataKeys` are present in the list of `allowedERC725KeysCompacted` of the `controllerAddress`.

#### Parameters

| Name                              |    Type     | Description                                                                                                                  |
| --------------------------------- | :---------: | ---------------------------------------------------------------------------------------------------------------------------- |
| `controllerAddress`               |  `address`  | the address of the controller.                                                                                               |
| `inputDataKeys`                   | `bytes32[]` | the data keys to verify against the allowed ERC725Y Data Keys of the `controllerAddress`.                                    |
| `allowedERC725YDataKeysCompacted` |   `bytes`   | a CompactBytesArray of allowed ERC725Y Data Keys of the `controllerAddress`.                                                 |
| `validatedInputKeysList`          |  `bool[]`   | an array of booleans to store the result of the verification of each data keys checked.                                      |
| `allowedDataKeysFound`            |  `uint256`  | the number of data keys that were previously validated for other permissions like `ADDCONTROLLER`, `EDITPERMISSIONS`, etc... |

<br/>

### \_requirePermissions

```solidity
function _requirePermissions(
  address controller,
  bytes32 addressPermissions,
  bytes32 permissionRequired
) internal pure;
```

Check if the `controller` has the `permissionRequired` among its permission listed in `controllerPermissions`
If not, this function will revert with the error `NotAuthorised` and the name of the permission missing by the controller.

#### Parameters

| Name                 |   Type    | Description                       |
| -------------------- | :-------: | --------------------------------- |
| `controller`         | `address` | the caller address                |
| `addressPermissions` | `bytes32` | the caller's permissions BitArray |
| `permissionRequired` | `bytes32` | the required permission           |

<br/>

### \_verifyCanExecute

```solidity
function _verifyCanExecute(
  address controlledContract,
  address controller,
  bytes32 permissions,
  uint256 operationType,
  address to,
  uint256 value,
  bytes data
) internal view;
```

verify if `controllerAddress` has the required permissions to interact with other addresses using the controlledContract.

#### Parameters

| Name                 |   Type    | Description                                                                                              |
| -------------------- | :-------: | -------------------------------------------------------------------------------------------------------- |
| `controlledContract` | `address` | the address of the ERC725 contract where the payload is executed and where the permissions are verified. |
| `controller`         | `address` | the address who want to run the execute function on the ERC725Account.                                   |
| `permissions`        | `bytes32` | the permissions of the controller address.                                                               |
| `operationType`      | `uint256` | -                                                                                                        |
| `to`                 | `address` | -                                                                                                        |
| `value`              | `uint256` | -                                                                                                        |
| `data`               |  `bytes`  | -                                                                                                        |

<br/>

### \_verifyCanDeployContract

```solidity
function _verifyCanDeployContract(
  address controller,
  bytes32 permissions,
  bool isFundingContract
) internal view;
```

<br/>

### \_verifyCanStaticCall

```solidity
function _verifyCanStaticCall(
  address controlledContract,
  address controller,
  bytes32 permissions,
  address to,
  uint256 value,
  bytes data
) internal view;
```

<br/>

### \_verifyCanCall

```solidity
function _verifyCanCall(
  address controlledContract,
  address controller,
  bytes32 permissions,
  address to,
  uint256 value,
  bytes data
) internal view;
```

<br/>

### \_verifyAllowedCall

```solidity
function _verifyAllowedCall(
  address controlledContract,
  address controllerAddress,
  uint256 operationType,
  address to,
  uint256 value,
  bytes data
) internal view;
```

<br/>

### \_extractCallType

```solidity
function _extractCallType(
  uint256 operationType,
  uint256 value,
  bytes data
) internal pure returns (bytes4 requiredCallTypes);
```

extract the bytes4 representation of a single bit for the type of call according to the `operationType`

#### Parameters

| Name            |   Type    | Description                                  |
| --------------- | :-------: | -------------------------------------------- |
| `operationType` | `uint256` | 0 = CALL, 3 = STATICCALL or 3 = DELEGATECALL |
| `value`         | `uint256` | -                                            |
| `data`          |  `bytes`  | -                                            |

#### Returns

| Name                |   Type   | Description                                               |
| ------------------- | :------: | --------------------------------------------------------- |
| `requiredCallTypes` | `bytes4` | a bytes4 value containing a single 1 bit for the callType |

<br/>

### \_isAllowedAddress

```solidity
function _isAllowedAddress(
  bytes allowedCall,
  address to
) internal pure returns (bool);
```

<br/>

### \_isAllowedStandard

```solidity
function _isAllowedStandard(
  bytes allowedCall,
  address to
) internal view returns (bool);
```

<br/>

### \_isAllowedFunction

```solidity
function _isAllowedFunction(
  bytes allowedCall,
  bytes data
) internal pure returns (bool);
```

<br/>

### \_isAllowedCallType

```solidity
function _isAllowedCallType(
  bytes allowedCall,
  bytes4 requiredCallTypes
) internal pure returns (bool);
```

<br/>

### \_verifyExecuteRelayCallPermission

```solidity
function _verifyExecuteRelayCallPermission(
  address controllerAddress,
  bytes32 controllerPermissions
) internal pure;
```

<br/>

### \_verifyOwnershipPermissions

```solidity
function _verifyOwnershipPermissions(
  address controllerAddress,
  bytes32 controllerPermissions
) internal pure;
```

<br/>

### \_getNonce

```solidity
function _getNonce(
  address from,
  uint128 channelId
) internal view returns (uint256 idx);
```

Read the nonce for a `from` address on a specific `channelId`.
This will return an `idx`, which is the concatenation of two `uint128` as follow:

1. the `channelId` where the nonce was queried for.

2. the actual nonce of the given `channelId`.
   For example, if on `channelId` number `5`, the latest nonce is `1`, the `idx` returned by this function will be:

```
// in decimals = 1701411834604692317316873037158841057281
idx = 0x0000000000000000000000000000000500000000000000000000000000000001
```

This idx can be described as follow:

```
            channelId => 5          nonce in this channel => 1
  v------------------------------v-------------------------------v
0x0000000000000000000000000000000500000000000000000000000000000001
```

#### Parameters

| Name        |   Type    | Description                                |
| ----------- | :-------: | ------------------------------------------ |
| `from`      | `address` | The address to read the nonce for.         |
| `channelId` | `uint128` | The channel in which to extract the nonce. |

#### Returns

| Name  |   Type    | Description                                                                                                            |
| ----- | :-------: | ---------------------------------------------------------------------------------------------------------------------- |
| `idx` | `uint256` | The idx composed of two `uint128`: the channelId + nonce in channel concatenated together in a single `uint256` value. |

<br/>

### \_recoverSignerFromLSP25Signature

```solidity
function _recoverSignerFromLSP25Signature(
  bytes signature,
  uint256 nonce,
  uint256 validityTimestamps,
  uint256 msgValue,
  bytes callData
) internal view returns (address);
```

Recover the address of the signer that generated a `signature` using the parameters provided `nonce`, `validityTimestamps`, `msgValue` and `callData`.
The address of the signer will be recovered using the LSP25 signature format.

#### Parameters

| Name                 |   Type    | Description                                                                                                                                          |
| -------------------- | :-------: | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signature`          |  `bytes`  | A 65 bytes long signature generated according to the signature format specified in the LSP25 standard.                                               |
| `nonce`              | `uint256` | The nonce that the signer used to generate the `signature`.                                                                                          |
| `validityTimestamps` | `uint256` | The validity timestamp that the signer used to generate the signature (See [`_verifyValidityTimestamps`](#_verifyvaliditytimestamps) to learn more). |
| `msgValue`           | `uint256` | The amount of native tokens intended to be sent for the relay transaction.                                                                           |
| `callData`           |  `bytes`  | The calldata to execute as a relay transaction that the signer signed for.                                                                           |

#### Returns

| Name |   Type    | Description                                              |
| ---- | :-------: | -------------------------------------------------------- |
| `0`  | `address` | The address that signed, recovered from the `signature`. |

<br/>

### \_verifyValidityTimestamps

```solidity
function _verifyValidityTimestamps(uint256 validityTimestamps) internal view;
```

Verify that the current timestamp is within the date and time range provided by `validityTimestamps`.

#### Parameters

| Name                 |   Type    | Description                                                                                                                            |
| -------------------- | :-------: | -------------------------------------------------------------------------------------------------------------------------------------- |
| `validityTimestamps` | `uint256` | Two `uint128` concatenated together, where the left-most `uint128` represent the timestamp from which the transaction can be executed, |

<br/>

### \_isValidNonce

```solidity
function _isValidNonce(address from, uint256 idx) internal view returns (bool);
```

Verify that the nonce `_idx` for `_from` (obtained via [`getNonce`](#getnonce)) is valid in its channel ID.
The "idx" is a 256bits (unsigned) integer, where:

- the 128 leftmost bits = channelId

- and the 128 rightmost bits = nonce within the channel

#### Parameters

| Name   |   Type    | Description                                                                  |
| ------ | :-------: | ---------------------------------------------------------------------------- |
| `from` | `address` | The signer's address.                                                        |
| `idx`  | `uint256` | The concatenation of the `channelId` + `nonce` within a specific channel ID. |

#### Returns

| Name |  Type  | Description                                                              |
| ---- | :----: | ------------------------------------------------------------------------ |
| `0`  | `bool` | true if the nonce is the latest nonce for the `signer`, false otherwise. |

<br/>

### \_execute

```solidity
function _execute(
  uint256 msgValue,
  bytes payload
) internal nonpayable returns (bytes);
```

<br/>

### \_executeRelayCall

:::caution Warning

Be aware that this function can also throw an error if the `callData` was signed incorrectly (not conforming to the signature format defined in the LSP25 standard).
This is because the contract cannot distinguish if the data is signed correctly or not. Instead, it will recover an incorrect signer address from the signature
and throw an [`InvalidRelayNonce`](#invalidrelaynonce) error with the incorrect signer address as the first parameter.

:::

```solidity
function _executeRelayCall(
  bytes signature,
  uint256 nonce,
  uint256 validityTimestamps,
  uint256 msgValue,
  bytes payload
) internal nonpayable returns (bytes);
```

Validate that the `nonce` given for the `signature` signed and the `payload` to execute is valid
and conform to the signature format according to the LSP25 standard.

#### Parameters

| Name                 |   Type    | Description                                                                                                                            |
| -------------------- | :-------: | -------------------------------------------------------------------------------------------------------------------------------------- |
| `signature`          |  `bytes`  | A valid signature for a signer, generated according to the signature format specified in the LSP25 standard.                           |
| `nonce`              | `uint256` | The nonce that the signer used to generate the `signature`.                                                                            |
| `validityTimestamps` | `uint256` | Two `uint128` concatenated together, where the left-most `uint128` represent the timestamp from which the transaction can be executed, |
| `msgValue`           | `uint256` | -                                                                                                                                      |
| `payload`            |  `bytes`  | The abi-encoded function call to execute.                                                                                              |

<br/>

### \_executePayload

```solidity
function _executePayload(
  address targetContract,
  uint256 msgValue,
  bytes payload
) internal nonpayable returns (bytes);
```

_Execute the `payload` passed to `execute(...)` or `executeRelayCall(...)`_

#### Parameters

| Name             |   Type    | Description                                                                   |
| ---------------- | :-------: | ----------------------------------------------------------------------------- |
| `targetContract` | `address` | -                                                                             |
| `msgValue`       | `uint256` | -                                                                             |
| `payload`        |  `bytes`  | The abi-encoded function call to execute on the [`target`](#target) contract. |

#### Returns

| Name |  Type   | Description                                                                          |
| ---- | :-----: | ------------------------------------------------------------------------------------ |
| `0`  | `bytes` | bytes The data returned by the call made to the linked [`target`](#target) contract. |

<br/>

### \_verifyPermissions

```solidity
function _verifyPermissions(
  address targetContract,
  address from,
  bool isRelayedCall,
  bytes payload
) internal view;
```

Verify if the `from` address is allowed to execute the `payload` on the [`target`](#target) contract linked to this Key Manager.

#### Parameters

| Name             |   Type    | Description                                                                                          |
| ---------------- | :-------: | ---------------------------------------------------------------------------------------------------- |
| `targetContract` | `address` | The contract that is owned by the Key Manager                                                        |
| `from`           | `address` | Either the caller of [`execute`](#execute) or the signer of [`executeRelayCall`](#executerelaycall). |
| `isRelayedCall`  |  `bool`   | -                                                                                                    |
| `payload`        |  `bytes`  | The abi-encoded function call to execute on the [`target`](#target) contract.                        |

<br/>

### \_nonReentrantBefore

```solidity
function _nonReentrantBefore(
  address targetContract,
  bool isSetData,
  address from
) internal nonpayable returns (bool reentrancyStatus);
```

Check if we are in the context of a reentrant call, by checking if the reentrancy status is `true`.

- If the status is `true`, the caller (or signer for relay call) MUST have the `REENTRANCY` permission. Otherwise, the call is reverted.

- If the status is `false`, it is set to `true` only if we are not dealing with a call to the functions `setData` or `setDataBatch`.
  Used at the beginning of the [`lsp20VerifyCall`](#`lsp20verifycall`), [`_execute`](#`_execute`) and [`_executeRelayCall`](#`_executerelaycall`) functions, before the methods execution starts.

<br/>

### \_nonReentrantAfter

```solidity
function _nonReentrantAfter(address targetContract) internal nonpayable;
```

Resets the reentrancy status to `false`
Used at the end of the [`lsp20VerifyCall`](#`lsp20verifycall`), [`_execute`](#`_execute`) and [`_executeRelayCall`](#`_executerelaycall`) functions after the functions' execution is terminated.

<br/>

## Events

### PermissionsVerified

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#permissionsverified)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Event signature: `PermissionsVerified(address,uint256,bytes4)`
- Event topic hash: `0xc0a62328f6bf5e3172bb1fcb2019f54b2c523b6a48e3513a2298fbf0150b781e`

:::

```solidity
event PermissionsVerified(address indexed signer, uint256 indexed value, bytes4 indexed selector);
```

_Verified the permissions of `signer` for calling function `selector` on the linked account and sending `value` of native token._

Emitted when the LSP6KeyManager contract verified the permissions of the `signer` successfully.

#### Parameters

| Name                     |   Type    | Description                                                                                                                                                                         |
| ------------------------ | :-------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signer` **`indexed`**   | `address` | The address of the controller that executed the calldata payload (either directly via [`execute`](#execute) or via meta transaction using [`executeRelayCall`](#executerelaycall)). |
| `value` **`indexed`**    | `uint256` | The amount of native token to be transferred in the calldata payload.                                                                                                               |
| `selector` **`indexed`** | `bytes4`  | The bytes4 function of the function that was executed on the linked [`target`](#target)                                                                                             |

<br/>

## Errors

### BatchExecuteParamsLengthMismatch

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#batchexecuteparamslengthmismatch)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `BatchExecuteParamsLengthMismatch()`
- Error hash: `0x55a187db`

:::

```solidity
error BatchExecuteParamsLengthMismatch();
```

_The array parameters provided to the function `executeBatch(...)` do not have the same number of elements. (Different array param's length)._

Reverts when the array parameters `uint256[] value` and `bytes[] payload` have different sizes. There should be the same number of elements for each array parameters.

<br/>

### BatchExecuteRelayCallParamsLengthMismatch

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#batchexecuterelaycallparamslengthmismatch)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `BatchExecuteRelayCallParamsLengthMismatch()`
- Error hash: `0xb4d50d21`

:::

```solidity
error BatchExecuteRelayCallParamsLengthMismatch();
```

_The array parameters provided to the function `executeRelayCallBatch(...)` do not have the same number of elements. (Different array param's length)._

Reverts when providing array parameters of different sizes to `executeRelayCallBatch(bytes[],uint256[],bytes[])`

<br/>

### CallingKeyManagerNotAllowed

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#callingkeymanagernotallowed)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `CallingKeyManagerNotAllowed()`
- Error hash: `0xa431b236`

:::

```solidity
error CallingKeyManagerNotAllowed();
```

_Calling the Key Manager address for this transaction is disallowed._

Reverts when calling the KeyManager through `execute(uint256,address,uint256,bytes)`.

<br/>

### DelegateCallDisallowedViaKeyManager

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#delegatecalldisallowedviakeymanager)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `DelegateCallDisallowedViaKeyManager()`
- Error hash: `0x80d6ebae`

:::

```solidity
error DelegateCallDisallowedViaKeyManager();
```

_Performing DELEGATE CALLS via the Key Manager is currently disallowed._

Reverts when trying to do a `delegatecall` via the ERC725X.execute(uint256,address,uint256,bytes) (operation type 4) function of the linked [`target`](#target). `DELEGATECALL` is disallowed by default on the LSP6KeyManager.

<br/>

### ERC725X_ExecuteParametersEmptyArray

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#erc725x_executeparametersemptyarray)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `ERC725X_ExecuteParametersEmptyArray()`
- Error hash: `0xe9ad2b5f`

:::

```solidity
error ERC725X_ExecuteParametersEmptyArray();
```

Reverts when one of the array parameter provided to the [`executeBatch`](#executebatch) function is an empty array.

<br/>

### ERC725X_ExecuteParametersLengthMismatch

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#erc725x_executeparameterslengthmismatch)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `ERC725X_ExecuteParametersLengthMismatch()`
- Error hash: `0x3ff55f4d`

:::

```solidity
error ERC725X_ExecuteParametersLengthMismatch();
```

Reverts when there is not the same number of elements in the `operationTypes`, `targets` addresses, `values`, and `datas` array parameters provided when calling the [`executeBatch`](#executebatch) function.

<br/>

### ERC725Y_DataKeysValuesLengthMismatch

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#erc725y_datakeysvalueslengthmismatch)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `ERC725Y_DataKeysValuesLengthMismatch()`
- Error hash: `0x3bcc8979`

:::

```solidity
error ERC725Y_DataKeysValuesLengthMismatch();
```

Reverts when there is not the same number of elements in the `datakeys` and `dataValues` array parameters provided when calling the [`setDataBatch`](#setdatabatch) function.

<br/>

### InvalidDataValuesForDataKeys

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#invaliddatavaluesfordatakeys)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `InvalidDataValuesForDataKeys(bytes32,bytes)`
- Error hash: `0x1fa41397`

:::

```solidity
error InvalidDataValuesForDataKeys(bytes32 dataKey, bytes dataValue);
```

_Data value: `dataValue` length is different from the required length for the data key which is set._

Reverts when the data value length is not one of the required lengths for the specific data key.

#### Parameters

| Name        |   Type    | Description                                                 |
| ----------- | :-------: | ----------------------------------------------------------- |
| `dataKey`   | `bytes32` | The data key that has a required length for the data value. |
| `dataValue` |  `bytes`  | The data value that has an invalid length.                  |

<br/>

### InvalidERC725Function

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#invaliderc725function)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `InvalidERC725Function(bytes4)`
- Error hash: `0x2ba8851c`

:::

```solidity
error InvalidERC725Function(bytes4 invalidFunction);
```

_The Key Manager could not verify the calldata of the transaction because it could not recognise the function being called. Invalid function selector: `invalidFunction`._

Reverts when trying to call a function on the linked [`target`](#target), that is not any of the following:

- `setData(bytes32,bytes)` (ERC725Y)

- `setDataBatch(bytes32[],bytes[])` (ERC725Y)

- `execute(uint256,address,uint256,bytes)` (ERC725X)

- `transferOwnership(address)` (LSP14)

- `acceptOwnership()` (LSP14)

- `renounceOwnership()` (LSP14)

#### Parameters

| Name              |   Type   | Description                                                                                                                 |
| ----------------- | :------: | --------------------------------------------------------------------------------------------------------------------------- |
| `invalidFunction` | `bytes4` | The `bytes4` selector of the function that was attempted to be called on the linked [`target`](#target) but not recognised. |

<br/>

### InvalidEncodedAllowedCalls

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#invalidencodedallowedcalls)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `InvalidEncodedAllowedCalls(bytes)`
- Error hash: `0x187e77ab`

:::

```solidity
error InvalidEncodedAllowedCalls(bytes allowedCallsValue);
```

_Could not decode the Allowed Calls. Value = `allowedCallsValue`._

Reverts when `allowedCallsValue` is not properly encoded as a `(bytes4,address,bytes4,bytes4)[CompactBytesArray]` (CompactBytesArray made of tuples that are 32 bytes long each). See LSP2 value type `CompactBytesArray` for more infos.

#### Parameters

| Name                |  Type   | Description                                                                                                       |
| ------------------- | :-----: | ----------------------------------------------------------------------------------------------------------------- |
| `allowedCallsValue` | `bytes` | The list of allowedCalls that are not encoded correctly as a `(bytes4,address,bytes4,bytes4)[CompactBytesArray]`. |

<br/>

### InvalidEncodedAllowedERC725YDataKeys

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#invalidencodedallowederc725ydatakeys)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `InvalidEncodedAllowedERC725YDataKeys(bytes,string)`
- Error hash: `0xae6cbd37`

:::

```solidity
error InvalidEncodedAllowedERC725YDataKeys(bytes value, string context);
```

_Error when reading the Allowed ERC725Y Data Keys. Reason: `context`, Allowed ERC725Y Data Keys value read: `value`._

Reverts when `value` is not encoded properly as a `bytes32[CompactBytesArray]`. The `context` string provides context on when this error occurred (\_e.g: when fetching the `AllowedERC725YDataKeys` to verify the permissions of a controller, or when validating the `AllowedERC725YDataKeys` when setting them for a controller).

#### Parameters

| Name      |   Type   | Description                                                |
| --------- | :------: | ---------------------------------------------------------- |
| `value`   | `bytes`  | The value that is not a valid `bytes32[CompactBytesArray]` |
| `context` | `string` | A brief description of where the error occurred.           |

<br/>

### InvalidLSP6Target

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#invalidlsp6target)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `InvalidLSP6Target()`
- Error hash: `0xfc854579`

:::

```solidity
error InvalidLSP6Target();
```

_Invalid address supplied to link this Key Manager to (`address(0)`)._

Reverts when the address provided to set as the [`target`](#target) linked to this KeyManager is invalid (_e.g. `address(0)`_).

<br/>

### InvalidPayload

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#invalidpayload)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `InvalidPayload(bytes)`
- Error hash: `0x3621bbcc`

:::

```solidity
error InvalidPayload(bytes payload);
```

_Invalid calldata payload sent._

Reverts when the payload is invalid.

#### Parameters

| Name      |  Type   | Description |
| --------- | :-----: | ----------- |
| `payload` | `bytes` | -           |

<br/>

### InvalidRelayNonce

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#invalidrelaynonce)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `InvalidRelayNonce(address,uint256,bytes)`
- Error hash: `0xc9bd9eb9`

:::

```solidity
error InvalidRelayNonce(address signer, uint256 invalidNonce, bytes signature);
```

_The relay call failed because an invalid nonce was provided for the address `signer` that signed the execute relay call. Invalid nonce: `invalidNonce`, signature of signer: `signature`._

Reverts when the `signer` address retrieved from the `signature` has an invalid nonce: `invalidNonce`.

#### Parameters

| Name           |   Type    | Description                                          |
| -------------- | :-------: | ---------------------------------------------------- |
| `signer`       | `address` | The address of the signer.                           |
| `invalidNonce` | `uint256` | The nonce retrieved for the `signer` address.        |
| `signature`    |  `bytes`  | The signature used to retrieve the `signer` address. |

<br/>

### InvalidWhitelistedCall

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#invalidwhitelistedcall)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `InvalidWhitelistedCall(address)`
- Error hash: `0x6fd203c5`

:::

```solidity
error InvalidWhitelistedCall(address from);
```

_Invalid allowed calls (`0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff`) set for address `from`. Could not perform external call._

Reverts when a `from` address has _"any whitelisted call"_ as allowed call set. This revert happens during the verification of the permissions of the address for its allowed calls. A `from` address is not allowed to have 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff in its list of `AddressPermissions:AllowedCalls:<address>`, as this allows any STANDARD:ADDRESS:FUNCTION. This is equivalent to granting the SUPER permission and should never be valid.

#### Parameters

| Name   |   Type    | Description                                                            |
| ------ | :-------: | ---------------------------------------------------------------------- |
| `from` | `address` | The controller address that has _"any allowed calls"_ whitelisted set. |

<br/>

### KeyManagerCannotBeSetAsExtensionForLSP20Functions

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#keymanagercannotbesetasextensionforlsp20functions)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `KeyManagerCannotBeSetAsExtensionForLSP20Functions()`
- Error hash: `0x4a9fa8cf`

:::

```solidity
error KeyManagerCannotBeSetAsExtensionForLSP20Functions();
```

_Key Manager cannot be used as an LSP17 extension for LSP20 functions._

Reverts when the address of the Key Manager is being set as extensions for lsp20 functions

<br/>

### LSP6BatchExcessiveValueSent

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#lsp6batchexcessivevaluesent)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `LSP6BatchExcessiveValueSent(uint256,uint256)`
- Error hash: `0xa51868b6`

:::

```solidity
error LSP6BatchExcessiveValueSent(uint256 totalValues, uint256 msgValue);
```

_Too much funds sent to forward each amount in the batch. No amount of native tokens should stay in the Key Manager._

This error occurs when there was too much funds sent to the batch functions `execute(uint256[],bytes[])` or `executeRelayCall(bytes[],uint256[],uint256[],bytes[])` to cover the sum of all the values forwarded on Reverts to avoid the KeyManager to holds some remaining funds sent to the following batch functions:

- execute(uint256[],bytes[])

- executeRelayCall(bytes[],uint256[],uint256[],bytes[]) This error occurs when `msg.value` is more than the sum of all the values being forwarded on each payloads (`values[]` parameter from the batch functions above).

#### Parameters

| Name          |   Type    | Description |
| ------------- | :-------: | ----------- |
| `totalValues` | `uint256` | -           |
| `msgValue`    | `uint256` | -           |

<br/>

### LSP6BatchInsufficientValueSent

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#lsp6batchinsufficientvaluesent)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `LSP6BatchInsufficientValueSent(uint256,uint256)`
- Error hash: `0x30a324ac`

:::

```solidity
error LSP6BatchInsufficientValueSent(uint256 totalValues, uint256 msgValue);
```

_Not enough funds sent to forward each amount in the batch._

This error occurs when there was not enough funds sent to the batch functions `execute(uint256[],bytes[])` or `executeRelayCall(bytes[],uint256[],uint256[],bytes[])` to cover the sum of all the values forwarded on each payloads (`values[]` parameter from the batch functions above). This mean that `msg.value` is less than the sum of all the values being forwarded on each payloads (`values[]` parameters).

#### Parameters

| Name          |   Type    | Description                                                                                                                                      |
| ------------- | :-------: | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `totalValues` | `uint256` | The sum of all the values forwarded on each payloads (`values[]` parameter from the batch functions above).                                      |
| `msgValue`    | `uint256` | The amount of native tokens sent to the batch functions `execute(uint256[],bytes[])` or `executeRelayCall(bytes[],uint256[],uint256[],bytes[])`. |

<br/>

### NoCallsAllowed

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#nocallsallowed)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `NoCallsAllowed(address)`
- Error hash: `0x6cb60587`

:::

```solidity
error NoCallsAllowed(address from);
```

_The address `from` is not authorised to use the linked account contract to make external calls, because it has no Allowed Calls set._

Reverts when the `from` address has no `AllowedCalls` set and cannot interact with any address using the linked [`target`](#target).

#### Parameters

| Name   |   Type    | Description                           |
| ------ | :-------: | ------------------------------------- |
| `from` | `address` | The address that has no AllowedCalls. |

<br/>

### NoERC725YDataKeysAllowed

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#noerc725ydatakeysallowed)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `NoERC725YDataKeysAllowed(address)`
- Error hash: `0xed7fa509`

:::

```solidity
error NoERC725YDataKeysAllowed(address from);
```

_The address `from` is not authorised to set data, because it has no ERC725Y Data Key allowed._

Reverts when the `from` address has no AllowedERC725YDataKeys set and cannot set any ERC725Y data key on the ERC725Y storage of the linked [`target`](#target).

#### Parameters

| Name   |   Type    | Description                                           |
| ------ | :-------: | ----------------------------------------------------- |
| `from` | `address` | The address that has no `AllowedERC725YDataKeys` set. |

<br/>

### NoPermissionsSet

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#nopermissionsset)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `NoPermissionsSet(address)`
- Error hash: `0xf292052a`

:::

```solidity
error NoPermissionsSet(address from);
```

_The address `from` does not have any permission set on the contract linked to the Key Manager._

Reverts when address `from` does not have any permissions set on the account linked to this Key Manager

#### Parameters

| Name   |   Type    | Description                                |
| ------ | :-------: | ------------------------------------------ |
| `from` | `address` | the address that does not have permissions |

<br/>

### NotAllowedCall

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#notallowedcall)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `NotAllowedCall(address,address,bytes4)`
- Error hash: `0x45147bce`

:::

```solidity
error NotAllowedCall(address from, address to, bytes4 selector);
```

_The address `from` is not authorised to call the function `selector` on the `to` address._

Reverts when `from` is not authorised to call the `execute(uint256,address,uint256,bytes)` function because of a not allowed callType, address, standard or function.

#### Parameters

| Name       |   Type    | Description                                                                                                                                                                  |
| ---------- | :-------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `from`     | `address` | The controller that tried to call the `execute(uint256,address,uint256,bytes)` function.                                                                                     |
| `to`       | `address` | The address of an EOA or contract that `from` tried to call using the linked [`target`](#target)                                                                             |
| `selector` | `bytes4`  | If `to` is a contract, the bytes4 selector of the function that `from` is trying to call. If no function is called (_e.g: a native token transfer_), selector = `0x00000000` |

<br/>

### NotAllowedERC725YDataKey

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#notallowederc725ydatakey)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `NotAllowedERC725YDataKey(address,bytes32)`
- Error hash: `0x557ae079`

:::

```solidity
error NotAllowedERC725YDataKey(address from, bytes32 disallowedKey);
```

_The address `from` is not authorised to set the data key `disallowedKey` on the contract linked to the Key Manager._

Reverts when address `from` is not authorised to set the key `disallowedKey` on the linked [`target`](#target).

#### Parameters

| Name            |   Type    | Description                                                                                                       |
| --------------- | :-------: | ----------------------------------------------------------------------------------------------------------------- |
| `from`          | `address` | address The controller that tried to `setData` on the linked [`target`](#target).                                 |
| `disallowedKey` | `bytes32` | A bytes32 data key that `from` is not authorised to set on the ERC725Y storage of the linked [`target`](#target). |

<br/>

### NotAuthorised

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#notauthorised)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `NotAuthorised(address,string)`
- Error hash: `0x3bdad6e6`

:::

```solidity
error NotAuthorised(address from, string permission);
```

_The address `from` is not authorised to `permission` on the contract linked to the Key Manager._

Reverts when address `from` is not authorised and does not have `permission` on the linked [`target`](#target)

#### Parameters

| Name         |   Type    | Description                                                                    |
| ------------ | :-------: | ------------------------------------------------------------------------------ |
| `from`       | `address` | address The address that was not authorised.                                   |
| `permission` | `string`  | permission The permission required (\_e.g: `SETDATA`, `CALL`, `TRANSFERVALUE`) |

<br/>

### NotRecognisedPermissionKey

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#notrecognisedpermissionkey)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `NotRecognisedPermissionKey(bytes32)`
- Error hash: `0x0f7d735b`

:::

```solidity
error NotRecognisedPermissionKey(bytes32 dataKey);
```

_The data key `dataKey` starts with `AddressPermissions` prefix but is none of the permission data keys defined in LSP6._

Reverts when `dataKey` is a `bytes32` value that does not adhere to any of the permission data keys defined by the LSP6 standard

#### Parameters

| Name      |   Type    | Description                                                                    |
| --------- | :-------: | ------------------------------------------------------------------------------ |
| `dataKey` | `bytes32` | The dataKey that does not match any of the standard LSP6 permission data keys. |

<br/>

### RelayCallBeforeStartTime

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#relaycallbeforestarttime)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `RelayCallBeforeStartTime()`
- Error hash: `0x00de4b8a`

:::

```solidity
error RelayCallBeforeStartTime();
```

_Relay call not valid yet._

Reverts when the relay call is cannot yet bet executed. This mean that the starting timestamp provided to [`executeRelayCall`](#executerelaycall) function is bigger than the current timestamp.

<br/>

### RelayCallExpired

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-6-KeyManager.md#relaycallexpired)
- Solidity implementation: [`LSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP6KeyManager/LSP6KeyManager.sol)
- Error signature: `RelayCallExpired()`
- Error hash: `0x5c53a98c`

:::

```solidity
error RelayCallExpired();
```

_Relay call expired (deadline passed)._

Reverts when the period to execute the relay call has expired.

<br/>
