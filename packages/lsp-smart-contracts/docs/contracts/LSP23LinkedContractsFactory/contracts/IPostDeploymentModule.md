<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# IPostDeploymentModule

:::info Standard Specifications

[`LSP-23-LinkedContractsFactory`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-23-LinkedContractsFactory.md)

:::
:::info Solidity implementation

[`IPostDeploymentModule.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp23-contracts/contracts/LSP23LinkedContractsFactory.sol)

:::

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### executePostDeployment

:::note References

- Specification details: [**LSP-23-LinkedContractsFactory**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-23-LinkedContractsFactory.md#executepostdeployment)
- Solidity implementation: [`IPostDeploymentModule.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp23-contracts/contracts/LSP23LinkedContractsFactory.sol)
- Function signature: `executePostDeployment(address,address,bytes)`
- Function selector: `0x28c4d14e`

:::

```solidity
function executePostDeployment(
  address primaryContract,
  address secondaryContract,
  bytes calldataToPostDeploymentModule
) external nonpayable;
```

_This function can be used to perform any additional setup or configuration after the primary and secondary contracts have been deployed._

Executes post-deployment logic for the primary and secondary contracts.

#### Parameters

| Name                             |   Type    | Description                                              |
| -------------------------------- | :-------: | -------------------------------------------------------- |
| `primaryContract`                | `address` | The address of the deployed primary contract.            |
| `secondaryContract`              | `address` | The address of the deployed secondary contract.          |
| `calldataToPostDeploymentModule` |  `bytes`  | Calldata to be passed for the post-deployment execution. |

<br/>
