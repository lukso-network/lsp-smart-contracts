# LSP9Vault

:::info Soldity contract

[`LSP9Vault.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)

:::

> Implementation of LSP9Vault built on top of ERC725, LSP1UniversalReceiver

Could be owned by a UniversalProfile and able to register received asset with UniversalReceiverDelegateVault

## Methods

### constructor

:::note Links

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#constructor)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)

:::

```solidity
constructor(address newOwner);
```

_Sets the owner of the contract and sets the SupportedStandards:LSP9Vault key_

#### Parameters

| Name       |   Type    | Description               |
| ---------- | :-------: | ------------------------- |
| `newOwner` | `address` | the owner of the contract |

### fallback

:::note Links

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#fallback)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)

:::

```solidity
fallback() external payable;
```

Emits an event when receiving native tokens
Forwards the call to an extension contract (address). This address can be retrieved from
the ERC725Y data key-value store using the data key below (function selector appended to the prefix):
_LSP17_FALLBACK_EXTENSIONS_HANDLER_ + <function-selector>
If there is no extension stored under the data key, return.
The call to the extension is appended with bytes20 (msg.sender) and bytes32 (msg.value).
Returns the return value on success and revert in case of failure.
If the msg.data is shorter than 4 bytes do not check for an extension and return
Executed when:

- the first 4 bytes of the calldata do not match any publicly callable functions from the contract ABI.

- receiving native tokens with some calldata.

### receive

:::note Links

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#receive)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)

:::

```solidity
receive() external payable;
```

Emits an event when receiving native tokens
Executed:

- when receiving some native tokens without any additional data.

- on empty calls to the contract.

### RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY

:::note Links

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#renounce_ownership_confirmation_delay)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
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

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#renounce_ownership_confirmation_period)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
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

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#acceptownership)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
- Function signature: `acceptOwnership()`
- Function selector: `0x79ba5097`

:::

```solidity
function acceptOwnership() external nonpayable;
```

same as ILSP14.acceptOwnership with the additional requirement: Requirements:

- when notifying the previous owner via LSP1, the typeId used MUST be keccak256('LSP9OwnershipTransferred_SenderNotification')

- when notifying the new owner via LSP1, the typeId used MUST be keccak256('LSP9OwnershipTransferred_RecipientNotification')

### batchCalls

:::note Links

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#batchcalls)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
- Function signature: `batchCalls(bytes[])`
- Function selector: `0x6963d438`

:::

```solidity
function batchCalls(bytes[] data) external nonpayable returns (bytes[] results);
```

Receives and executes a batch of function calls on this contract.

#### Parameters

| Name   |   Type    | Description |
| ------ | :-------: | ----------- |
| `data` | `bytes[]` | -           |

#### Returns

| Name      |   Type    | Description |
| --------- | :-------: | ----------- |
| `results` | `bytes[]` | -           |

### execute

:::note Links

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#execute)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
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

Executes any other smart contract. SHOULD only be callable by the owner of the contract set via ERC173 Emits a [`Executed`](#executed) event, when a call is executed under `operationType` 0 and 3 Emits a [`ContractCreated`](#contractcreated) event, when a contract is created under `operationType` 1 and 2 Emits a [`ValueReceived`](#valuereceived) event, when receives native token

#### Parameters

| Name            |   Type    | Description                                                              |
| --------------- | :-------: | ------------------------------------------------------------------------ |
| `operationType` | `uint256` | The operation to execute: CALL = 0 CREATE = 1 CREATE2 = 2 STATICCALL = 3 |
| `target`        | `address` | -                                                                        |
| `value`         | `uint256` | -                                                                        |
| `data`          |  `bytes`  | -                                                                        |

#### Returns

| Name |  Type   | Description |
| ---- | :-----: | ----------- |
| `0`  | `bytes` | -           |

### executeBatch

:::note Links

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#executebatch)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
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

Emits a [`ValueReceived`](#valuereceived) event when receiving native tokens.

#### Parameters

| Name             |    Type     | Description                                                                                                 |
| ---------------- | :---------: | ----------------------------------------------------------------------------------------------------------- |
| `operationsType` | `uint256[]` | The list of operations type used: CALL = 0; CREATE = 1; CREATE2 = 2; STATICCALL = 3; DELEGATECALL = 4       |
| `targets`        | `address[]` | The list of addresses to call. `targets` will be unused if a contract is created (operation types 1 and 2). |
| `values`         | `uint256[]` | The list of native token amounts to transfer (in Wei)                                                       |
| `datas`          |  `bytes[]`  | The list of call data, or the creation bytecode of the contract to deploy                                   |

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `bytes[]` | -           |

### getData

:::note Links

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#getdata)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
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

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#getdatabatch)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
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

### owner

:::note Links

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#owner)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
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

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#pendingowner)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
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

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#renounceownership)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
- Function signature: `renounceOwnership()`
- Function selector: `0x715018a6`

:::

```solidity
function renounceOwnership() external nonpayable;
```

Renounce ownership of the contract in a two step process.

1. the first call will initiate the process of renouncing ownership.

2. the second is used as a confirmation and will leave the contract without an owner.

### setData

:::note Links

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#setdata)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
- Function signature: `setData(bytes32,bytes)`
- Function selector: `0x7f23690c`

:::

```solidity
function setData(bytes32 dataKey, bytes dataValue) external payable;
```

_Sets singular data for a given `dataKey`_

Sets data as bytes in the vault storage for a single key. SHOULD only be callable by the owner of the contract set via ERC173 and the UniversalReceiverDelegate Emits a [`DataChanged`](#datachanged) event.

#### Parameters

| Name        |   Type    | Description                                                                                                                                                                                                                                                                                                           |
| ----------- | :-------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dataKey`   | `bytes32` | The key to retrieve stored value                                                                                                                                                                                                                                                                                      |
| `dataValue` |  `bytes`  | The value to set SHOULD only be callable by the owner of the contract set via ERC173 The function is marked as payable to enable flexibility on child contracts If the function is not intended to receive value, an additional check should be implemented to check that value equal 0. Emits a {DataChanged} event. |

### setDataBatch

:::note Links

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#setdatabatch)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
- Function signature: `setDataBatch(bytes32[],bytes[])`
- Function selector: `0x97902421`

:::

```solidity
function setDataBatch(bytes32[] dataKeys, bytes[] dataValues) external payable;
```

Sets array of data at multiple given `key` SHOULD only be callable by the owner of the contract set via ERC173 and the UniversalReceiverDelegate Emits a [`DataChanged`](#datachanged) event.

#### Parameters

| Name         |    Type     | Description                              |
| ------------ | :---------: | ---------------------------------------- |
| `dataKeys`   | `bytes32[]` | The array of data keys for values to set |
| `dataValues` |  `bytes[]`  | The array of values to set               |

### supportsInterface

:::note Links

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#supportsinterface)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
- Function signature: `supportsInterface(bytes4)`
- Function selector: `0x01ffc9a7`

:::

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool);
```

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

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#transferownership)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
- Function signature: `transferOwnership(address)`
- Function selector: `0xf2fde38b`

:::

```solidity
function transferOwnership(address newOwner) external nonpayable;
```

same as ILSP14.transferOwnership with the additional requirement: Requirements:

- when notifying the new owner via LSP1, the typeId used MUST be keccak256('LSP9OwnershipTransferStarted')

#### Parameters

| Name       |   Type    | Description                   |
| ---------- | :-------: | ----------------------------- |
| `newOwner` | `address` | the address of the new owner. |

### universalReceiver

:::note Links

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#universalreceiver)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
- Function signature: `universalReceiver(bytes32,bytes)`
- Function selector: `0x6bb56a14`

:::

```solidity
function universalReceiver(
  bytes32 typeId,
  bytes receivedData
) external payable returns (bytes returnedValues);
```

_Triggers the UniversalReceiver event when this function gets executed successfully. Forwards the call to the addresses stored in the ERC725Y storage under the LSP1UniversalReceiverDelegate Key and the typeId Key (param) respectively. The call will be discarded if no addresses are set._

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

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#contractcreated)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
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

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#datachanged)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
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

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#executed)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
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

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#ownershiprenounced)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
- Event signature: `OwnershipRenounced()`
- Event hash: `0xd1f66c3d2bc1993a86be5e3d33709d98f0442381befcedd29f578b9b2506b1ce`

:::

```solidity
event OwnershipRenounced();
```

### OwnershipTransferStarted

:::note Links

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#ownershiptransferstarted)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
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

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#ownershiptransferred)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
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

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#renounceownershipstarted)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
- Event signature: `RenounceOwnershipStarted()`
- Event hash: `0x81b7f830f1f0084db6497c486cbe6974c86488dcc4e3738eab94ab6d6b1653e7`

:::

```solidity
event RenounceOwnershipStarted();
```

### UniversalReceiver

:::note Links

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#universalreceiver)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
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

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#valuereceived)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
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

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#cannottransferownershiptoself)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
- Error signature: `CannotTransferOwnershipToSelf()`
- Error hash: `0x43b248cd`

:::

```solidity
error CannotTransferOwnershipToSelf();
```

reverts when trying to transfer ownership to the address(this)

### ERC725X_ContractDeploymentFailed

:::note Links

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#erc725x_contractdeploymentfailed)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
- Error signature: `ERC725X_ContractDeploymentFailed()`
- Error hash: `0x0b07489b`

:::

```solidity
error ERC725X_ContractDeploymentFailed();
```

reverts when contract deployment via `ERC725X.execute(...)`/`ERC725X.executeBatch(...)` failed. whether using operation type 1 (CREATE) or 2 (CREATE2).

### ERC725X_CreateOperationsRequireEmptyRecipientAddress

:::note Links

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#erc725x_createoperationsrequireemptyrecipientaddress)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
- Error signature: `ERC725X_CreateOperationsRequireEmptyRecipientAddress()`
- Error hash: `0x3041824a`

:::

```solidity
error ERC725X_CreateOperationsRequireEmptyRecipientAddress();
```

reverts when passing a `to` address while deploying a contract va `ERC725X.execute(...)`/`ERC725X.executeBatch(...)` whether using operation type 1 (CREATE) or 2 (CREATE2).

### ERC725X_ExecuteParametersEmptyArray

:::note Links

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#erc725x_executeparametersemptyarray)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
- Error signature: `ERC725X_ExecuteParametersEmptyArray()`
- Error hash: `0xe9ad2b5f`

:::

```solidity
error ERC725X_ExecuteParametersEmptyArray();
```

reverts when one of the array parameter provided to `executeBatch(uint256[],address[],uint256[],bytes[]) is an empty array

### ERC725X_ExecuteParametersLengthMismatch

:::note Links

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#erc725x_executeparameterslengthmismatch)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
- Error signature: `ERC725X_ExecuteParametersLengthMismatch()`
- Error hash: `0x3ff55f4d`

:::

```solidity
error ERC725X_ExecuteParametersLengthMismatch();
```

reverts when there is not the same number of operation, to addresses, value, and data.

### ERC725X_InsufficientBalance

:::note Links

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#erc725x_insufficientbalance)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
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

### ERC725X_MsgValueDisallowedInStaticCall

:::note Links

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#erc725x_msgvaluedisallowedinstaticcall)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
- Error signature: `ERC725X_MsgValueDisallowedInStaticCall()`
- Error hash: `0x72f2bc6a`

:::

```solidity
error ERC725X_MsgValueDisallowedInStaticCall();
```

the `value` parameter (= sending native tokens) is not allowed when making a staticcall via `ERC725X.execute(...)`/`ERC725X.executeBatch(...)` because sending native tokens is a state changing operation.

### ERC725X_NoContractBytecodeProvided

:::note Links

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#erc725x_nocontractbytecodeprovided)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
- Error signature: `ERC725X_NoContractBytecodeProvided()`
- Error hash: `0xb81cd8d9`

:::

```solidity
error ERC725X_NoContractBytecodeProvided();
```

reverts when no contract bytecode was provided as parameter when trying to deploy a contract via `ERC725X.execute(...)`/`ERC725X.executeBatch(...)`, whether using operation type 1 (CREATE) or 2 (CREATE2).

### ERC725X_UnknownOperationType

:::note Links

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#erc725x_unknownoperationtype)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
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

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#erc725y_datakeysvalueslengthmismatch)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
- Error signature: `ERC725Y_DataKeysValuesLengthMismatch()`
- Error hash: `0x3bcc8979`

:::

```solidity
error ERC725Y_DataKeysValuesLengthMismatch();
```

reverts when there is not the same number of elements in the lists of data keys and data values when calling setDataBatch.

### ERC725Y_MsgValueDisallowed

:::note Links

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#erc725y_msgvaluedisallowed)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
- Error signature: `ERC725Y_MsgValueDisallowed()`
- Error hash: `0xf36ba737`

:::

```solidity
error ERC725Y_MsgValueDisallowed();
```

reverts when sending value to the `setData(..)` functions

### LSP1DelegateNotAllowedToSetDataKey

:::note Links

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#lsp1delegatenotallowedtosetdatakey)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
- Error signature: `LSP1DelegateNotAllowedToSetDataKey(bytes32)`
- Error hash: `0x199611f1`

:::

```solidity
error LSP1DelegateNotAllowedToSetDataKey(bytes32 dataKey);
```

reverts when the UniversalReceiverDelegates of the Vault sets LSP1/6/17 Data Keys

#### Parameters

| Name      |   Type    | Description                                                           |
| --------- | :-------: | --------------------------------------------------------------------- |
| `dataKey` | `bytes32` | The data key that the UniversalReceiverDelegate is not allowed to set |

### NoExtensionFoundForFunctionSelector

:::note Links

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#noextensionfoundforfunctionselector)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
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

- Specification details in [**LSP-9-Vault**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-9-Vault.md#notinrenounceownershipinterval)
- Solidity implementation in [**LSP9Vault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP9Vault/LSP9Vault.sol)
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
