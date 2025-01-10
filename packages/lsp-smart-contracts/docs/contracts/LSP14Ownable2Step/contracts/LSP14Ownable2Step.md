<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP14Ownable2Step

:::info Standard Specifications

[`LSP-14-Ownable2Step`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-14-Ownable2Step.md)

:::
:::info Solidity implementation

[`LSP14Ownable2Step.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp14-contracts/contracts/LSP14Ownable2Step.sol)

:::

> LSP14Ownable2Step

This contract is a modified version of the [`OwnableUnset.sol`] implementation, where transferring and renouncing ownership works as a 2-step process. This can be used as a confirmation mechanism to prevent potential mistakes when transferring ownership of the contract, where the control of the contract could be lost forever. (_e.g: providing the wrong address as a parameter to the function, transferring ownership to an EOA for which the user lost its private key, etc..._)

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY

:::note References

- Specification details: [**LSP-14-Ownable2Step**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-14-Ownable2Step.md#renounce_ownership_confirmation_delay)
- Solidity implementation: [`LSP14Ownable2Step.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp14-contracts/contracts/LSP14Ownable2Step.sol)
- Function signature: `RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY()`
- Function selector: `0xead3fbdf`

:::

```solidity
function RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY()
  external
  view
  returns (uint256);
```

The number of block that MUST pass before one is able to confirm renouncing ownership.

#### Returns

| Name |   Type    | Description       |
| ---- | :-------: | ----------------- |
| `0`  | `uint256` | Number of blocks. |

<br/>

### RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD

:::note References

