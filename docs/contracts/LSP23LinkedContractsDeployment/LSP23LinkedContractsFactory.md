<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP23LinkedContractsFactory

:::info Standard Specifications

[`LSP-23-LinkedContractsDeployment`](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-23-LinkedContractsDeployment.md)

:::
:::info Solidity implementation

[`LSP23LinkedContractsFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP23LinkedContractsDeployment/LSP23LinkedContractsFactory.sol)

:::

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### computeAddresses

:::note References

- Specification details: [**LSP-23-LinkedContractsDeployment**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-23-LinkedContractsDeployment.md#computeaddresses)
- Solidity implementation: [`LSP23LinkedContractsFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP23LinkedContractsDeployment/LSP23LinkedContractsFactory.sol)
- Function signature: `computeAddresses(ILSP23LinkedContractsFactory.PrimaryContractDeployment,ILSP23LinkedContractsFactory.SecondaryContractDeployment,address,bytes)`
- Function selector: `0xdecfb0b9`

:::

```solidity
function computeAddresses(
  ILSP23LinkedContractsFactory.PrimaryContractDeployment primaryContractDeployment,
  ILSP23LinkedContractsFactory.SecondaryContractDeployment secondaryContractDeployment,
  address postDeploymentModule,
  bytes postDeploymentModuleCalldata
)
  external
  view
  returns (address primaryContractAddress, address secondaryContractAddress);
```

#### Parameters

| Name                           |                            Type                            | Description |
| ------------------------------ | :--------------------------------------------------------: | ----------- |
| `primaryContractDeployment`    |  `ILSP23LinkedContractsFactory.PrimaryContractDeployment`  | -           |
| `secondaryContractDeployment`  | `ILSP23LinkedContractsFactory.SecondaryContractDeployment` | -           |
| `postDeploymentModule`         |                         `address`                          | -           |
| `postDeploymentModuleCalldata` |                          `bytes`                           | -           |

#### Returns

| Name                       |   Type    | Description |
| -------------------------- | :-------: | ----------- |
| `primaryContractAddress`   | `address` | -           |
| `secondaryContractAddress` | `address` | -           |

<br/>

### computeERC1167Addresses

:::note References

