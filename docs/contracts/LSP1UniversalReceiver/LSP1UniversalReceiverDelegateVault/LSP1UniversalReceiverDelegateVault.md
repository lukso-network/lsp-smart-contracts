<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP1UniversalReceiverDelegateVault

:::info Standard Specifications

[`LSP-1-UniversalReceiver`](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-1-UniversalReceiver.md)

:::
:::info Solidity implementation

[`LSP1UniversalReceiverDelegateVault.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateVault/LSP1UniversalReceiverDelegateVault.sol)

:::

> Implementation of a UniversalReceiverDelegate for the [LSP9Vault]

The [`LSP1UniversalReceiverDelegateVault`](#lsp1universalreceiverdelegatevault) follows the [LSP-1-UniversalReceiver] standard and is designed for [LSP9Vault] contracts. The [`LSP1UniversalReceiverDelegateVault`](#lsp1universalreceiverdelegatevault) is a contract called by the [`universalReceiver(...)`](#universalreceiver) function of the [LSP-9-Vault] contract that:

- Writes the data keys representing assets received from type [LSP-7-DigitalAsset] and [LSP-8-IdentifiableDigitalAsset] into the account storage, and removes them when the balance is zero according to the [LSP-5-ReceivedAssets] Standard.

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### supportsInterface

:::note References

- Specification details: [**LSP-1-UniversalReceiver**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-1-UniversalReceiver.md#supportsinterface)
- Solidity implementation: [`LSP1UniversalReceiverDelegateVault.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateVault/LSP1UniversalReceiverDelegateVault.sol)
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

### universalReceiver

:::note References

