<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP11SocialRecovery

:::info Standard Specifications

[`LSP-11-BasicSocialRecovery`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md)

:::
:::info Solidity implementation

[`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)

:::

> LSP11SocialRecovery

_Contract providing a mechanism for account recovery through a designated set of guardians._

This contract can be used as a backbone for other smart contracts to implement meta-transactions via the LSP25 Execute Relay Call interface. It contains a storage of nonces for signer addresses across various channel IDs, enabling these signers to submit signed transactions that order-independent. (transactions that do not need to be submitted one after the other in a specific order). Finally, it contains internal functions to verify signatures for specific calldata according the signature format specified in the LSP25 standard.

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### COMMITMEMT_DELAY

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#commitmemt_delay)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Function signature: `COMMITMEMT_DELAY()`
- Function selector: `0xb79336ee`

:::

```solidity
function COMMITMEMT_DELAY() external view returns (uint256);
```

The delay between the commitment and the recovery process.

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `uint256` | -           |

<br/>

### DEFAULT_RECOVERY_DELAY

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#default_recovery_delay)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Function signature: `DEFAULT_RECOVERY_DELAY()`
- Function selector: `0x8bc0ab75`

:::

```solidity
function DEFAULT_RECOVERY_DELAY() external view returns (uint256);
```

The default recovery delay set to 40 minutes.

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `uint256` | -           |

<br/>

### addGuardian

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#addguardian)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Function signature: `addGuardian(address,address)`
- Function selector: `0xc6845210`

:::

```solidity
function addGuardian(address account, address newGuardian) external nonpayable;
```

_Adds a new guardian to the calling account._

This function allows the account holder to add a new guardian to their account. If the provided address is already a guardian for the account, the function will revert. Emits a `GuardianAdded` event upon successful addition of the guardian.

#### Parameters

| Name          |   Type    | Description                                                     |
| ------------- | :-------: | --------------------------------------------------------------- |
| `account`     | `address` | The address of the account to which the guardian will be added. |
| `newGuardian` | `address` | The address of the new guardian to be added.                    |

<br/>

### batchCalls

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#batchcalls)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Function signature: `batchCalls(bytes[])`
- Function selector: `0x6963d438`

:::

```solidity
function batchCalls(bytes[] data) external nonpayable returns (bytes[] results);
```

_Executes multiple calls in a single transaction._

This function allows for multiple calls to be made in a single transaction, improving efficiency. If a call fails, the function will attempt to bubble up the revert reason or revert with a default message.

#### Parameters

| Name   |   Type    | Description                                |
| ------ | :-------: | ------------------------------------------ |
| `data` | `bytes[]` | An array of calldata bytes to be executed. |

#### Returns

| Name      |   Type    | Description                                                     |
| --------- | :-------: | --------------------------------------------------------------- |
| `results` | `bytes[]` | An array of bytes containing the results of each executed call. |

<br/>

### cancelRecoveryProcess

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#cancelrecoveryprocess)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Function signature: `cancelRecoveryProcess(address)`
- Function selector: `0x1ce59666`

:::

```solidity
function cancelRecoveryProcess(address account) external nonpayable;
```

_Cancels the ongoing recovery process for the account by increasing the recovery counter._

This function allows the account holder to cancel the ongoing recovery process by incrementing the recovery counter. Emits a `RecoveryCancelled` event upon successful cancellation of the recovery process.

#### Parameters

| Name      |   Type    | Description                                                                |
| --------- | :-------: | -------------------------------------------------------------------------- |
| `account` | `address` | The address of the account to which the recovery process will be canceled. |

<br/>

### commitToRecover

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#committorecover)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
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

This function allows an address to commit a secret hash for the recovery process. If the guardian has not voted for the provided address, the function will revert. The commitment in this implementation is `keccak256(abi.encode(votedAddress, secretHash)`.

#### Parameters

| Name           |   Type    | Description                                               |
| -------------- | :-------: | --------------------------------------------------------- |
| `account`      | `address` | The account for which the secret hash is being committed. |
| `votedAddress` | `address` | -                                                         |
| `commitment`   | `bytes32` | The commitment associated with the secret hash.           |

<br/>

### executeRelayCall

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#executerelaycall)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Function signature: `executeRelayCall(bytes,uint256,uint256,bytes)`
- Function selector: `0x4c8a4e74`

:::

:::tip Hint

You can use `validityTimestamps == 0` to define an `executeRelayCall` transaction that is indefinitely valid, meaning that does not require to start from a specific date/time, or that has an expiration date/time.

:::

```solidity
function executeRelayCall(
  bytes signature,
  uint256 nonce,
  uint256 validityTimestamps,
  bytes payload
) external payable returns (bytes);
```

_Executing the following payload given the nonce `nonce` and signature `signature`. Payload: `payload`_

Allows any address (executor) to execute a payload (= abi-encoded function call), given they have a valid signature from a signer address and a valid `nonce` for this signer. The signature MUST be generated according to the signature format defined by the LSP25 standard.

<blockquote>

**Requirements:**

- `nonce` MUST be a valid nonce nonce provided (see [`getNonce`](#getnonce) function).
- The transaction MUST be submitted within a valid time period defined by the `validityTimestamp`.

</blockquote>

#### Parameters

| Name                 |   Type    | Description                                                                                                                                                            |
| -------------------- | :-------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signature`          |  `bytes`  | A 65 bytes long signature for a meta transaction according to LSP25.                                                                                                   |
| `nonce`              | `uint256` | The nonce of the address that signed the calldata (in a specific `_channel`), obtained via [`getNonce`](#getnonce). Used to prevent replay attack.                     |
| `validityTimestamps` | `uint256` | Two `uint128` timestamps concatenated together that describes when the relay transaction is valid "from" (left `uint128`) and "until" as a deadline (right `uint128`). |
| `payload`            |  `bytes`  | The abi-encoded function call to execute.                                                                                                                              |

#### Returns

| Name |  Type   | Description                                       |
| ---- | :-----: | ------------------------------------------------- |
| `0`  | `bytes` | The data being returned by the function executed. |

<br/>

### executeRelayCallBatch

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#executerelaycallbatch)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Function signature: `executeRelayCallBatch(bytes[],uint256[],uint256[],uint256[],bytes[])`
- Function selector: `0xa20856a5`

:::

```solidity
function executeRelayCallBatch(
  bytes[] signatures,
  uint256[] nonces,
  uint256[] validityTimestamps,
  uint256[] values,
  bytes[] payloads
) external payable returns (bytes[]);
```

_Executing a batch of relay calls (= meta-transactions)._

Same as [`executeRelayCall`](#executerelaycall) but execute a batch of signed calldata payloads (abi-encoded function calls) in a single transaction.

#### Parameters

| Name                 |    Type     | Description                                                                                                                                                        |
| -------------------- | :---------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `signatures`         |  `bytes[]`  | An array of 65 bytes long signatures for meta transactions according to LSP25.                                                                                     |
| `nonces`             | `uint256[]` | An array of nonces of the addresses that signed the calldata payloads (in specific channels). Obtained via [`getNonce`](#getnonce). Used to prevent replay attack. |
| `validityTimestamps` | `uint256[]` | An array of two `uint128` concatenated timestamps that describe when the relay transaction is valid "from" (left `uint128`) and "until" (right `uint128`).         |
| `values`             | `uint256[]` | An array of amount of native tokens to be transferred for each calldata `payload`.                                                                                 |
| `payloads`           |  `bytes[]`  | An array of abi-encoded function calls to be executed successively.                                                                                                |

#### Returns

| Name |   Type    | Description                                                      |
| ---- | :-------: | ---------------------------------------------------------------- |
| `0`  | `bytes[]` | An array of abi-decoded data returned by the functions executed. |

<br/>

### getCommitmentInfoOf

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#getcommitmentinfoof)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
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

| Name |   Type    | Description                                                                                                                             |
| ---- | :-------: | --------------------------------------------------------------------------------------------------------------------------------------- |
| `0`  | `bytes32` | The bytes32 commitment and its timestamp associated with the specified address for recovery for the given account and recovery counter. |
| `1`  | `uint256` | -                                                                                                                                       |

<br/>

### getFirstRecoveryTimestampOf

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#getfirstrecoverytimestampof)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
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
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
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
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
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

### getNonce

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#getnonce)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Function signature: `getNonce(address,uint128)`
- Function selector: `0xb44581d9`

:::

```solidity
function getNonce(
  address from,
  uint128 channelId
) external view returns (uint256);
```

_Reading the latest nonce of address `from` in the channel ID `channelId`._

Get the nonce for a specific `from` address that can be used for signing relay transactions via [`executeRelayCall`](#executerelaycall).

#### Parameters

| Name        |   Type    | Description                                                                |
| ----------- | :-------: | -------------------------------------------------------------------------- |
| `from`      | `address` | The address of the signer of the transaction.                              |
| `channelId` | `uint128` | The channel id that the signer wants to use for executing the transaction. |

#### Returns

| Name |   Type    | Description                                  |
| ---- | :-------: | -------------------------------------------- |
| `0`  | `uint256` | The current nonce on a specific `channelId`. |

<br/>

### getRecoveryCounterOf

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#getrecoverycounterof)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
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
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
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
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
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
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
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
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
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
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
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
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
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
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Function signature: `recoverAccess(address,address,bytes32,bytes32,bytes)`
- Function selector: `0xf3b3c785`

:::

```solidity
function recoverAccess(
  address account,
  address votedAddress,
  bytes32 secretHash,
  bytes32 newSecretHash,
  bytes calldataToExecute
) external payable returns (bytes);
```

_Initiates the account recovery process._

This function initiates the account recovery process and executes the provided calldata. If the new secret hash is zero or the number of votes is less than the guardian threshold, the function will revert. Emits a `RecoveryProcessSuccessful` event upon successful recovery process.

#### Parameters

| Name                |   Type    | Description                                                                             |
| ------------------- | :-------: | --------------------------------------------------------------------------------------- |
| `account`           | `address` | The account for which the recovery is being initiated.                                  |
| `votedAddress`      | `address` | -                                                                                       |
| `secretHash`        | `bytes32` | The secret hash associated with the recovery process unsalted with the account address. |
| `newSecretHash`     | `bytes32` | The new secret hash to be set for the account.                                          |
| `calldataToExecute` |  `bytes`  | The calldata to be executed during the recovery process.                                |

#### Returns

| Name |  Type   | Description |
| ---- | :-----: | ----------- |
| `0`  | `bytes` | -           |

<br/>

### removeGuardian

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#removeguardian)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
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

| Name               |   Type    | Description                                                       |
| ------------------ | :-------: | ----------------------------------------------------------------- |
| `account`          | `address` | The address of the account to which the guardian will be removed. |
| `existingGuardian` | `address` | The address of the existing guardian to be removed.               |

<br/>

### setGuardiansThreshold

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#setguardiansthreshold)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
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

| Name           |   Type    | Description                                                    |
| -------------- | :-------: | -------------------------------------------------------------- |
| `account`      | `address` | The address of the account to which the threshold will be set. |
| `newThreshold` | `uint256` | The new guardian threshold to be set for the calling account.  |

<br/>

### setRecoveryDelay

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#setrecoverydelay)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
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

| Name            |   Type    | Description                                                          |
| --------------- | :-------: | -------------------------------------------------------------------- |
| `account`       | `address` | The address of the account to which the recovery delay will be set.  |
| `recoveryDelay` | `uint256` | The new recovery delay in seconds to be set for the calling account. |

<br/>

### setRecoverySecretHash

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#setrecoverysecrethash)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
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

This function allows the account holder to set a new recovery secret hash for their account. In this implementation, the secret hash MUST be set salted with the account address, using keccak256(abi.encode(account, secretHash)). Emits a `SecretHashChanged` event upon successful secret hash modification.

#### Parameters

| Name                   |   Type    | Description                                                               |
| ---------------------- | :-------: | ------------------------------------------------------------------------- |
| `account`              | `address` | The address of the account to which the recovery secret hash will be set. |
| `newRecoverSecretHash` | `bytes32` | The new recovery secret hash to be set for the calling account.           |

<br/>

### supportsInterface

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#supportsinterface)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
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

<br/>

### voteForRecovery

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#voteforrecovery)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
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

_Allows a guardian to vote for an address for a recovery process_

This function allows a guardian to vote for an address to be recovered in a recovery process. If the guardian has already voted for the provided address, the function will revert. Emits a `GuardianVotedFor` event upon successful vote.

#### Parameters

| Name                   |   Type    | Description                                     |
| ---------------------- | :-------: | ----------------------------------------------- |
| `account`              | `address` | The account for which the vote is being cast.   |
| `guardian`             | `address` | -                                               |
| `guardianVotedAddress` | `address` | The address voted by the guardian for recovery. |

<br/>

## Internal Methods

Any method labeled as `internal` serves as utility function within the contract. They can be used when writing solidity contracts that inherit from this contract. These methods can be extended or modified by overriding their internal behavior to suit specific needs.

Internal functions cannot be called externally, whether from other smart contracts, dApp interfaces, or backend services. Their restricted accessibility ensures that they remain exclusively available within the context of the current contract, promoting controlled and encapsulated usage of these internal utilities.

### \_commitToRecover

```solidity
function _commitToRecover(
  address account,
  uint256 recoveryCounter,
  address votedAddress,
  bytes32 commitment
) internal nonpayable;
```

Internal function to commit a new recovery process. It stores a new commitment for a recovery process.

#### Parameters

| Name              |   Type    | Description                                                      |
| ----------------- | :-------: | ---------------------------------------------------------------- |
| `account`         | `address` | The account for which recovery is being committed.               |
| `recoveryCounter` | `uint256` | The current recovery counter for the account.                    |
| `votedAddress`    | `address` | The address that is being proposed for recovery by the guardian. |
| `commitment`      | `bytes32` | The commitment hash representing the recovery process.           |

<br/>

### \_executeRelayCall

```solidity
function _executeRelayCall(
  bytes signature,
  uint256 nonce,
  uint256 validityTimestamps,
  uint256 msgValue,
  bytes payload
) internal nonpayable returns (bytes result);
```

Internal function to execute relay calls for `commitToRecover` and `recoverAccess`.

#### Parameters

| Name                 |   Type    | Description                                          |
| -------------------- | :-------: | ---------------------------------------------------- |
| `signature`          |  `bytes`  | The signature of the relay call.                     |
| `nonce`              | `uint256` | The nonce for replay protection.                     |
| `validityTimestamps` | `uint256` | Timestamps defining the validity period of the call. |
| `msgValue`           | `uint256` | The message value (in ether).                        |
| `payload`            |  `bytes`  | The payload of the call.                             |

#### Returns

| Name     |  Type   | Description                                           |
| -------- | :-----: | ----------------------------------------------------- |
| `result` | `bytes` | Returns the bytes memory result of the executed call. |

<br/>

### \_verifyCanCommitToRecover

```solidity
function _verifyCanCommitToRecover(
  bytes signature,
  uint256 nonce,
  uint256 validityTimestamps,
  uint256 msgValue,
  bytes commitToRecoverPayload
) internal nonpayable;
```

Internal function to verify the signature and execute the `commitToRecover` function.

#### Parameters

| Name                     |   Type    | Description                                             |
| ------------------------ | :-------: | ------------------------------------------------------- |
| `signature`              |  `bytes`  | The signature to verify.                                |
| `nonce`                  | `uint256` | The nonce used for replay protection.                   |
| `validityTimestamps`     | `uint256` | Timestamps for the validity of the signature.           |
| `msgValue`               | `uint256` | The message value.                                      |
| `commitToRecoverPayload` |  `bytes`  | The payload specific to the `commitToRecover` function. |

<br/>

### \_verifyCanRecoverAccess

```solidity
function _verifyCanRecoverAccess(
  bytes signature,
  uint256 nonce,
  uint256 validityTimestamp,
  uint256 msgValue,
  bytes recoverAccessPayload
) internal nonpayable returns (bytes);
```

Internal function to verify the signature and execute the `recoverAccess` function.

#### Parameters

| Name                   |   Type    | Description                                           |
| ---------------------- | :-------: | ----------------------------------------------------- |
| `signature`            |  `bytes`  | The signature to verify.                              |
| `nonce`                | `uint256` | The nonce used for replay protection.                 |
| `validityTimestamp`    | `uint256` | The timestamp for the validity of the signature.      |
| `msgValue`             | `uint256` | The message value.                                    |
| `recoverAccessPayload` |  `bytes`  | The payload specific to the `recoverAccess` function. |

#### Returns

| Name |  Type   | Description |
| ---- | :-----: | ----------- |
| `0`  | `bytes` | -           |

<br/>

### \_sigChecks

```solidity
function _sigChecks(
  bytes signature,
  uint256 nonce,
  uint256 validityTimestamp,
  uint256 msgValue,
  uint256 recoveryCounter,
  bytes payload,
  address votedAddress
) internal nonpayable;
```

Internal function to perform signature and nonce checks, and to verify the validity timestamp.

#### Parameters

| Name                |   Type    | Description                               |
| ------------------- | :-------: | ----------------------------------------- |
| `signature`         |  `bytes`  | The signature to check.                   |
| `nonce`             | `uint256` | The nonce for replay protection.          |
| `validityTimestamp` | `uint256` | The validity timestamp for the signature. |
| `msgValue`          | `uint256` | The message value.                        |
| `recoveryCounter`   | `uint256` | The recovery counter.                     |
| `payload`           |  `bytes`  | The payload of the call.                  |
| `votedAddress`      | `address` | The address voted for recovery.           |

<br/>

### \_recoverSignerFromLSP11Signature

```solidity
function _recoverSignerFromLSP11Signature(
  bytes signature,
  uint256 nonce,
  uint256 validityTimestamps,
  uint256 msgValue,
  uint256 recoveryCounter,
  bytes callData
) internal view returns (address);
```

Internal function to recover the signer from a LSP11 signature.

#### Parameters

| Name                 |   Type    | Description                                |
| -------------------- | :-------: | ------------------------------------------ |
| `signature`          |  `bytes`  | The signature to recover from.             |
| `nonce`              | `uint256` | The nonce for the signature.               |
| `validityTimestamps` | `uint256` | The validity timestamps for the signature. |
| `msgValue`           | `uint256` | The message value.                         |
| `recoveryCounter`    | `uint256` | The recovery counter.                      |
| `callData`           |  `bytes`  | The call data.                             |

#### Returns

| Name |   Type    | Description                |
| ---- | :-------: | -------------------------- |
| `0`  | `address` | The address of the signer. |

<br/>

### \_recoverAccess

```solidity
function _recoverAccess(
  address account,
  uint256 recoveryCounter,
  address votedAddress,
  bytes32 secretHash,
  bytes32 newSecretHash,
  uint256 msgValue,
  bytes calldataToExecute
) internal nonpayable returns (bytes);
```

Internal function to recover access to an account.

#### Parameters

| Name                |   Type    | Description                                           |
| ------------------- | :-------: | ----------------------------------------------------- |
| `account`           | `address` | The account to recover.                               |
| `recoveryCounter`   | `uint256` | The recovery counter.                                 |
| `votedAddress`      | `address` | The address voted by the guardian.                    |
| `secretHash`        | `bytes32` | The hash of the secret.                               |
| `newSecretHash`     | `bytes32` | The new secret hash for the account.                  |
| `msgValue`          | `uint256` | The message value.                                    |
| `calldataToExecute` |  `bytes`  | The call data to be executed as part of the recovery. |

#### Returns

| Name |  Type   | Description |
| ---- | :-----: | ----------- |
| `0`  | `bytes` | -           |

<br/>

### \_getNonce

```solidity
function _getNonce(
  address from,
  uint128 channelId
) internal view returns (uint256 idx);
```

Read the nonce for a `from` address on a specific `channelId`. This will return an `idx`, which is the concatenation of two `uint128` as follow:

1. the `channelId` where the nonce was queried for.

2. the actual nonce of the given `channelId`. For example, if on `channelId` number `5`, the latest nonce is `1`, the `idx` returned by this function will be: `// in decimals = 1701411834604692317316873037158841057281 idx = 0x0000000000000000000000000000000500000000000000000000000000000001` This idx can be described as follow: `channelId => 5          nonce in this channel => 1 v------------------------------v-------------------------------v 0x0000000000000000000000000000000500000000000000000000000000000001`

#### Parameters

| Name        |   Type    | Description                                |
| ----------- | :-------: | ------------------------------------------ |
| `from`      | `address` | The address to read the nonce for.         |
| `channelId` | `uint128` | The channel in which to extract the nonce. |

#### Returns

| Name  |   Type    | Description                                                                                                            |
| ----- | :-------: | ---------------------------------------------------------------------------------------------------------------------- |
| `idx` | `uint256` | The idx composed of two `uint128`: the channelId + nonce in channel concatenated together in a single `uint256` value. |

<br/>

### \_recoverSignerFromLSP25Signature

```solidity
function _recoverSignerFromLSP25Signature(
  bytes signature,
  uint256 nonce,
  uint256 validityTimestamps,
  uint256 msgValue,
  bytes callData
) internal view returns (address);
```

Recover the address of the signer that generated a `signature` using the parameters provided `nonce`, `validityTimestamps`, `msgValue` and `callData`. The address of the signer will be recovered using the LSP25 signature format.

#### Parameters

| Name                 |   Type    | Description                                                                                                                                          |
| -------------------- | :-------: | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signature`          |  `bytes`  | A 65 bytes long signature generated according to the signature format specified in the LSP25 standard.                                               |
| `nonce`              | `uint256` | The nonce that the signer used to generate the `signature`.                                                                                          |
| `validityTimestamps` | `uint256` | The validity timestamp that the signer used to generate the signature (See [`_verifyValidityTimestamps`](#_verifyvaliditytimestamps) to learn more). |
| `msgValue`           | `uint256` | The amount of native tokens intended to be sent for the relay transaction.                                                                           |
| `callData`           |  `bytes`  | The calldata to execute as a relay transaction that the signer signed for.                                                                           |

#### Returns

| Name |   Type    | Description                                              |
| ---- | :-------: | -------------------------------------------------------- |
| `0`  | `address` | The address that signed, recovered from the `signature`. |

<br/>

### \_verifyValidityTimestamps

```solidity
function _verifyValidityTimestamps(uint256 validityTimestamps) internal view;
```

Verify that the current timestamp is within the date and time range provided by `validityTimestamps`.

#### Parameters

| Name                 |   Type    | Description                                                                                                                                                                                                                      |
| -------------------- | :-------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `validityTimestamps` | `uint256` | Two `uint128` concatenated together, where the left-most `uint128` represent the timestamp from which the transaction can be executed, and the right-most `uint128` represents the timestamp after which the transaction expire. |

<br/>

### \_isValidNonce

```solidity
function _isValidNonce(address from, uint256 idx) internal view returns (bool);
```

Verify that the nonce `_idx` for `_from` (obtained via [`getNonce`](#getnonce)) is valid in its channel ID. The "idx" is a 256bits (unsigned) integer, where:

- the 128 leftmost bits = channelId

- and the 128 rightmost bits = nonce within the channel

#### Parameters

| Name   |   Type    | Description                                                                  |
| ------ | :-------: | ---------------------------------------------------------------------------- |
| `from` | `address` | The signer's address.                                                        |
| `idx`  | `uint256` | The concatenation of the `channelId` + `nonce` within a specific channel ID. |

#### Returns

| Name |  Type  | Description                                                              |
| ---- | :----: | ------------------------------------------------------------------------ |
| `0`  | `bool` | true if the nonce is the latest nonce for the `signer`, false otherwise. |

<br/>

## Events

### GuardianAdded

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#guardianadded)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
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
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
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
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
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
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
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
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
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
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
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
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
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
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
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
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
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

## Errors

### AccountNotSetupYet

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#accountnotsetupyet)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Error signature: `AccountNotSetupYet()`
- Error hash: `0x1d20946c`

:::

```solidity
error AccountNotSetupYet();
```

The account has not been set up yet.

<br/>

### BatchCallsFailed

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#batchcallsfailed)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Error signature: `BatchCallsFailed(uint256)`
- Error hash: `0xd9a02303`

:::

```solidity
error BatchCallsFailed(uint256 iteration);
```

One or more batch calls failed.

#### Parameters

| Name        |   Type    | Description                                   |
| ----------- | :-------: | --------------------------------------------- |
| `iteration` | `uint256` | The iteration at which the batch call failed. |

<br/>

### BatchExecuteRelayCallParamsLengthMismatch

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#batchexecuterelaycallparamslengthmismatch)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Error signature: `BatchExecuteRelayCallParamsLengthMismatch()`
- Error hash: `0xb4d50d21`

:::

```solidity
error BatchExecuteRelayCallParamsLengthMismatch();
```

Thrown when there's a length mismatch in batch execute relay call parameters.

<br/>

### CallerIsNotGuardian

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#callerisnotguardian)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Error signature: `CallerIsNotGuardian(address,address)`
- Error hash: `0x17c6343d`

:::

```solidity
error CallerIsNotGuardian(address guardian, address caller);
```

The caller is not a guardian address provided.

#### Parameters

| Name       |   Type    | Description                |
| ---------- | :-------: | -------------------------- |
| `guardian` | `address` | Expected guardian address. |
| `caller`   | `address` | Address of the caller.     |

<br/>

### CallerIsNotTheAccount

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#callerisnottheaccount)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Error signature: `CallerIsNotTheAccount(address,address)`
- Error hash: `0x08fd287f`

:::

```solidity
error CallerIsNotTheAccount(address account, address caller);
```

The caller is not the account holder.

#### Parameters

| Name      |   Type    | Description                  |
| --------- | :-------: | ---------------------------- |
| `account` | `address` | The expected account holder. |
| `caller`  | `address` | Address of the caller.       |

<br/>

### CallerIsNotVotedAddress

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#callerisnotvotedaddress)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Error signature: `CallerIsNotVotedAddress(address,address)`
- Error hash: `0x94f17760`

:::

```solidity
error CallerIsNotVotedAddress(address votedAddress, address caller);
```

The caller is not the expected recoverer.

#### Parameters

| Name           |   Type    | Description             |
| -------------- | :-------: | ----------------------- |
| `votedAddress` | `address` | Expected voted address. |
| `caller`       | `address` | Address of the caller.  |

<br/>

### CallerVotesHaveNotReachedThreshold

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#callervoteshavenotreachedthreshold)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Error signature: `CallerVotesHaveNotReachedThreshold(address,address)`
- Error hash: `0x36dbf4c8`

:::

```solidity
error CallerVotesHaveNotReachedThreshold(address account, address recoverer);
```

Guardian is not authorized to vote for the account.

#### Parameters

| Name        |   Type    | Description                                   |
| ----------- | :-------: | --------------------------------------------- |
| `account`   | `address` | The account for which the vote is being cast. |
| `recoverer` | `address` | the caller                                    |

<br/>

### CannotRecoverAfterDirectCommit

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#cannotrecoverafterdirectcommit)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Error signature: `CannotRecoverAfterDirectCommit(address,address)`
- Error hash: `0xfe75f628`

:::

```solidity
error CannotRecoverAfterDirectCommit(address account, address committer);
```

The commitment provided is too early.

#### Parameters

| Name        |   Type    | Description                                            |
| ----------- | :-------: | ------------------------------------------------------ |
| `account`   | `address` | The account for which the commitment is being checked. |
| `committer` | `address` | The address providing the commitment.                  |

<br/>

### CannotRecoverBeforeDelay

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#cannotrecoverbeforedelay)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Error signature: `CannotRecoverBeforeDelay(address,uint256)`
- Error hash: `0x7c1b1700`

:::

```solidity
error CannotRecoverBeforeDelay(address account, uint256 delay);
```

Thrown when an attempt to recover is made before a specified delay period.

#### Parameters

| Name      |   Type    | Description               |
| --------- | :-------: | ------------------------- |
| `account` | `address` | The account address.      |
| `delay`   | `uint256` | The delay of the account. |

<br/>

### CannotVoteToAddressTwice

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#cannotvotetoaddresstwice)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Error signature: `CannotVoteToAddressTwice(address,address,address)`
- Error hash: `0x92dd87f6`

:::

```solidity
error CannotVoteToAddressTwice(
  address account,
  address guardian,
  address guardianVotedAddress
);
```

A guardian cannot vote for the same address twice.

#### Parameters

| Name                   |   Type    | Description                                     |
| ---------------------- | :-------: | ----------------------------------------------- |
| `account`              | `address` | The account for which the vote is being cast.   |
| `guardian`             | `address` | The guardian casting the vote.                  |
| `guardianVotedAddress` | `address` | The address voted by the guardian for recovery. |

<br/>

### GuardianAlreadyExists

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#guardianalreadyexists)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Error signature: `GuardianAlreadyExists(address,address)`
- Error hash: `0x242d9f79`

:::

```solidity
error GuardianAlreadyExists(address account, address guardian);
```

The guardian address already exists for the account.

#### Parameters

| Name       |   Type    | Description                               |
| ---------- | :-------: | ----------------------------------------- |
| `account`  | `address` | The account trying to add the guardian.   |
| `guardian` | `address` | The guardian address that already exists. |

<br/>

### GuardianNotFound

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#guardiannotfound)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Error signature: `GuardianNotFound(address,address)`
- Error hash: `0x925f444b`

:::

```solidity
error GuardianNotFound(address account, address guardian);
```

The specified guardian address does not exist for the account.

#### Parameters

| Name       |   Type    | Description                                |
| ---------- | :-------: | ------------------------------------------ |
| `account`  | `address` | The account trying to remove the guardian. |
| `guardian` | `address` | The guardian address that was not found.   |

<br/>

### GuardianNumberCannotGoBelowThreshold

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#guardiannumbercannotgobelowthreshold)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Error signature: `GuardianNumberCannotGoBelowThreshold(address,uint256)`
- Error hash: `0x85283f15`

:::

```solidity
error GuardianNumberCannotGoBelowThreshold(address account, uint256 threshold);
```

Removing the guardian would violate the guardian threshold.

#### Parameters

| Name        |   Type    | Description                                                             |
| ----------- | :-------: | ----------------------------------------------------------------------- |
| `account`   | `address` | The account trying to remove the guardian.                              |
| `threshold` | `uint256` | The guardian address that would cause a threshold violation if removed. |

<br/>

### InvalidCommitment

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#invalidcommitment)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Error signature: `InvalidCommitment(address,address)`
- Error hash: `0xeca9e4a6`

:::

```solidity
error InvalidCommitment(address account, address committer);
```

The commitment provided is not valid.

#### Parameters

| Name        |   Type    | Description                                            |
| ----------- | :-------: | ------------------------------------------------------ |
| `account`   | `address` | The account for which the commitment is being checked. |
| `committer` | `address` | The address providing the commitment.                  |

<br/>

### InvalidRelayNonce

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#invalidrelaynonce)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Error signature: `InvalidRelayNonce(address,uint256,bytes)`
- Error hash: `0xc9bd9eb9`

:::

```solidity
error InvalidRelayNonce(address signer, uint256 invalidNonce, bytes signature);
```

_The relay call failed because an invalid nonce was provided for the address `signer` that signed the execute relay call. Invalid nonce: `invalidNonce`, signature of signer: `signature`._

Reverts when the `signer` address retrieved from the `signature` has an invalid nonce: `invalidNonce`.

#### Parameters

| Name           |   Type    | Description                                          |
| -------------- | :-------: | ---------------------------------------------------- |
| `signer`       | `address` | The address of the signer.                           |
| `invalidNonce` | `uint256` | The nonce retrieved for the `signer` address.        |
| `signature`    |  `bytes`  | The signature used to retrieve the `signer` address. |

<br/>

### InvalidSecretHash

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#invalidsecrethash)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Error signature: `InvalidSecretHash(address,bytes32)`
- Error hash: `0x84bb073d`

:::

```solidity
error InvalidSecretHash(address account, bytes32 secretHash);
```

The provided secret hash is not valid for recovery.

#### Parameters

| Name         |   Type    | Description                                        |
| ------------ | :-------: | -------------------------------------------------- |
| `account`    | `address` | The account for which recovery is being attempted. |
| `secretHash` | `bytes32` | The invalid secret hash provided.                  |

<br/>

### LSP11BatchExcessiveValueSent

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#lsp11batchexcessivevaluesent)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Error signature: `LSP11BatchExcessiveValueSent(uint256,uint256)`
- Error hash: `0x7c3328da`

:::

```solidity
error LSP11BatchExcessiveValueSent(uint256 totalValues, uint256 msgValue);
```

Thrown when the total value sent in an LSP11 batch call exceeds the required amount.

#### Parameters

| Name          |   Type    | Description                             |
| ------------- | :-------: | --------------------------------------- |
| `totalValues` | `uint256` | The total value required.               |
| `msgValue`    | `uint256` | The value actually sent in the message. |

<br/>

### LSP11BatchInsufficientValueSent

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#lsp11batchinsufficientvaluesent)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Error signature: `LSP11BatchInsufficientValueSent(uint256,uint256)`
- Error hash: `0xd42081cc`

:::

```solidity
error LSP11BatchInsufficientValueSent(uint256 totalValues, uint256 msgValue);
```

Thrown when the total value sent in an LSP11 batch call is insufficient.

#### Parameters

| Name          |   Type    | Description                             |
| ------------- | :-------: | --------------------------------------- |
| `totalValues` | `uint256` | The total value required.               |
| `msgValue`    | `uint256` | The value actually sent in the message. |

<br/>

### NotAGuardianOfTheAccount

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#notaguardianoftheaccount)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Error signature: `NotAGuardianOfTheAccount(address,address)`
- Error hash: `0x2835d4f4`

:::

```solidity
error NotAGuardianOfTheAccount(address account, address nonGuardian);
```

The address provided as a guardian is not registered as a guardian for the account.

#### Parameters

| Name          |   Type    | Description                 |
| ------------- | :-------: | --------------------------- |
| `account`     | `address` | The account in question.    |
| `nonGuardian` | `address` | Address of a non-guardian . |

<br/>

### RelayCallBeforeStartTime

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#relaycallbeforestarttime)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Error signature: `RelayCallBeforeStartTime()`
- Error hash: `0x00de4b8a`

:::

```solidity
error RelayCallBeforeStartTime();
```

_Relay call not valid yet._

Reverts when the relay call is cannot yet bet executed. This mean that the starting timestamp provided to [`executeRelayCall`](#executerelaycall) function is bigger than the current timestamp.

<br/>

### RelayCallExpired

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#relaycallexpired)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Error signature: `RelayCallExpired()`
- Error hash: `0x5c53a98c`

:::

```solidity
error RelayCallExpired();
```

_Relay call expired (deadline passed)._

Reverts when the period to execute the relay call has expired.

<br/>

### RelayCallNotSupported

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#relaycallnotsupported)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Error signature: `RelayCallNotSupported(bytes4)`
- Error hash: `0x0602d270`

:::

```solidity
error RelayCallNotSupported(bytes4 functionSelector);
```

Thrown when a relay call is not supported.

#### Parameters

| Name               |   Type   | Description                        |
| ------------------ | :------: | ---------------------------------- |
| `functionSelector` | `bytes4` | The unsupported function selector. |

<br/>

### SignerIsNotVotedAddress

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#signerisnotvotedaddress)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Error signature: `SignerIsNotVotedAddress(address,address)`
- Error hash: `0x40a55632`

:::

```solidity
error SignerIsNotVotedAddress(address votedAddress, address recoveredAddress);
```

Thrown when the signer is not the voted address for a particular operation.

#### Parameters

| Name               |   Type    | Description                                         |
| ------------------ | :-------: | --------------------------------------------------- |
| `votedAddress`     | `address` | The address passed as a parameter as voted address. |
| `recoveredAddress` | `address` | The recovered address from the signature.           |

<br/>

### ThresholdExceedsGuardianNumber

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#thresholdexceedsguardiannumber)
- Solidity implementation: [`LSP11SocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp11-contracts/contracts/LSP11SocialRecovery.sol)
- Error signature: `ThresholdExceedsGuardianNumber(address,uint256)`
- Error hash: `0x217be3a7`

:::

```solidity
error ThresholdExceedsGuardianNumber(address account, uint256 threshold);
```

The specified threshold exceeds the number of guardians.

#### Parameters

| Name        |   Type    | Description                                               |
| ----------- | :-------: | --------------------------------------------------------- |
| `account`   | `address` | The account trying to set the threshold.                  |
| `threshold` | `uint256` | The threshold value that exceeds the number of guardians. |

<br/>
