<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP23LinkedContractsFactory

:::info Standard Specifications

[`LSP-23-LinkedContractsFactory`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-23-LinkedContractsFactory.md)

:::
:::info Solidity implementation

[`LSP23LinkedContractsFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp23-contracts/contracts/LSP23LinkedContractsFactory.sol)

:::

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### computeAddresses

:::note References

- Specification details: [**LSP-23-LinkedContractsFactory**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-23-LinkedContractsFactory.md#computeaddresses)
- Solidity implementation: [`LSP23LinkedContractsFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp23-contracts/contracts/LSP23LinkedContractsFactory.sol)
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

Computes the addresses of a primary contract and a secondary linked contract

#### Parameters

| Name                           |                            Type                            | Description                                                                                                                                                  |
| ------------------------------ | :--------------------------------------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `primaryContractDeployment`    |  `ILSP23LinkedContractsFactory.PrimaryContractDeployment`  | Contains the needed parameter to deploy the primary contract. (`salt`, `fundingAmount`, `creationBytecode`)                                                  |
| `secondaryContractDeployment`  | `ILSP23LinkedContractsFactory.SecondaryContractDeployment` | Contains the needed parameter to deploy the secondary contract. (`fundingAmount`, `creationBytecode`, `addPrimaryContractAddress`, `extraConstructorParams`) |
| `postDeploymentModule`         |                         `address`                          | The optional module to be executed after deployment                                                                                                          |
| `postDeploymentModuleCalldata` |                          `bytes`                           | The data to be passed to the post deployment module                                                                                                          |

#### Returns

| Name                       |   Type    | Description                                     |
| -------------------------- | :-------: | ----------------------------------------------- |
| `primaryContractAddress`   | `address` | The address of the deployed primary contract.   |
| `secondaryContractAddress` | `address` | The address of the deployed secondary contract. |

<br/>

### computeERC1167Addresses

:::note References

