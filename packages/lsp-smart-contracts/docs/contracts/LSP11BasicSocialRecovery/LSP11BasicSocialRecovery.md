<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP11BasicSocialRecovery

:::info Standard Specifications

[`LSP-11-BasicSocialRecovery`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md)

:::
:::info Solidity implementation

[`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)

:::

> Implementation of LSP11 - Basic Social Recovery standard

Sets permission for a controller address after a recovery process to interact with an ERC725 contract via the LSP6KeyManager

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### constructor

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#constructor)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)

:::

```solidity
constructor(address _owner, address target_);
```

_Sets the target and the owner addresses_

#### Parameters

| Name      |   Type    | Description                                  |
| --------- | :-------: | -------------------------------------------- |
| `_owner`  | `address` | The owner of the LSP11 contract              |
| `target_` | `address` | The address of the ER725 contract to recover |

<br/>

### addGuardian

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#addguardian)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Function signature: `addGuardian(address)`
- Function selector: `0xa526d83b`

:::

```solidity
function addGuardian(address newGuardian) external nonpayable;
```

Adds a guardian of the targetCan be called only by the owner

#### Parameters

| Name          |   Type    | Description                      |
| ------------- | :-------: | -------------------------------- |
| `newGuardian` | `address` | The address to add as a guardian |

<br/>

### getGuardianChoice

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#getguardianchoice)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Function signature: `getGuardianChoice(address)`
- Function selector: `0xf6a22f02`

:::

```solidity
function getGuardianChoice(address guardian) external view returns (address);
```

Returns the address of a controller that a `guardian` selected for in order to recover the target

#### Parameters

| Name       |   Type    | Description                                      |
| ---------- | :-------: | ------------------------------------------------ |
| `guardian` | `address` | the address of a guardian to query his selection |

#### Returns

| Name |   Type    | Description                          |
| ---- | :-------: | ------------------------------------ |
| `0`  | `address` | the address that `guardian` selected |

<br/>

### getGuardians

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#getguardians)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Function signature: `getGuardians()`
- Function selector: `0x0665f04b`

:::

```solidity
function getGuardians() external view returns (address[]);
```

Returns the addresses of all guardians The guardians will select an address to be added as a controller key for the linked `target` if he reaches the guardian threshold and provide the correct string that produce the secretHash

#### Returns

| Name |    Type     | Description |
| ---- | :---------: | ----------- |
| `0`  | `address[]` | -           |

<br/>

### getGuardiansThreshold

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#getguardiansthreshold)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Function signature: `getGuardiansThreshold()`
- Function selector: `0x187c5348`

:::

```solidity
function getGuardiansThreshold() external view returns (uint256);
```

Returns the guardian threshold The guardian threshold represents the minimum number of selection by guardians required for an address to start a recovery process

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `uint256` | -           |

<br/>

### getRecoveryCounter

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#getrecoverycounter)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Function signature: `getRecoveryCounter()`
- Function selector: `0xf79c8b77`

:::

```solidity
function getRecoveryCounter() external view returns (uint256);
```

Returns the current recovery counter When a recovery process is successfully finished the recovery counter is incremented

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `uint256` | -           |

<br/>

### getRecoverySecretHash

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#getrecoverysecrethash)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Function signature: `getRecoverySecretHash()`
- Function selector: `0x8f9083bb`

:::

```solidity
function getRecoverySecretHash() external view returns (bytes32);
```

Returns the recovery secret hash

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `bytes32` | -           |

<br/>

### isGuardian

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#isguardian)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Function signature: `isGuardian(address)`
- Function selector: `0x0c68ba21`

:::

```solidity
function isGuardian(address _address) external view returns (bool);
```

Returns TRUE if the address provided is a guardian, FALSE otherwise

#### Parameters

| Name       |   Type    | Description          |
| ---------- | :-------: | -------------------- |
| `_address` | `address` | The address to query |

#### Returns

| Name |  Type  | Description |
| ---- | :----: | ----------- |
| `0`  | `bool` | -           |

<br/>

### owner

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#owner)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
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

### recoverOwnership

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#recoverownership)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Function signature: `recoverOwnership(address,string,bytes32)`
- Function selector: `0xae8481b2`

:::

```solidity
function recoverOwnership(
  address recoverer,
  string plainSecret,
  bytes32 newSecretHash
) external nonpayable;
```

Recovers the ownership permissions of an address in the linked target and increment the recover counter Requirements

- the address of the recoverer must have a selection equal or higher than the threshold defined in `getGuardiansThreshold(...)`

- must have provided the right `plainSecret` that produces the secret Hash

#### Parameters

| Name            |   Type    | Description                                  |
| --------------- | :-------: | -------------------------------------------- |
| `recoverer`     | `address` | The address of the recoverer                 |
| `plainSecret`   | `string`  | The secret word that produce the secret Hash |
| `newSecretHash` | `bytes32` | -                                            |

<br/>

### removeGuardian

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#removeguardian)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Function signature: `removeGuardian(address)`
- Function selector: `0x71404156`

:::

```solidity
function removeGuardian(address existingGuardian) external nonpayable;
```

Removes a guardian of the targetCan be called only by the owner

#### Parameters

| Name               |   Type    | Description |
| ------------------ | :-------: | ----------- |
| `existingGuardian` | `address` | -           |

<br/>

### renounceOwnership

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#renounceownership)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Function signature: `renounceOwnership()`
- Function selector: `0x715018a6`

:::

```solidity
function renounceOwnership() external nonpayable;
```

Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.

<br/>

### selectNewController

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#selectnewcontroller)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Function signature: `selectNewController(address)`
- Function selector: `0xaa7806d6`

:::

```solidity
function selectNewController(address addressSelected) external nonpayable;
```

select an address to be a potential controller address if he reaches the guardian threshold and provide the correct secret string Requirements:

- only guardians can select an address

#### Parameters

| Name              |   Type    | Description                          |
| ----------------- | :-------: | ------------------------------------ |
| `addressSelected` | `address` | The address selected by the guardian |

<br/>

### setGuardiansThreshold

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#setguardiansthreshold)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Function signature: `setGuardiansThreshold(uint256)`
- Function selector: `0x6bfed20b`

:::

```solidity
function setGuardiansThreshold(uint256 newThreshold) external nonpayable;
```

Sets the minimum number of selection by the guardians required so that an address can recover ownershipCan be called only by the owner

#### Parameters

| Name           |   Type    | Description |
| -------------- | :-------: | ----------- |
| `newThreshold` | `uint256` | -           |

<br/>

### setRecoverySecretHash

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#setrecoverysecrethash)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Function signature: `setRecoverySecretHash(bytes32)`
- Function selector: `0xf799e38d`

:::

```solidity
function setRecoverySecretHash(
  bytes32 newRecoverSecretHash
) external nonpayable;
```

Throws if hash provided is bytes32(0)

#### Parameters

| Name                   |   Type    | Description                                                                     |
| ---------------------- | :-------: | ------------------------------------------------------------------------------- |
| `newRecoverSecretHash` | `bytes32` | The hash of the secret string Requirements: - `secretHash` cannot be bytes32(0) |

<br/>

### supportsInterface

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#supportsinterface)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Function signature: `supportsInterface(bytes4)`
- Function selector: `0x01ffc9a7`

:::

```solidity
function supportsInterface(bytes4 _interfaceId) external view returns (bool);
```

See [`IERC165-supportsInterface`](#ierc165-supportsinterface).

#### Parameters

| Name           |   Type   | Description |
| -------------- | :------: | ----------- |
| `_interfaceId` | `bytes4` | -           |

#### Returns

| Name |  Type  | Description |
| ---- | :----: | ----------- |
| `0`  | `bool` | -           |

<br/>

### target

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#target)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Function signature: `target()`
- Function selector: `0xd4b83992`

:::

```solidity
function target() external view returns (address);
```

The address of an ERC725 contract where we want to recover and set permissions for a controller address

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `address` | -           |

<br/>

### transferOwnership

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#transferownership)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Function signature: `transferOwnership(address)`
- Function selector: `0xf2fde38b`

:::

```solidity
function transferOwnership(address newOwner) external nonpayable;
```

Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.

#### Parameters

| Name       |   Type    | Description |
| ---------- | :-------: | ----------- |
| `newOwner` | `address` | -           |

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

### \_validateRequirements

```solidity
function _validateRequirements(
  address recoverer,
  uint256 currentRecoveryCounter,
  string plainSecret,
  bytes32 newHash,
  address[] guardians
) internal view;
```

The number of guardians should be reasonable, as the validation method
is using a loop to check the selection of each guardian
Throws if:

- The address trying to recover didn't reach the guardiansThreshold

- The new hash being set is bytes32(0)

- The secret word provided is incorrect

<br/>

### \_cleanStorage

```solidity
function _cleanStorage(
  uint256 recoveryCounter,
  uint256 guardiansLength,
  address[] guardians
) internal nonpayable;
```

Remove the guardians choice after a successful recovery process
To avoid keeping unnecessary state

<br/>

## Events

### GuardianAdded

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#guardianadded)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Event signature: `GuardianAdded(address)`
- Event topic hash: `0x038596bb31e2e7d3d9f184d4c98b310103f6d7f5830e5eec32bffe6f1728f969`

:::

```solidity
event GuardianAdded(address indexed newGuardian);
```

_Emitted when setting a new guardian for the target_

#### Parameters

| Name                        |   Type    | Description                       |
| --------------------------- | :-------: | --------------------------------- |
| `newGuardian` **`indexed`** | `address` | The address of the added guardian |

<br/>

### GuardianRemoved

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#guardianremoved)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Event signature: `GuardianRemoved(address)`
- Event topic hash: `0xb8107d0c6b40be480ce3172ee66ba6d64b71f6b1685a851340036e6e2e3e3c52`

:::

```solidity
event GuardianRemoved(address indexed removedGuardian);
```

_Emitted when removing an existing guardian for the target_

#### Parameters

| Name                            |   Type    | Description                         |
| ------------------------------- | :-------: | ----------------------------------- |
| `removedGuardian` **`indexed`** | `address` | The address of the guardian removed |

<br/>

### GuardiansThresholdChanged

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#guardiansthresholdchanged)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Event signature: `GuardiansThresholdChanged(uint256)`
- Event topic hash: `0x7146d20a2c7b7c75c203774c9f241b61698fac43a4a81ccd828f0d8162392790`

:::

```solidity
event GuardiansThresholdChanged(uint256 indexed guardianThreshold);
```

_Emitted when changing the guardian threshold_

#### Parameters

| Name                              |   Type    | Description                                                                                     |
| --------------------------------- | :-------: | ----------------------------------------------------------------------------------------------- |
| `guardianThreshold` **`indexed`** | `uint256` | The minimum number of selection by guardians needed by a controller to start a recovery process |

<br/>

### OwnershipTransferred

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#ownershiptransferred)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
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

### RecoveryProcessSuccessful

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#recoveryprocesssuccessful)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Event signature: `RecoveryProcessSuccessful(uint256,address,bytes32,address[])`
- Event topic hash: `0xf4ff8803d6b43af46d48c200977209829c2f42f19f27eda1c89dbf26a28009cd`

:::

```solidity
event RecoveryProcessSuccessful(
  uint256 indexed recoveryCounter,
  address indexed newController,
  bytes32 indexed newSecretHash,
  address[] guardians
);
```

_Emitted when the recovery process is finished by the controller who reached the guardian threshold and submitted the string that produce the secretHash_

#### Parameters

| Name                            |    Type     | Description                                                                |
| ------------------------------- | :---------: | -------------------------------------------------------------------------- |
| `recoveryCounter` **`indexed`** |  `uint256`  | The current recovery process                                               |
| `newController` **`indexed`**   |  `address`  | The address of the new controller controlling the target by the KeyManager |
| `newSecretHash` **`indexed`**   |  `bytes32`  | -                                                                          |
| `guardians`                     | `address[]` | The array of addresses containing the guardians of the target              |

<br/>

### SecretHashChanged

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#secrethashchanged)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Event signature: `SecretHashChanged(bytes32)`
- Event topic hash: `0x2e8c5419a62207ade549fe0b66c1c85c16f5e1ed654815dee3a3f3ac41770df3`

:::

```solidity
event SecretHashChanged(bytes32 indexed secretHash);
```

_Emitted when changing the secret hash_

#### Parameters

| Name                       |   Type    | Description                                         |
| -------------------------- | :-------: | --------------------------------------------------- |
| `secretHash` **`indexed`** | `bytes32` | The secret hash used to finish the recovery process |

<br/>

### SelectedNewController

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#selectednewcontroller)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Event signature: `SelectedNewController(uint256,address,address)`
- Event topic hash: `0xe43f3c1093c69ab76b2cf6246090acb2f8eab7f19ba9942dfc8b8ec446e3a3de`

:::

```solidity
event SelectedNewController(
  uint256 indexed recoveryCounter,
  address indexed guardian,
  address indexed addressSelected
);
```

_Emitted when a guardian select a new potential controller address for the target_

#### Parameters

| Name                            |   Type    | Description                          |
| ------------------------------- | :-------: | ------------------------------------ |
| `recoveryCounter` **`indexed`** | `uint256` | The current recovery process counter |
| `guardian` **`indexed`**        | `address` | The address of the guardian          |
| `addressSelected` **`indexed`** | `address` | The address selected by the guardian |

<br/>

## Errors

### AddressZeroNotAllowed

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#addresszeronotallowed)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Error signature: `AddressZeroNotAllowed()`
- Error hash: `0x0855380c`

:::

```solidity
error AddressZeroNotAllowed();
```

reverts when the address zero calls `recoverOwnership(..)` function

<br/>

### CallerIsNotGuardian

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#callerisnotguardian)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Error signature: `CallerIsNotGuardian(address)`
- Error hash: `0x5560e16d`

:::

```solidity
error CallerIsNotGuardian(address caller);
```

reverts when the caller is not a guardian

#### Parameters

| Name     |   Type    | Description |
| -------- | :-------: | ----------- |
| `caller` | `address` | -           |

<br/>

### GuardianAlreadyExist

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#guardianalreadyexist)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Error signature: `GuardianAlreadyExist(address)`
- Error hash: `0xd52858db`

:::

```solidity
error GuardianAlreadyExist(address addressToAdd);
```

reverts when adding an already existing guardian

#### Parameters

| Name           |   Type    | Description |
| -------------- | :-------: | ----------- |
| `addressToAdd` | `address` | -           |

<br/>

### GuardianDoNotExist

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#guardiandonotexist)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Error signature: `GuardianDoNotExist(address)`
- Error hash: `0x3d8e524e`

:::

```solidity
error GuardianDoNotExist(address addressToRemove);
```

reverts when removing a non-existing guardian

#### Parameters

| Name              |   Type    | Description |
| ----------------- | :-------: | ----------- |
| `addressToRemove` | `address` | -           |

<br/>

### GuardiansNumberCannotGoBelowThreshold

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#guardiansnumbercannotgobelowthreshold)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Error signature: `GuardiansNumberCannotGoBelowThreshold(uint256)`
- Error hash: `0x27113777`

:::

```solidity
error GuardiansNumberCannotGoBelowThreshold(uint256 guardianThreshold);
```

reverts when removing a guardian and the threshold is equal to the number of guardians

#### Parameters

| Name                |   Type    | Description |
| ------------------- | :-------: | ----------- |
| `guardianThreshold` | `uint256` | -           |

<br/>

### OwnableCallerNotTheOwner

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#ownablecallernottheowner)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
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

### OwnableCannotSetZeroAddressAsOwner

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#ownablecannotsetzeroaddressasowner)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Error signature: `OwnableCannotSetZeroAddressAsOwner()`
- Error hash: `0x1ad8836c`

:::

```solidity
error OwnableCannotSetZeroAddressAsOwner();
```

Reverts when trying to set `address(0)` as the contract owner when deploying the contract, initializing it or transferring ownership of the contract.

<br/>

### SecretHashCannotBeZero

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#secrethashcannotbezero)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Error signature: `SecretHashCannotBeZero()`
- Error hash: `0x7f617002`

:::

```solidity
error SecretHashCannotBeZero();
```

reverts when the secret hash provided is equal to bytes32(0)

<br/>

### ThresholdCannotBeHigherThanGuardiansNumber

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#thresholdcannotbehigherthanguardiansnumber)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Error signature: `ThresholdCannotBeHigherThanGuardiansNumber(uint256,uint256)`
- Error hash: `0xe3db80bd`

:::

```solidity
error ThresholdCannotBeHigherThanGuardiansNumber(
  uint256 thresholdGiven,
  uint256 guardianNumber
);
```

reverts when setting the guardians threshold to a number higher than the guardians number

#### Parameters

| Name             |   Type    | Description |
| ---------------- | :-------: | ----------- |
| `thresholdGiven` | `uint256` | -           |
| `guardianNumber` | `uint256` | -           |

<br/>

### ThresholdNotReachedForRecoverer

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#thresholdnotreachedforrecoverer)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Error signature: `ThresholdNotReachedForRecoverer(address,uint256,uint256)`
- Error hash: `0xf78f0507`

:::

```solidity
error ThresholdNotReachedForRecoverer(
  address recoverer,
  uint256 selections,
  uint256 guardiansThreshold
);
```

reverts when `recoverOwnership(..)` is called with a recoverer that didn't reach the guardians threshold

#### Parameters

| Name                 |   Type    | Description                                      |
| -------------------- | :-------: | ------------------------------------------------ |
| `recoverer`          | `address` | The address of the recoverer                     |
| `selections`         | `uint256` | The number of selections that the recoverer have |
| `guardiansThreshold` | `uint256` | The minimum number of selection needed           |

<br/>

### WrongPlainSecret

:::note References

- Specification details: [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-11-BasicSocialRecovery.md#wrongplainsecret)
- Solidity implementation: [`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Error signature: `WrongPlainSecret()`
- Error hash: `0x6fa723c3`

:::

```solidity
error WrongPlainSecret();
```

reverts when the plain secret produce a different hash than the secret hash originally set

<br/>
