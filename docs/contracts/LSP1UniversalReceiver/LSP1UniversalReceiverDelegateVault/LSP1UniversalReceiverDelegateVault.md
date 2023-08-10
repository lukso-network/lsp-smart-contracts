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

```solidity
function universalReceiver(
  bytes32 typeId,
  bytes
) external payable returns (bytes result);
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

| Name     |  Type   | Description                              |
| -------- | :-----: | ---------------------------------------- |
| `result` | `bytes` | The result of the reaction for `typeId`. |

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

### InvalidLSP5ReceivedAssetsArrayLength

:::note References

- Specification details: [**LSP-1-UniversalReceiver**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-1-UniversalReceiver.md#invalidlsp5receivedassetsarraylength)
- Solidity implementation: [`LSP1UniversalReceiverDelegateVault.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateVault/LSP1UniversalReceiverDelegateVault.sol)
- Error signature: `InvalidLSP5ReceivedAssetsArrayLength(bytes,uint256)`
- Error hash: `0xecba7af8`

:::

```solidity
error InvalidLSP5ReceivedAssetsArrayLength(
  bytes invalidValueStored,
  uint256 invalidValueLength
);
```

Reverts when the value stored under the 'LSP5ReceivedAssets[]' Array data key is not valid. The value stored under this data key should be exactly 16 bytes long. Only possible valid values are:

- any valid uint128 values _e.g: `0x00000000000000000000000000000000` (zero), empty array, no assets received._ _e.g. `0x00000000000000000000000000000005` (non-zero), 5 array elements, 5 assets received._

- `0x` (nothing stored under this data key, equivalent to empty array)

#### Parameters

| Name                 |   Type    | Description                                                                                                   |
| -------------------- | :-------: | ------------------------------------------------------------------------------------------------------------- |
| `invalidValueStored` |  `bytes`  | The invalid value stored under the `LSP5ReceivedAssets[]` Array data key.                                     |
| `invalidValueLength` | `uint256` | The invalid number of bytes stored under the `LSP5ReceivedAssets[]` data key (MUST be exactly 16 bytes long). |

<br/>

### MaxLSP5ReceivedAssetsCountReached

:::note References

- Specification details: [**LSP-1-UniversalReceiver**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-1-UniversalReceiver.md#maxlsp5receivedassetscountreached)
- Solidity implementation: [`LSP1UniversalReceiverDelegateVault.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateVault/LSP1UniversalReceiverDelegateVault.sol)
- Error signature: `MaxLSP5ReceivedAssetsCountReached(address)`
- Error hash: `0x0b51a2d0`

:::

```solidity
error MaxLSP5ReceivedAssetsCountReached(address notRegisteredAsset);
```

Reverts when the `LSP5ReceivedAssets[]` Array reaches its maximum limit (`max(uint128)`).

#### Parameters

| Name                 |   Type    | Description                                            |
| -------------------- | :-------: | ------------------------------------------------------ |
| `notRegisteredAsset` | `address` | The address of the asset that could not be registered. |

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

### ReceivedAssetsIndexSuperiorToUint128

:::note References

- Specification details: [**LSP-1-UniversalReceiver**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-1-UniversalReceiver.md#receivedassetsindexsuperiortouint128)
- Solidity implementation: [`LSP1UniversalReceiverDelegateVault.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateVault/LSP1UniversalReceiverDelegateVault.sol)
- Error signature: `ReceivedAssetsIndexSuperiorToUint128(uint256)`
- Error hash: `0xe8a4fba0`

:::

```solidity
error ReceivedAssetsIndexSuperiorToUint128(uint256 index);
```

Reverts when the received assets index is superior to `max(uint128)`.

#### Parameters

| Name    |   Type    | Description                |
| ------- | :-------: | -------------------------- |
| `index` | `uint256` | The received assets index. |

<br/>
