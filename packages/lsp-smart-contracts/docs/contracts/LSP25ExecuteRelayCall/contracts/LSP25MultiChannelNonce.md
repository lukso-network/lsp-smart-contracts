<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP25MultiChannelNonce

:::info Standard Specifications

[`LSP-25-ExecuteRelayCall`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-25-ExecuteRelayCall.md)

:::
:::info Solidity implementation

[`LSP25MultiChannelNonce.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp25-contracts/contracts/ILSP25ExecuteRelayCall.sol)

:::

> Implementation of the multi channel nonce and the signature verification defined in the LSP25 standard.

This contract can be used as a backbone for other smart contracts to implement meta-transactions via the LSP25 Execute Relay Call interface. It contains a storage of nonces for signer addresses across various channel IDs, enabling these signers to submit signed transactions that order-independent. (transactions that do not need to be submitted one after the other in a specific order). Finally, it contains internal functions to verify signatures for specific calldata according the signature format specified in the LSP25 standard.

## Internal Methods

Any method labeled as `internal` serves as utility function within the contract. They can be used when writing solidity contracts that inherit from this contract. These methods can be extended or modified by overriding their internal behavior to suit specific needs.

Internal functions cannot be called externally, whether from other smart contracts, dApp interfaces, or backend services. Their restricted accessibility ensures that they remain exclusively available within the context of the current contract, promoting controlled and encapsulated usage of these internal utilities.

### \_getNonce

```solidity
function _getNonce(
  address from,
  uint128 channelId
) internal view returns (uint256 idx);
```

Read the nonce for a `from` address on a specific `channelId`.
This will return an `idx`, which is the concatenation of two `uint128` as follow:

1. the `channelId` where the nonce was queried for.

2. the actual nonce of the given `channelId`.
   For example, if on `channelId` number `5`, the latest nonce is `1`, the `idx` returned by this function will be:

```
// in decimals = 1701411834604692317316873037158841057281
idx = 0x0000000000000000000000000000000500000000000000000000000000000001
```

This idx can be described as follow:

```
            channelId => 5          nonce in this channel => 1
  v------------------------------v-------------------------------v
0x0000000000000000000000000000000500000000000000000000000000000001
```

#### Parameters

| Name        |   Type    | Description                                |
| ----------- | :-------: | ------------------------------------------ |
| `from`      | `address` | The address to read the nonce for.         |
| `channelId` | `uint128` | The channel in which to extract the nonce. |

#### Returns

| Name  |   Type    | Description                                                                                                            |
| ----- | :-------: | ---------------------------------------------------------------------------------------------------------------------- |
| `idx` | `uint256` | The idx composed of two `uint128`: the channelId + nonce in channel concatenated together in a single `uint256` value. |

<br/>

### \_recoverSignerFromLSP25Signature

```solidity
function _recoverSignerFromLSP25Signature(
  bytes signature,
  uint256 nonce,
  uint256 validityTimestamps,
  uint256 msgValue,
  bytes callData
) internal view returns (address);
```

Recover the address of the signer that generated a `signature` using the parameters provided `nonce`, `validityTimestamps`, `msgValue` and `callData`.
The address of the signer will be recovered using the LSP25 signature format.

#### Parameters

| Name                 |   Type    | Description                                                                                                                                          |
| -------------------- | :-------: | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signature`          |  `bytes`  | A 65 bytes long signature generated according to the signature format specified in the LSP25 standard.                                               |
| `nonce`              | `uint256` | The nonce that the signer used to generate the `signature`.                                                                                          |
| `validityTimestamps` | `uint256` | The validity timestamp that the signer used to generate the signature (See [`_verifyValidityTimestamps`](#_verifyvaliditytimestamps) to learn more). |
| `msgValue`           | `uint256` | The amount of native tokens intended to be sent for the relay transaction.                                                                           |
| `callData`           |  `bytes`  | The calldata to execute as a relay transaction that the signer signed for.                                                                           |

#### Returns

| Name |   Type    | Description                                              |
| ---- | :-------: | -------------------------------------------------------- |
| `0`  | `address` | The address that signed, recovered from the `signature`. |

<br/>

### \_verifyValidityTimestamps

```solidity
function _verifyValidityTimestamps(uint256 validityTimestamps) internal view;
```

Verify that the current timestamp is within the date and time range provided by `validityTimestamps`.

#### Parameters

| Name                 |   Type    | Description                                                                                                                            |
| -------------------- | :-------: | -------------------------------------------------------------------------------------------------------------------------------------- |
| `validityTimestamps` | `uint256` | Two `uint128` concatenated together, where the left-most `uint128` represent the timestamp from which the transaction can be executed, |

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
