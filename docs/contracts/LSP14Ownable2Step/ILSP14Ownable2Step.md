<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# ILSP14Ownable2Step

:::info Standard Specifications

[`LSP-14-Ownable2Step`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-14-Ownable2Step.md)

:::
:::info Solidity implementation

[`ILSP14Ownable2Step.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp14-contracts/contracts/ILSP14Ownable2Step.sol)

:::

> Interface of the LSP14

- Ownable 2-step standard, an extension of the [EIP173] (Ownable) standard with 2-step process to transfer or renounce ownership.

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### acceptOwnership

:::note References

- Specification details: [**LSP-14-Ownable2Step**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-14-Ownable2Step.md#acceptownership)
- Solidity implementation: [`ILSP14Ownable2Step.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp14-contracts/contracts/ILSP14Ownable2Step.sol)
- Function signature: `acceptOwnership()`
- Function selector: `0x79ba5097`

:::

```solidity
function acceptOwnership() external nonpayable;
```

_`msg.sender` is accepting ownership of contract: `address(this)`._

Transfer ownership of the contract from the current [`owner()`](#owner) to the [`pendingOwner()`](#pendingowner). Once this function is called:

- The current [`owner()`](#owner) will lose access to the functions restricted to the [`owner()`](#owner) only.

- The [`pendingOwner()`](#pendingowner) will gain access to the functions restricted to the [`owner()`](#owner) only.

<br/>

### pendingOwner

:::note References

- Specification details: [**LSP-14-Ownable2Step**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-14-Ownable2Step.md#pendingowner)
- Solidity implementation: [`ILSP14Ownable2Step.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp14-contracts/contracts/ILSP14Ownable2Step.sol)
- Function signature: `pendingOwner()`
- Function selector: `0xe30c3978`

:::

```solidity
function pendingOwner() external view returns (address);
```

The address that ownership of the contract is transferred to. This address may use [`acceptOwnership()`](#acceptownership) to gain ownership of the contract.

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `address` | -           |

<br/>

### renounceOwnership

:::note References

- Specification details: [**LSP-14-Ownable2Step**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-14-Ownable2Step.md#renounceownership)
- Solidity implementation: [`ILSP14Ownable2Step.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp14-contracts/contracts/ILSP14Ownable2Step.sol)
- Function signature: `renounceOwnership()`
- Function selector: `0x715018a6`

:::

```solidity
function renounceOwnership() external nonpayable;
```

_`msg.sender` is renouncing ownership of contract `address(this)`._

Renounce ownership of the contract in a 2-step process.

1. The first call will initiate the process of renouncing ownership.

2. The second call is used as a confirmation and will leave the contract without an owner.

<br/>

### transferOwnership

:::note References

- Specification details: [**LSP-14-Ownable2Step**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-14-Ownable2Step.md#transferownership)
- Solidity implementation: [`ILSP14Ownable2Step.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp14-contracts/contracts/ILSP14Ownable2Step.sol)
- Function signature: `transferOwnership(address)`
- Function selector: `0xf2fde38b`

:::

```solidity
function transferOwnership(address newOwner) external nonpayable;
```

_Transfer ownership initiated by `newOwner`._

Initiate the process of transferring ownership of the contract by setting the new owner as the pending owner. If the new owner is a contract that supports + implements LSP1, this will also attempt to notify the new owner that ownership has been transferred to them by calling the [`universalReceiver()`](#universalreceiver) function on the `newOwner` contract.

#### Parameters

| Name       |   Type    | Description                   |
| ---------- | :-------: | ----------------------------- |
| `newOwner` | `address` | The address of the new owner. |

<br/>

## Events

### OwnershipRenounced

:::note References

- Specification details: [**LSP-14-Ownable2Step**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-14-Ownable2Step.md#ownershiprenounced)
- Solidity implementation: [`ILSP14Ownable2Step.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp14-contracts/contracts/ILSP14Ownable2Step.sol)
- Event signature: `OwnershipRenounced()`
- Event topic hash: `0xd1f66c3d2bc1993a86be5e3d33709d98f0442381befcedd29f578b9b2506b1ce`

:::

```solidity
event OwnershipRenounced();
```

_Successfully renounced ownership of the contract. This contract is now owned by anyone, it's owner is `address(0)`._

Emitted when the ownership of the contract has been renounced.

<br/>

### OwnershipTransferStarted

:::note References

- Specification details: [**LSP-14-Ownable2Step**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-14-Ownable2Step.md#ownershiptransferstarted)
- Solidity implementation: [`ILSP14Ownable2Step.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp14-contracts/contracts/ILSP14Ownable2Step.sol)
- Event signature: `OwnershipTransferStarted(address,address)`
- Event topic hash: `0x38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e22700`

:::

```solidity
event OwnershipTransferStarted(
  address indexed previousOwner,
  address indexed newOwner
);
```

_The transfer of ownership of the contract was initiated. Pending new owner set to: `newOwner`._

Emitted when [`transferOwnership(..)`](#transferownership) was called and the first step of transferring ownership completed successfully which leads to [`pendingOwner`](#pendingowner) being updated.

#### Parameters

| Name                          |   Type    | Description                        |
| ----------------------------- | :-------: | ---------------------------------- |
| `previousOwner` **`indexed`** | `address` | The address of the previous owner. |
| `newOwner` **`indexed`**      | `address` | The address of the new owner.      |

<br/>

### RenounceOwnershipStarted

:::note References

- Specification details: [**LSP-14-Ownable2Step**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-14-Ownable2Step.md#renounceownershipstarted)
- Solidity implementation: [`ILSP14Ownable2Step.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp14-contracts/contracts/ILSP14Ownable2Step.sol)
- Event signature: `RenounceOwnershipStarted()`
- Event topic hash: `0x81b7f830f1f0084db6497c486cbe6974c86488dcc4e3738eab94ab6d6b1653e7`

:::

```solidity
event RenounceOwnershipStarted();
```

_Ownership renouncement initiated._

Emitted when starting the [`renounceOwnership(..)`](#renounceownership) 2-step process.

<br/>
