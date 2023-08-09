<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP0Utils

:::info Standard Specifications

[`LSP-0-ERC725Account`](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-0-ERC725Account.md)

:::
:::info Solidity implementation

[`LSP0Utils.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP0ERC725Account/LSP0Utils.sol)

:::

> Utility functions to query the storage of an LSP0ERC725Account.

## Internal Methods

Any method labeled as `internal` serves as utility function within the contract. They can be used when writing solidity contracts that inherit from this contract. These methods can be extended or modified by overriding their internal behavior to suit specific needs.

Internal functions cannot be called externally, whether from other smart contracts, dApp interfaces, or backend services. Their restricted accessibility ensures that they remain exclusively available within the context of the current contract, promoting controlled and encapsulated usage of these internal utilities.

### getLSP1DelegateValue

```solidity
function getLSP1DelegateValue(
  mapping(bytes32 => bytes) erc725YStorage
) internal view returns (bytes);
```

Query internally the ERC725Y storage of a `ERC725Y` smart contract to retrieve
the value set under the `LSP1UniversalReceiverDelegate` data key.

#### Parameters

| Name             |            Type             | Description                                                 |
| ---------------- | :-------------------------: | ----------------------------------------------------------- |
| `erc725YStorage` | `mapping(bytes32 => bytes)` | A reference to the ERC725Y storage mapping of the contract. |

#### Returns

| Name |  Type   | Description                                                                |
| ---- | :-----: | -------------------------------------------------------------------------- |
| `0`  | `bytes` | The bytes value stored under the `LSP1UniversalReceiverDelegate` data key. |

<br/>

### getLSP1DelegateValueForTypeId

```solidity
function getLSP1DelegateValueForTypeId(
  mapping(bytes32 => bytes) erc725YStorage,
  bytes32 typeId
) internal view returns (bytes);
```

Query internally the ERC725Y storage of a `ERC725Y` smart contract to retrieve
the value set under the `LSP1UniversalReceiverDelegate:<bytes32>` data key for a specific LSP1 `typeId`.

#### Parameters

| Name             |            Type             | Description                                                 |
| ---------------- | :-------------------------: | ----------------------------------------------------------- |
| `erc725YStorage` | `mapping(bytes32 => bytes)` | A reference to the ERC725Y storage mapping of the contract. |
| `typeId`         |          `bytes32`          | A bytes32 LSP1 `typeId`;                                    |

#### Returns

| Name |  Type   | Description                                                                          |
| ---- | :-----: | ------------------------------------------------------------------------------------ |
| `0`  | `bytes` | The bytes value stored under the `LSP1UniversalReceiverDelegate:<bytes32>` data key. |

<br/>
