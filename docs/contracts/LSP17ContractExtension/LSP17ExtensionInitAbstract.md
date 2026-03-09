<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP17ExtensionInitAbstract

:::info Standard Specifications

[`LSP-17-ContractExtension`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-17-ContractExtension.md)

:::
:::info Solidity implementation

[`LSP17ExtensionInitAbstract.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp17contractextension-contracts/contracts/LSP17ExtensionInitAbstract.sol)

:::

> Module to create a contract that can act as an extension.

Implementation of the extension logic according to LSP17ContractExtension. This module can be inherited to provide context of the msg variable related to the extendable contract

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### VERSION

:::note References

- Specification details: [**LSP-17-ContractExtension**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-17-ContractExtension.md#version)
- Solidity implementation: [`LSP17ExtensionInitAbstract.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp17contractextension-contracts/contracts/LSP17ExtensionInitAbstract.sol)
- Function signature: `VERSION()`
- Function selector: `0xffa1ad74`

:::

```solidity
function VERSION() external view returns (string);
```

_Contract version._

Get the version of the contract.

#### Returns

| Name |   Type   | Description                      |
| ---- | :------: | -------------------------------- |
| `0`  | `string` | The version of the the contract. |

<br/>

### supportsInterface

:::note References

- Specification details: [**LSP-17-ContractExtension**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-17-ContractExtension.md#supportsinterface)
- Solidity implementation: [`LSP17ExtensionInitAbstract.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp17contractextension-contracts/contracts/LSP17ExtensionInitAbstract.sol)
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

## Internal Methods

Any method labeled as `internal` serves as utility function within the contract. They can be used when writing solidity contracts that inherit from this contract. These methods can be extended or modified by overriding their internal behavior to suit specific needs.

Internal functions cannot be called externally, whether from other smart contracts, dApp interfaces, or backend services. Their restricted accessibility ensures that they remain exclusively available within the context of the current contract, promoting controlled and encapsulated usage of these internal utilities.

### \_extendableMsgData

```solidity
function _extendableMsgData() internal view returns (bytes);
```

Returns the original `msg.data` passed to the extendable contract without the appended `msg.sender` and `msg.value`.

#### Returns

| Name |  Type   | Description |
| ---- | :-----: | ----------- |
| `0`  | `bytes` | -           |

<br/>

### \_extendableMsgSender

```solidity
function _extendableMsgSender() internal view returns (address);
```

Returns the original `msg.sender` calling the extendable contract.

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `address` | -           |

<br/>

### \_extendableMsgValue

```solidity
function _extendableMsgValue() internal view returns (uint256);
```

Returns the original `msg.value` sent to the extendable contract.

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `uint256` | -           |

<br/>

### \_\_ERC165_init

```solidity
function __ERC165_init() internal nonpayable;
```

<br/>

### \_\_ERC165_init_unchained

```solidity
function __ERC165_init_unchained() internal nonpayable;
```

<br/>

### \_disableInitializers

```solidity
function _disableInitializers() internal nonpayable;
```

Locks the contract, preventing any future reinitialization. This cannot be part of an initializer call. Calling this in the constructor of a contract will prevent that contract from being initialized or reinitialized to any version. It is recommended to use this to lock implementation contracts that are designed to be called through proxies. Emits an [`Initialized`](#initialized) event the first time it is successfully executed.

<br/>

### \_getInitializedVersion

```solidity
function _getInitializedVersion() internal view returns (uint8);
```

Returns the highest version that has been initialized. See [`reinitializer`](#reinitializer).

#### Returns

| Name |  Type   | Description |
| ---- | :-----: | ----------- |
| `0`  | `uint8` | -           |

<br/>

### \_isInitializing

```solidity
function _isInitializing() internal view returns (bool);
```

Returns `true` if the contract is currently initializing. See [`onlyInitializing`](#onlyinitializing).

#### Returns

| Name |  Type  | Description |
| ---- | :----: | ----------- |
| `0`  | `bool` | -           |

<br/>

## Events

### Initialized

:::note References

- Specification details: [**LSP-17-ContractExtension**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-17-ContractExtension.md#initialized)
- Solidity implementation: [`LSP17ExtensionInitAbstract.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp17contractextension-contracts/contracts/LSP17ExtensionInitAbstract.sol)
- Event signature: `Initialized(uint8)`
- Event topic hash: `0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498`

:::

```solidity
event Initialized(uint8 version);
```

Triggered when the contract has been initialized or reinitialized.

#### Parameters

| Name      |  Type   | Description |
| --------- | :-----: | ----------- |
| `version` | `uint8` | -           |

<br/>
