<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# ILSP25ExecuteRelayCall

:::info Standard Specifications

[`LSP-25-ExecuteRelayCall`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-25-ExecuteRelayCall.md)

:::
:::info Solidity implementation

[`ILSP25ExecuteRelayCall.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp25-contracts/contracts/ILSP25ExecuteRelayCall.sol)

:::

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### executeRelayCall

:::note References

- Specification details: [**LSP-25-ExecuteRelayCall**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-25-ExecuteRelayCall.md#executerelaycall)
- Solidity implementation: [`ILSP25ExecuteRelayCall.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp25-contracts/contracts/ILSP25ExecuteRelayCall.sol)
- Function signature: `executeRelayCall(bytes,uint256,uint256,bytes)`
- Function selector: `0x4c8a4e74`

:::

:::tip Hint

You can use `validityTimestamps == 0` to define an `executeRelayCall` transaction that is indefinitely valid, meaning that does not require to start from a specific date/time, or that has an expiration date/time.

:::

```solidity
function executeRelayCall(
  bytes signature,
  uint256 nonce,
  uint256 validityTimestamps,
  bytes payload
) external payable returns (bytes);
```

_Executing the following payload given the nonce `nonce` and signature `signature`. Payload: `payload`_

Allows any address (executor) to execute a payload (= abi-encoded function call), given they have a valid signature from a signer address and a valid `nonce` for this signer. The signature MUST be generated according to the signature format defined by the LSP25 standard.

<blockquote>

**Requirements:**

- `nonce` MUST be a valid nonce nonce provided (see [`getNonce`](#getnonce) function).
- The transaction MUST be submitted within a valid time period defined by the `validityTimestamp`.

</blockquote>

#### Parameters

| Name                 |   Type    | Description                                                                                                                                                            |
| -------------------- | :-------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signature`          |  `bytes`  | A 65 bytes long signature for a meta transaction according to LSP25.                                                                                                   |
| `nonce`              | `uint256` | The nonce of the address that signed the calldata (in a specific `_channel`), obtained via [`getNonce`](#getnonce). Used to prevent replay attack.                     |
| `validityTimestamps` | `uint256` | Two `uint128` timestamps concatenated together that describes when the relay transaction is valid "from" (left `uint128`) and "until" as a deadline (right `uint128`). |
| `payload`            |  `bytes`  | The abi-encoded function call to execute.                                                                                                                              |

#### Returns

| Name |  Type   | Description                                       |
| ---- | :-----: | ------------------------------------------------- |
| `0`  | `bytes` | The data being returned by the function executed. |

<br/>

### executeRelayCallBatch

:::note References

- Specification details: [**LSP-25-ExecuteRelayCall**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-25-ExecuteRelayCall.md#executerelaycallbatch)
- Solidity implementation: [`ILSP25ExecuteRelayCall.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp25-contracts/contracts/ILSP25ExecuteRelayCall.sol)
- Function signature: `executeRelayCallBatch(bytes[],uint256[],uint256[],uint256[],bytes[])`
- Function selector: `0xa20856a5`

:::

```solidity
function executeRelayCallBatch(
  bytes[] signatures,
  uint256[] nonces,
  uint256[] validityTimestamps,
  uint256[] values,
  bytes[] payloads
) external payable returns (bytes[]);
```

_Executing a batch of relay calls (= meta-transactions)._

Same as [`executeRelayCall`](#executerelaycall) but execute a batch of signed calldata payloads (abi-encoded function calls) in a single transaction.

#### Parameters

| Name                 |    Type     | Description                                                                                                                                                        |
| -------------------- | :---------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `signatures`         |  `bytes[]`  | An array of 65 bytes long signatures for meta transactions according to LSP25.                                                                                     |
| `nonces`             | `uint256[]` | An array of nonces of the addresses that signed the calldata payloads (in specific channels). Obtained via [`getNonce`](#getnonce). Used to prevent replay attack. |
| `validityTimestamps` | `uint256[]` | An array of two `uint128` concatenated timestamps that describe when the relay transaction is valid "from" (left `uint128`) and "until" (right `uint128`).         |
| `values`             | `uint256[]` | An array of amount of native tokens to be transferred for each calldata `payload`.                                                                                 |
| `payloads`           |  `bytes[]`  | An array of abi-encoded function calls to be executed successively.                                                                                                |

#### Returns

| Name |   Type    | Description                                                      |
| ---- | :-------: | ---------------------------------------------------------------- |
| `0`  | `bytes[]` | An array of abi-decoded data returned by the functions executed. |

<br/>

### getNonce

:::note References

- Specification details: [**LSP-25-ExecuteRelayCall**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-25-ExecuteRelayCall.md#getnonce)
- Solidity implementation: [`ILSP25ExecuteRelayCall.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp25-contracts/contracts/ILSP25ExecuteRelayCall.sol)
- Function signature: `getNonce(address,uint128)`
- Function selector: `0xb44581d9`

:::

```solidity
function getNonce(
  address from,
  uint128 channelId
) external view returns (uint256);
```

_Reading the latest nonce of address `from` in the channel ID `channelId`._

Get the nonce for a specific `from` address that can be used for signing relay transactions via [`executeRelayCall`](#executerelaycall).

#### Parameters

| Name        |   Type    | Description                                                                |
| ----------- | :-------: | -------------------------------------------------------------------------- |
| `from`      | `address` | The address of the signer of the transaction.                              |
| `channelId` | `uint128` | The channel id that the signer wants to use for executing the transaction. |

#### Returns

| Name |   Type    | Description                                  |
| ---- | :-------: | -------------------------------------------- |
| `0`  | `uint256` | The current nonce on a specific `channelId`. |

<br/>
