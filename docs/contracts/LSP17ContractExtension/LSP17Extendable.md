# LSP17Extendable

:::info Soldity contract

[`LSP17Extendable.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP17ContractExtension/LSP17Extendable.sol)

:::

> Implementation of the fallback logic according to LSP17ContractExtension

Module to be inherited used to extend the functionality of the parent contract when calling a function that doesn't exist on the parent contract via forwarding the call to an extension mapped to the function selector being called, set originally by the parent contract

## Methods

### supportsInterface

:::note Links

- Specification details in [**LSP-17-ContractExtension**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-17-ContractExtension.md#supportsinterface)
- Solidity implementation in [**LSP17Extendable**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP17ContractExtension/LSP17Extendable.sol)
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
