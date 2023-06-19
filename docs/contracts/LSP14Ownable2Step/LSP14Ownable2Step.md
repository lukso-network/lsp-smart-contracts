# LSP14Ownable2Step

:::info Soldity contract

[`LSP14Ownable2Step.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP14Ownable2Step/LSP14Ownable2Step.sol)

:::

> LSP14Ownable2Step

This contract is a modified version of the OwnableUnset implementation, where transferring and renouncing ownership works as a 2 steps process. This can be used as a confirmation mechanism to prevent potential mistakes when transferring ownership of the contract, where the control of the contract could be lost forever.

## Methods

### RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY

:::note Links

- Specification details in [**LSP-14-Ownable2Step**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-14-Ownable2Step.md#renounce_ownership_confirmation_delay)
- Solidity implementation in [**LSP14Ownable2Step**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP14Ownable2Step/LSP14Ownable2Step.sol)
- Function signature: `RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY()`
- Function selector: `0xead3fbdf`

:::

```solidity
function RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY()
  external
  view
  returns (uint256);
```

The number of block that MUST pass before one is able to confirm renouncing ownership

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `uint256` | -           |

### RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD

:::note Links

- Specification details in [**LSP-14-Ownable2Step**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-14-Ownable2Step.md#renounce_ownership_confirmation_period)
- Solidity implementation in [**LSP14Ownable2Step**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP14Ownable2Step/LSP14Ownable2Step.sol)
- Function signature: `RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD()`
- Function selector: `0x01bfba61`

:::

```solidity
function RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD()
  external
  view
  returns (uint256);
```

The number of blocks during which one can renounce ownership

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `uint256` | -           |

### acceptOwnership

:::note Links

- Specification details in [**LSP-14-Ownable2Step**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-14-Ownable2Step.md#acceptownership)
- Solidity implementation in [**LSP14Ownable2Step**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP14Ownable2Step/LSP14Ownable2Step.sol)
- Function signature: `acceptOwnership()`
- Function selector: `0x79ba5097`

:::

```solidity
function acceptOwnership() external nonpayable;
```

Transfer ownership of the contract from the current [`owner()`](#`owner) to the [`pendingOwner()`](#`pendingowner). Once this function is called:

- the current [`owner()`](#`owner) will loose access to the functions restricted to the [`owner()`](#`owner) only.

- the [`pendingOwner()`](#`pendingowner) will gain access to the functions restricted to the [`owner()`](#`owner) only.

### owner

:::note Links

- Specification details in [**LSP-14-Ownable2Step**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-14-Ownable2Step.md#owner)
- Solidity implementation in [**LSP14Ownable2Step**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP14Ownable2Step/LSP14Ownable2Step.sol)
- Function signature: `owner()`
- Function selector: `0x8da5cb5b`

:::

```solidity
function owner() external view returns (address);
```

Returns the address of the current owner.

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `address` | -           |

### pendingOwner

:::note Links

- Specification details in [**LSP-14-Ownable2Step**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-14-Ownable2Step.md#pendingowner)
- Solidity implementation in [**LSP14Ownable2Step**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP14Ownable2Step/LSP14Ownable2Step.sol)
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

### renounceOwnership

:::note Links

- Specification details in [**LSP-14-Ownable2Step**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-14-Ownable2Step.md#renounceownership)
- Solidity implementation in [**LSP14Ownable2Step**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP14Ownable2Step/LSP14Ownable2Step.sol)
- Function signature: `renounceOwnership()`
- Function selector: `0x715018a6`

:::

```solidity
function renounceOwnership() external nonpayable;
```

Renounce ownership of the contract in a two step process.

1. the first call will initiate the process of renouncing ownership.

2. the second is used as a confirmation and will leave the contract without an owner.

### transferOwnership

:::note Links

- Specification details in [**LSP-14-Ownable2Step**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-14-Ownable2Step.md#transferownership)
- Solidity implementation in [**LSP14Ownable2Step**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP14Ownable2Step/LSP14Ownable2Step.sol)
- Function signature: `transferOwnership(address)`
- Function selector: `0xf2fde38b`

:::

```solidity
function transferOwnership(address newOwner) external nonpayable;
```

Initiate the process of transferring ownership of the contract by setting the new owner as the pending owner. If the new owner is a contract that supports + implements LSP1, this will also attempt to notify the new owner that ownership has been transferred to them by calling the [`universalReceiver()`](#`universalreceiver) function on the `newOwner` contract.

#### Parameters

| Name       |   Type    | Description                   |
| ---------- | :-------: | ----------------------------- |
| `newOwner` | `address` | the address of the new owner. |

## Events

### OwnershipRenounced

:::note Links

- Specification details in [**LSP-14-Ownable2Step**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-14-Ownable2Step.md#ownershiprenounced)
- Solidity implementation in [**LSP14Ownable2Step**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP14Ownable2Step/LSP14Ownable2Step.sol)
- Event signature: `OwnershipRenounced()`
- Event hash: `0xd1f66c3d2bc1993a86be5e3d33709d98f0442381befcedd29f578b9b2506b1ce`

:::

```solidity
event OwnershipRenounced();
```

### OwnershipTransferStarted

:::note Links

- Specification details in [**LSP-14-Ownable2Step**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-14-Ownable2Step.md#ownershiptransferstarted)
- Solidity implementation in [**LSP14Ownable2Step**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP14Ownable2Step/LSP14Ownable2Step.sol)
- Event signature: `OwnershipTransferStarted(address,address)`
- Event hash: `0x38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e22700`

:::

```solidity
event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
```

#### Parameters

| Name                          |   Type    | Description |
| ----------------------------- | :-------: | ----------- |
| `previousOwner` **`indexed`** | `address` | -           |
| `newOwner` **`indexed`**      | `address` | -           |

### OwnershipTransferred

:::note Links

- Specification details in [**LSP-14-Ownable2Step**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-14-Ownable2Step.md#ownershiptransferred)
- Solidity implementation in [**LSP14Ownable2Step**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP14Ownable2Step/LSP14Ownable2Step.sol)
- Event signature: `OwnershipTransferred(address,address)`
- Event hash: `0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0`

:::

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
```

#### Parameters

| Name                          |   Type    | Description |
| ----------------------------- | :-------: | ----------- |
| `previousOwner` **`indexed`** | `address` | -           |
| `newOwner` **`indexed`**      | `address` | -           |

### RenounceOwnershipStarted

:::note Links

- Specification details in [**LSP-14-Ownable2Step**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-14-Ownable2Step.md#renounceownershipstarted)
- Solidity implementation in [**LSP14Ownable2Step**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP14Ownable2Step/LSP14Ownable2Step.sol)
- Event signature: `RenounceOwnershipStarted()`
- Event hash: `0x81b7f830f1f0084db6497c486cbe6974c86488dcc4e3738eab94ab6d6b1653e7`

:::

```solidity
event RenounceOwnershipStarted();
```

## Errors

### CannotTransferOwnershipToSelf

:::note Links

- Specification details in [**LSP-14-Ownable2Step**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-14-Ownable2Step.md#cannottransferownershiptoself)
- Solidity implementation in [**LSP14Ownable2Step**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP14Ownable2Step/LSP14Ownable2Step.sol)
- Error signature: `CannotTransferOwnershipToSelf()`
- Error hash: `0x43b248cd`

:::

```solidity
error CannotTransferOwnershipToSelf();
```

reverts when trying to transfer ownership to the address(this)

### NotInRenounceOwnershipInterval

:::note Links

- Specification details in [**LSP-14-Ownable2Step**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-14-Ownable2Step.md#notinrenounceownershipinterval)
- Solidity implementation in [**LSP14Ownable2Step**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP14Ownable2Step/LSP14Ownable2Step.sol)
- Error signature: `NotInRenounceOwnershipInterval(uint256,uint256)`
- Error hash: `0x8b9bf507`

:::

```solidity
error NotInRenounceOwnershipInterval(
  uint256 renounceOwnershipStart,
  uint256 renounceOwnershipEnd
);
```

reverts when trying to renounce ownership before the initial confirmation delay

#### Parameters

| Name                     |   Type    | Description |
| ------------------------ | :-------: | ----------- |
| `renounceOwnershipStart` | `uint256` | -           |
| `renounceOwnershipEnd`   | `uint256` | -           |
