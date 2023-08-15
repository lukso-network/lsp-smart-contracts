<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP25MultiChannelNonce

:::info Standard Specifications

[`LSP-25-ExecuteRelayCall`](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-25-ExecuteRelayCall.md)

:::
:::info Solidity implementation

[`LSP25MultiChannelNonce.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP25ExecuteRelayCall/LSP25MultiChannelNonce.sol)

:::

> Implementation of the multi channel nonce and the signature verification defined in the LSP25 standard.

This contract can be used as a backbone for other smart contracts to implement meta-transactions via the LSP25 Execute Relay Call interface. It contains a storage of nonces for signer addresses across various channel IDs, enabling these signers to submit signed transactions that order-independant. (transactions that do not need to be submitted one after the other in a specific order). Finally, it contains internal functions to verify signatures for specific calldata according the signature format specified in the LSP25 standard.

## Internal Methods

Any method labeled as `internal` serves as utility function within the contract. They can be used when writing solidity contracts that inherit from this contract. These methods can be extended or modified by overriding their internal behavior to suit specific needs.

Internal functions cannot be called externally, whether from other smart contracts, dApp interfaces, or backend services. Their restricted accessibility ensures that they remain exclusively available within the context of the current contract, promoting controlled and encapsulated usage of these internal utilities.

### \_validateExecuteRelayCall

:::caution Warning

Be aware that this function can also throw an error if the `callData` was signed incorrectly (not conforming to the signature format defined in the LSP25 standard).
The contract cannot distinguish if the data is signed correctly or not. Instead, it will recover an incorrect signer address from the signature
and throw an {InvalidRelayNonce} error with the incorrect signer address as the first parameter.

:::

```solidity
function _validateExecuteRelayCall(
  bytes signature,
  uint256 nonce,
  uint256 validityTimestamps,
  uint256 msgValue,
  bytes callData
) internal nonpayable returns (address recoveredSignerAddress);
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
| `callData`           |  `bytes`  | The abi-encoded function call to execute.                                                                                              |

#### Returns

| Name                     |   Type    | Description                                                                 |
| ------------------------ | :-------: | --------------------------------------------------------------------------- |
| `recoveredSignerAddress` | `address` | The address of the signer recovered, for which the signature was validated. |

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
