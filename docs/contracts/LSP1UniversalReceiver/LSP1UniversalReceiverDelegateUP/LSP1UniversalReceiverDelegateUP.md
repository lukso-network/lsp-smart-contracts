<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP1UniversalReceiverDelegateUP

:::info Standard Specifications

[`LSP-1-UniversalReceiver`](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-1-UniversalReceiver.md)

:::
:::info Solidity implementation

[`LSP1UniversalReceiverDelegateUP.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol)

:::

> Implementation of a UniversalReceiverDelegate for the [LSP-0-ERC725Account]

The [`LSP1UniversalReceiverDelegateUP`](#lsp1universalreceiverdelegateup) follows the [LSP-1-UniversalReceiver] standard and is designed for [LSP-0-ERC725Account] contracts. The [`LSP1UniversalReceiverDelegateUP`](#lsp1universalreceiverdelegateup) is a contract called by the [`universalReceiver(...)`](#universalreceiver) function of the [LSP-0-ERC725Account] contract that:

- Writes the data keys representing assets received from type [LSP-7-DigitalAsset] and [LSP-8-IdentifiableDigitalAsset] into the account storage, and removes them when the balance is zero according to the [LSP-5-ReceivedAssets] Standard.

- Writes the data keys representing the owned vaults from type [LSP-9-Vault] into your account storage, and removes them when transferring ownership to other accounts according to the [LSP-10-ReceivedVaults] Standard.

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### supportsInterface

:::note References

- Specification details: [**LSP-1-UniversalReceiver**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-1-UniversalReceiver.md#supportsinterface)
- Solidity implementation: [`LSP1UniversalReceiverDelegateUP.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol)
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
- Solidity implementation: [`LSP1UniversalReceiverDelegateUP.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol)
- Function signature: `universalReceiver(bytes32,)`
- Function selector: `0x534e72c8`

:::

:::caution Warning

When the data stored in the ERC725Y storage of the LSP0 contract is corrupted (\_e.g: ([LSP-5-ReceivedAssets]&#39;s Array length not 16 bytes long, the token received is already registered in `LSP5ReceivetAssets[]`, the token being sent is not sent as full balance, etc...), the function call will still pass and return (**not revert!**) and not modify any data key on the storage of the [LSP-0-ERC725Account].

:::

```solidity
function universalReceiver(
  bytes32 typeId,
  bytes
) external payable returns (bytes result);
```

_Reacted on received notification with `typeId`._

1. Writes the data keys of the received [LSP-7-DigitalAsset], [LSP-8-IdentifiableDigitalAsset] and [LSP-9-Vault] contract addresses into the account storage according to the [LSP-5-ReceivedAssets] and [LSP-10-ReceivedVaults] Standard.

2. The data keys representing an asset/vault are cleared when the asset/vault is no longer owned by the account.

<blockquote>

**Requirements:**

- This contract should be allowed to use the [`setDataBatch(...)`](#setdatabatch) function in order to update the LSP5 and LSP10 Data Keys.
- Cannot accept native tokens

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

## Internal Methods

Any method labeled as `internal` serves as utility function within the contract. They can be used when writing solidity contracts that inherit from this contract. These methods can be extended or modified by overriding their internal behavior to suit specific needs.

Internal functions cannot be called externally, whether from other smart contracts, dApp interfaces, or backend services. Their restricted accessibility ensures that they remain exclusively available within the context of the current contract, promoting controlled and encapsulated usage of these internal utilities.

### \_whenReceiving

```solidity
function _whenReceiving(
  bytes32 typeId,
  address notifier,
  bytes32 notifierMapKey,
  bytes4 interfaceID
) internal nonpayable returns (bytes);
```

To avoid stack too deep error
Generate the keys/values of the asset/vault received to set and set them
on the account depending on the type of the transfer (asset/vault)

<br/>

### \_whenSending

```solidity
function _whenSending(
  bytes32 typeId,
  address notifier,
  bytes32 notifierMapKey,
  uint128 arrayIndex
) internal nonpayable returns (bytes);
```

To avoid stack too deep error
Generate the keys/values of the asset/vault sent to set and set them
on the account depending on the type of the transfer (asset/vault)

<br/>

## Events

### UniversalReceiver

:::note References

- Specification details: [**LSP-1-UniversalReceiver**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-1-UniversalReceiver.md#universalreceiver)
- Solidity implementation: [`LSP1UniversalReceiverDelegateUP.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol)
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
- Solidity implementation: [`LSP1UniversalReceiverDelegateUP.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol)
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

### InvalidLSP10ReceivedVaultsArrayLength

:::note References

- Specification details: [**LSP-1-UniversalReceiver**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-1-UniversalReceiver.md#invalidlsp10receivedvaultsarraylength)
- Solidity implementation: [`LSP1UniversalReceiverDelegateUP.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol)
- Error signature: `InvalidLSP10ReceivedVaultsArrayLength(bytes,uint256)`
- Error hash: `0x12ce1c39`

