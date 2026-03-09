<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP6ExecuteRelayCallModule

:::info Standard Specifications

[`LSP-6-KeyManager`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-6-KeyManager.md)

:::
:::info Solidity implementation

[`LSP6ExecuteRelayCallModule.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp6-contracts/contracts/LSP6Modules/LSP6ExecuteRelayCallModule.sol)

:::

## Internal Methods

Any method labeled as `internal` serves as utility function within the contract. They can be used when writing solidity contracts that inherit from this contract. These methods can be extended or modified by overriding their internal behavior to suit specific needs.

Internal functions cannot be called externally, whether from other smart contracts, dApp interfaces, or backend services. Their restricted accessibility ensures that they remain exclusively available within the context of the current contract, promoting controlled and encapsulated usage of these internal utilities.

### \_verifyExecuteRelayCallPermission

```solidity
function _verifyExecuteRelayCallPermission(
  address controllerAddress,
  bytes32 controllerPermissions
) internal pure;
```

#### Parameters

| Name                    |   Type    | Description |
| ----------------------- | :-------: | ----------- |
| `controllerAddress`     | `address` | -           |
| `controllerPermissions` | `bytes32` | -           |

<br/>
