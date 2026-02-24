<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# ILSP7CappedBalance

:::info Standard Specifications

[`LSP-7-DigitalAsset`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md)

:::
:::info Solidity implementation

[`ILSP7CappedBalance.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/extensions/LSP7CappedBalance/ILSP7CappedBalance.sol)

:::

> ILSP7CappedBalance

Interface for an LSP7 token extension that enforces a per-address balance cap, with exemptions for allowlisted addresses.

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### tokenBalanceCap

:::note References

- Specification details: [**LSP-7-DigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md#tokenbalancecap)
- Solidity implementation: [`ILSP7CappedBalance.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/extensions/LSP7CappedBalance/ILSP7CappedBalance.sol)
- Function signature: `tokenBalanceCap()`
- Function selector: `0xd1ca0188`

:::

```solidity
function tokenBalanceCap() external view returns (uint256);
```

_Retrieves the maximum token balance allowed per address._

Returns the immutable balance cap set during contract deployment.

#### Returns

| Name |   Type    | Description                                               |
| ---- | :-------: | --------------------------------------------------------- |
| `0`  | `uint256` | The maximum token balance allowed for any single address. |

<br/>
