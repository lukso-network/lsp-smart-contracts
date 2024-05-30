<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP10Utils

:::info Standard Specifications

[`LSP-10-ReceivedVaults`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-10-ReceivedVaults.md)

:::
:::info Solidity implementation

[`LSP10Utils.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp10-contracts/contracts/LSP10Utils.sol)

:::

> LSP10 Utility library.

LSP5Utils is a library of functions that can be used to register and manage vaults received by an ERC725Y smart contract. Based on the LSP10 Received Vaults standard.

## Internal Methods

Any method labeled as `internal` serves as utility function within the contract. They can be used when writing solidity contracts that inherit from this contract. These methods can be extended or modified by overriding their internal behavior to suit specific needs.

Internal functions cannot be called externally, whether from other smart contracts, dApp interfaces, or backend services. Their restricted accessibility ensures that they remain exclusively available within the context of the current contract, promoting controlled and encapsulated usage of these internal utilities.

### generateReceivedVaultKeys

:::caution Warning

This function returns empty arrays when encountering errors. Otherwise the arrays will contain 3 data keys and 3 data values.

:::

```solidity
function generateReceivedVaultKeys(
  address receiver,
  address vaultAddress
) internal view returns (bytes32[] lsp10DataKeys, bytes[] lsp10DataValues);
```

Generate an array of data keys/values pairs to be set on the receiver address after receiving vaults.

#### Parameters

| Name           |   Type    | Description                                                                    |
| -------------- | :-------: | ------------------------------------------------------------------------------ |
| `receiver`     | `address` | The address receiving the vault and where the LSP10 data keys should be added. |
| `vaultAddress` | `address` | The address of the vault being received.                                       |

#### Returns

| Name              |    Type     | Description                                                           |
| ----------------- | :---------: | --------------------------------------------------------------------- |
| `lsp10DataKeys`   | `bytes32[]` | An array data keys used to update the [LSP-10-ReceivedAssets] data.   |
| `lsp10DataValues` |  `bytes[]`  | An array data values used to update the [LSP-10-ReceivedAssets] data. |

<br/>

### generateSentVaultKeys

:::caution Warning

Returns empty arrays when encountering errors. Otherwise the arrays must have at least 3 data keys and 3 data values.

:::

```solidity
function generateSentVaultKeys(
  address sender,
  address vaultAddress
) internal view returns (bytes32[] lsp10DataKeys, bytes[] lsp10DataValues);
```

Generate an array of data key/value pairs to be set on the sender address after sending vaults.

#### Parameters

| Name           |   Type    | Description                                                                    |
| -------------- | :-------: | ------------------------------------------------------------------------------ |
| `sender`       | `address` | The address sending the vault and where the LSP10 data keys should be updated. |
| `vaultAddress` | `address` | The address of the vault that is being sent.                                   |

#### Returns

| Name              |    Type     | Description                                                           |
| ----------------- | :---------: | --------------------------------------------------------------------- |
| `lsp10DataKeys`   | `bytes32[]` | An array data keys used to update the [LSP-10-ReceivedAssets] data.   |
| `lsp10DataValues` |  `bytes[]`  | An array data values used to update the [LSP-10-ReceivedAssets] data. |

<br/>

### getLSP10ArrayLengthBytes

```solidity
function getLSP10ArrayLengthBytes(contract IERC725Y erc725YContract) internal view returns (bytes);
```

Get the raw bytes value stored under the `_LSP10_VAULTS_ARRAY_KEY`.

#### Parameters

| Name              |        Type         | Description                                     |
| ----------------- | :-----------------: | ----------------------------------------------- |
| `erc725YContract` | `contract IERC725Y` | The contract to query the ERC725Y storage from. |

#### Returns

| Name |  Type   | Description                                     |
| ---- | :-----: | ----------------------------------------------- |
| `0`  | `bytes` | The raw bytes value stored under this data key. |

<br/>