- Specification details: [**LSP-23-LinkedContractsDeployment**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-23-LinkedContractsDeployment.md#computeerc1167addresses)
- Solidity implementation: [`LSP23LinkedContractsFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP23LinkedContractsDeployment/LSP23LinkedContractsFactory.sol)
- Function signature: `computeERC1167Addresses(ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit,ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit,address,bytes)`
- Function selector: `0x8da85898`

:::

```solidity
function computeERC1167Addresses(
  ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit primaryContractDeploymentInit,
  ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit secondaryContractDeploymentInit,
  address postDeploymentModule,
  bytes postDeploymentModuleCalldata
)
  external
  view
  returns (address primaryContractAddress, address secondaryContractAddress);
```

#### Parameters

| Name                              |                              Type                              | Description |
| --------------------------------- | :------------------------------------------------------------: | ----------- |
| `primaryContractDeploymentInit`   |  `ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit`  | -           |
| `secondaryContractDeploymentInit` | `ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit` | -           |
| `postDeploymentModule`            |                           `address`                            | -           |
| `postDeploymentModuleCalldata`    |                            `bytes`                             | -           |

#### Returns

| Name                       |   Type    | Description |
| -------------------------- | :-------: | ----------- |
| `primaryContractAddress`   | `address` | -           |
| `secondaryContractAddress` | `address` | -           |

<br/>

### deployContracts

:::note References

- Specification details: [**LSP-23-LinkedContractsDeployment**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-23-LinkedContractsDeployment.md#deploycontracts)
- Solidity implementation: [`LSP23LinkedContractsFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP23LinkedContractsDeployment/LSP23LinkedContractsFactory.sol)
- Function signature: `deployContracts(ILSP23LinkedContractsFactory.PrimaryContractDeployment,ILSP23LinkedContractsFactory.SecondaryContractDeployment,address,bytes)`
- Function selector: `0xf830c0ab`

:::

```solidity
function deployContracts(
  ILSP23LinkedContractsFactory.PrimaryContractDeployment primaryContractDeployment,
  ILSP23LinkedContractsFactory.SecondaryContractDeployment secondaryContractDeployment,
  address postDeploymentModule,
  bytes postDeploymentModuleCalldata
)
  external
  payable
  returns (address primaryContractAddress, address secondaryContractAddress);
```

#### Parameters

| Name                           |                            Type                            | Description |
| ------------------------------ | :--------------------------------------------------------: | ----------- |
| `primaryContractDeployment`    |  `ILSP23LinkedContractsFactory.PrimaryContractDeployment`  | -           |
| `secondaryContractDeployment`  | `ILSP23LinkedContractsFactory.SecondaryContractDeployment` | -           |
| `postDeploymentModule`         |                         `address`                          | -           |
| `postDeploymentModuleCalldata` |                          `bytes`                           | -           |

#### Returns

| Name                       |   Type    | Description |
| -------------------------- | :-------: | ----------- |
| `primaryContractAddress`   | `address` | -           |
| `secondaryContractAddress` | `address` | -           |

<br/>

### deployERC1167Proxies

:::note References

- Specification details: [**LSP-23-LinkedContractsDeployment**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-23-LinkedContractsDeployment.md#deployerc1167proxies)
- Solidity implementation: [`LSP23LinkedContractsFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP23LinkedContractsDeployment/LSP23LinkedContractsFactory.sol)
- Function signature: `deployERC1167Proxies(ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit,ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit,address,bytes)`
- Function selector: `0x17c042c4`

:::

```solidity
function deployERC1167Proxies(
  ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit primaryContractDeploymentInit,
  ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit secondaryContractDeploymentInit,
  address postDeploymentModule,
  bytes postDeploymentModuleCalldata
)
  external
  payable
  returns (address primaryContractAddress, address secondaryContractAddress);
```

#### Parameters

| Name                              |                              Type                              | Description |
| --------------------------------- | :------------------------------------------------------------: | ----------- |
| `primaryContractDeploymentInit`   |  `ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit`  | -           |
| `secondaryContractDeploymentInit` | `ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit` | -           |
| `postDeploymentModule`            |                           `address`                            | -           |
| `postDeploymentModuleCalldata`    |                            `bytes`                             | -           |

#### Returns

| Name                       |   Type    | Description |
| -------------------------- | :-------: | ----------- |
| `primaryContractAddress`   | `address` | -           |
| `secondaryContractAddress` | `address` | -           |

<br/>

## Internal Methods

Any method labeled as `internal` serves as utility function within the contract. They can be used when writing solidity contracts that inherit from this contract. These methods can be extended or modified by overriding their internal behavior to suit specific needs.

Internal functions cannot be called externally, whether from other smart contracts, dApp interfaces, or backend services. Their restricted accessibility ensures that they remain exclusively available within the context of the current contract, promoting controlled and encapsulated usage of these internal utilities.

### \_deployPrimaryContract

```solidity
function _deployPrimaryContract(struct ILSP23LinkedContractsFactory.PrimaryContractDeployment primaryContractDeployment, struct ILSP23LinkedContractsFactory.SecondaryContractDeployment secondaryContractDeployment, address postDeploymentModule, bytes postDeploymentModuleCalldata) internal nonpayable returns (address primaryContractAddress);
```

<br/>

### \_deploySecondaryContract

```solidity
function _deploySecondaryContract(struct ILSP23LinkedContractsFactory.SecondaryContractDeployment secondaryContractDeployment, address primaryContractAddress) internal nonpayable returns (address secondaryContractAddress);
```

<br/>

### \_deployAndInitializePrimaryContractProxy

```solidity
function _deployAndInitializePrimaryContractProxy(struct ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit primaryContractDeploymentInit, struct ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit secondaryContractDeploymentInit, address postDeploymentModule, bytes postDeploymentModuleCalldata) internal nonpayable returns (address primaryContractAddress);
```

<br/>

### \_deployAndInitializeSecondaryContractProxy

```solidity
function _deployAndInitializeSecondaryContractProxy(struct ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit secondaryContractDeploymentInit, address primaryContractAddress) internal nonpayable returns (address secondaryContractAddress);
```

<br/>

### \_generatePrimaryContractSalt

```solidity
function _generatePrimaryContractSalt(struct ILSP23LinkedContractsFactory.PrimaryContractDeployment primaryContractDeployment, struct ILSP23LinkedContractsFactory.SecondaryContractDeployment secondaryContractDeployment, address postDeploymentModule, bytes postDeploymentModuleCalldata) internal pure returns (bytes32 primaryContractGeneratedSalt);
```

<br/>

### \_generatePrimaryContractProxySalt

```solidity
function _generatePrimaryContractProxySalt(struct ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit primaryContractDeploymentInit, struct ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit secondaryContractDeploymentInit, address postDeploymentModule, bytes postDeploymentModuleCalldata) internal pure returns (bytes32 primaryContractProxyGeneratedSalt);
```

<br/>

## Events

### DeployedContracts

:::note References

- Specification details: [**LSP-23-LinkedContractsDeployment**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-23-LinkedContractsDeployment.md#deployedcontracts)
- Solidity implementation: [`LSP23LinkedContractsFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP23LinkedContractsDeployment/LSP23LinkedContractsFactory.sol)
- Event signature: `DeployedContracts(address,address,ILSP23LinkedContractsFactory.PrimaryContractDeployment,ILSP23LinkedContractsFactory.SecondaryContractDeployment,address,bytes)`
- Event topic hash: `0x1ea27dabd8fd1508e844ab51c2fd3d9081f2684346857f9187da6d4a1aa7d3e6`

:::

```solidity
event DeployedContracts(address indexed primaryContract, address indexed secondaryContract, ILSP23LinkedContractsFactory.PrimaryContractDeployment primaryContractDeployment, ILSP23LinkedContractsFactory.SecondaryContractDeployment secondaryContractDeployment, address postDeploymentModule, bytes postDeploymentModuleCalldata);
```

#### Parameters

| Name                              |                            Type                            | Description |
| --------------------------------- | :--------------------------------------------------------: | ----------- |
| `primaryContract` **`indexed`**   |                         `address`                          | -           |
| `secondaryContract` **`indexed`** |                         `address`                          | -           |
| `primaryContractDeployment`       |  `ILSP23LinkedContractsFactory.PrimaryContractDeployment`  | -           |
| `secondaryContractDeployment`     | `ILSP23LinkedContractsFactory.SecondaryContractDeployment` | -           |
| `postDeploymentModule`            |                         `address`                          | -           |
| `postDeploymentModuleCalldata`    |                          `bytes`                           | -           |

<br/>

### DeployedERC1167Proxies

:::note References

- Specification details: [**LSP-23-LinkedContractsDeployment**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-23-LinkedContractsDeployment.md#deployederc1167proxies)
- Solidity implementation: [`LSP23LinkedContractsFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP23LinkedContractsDeployment/LSP23LinkedContractsFactory.sol)
- Event signature: `DeployedERC1167Proxies(address,address,ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit,ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit,address,bytes)`
- Event topic hash: `0xb03dbe7a02c063899f863d542410b5b038c8f537045be3a26e7144e0074e1c7b`

:::

```solidity
event DeployedERC1167Proxies(address indexed primaryContract, address indexed secondaryContract, ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit primaryContractDeploymentInit, ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit secondaryContractDeploymentInit, address postDeploymentModule, bytes postDeploymentModuleCalldata);
```

#### Parameters

| Name                              |                              Type                              | Description |
| --------------------------------- | :------------------------------------------------------------: | ----------- |
| `primaryContract` **`indexed`**   |                           `address`                            | -           |
| `secondaryContract` **`indexed`** |                           `address`                            | -           |
| `primaryContractDeploymentInit`   |  `ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit`  | -           |
| `secondaryContractDeploymentInit` | `ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit` | -           |
| `postDeploymentModule`            |                           `address`                            | -           |
| `postDeploymentModuleCalldata`    |                            `bytes`                             | -           |

<br/>

## Errors

### InvalidValueSum

:::note References

- Specification details: [**LSP-23-LinkedContractsDeployment**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-23-LinkedContractsDeployment.md#invalidvaluesum)
- Solidity implementation: [`LSP23LinkedContractsFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP23LinkedContractsDeployment/LSP23LinkedContractsFactory.sol)
- Error signature: `InvalidValueSum()`
- Error hash: `0x2fd9ca91`

:::

```solidity
error InvalidValueSum();
```

_Invalid value sent._

Reverts when the `msg.value` sent is not equal to the sum of value used for the deployment of the contract & its owner contract.

<br/>

### PrimaryContractProxyInitFailureError

:::note References

- Specification details: [**LSP-23-LinkedContractsDeployment**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-23-LinkedContractsDeployment.md#primarycontractproxyinitfailureerror)
- Solidity implementation: [`LSP23LinkedContractsFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP23LinkedContractsDeployment/LSP23LinkedContractsFactory.sol)
- Error signature: `PrimaryContractProxyInitFailureError(bytes)`
- Error hash: `0x4364b6ee`

:::

```solidity
error PrimaryContractProxyInitFailureError(bytes errorData);
```

_Failed to deploy & initialise the Primary Contract Proxy. Error: `errorData`._

Reverts when the deployment & intialisation of the contract has failed.

#### Parameters

| Name        |  Type   | Description                                                                   |
| ----------- | :-----: | ----------------------------------------------------------------------------- |
| `errorData` | `bytes` | Potentially information about why the deployment & intialisation have failed. |

<br/>

### SecondaryContractProxyInitFailureError

:::note References

- Specification details: [**LSP-23-LinkedContractsDeployment**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-23-LinkedContractsDeployment.md#secondarycontractproxyinitfailureerror)
- Solidity implementation: [`LSP23LinkedContractsFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP23LinkedContractsDeployment/LSP23LinkedContractsFactory.sol)
- Error signature: `SecondaryContractProxyInitFailureError(bytes)`
- Error hash: `0x9654a854`

:::

```solidity
error SecondaryContractProxyInitFailureError(bytes errorData);
```

_Failed to deploy & initialise the Secondary Contract Proxy. Error: `errorData`._

Reverts when the deployment & intialisation of the secondary contract has failed.

#### Parameters

| Name        |  Type   | Description                                                                   |
| ----------- | :-----: | ----------------------------------------------------------------------------- |
| `errorData` | `bytes` | Potentially information about why the deployment & intialisation have failed. |

<br/>