:::

```solidity
error InvalidLSP10ReceivedVaultsArrayLength(
  bytes invalidValueStored,
  uint256 invalidValueLength
);
```

Reverts when the value stored under the 'LSP10ReceivedVaults[]' Array data key is not valid. The value stored under this data key should be exactly 16 bytes long. Only possible valid values are:

- any valid uint128 values _e.g: `0x00000000000000000000000000000000` (zero), meaning empty array, no vaults received._ _e.g: `0x00000000000000000000000000000005` (non-zero), meaning 5 array elements, 5 vaults received._

- `0x` (nothing stored under this data key, equivalent to empty array).

#### Parameters

| Name                 |   Type    | Description                                                                                                  |
| -------------------- | :-------: | ------------------------------------------------------------------------------------------------------------ |
| `invalidValueStored` |  `bytes`  | The invalid value stored under the `LSP10ReceivedVaults[]` Array data key.                                   |
| `invalidValueLength` | `uint256` | The invalid number of bytes stored under the `LSP10ReceivedVaults[]` Array data key (MUST be 16 bytes long). |

<br/>

### InvalidLSP5ReceivedAssetsArrayLength

:::note References

- Specification details: [**LSP-1-UniversalReceiver**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-1-UniversalReceiver.md#invalidlsp5receivedassetsarraylength)
- Solidity implementation: [`LSP1UniversalReceiverDelegateUP.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol)
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

### MaxLSP10VaultsCountReached

:::note References

- Specification details: [**LSP-1-UniversalReceiver**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-1-UniversalReceiver.md#maxlsp10vaultscountreached)
- Solidity implementation: [`LSP1UniversalReceiverDelegateUP.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol)
- Error signature: `MaxLSP10VaultsCountReached(address)`
- Error hash: `0x11610270`

:::

```solidity
error MaxLSP10VaultsCountReached(address notRegisteredVault);
```

Reverts when the `LSP10Vaults[]` Array reaches its maximum limit (`max(uint128)`).

#### Parameters

| Name                 |   Type    | Description                                                |
| -------------------- | :-------: | ---------------------------------------------------------- |
| `notRegisteredVault` | `address` | The address of the LSP9Vault that could not be registered. |

<br/>

### MaxLSP5ReceivedAssetsCountReached

:::note References

- Specification details: [**LSP-1-UniversalReceiver**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-1-UniversalReceiver.md#maxlsp5receivedassetscountreached)
- Solidity implementation: [`LSP1UniversalReceiverDelegateUP.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol)
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
- Solidity implementation: [`LSP1UniversalReceiverDelegateUP.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol)
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
- Solidity implementation: [`LSP1UniversalReceiverDelegateUP.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol)
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

### VaultIndexSuperiorToUint128

:::note References

- Specification details: [**LSP-1-UniversalReceiver**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-1-UniversalReceiver.md#vaultindexsuperiortouint128)
- Solidity implementation: [`LSP1UniversalReceiverDelegateUP.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol)
- Error signature: `VaultIndexSuperiorToUint128(uint256)`
- Error hash: `0x76f9db1b`

:::

```solidity
error VaultIndexSuperiorToUint128(uint256 index);
```

Reverts when the vault index is superior to `max(uint128)`.

#### Parameters

| Name    |   Type    | Description      |
| ------- | :-------: | ---------------- |
| `index` | `uint256` | The vault index. |

<br/>
