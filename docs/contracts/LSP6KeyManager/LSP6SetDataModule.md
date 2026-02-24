<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP6SetDataModule

:::info Standard Specifications

[`LSP-6-KeyManager`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-6-KeyManager.md)

:::
:::info Solidity implementation

[`LSP6SetDataModule.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp6-contracts/contracts/LSP6Modules/LSP6SetDataModule.sol)

:::

## Internal Methods

Any method labeled as `internal` serves as utility function within the contract. They can be used when writing solidity contracts that inherit from this contract. These methods can be extended or modified by overriding their internal behavior to suit specific needs.

Internal functions cannot be called externally, whether from other smart contracts, dApp interfaces, or backend services. Their restricted accessibility ensures that they remain exclusively available within the context of the current contract, promoting controlled and encapsulated usage of these internal utilities.

### \_verifyCanSetData

```solidity
function _verifyCanSetData(
  address controlledContract,
  address controllerAddress,
  bytes32 controllerPermissions,
  bytes32 inputDataKey,
  bytes inputDataValue
) internal view;
```

verify if the `controllerAddress` has the permissions required to set a data key on the ERC725Y storage of the `controlledContract`.

#### Parameters

| Name                    |   Type    | Description                                                    |
| ----------------------- | :-------: | -------------------------------------------------------------- |
| `controlledContract`    | `address` | the address of the ERC725Y contract where the data key is set. |
| `controllerAddress`     | `address` | the address of the controller who wants to set the data key.   |
| `controllerPermissions` | `bytes32` | the permissions of the controller address.                     |
| `inputDataKey`          | `bytes32` | the data key to set on the `controlledContract`.               |
| `inputDataValue`        |  `bytes`  | the data value to set for the `inputDataKey`.                  |

<br/>

### \_verifyCanSetData

```solidity
function _verifyCanSetData(
  address controlledContract,
  address controller,
  bytes32 permissions,
  bytes32[] inputDataKeys,
  bytes[] inputDataValues
) internal view;
```

verify if the `controllerAddress` has the permissions required to set an array of data keys on the ERC725Y storage of the `controlledContract`.

#### Parameters

| Name                 |    Type     | Description                                                    |
| -------------------- | :---------: | -------------------------------------------------------------- |
| `controlledContract` |  `address`  | the address of the ERC725Y contract where the data key is set. |
| `controller`         |  `address`  | the address of the controller who wants to set the data key.   |
| `permissions`        |  `bytes32`  | the permissions of the controller address.                     |
| `inputDataKeys`      | `bytes32[]` | an array of data keys to set on the `controlledContract`.      |
| `inputDataValues`    |  `bytes[]`  | an array of data values to set for the `inputDataKeys`.        |

<br/>

### \_getPermissionRequiredToSetDataKey

```solidity
function _getPermissionRequiredToSetDataKey(
  address controlledContract,
  bytes32 controllerPermissions,
  bytes32 inputDataKey,
  bytes inputDataValue
) internal view returns (bytes32);
```

retrieve the permission required based on the data key to be set on the `controlledContract`.

#### Parameters

| Name                    |   Type    | Description                                                                                                             |
| ----------------------- | :-------: | ----------------------------------------------------------------------------------------------------------------------- |
| `controlledContract`    | `address` | the address of the ERC725Y contract where the data key is verified.                                                     |
| `controllerPermissions` | `bytes32` | -                                                                                                                       |
| `inputDataKey`          | `bytes32` | the data key to set on the `controlledContract`. Can be related to LSP6 Permissions, LSP1 Delegate or LSP17 Extensions. |
| `inputDataValue`        |  `bytes`  | the data value to set for the `inputDataKey`.                                                                           |

#### Returns

| Name |   Type    | Description                                                                    |
| ---- | :-------: | ------------------------------------------------------------------------------ |
| `0`  | `bytes32` | the permission required to set the `inputDataKey` on the `controlledContract`. |

<br/>

### \_getPermissionToSetPermissionsArray

```solidity
function _getPermissionToSetPermissionsArray(
  address controlledContract,
  bytes32 inputDataKey,
  bytes inputDataValue,
  bool hasBothAddControllerAndEditPermissions
) internal view returns (bytes32);
```

retrieve the permission required to update the `AddressPermissions[]` array data key defined in LSP6.

#### Parameters

| Name                                     |   Type    | Description                                                                                                                                                                      |
| ---------------------------------------- | :-------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `controlledContract`                     | `address` | the address of the ERC725Y contract where the data key is verified.                                                                                                              |
| `inputDataKey`                           | `bytes32` | either `AddressPermissions[]` (array length) or `AddressPermissions[index]` (array index)                                                                                        |
| `inputDataValue`                         |  `bytes`  | the updated value for the `inputDataKey`. MUST be: - a `uint256` for `AddressPermissions[]` (array length) - an `address` or `0x` for `AddressPermissions[index]` (array entry). |
| `hasBothAddControllerAndEditPermissions` |  `bool`   | -                                                                                                                                                                                |

#### Returns

| Name |   Type    | Description                       |
| ---- | :-------: | --------------------------------- |
| `0`  | `bytes32` | either ADD or CHANGE PERMISSIONS. |

<br/>

### \_getPermissionToSetControllerPermissions

```solidity
function _getPermissionToSetControllerPermissions(
  address controlledContract,
  bytes32 inputPermissionDataKey
) internal view returns (bytes32);
```

retrieve the permission required to set permissions for a controller address.

#### Parameters

| Name                     |   Type    | Description                                                         |
| ------------------------ | :-------: | ------------------------------------------------------------------- |
| `controlledContract`     | `address` | the address of the ERC725Y contract where the data key is verified. |
| `inputPermissionDataKey` | `bytes32` | `AddressPermissions:Permissions:<controller-address>`.              |

#### Returns

| Name |   Type    | Description                       |
| ---- | :-------: | --------------------------------- |
| `0`  | `bytes32` | either ADD or CHANGE PERMISSIONS. |

<br/>

### \_getPermissionToSetAllowedCalls

```solidity
function _getPermissionToSetAllowedCalls(
  address controlledContract,
  bytes32 dataKey,
  bytes dataValue,
  bool hasBothAddControllerAndEditPermissions
) internal view returns (bytes32);
```

Retrieve the permission required to set some AllowedCalls for a controller.

#### Parameters

| Name                                     |   Type    | Description                                                                                 |
| ---------------------------------------- | :-------: | ------------------------------------------------------------------------------------------- |
| `controlledContract`                     | `address` | The address of the ERC725Y contract from which to fetch the value of `dataKey`.             |
| `dataKey`                                | `bytes32` | A data key ion the format `AddressPermissions:AllowedCalls:<controller-address>`.           |
| `dataValue`                              |  `bytes`  | The updated value for the `dataKey`. MUST be a bytes32[CompactBytesArray] of Allowed Calls. |
| `hasBothAddControllerAndEditPermissions` |  `bool`   | -                                                                                           |

#### Returns

| Name |   Type    | Description                     |
| ---- | :-------: | ------------------------------- |
| `0`  | `bytes32` | Either ADD or EDIT PERMISSIONS. |

<br/>

### \_getPermissionToSetAllowedERC725YDataKeys

```solidity
function _getPermissionToSetAllowedERC725YDataKeys(
  address controlledContract,
  bytes32 dataKey,
  bytes dataValue,
  bool hasBothAddControllerAndEditPermissions
) internal view returns (bytes32);
```

Retrieve the permission required to set some Allowed ERC725Y Data Keys for a controller.

#### Parameters

| Name                                     |   Type    | Description                                                                                           |
| ---------------------------------------- | :-------: | ----------------------------------------------------------------------------------------------------- |
| `controlledContract`                     | `address` | the address of the ERC725Y contract from which to fetch the value of `dataKey`.                       |
| `dataKey`                                | `bytes32` | A data key in the format `AddressPermissions:AllowedERC725YDataKeys:<controller-address>`.            |
| `dataValue`                              |  `bytes`  | The updated value for the `dataKey`. MUST be a bytes[CompactBytesArray] of Allowed ERC725Y Data Keys. |
| `hasBothAddControllerAndEditPermissions` |  `bool`   | -                                                                                                     |

#### Returns

| Name |   Type    | Description                     |
| ---- | :-------: | ------------------------------- |
| `0`  | `bytes32` | Either ADD or EDIT PERMISSIONS. |

<br/>

### \_getPermissionToSetLSP1Delegate

```solidity
function _getPermissionToSetLSP1Delegate(
  address controlledContract,
  bytes32 lsp1DelegateDataKey
) internal view returns (bytes32);
```

retrieve the permission required to either add or change the address of a LSP1 Universal Receiver Delegate stored under a specific LSP1 data key.

#### Parameters

| Name                  |   Type    | Description                                                                                                                                                                                           |
| --------------------- | :-------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `controlledContract`  | `address` | the address of the ERC725Y contract where the data key is verified.                                                                                                                                   |
| `lsp1DelegateDataKey` | `bytes32` | either the data key for the default `LSP1UniversalReceiverDelegate`, or a data key for a specific `LSP1UniversalReceiverDelegate:<typeId>`, starting with `_LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX`. |

#### Returns

| Name |   Type    | Description                                     |
| ---- | :-------: | ----------------------------------------------- |
| `0`  | `bytes32` | either ADD or CHANGE UNIVERSALRECEIVERDELEGATE. |

<br/>

### \_getPermissionToSetLSP17Extension

```solidity
function _getPermissionToSetLSP17Extension(
  address controlledContract,
  bytes32 lsp17ExtensionDataKey
) internal view returns (bytes32);
```

Verify if `controller` has the required permissions to either add or change the address of an LSP0 Extension stored under a specific LSP17Extension data key

#### Parameters

| Name                    |   Type    | Description                                                         |
| ----------------------- | :-------: | ------------------------------------------------------------------- |
| `controlledContract`    | `address` | the address of the ERC725Y contract where the data key is verified. |
| `lsp17ExtensionDataKey` | `bytes32` | the dataKey to set with `_LSP17_EXTENSION_PREFIX` as prefix.        |

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `bytes32` | -           |

<br/>

### \_verifyAllowedERC725YSingleKey

```solidity
function _verifyAllowedERC725YSingleKey(
  address controllerAddress,
  bytes32 inputDataKey,
  bytes allowedERC725YDataKeysCompacted
) internal pure;
```

Verify if the `inputKey` is present in the list of `allowedERC725KeysCompacted` for the `controllerAddress`.

#### Parameters

| Name                              |   Type    | Description                                                                               |
| --------------------------------- | :-------: | ----------------------------------------------------------------------------------------- |
| `controllerAddress`               | `address` | the address of the controller.                                                            |
| `inputDataKey`                    | `bytes32` | the data key to verify against the allowed ERC725Y Data Keys for the `controllerAddress`. |
| `allowedERC725YDataKeysCompacted` |  `bytes`  | a CompactBytesArray of allowed ERC725Y Data Keys for the `controllerAddress`.             |

<br/>

### \_verifyAllowedERC725YDataKeys

```solidity
function _verifyAllowedERC725YDataKeys(
  address controllerAddress,
  bytes32[] inputDataKeys,
  bytes allowedERC725YDataKeysCompacted,
  bool[] validatedInputKeysList,
  uint256 allowedDataKeysFound
) internal pure;
```

Verify if all the `inputDataKeys` are present in the list of `allowedERC725KeysCompacted` of the `controllerAddress`.

#### Parameters

| Name                              |    Type     | Description                                                                                                                  |
| --------------------------------- | :---------: | ---------------------------------------------------------------------------------------------------------------------------- |
| `controllerAddress`               |  `address`  | the address of the controller.                                                                                               |
| `inputDataKeys`                   | `bytes32[]` | the data keys to verify against the allowed ERC725Y Data Keys of the `controllerAddress`.                                    |
| `allowedERC725YDataKeysCompacted` |   `bytes`   | a CompactBytesArray of allowed ERC725Y Data Keys of the `controllerAddress`.                                                 |
| `validatedInputKeysList`          |  `bool[]`   | an array of booleans to store the result of the verification of each data keys checked.                                      |
| `allowedDataKeysFound`            |  `uint256`  | the number of data keys that were previously validated for other permissions like `ADDCONTROLLER`, `EDITPERMISSIONS`, etc... |

<br/>

### \_requirePermissions

```solidity
function _requirePermissions(
  address controller,
  bytes32 addressPermissions,
  bytes32 permissionRequired
) internal pure;
```

revert if `controller`'s `addressPermissions` doesn't contain `permissionsRequired`

#### Parameters

| Name                 |   Type    | Description                       |
| -------------------- | :-------: | --------------------------------- |
| `controller`         | `address` | the caller address                |
| `addressPermissions` | `bytes32` | the caller's permissions BitArray |
| `permissionRequired` | `bytes32` | the required permission           |

<br/>
