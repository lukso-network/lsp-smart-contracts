<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP6Utils

:::info Standard Specifications

[`LSP-6-KeyManager`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-6-KeyManager.md)

:::
:::info Solidity implementation

[`LSP6Utils.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp6-contracts/contracts/LSP6KeyManager.sol)

:::

> LSP6 Utility library.

LSP6Utils is a library of utility functions that can be used to retrieve, check and set LSP6 permissions stored under the ERC725Y storage of a smart contract. Based on the LSP6 Key Manager standard.

## Internal Methods

Any method labeled as `internal` serves as utility function within the contract. They can be used when writing solidity contracts that inherit from this contract. These methods can be extended or modified by overriding their internal behavior to suit specific needs.

Internal functions cannot be called externally, whether from other smart contracts, dApp interfaces, or backend services. Their restricted accessibility ensures that they remain exclusively available within the context of the current contract, promoting controlled and encapsulated usage of these internal utilities.

### getPermissionsFor

:::info

If the raw value fetched from the ERC725Y storage of `target` is not 32 bytes long, this is considered
like _"no permissions are set"_ and will return 32 x `0x00` bytes as `bytes32(0)`.

:::

```solidity
function getPermissionsFor(contract IERC725Y target, address caller) internal view returns (bytes32);
```

Read the permissions of a `caller` on an ERC725Y `target` contract.

#### Parameters

| Name     |        Type         | Description                                           |
| -------- | :-----------------: | ----------------------------------------------------- |
| `target` | `contract IERC725Y` | An `IERC725Y` contract where to read the permissions. |
| `caller` |      `address`      | The controller address to read the permissions from.  |

#### Returns

| Name |   Type    | Description                                                              |
| ---- | :-------: | ------------------------------------------------------------------------ |
| `0`  | `bytes32` | A `bytes32` BitArray containing the permissions of a controller address. |

<br/>

### getAllowedCallsFor

```solidity
function getAllowedCallsFor(contract IERC725Y target, address from) internal view returns (bytes);
```

<br/>

### getAllowedERC725YDataKeysFor

```solidity
function getAllowedERC725YDataKeysFor(contract IERC725Y target, address caller) internal view returns (bytes);
```

Read the Allowed ERC725Y data keys of a `caller` on an ERC725Y `target` contract.

#### Parameters

| Name     |        Type         | Description                                           |
| -------- | :-----------------: | ----------------------------------------------------- |
| `target` | `contract IERC725Y` | An `IERC725Y` contract where to read the permissions. |
| `caller` |      `address`      | The controller address to read the permissions from.  |

#### Returns

| Name |  Type   | Description                                                                                               |
| ---- | :-----: | --------------------------------------------------------------------------------------------------------- |
| `0`  | `bytes` | An abi-encoded array of allowed ERC725 data keys that the controller address is allowed to interact with. |

<br/>

### hasPermission

```solidity
function hasPermission(
  bytes32 controllerPermissions,
  bytes32 permissionToCheck
) internal pure returns (bool);
```

Compare the permissions `controllerPermissions` of a controller address to check if they includes the permissions `permissionToCheck`.

#### Parameters

| Name                    |   Type    | Description                                                                       |
| ----------------------- | :-------: | --------------------------------------------------------------------------------- |
| `controllerPermissions` | `bytes32` | The permissions of an address.                                                    |
| `permissionToCheck`     | `bytes32` | The permissions to check if the controller has under its `controllerPermissions`. |

#### Returns

| Name |  Type  | Description                                                                        |
| ---- | :----: | ---------------------------------------------------------------------------------- |
| `0`  | `bool` | `true` if `controllerPermissions` includes `permissionToCheck`, `false` otherwise. |

<br/>

### isCompactBytesArrayOfAllowedCalls

```solidity
function isCompactBytesArrayOfAllowedCalls(
  bytes allowedCallsCompacted
) internal pure returns (bool);
```

Same as `LSP2Utils.isCompactBytesArray` with the additional requirement that each element must be 32 bytes long.

#### Parameters

| Name                    |  Type   | Description                                                                                                                                         |
| ----------------------- | :-----: | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `allowedCallsCompacted` | `bytes` | A compact bytes array of tuples `(bytes4,address,bytes4,bytes4)` to check (defined as `(bytes4,address,bytes4,bytes4)[CompactBytesArray]` in LSP6). |

#### Returns

| Name |  Type  | Description                                                                                                    |
| ---- | :----: | -------------------------------------------------------------------------------------------------------------- |
| `0`  | `bool` | `true` if the value passed is a valid compact bytes array of bytes32 AllowedCalls elements, `false` otherwise. |

<br/>

### isCompactBytesArrayOfAllowedERC725YDataKeys

```solidity
function isCompactBytesArrayOfAllowedERC725YDataKeys(
  bytes allowedERC725YDataKeysCompacted
) internal pure returns (bool);
```

Same as `LSP2Utils.isCompactBytesArray` with the additional requirement that each element must be from 1 to 32 bytes long.

#### Parameters

| Name                              |  Type   | Description                                                                                                                            |
| --------------------------------- | :-----: | -------------------------------------------------------------------------------------------------------------------------------------- |
| `allowedERC725YDataKeysCompacted` | `bytes` | a compact bytes array of ERC725Y data Keys (full bytes32 data keys or bytesN prefix) to check (defined as `bytes[CompactBytesArray]`). |

#### Returns

| Name |  Type  | Description                                                                                                        |
| ---- | :----: | ------------------------------------------------------------------------------------------------------------------ |
| `0`  | `bool` | `true` if the value passed is a valid compact bytes array of bytes32 Allowed ERC725Y data keys, `false` otherwise. |

<br/>

### setDataViaKeyManager

```solidity
function setDataViaKeyManager(
  address keyManagerAddress,
  bytes32[] keys,
  bytes[] values
) internal nonpayable returns (bytes result);
```

Use the `setData(bytes32[],bytes[])` function via the KeyManager on the target contract.

#### Parameters

| Name                |    Type     | Description                         |
| ------------------- | :---------: | ----------------------------------- |
| `keyManagerAddress` |  `address`  | The address of the KeyManager.      |
| `keys`              | `bytes32[]` | The array of `bytes32[]` data keys. |
| `values`            |  `bytes[]`  | The array of `bytes[]` data values. |

<br/>

### combinePermissions

```solidity
function combinePermissions(
  bytes32[] permissions
) internal pure returns (bytes32);
```

Combine multiple permissions into a single `bytes32`.
Make sure that the sum of the values of the input array is less than `2^256-1 to avoid overflow.

#### Parameters

| Name          |    Type     | Description                          |
| ------------- | :---------: | ------------------------------------ |
| `permissions` | `bytes32[]` | The array of permissions to combine. |

#### Returns

| Name |   Type    | Description                                            |
| ---- | :-------: | ------------------------------------------------------ |
| `0`  | `bytes32` | A `bytes32` value containing the combined permissions. |

<br/>

### generateNewPermissionsKeys

```solidity
function generateNewPermissionsKeys(contract IERC725Y account, address controller, bytes32 permissions) internal view returns (bytes32[] keys, bytes[] values);
```

Generate a new set of 3 x LSP6 permission data keys to add a new `controller` on `account`.

#### Parameters

| Name          |        Type         | Description                                                                                     |
| ------------- | :-----------------: | ----------------------------------------------------------------------------------------------- |
| `account`     | `contract IERC725Y` | The ERC725Y contract to add the controller into (used to fetch the `LSP6Permissions[]` length). |
| `controller`  |      `address`      | The address of the controller to grant permissions to.                                          |
| `permissions` |      `bytes32`      | The `BitArray` of permissions to grant to the controller.                                       |

#### Returns

| Name     |    Type     | Description                             |
| -------- | :---------: | --------------------------------------- |
| `keys`   | `bytes32[]` | An array of 3 x data keys containing:   |
| `values` |  `bytes[]`  | An array of 3 x data values containing: |

<br/>

### getPermissionName

```solidity
function getPermissionName(bytes32 permission) internal pure returns (string);
```

Returns the name of the permission as a string.

#### Parameters

| Name         |   Type    | Description                                                                         |
| ------------ | :-------: | ----------------------------------------------------------------------------------- |
| `permission` | `bytes32` | The low-level `bytes32` permission as a `BitArray` to get the permission name from. |

#### Returns

| Name |   Type   | Description                                        |
| ---- | :------: | -------------------------------------------------- |
| `0`  | `string` | The string name of the `bytes32` permission value. |

<br/>
