<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# ILSP11SocialRecovery

:::info Standard Specifications

[`LSP-11-BasicSocialRecovery`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md)

:::
:::info Solidity implementation

[`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)

:::

> ILSP11SocialRecovery

_Contract providing a mechanism for account recovery through a designated set of guardians._

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### addGuardian

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#addguardian)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Function signature: `addGuardian(address,address)`
- Function selector: `0xc6845210`

:::

```solidity
function addGuardian(address account, address newGuardian) external nonpayable;
```

_Adds a new guardian to the calling account._

This function allows the account holder to add a new guardian to their account. If the provided address is already a guardian for the account, the function will revert. Emits a `GuardianAdded` event upon successful addition of the guardian.

#### Parameters

| Name          |   Type    | Description                                  |
| ------------- | :-------: | -------------------------------------------- |
| `account`     | `address` | -                                            |
| `newGuardian` | `address` | The address of the new guardian to be added. |

<br/>

### cancelRecoveryProcess

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#cancelrecoveryprocess)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Function signature: `cancelRecoveryProcess(address)`
- Function selector: `0x1ce59666`

:::

```solidity
function cancelRecoveryProcess(address account) external nonpayable;
```

_Cancels the ongoing recovery process for the account by increasing the recovery counter._

This function allows the account holder to cancel the ongoing recovery process by incrementing the recovery counter. Emits a `RecoveryCancelled` event upon successful cancellation of the recovery process.

#### Parameters

| Name      |   Type    | Description |
| --------- | :-------: | ----------- |
| `account` | `address` | -           |

<br/>

### commitToRecover

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#committorecover)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Function signature: `commitToRecover(address,address,bytes32)`
- Function selector: `0xa9e3b276`

:::

```solidity
function commitToRecover(
  address account,
  address votedAddress,
  bytes32 commitment
) external nonpayable;
```

_Commits a secret hash for an address to be recovered._

This function allows an address to commit a secret hash for the recovery process. If the guardian has not voted for the provided address, the function will revert.

#### Parameters

| Name           |   Type    | Description                                               |
| -------------- | :-------: | --------------------------------------------------------- |
| `account`      | `address` | The account for which the secret hash is being committed. |
| `votedAddress` | `address` | -                                                         |
| `commitment`   | `bytes32` | The commitment associated with the secret hash.           |

<br/>

### getCommitmentInfoOf

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#getcommitmentinfoof)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Function signature: `getCommitmentInfoOf(address,uint256,address)`
- Function selector: `0x6289a163`

:::

```solidity
function getCommitmentInfoOf(
  address account,
  uint256 recoveryCounter,
  address committedBy
) external view returns (bytes32, uint256);
```

_Get the commitment associated with an address for recovery for a specific account and recovery counter._

#### Parameters

| Name              |   Type    | Description                                               |
| ----------------- | :-------: | --------------------------------------------------------- |
| `account`         | `address` | The account for which the commitment is queried.          |
| `recoveryCounter` | `uint256` | The recovery counter for which the commitment is queried. |
| `committedBy`     | `address` | The address who made the commitment.                      |

#### Returns

| Name |   Type    | Description                                                                                                   |
| ---- | :-------: | ------------------------------------------------------------------------------------------------------------- |
| `0`  | `bytes32` | The commitment associated with the specified address for recovery for the given account and recovery counter. |
| `1`  | `uint256` | -                                                                                                             |

<br/>

### getFirstRecoveryTimestampOf

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#getfirstrecoverytimestampof)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Function signature: `getFirstRecoveryTimestampOf(address,uint256)`
- Function selector: `0x88095527`

:::

```solidity
function getFirstRecoveryTimestampOf(
  address account,
  uint256 recoveryCounter
) external view returns (uint256);
```

_Get the timestamp of the first recovery timestamp of the vote for a specific account and recovery counter._

#### Parameters

| Name              |   Type    | Description                                         |
| ----------------- | :-------: | --------------------------------------------------- |
| `account`         | `address` | The account for which the vote is queried.          |
| `recoveryCounter` | `uint256` | The recovery counter for which the vote is queried. |

#### Returns

| Name |   Type    | Description                                                                                            |
| ---- | :-------: | ------------------------------------------------------------------------------------------------------ |
| `0`  | `uint256` | The timestamp of the first recovery timestamp of the vote for a specific account and recovery counter. |

<br/>

### getGuardiansOf

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#getguardiansof)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Function signature: `getGuardiansOf(address)`
- Function selector: `0x8ca4aaaf`

:::

```solidity
function getGuardiansOf(address account) external view returns (address[]);
```

_Get the array of addresses representing guardians associated with an account._

#### Parameters

| Name      |   Type    | Description                                  |
| --------- | :-------: | -------------------------------------------- |
| `account` | `address` | The account for which guardians are queried. |

#### Returns

| Name |    Type     | Description                                                         |
| ---- | :---------: | ------------------------------------------------------------------- |
| `0`  | `address[]` | An array of addresses representing guardians for the given account. |

<br/>

### getGuardiansThresholdOf

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#getguardiansthresholdof)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Function signature: `getGuardiansThresholdOf(address)`
- Function selector: `0xdbd119bd`

:::

```solidity
function getGuardiansThresholdOf(
  address account
) external view returns (uint256);
```

_Get the guardian threshold for a specific account._

#### Parameters

| Name      |   Type    | Description                                              |
| --------- | :-------: | -------------------------------------------------------- |
| `account` | `address` | The account for which the guardian threshold is queried. |

#### Returns

| Name |   Type    | Description                                       |
| ---- | :-------: | ------------------------------------------------- |
| `0`  | `uint256` | The guardian threshold set for the given account. |

<br/>

### getRecoveryCounterOf

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#getrecoverycounterof)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Function signature: `getRecoveryCounterOf(address)`
- Function selector: `0xcee79d45`

:::

```solidity
function getRecoveryCounterOf(address account) external view returns (uint256);
```

_Get the successful recovery counter for a specific account._

#### Parameters

| Name      |   Type    | Description                                            |
| --------- | :-------: | ------------------------------------------------------ |
| `account` | `address` | The account for which the recovery counter is queried. |

#### Returns

| Name |   Type    | Description                                            |
| ---- | :-------: | ------------------------------------------------------ |
| `0`  | `uint256` | The successful recovery counter for the given account. |

<br/>

### getRecoveryDelayOf

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#getrecoverydelayof)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Function signature: `getRecoveryDelayOf(address)`
- Function selector: `0x02543bff`

:::

```solidity
function getRecoveryDelayOf(address account) external view returns (uint256);
```

_Get the recovery delay associated with a specific account._

#### Parameters

| Name      |   Type    | Description                                          |
| --------- | :-------: | ---------------------------------------------------- |
| `account` | `address` | The account for which the recovery delay is queried. |

#### Returns

| Name |   Type    | Description                                           |
| ---- | :-------: | ----------------------------------------------------- |
| `0`  | `uint256` | The recovery delay associated with the given account. |

<br/>

### getSecretHashOf

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#getsecrethashof)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Function signature: `getSecretHashOf(address)`
- Function selector: `0x06fe1738`

:::

```solidity
function getSecretHashOf(address account) external view returns (bytes32);
```

_Get the secret hash associated with a specific account._

#### Parameters

| Name      |   Type    | Description                                       |
| --------- | :-------: | ------------------------------------------------- |
| `account` | `address` | The account for which the secret hash is queried. |

#### Returns

| Name |   Type    | Description                                        |
| ---- | :-------: | -------------------------------------------------- |
| `0`  | `bytes32` | The secret hash associated with the given account. |

<br/>

### getVotedAddressByGuardian

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#getvotedaddressbyguardian)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Function signature: `getVotedAddressByGuardian(address,uint256,address)`
- Function selector: `0x506d1a0f`

:::

```solidity
function getVotedAddressByGuardian(
  address account,
  uint256 recoveryCounter,
  address guardian
) external view returns (address);
```

_Get the address voted for recovery by a guardian for a specific account and recovery counter._

#### Parameters

| Name              |   Type    | Description                                         |
| ----------------- | :-------: | --------------------------------------------------- |
| `account`         | `address` | The account for which the vote is queried.          |
| `recoveryCounter` | `uint256` | The recovery counter for which the vote is queried. |
| `guardian`        | `address` | The guardian whose vote is queried.                 |

#### Returns

| Name |   Type    | Description                                                                                          |
| ---- | :-------: | ---------------------------------------------------------------------------------------------------- |
| `0`  | `address` | The address voted for recovery by the specified guardian for the given account and recovery counter. |

<br/>

### getVotesOfGuardianVotedAddress

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#getvotesofguardianvotedaddress)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Function signature: `getVotesOfGuardianVotedAddress(address,uint256,address)`
- Function selector: `0xa65068b6`

:::

```solidity
function getVotesOfGuardianVotedAddress(
  address account,
  uint256 recoveryCounter,
  address votedAddress
) external view returns (uint256);
```

_Get the number of votes an address has received from guardians for a specific account and recovery counter._

#### Parameters

| Name              |   Type    | Description                                           |
| ----------------- | :-------: | ----------------------------------------------------- |
| `account`         | `address` | The account for which the votes are queried.          |
| `recoveryCounter` | `uint256` | The recovery counter for which the votes are queried. |
| `votedAddress`    | `address` | The address for which the votes are queried.          |

#### Returns

| Name |   Type    | Description                                                                                                       |
| ---- | :-------: | ----------------------------------------------------------------------------------------------------------------- |
| `0`  | `uint256` | The number of votes the specified address has received from guardians for the given account and recovery counter. |

<br/>

### hasReachedThreshold

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#hasreachedthreshold)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Function signature: `hasReachedThreshold(address,uint256,address)`
- Function selector: `0xd617b890`

:::

```solidity
function hasReachedThreshold(
  address account,
  uint256 recoveryCounter,
  address votedAddress
) external view returns (bool);
```

_Checks if the votes received by a given address from guardians have reached the threshold necessary for account recovery._

This function evaluates if the number of votes from guardians for a specific voted address meets or exceeds the required threshold for account recovery. This is part of the account recovery process where guardians vote for the legitimacy of a recovery address.

#### Parameters

| Name              |   Type    | Description                                                      |
| ----------------- | :-------: | ---------------------------------------------------------------- |
| `account`         | `address` | The account for which the threshold check is performed.          |
| `recoveryCounter` | `uint256` | The recovery counter for which the threshold check is performed. |
| `votedAddress`    | `address` | The address for which the votes are counted.                     |

#### Returns

| Name |  Type  | Description                                                                                                                                       |
| ---- | :----: | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0`  | `bool` | A boolean indicating whether the votes for the specified address have reached the necessary threshold for the given account and recovery counter. |

<br/>

### isGuardianOf

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#isguardianof)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Function signature: `isGuardianOf(address,address)`
- Function selector: `0x769e54df`

:::

```solidity
function isGuardianOf(
  address account,
  address guardianAddress
) external view returns (bool);
```

_Check if an address is a guardian for a specific account._

#### Parameters

| Name              |   Type    | Description                                                      |
| ----------------- | :-------: | ---------------------------------------------------------------- |
| `account`         | `address` | The account to check for guardian status.                        |
| `guardianAddress` | `address` | The address to verify if it's a guardian for the given account.. |

#### Returns

| Name |  Type  | Description                                                                   |
| ---- | :----: | ----------------------------------------------------------------------------- |
| `0`  | `bool` | A boolean indicating whether the address is a guardian for the given account. |

<br/>

### recoverAccess

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#recoveraccess)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Function signature: `recoverAccess(address,address,bytes32,bytes32,bytes)`
- Function selector: `0xf3b3c785`

:::

```solidity
function recoverAccess(
  address votedAddress,
  address account,
  bytes32 secretHash,
  bytes32 newSecretHash,
  bytes calldataToExecute
) external payable returns (bytes);
```

_Initiates the account recovery process._

This function initiates the account recovery process and executes the provided calldata. If the new secret hash is zero or the number of votes is less than the guardian threshold, the function will revert. Emits a `RecoveryProcessSuccessful` event upon successful recovery process.

#### Parameters

| Name                |   Type    | Description                                              |
| ------------------- | :-------: | -------------------------------------------------------- |
| `votedAddress`      | `address` | -                                                        |
| `account`           | `address` | The account for which the recovery is being initiated.   |
| `secretHash`        | `bytes32` | The hash associated with the recovery process.           |
| `newSecretHash`     | `bytes32` | The new secret hash to be set for the account.           |
| `calldataToExecute` |  `bytes`  | The calldata to be executed during the recovery process. |

#### Returns

| Name |  Type   | Description |
| ---- | :-----: | ----------- |
| `0`  | `bytes` | -           |

<br/>

### removeGuardian

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#removeguardian)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Function signature: `removeGuardian(address,address)`
- Function selector: `0x9b27a90e`

:::

```solidity
function removeGuardian(
  address account,
  address existingGuardian
) external nonpayable;
```

_Removes an existing guardian from the calling account._

This function allows the account holder to remove an existing guardian from their account. If the provided address is not a current guardian or the removal would violate the guardian threshold, the function will revert. Emits a `GuardianRemoved` event upon successful removal of the guardian.

#### Parameters

| Name               |   Type    | Description                                         |
| ------------------ | :-------: | --------------------------------------------------- |
| `account`          | `address` | -                                                   |
| `existingGuardian` | `address` | The address of the existing guardian to be removed. |

<br/>

### setGuardiansThreshold

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#setguardiansthreshold)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Function signature: `setGuardiansThreshold(address,uint256)`
- Function selector: `0x639cea19`

:::

```solidity
function setGuardiansThreshold(
  address account,
  uint256 newThreshold
) external nonpayable;
```

_Sets the guardian threshold for the calling account._

This function allows the account holder to set the guardian threshold for their account. If the provided threshold exceeds the number of current guardians, the function will revert. Emits a `GuardiansThresholdChanged` event upon successful threshold modification.

#### Parameters

| Name           |   Type    | Description                                                   |
| -------------- | :-------: | ------------------------------------------------------------- |
| `account`      | `address` | -                                                             |
| `newThreshold` | `uint256` | The new guardian threshold to be set for the calling account. |

<br/>

### setRecoveryDelay

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#setrecoverydelay)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Function signature: `setRecoveryDelay(address,uint256)`
- Function selector: `0xa219b404`

:::

```solidity
function setRecoveryDelay(
  address account,
  uint256 recoveryDelay
) external nonpayable;
```

_Sets the recovery delay for the calling account._

This function allows the account to set a new recovery delay for their account. Emits a `RecoveryDelayChanged` event upon successful secret hash modification.

#### Parameters

| Name            |   Type    | Description                                                         |
| --------------- | :-------: | ------------------------------------------------------------------- |
| `account`       | `address` | The address of the account to which the recovery delay will be set. |
| `recoveryDelay` | `uint256` | The new recovery delay to be set for the calling account.           |

<br/>

### setRecoverySecretHash

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#setrecoverysecrethash)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Function signature: `setRecoverySecretHash(address,bytes32)`
- Function selector: `0x78f84ebd`

:::

```solidity
function setRecoverySecretHash(
  address account,
  bytes32 newRecoverSecretHash
) external nonpayable;
```

_Sets the recovery secret hash for the calling account._

This function allows the account holder to set a new recovery secret hash for their account. If the provided secret hash is zero, the function will revert. Emits a `SecretHashChanged` event upon successful secret hash modification.

#### Parameters

| Name                   |   Type    | Description                                                     |
| ---------------------- | :-------: | --------------------------------------------------------------- |
| `account`              | `address` | -                                                               |
| `newRecoverSecretHash` | `bytes32` | The new recovery secret hash to be set for the calling account. |

<br/>

### voteForRecovery

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#voteforrecovery)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Function signature: `voteForRecovery(address,address,address)`
- Function selector: `0xfa04a7f1`

:::

```solidity
function voteForRecovery(
  address account,
  address guardian,
  address guardianVotedAddress
) external nonpayable;
```

_Allows a guardian to vote for an address to be recovered._

This function allows a guardian to vote for an address to be recovered in a recovery process. If the guardian has already voted for the provided address, the function will revert. Emits a `GuardianVotedFor` event upon successful vote.

#### Parameters

| Name                   |   Type    | Description                                     |
| ---------------------- | :-------: | ----------------------------------------------- |
| `account`              | `address` | The account for which the vote is being cast.   |
| `guardian`             | `address` | -                                               |
| `guardianVotedAddress` | `address` | The address voted by the guardian for recovery. |

<br/>

## Events

### GuardianAdded

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#guardianadded)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Event signature: `GuardianAdded(address,address)`
- Event topic hash: `0xbc3292102fa77e083913064b282926717cdfaede4d35f553d66366c0a3da755a`

:::

```solidity
event GuardianAdded(address indexed account, address indexed guardian);
```

_Event emitted when a guardian is added for an account._

#### Parameters

| Name                     |   Type    | Description                                        |
| ------------------------ | :-------: | -------------------------------------------------- |
| `account` **`indexed`**  | `address` | The account for which the guardian is being added. |
| `guardian` **`indexed`** | `address` | The address of the new guardian being added.       |

<br/>

### GuardianRemoved

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#guardianremoved)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Event signature: `GuardianRemoved(address,address)`
- Event topic hash: `0xee943cdb81826d5909c559c6b1ae6908fcaf2dbc16c4b730346736b486283e8b`

:::

```solidity
event GuardianRemoved(address indexed account, address indexed guardian);
```

_Event emitted when a guardian is removed for an account._

#### Parameters

| Name                     |   Type    | Description                                           |
| ------------------------ | :-------: | ----------------------------------------------------- |
| `account` **`indexed`**  | `address` | The account from which the guardian is being removed. |
| `guardian` **`indexed`** | `address` | The address of the guardian being removed.            |

<br/>

### GuardianVotedFor

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#guardianvotedfor)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Event signature: `GuardianVotedFor(address,uint256,address,address)`
- Event topic hash: `0x6e8b2d5fb446171938316212bee6fc889dccfacfdb73d7ffbfb4d5f784c90b99`

:::

```solidity
event GuardianVotedFor(
  address indexed account,
  uint256 recoveryCounter,
  address indexed guardian,
  address indexed guardianVotedAddress
);
```

_Event emitted when a guardian votes for an address to be recovered._

#### Parameters

| Name                                 |   Type    | Description                                     |
| ------------------------------------ | :-------: | ----------------------------------------------- |
| `account` **`indexed`**              | `address` | The account for which the vote is being cast.   |
| `recoveryCounter`                    | `uint256` | The recovery counter at the time of voting.     |
| `guardian` **`indexed`**             | `address` | The guardian casting the vote.                  |
| `guardianVotedAddress` **`indexed`** | `address` | The address voted by the guardian for recovery. |

<br/>

### GuardiansThresholdChanged

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#guardiansthresholdchanged)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Event signature: `GuardiansThresholdChanged(address,uint256)`
- Event topic hash: `0x996d956afb7500c4fb0d329508832321c79e3f8fbee914c7e3cf1700053b4b39`

:::

```solidity
event GuardiansThresholdChanged(
  address indexed account,
  uint256 indexed guardianThreshold
);
```

_Event emitted when the guardian threshold for an account is changed._

#### Parameters

| Name                              |   Type    | Description                                                    |
| --------------------------------- | :-------: | -------------------------------------------------------------- |
| `account` **`indexed`**           | `address` | The account for which the guardian threshold is being changed. |
| `guardianThreshold` **`indexed`** | `uint256` | The new guardian threshold for the account.                    |

<br/>

### RecoveryCancelled

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#recoverycancelled)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Event signature: `RecoveryCancelled(address,uint256)`
- Event topic hash: `0x500ec1d4b692d3c788bfd78a898de379cfd93ab8177575efc7593f87bd051a07`

:::

```solidity
event RecoveryCancelled(
  address indexed account,
  uint256 indexed previousRecoveryCounter
);
```

_Event emitted when a recovery process is cancelled for an account._

#### Parameters

| Name                                    |   Type    | Description                                               |
| --------------------------------------- | :-------: | --------------------------------------------------------- |
| `account` **`indexed`**                 | `address` | The account for which the recovery process was cancelled. |
| `previousRecoveryCounter` **`indexed`** | `uint256` | The recovery counter before cancellation.                 |

<br/>

### RecoveryDelayChanged

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#recoverydelaychanged)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Event signature: `RecoveryDelayChanged(address,uint256)`
- Event topic hash: `0xdc9e5e7eb38f77984d9a899bfdc7ca9e531f85f450602723e2adb9a37cebf4bc`

:::

```solidity
event RecoveryDelayChanged(
  address indexed account,
  uint256 indexed recoveryDelay
);
```

_Event emitted when the recovery delay associated with an account is changed._

#### Parameters

| Name                          |   Type    | Description                                                |
| ----------------------------- | :-------: | ---------------------------------------------------------- |
| `account` **`indexed`**       | `address` | The account for which the recovery delay is being changed. |
| `recoveryDelay` **`indexed`** | `uint256` | The new recovery delay for the account in seconds.         |

<br/>

### RecoveryProcessSuccessful

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#recoveryprocesssuccessful)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Event signature: `RecoveryProcessSuccessful(address,uint256,address,bytes)`
- Event topic hash: `0x813cb1764d0ee698a363ee823a078c5d80bef414205b6d280820336972cf6d99`

:::

```solidity
event RecoveryProcessSuccessful(
  address indexed account,
  uint256 indexed recoveryCounter,
  address indexed guardianVotedAddress,
  bytes calldataExecuted
);
```

_Event emitted when a recovery process is successful for an account._

#### Parameters

| Name                                 |   Type    | Description                                                 |
| ------------------------------------ | :-------: | ----------------------------------------------------------- |
| `account` **`indexed`**              | `address` | The account for which the recovery process was successful.  |
| `recoveryCounter` **`indexed`**      | `uint256` | The recovery counter at the time of successful recovery.    |
| `guardianVotedAddress` **`indexed`** | `address` | The address voted by guardians for the successful recovery. |
| `calldataExecuted`                   |  `bytes`  | The calldata executed on the account recovered.             |

<br/>

### SecretHashChanged

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#secrethashchanged)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Event signature: `SecretHashChanged(address,bytes32)`
- Event topic hash: `0xf1d777ea951a50389c566bd715dcc9fb133ff06f077278fde63b3c6d544580a2`

:::

```solidity
event SecretHashChanged(address indexed account, bytes32 indexed secretHash);
```

_Event emitted when the secret hash associated with an account is changed._

#### Parameters

| Name                       |   Type    | Description                                             |
| -------------------------- | :-------: | ------------------------------------------------------- |
| `account` **`indexed`**    | `address` | The account for which the secret hash is being changed. |
| `secretHash` **`indexed`** | `bytes32` | The new secret hash for the account.                    |

<br/>

### SecretHashCommitted

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#secrethashcommitted)
- Solidity implementation: [`ILSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/ILSP11SocialRecovery.sol)
- Event signature: `SecretHashCommitted(address,uint256,address,bytes32)`
- Event topic hash: `0x896d444743de428958414d9a86fad106a57cb372ee349d27b86fe2d51622209c`

:::

```solidity
event SecretHashCommitted(
  address indexed account,
  uint256 recoveryCounter,
  address indexed committedBy,
  bytes32 indexed commitment
);
```

_Event emitted when an address commits a secret hash to recover an account._

#### Parameters

| Name                        |   Type    | Description                                               |
| --------------------------- | :-------: | --------------------------------------------------------- |
| `account` **`indexed`**     | `address` | The account for which the secret hash is being committed. |
| `recoveryCounter`           | `uint256` | The recovery counter at the time of the commitment.       |
| `committedBy` **`indexed`** | `address` | The address who made the commitment.                      |
| `commitment` **`indexed`**  | `bytes32` | The commitment associated with the secret hash.           |

<br/>
