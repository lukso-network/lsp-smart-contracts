<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP5Utils

:::info Standard Specifications

[`LSP-5-ReceivedAssets`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-5-ReceivedAssets.md)

:::
:::info Solidity implementation

[`LSP5Utils.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp5-contracts/contracts/LSP5Utils.sol)

:::

> LSP5 Utility library.

LSP5Utils is a library of functions that can be used to register and manage assets under an ERC725Y smart contract. Based on the LSP5 Received Assets standard.

## Internal Methods

Any method labeled as `internal` serves as utility function within the contract. They can be used when writing solidity contracts that inherit from this contract. These methods can be extended or modified by overriding their internal behavior to suit specific needs.

Internal functions cannot be called externally, whether from other smart contracts, dApp interfaces, or backend services. Their restricted accessibility ensures that they remain exclusively available within the context of the current contract, promoting controlled and encapsulated usage of these internal utilities.

### generateReceivedAssetKeys

:::caution Warning

Returns empty arrays when encountering errors. Otherwise the arrays must have 3 data keys and 3 data values.

:::

```solidity
function generateReceivedAssetKeys(
  address receiver,
  address assetAddress,
  bytes4 assetInterfaceId
) internal view returns (bytes32[] lsp5DataKeys, bytes[] lsp5DataValues);
```

Generate an array of data key/value pairs to be set on the receiver address after receiving assets.

#### Parameters

| Name               |   Type    | Description                                                                   |
| ------------------ | :-------: | ----------------------------------------------------------------------------- |
| `receiver`         | `address` | The address receiving the asset and where the LSP5 data keys should be added. |
| `assetAddress`     | `address` | The address of the asset being received (_e.g: an LSP7 or LSP8 token_).       |
| `assetInterfaceId` | `bytes4`  | The interfaceID of the asset being received.                                  |

#### Returns

| Name             |    Type     | Description                                                          |
| ---------------- | :---------: | -------------------------------------------------------------------- |
| `lsp5DataKeys`   | `bytes32[]` | An array Data Keys used to update the [LSP-5-ReceivedAssets] data.   |
| `lsp5DataValues` |  `bytes[]`  | An array Data Values used to update the [LSP-5-ReceivedAssets] data. |

<br/>

### generateSentAssetKeys

:::caution Warning

Returns empty arrays when encountering errors. Otherwise the arrays must have at least 3 data keys and 3 data values.

:::

```solidity
function generateSentAssetKeys(
  address sender,
  address assetAddress
) internal view returns (bytes32[] lsp5DataKeys, bytes[] lsp5DataValues);
```

Generate an array of Data Key/Value pairs to be set on the sender address after sending assets.

#### Parameters

| Name           |   Type    | Description                                                                   |
| -------------- | :-------: | ----------------------------------------------------------------------------- |
| `sender`       | `address` | The address sending the asset and where the LSP5 data keys should be updated. |
| `assetAddress` | `address` | The address of the asset that is being sent.                                  |

#### Returns

| Name             |    Type     | Description                                                          |
| ---------------- | :---------: | -------------------------------------------------------------------- |
| `lsp5DataKeys`   | `bytes32[]` | An array Data Keys used to update the [LSP-5-ReceivedAssets] data.   |
| `lsp5DataValues` |  `bytes[]`  | An array Data Values used to update the [LSP-5-ReceivedAssets] data. |

<br/>

### getLSP5ArrayLengthBytes

```solidity
function getLSP5ArrayLengthBytes(contract IERC725Y erc725YContract) internal view returns (bytes);
```

Get the raw bytes value stored under the `_LSP5_RECEIVED_ASSETS_ARRAY_KEY`.

#### Parameters

| Name              |        Type         | Description                                     |
| ----------------- | :-----------------: | ----------------------------------------------- |
| `erc725YContract` | `contract IERC725Y` | The contract to query the ERC725Y storage from. |

#### Returns

| Name |  Type   | Description                                     |
| ---- | :-----: | ----------------------------------------------- |
| `0`  | `bytes` | The raw bytes value stored under this data key. |

<br/>
