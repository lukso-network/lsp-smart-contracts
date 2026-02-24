<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# ILSP8NonTransferable

:::info Standard Specifications

[`LSP-8-IdentifiableDigitalAsset`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md)

:::
:::info Solidity implementation

[`ILSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/extensions/LSP8NonTransferable/ILSP8NonTransferable.sol)

:::

> ILSP8NonTransferable

Interface for a non-transferable LSP8 token, enabling control over transferability, lock periods, and allowlist exemptions.

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### isTransferable

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#istransferable)
- Solidity implementation: [`ILSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/extensions/LSP8NonTransferable/ILSP8NonTransferable.sol)
- Function signature: `isTransferable()`
- Function selector: `0x2121dc75`

:::

```solidity
function isTransferable() external view returns (bool);
```

_Checks if the token is currently transferable._

Returns true if the token is transferable (based on the lock period). Note that transfers from allowlisted addresses and burning (transfers to address(0)) is always allowed, regardless of transferability status.

#### Returns

| Name |  Type  | Description                                         |
| ---- | :----: | --------------------------------------------------- |
| `0`  | `bool` | True if the token is transferable, false otherwise. |

<br/>

### makeTransferable

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#maketransferable)
- Solidity implementation: [`ILSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/extensions/LSP8NonTransferable/ILSP8NonTransferable.sol)
- Function signature: `makeTransferable()`
- Function selector: `0x696fd68c`

:::

```solidity
function makeTransferable() external nonpayable;
```

_Removes all transfer lock, enabling token transfers for non-allowlisted addresses._

Can only be called by the contract owner. Sets both lock periods to 0.

<br/>

### transferLockEnd

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#transferlockend)
- Solidity implementation: [`ILSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/extensions/LSP8NonTransferable/ILSP8NonTransferable.sol)
- Function signature: `transferLockEnd()`
- Function selector: `0x8fb05730`

:::

```solidity
function transferLockEnd() external view returns (uint256);
```

_The end timestamp of the transfer lock period, at which point the token becomes transferable again._

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `uint256` | -           |

<br/>

### transferLockStart

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#transferlockstart)
- Solidity implementation: [`ILSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/extensions/LSP8NonTransferable/ILSP8NonTransferable.sol)
- Function signature: `transferLockStart()`
- Function selector: `0xe6fc6098`

:::

```solidity
function transferLockStart() external view returns (uint256);
```

_The start timestamp of the transfer lock period, at which point the token becomes non-transferable._

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `uint256` | -           |

<br/>

### updateTransferLockPeriod

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#updatetransferlockperiod)
- Solidity implementation: [`ILSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/extensions/LSP8NonTransferable/ILSP8NonTransferable.sol)
- Function signature: `updateTransferLockPeriod(uint256,uint256)`
- Function selector: `0x45e14c46`

:::

```solidity
function updateTransferLockPeriod(
  uint256 newTransferLockStart,
  uint256 newTransferLockEnd
) external nonpayable;
```

\*Updates the transfer lock period with new start and end timestamps.

- When `transferLockStart` is 0 and `transferLockEnd` is set to a non-zero value, it means no start time is set. The token is non-transferable immediately until `transferLockEnd`.

- When `transferLockStart` is set to a value and `transferLockEnd` is 0, it means the tokens becomes non-transferable at a certain point in time and indefinitely (no end time).

- To make the token always non-transferable, set `transferLockStart` to 0 and `transferLockEnd` to type(uint256).max.

- To disable completely the non-transferable feature (= make the token always transferable), set both `transferLockStart` and `transferLockEnd` to 0.\*

Can only be called by the contract owner. Reverts if the current lock period has already started or ended.

#### Parameters

| Name                   |   Type    | Description                                           |
| ---------------------- | :-------: | ----------------------------------------------------- |
| `newTransferLockStart` | `uint256` | The new start timestamp for the transfer lock period. |
| `newTransferLockEnd`   | `uint256` | The new end timestamp for the transfer lock period.   |

<br/>

## Events

### TransferLockPeriodChanged

:::note References

- Specification details: [**LSP-8-IdentifiableDigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#transferlockperiodchanged)
- Solidity implementation: [`ILSP8NonTransferable.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp8-contracts/contracts/extensions/LSP8NonTransferable/ILSP8NonTransferable.sol)
- Event signature: `TransferLockPeriodChanged(uint256,uint256)`
- Event topic hash: `0x938e6c55d25d181f86d200da26970f962ec97adb02dfa0452811fb9073573ebe`

:::

```solidity
event TransferLockPeriodChanged(uint256 indexed start, uint256 indexed end);
```

Emitted when the transfer lock period is updated.

#### Parameters

| Name                  |   Type    | Description                                          |
| --------------------- | :-------: | ---------------------------------------------------- |
| `start` **`indexed`** | `uint256` | The new start timestamp of the transfer lock period. |
| `end` **`indexed`**   | `uint256` | The new end timestamp of the transfer lock period.   |

<br/>
