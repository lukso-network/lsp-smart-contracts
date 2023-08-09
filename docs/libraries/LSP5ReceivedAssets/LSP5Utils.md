<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP5Utils

:::info Standard Specifications

[`LSP-5-ReceivedAssets`](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-5-ReceivedAssets.md)

:::
:::info Solidity implementation

[`LSP5Utils.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP5ReceivedAssets/LSP5Utils.sol)

:::

> LSP5 Utility library.

LSP5Utils is a library of functions that can be used to register and manage assets under an ERC725Y smart contract. Based on the LSP5 Received Assets standard.

## Internal Methods

Any method labeled as `internal` serves as utility function within the contract. They can be used when writing solidity contracts that inherit from this contract. These methods can be extended or modified by overriding their internal behavior to suit specific needs.

Internal functions cannot be called externally, whether from other smart contracts, dApp interfaces, or backend services. Their restricted accessibility ensures that they remain exclusively available within the context of the current contract, promoting controlled and encapsulated usage of these internal utilities.

### generateReceivedAssetKeys

```solidity
function generateReceivedAssetKeys(
  address receiver,
  address asset,
  bytes32 assetMapKey,
  bytes4 interfaceID
) internal view returns (bytes32[] keys, bytes[] values);
```

Generate an array of data key/value pairs to be set on the receiver address after receiving assets.

#### Parameters

| Name          |   Type    | Description                                                                                                                  |
| ------------- | :-------: | ---------------------------------------------------------------------------------------------------------------------------- |
| `receiver`    | `address` | The address receiving the asset and where the LSP5 data keys should be added.                                                |
| `asset`       | `address` | @param assetMapKey The `LSP5ReceivedAssetMap:<asset>` data key of the asset being received containing the interfaceId of the |
| `assetMapKey` | `bytes32` | The `LSP5ReceivedAssetMap:<asset>` data key of the asset being received containing the interfaceId of the                    |
| `interfaceID` | `bytes4`  | The interfaceID of the asset being received.                                                                                 |

#### Returns

| Name     |    Type     | Description                                                                                                                       |
| -------- | :---------: | --------------------------------------------------------------------------------------------------------------------------------- |
| `keys`   | `bytes32[]` | An array of 3 x data keys: `LSP5ReceivedAssets[]`, `LSP5ReceivedAssets[index]` and `LSP5ReceivedAssetsMap:<asset>`.               |
| `values` |  `bytes[]`  | An array of 3 x data values: the new length of `LSP5ReceivedAssets[]`, the address of the asset under `LSP5ReceivedAssets[index]` |

<br/>

### generateSentAssetKeys

```solidity
function generateSentAssetKeys(
  address sender,
  bytes32 assetMapKey,
  uint128 assetIndex
) internal view returns (bytes32[] keys, bytes[] values);
```

Generate an array of data key/value pairs to be set on the sender address after sending assets.

#### Parameters

| Name          |   Type    | Description                                                                                           |
| ------------- | :-------: | ----------------------------------------------------------------------------------------------------- |
| `sender`      | `address` | The address sending the asset and where the LSP5 data keys should be updated.                         |
| `assetMapKey` | `bytes32` | The `LSP5ReceivedAssetMap:<asset>` data key of the asset being sent containing the interfaceId of the |
| `assetIndex`  | `uint128` | The index at which the asset is stored under the `LSP5ReceivedAssets[]` Array.                        |

#### Returns

| Name     |    Type     | Description                                                                                                                       |
| -------- | :---------: | --------------------------------------------------------------------------------------------------------------------------------- |
| `keys`   | `bytes32[]` | An array of 3 x data keys: `LSP5ReceivedAssets[]`, `LSP5ReceivedAssets[index]` and `LSP5ReceivedAssetsMap:<asset>`.               |
| `values` |  `bytes[]`  | An array of 3 x data values: the new length of `LSP5ReceivedAssets[]`, the address of the asset under `LSP5ReceivedAssets[index]` |

<br/>

### getLSP5ReceivedAssetsCount

:::info

This function does not return a number but the raw bytes stored under the `LSP5ReceivedAssets[]` Array data key.

:::

```solidity
function getLSP5ReceivedAssetsCount(contract IERC725Y account) internal view returns (bytes);
```

Get the total number of asset addresses stored under the `LSP5ReceivedAssets[]` Array data key.

#### Parameters

| Name      |        Type         | Description                                          |
| --------- | :-----------------: | ---------------------------------------------------- |
| `account` | `contract IERC725Y` | The ERC725Y smart contract to read the storage from. |

#### Returns

| Name |  Type   | Description                                                     |
| ---- | :-----: | --------------------------------------------------------------- |
| `0`  | `bytes` | The raw bytes stored under the `LSP5ReceivedAssets[]` data key. |

<br/>

## Errors

### InvalidLSP5ReceivedAssetsArrayLength

:::note References

- Specification details: [**LSP-5-ReceivedAssets**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-5-ReceivedAssets.md#,))
- Solidity implementation: [`LSP5Utils.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP5ReceivedAssets/LSP5Utils.sol)
- Error signature: `,)`
- Error hash: `0x9f47dbd3`

:::

```solidity
InvalidLSP5ReceivedAssetsArrayLength(bytes,uint256);
```

Reverts when the value stored under the 'LSP5ReceivedAssets[]' Array data key is not valid.
The value stored under this data key should be exactly 16 bytes long.
Only possible valid values are:

- any valid uint128 values
  _e.g: `0x00000000000000000000000000000000` (zero), empty array, no assets received._
  _e.g. `0x00000000000000000000000000000005` (non-zero), 5 array elements, 5 assets received._

- `0x` (nothing stored under this data key, equivalent to empty array

#### Parameters

| Name                 |   Type    | Description                                                                                                                      |
| -------------------- | :-------: | -------------------------------------------------------------------------------------------------------------------------------- |
| `invalidValueStored` |  `bytes`  | invalidValueLength The invalid number of bytes stored under the `LSP5ReceivedAssets[]` data key (MUST be exactly 16 bytes long). |
| `invalidValueLength` | `uint256` | The invalid number of bytes stored under the `LSP5ReceivedAssets[]` data key (MUST be exactly 16 bytes long).                    |

<br/>

### MaxLSP5ReceivedAssetsCountReached

:::note References

- Specification details: [**LSP-5-ReceivedAssets**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-5-ReceivedAssets.md#))
- Solidity implementation: [`LSP5Utils.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP5ReceivedAssets/LSP5Utils.sol)
- Error signature: `)`
- Error hash: `0x59d76dc3`

:::

```solidity
MaxLSP5ReceivedAssetsCountReached(address);
```

Reverts when the `LSP5ReceivedAssets[]` Array reaches its maximum limit (`max(uint128)`)

#### Parameters

| Name                 |   Type    | Description                                            |
| -------------------- | :-------: | ------------------------------------------------------ |
| `notRegisteredAsset` | `address` | The address of the asset that could not be registered. |

<br/>

### ReceivedAssetsIndexSuperiorToUint128

:::note References

- Specification details: [**LSP-5-ReceivedAssets**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-5-ReceivedAssets.md#))
- Solidity implementation: [`LSP5Utils.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP5ReceivedAssets/LSP5Utils.sol)
- Error signature: `)`
- Error hash: `0x59d76dc3`

:::

```solidity
ReceivedAssetsIndexSuperiorToUint128(uint256);
```

Reverts when the received assets index is superior to `max(uint128)`

#### Parameters

| Name    |   Type    | Description                |
| ------- | :-------: | -------------------------- |
| `index` | `uint256` | The received assets index. |

<br/>
