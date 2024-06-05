<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP20CallVerification

:::info Standard Specifications

[`LSP-20-CallVerification`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-20-CallVerification.md)

:::
:::info Solidity implementation

[`LSP20CallVerification.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp20-contracts/contracts/LSP20CallVerification.sol)

:::

> Implementation of a contract calling the verification functions according to LSP20 - Call Verification standard.

Module to be inherited used to verify the execution of functions according to a verifier address. Verification can happen before or after execution based on a returnedStatus.

## Internal Methods

Any method labeled as `internal` serves as utility function within the contract. They can be used when writing solidity contracts that inherit from this contract. These methods can be extended or modified by overriding their internal behavior to suit specific needs.

Internal functions cannot be called externally, whether from other smart contracts, dApp interfaces, or backend services. Their restricted accessibility ensures that they remain exclusively available within the context of the current contract, promoting controlled and encapsulated usage of these internal utilities.

### \_verifyCall

```solidity
function _verifyCall(
  address logicVerifier
) internal nonpayable returns (bool verifyAfter);
```

Calls [`lsp20VerifyCall`](#lsp20verifycall) function on the logicVerifier.

<br/>

### \_verifyCallResult

```solidity
function _verifyCallResult(
  address logicVerifier,
  bytes callResult
) internal nonpayable;
```

Calls [`lsp20VerifyCallResult`](#lsp20verifycallresult) function on the logicVerifier.

<br/>

### \_revertWithLSP20DefaultError

```solidity
function _revertWithLSP20DefaultError(
  bool postCall,
  bytes returnedData
) internal pure;
```

<br/>
