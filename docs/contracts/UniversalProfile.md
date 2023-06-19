# UniversalProfile

:::info Soldity contract

[`UniversalProfile.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)

:::

> implementation of a LUKSO&#39;s Universal Profile based on LSP3

Implementation of the ERC725Account + LSP1 universalReceiver

## Methods

### constructor

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#constructor)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)

:::

```solidity
constructor(address initialOwner);
```

_Deploying the contract with owner set to: `initialOwner`_

Set `initialOwner` as the contract owner and set the `SupportedStandards:LSP3UniversalProfile` data key in the ERC725Y data key/value store. The `constructor` also allows funding the contract on deployment. Emitted Events:

- ValueReceived: when the contract is funded on deployment.

#### Parameters

| Name           |   Type    | Description               |
| -------------- | :-------: | ------------------------- |
| `initialOwner` | `address` | the owner of the contract |

### fallback

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#fallback)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)

:::

```solidity
fallback() external payable;
```

### receive

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#receive)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)

:::

```solidity
receive() external payable;
```

### RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#renounce_ownership_confirmation_delay)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Function signature: `RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY()`
- Function selector: `0xead3fbdf`

:::

```solidity
function RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY()
  external
  view
  returns (uint256);
```

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `uint256` | -           |

### RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#renounce_ownership_confirmation_period)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Function signature: `RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD()`
- Function selector: `0x01bfba61`

:::

```solidity
function RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD()
  external
  view
  returns (uint256);
```

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `uint256` | -           |

### acceptOwnership

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#acceptownership)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Function signature: `acceptOwnership()`
- Function selector: `0x79ba5097`

:::

```solidity
function acceptOwnership() external nonpayable;
```

_Achieves the goal of LSP14Ownable2Step by implementing a 2-step ownership transfer process._

Transfer ownership of the contract from the current [`owner()`](#`owner) to the [`pendingOwner()`](#`pendingowner). Once this function is called:

- the current [`owner()`](#`owner) will loose access to the functions restricted to the [`owner()`](#`owner) only.

- the [`pendingOwner()`](#`pendingowner) will gain access to the functions restricted to the [`owner()`](#`owner) only.

<blockquote>

**Requirements:**

- MUST be called by the pendingOwner.
- When notifying the previous owner via LSP1, the typeId used MUST be `keccak256('LSP0OwnershipTransferred_SenderNotification')`.
- When notifying the new owner via LSP1, the typeId used MUST be `keccak256('LSP0OwnershipTransferred_RecipientNotification')`.

</blockquote>

### batchCalls

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#batchcalls)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Function signature: `batchCalls(bytes[])`
- Function selector: `0x6963d438`

:::

```solidity
function batchCalls(bytes[] data) external nonpayable returns (bytes[] results);
```

Allows a caller to batch different function calls in one call. Perform a delegatecall on self, to call different functions with preserving the context It is not possible to send value along the functions call due to the use of delegatecall.

#### Parameters

| Name   |   Type    | Description                                                          |
| ------ | :-------: | -------------------------------------------------------------------- |
| `data` | `bytes[]` | An array of ABI encoded function calls to be called on the contract. |

#### Returns

| Name      |   Type    | Description                                            |
| --------- | :-------: | ------------------------------------------------------ |
| `results` | `bytes[]` | An array of values returned by the executed functions. |

### execute

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#execute)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Function signature: `execute(uint256,address,uint256,bytes)`
- Function selector: `0x44c028fe`

:::

```solidity
function execute(
  uint256 operationType,
  address target,
  uint256 value,
  bytes data
) external payable returns (bytes);
```

Executes any call on other addresses.

<blockquote>

**Requirements:**

- if a `value` is provided, the contract MUST have at least this amount in its balance to execute successfully.
- if the operation type is `STATICCALL` or `DELEGATECALL`, `value` SHOULD be 0.
- `target` SHOULD be `address(0)` when deploying a contract.
- MUST pass when called by the owner or by an authorised address that pass the verification check performed on the owner accordinng to [LSP20-CallVerification] specification

</blockquote>

<blockquote>

**Emitted events:**

- [`Executed`](#executed) event, when a call is executed under `operationType` 0, 3 and 4
- [`ContractCreated`](#contractcreated) event, when a contract is created under `operationType` 1 and 2
- [`ValueReceived`](#valuereceived) event when receiving native tokens.

</blockquote>

#### Parameters

| Name            |   Type    | Description                                                                                                                     |
| --------------- | :-------: | ------------------------------------------------------------------------------------------------------------------------------- |
| `operationType` | `uint256` | The operation to execute: `CALL = 0`, `CREATE = 1` `CREATE2 = 2`, `STATICCALL = 3`, `DELEGATECALL = 4`.                         |
| `target`        | `address` | The address (smart contract/EOA) to interact with, `target` will be unused if a contract is created (`CREATE` &amp; `CREATE2`). |
| `value`         | `uint256` | The amount of native tokens to transfer (in Wei).                                                                               |
| `data`          |  `bytes`  | The call data to execute on `target`, or the bytecode of the contract to deploy.                                                |

#### Returns

| Name |  Type   | Description |
| ---- | :-----: | ----------- |
| `0`  | `bytes` | -           |

### executeBatch

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#executebatch)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Function signature: `executeBatch(uint256[],address[],uint256[],bytes[])`
- Function selector: `0x31858452`

:::

```solidity
function executeBatch(
  uint256[] operationsType,
  address[] targets,
  uint256[] values,
  bytes[] datas
) external payable returns (bytes[]);
```

Generic batch executor function that executes any call on other addresses

<blockquote>

**Requirements:**

- The length of the parameters provided MUST be equal
- if a `value` is provided, the contract MUST have at least this amount in its balance to execute successfully.
- if the operation type is `STATICCALL` or `DELEGATECALL`, `value` SHOULD be 0.
- `target` SHOULD be `address(0)` when deploying a contract.
- MUST pass when called by the owner or by an authorised address that pass the verification check performed on the owner accordinng to [LSP20-CallVerification] specification

</blockquote>

<blockquote>

**Emitted events:**

- [`Executed`](#executed) event, when a call is executed under `operationType` 0, 3 and 4 (each iteration)
- [`ContractCreated`](#contractcreated) event, when a contract is created under `operationType` 1 and 2 (each iteration)
- [`ValueReceived`](#valuereceived) event when receiving native tokens.

</blockquote>

#### Parameters

| Name             |    Type     | Description                                                                                                      |
| ---------------- | :---------: | ---------------------------------------------------------------------------------------------------------------- |
| `operationsType` | `uint256[]` | The list of operations type used: `CALL = 0`, `CREATE = 1`, `CREATE2 = 2`, `STATICCALL = 3`, `DELEGATECALL = 4`. |
| `targets`        | `address[]` | The list of addresses to call. `targets` will be unused if a contract is created (`CREATE` &amp; `CREATE2`).     |
| `values`         | `uint256[]` | The list of native token amounts to transfer (in Wei).                                                           |
| `datas`          |  `bytes[]`  | The list of call data to execute on `targets`, or the creation bytecode of the contracts to deploy.              |

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `bytes[]` | -           |

### getData

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#getdata)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Function signature: `getData(bytes32)`
- Function selector: `0x54f6127f`

:::

```solidity
function getData(bytes32 dataKey) external view returns (bytes dataValue);
```

_Gets singular data at a given `dataKey`_

#### Parameters

| Name      |   Type    | Description                     |
| --------- | :-------: | ------------------------------- |
| `dataKey` | `bytes32` | The key which value to retrieve |

#### Returns

| Name        |  Type   | Description                |
| ----------- | :-----: | -------------------------- |
| `dataValue` | `bytes` | The data stored at the key |

### getDataBatch

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#getdatabatch)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Function signature: `getDataBatch(bytes32[])`
- Function selector: `0xdedff9c6`

:::

```solidity
function getDataBatch(
  bytes32[] dataKeys
) external view returns (bytes[] dataValues);
```

_Gets array of data for multiple given keys_

#### Parameters

| Name       |    Type     | Description                                |
| ---------- | :---------: | ------------------------------------------ |
| `dataKeys` | `bytes32[]` | The array of keys which values to retrieve |

#### Returns

| Name         |   Type    | Description                               |
| ------------ | :-------: | ----------------------------------------- |
| `dataValues` | `bytes[]` | The array of data stored at multiple keys |

### isValidSignature

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#isvalidsignature)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Function signature: `isValidSignature(bytes32,bytes)`
- Function selector: `0x1626ba7e`

:::

```solidity
function isValidSignature(
  bytes32 dataHash,
  bytes signature
) external view returns (bytes4 magicValue);
```

_Achieves the goal of [EIP-1271] by validating signatures of smart contracts according to their own logic._

Handles two cases:

1. If the owner is an EOA, recovers an address from the hash and the signature provided:

- Returns the magicValue if the address recovered is the same as the owner, indicating that it was a valid signature.

- If the address is different, it returns the fail value indicating that the signature is not valid.

2. If the owner is a smart contract, it forwards the call of [`isValidSignature()`](#isvalidsignature) to the owner contract:

- If the contract fails or returns the fail value, the [`isValidSignature()`](#isvalidsignature) on the account returns the fail value, indicating that the signature is not valid.

- If the [`isValidSignature()`](#isvalidsignature) on the owner returned the magicValue, the [`isValidSignature()`](#isvalidsignature) on the account returns the magicValue, indicating that it's a valid signature.

#### Parameters

| Name        |   Type    | Description                                                  |
| ----------- | :-------: | ------------------------------------------------------------ |
| `dataHash`  | `bytes32` | The hash of the data to be validated.                        |
| `signature` |  `bytes`  | A signature that can validate the previous parameter (Hash). |

#### Returns

| Name         |   Type   | Description                                                     |
| ------------ | :------: | --------------------------------------------------------------- |
| `magicValue` | `bytes4` | A bytes4 value that indicates if the signature is valid or not. |

### owner

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#owner)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Function signature: `owner()`
- Function selector: `0x8da5cb5b`

:::

```solidity
function owner() external view returns (address);
```

Returns the address of the current owner.

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `address` | -           |

### pendingOwner

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#pendingowner)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Function signature: `pendingOwner()`
- Function selector: `0xe30c3978`

:::

```solidity
function pendingOwner() external view returns (address);
```

The address that ownership of the contract is transferred to. This address may use [`acceptOwnership()`](#acceptownership) to gain ownership of the contract.

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `address` | -           |

### renounceOwnership

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#renounceownership)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Function signature: `renounceOwnership()`
- Function selector: `0x715018a6`

:::

:::danger

Leaves the contract without an owner. Once ownership of the contract has been renounced, any functions that are restricted to be called by the owner will be permanently inaccessible, making these functions not callable anymore and unusable.

:::

```solidity
function renounceOwnership() external nonpayable;
```

_Achieves the goal of LSP14Ownable2Step by implementing a 2-step ownership renouncing process._

Renounce ownership of the contract in a 2-step process.

1. the first call will initiate the process of renouncing ownership.

2. the second is used as a confirmation and will leave the contract without an owner. MUST pass when called by the owner or by an authorised address that pass the verification check performed on the owner accordinng to [LSP20-CallVerification] specification

### setData

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#setdata)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Function signature: `setData(bytes32,bytes)`
- Function selector: `0x7f23690c`

:::

```solidity
function setData(bytes32 dataKey, bytes dataValue) external payable;
```

Sets singular data for a given `dataKey`

<blockquote>

**Requirements:**

- MUST pass when called by the owner or by an authorised address that pass the verification check performed on the owner accordinng to [LSP20-CallVerification] specification

</blockquote>

<blockquote>

**Emitted events:**

- [`ValueReceived`](#valuereceived) event when receiving native tokens.
- [`DataChanged`](#datachanged) event.

</blockquote>

#### Parameters

| Name        |   Type    | Description                      |
| ----------- | :-------: | -------------------------------- |
| `dataKey`   | `bytes32` | The key to retrieve stored value |
| `dataValue` |  `bytes`  | The value to set                 |

### setDataBatch

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#setdatabatch)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Function signature: `setDataBatch(bytes32[],bytes[])`
- Function selector: `0x97902421`

:::

```solidity
function setDataBatch(bytes32[] dataKeys, bytes[] dataValues) external payable;
```

Sets array of data for multiple given `dataKeys`

<blockquote>

**Requirements:**

- MUST pass when called by the owner or by an authorised address that pass the verification check performed on the owner accordinng to [LSP20-CallVerification] specification

</blockquote>

<blockquote>

**Emitted events:**

- [`ValueReceived`](#valuereceived) event when receiving native tokens.
- [`DataChanged`](#datachanged) event. (on each iteration of setting data)

</blockquote>

#### Parameters

| Name         |    Type     | Description                              |
| ------------ | :---------: | ---------------------------------------- |
| `dataKeys`   | `bytes32[]` | The array of data keys for values to set |
| `dataValues` |  `bytes[]`  | The array of values to set               |

### supportsInterface

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#supportsinterface)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Function signature: `supportsInterface(bytes4)`
- Function selector: `0x01ffc9a7`

:::

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool);
```

_Achieves the goal of ERC165 to detect supported interfaces and LSP17 by checking if the interfaceId being queried is supported on another linked extension._

Returns true if this contract implements the interface defined by `interfaceId`. If the contract doesn't support the `interfaceId`, it forwards the call to the `supportsInterface` extension according to LSP17, and checks if the extension implements the interface defined by `interfaceId`.

#### Parameters

| Name          |   Type   | Description |
| ------------- | :------: | ----------- |
| `interfaceId` | `bytes4` | -           |

#### Returns

| Name |  Type  | Description |
| ---- | :----: | ----------- |
| `0`  | `bool` | -           |

### transferOwnership

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#transferownership)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Function signature: `transferOwnership(address)`
- Function selector: `0xf2fde38b`

:::

```solidity
function transferOwnership(address pendingNewOwner) external nonpayable;
```

_Achieves the goal of LSP14Ownable2Step by implementing a 2-step ownership transfer process._

Sets the address of the `pendingNewOwner` as a pending owner that should call [`acceptOwnership()`](#`acceptownership) in order to complete the ownership transfer to become the new [`owner()`](#`owner) of the account. Notifies the pending owner via LSP1Standard by calling [`universalReceiver()`](#universalreceiver) on the pending owner if it's an address that supports LSP1.

<blockquote>

**Requirements:**

- MUST pass when called by the owner or by an authorized address that passes the verification check performed on the owner according to [LSP20-CallVerification] specification.
- When notifying the new owner via LSP1, the `typeId` used MUST be `keccak256('LSP0OwnershipTransferStarted')`.
- Pending owner cannot accept ownership in the same tx via the LSP1 hook.

</blockquote>

#### Parameters

| Name              |   Type    | Description                           |
| ----------------- | :-------: | ------------------------------------- |
| `pendingNewOwner` | `address` | The address of the new pending owner. |

### universalReceiver

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#universalreceiver)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Function signature: `universalReceiver(bytes32,bytes)`
- Function selector: `0x6bb56a14`

:::

```solidity
function universalReceiver(
  bytes32 typeId,
  bytes receivedData
) external payable returns (bytes returnedValues);
```

_Achieves the goal of [LSP1-UniversalReceiver] by allowing the account to be notified about incoming/outgoing transactions and enabling reactions to these actions. The reaction is achieved by having two external contracts (UniversalReceiverDelegates) that react on the whole transaction and on the specific typeId, respectively. The notification is achieved by emitting a [`UniversalReceiver`](#universalreceiver) event on the call with the function parameters, call options, and the response of the UniversalReceiverDelegates (URD) contract._

The function performs the following steps:

1. Query the ERC725Y storage with the data key `[_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY]`.

- If there is an address stored under the data key, check if this address supports the LSP1 interfaceId.

- If yes, call this address with the typeId and data (params), along with additional calldata consisting of 20 bytes of `msg.sender` and 32 bytes of `msg.value`. If not, continue the execution of the function.

2. Query the ERC725Y storage with the data key `[_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY] + <bytes32 typeId>`. (Check [LSP2-ERC725YJSONSchema] for encoding the data key)

- If there is an address stored under the data key, check if this address supports the LSP1 interfaceId.

- If yes, call this address with the typeId and data (params), along with additional calldata consisting of 20 bytes of `msg.sender` and 32 bytes of `msg.value`. If not, continue the execution of the function.

<blockquote>

**Emitted events:**

- [`ValueReceived`](#valuereceived) when receiving native tokens.
- [`UniversalReceiver`](#universalreceiver) event.

</blockquote>

#### Parameters

| Name           |   Type    | Description                |
| -------------- | :-------: | -------------------------- |
| `typeId`       | `bytes32` | The type of call received. |
| `receivedData` |  `bytes`  | The data received.         |

#### Returns

| Name             |  Type   | Description                                                                                             |
| ---------------- | :-----: | ------------------------------------------------------------------------------------------------------- |
| `returnedValues` | `bytes` | The ABI encoded return value of the LSP1UniversalReceiverDelegate call and the LSP1TypeIdDelegate call. |

## Events

### ContractCreated

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#contractcreated)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Event signature: `ContractCreated(uint256,address,uint256,bytes32)`
- Event hash: `0xa1fb700aaee2ae4a2ff6f91ce7eba292f89c2f5488b8ec4c5c5c8150692595c3`

:::

```solidity
event ContractCreated(uint256 indexed operationType, address indexed contractAddress, uint256 indexed value, bytes32 salt);
```

_Emitted when deploying a contract_

#### Parameters

| Name                            |   Type    | Description |
| ------------------------------- | :-------: | ----------- |
| `operationType` **`indexed`**   | `uint256` | -           |
| `contractAddress` **`indexed`** | `address` | -           |
| `value` **`indexed`**           | `uint256` | -           |
| `salt`                          | `bytes32` | -           |

### DataChanged

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#datachanged)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Event signature: `DataChanged(bytes32,bytes)`
- Event hash: `0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2`

:::

```solidity
event DataChanged(bytes32 indexed dataKey, bytes dataValue);
```

_Emitted when data at a key is changed_

#### Parameters

| Name                    |   Type    | Description |
| ----------------------- | :-------: | ----------- |
| `dataKey` **`indexed`** | `bytes32` | -           |
| `dataValue`             |  `bytes`  | -           |

### Executed

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#executed)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Event signature: `Executed(uint256,address,uint256,bytes4)`
- Event hash: `0x4810874456b8e6487bd861375cf6abd8e1c8bb5858c8ce36a86a04dabfac199e`

:::

```solidity
event Executed(uint256 indexed operationType, address indexed target, uint256 indexed value, bytes4 selector);
```

_Emitted when calling an address (EOA or contract)_

#### Parameters

| Name                          |   Type    | Description |
| ----------------------------- | :-------: | ----------- |
| `operationType` **`indexed`** | `uint256` | -           |
| `target` **`indexed`**        | `address` | -           |
| `value` **`indexed`**         | `uint256` | -           |
| `selector`                    | `bytes4`  | -           |

### OwnershipRenounced

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#ownershiprenounced)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Event signature: `OwnershipRenounced()`
- Event hash: `0xd1f66c3d2bc1993a86be5e3d33709d98f0442381befcedd29f578b9b2506b1ce`

:::

```solidity
event OwnershipRenounced();
```

### OwnershipTransferStarted

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#ownershiptransferstarted)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Event signature: `OwnershipTransferStarted(address,address)`
- Event hash: `0x38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e22700`

:::

```solidity
event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
```

#### Parameters

| Name                          |   Type    | Description |
| ----------------------------- | :-------: | ----------- |
| `previousOwner` **`indexed`** | `address` | -           |
| `newOwner` **`indexed`**      | `address` | -           |

### OwnershipTransferred

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#ownershiptransferred)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Event signature: `OwnershipTransferred(address,address)`
- Event hash: `0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0`

:::

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
```

#### Parameters

| Name                          |   Type    | Description |
| ----------------------------- | :-------: | ----------- |
| `previousOwner` **`indexed`** | `address` | -           |
| `newOwner` **`indexed`**      | `address` | -           |

### RenounceOwnershipStarted

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#renounceownershipstarted)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Event signature: `RenounceOwnershipStarted()`
- Event hash: `0x81b7f830f1f0084db6497c486cbe6974c86488dcc4e3738eab94ab6d6b1653e7`

:::

```solidity
event RenounceOwnershipStarted();
```

### UniversalReceiver

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#universalreceiver)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Event signature: `UniversalReceiver(address,uint256,bytes32,bytes,bytes)`
- Event hash: `0x9c3ba68eb5742b8e3961aea0afc7371a71bf433c8a67a831803b64c064a178c2`

:::

```solidity
event UniversalReceiver(address indexed from, uint256 indexed value, bytes32 indexed typeId, bytes receivedData, bytes returnedValue);
```

_Emitted when the universalReceiver function is succesfully executed_

#### Parameters

| Name                   |   Type    | Description |
| ---------------------- | :-------: | ----------- |
| `from` **`indexed`**   | `address` | -           |
| `value` **`indexed`**  | `uint256` | -           |
| `typeId` **`indexed`** | `bytes32` | -           |
| `receivedData`         |  `bytes`  | -           |
| `returnedValue`        |  `bytes`  | -           |

### ValueReceived

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#valuereceived)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Event signature: `ValueReceived(address,uint256)`
- Event hash: `0x7e71433ddf847725166244795048ecf3e3f9f35628254ecbf736056664233493`

:::

```solidity
event ValueReceived(address indexed sender, uint256 indexed value);
```

_Emitted when receiving native tokens_

#### Parameters

| Name                   |   Type    | Description |
| ---------------------- | :-------: | ----------- |
| `sender` **`indexed`** | `address` | -           |
| `value` **`indexed`**  | `uint256` | -           |

## Errors

### CannotTransferOwnershipToSelf

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#cannottransferownershiptoself)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Error signature: `CannotTransferOwnershipToSelf()`
- Error hash: `0x43b248cd`

:::

```solidity
error CannotTransferOwnershipToSelf();
```

reverts when trying to transfer ownership to the address(this)

### ERC725X_ContractDeploymentFailed

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#erc725x_contractdeploymentfailed)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Error signature: `ERC725X_ContractDeploymentFailed()`
- Error hash: `0x0b07489b`

:::

```solidity
error ERC725X_ContractDeploymentFailed();
```

reverts when contract deployment via `ERC725X.execute(...)`/`ERC725X.executeBatch(...)` failed. whether using operation type 1 (CREATE) or 2 (CREATE2).

### ERC725X_CreateOperationsRequireEmptyRecipientAddress

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#erc725x_createoperationsrequireemptyrecipientaddress)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Error signature: `ERC725X_CreateOperationsRequireEmptyRecipientAddress()`
- Error hash: `0x3041824a`

:::

```solidity
error ERC725X_CreateOperationsRequireEmptyRecipientAddress();
```

reverts when passing a `to` address while deploying a contract va `ERC725X.execute(...)`/`ERC725X.executeBatch(...)` whether using operation type 1 (CREATE) or 2 (CREATE2).

### ERC725X_ExecuteParametersEmptyArray

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#erc725x_executeparametersemptyarray)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Error signature: `ERC725X_ExecuteParametersEmptyArray()`
- Error hash: `0xe9ad2b5f`

:::

```solidity
error ERC725X_ExecuteParametersEmptyArray();
```

reverts when one of the array parameter provided to `executeBatch(uint256[],address[],uint256[],bytes[]) is an empty array

### ERC725X_ExecuteParametersLengthMismatch

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#erc725x_executeparameterslengthmismatch)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Error signature: `ERC725X_ExecuteParametersLengthMismatch()`
- Error hash: `0x3ff55f4d`

:::

```solidity
error ERC725X_ExecuteParametersLengthMismatch();
```

reverts when there is not the same number of operation, to addresses, value, and data.

### ERC725X_InsufficientBalance

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#erc725x_insufficientbalance)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Error signature: `ERC725X_InsufficientBalance(uint256,uint256)`
- Error hash: `0x0df9a8f8`

:::

```solidity
error ERC725X_InsufficientBalance(uint256 balance, uint256 value);
```

reverts when trying to send more native tokens `value` than available in current `balance`.

#### Parameters

| Name      |   Type    | Description                                                                              |
| --------- | :-------: | ---------------------------------------------------------------------------------------- |
| `balance` | `uint256` | the balance of the ERC725X contract.                                                     |
| `value`   | `uint256` | the amount of native tokens sent via `ERC725X.execute(...)`/`ERC725X.executeBatch(...)`. |

### ERC725X_MsgValueDisallowedInDelegateCall

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#erc725x_msgvaluedisallowedindelegatecall)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Error signature: `ERC725X_MsgValueDisallowedInDelegateCall()`
- Error hash: `0x5ac83135`

:::

```solidity
error ERC725X_MsgValueDisallowedInDelegateCall();
```

the `value` parameter (= sending native tokens) is not allowed when making a delegatecall via `ERC725X.execute(...)`/`ERC725X.executeBatch(...)` because msg.value is persisting.

### ERC725X_MsgValueDisallowedInStaticCall

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#erc725x_msgvaluedisallowedinstaticcall)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Error signature: `ERC725X_MsgValueDisallowedInStaticCall()`
- Error hash: `0x72f2bc6a`

:::

```solidity
error ERC725X_MsgValueDisallowedInStaticCall();
```

the `value` parameter (= sending native tokens) is not allowed when making a staticcall via `ERC725X.execute(...)`/`ERC725X.executeBatch(...)` because sending native tokens is a state changing operation.

### ERC725X_NoContractBytecodeProvided

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#erc725x_nocontractbytecodeprovided)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Error signature: `ERC725X_NoContractBytecodeProvided()`
- Error hash: `0xb81cd8d9`

:::

```solidity
error ERC725X_NoContractBytecodeProvided();
```

reverts when no contract bytecode was provided as parameter when trying to deploy a contract via `ERC725X.execute(...)`/`ERC725X.executeBatch(...)`, whether using operation type 1 (CREATE) or 2 (CREATE2).

### ERC725X_UnknownOperationType

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#erc725x_unknownoperationtype)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Error signature: `ERC725X_UnknownOperationType(uint256)`
- Error hash: `0x7583b3bc`

:::

```solidity
error ERC725X_UnknownOperationType(uint256 operationTypeProvided);
```

reverts when the `operationTypeProvided` is none of the default operation types available. (CALL = 0; CREATE = 1; CREATE2 = 2; STATICCALL = 3; DELEGATECALL = 4)

#### Parameters

| Name                    |   Type    | Description |
| ----------------------- | :-------: | ----------- |
| `operationTypeProvided` | `uint256` | -           |

### ERC725Y_DataKeysValuesLengthMismatch

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#erc725y_datakeysvalueslengthmismatch)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Error signature: `ERC725Y_DataKeysValuesLengthMismatch()`
- Error hash: `0x3bcc8979`

:::

```solidity
error ERC725Y_DataKeysValuesLengthMismatch();
```

reverts when there is not the same number of elements in the lists of data keys and data values when calling setDataBatch.

### LSP20CallingVerifierFailed

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#lsp20callingverifierfailed)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Error signature: `LSP20CallingVerifierFailed(bool)`
- Error hash: `0x8c6a8ae3`

:::

```solidity
error LSP20CallingVerifierFailed(bool postCall);
```

reverts when the call to the owner fail with no revert reason

#### Parameters

| Name       |  Type  | Description                                          |
| ---------- | :----: | ---------------------------------------------------- |
| `postCall` | `bool` | True if the execution call was done, False otherwise |

### LSP20InvalidMagicValue

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#lsp20invalidmagicvalue)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Error signature: `LSP20InvalidMagicValue(bool,bytes)`
- Error hash: `0xd088ec40`

:::

```solidity
error LSP20InvalidMagicValue(bool postCall, bytes returnedData);
```

reverts when the call to the owner does not return the magic value

#### Parameters

| Name           |  Type   | Description                                          |
| -------------- | :-----: | ---------------------------------------------------- |
| `postCall`     | `bool`  | True if the execution call was done, False otherwise |
| `returnedData` | `bytes` | The data returned by the call to the logic verifier  |

### NoExtensionFoundForFunctionSelector

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#noextensionfoundforfunctionselector)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Error signature: `NoExtensionFoundForFunctionSelector(bytes4)`
- Error hash: `0xbb370b2b`

:::

```solidity
error NoExtensionFoundForFunctionSelector(bytes4 functionSelector);
```

reverts when there is no extension for the function selector being called with

#### Parameters

| Name               |   Type   | Description |
| ------------------ | :------: | ----------- |
| `functionSelector` | `bytes4` | -           |

### NotInRenounceOwnershipInterval

:::note Links

- Specification details in [**UniversalProfile**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md#notinrenounceownershipinterval)
- Solidity implementation in [**UniversalProfile**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)
- Error signature: `NotInRenounceOwnershipInterval(uint256,uint256)`
- Error hash: `0x8b9bf507`

:::

```solidity
error NotInRenounceOwnershipInterval(
  uint256 renounceOwnershipStart,
  uint256 renounceOwnershipEnd
);
```

reverts when trying to renounce ownership before the initial confirmation delay

#### Parameters

| Name                     |   Type    | Description |
| ------------------------ | :-------: | ----------- |
| `renounceOwnershipStart` | `uint256` | -           |
| `renounceOwnershipEnd`   | `uint256` | -           |