- Specification details: [**LSP-14-Ownable2Step**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-14-Ownable2Step.md#renounce_ownership_confirmation_period)
- Solidity implementation: [`LSP14Ownable2Step.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp14-contracts/contracts/LSP14Ownable2Step.sol)
- Function signature: `RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD()`
- Function selector: `0x01bfba61`

:::

```solidity
function RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD()
  external
  view
  returns (uint256);
```

The number of blocks during which one can renounce ownership.

#### Returns

| Name |   Type    | Description       |
| ---- | :-------: | ----------------- |
| `0`  | `uint256` | Number of blocks. |

<br/>

### acceptOwnership

:::note References

- Specification details: [**LSP-14-Ownable2Step**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-14-Ownable2Step.md#acceptownership)
- Solidity implementation: [`LSP14Ownable2Step.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp14-contracts/contracts/LSP14Ownable2Step.sol)
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

<blockquote>

**Requirements:**

- This function can only be called by the [`pendingOwner()`](#pendingowner).

</blockquote>

<br/>

### owner

:::note References

- Specification details: [**LSP-14-Ownable2Step**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-14-Ownable2Step.md#owner)
- Solidity implementation: [`LSP14Ownable2Step.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp14-contracts/contracts/LSP14Ownable2Step.sol)
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

<br/>

### pendingOwner

:::note References

- Specification details: [**LSP-14-Ownable2Step**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-14-Ownable2Step.md#pendingowner)
- Solidity implementation: [`LSP14Ownable2Step.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp14-contracts/contracts/LSP14Ownable2Step.sol)
- Function signature: `pendingOwner()`
- Function selector: `0xe30c3978`

:::

:::info

If no ownership transfer is in progress, the pendingOwner will be `address(0).`.

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
- Solidity implementation: [`LSP14Ownable2Step.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp14-contracts/contracts/LSP14Ownable2Step.sol)
- Function signature: `renounceOwnership()`
- Function selector: `0x715018a6`

:::

:::danger

Leaves the contract without an owner. Once ownership of the contract has been renounced, any function that is restricted to be called only by the owner will be permanently inaccessible, making these functions not callable anymore and unusable.

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
- Solidity implementation: [`LSP14Ownable2Step.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp14-contracts/contracts/LSP14Ownable2Step.sol)
- Function signature: `transferOwnership(address)`
- Function selector: `0xf2fde38b`

:::

```solidity
function transferOwnership(address newOwner) external nonpayable;
```

_Transfer ownership initiated by `newOwner`._

Initiate the process of transferring ownership of the contract by setting the new owner as the pending owner. If the new owner is a contract that supports + implements LSP1, this will also attempt to notify the new owner that ownership has been transferred to them by calling the [`universalReceiver()`](#universalreceiver) function on the `newOwner` contract.

<blockquote>

**Requirements:**

- `newOwner` cannot accept ownership of the contract in the same transaction. (For instance, via a callback from its [`universalReceiver(...)`](#universalreceiver) function).

</blockquote>

#### Parameters

| Name       |   Type    | Description                   |
| ---------- | :-------: | ----------------------------- |
| `newOwner` | `address` | The address of the new owner. |

<br/>

## Internal Methods

Any method labeled as `internal` serves as utility function within the contract. They can be used when writing solidity contracts that inherit from this contract. These methods can be extended or modified by overriding their internal behavior to suit specific needs.

Internal functions cannot be called externally, whether from other smart contracts, dApp interfaces, or backend services. Their restricted accessibility ensures that they remain exclusively available within the context of the current contract, promoting controlled and encapsulated usage of these internal utilities.

### \_checkOwner

```solidity
function _checkOwner() internal view;
```

Throws if the sender is not the owner.

<br/>

### \_setOwner

```solidity
function _setOwner(address newOwner) internal nonpayable;
```

Changes the owner if `newOwner` and oldOwner are different
This pattern is useful in inheritance.

<br/>

### \_transferOwnership

```solidity
function _transferOwnership(address newOwner) internal nonpayable;
```

Set the pending owner of the contract and cancel any renounce ownership process that was previously started.

<blockquote>

**Requirements:**

- `newOwner` cannot be the address of the contract itself.

</blockquote>

#### Parameters

| Name       |   Type    | Description                           |
| ---------- | :-------: | ------------------------------------- |
| `newOwner` | `address` | The address of the new pending owner. |

<br/>

### \_acceptOwnership

```solidity
function _acceptOwnership() internal nonpayable;
```

Set the pending owner of the contract as the new owner.

<br/>

### \_renounceOwnership

```solidity
function _renounceOwnership() internal nonpayable;
```

Initiate or confirm the process of renouncing ownership after a specific delay of blocks have passed.

<br/>

## Events

### OwnershipRenounced

:::note References

- Specification details: [**LSP-14-Ownable2Step**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-14-Ownable2Step.md#ownershiprenounced)
- Solidity implementation: [`LSP14Ownable2Step.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp14-contracts/contracts/LSP14Ownable2Step.sol)
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
- Solidity implementation: [`LSP14Ownable2Step.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp14-contracts/contracts/LSP14Ownable2Step.sol)
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

### OwnershipTransferred

:::note References

- Specification details: [**LSP-14-Ownable2Step**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-14-Ownable2Step.md#ownershiptransferred)
- Solidity implementation: [`LSP14Ownable2Step.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp14-contracts/contracts/LSP14Ownable2Step.sol)
- Event signature: `OwnershipTransferred(address,address)`
- Event topic hash: `0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0`

:::

```solidity
event OwnershipTransferred(
  address indexed previousOwner,
  address indexed newOwner
);
```

#### Parameters

| Name                          |   Type    | Description |
| ----------------------------- | :-------: | ----------- |
| `previousOwner` **`indexed`** | `address` | -           |
| `newOwner` **`indexed`**      | `address` | -           |

<br/>

### RenounceOwnershipStarted

:::note References

- Specification details: [**LSP-14-Ownable2Step**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-14-Ownable2Step.md#renounceownershipstarted)
- Solidity implementation: [`LSP14Ownable2Step.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp14-contracts/contracts/LSP14Ownable2Step.sol)
- Event signature: `RenounceOwnershipStarted()`
- Event topic hash: `0x81b7f830f1f0084db6497c486cbe6974c86488dcc4e3738eab94ab6d6b1653e7`

:::

```solidity
event RenounceOwnershipStarted();
```

_Ownership renouncement initiated._

Emitted when starting the [`renounceOwnership(..)`](#renounceownership) 2-step process.

<br/>

## Errors

### LSP14CallerNotPendingOwner

:::note References

- Specification details: [**LSP-14-Ownable2Step**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-14-Ownable2Step.md#lsp14callernotpendingowner)
- Solidity implementation: [`LSP14Ownable2Step.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp14-contracts/contracts/LSP14Ownable2Step.sol)
- Error signature: `LSP14CallerNotPendingOwner(address)`
- Error hash: `0x451e4528`

:::

```solidity
error LSP14CallerNotPendingOwner(address caller);
```

Reverts when the `caller` that is trying to accept ownership of the contract is not the pending owner.

#### Parameters

| Name     |   Type    | Description                                 |
| -------- | :-------: | ------------------------------------------- |
| `caller` | `address` | The address that tried to accept ownership. |

<br/>

### LSP14CannotTransferOwnershipToSelf

:::note References

- Specification details: [**LSP-14-Ownable2Step**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-14-Ownable2Step.md#lsp14cannottransferownershiptoself)
- Solidity implementation: [`LSP14Ownable2Step.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp14-contracts/contracts/LSP14Ownable2Step.sol)
- Error signature: `LSP14CannotTransferOwnershipToSelf()`
- Error hash: `0xe052a6f8`

:::

```solidity
error LSP14CannotTransferOwnershipToSelf();
```

_Cannot transfer ownership to the address of the contract itself._

Reverts when trying to transfer ownership to the `address(this)`.

<br/>

### LSP14MustAcceptOwnershipInSeparateTransaction

:::note References

- Specification details: [**LSP-14-Ownable2Step**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-14-Ownable2Step.md#lsp14mustacceptownershipinseparatetransaction)
- Solidity implementation: [`LSP14Ownable2Step.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp14-contracts/contracts/LSP14Ownable2Step.sol)
- Error signature: `LSP14MustAcceptOwnershipInSeparateTransaction()`
- Error hash: `0x5758dd07`

:::

```solidity
error LSP14MustAcceptOwnershipInSeparateTransaction();
```

_Cannot accept ownership in the same transaction with [`transferOwnership(...)`](#transferownership)._

Reverts when pending owner accept ownership in the same transaction of transferring ownership.

<br/>

### LSP14NotInRenounceOwnershipInterval

:::note References

- Specification details: [**LSP-14-Ownable2Step**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-14-Ownable2Step.md#lsp14notinrenounceownershipinterval)
- Solidity implementation: [`LSP14Ownable2Step.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp14-contracts/contracts/LSP14Ownable2Step.sol)
- Error signature: `LSP14NotInRenounceOwnershipInterval(uint256,uint256)`
- Error hash: `0x1b080942`

:::

```solidity
error LSP14NotInRenounceOwnershipInterval(
  uint256 renounceOwnershipStart,
  uint256 renounceOwnershipEnd
);
```

_Cannot confirm ownership renouncement yet. The ownership renouncement is allowed from: `renounceOwnershipStart` until: `renounceOwnershipEnd`._

Reverts when trying to renounce ownership before the initial confirmation delay.

#### Parameters

| Name                     |   Type    | Description                                                             |
| ------------------------ | :-------: | ----------------------------------------------------------------------- |
| `renounceOwnershipStart` | `uint256` | The start timestamp when one can confirm the renouncement of ownership. |
| `renounceOwnershipEnd`   | `uint256` | The end timestamp when one can confirm the renouncement of ownership.   |

<br/>

### OwnableCallerNotTheOwner

:::note References

- Specification details: [**LSP-14-Ownable2Step**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-14-Ownable2Step.md#ownablecallernottheowner)
- Solidity implementation: [`LSP14Ownable2Step.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp14-contracts/contracts/LSP14Ownable2Step.sol)
- Error signature: `OwnableCallerNotTheOwner(address)`
- Error hash: `0xbf1169c5`

:::

```solidity
error OwnableCallerNotTheOwner(address callerAddress);
```

Reverts when only the owner is allowed to call the function.

#### Parameters

| Name            |   Type    | Description                              |
| --------------- | :-------: | ---------------------------------------- |
| `callerAddress` | `address` | The address that tried to make the call. |

<br/>
