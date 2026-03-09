<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# ILSP6KeyManager

:::info Standard Specifications

[`LSP-6-KeyManager`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-6-KeyManager.md)

:::
:::info Solidity implementation

[`ILSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp6-contracts/contracts/ILSP6KeyManager.sol)

:::

> Interface of the LSP6

- Key Manager standard, a contract acting as a controller of an ERC725 Account using predefined permissions.

Interface of the ERC1271 standard signature validation method for contracts as defined [**in**](https://eips.ethereum.org/EIPS/eip-1271[ERC-1271].) _Available since v4.1._

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### execute

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-6-KeyManager.md#execute)
- Solidity implementation: [`ILSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp6-contracts/contracts/ILSP6KeyManager.sol)
- Function signature: `execute(bytes)`
- Function selector: `0x09c5eabe`

:::

```solidity
function execute(bytes payload) external payable returns (bytes);
```

_Executing the following payload on the linked contract: `payload`_

Execute A `payload` on the linked [`target`](#target) contract after having verified the permissions associated with the function being run. The `payload` MUST be a valid abi-encoded function call of one of the functions present in the linked [`target`](#target), otherwise the call will fail. The linked [`target`](#target) will return some data on successful execution, or revert on failure.

#### Parameters

| Name      |  Type   | Description                                                                 |
| --------- | :-----: | --------------------------------------------------------------------------- |
| `payload` | `bytes` | The abi-encoded function call to execute on the linked [`target`](#target). |

#### Returns

| Name |  Type   | Description                                                                             |
| ---- | :-----: | --------------------------------------------------------------------------------------- |
| `0`  | `bytes` | The abi-decoded data returned by the function called on the linked [`target`](#target). |

<br/>

### executeBatch

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-6-KeyManager.md#executebatch)
- Solidity implementation: [`ILSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp6-contracts/contracts/ILSP6KeyManager.sol)
- Function signature: `executeBatch(uint256[],bytes[])`
- Function selector: `0xbf0176ff`

:::

```solidity
function executeBatch(
  uint256[] values,
  bytes[] payloads
) external payable returns (bytes[]);
```

\*Executing the following batch of payloads and sensind on the linked contract.

- payloads: `payloads`

- values transferred for each payload: `values`\*

Same as [`execute`](#execute) but execute a batch of payloads (abi-encoded function calls) in a single transaction.

#### Parameters

| Name       |    Type     | Description                                                                                       |
| ---------- | :---------: | ------------------------------------------------------------------------------------------------- |
| `values`   | `uint256[]` | An array of amount of native tokens to be transferred for each `payload`.                         |
| `payloads` |  `bytes[]`  | An array of abi-encoded function calls to execute successively on the linked [`target`](#target). |

#### Returns

| Name |   Type    | Description                                                                                      |
| ---- | :-------: | ------------------------------------------------------------------------------------------------ |
| `0`  | `bytes[]` | An array of abi-decoded data returned by the functions called on the linked [`target`](#target). |

<br/>

### isValidSignature

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-6-KeyManager.md#isvalidsignature)
- Solidity implementation: [`ILSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp6-contracts/contracts/ILSP6KeyManager.sol)
- Function signature: `isValidSignature(bytes32,bytes)`
- Function selector: `0x1626ba7e`

:::

```solidity
function isValidSignature(
  bytes32 hash,
  bytes signature
) external view returns (bytes4 magicValue);
```

Should return whether the signature provided is valid for the provided data

#### Parameters

| Name        |   Type    | Description                                 |
| ----------- | :-------: | ------------------------------------------- |
| `hash`      | `bytes32` | Hash of the data to be signed               |
| `signature` |  `bytes`  | Signature byte array associated with \_data |

#### Returns

| Name         |   Type   | Description |
| ------------ | :------: | ----------- |
| `magicValue` | `bytes4` | -           |

<br/>

### target

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-6-KeyManager.md#target)
- Solidity implementation: [`ILSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp6-contracts/contracts/ILSP6KeyManager.sol)
- Function signature: `target()`
- Function selector: `0xd4b83992`

:::

```solidity
function target() external view returns (address);
```

Get The address of the contract linked to this Key Manager.

#### Returns

| Name |   Type    | Description                        |
| ---- | :-------: | ---------------------------------- |
| `0`  | `address` | The address of the linked contract |

<br/>

## Events

### PermissionsVerified

:::note References

- Specification details: [**LSP-6-KeyManager**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-6-KeyManager.md#permissionsverified)
- Solidity implementation: [`ILSP6KeyManager.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp6-contracts/contracts/ILSP6KeyManager.sol)
- Event signature: `PermissionsVerified(address,uint256,bytes4)`
- Event topic hash: `0xc0a62328f6bf5e3172bb1fcb2019f54b2c523b6a48e3513a2298fbf0150b781e`

:::

```solidity
event PermissionsVerified(
  address indexed signer,
  uint256 indexed value,
  bytes4 indexed selector
);
```

_Verified the permissions of `signer` for calling function `selector` on the linked account and sending `value` of native token._

Emitted when the LSP6KeyManager contract verified the permissions of the `signer` successfully.

#### Parameters

| Name                     |   Type    | Description                                                                                                                                                                         |
| ------------------------ | :-------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signer` **`indexed`**   | `address` | The address of the controller that executed the calldata payload (either directly via [`execute`](#execute) or via meta transaction using [`executeRelayCall`](#executerelaycall)). |
| `value` **`indexed`**    | `uint256` | The amount of native token to be transferred in the calldata payload.                                                                                                               |
| `selector` **`indexed`** | `bytes4`  | The bytes4 function of the function that was executed on the linked [`target`](#target)                                                                                             |

<br/>