- Specification details: [**LSP-1-UniversalReceiver**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-1-UniversalReceiver.md#universalreceiver)
- Solidity implementation: [`LSP1UniversalReceiverDelegateVault.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateVault/LSP1UniversalReceiverDelegateVault.sol)
- Function signature: `universalReceiver(bytes32,)`
- Function selector: `0x534e72c8`

:::

:::info

- If some issues occured with generating the `dataKeys` or `dataValues` the `returnedMessage` will be an error message, otherwise it will be empty.
- If an error occured when trying to use `setDataBatch(dataKeys,dataValues)`, it will return the raw error data back to the caller.

:::

```solidity
function universalReceiver(
  bytes32 typeId,
  bytes
) external payable returns (bytes);
```

_Reacted on received notification with `typeId`._

Handles two cases: Writes the received [LSP-7-DigitalAsset] or [LSP-8-IdentifiableDigitalAsset] assets into the vault storage according to the [LSP-5-ReceivedAssets] standard.

<blockquote>

**Requirements:**

- Cannot accept native tokens.

</blockquote>

#### Parameters

| Name     |   Type    | Description                                    |
| -------- | :-------: | ---------------------------------------------- |
| `typeId` | `bytes32` | Unique identifier for a specific notification. |
| `_1`     |  `bytes`  | -                                              |

#### Returns

| Name |  Type   | Description                              |
| ---- | :-----: | ---------------------------------------- |
| `0`  | `bytes` | The result of the reaction for `typeId`. |

<br/>

## Internal Methods

Any method labeled as `internal` serves as utility function within the contract. They can be used when writing solidity contracts that inherit from this contract. These methods can be extended or modified by overriding their internal behavior to suit specific needs.

Internal functions cannot be called externally, whether from other smart contracts, dApp interfaces, or backend services. Their restricted accessibility ensures that they remain exclusively available within the context of the current contract, promoting controlled and encapsulated usage of these internal utilities.

### \_tokenSender

```solidity
function _tokenSender(address notifier) internal nonpayable returns (bytes);
```

Handler for LSP7 and LSP8 token sender type id.

#### Parameters

| Name       |   Type    | Description                     |
| ---------- | :-------: | ------------------------------- |
| `notifier` | `address` | The LSP7 or LSP8 token address. |

<br/>

### \_tokenRecipient

```solidity
function _tokenRecipient(
  address notifier,
  bytes4 interfaceId
) internal nonpayable returns (bytes);
```

Handler for LSP7 and LSP8 token recipient type id.

#### Parameters

| Name          |   Type    | Description                     |
| ------------- | :-------: | ------------------------------- |
| `notifier`    | `address` | The LSP7 or LSP8 token address. |
| `interfaceId` | `bytes4`  | The LSP7 or LSP8 interface id.  |

<br/>

### \_setDataBatchWithoutReverting

:::info

If an the low-level transaction revert, the returned data will be forwarded. Th contract that uses this function can use the `Address` library to revert with the revert reason.

:::

```solidity
function _setDataBatchWithoutReverting(
  bytes32[] dataKeys,
  bytes[] dataValues
) internal nonpayable returns (bytes);
```

Calls `bytes4(keccak256(setDataBatch(bytes32[],bytes[])))` without checking for `bool succes`, but it returns all the data back.

#### Parameters

| Name         |    Type     | Description            |
| ------------ | :---------: | ---------------------- |
| `dataKeys`   | `bytes32[]` | Data Keys to be set.   |
| `dataValues` |  `bytes[]`  | Data Values to be set. |

<br/>

## Events

### UniversalReceiver

:::note References

- Specification details: [**LSP-1-UniversalReceiver**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-1-UniversalReceiver.md#universalreceiver)
- Solidity implementation: [`LSP1UniversalReceiverDelegateVault.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateVault/LSP1UniversalReceiverDelegateVault.sol)
- Event signature: `UniversalReceiver(address,uint256,bytes32,bytes,bytes)`
- Event topic hash: `0x9c3ba68eb5742b8e3961aea0afc7371a71bf433c8a67a831803b64c064a178c2`

:::

```solidity
event UniversalReceiver(address indexed from, uint256 indexed value, bytes32 indexed typeId, bytes receivedData, bytes returnedValue);
```

\*Address `from` called the `universalReceiver(...)` function while sending `value` LYX. Notification type (typeId): `typeId`

- Data received: `receivedData`.\*

Emitted when the [`universalReceiver`](#universalreceiver) function was called with a specific `typeId` and some `receivedData` s

#### Parameters

| Name                   |   Type    | Description                                                                                                                                                                             |
| ---------------------- | :-------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `from` **`indexed`**   | `address` | The address of the EOA or smart contract that called the {universalReceiver(...)} function.                                                                                             |
| `value` **`indexed`**  | `uint256` | The amount sent to the {universalReceiver(...)} function.                                                                                                                               |
| `typeId` **`indexed`** | `bytes32` | A `bytes32` unique identifier (= _"hook"_)that describe the type of notification, information or transaction received by the contract. Can be related to a specific standard or a hook. |
| `receivedData`         |  `bytes`  | Any arbitrary data that was sent to the {universalReceiver(...)} function.                                                                                                              |
| `returnedValue`        |  `bytes`  | The value returned by the {universalReceiver(...)} function.                                                                                                                            |

<br/>

## Errors

### CannotRegisterEOAsAsAssets

:::note References

- Specification details: [**LSP-1-UniversalReceiver**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-1-UniversalReceiver.md#cannotregistereoasasassets)
- Solidity implementation: [`LSP1UniversalReceiverDelegateVault.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateVault/LSP1UniversalReceiverDelegateVault.sol)
- Error signature: `CannotRegisterEOAsAsAssets(address)`
- Error hash: `0xa5295345`

:::

```solidity
error CannotRegisterEOAsAsAssets(address caller);
```

_EOA: `caller` cannot be registered as an asset._

Reverts when EOA calls the [`universalReceiver(..)`](#universalreceiver) function with an asset/vault typeId.

#### Parameters

| Name     |   Type    | Description            |
| -------- | :-------: | ---------------------- |
| `caller` | `address` | The address of the EOA |

<br/>

### NativeTokensNotAccepted

:::note References

- Specification details: [**LSP-1-UniversalReceiver**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-1-UniversalReceiver.md#nativetokensnotaccepted)
- Solidity implementation: [`LSP1UniversalReceiverDelegateVault.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateVault/LSP1UniversalReceiverDelegateVault.sol)
- Error signature: `NativeTokensNotAccepted()`
- Error hash: `0x114b721a`

:::

```solidity
error NativeTokensNotAccepted();
```

_Cannot send native tokens to [`universalReceiver(...)`](#universalreceiver) function of the delegated contract._

Reverts when the [`universalReceiver`](#universalreceiver) function in the LSP1 Universal Receiver Delegate contract is called while sending some native tokens along the call (`msg.value` different than `0`)

<br/>