- Specification details: [**LSP-23-LinkedContractsFactory**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-23-LinkedContractsFactory.md#computeerc1167addresses)
- Solidity implementation: [`LSP23LinkedContractsFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp23-contracts/contracts/LSP23LinkedContractsFactory.sol)
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

Computes the addresses of a primary and a secondary linked contracts ERC1167 proxies to be created

#### Parameters

| Name                              |                              Type                              | Description                                                                                                                                                                                            |
| --------------------------------- | :------------------------------------------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `primaryContractDeploymentInit`   |  `ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit`  | Contains the needed parameters to deploy a primary proxy contract. (`salt`, `fundingAmount`, `implementationContract`, `initializationCalldata`)                                                       |
| `secondaryContractDeploymentInit` | `ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit` | Contains the needed parameters to deploy the secondary proxy contract. (`fundingAmount`, `implementationContract`, `initializationCalldata`, `addPrimaryContractAddress`, `extraInitializationParams`) |
| `postDeploymentModule`            |                           `address`                            | The optional module to be executed after deployment.                                                                                                                                                   |
| `postDeploymentModuleCalldata`    |                            `bytes`                             | The data to be passed to the post deployment module.                                                                                                                                                   |

#### Returns

| Name                       |   Type    | Description                                          |
| -------------------------- | :-------: | ---------------------------------------------------- |
| `primaryContractAddress`   | `address` | The address of the deployed primary contract proxy   |
| `secondaryContractAddress` | `address` | The address of the deployed secondary contract proxy |

<br/>

### deployContracts

:::note References

- Specification details: [**LSP-23-LinkedContractsFactory**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-23-LinkedContractsFactory.md#deploycontracts)
- Solidity implementation: [`LSP23LinkedContractsFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp23-contracts/contracts/LSP23LinkedContractsFactory.sol)
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

_Contracts deployed. Contract Address: `primaryContractAddress`. Primary Contract Address: `primaryContractAddress`_

Deploys a primary and a secondary linked contract.

#### Parameters

| Name                           |                            Type                            | Description                                                                                                                                                  |
| ------------------------------ | :--------------------------------------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `primaryContractDeployment`    |  `ILSP23LinkedContractsFactory.PrimaryContractDeployment`  | Contains the needed parameter to deploy a contract. (`salt`, `fundingAmount`, `creationBytecode`)                                                            |
| `secondaryContractDeployment`  | `ILSP23LinkedContractsFactory.SecondaryContractDeployment` | Contains the needed parameter to deploy the secondary contract. (`fundingAmount`, `creationBytecode`, `addPrimaryContractAddress`, `extraConstructorParams`) |
| `postDeploymentModule`         |                         `address`                          | The optional module to be executed after deployment                                                                                                          |
| `postDeploymentModuleCalldata` |                          `bytes`                           | The data to be passed to the post deployment module                                                                                                          |

#### Returns

| Name                       |   Type    | Description                            |
| -------------------------- | :-------: | -------------------------------------- |
| `primaryContractAddress`   | `address` | The address of the primary contract.   |
| `secondaryContractAddress` | `address` | The address of the secondary contract. |

<br/>

### deployERC1167Proxies

:::note References

- Specification details: [**LSP-23-LinkedContractsFactory**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-23-LinkedContractsFactory.md#deployerc1167proxies)
- Solidity implementation: [`LSP23LinkedContractsFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp23-contracts/contracts/LSP23LinkedContractsFactory.sol)
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

_Contract proxies deployed. Primary Proxy Address: `primaryContractAddress`. Secondary Contract Proxy Address: `secondaryContractAddress`_

Deploys ERC1167 proxies of a primary contract and a secondary linked contract

#### Parameters

| Name                              |                              Type                              | Description                                                                                                                                                                                            |
| --------------------------------- | :------------------------------------------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `primaryContractDeploymentInit`   |  `ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit`  | Contains the needed parameters to deploy a proxy contract. (`salt`, `fundingAmount`, `implementationContract`, `initializationCalldata`)                                                               |
| `secondaryContractDeploymentInit` | `ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit` | Contains the needed parameters to deploy the secondary proxy contract. (`fundingAmount`, `implementationContract`, `initializationCalldata`, `addPrimaryContractAddress`, `extraInitializationParams`) |
| `postDeploymentModule`            |                           `address`                            | The optional module to be executed after deployment.                                                                                                                                                   |
| `postDeploymentModuleCalldata`    |                            `bytes`                             | The data to be passed to the post deployment module.                                                                                                                                                   |

#### Returns

| Name                       |   Type    | Description                                          |
| -------------------------- | :-------: | ---------------------------------------------------- |
| `primaryContractAddress`   | `address` | The address of the deployed primary contract proxy   |
| `secondaryContractAddress` | `address` | The address of the deployed secondary contract proxy |

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

- Specification details: [**LSP-23-LinkedContractsFactory**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-23-LinkedContractsFactory.md#deployedcontracts)
- Solidity implementation: [`LSP23LinkedContractsFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp23-contracts/contracts/LSP23LinkedContractsFactory.sol)
- Event signature: `DeployedContracts(address,address,ILSP23LinkedContractsFactory.PrimaryContractDeployment,ILSP23LinkedContractsFactory.SecondaryContractDeployment,address,bytes)`
- Event topic hash: `0x1ea27dabd8fd1508e844ab51c2fd3d9081f2684346857f9187da6d4a1aa7d3e6`

:::

```solidity
event DeployedContracts(
  address indexed primaryContract,
  address indexed secondaryContract,
  ILSP23LinkedContractsFactory.PrimaryContractDeployment primaryContractDeployment,
  ILSP23LinkedContractsFactory.SecondaryContractDeployment secondaryContractDeployment,
  address postDeploymentModule,
  bytes postDeploymentModuleCalldata
);
```

Emitted when a primary and secondary contract are deployed.

#### Parameters

| Name                              |                            Type                            | Description                                            |
| --------------------------------- | :--------------------------------------------------------: | ------------------------------------------------------ |
| `primaryContract` **`indexed`**   |                         `address`                          | Address of the deployed primary contract.              |
| `secondaryContract` **`indexed`** |                         `address`                          | Address of the deployed secondary contract.            |
| `primaryContractDeployment`       |  `ILSP23LinkedContractsFactory.PrimaryContractDeployment`  | Parameters used for the primary contract deployment.   |
| `secondaryContractDeployment`     | `ILSP23LinkedContractsFactory.SecondaryContractDeployment` | Parameters used for the secondary contract deployment. |
| `postDeploymentModule`            |                         `address`                          | Address of the post-deployment module.                 |
| `postDeploymentModuleCalldata`    |                          `bytes`                           | Calldata passed to the post-deployment module.         |

<br/>

### DeployedERC1167Proxies

:::note References

- Specification details: [**LSP-23-LinkedContractsFactory**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-23-LinkedContractsFactory.md#deployederc1167proxies)
- Solidity implementation: [`LSP23LinkedContractsFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp23-contracts/contracts/LSP23LinkedContractsFactory.sol)
- Event signature: `DeployedERC1167Proxies(address,address,ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit,ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit,address,bytes)`
- Event topic hash: `0xb03dbe7a02c063899f863d542410b5b038c8f537045be3a26e7144e0074e1c7b`

:::

```solidity
event DeployedERC1167Proxies(
  address indexed primaryContract,
  address indexed secondaryContract,
  ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit primaryContractDeploymentInit,
  ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit secondaryContractDeploymentInit,
  address postDeploymentModule,
  bytes postDeploymentModuleCalldata
);
```

Emitted when proxies of a primary and secondary contract are deployed.

#### Parameters

| Name                              |                              Type                              | Description                                                  |
| --------------------------------- | :------------------------------------------------------------: | ------------------------------------------------------------ |
| `primaryContract` **`indexed`**   |                           `address`                            | Address of the deployed primary contract proxy.              |
| `secondaryContract` **`indexed`** |                           `address`                            | Address of the deployed secondary contract proxy.            |
| `primaryContractDeploymentInit`   |  `ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit`  | Parameters used for the primary contract proxy deployment.   |
| `secondaryContractDeploymentInit` | `ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit` | Parameters used for the secondary contract proxy deployment. |
| `postDeploymentModule`            |                           `address`                            | Address of the post-deployment module.                       |
| `postDeploymentModuleCalldata`    |                            `bytes`                             | Calldata passed to the post-deployment module.               |

<br/>

## Errors

### InvalidValueSum

:::note References

- Specification details: [**LSP-23-LinkedContractsFactory**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-23-LinkedContractsFactory.md#invalidvaluesum)
- Solidity implementation: [`LSP23LinkedContractsFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp23-contracts/contracts/LSP23LinkedContractsFactory.sol)
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

- Specification details: [**LSP-23-LinkedContractsFactory**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-23-LinkedContractsFactory.md#primarycontractproxyinitfailureerror)
- Solidity implementation: [`LSP23LinkedContractsFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp23-contracts/contracts/LSP23LinkedContractsFactory.sol)
- Error signature: `PrimaryContractProxyInitFailureError(bytes)`
- Error hash: `0x4364b6ee`

:::

```solidity
error PrimaryContractProxyInitFailureError(bytes errorData);
```

_Failed to deploy & initialize the Primary Contract Proxy. Error: `errorData`._

Reverts when the deployment & initialization of the contract has failed.

#### Parameters

| Name        |  Type   | Description                                                                    |
| ----------- | :-----: | ------------------------------------------------------------------------------ |
| `errorData` | `bytes` | Potentially information about why the deployment & initialization have failed. |

<br/>

### SecondaryContractProxyInitFailureError

:::note References

- Specification details: [**LSP-23-LinkedContractsFactory**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-23-LinkedContractsFactory.md#secondarycontractproxyinitfailureerror)
- Solidity implementation: [`LSP23LinkedContractsFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp23-contracts/contracts/LSP23LinkedContractsFactory.sol)
- Error signature: `SecondaryContractProxyInitFailureError(bytes)`
- Error hash: `0x9654a854`

:::

```solidity
error SecondaryContractProxyInitFailureError(bytes errorData);
```

_Failed to deploy & initialize the Secondary Contract Proxy. Error: `errorData`._

Reverts when the deployment & initialization of the secondary contract has failed.

#### Parameters

| Name        |  Type   | Description                                                                    |
| ----------- | :-----: | ------------------------------------------------------------------------------ |
| `errorData` | `bytes` | Potentially information about why the deployment & initialization have failed. |

<br/>
