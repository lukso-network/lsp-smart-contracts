# LSP1UniversalReceiverDelegateVault

:::info Soldity contract

[`LSP1UniversalReceiverDelegateVault.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateVault/LSP1UniversalReceiverDelegateVault.sol)

:::

> Core Implementation of contract writing the received LSP7 and LSP8 assets into your Vault using the LSP5-ReceivedAsset standard and removing the sent assets.

Delegate contract of the initial universal receiver

## Methods

### supportsInterface

:::note Links

- Specification details in [**LSP-1-UniversalReceiver**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-1-UniversalReceiver.md#supportsinterface)
- Solidity implementation in [**LSP1UniversalReceiverDelegateVault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateVault/LSP1UniversalReceiverDelegateVault.sol)
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

### universalReceiver

:::note Links

- Specification details in [**LSP-1-UniversalReceiver**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-1-UniversalReceiver.md#universalreceiver)
- Solidity implementation in [**LSP1UniversalReceiverDelegateVault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateVault/LSP1UniversalReceiverDelegateVault.sol)
- Function signature: `universalReceiver(bytes32,)`
- Function selector: `0x534e72c8`

:::

```solidity
function universalReceiver(
  bytes32 typeId,
  bytes
) external payable returns (bytes result);
```

allows to register arrayKeys and Map of incoming assets and remove after being sent

#### Parameters

| Name     |   Type    | Description                               |
| -------- | :-------: | ----------------------------------------- |
| `typeId` | `bytes32` | The hash of a specific standard or a hook |
| `_1`     |  `bytes`  | -                                         |

#### Returns

| Name     |  Type   | Description      |
| -------- | :-----: | ---------------- |
| `result` | `bytes` | The return value |

## Events

### UniversalReceiver

:::note Links

- Specification details in [**LSP-1-UniversalReceiver**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-1-UniversalReceiver.md#universalreceiver)
- Solidity implementation in [**LSP1UniversalReceiverDelegateVault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateVault/LSP1UniversalReceiverDelegateVault.sol)
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

## Errors

### CannotRegisterEOAsAsAssets

:::note Links

- Specification details in [**LSP-1-UniversalReceiver**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-1-UniversalReceiver.md#cannotregistereoasasassets)
- Solidity implementation in [**LSP1UniversalReceiverDelegateVault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateVault/LSP1UniversalReceiverDelegateVault.sol)
- Error signature: `CannotRegisterEOAsAsAssets(address)`
- Error hash: `0xa5295345`

:::

```solidity
error CannotRegisterEOAsAsAssets(address caller);
```

reverts when EOA calls the `universalReceiver(..)` function with an asset/vault typeId

#### Parameters

| Name     |   Type    | Description            |
| -------- | :-------: | ---------------------- |
| `caller` | `address` | The address of the EOA |

### InvalidLSP5ReceivedAssetsArrayLength

:::note Links

- Specification details in [**LSP-1-UniversalReceiver**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-1-UniversalReceiver.md#invalidlsp5receivedassetsarraylength)
- Solidity implementation in [**LSP1UniversalReceiverDelegateVault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateVault/LSP1UniversalReceiverDelegateVault.sol)
- Error signature: `InvalidLSP5ReceivedAssetsArrayLength(bytes,uint256)`
- Error hash: `0xecba7af8`

:::

```solidity
error InvalidLSP5ReceivedAssetsArrayLength(
  bytes invalidValueStored,
  uint256 invalidValueLength
);
```

reverts when the value stored under the 'LSP5ReceivedAssets[]' data key is not valid. The value stored under this data key should be exactly 16 bytes long. Only possible valid values are:

- any valid uint128 values i.e. 0x00000000000000000000000000000000 (zero), empty array, no assets received. i.e. 0x00000000000000000000000000000005 (non-zero), 5 array elements, 5 assets received.

- 0x (nothing stored under this data key, equivalent to empty array)

#### Parameters

| Name                 |   Type    | Description                                                                                                |
| -------------------- | :-------: | ---------------------------------------------------------------------------------------------------------- |
| `invalidValueStored` |  `bytes`  | the invalid value stored under the LSP5ReceivedAssets[] data key                                           |
| `invalidValueLength` | `uint256` | the invalid number of bytes stored under the LSP5ReceivedAssets[] data key (MUST be exactly 16 bytes long) |

### MaxLSP5ReceivedAssetsCountReached

:::note Links

- Specification details in [**LSP-1-UniversalReceiver**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-1-UniversalReceiver.md#maxlsp5receivedassetscountreached)
- Solidity implementation in [**LSP1UniversalReceiverDelegateVault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateVault/LSP1UniversalReceiverDelegateVault.sol)
- Error signature: `MaxLSP5ReceivedAssetsCountReached(address)`
- Error hash: `0x0b51a2d0`

:::

```solidity
error MaxLSP5ReceivedAssetsCountReached(address notRegisteredAsset);
```

reverts when the `LSP5ReceivedAssets[]` array reaches its maximum limit (max(uint128))

#### Parameters

| Name                 |   Type    | Description                                           |
| -------------------- | :-------: | ----------------------------------------------------- |
| `notRegisteredAsset` | `address` | the address of the asset that could not be registered |

### NativeTokensNotAccepted

:::note Links

- Specification details in [**LSP-1-UniversalReceiver**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-1-UniversalReceiver.md#nativetokensnotaccepted)
- Solidity implementation in [**LSP1UniversalReceiverDelegateVault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateVault/LSP1UniversalReceiverDelegateVault.sol)
- Error signature: `NativeTokensNotAccepted()`
- Error hash: `0x114b721a`

:::

```solidity
error NativeTokensNotAccepted();
```

reverts when `universalReceiver(...)` is called with a value different than 0

### ReceivedAssetsIndexSuperiorToUint128

:::note Links

- Specification details in [**LSP-1-UniversalReceiver**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-1-UniversalReceiver.md#receivedassetsindexsuperiortouint128)
- Solidity implementation in [**LSP1UniversalReceiverDelegateVault**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateVault/LSP1UniversalReceiverDelegateVault.sol)
- Error signature: `ReceivedAssetsIndexSuperiorToUint128(uint256)`
- Error hash: `0xe8a4fba0`

:::

```solidity
error ReceivedAssetsIndexSuperiorToUint128(uint256 index);
```

reverts when the received assets index is superior to uint128

#### Parameters

| Name    |   Type    | Description               |
| ------- | :-------: | ------------------------- |
| `index` | `uint256` | the received assets index |
