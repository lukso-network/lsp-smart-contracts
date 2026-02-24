<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# ILSP20CallVerifier

:::info Standard Specifications

[`LSP-20-CallVerification`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-20-CallVerification.md)

:::
:::info Solidity implementation

[`ILSP20CallVerifier.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp20-contracts/contracts/ILSP20CallVerifier.sol)

:::

> Interface for the LSP20 Call Verification standard, a set of functions intended to perform verifications on behalf of another contract.

Interface to be inherited for contract supporting LSP20-CallVerification

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### lsp20VerifyCall

:::note References

- Specification details: [**LSP-20-CallVerification**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-20-CallVerification.md#lsp20verifycall)
- Solidity implementation: [`ILSP20CallVerifier.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp20-contracts/contracts/ILSP20CallVerifier.sol)
- Function signature: `lsp20VerifyCall(address,address,address,uint256,bytes)`
- Function selector: `0xde928f14`

:::

```solidity
function lsp20VerifyCall(
  address requestor,
  address target,
  address caller,
  uint256 value,
  bytes callData
) external nonpayable returns (bytes4 returnedStatus);
```

#### Parameters

| Name        |   Type    | Description                                                                        |
| ----------- | :-------: | ---------------------------------------------------------------------------------- |
| `requestor` | `address` | The address that requested to make the call to `target`.                           |
| `target`    | `address` | The address of the contract that implements the `LSP20CallVerification` interface. |
| `caller`    | `address` | The address who called the function on the `target` contract.                      |
| `value`     | `uint256` | The value sent by the caller to the function called on the msg.sender              |
| `callData`  |  `bytes`  | The calldata sent by the caller to the msg.sender                                  |

#### Returns

| Name             |   Type   | Description                                                                                                                                                                                                                                                                                                                                       |
| ---------------- | :------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `returnedStatus` | `bytes4` | MUST return the first 3 bytes of `lsp20VerifyCall(address,uint256,bytes)` function selector if the call to the function is allowed, concatenated with a byte that determines if the lsp20VerifyCallResult function should be called after the original function call. The byte that invoke the lsp20VerifyCallResult function is strictly `0x01`. |

<br/>

### lsp20VerifyCallResult

:::note References

- Specification details: [**LSP-20-CallVerification**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-20-CallVerification.md#lsp20verifycallresult)
- Solidity implementation: [`ILSP20CallVerifier.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp20-contracts/contracts/ILSP20CallVerifier.sol)
- Function signature: `lsp20VerifyCallResult(bytes32,bytes)`
- Function selector: `0xd3fc45d3`

:::

```solidity
function lsp20VerifyCallResult(
  bytes32 callHash,
  bytes callResult
) external nonpayable returns (bytes4);
```

#### Parameters

| Name         |   Type    | Description                                                                                |
| ------------ | :-------: | ------------------------------------------------------------------------------------------ |
| `callHash`   | `bytes32` | The keccak256 hash of the parameters of [`lsp20VerifyCall`](#lsp20verifycall) concatenated |
| `callResult` |  `bytes`  | The value result of the function called on the msg.sender                                  |

#### Returns

| Name |   Type   | Description                                                                                    |
| ---- | :------: | ---------------------------------------------------------------------------------------------- |
| `0`  | `bytes4` | MUST return the lsp20VerifyCallResult function selector if the call to the function is allowed |

<br/>
