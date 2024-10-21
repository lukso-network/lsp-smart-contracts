<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP17Utils

:::info Standard Specifications

[`LSP-17-ContractExtension`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-17-ContractExtension.md)

:::
:::info Solidity implementation

[`LSP17Utils.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp17contractextension-contracts/contracts/LSP17Extendable.sol)

:::

> LSP17 Utility library to check an extension

## Internal Methods

Any method labeled as `internal` serves as utility function within the contract. They can be used when writing solidity contracts that inherit from this contract. These methods can be extended or modified by overriding their internal behavior to suit specific needs.

Internal functions cannot be called externally, whether from other smart contracts, dApp interfaces, or backend services. Their restricted accessibility ensures that they remain exclusively available within the context of the current contract, promoting controlled and encapsulated usage of these internal utilities.

### isExtension

```solidity
function isExtension(
  uint256 parametersLengthWithOffset,
  uint256 msgDataLength
) internal pure returns (bool);
```

Returns whether the call is a normal call or an extension call by checking if
the `parametersLengthWithOffset` with an additional of 52 bytes supposed msg.sender
and msg.value appended is equal to the msgDataLength

<br/>
