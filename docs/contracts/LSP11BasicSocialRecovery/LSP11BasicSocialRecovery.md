# LSP11BasicSocialRecovery

:::info Soldity contract

[`LSP11BasicSocialRecovery.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)

:::

> Implementation of LSP11 - Basic Social Recovery standard

Sets permission for a controller address after a recovery process to interact with an ERC725 contract via the LSP6KeyManager

## Methods

### constructor

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#constructor)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)

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

### addGuardian

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#addguardian)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
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

### getGuardianChoice

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#getguardianchoice)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
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

### getGuardians

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#getguardians)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
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

### getGuardiansThreshold

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#getguardiansthreshold)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
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

### getRecoveryCounter

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#getrecoverycounter)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
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

### getRecoverySecretHash

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#getrecoverysecrethash)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
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

### isGuardian

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#isguardian)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
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

### owner

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#owner)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
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

### recoverOwnership

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#recoverownership)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
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

### removeGuardian

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#removeguardian)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
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

### renounceOwnership

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#renounceownership)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Function signature: `renounceOwnership()`
- Function selector: `0x715018a6`

:::

```solidity
function renounceOwnership() external nonpayable;
```

Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.

### selectNewController

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#selectnewcontroller)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Function signature: `selectNewController(address)`
- Function selector: `0xaa7806d6`

:::

```solidity
function selectNewController(address addressSelected) external nonpayable;
```

select an address to be a potentiel controller address if he reaches the guardian threshold and provide the correct secret string Requirements:

- only guardians can select an address

#### Parameters

| Name              |   Type    | Description                          |
| ----------------- | :-------: | ------------------------------------ |
| `addressSelected` | `address` | The address selected by the guardian |

### setGuardiansThreshold

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#setguardiansthreshold)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
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

### setRecoverySecretHash

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#setrecoverysecrethash)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
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

### supportsInterface

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#supportsinterface)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
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

### target

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#target)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
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

### transferOwnership

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#transferownership)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
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

## Events

### GuardianAdded

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#guardianadded)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Event signature: `GuardianAdded(address)`
- Event hash: `0x038596bb31e2e7d3d9f184d4c98b310103f6d7f5830e5eec32bffe6f1728f969`

:::

```solidity
event GuardianAdded(address indexed newGuardian);
```

_Emitted when setting a new guardian for the target_

#### Parameters

| Name                        |   Type    | Description |
| --------------------------- | :-------: | ----------- |
| `newGuardian` **`indexed`** | `address` | -           |

### GuardianRemoved

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#guardianremoved)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Event signature: `GuardianRemoved(address)`
- Event hash: `0xb8107d0c6b40be480ce3172ee66ba6d64b71f6b1685a851340036e6e2e3e3c52`

:::

```solidity
event GuardianRemoved(address indexed removedGuardian);
```

_Emitted when removing an existing guardian for the target_

#### Parameters

| Name                            |   Type    | Description |
| ------------------------------- | :-------: | ----------- |
| `removedGuardian` **`indexed`** | `address` | -           |

### GuardiansThresholdChanged

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#guardiansthresholdchanged)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Event signature: `GuardiansThresholdChanged(uint256)`
- Event hash: `0x7146d20a2c7b7c75c203774c9f241b61698fac43a4a81ccd828f0d8162392790`

:::

```solidity
event GuardiansThresholdChanged(uint256 indexed guardianThreshold);
```

_Emitted when changing the guardian threshold_

#### Parameters

| Name                              |   Type    | Description |
| --------------------------------- | :-------: | ----------- |
| `guardianThreshold` **`indexed`** | `uint256` | -           |

### OwnershipTransferred

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#ownershiptransferred)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
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

### RecoveryProcessSuccessful

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#recoveryprocesssuccessful)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Event signature: `RecoveryProcessSuccessful(uint256,address,bytes32,address[])`
- Event hash: `0xf4ff8803d6b43af46d48c200977209829c2f42f19f27eda1c89dbf26a28009cd`

:::

```solidity
event RecoveryProcessSuccessful(uint256 indexed recoveryCounter, address indexed newController, bytes32 indexed newSecretHash, address[] guardians);
```

_Emitted when the recovery process is finished by the controller who reached the guardian threshold and submitted the string that produce the secretHash_

#### Parameters

| Name                            |    Type     | Description |
| ------------------------------- | :---------: | ----------- |
| `recoveryCounter` **`indexed`** |  `uint256`  | -           |
| `newController` **`indexed`**   |  `address`  | -           |
| `newSecretHash` **`indexed`**   |  `bytes32`  | -           |
| `guardians`                     | `address[]` | -           |

### SecretHashChanged

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#secrethashchanged)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Event signature: `SecretHashChanged(bytes32)`
- Event hash: `0x2e8c5419a62207ade549fe0b66c1c85c16f5e1ed654815dee3a3f3ac41770df3`

:::

```solidity
event SecretHashChanged(bytes32 indexed secretHash);
```

_Emitted when changing the secret hash_

#### Parameters

| Name                       |   Type    | Description |
| -------------------------- | :-------: | ----------- |
| `secretHash` **`indexed`** | `bytes32` | -           |

### SelectedNewController

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#selectednewcontroller)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Event signature: `SelectedNewController(uint256,address,address)`
- Event hash: `0xe43f3c1093c69ab76b2cf6246090acb2f8eab7f19ba9942dfc8b8ec446e3a3de`

:::

```solidity
event SelectedNewController(uint256 indexed recoveryCounter, address indexed guardian, address indexed addressSelected);
```

_Emitted when a guardian select a new potentiel controller address for the target_

#### Parameters

| Name                            |   Type    | Description |
| ------------------------------- | :-------: | ----------- |
| `recoveryCounter` **`indexed`** | `uint256` | -           |
| `guardian` **`indexed`**        | `address` | -           |
| `addressSelected` **`indexed`** | `address` | -           |

## Errors

### AddressZeroNotAllowed

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#addresszeronotallowed)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Error signature: `AddressZeroNotAllowed()`
- Error hash: `0x0855380c`

:::

```solidity
error AddressZeroNotAllowed();
```

reverts when the address zero calls `recoverOwnership(..)` function

### CallerIsNotGuardian

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#callerisnotguardian)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
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

### GuardianAlreadyExist

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#guardianalreadyexist)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
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

### GuardianDoNotExist

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#guardiandonotexist)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
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

### GuardiansNumberCannotGoBelowThreshold

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#guardiansnumbercannotgobelowthreshold)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
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

### SecretHashCannotBeZero

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#secrethashcannotbezero)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Error signature: `SecretHashCannotBeZero()`
- Error hash: `0x7f617002`

:::

```solidity
error SecretHashCannotBeZero();
```

reverts when the secret hash provided is equal to bytes32(0)

### ThresholdCannotBeHigherThanGuardiansNumber

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#thresholdcannotbehigherthanguardiansnumber)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
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

### ThresholdNotReachedForRecoverer

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#thresholdnotreachedforrecoverer)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
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

### WrongPlainSecret

:::note Links

- Specification details in [**LSP-11-BasicSocialRecovery**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-11-BasicSocialRecovery.md#wrongplainsecret)
- Solidity implementation in [**LSP11BasicSocialRecovery**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)
- Error signature: `WrongPlainSecret()`
- Error hash: `0x6fa723c3`

:::

```solidity
error WrongPlainSecret();
```

reverts when the plain secret produce a different hash than the secret hash originally set
