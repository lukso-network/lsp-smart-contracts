<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# ILSP7Mintable

:::info Standard Specifications

[`LSP-7-DigitalAsset`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md)

:::
:::info Solidity implementation

[`ILSP7Mintable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/extensions/LSP7Mintable/ILSP7Mintable.sol)

:::

> ILSP7Mintable

Interface for a isMintable LSP7 token extension, allowing the owner to mint new tokens and disable minting.

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### disableMinting

:::note References

- Specification details: [**LSP-7-DigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md#disableminting)
- Solidity implementation: [`ILSP7Mintable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/extensions/LSP7Mintable/ILSP7Mintable.sol)
- Function signature: `disableMinting()`
- Function selector: `0x7e5cd5c1`

:::

```solidity
function disableMinting() external nonpayable;
```

_Disables minting of new tokens permanently._

Can only be called by the contract owner. Prevents further calls to mint after invocation.

<blockquote>

**Emitted events:**

- [`MintingDisabled`](#mintingdisabled) event.

</blockquote>

<br/>

### mint

:::note References

- Specification details: [**LSP-7-DigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md#mint)
- Solidity implementation: [`ILSP7Mintable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/extensions/LSP7Mintable/ILSP7Mintable.sol)
- Function signature: `mint(address,uint256,bool,bytes)`
- Function selector: `0x7580d920`

:::

```solidity
function mint(
  address to,
  uint256 amount,
  bool force,
  bytes data
) external nonpayable;
```

_Mints new tokens to a specified address._

Mints `amount` tokens to `to`, callable only by the contract owner. Emits a Transfer event as defined in ILSP7DigitalAsset. Reverts if `to` is the zero address or if minting is disabled.

#### Parameters

| Name     |   Type    | Description                                                                                              |
| -------- | :-------: | -------------------------------------------------------------------------------------------------------- |
| `to`     | `address` | The address to receive the minted tokens.                                                                |
| `amount` | `uint256` | The number of tokens to mint.                                                                            |
| `force`  |  `bool`   | When true, allows minting to any address; when false, requires `to` to support LSP1 UniversalReceiver.   |
| `data`   |  `bytes`  | Additional data included in the Transfer event and sent to `to`’s UniversalReceiver hook, if applicable. |

<br/>

## Events

### MintingStatusChanged

:::note References

- Specification details: [**LSP-7-DigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md#mintingstatuschanged)
- Solidity implementation: [`ILSP7Mintable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/extensions/LSP7Mintable/ILSP7Mintable.sol)
- Event signature: `MintingStatusChanged(bool)`
- Event topic hash: `0x41f386d449eec03c1c3b75bbba9c18df70aa19779ff47f68eab4b6a66fb399d4`

:::

```solidity
event MintingStatusChanged(bool indexed enabled);
```

Emitted when minting status is changed.

#### Parameters

| Name                    |  Type  | Description |
| ----------------------- | :----: | ----------- |
| `enabled` **`indexed`** | `bool` | -           |

<br/>
