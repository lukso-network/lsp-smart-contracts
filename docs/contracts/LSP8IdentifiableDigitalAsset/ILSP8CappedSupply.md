<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# ILSP8CappedSupply

:::info Standard Specifications

[`LSP-8-IdentifiableDigitalAsset`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md)

:::
:::info Solidity implementation

[`ILSP8CappedSupply.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/extensions/LSP8CappedSupply/ILSP8CappedSupply.sol)

:::

> ILSP8CappedSupply

Interface for an LSP8 token extension that enforces a max token supply cap.

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### tokenSupplyCap

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#tokensupplycap)
- Solidity implementation: [`ILSP8CappedSupply.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/extensions/LSP8CappedSupply/ILSP8CappedSupply.sol)
- Function signature: `tokenSupplyCap()`
- Function selector: `0x52058d8a`

:::

```solidity
function tokenSupplyCap() external view returns (uint256);
```

_The maximum supply amount of tokens allowed to exist is `_TOKEN_SUPPLY_CAP`._

Get the maximum number of tokens that can exist to circulate. Once [`totalSupply`](#totalsupply) reaches [`totalSupplyCap`](#totalsupplycap), it is not possible to mint more tokens.

#### Returns

| Name |   Type    | Description                                                  |
| ---- | :-------: | ------------------------------------------------------------ |
| `0`  | `uint256` | The maximum number of tokens that can exist in the contract. |

<br/>
