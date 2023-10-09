<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# OnERC721ReceivedExtension

:::info Standard Specifications

[`LSP-17-Extensions`](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-17-Extensions.md)

:::
:::info Solidity implementation

[`OnERC721ReceivedExtension.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP17Extensions/OnERC721ReceivedExtension.sol)

:::

LSP17 Extension that can be attached to a LSP17Extendable contract to allow it to receive ERC721 tokens via `safeTransferFrom`.

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### onERC721Received

:::note References

- Specification details: [**LSP-17-Extensions**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-17-Extensions.md#,,,))
- Solidity implementation: [`OnERC721ReceivedExtension.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP17Extensions/OnERC721ReceivedExtension.sol)
- Function signature: `,,,)`
- Function selector: `0x940e0af1`

:::

```solidity
function onERC721Received(
  address,
  address,
  uint256,
  bytes
) external nonpayable returns (bytes4);
```

See [`IERC721Receiver-onERC721Received`](#ierc721receiver-onerc721received). Always returns `IERC721Receiver.onERC721Received.selector`.

#### Parameters

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `_0` | `address` | -           |
| `_1` | `address` | -           |
| `_2` | `uint256` | -           |
| `_3` |  `bytes`  | -           |

#### Returns

| Name |   Type   | Description |
| ---- | :------: | ----------- |
| `0`  | `bytes4` | -           |

<br/>
