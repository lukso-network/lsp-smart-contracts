# LSP17Extension

:::info Soldity contract

[`LSP17Extension.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP17ContractExtension/LSP17Extension.sol)

:::

> Implementation of the extension logic according to LSP17ContractExtension

To be inherited to provide context of the msg variable related to the extendable contract

## Methods

### supportsInterface

:::note Links

- Specification details in [**LSP-17-ContractExtension**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-17-ContractExtension.md#supportsinterface)
- Solidity implementation in [**LSP17Extension**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP17ContractExtension/LSP17Extension.sol)
- Function signature: `supportsInterface(bytes4)`
- Function selector: `0x01ffc9a7`

:::

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool);
```

See [`IERC165-supportsInterface`](#ierc165-supportsinterface).

#### Parameters

| Name          |   Type   | Description |
| ------------- | :------: | ----------- |
| `interfaceId` | `bytes4` | -           |

#### Returns

| Name |  Type  | Description |
| ---- | :----: | ----------- |
| `0`  | `bool` | -           |
