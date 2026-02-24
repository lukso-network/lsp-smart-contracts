<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP6ExecuteModule

:::info Standard Specifications

[`LSP-6-KeyManager`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-6-KeyManager.md)

:::
:::info Solidity implementation

[`LSP6ExecuteModule.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp6-contracts/contracts/LSP6Modules/LSP6ExecuteModule.sol)

:::

## Internal Methods

Any method labeled as `internal` serves as utility function within the contract. They can be used when writing solidity contracts that inherit from this contract. These methods can be extended or modified by overriding their internal behavior to suit specific needs.

Internal functions cannot be called externally, whether from other smart contracts, dApp interfaces, or backend services. Their restricted accessibility ensures that they remain exclusively available within the context of the current contract, promoting controlled and encapsulated usage of these internal utilities.

### \_verifyCanExecute

```solidity
function _verifyCanExecute(
  address controlledContract,
  address controller,
  bytes32 permissions,
  uint256 operationType,
  address to,
  uint256 value,
  bytes data
) internal view;
```

verify if `controllerAddress` has the required permissions to interact with other addresses using the controlledContract.

#### Parameters

| Name                 |   Type    | Description                                                                                              |
| -------------------- | :-------: | -------------------------------------------------------------------------------------------------------- |
| `controlledContract` | `address` | the address of the ERC725 contract where the payload is executed and where the permissions are verified. |
| `controller`         | `address` | the address who want to run the execute function on the ERC725Account.                                   |
| `permissions`        | `bytes32` | the permissions of the controller address.                                                               |
| `operationType`      | `uint256` | -                                                                                                        |
| `to`                 | `address` | -                                                                                                        |
| `value`              | `uint256` | -                                                                                                        |
| `data`               |  `bytes`  | -                                                                                                        |

<br/>

### \_verifyCanDeployContract

```solidity
function _verifyCanDeployContract(
  address controller,
  bytes32 permissions,
  bool isFundingContract
) internal view;
```

#### Parameters

| Name                |   Type    | Description |
| ------------------- | :-------: | ----------- |
| `controller`        | `address` | -           |
| `permissions`       | `bytes32` | -           |
| `isFundingContract` |  `bool`   | -           |

<br/>

### \_verifyCanStaticCall

```solidity
function _verifyCanStaticCall(
  address controlledContract,
  address controller,
  bytes32 permissions,
  address to,
  uint256 value,
  bytes data
) internal view;
```

#### Parameters

| Name                 |   Type    | Description |
| -------------------- | :-------: | ----------- |
| `controlledContract` | `address` | -           |
| `controller`         | `address` | -           |
| `permissions`        | `bytes32` | -           |
| `to`                 | `address` | -           |
| `value`              | `uint256` | -           |
| `data`               |  `bytes`  | -           |

<br/>

### \_verifyCanCall

```solidity
function _verifyCanCall(
  address controlledContract,
  address controller,
  bytes32 permissions,
  address to,
  uint256 value,
  bytes data
) internal view;
```

#### Parameters

| Name                 |   Type    | Description |
| -------------------- | :-------: | ----------- |
| `controlledContract` | `address` | -           |
| `controller`         | `address` | -           |
| `permissions`        | `bytes32` | -           |
| `to`                 | `address` | -           |
| `value`              | `uint256` | -           |
| `data`               |  `bytes`  | -           |

<br/>

### \_verifyAllowedCall

```solidity
function _verifyAllowedCall(
  address controlledContract,
  address controllerAddress,
  uint256 operationType,
  address to,
  uint256 value,
  bytes data
) internal view;
```

#### Parameters

| Name                 |   Type    | Description |
| -------------------- | :-------: | ----------- |
| `controlledContract` | `address` | -           |
| `controllerAddress`  | `address` | -           |
| `operationType`      | `uint256` | -           |
| `to`                 | `address` | -           |
| `value`              | `uint256` | -           |
| `data`               |  `bytes`  | -           |

<br/>

### \_extractCallType

```solidity
function _extractCallType(
  uint256 operationType,
  uint256 value,
  bytes data
) internal pure returns (bytes4 requiredCallTypes);
```

extract the bytes4 representation of a single bit for the type of call according to the `operationType`

#### Parameters

| Name            |   Type    | Description                                  |
| --------------- | :-------: | -------------------------------------------- |
| `operationType` | `uint256` | 0 = CALL, 3 = STATICCALL or 3 = DELEGATECALL |
| `value`         | `uint256` | -                                            |
| `data`          |  `bytes`  | -                                            |

#### Returns

| Name                |   Type   | Description                                               |
| ------------------- | :------: | --------------------------------------------------------- |
| `requiredCallTypes` | `bytes4` | a bytes4 value containing a single 1 bit for the callType |

<br/>

### \_isAllowedAddress

```solidity
function _isAllowedAddress(
  bytes allowedCall,
  address to
) internal pure returns (bool);
```

#### Parameters

| Name          |   Type    | Description |
| ------------- | :-------: | ----------- |
| `allowedCall` |  `bytes`  | -           |
| `to`          | `address` | -           |

#### Returns

| Name |  Type  | Description |
| ---- | :----: | ----------- |
| `0`  | `bool` | -           |

<br/>

### \_isAllowedStandard

```solidity
function _isAllowedStandard(
  bytes allowedCall,
  address to
) internal view returns (bool);
```

#### Parameters

| Name          |   Type    | Description |
| ------------- | :-------: | ----------- |
| `allowedCall` |  `bytes`  | -           |
| `to`          | `address` | -           |

#### Returns

| Name |  Type  | Description |
| ---- | :----: | ----------- |
| `0`  | `bool` | -           |

<br/>

### \_isAllowedFunction

```solidity
function _isAllowedFunction(
  bytes allowedCall,
  bytes data
) internal pure returns (bool);
```

#### Parameters

| Name          |  Type   | Description |
| ------------- | :-----: | ----------- |
| `allowedCall` | `bytes` | -           |
| `data`        | `bytes` | -           |

#### Returns

| Name |  Type  | Description |
| ---- | :----: | ----------- |
| `0`  | `bool` | -           |

<br/>

### \_isAllowedCallType

```solidity
function _isAllowedCallType(
  bytes allowedCall,
  bytes4 requiredCallTypes
) internal pure returns (bool);
```

#### Parameters

| Name                |   Type   | Description |
| ------------------- | :------: | ----------- |
| `allowedCall`       | `bytes`  | -           |
| `requiredCallTypes` | `bytes4` | -           |

#### Returns

| Name |  Type  | Description |
| ---- | :----: | ----------- |
| `0`  | `bool` | -           |

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
