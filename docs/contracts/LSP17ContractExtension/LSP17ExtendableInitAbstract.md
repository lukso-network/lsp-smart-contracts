<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP17ExtendableInitAbstract

:::info Standard Specifications

[`LSP-17-ContractExtension`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-17-ContractExtension.md)

:::
:::info Solidity implementation

[`LSP17ExtendableInitAbstract.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp17contractextension-contracts/contracts/LSP17ExtendableInitAbstract.sol)

:::

> Module to add more functionalities to a contract using extensions.

Implementation of the `fallback(...)` logic according to LSP17

- Contract Extension standard. This module can be inherited to extend the functionality of the parent contract when calling a function that doesn't exist on the parent contract via forwarding the call to an extension mapped to the function selector being called, set originally by the parent contract

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### supportsInterface

:::note References

- Specification details: [**LSP-17-ContractExtension**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-17-ContractExtension.md#supportsinterface)
- Solidity implementation: [`LSP17ExtendableInitAbstract.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp17contractextension-contracts/contracts/LSP17ExtendableInitAbstract.sol)
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

### \_supportsInterfaceInERC165Extension

```solidity
function _supportsInterfaceInERC165Extension(
  bytes4 interfaceId
) internal view returns (bool);
```

Returns whether the interfaceId being checked is supported in the extension of the [`supportsInterface`](#supportsinterface) selector. To be used by extendable contracts wishing to extend the ERC165 interfaceIds originally supported by reading whether the interfaceId queried is supported in the `supportsInterface` extension if the extension is set, if not it returns false.

#### Parameters

| Name          |   Type   | Description |
| ------------- | :------: | ----------- |
| `interfaceId` | `bytes4` | -           |

#### Returns

| Name |  Type  | Description |
| ---- | :----: | ----------- |
| `0`  | `bool` | -           |

<br/>

### \_getExtensionAndForwardValue

```solidity
function _getExtensionAndForwardValue(
  bytes4 functionSelector
) internal view returns (address, bool);
```

Returns the extension mapped to a specific function selector If no extension was found, return the address(0) To be overridden. Up to the implementer contract to return an extension based on a function selector

#### Parameters

| Name               |   Type   | Description |
| ------------------ | :------: | ----------- |
| `functionSelector` | `bytes4` | -           |

#### Returns

| Name |   Type    | Description |
| ---- | :-------: | ----------- |
| `0`  | `address` | -           |
| `1`  |  `bool`   | -           |

<br/>

### \_fallbackLSP17Extendable

:::tip Hint

This function does not forward to the extension contract the `msg.value` received by the contract that inherits `LSP17Extendable`. If you would like to forward the `msg.value` to the extension contract, you can override the code of this internal function as follow: `solidity (bool success, bytes memory result) = extension.call{value: msg.value}( abi.encodePacked(callData, msg.sender, msg.value) ); `

:::

```solidity
function _fallbackLSP17Extendable(
  bytes callData
) internal nonpayable returns (bytes);
```

Forwards the call to an extension mapped to a function selector. Calls [`_getExtensionAndForwardValue`](#_getextensionandforwardvalue) to get the address of the extension mapped to the function selector being called on the account. If there is no extension, the `address(0)` will be returned. Forwards the value if the extension is payable. Reverts if there is no extension for the function being called. If there is an extension for the function selector being called, it calls the extension with the `CALL` opcode, passing the `msg.data` appended with the 20 bytes of the [`msg.sender`](#msg.sender) and 32 bytes of the `msg.value`.

#### Parameters

| Name       |  Type   | Description |
| ---------- | :-----: | ----------- |
| `callData` | `bytes` | -           |

#### Returns

| Name |  Type   | Description |
| ---- | :-----: | ----------- |
| `0`  | `bytes` | -           |

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
- Solidity implementation: [`LSP17ExtendableInitAbstract.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp17contractextension-contracts/contracts/LSP17ExtendableInitAbstract.sol)
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
