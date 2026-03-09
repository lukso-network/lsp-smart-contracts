<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# ILSP7Allowlist

:::info Standard Specifications

[`LSP-7-DigitalAsset`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md)

:::
:::info Solidity implementation

[`ILSP7Allowlist.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/extensions/LSP7Allowlist/ILSP7Allowlist.sol)

:::

> ILSP7Allowlist

Interface for managing an allowlist of addresses that can bypass certain restrictions in an LSP7 token contract.

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### addToAllowlist

:::note References

- Specification details: [**LSP-7-DigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md#addtoallowlist)
- Solidity implementation: [`ILSP7Allowlist.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/extensions/LSP7Allowlist/ILSP7Allowlist.sol)
- Function signature: `addToAllowlist(address)`
- Function selector: `0xf8e86ece`

:::

```solidity
function addToAllowlist(address _address) external nonpayable;
```

_Adds an address to the allowlist, enabling it to bypass specific restrictions (e.g., transfer locks)._

Can only be called by the contract owner.

<blockquote>

**Emitted events:**

- [`AllowlistChanged`](#allowlistchanged) event with added set to true.

</blockquote>

#### Parameters

| Name       |   Type    | Description                          |
| ---------- | :-------: | ------------------------------------ |
| `_address` | `address` | The address to add to the allowlist. |

<br/>

### getAllowlistedAddressesByIndex

:::note References

- Specification details: [**LSP-7-DigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md#getallowlistedaddressesbyindex)
- Solidity implementation: [`ILSP7Allowlist.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/extensions/LSP7Allowlist/ILSP7Allowlist.sol)
- Function signature: `getAllowlistedAddressesByIndex(uint256,uint256)`
- Function selector: `0x122a6b18`

:::

:::info

To get all the items in the array call `getAllowlistedAddressesLength()` to get the array length (e.g. `allowlistedAddressesLength`) and then call `getAllowlistedAddressesByIndex(0, allowlistedAddressesLength)`

:::

```solidity
function getAllowlistedAddressesByIndex(
  uint256 startIndex,
  uint256 endIndex
) external view returns (address[]);
```

_Get the list of addresses in the allowlist within a specified range._

#### Parameters

| Name         |   Type    | Description                               |
| ------------ | :-------: | ----------------------------------------- |
| `startIndex` | `uint256` | The start index of the range (inclusive). |
| `endIndex`   | `uint256` | The end index of the range (exclusive).   |

#### Returns

| Name |    Type     | Description                             |
| ---- | :---------: | --------------------------------------- |
| `0`  | `address[]` | An array of addresses in the allowlist. |

<br/>

### getAllowlistedAddressesLength

:::note References

- Specification details: [**LSP-7-DigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md#getallowlistedaddresseslength)
- Solidity implementation: [`ILSP7Allowlist.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/extensions/LSP7Allowlist/ILSP7Allowlist.sol)
- Function signature: `getAllowlistedAddressesLength()`
- Function selector: `0xc7abf7e2`

:::

```solidity
function getAllowlistedAddressesLength() external view returns (uint256);
```

_Get the number of addresses in the allowlist._

#### Returns

| Name |   Type    | Description                               |
| ---- | :-------: | ----------------------------------------- |
| `0`  | `uint256` | The number of addresses in the allowlist. |

<br/>

### isAllowlisted

:::note References

- Specification details: [**LSP-7-DigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md#isallowlisted)
- Solidity implementation: [`ILSP7Allowlist.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/extensions/LSP7Allowlist/ILSP7Allowlist.sol)
- Function signature: `isAllowlisted(address)`
- Function selector: `0x05a3b809`

:::

```solidity
function isAllowlisted(address _address) external view returns (bool);
```

_Checks if an address is in the allowlist._

#### Parameters

| Name       |   Type    | Description           |
| ---------- | :-------: | --------------------- |
| `_address` | `address` | The address to check. |

#### Returns

| Name |  Type  | Description                                               |
| ---- | :----: | --------------------------------------------------------- |
| `0`  | `bool` | True if the address is in the allowlist, false otherwise. |

<br/>

### removeFromAllowlist

:::note References

- Specification details: [**LSP-7-DigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md#removefromallowlist)
- Solidity implementation: [`ILSP7Allowlist.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/extensions/LSP7Allowlist/ILSP7Allowlist.sol)
- Function signature: `removeFromAllowlist(address)`
- Function selector: `0x5da93d7e`

:::

```solidity
function removeFromAllowlist(address _address) external nonpayable;
```

_Removes an address from the allowlist, subjecting it to standard restrictions._

Can only be called by the contract owner.

<blockquote>

**Emitted events:**

- [`AllowlistChanged`](#allowlistchanged) event with added set to false.

</blockquote>

#### Parameters

| Name       |   Type    | Description                               |
| ---------- | :-------: | ----------------------------------------- |
| `_address` | `address` | The address to remove from the allowlist. |

<br/>

## Events

### AllowlistChanged

:::note References

- Specification details: [**LSP-7-DigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md#allowlistchanged)
- Solidity implementation: [`ILSP7Allowlist.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/extensions/LSP7Allowlist/ILSP7Allowlist.sol)
- Event signature: `AllowlistChanged(address,bool)`
- Event topic hash: `0xbeb167143f111eef3f249e2794a5ccca6cd766f41a920e48ed7111d07ff551f6`

:::

```solidity
event AllowlistChanged(address indexed _address, bool indexed added);
```

Emitted when an address is added to or removed from the allowlist.

#### Parameters

| Name                     |   Type    | Description                                      |
| ------------------------ | :-------: | ------------------------------------------------ |
| `_address` **`indexed`** | `address` | The address affected by the allowlist change.    |
| `added` **`indexed`**    |  `bool`   | True if the address was added, false if removed. |

<br/>
