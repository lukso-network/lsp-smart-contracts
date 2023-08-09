<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP10Utils

:::info Standard Specifications

[`LSP-10-ReceivedVaults`](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-10-ReceivedVaults.md)

:::
:::info Solidity implementation

[`LSP10Utils.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP10ReceivedVaults/LSP10Utils.sol)

:::

> LSP10 Utility library.

LSP5Utils is a library of functions that can be used to register and manage vaults received by an ERC725Y smart contract. Based on the LSP10 Received Vaults standard.

## Internal Methods

Any method labeled as `internal` serves as utility function within the contract. They can be used when writing solidity contracts that inherit from this contract. These methods can be extended or modified by overriding their internal behavior to suit specific needs.

Internal functions cannot be called externally, whether from other smart contracts, dApp interfaces, or backend services. Their restricted accessibility ensures that they remain exclusively available within the context of the current contract, promoting controlled and encapsulated usage of these internal utilities.

### generateReceivedVaultKeys

```solidity
function generateReceivedVaultKeys(
  address receiver,
  address vault,
  bytes32 vaultMapKey
) internal view returns (bytes32[] keys, bytes[] values);
```

Generate an array of data keys/values pairs to be set on the receiver address after receiving vaults.

#### Parameters

| Name          |   Type    | Description                                                                                                           |
| ------------- | :-------: | --------------------------------------------------------------------------------------------------------------------- |
| `receiver`    | `address` | The address receiving the vault and where the LSP10 data keys should be added.                                        |
| `vault`       | `address` | @param vaultMapKey The `LSP10VaultMap:<vault>` data key of the vault being received containing the interfaceId of the |
| `vaultMapKey` | `bytes32` | The `LSP10VaultMap:<vault>` data key of the vault being received containing the interfaceId of the                    |

#### Returns

| Name     |    Type     | Description                                                                                                         |
| -------- | :---------: | ------------------------------------------------------------------------------------------------------------------- |
| `keys`   | `bytes32[]` | An array of 3 x data keys: `LSP10Vaults[]`, `LSP10Vaults[index]` and `LSP10VaultMap:<asset>`.                       |
| `values` |  `bytes[]`  | An array of 3 x data values: the new length of `LSP10Vaults[]`, the address of the asset under `LSP10Vaults[index]` |

<br/>

### generateSentVaultKeys

```solidity
function generateSentVaultKeys(
  address sender,
  bytes32 vaultMapKey,
  uint128 vaultIndex
) internal view returns (bytes32[] keys, bytes[] values);
```

Generate an array of data key/value pairs to be set on the sender address after sending vaults.

#### Parameters

| Name          |   Type    | Description                                                                                    |
| ------------- | :-------: | ---------------------------------------------------------------------------------------------- |
| `sender`      | `address` | The address sending the vault and where the LSP10 data keys should be updated.                 |
| `vaultMapKey` | `bytes32` | The `LSP10VaultMap:<vault>` data key of the vault being sent containing the interfaceId of the |
| `vaultIndex`  | `uint128` | The index at which the vault address is stored under `LSP10Vaults[]` Array.                    |

#### Returns

| Name     |    Type     | Description                                                                                                         |
| -------- | :---------: | ------------------------------------------------------------------------------------------------------------------- |
| `keys`   | `bytes32[]` | An array of 3 x data keys: `LSP10Vaults[]`, `LSP10Vaults[index]` and `LSP10VaultsMap:<asset>`.                      |
| `values` |  `bytes[]`  | An array of 3 x data values: the new length of `LSP10Vaults[]`, the address of the asset under `LSP10Vaults[index]` |

<br/>

### getLSP10ReceivedVaultsCount

:::info

This function does not return a number but the raw bytes stored under the `LSP10Vaults[]` Array data key.

:::

```solidity
function getLSP10ReceivedVaultsCount(contract IERC725Y account) internal view returns (bytes);
```

Get the total number of vault addresses stored under the `LSP10Vaults[]` Array data key.

#### Parameters

| Name      |        Type         | Description                                          |
| --------- | :-----------------: | ---------------------------------------------------- |
| `account` | `contract IERC725Y` | The ERC725Y smart contract to read the storage from. |

#### Returns

| Name |  Type   | Description                                              |
| ---- | :-----: | -------------------------------------------------------- |
| `0`  | `bytes` | The raw bytes stored under the `LSP10Vaults[]` data key. |

<br/>

## Errors

### InvalidLSP10ReceivedVaultsArrayLength

:::note References

- Specification details: [**LSP-10-ReceivedVaults**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-10-ReceivedVaults.md#,))
- Solidity implementation: [`LSP10Utils.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP10ReceivedVaults/LSP10Utils.sol)
- Error signature: `,)`
- Error hash: `0x9f47dbd3`

:::

```solidity
InvalidLSP10ReceivedVaultsArrayLength(bytes,uint256);
```

Reverts when the value stored under the 'LSP10ReceivedVaults[]' Array data key is not valid.
The value stored under this data key should be exactly 16 bytes long.
Only possible valid values are:

- any valid uint128 values
  _e.g: `0x00000000000000000000000000000000` (zero), meaning empty array, no vaults received._
  _e.g: `0x00000000000000000000000000000005` (non-zero), meaning 5 array elements, 5 vaults received._

- `0x` (nothing stored under this data key, equivalent to empty array)

#### Parameters

| Name                 |   Type    | Description                                                                                                                     |
| -------------------- | :-------: | ------------------------------------------------------------------------------------------------------------------------------- |
| `invalidValueStored` |  `bytes`  | invalidValueLength The invalid number of bytes stored under the `LSP10ReceivedVaults[]` Array data key (MUST be 16 bytes long). |
| `invalidValueLength` | `uint256` | The invalid number of bytes stored under the `LSP10ReceivedVaults[]` Array data key (MUST be 16 bytes long).                    |

<br/>

### MaxLSP10VaultsCountReached

:::note References

- Specification details: [**LSP-10-ReceivedVaults**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-10-ReceivedVaults.md#))
- Solidity implementation: [`LSP10Utils.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP10ReceivedVaults/LSP10Utils.sol)
- Error signature: `)`
- Error hash: `0x59d76dc3`

:::

```solidity
MaxLSP10VaultsCountReached(address);
```

Reverts when the `LSP10Vaults[]` Array reaches its maximum limit (`max(uint128)`)

#### Parameters

| Name                 |   Type    | Description                                                |
| -------------------- | :-------: | ---------------------------------------------------------- |
| `notRegisteredVault` | `address` | The address of the LSP9Vault that could not be registered. |

<br/>

### VaultIndexSuperiorToUint128

:::note References

- Specification details: [**LSP-10-ReceivedVaults**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-10-ReceivedVaults.md#))
- Solidity implementation: [`LSP10Utils.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP10ReceivedVaults/LSP10Utils.sol)
- Error signature: `)`
- Error hash: `0x59d76dc3`

:::

```solidity
VaultIndexSuperiorToUint128(uint256);
```

Reverts when the vault index is superior to `max(uint128)`

#### Parameters

| Name    |   Type    | Description      |
| ------- | :-------: | ---------------- |
| `index` | `uint256` | The vault index. |

<br/>
