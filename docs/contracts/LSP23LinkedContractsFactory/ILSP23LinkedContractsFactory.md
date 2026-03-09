<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# ILSP23LinkedContractsFactory

:::info Standard Specifications

[`LSP-23-LinkedContractsFactory`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-23-LinkedContractsFactory.md)

:::
:::info Solidity implementation

[`ILSP23LinkedContractsFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp23-contracts/contracts/ILSP23LinkedContractsFactory.sol)

:::

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### computeAddresses

:::note References

- Specification details: [**LSP-23-LinkedContractsFactory**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-23-LinkedContractsFactory.md#computeaddresses)
- Solidity implementation: [`ILSP23LinkedContractsFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp23-contracts/contracts/ILSP23LinkedContractsFactory.sol)
- Function signature: `computeAddresses(ILSP23LinkedContractsFactory.PrimaryContractDeployment,ILSP23LinkedContractsFactory.SecondaryContractDeployment,address,bytes)`
- Function selector: `0xdd5940f3`

:::

```solidity
function computeAddresses(
  struct ILSP23LinkedContractsFactory.PrimaryContractDeployment primaryContractDeployment,
  struct ILSP23LinkedContractsFactory.SecondaryContractDeployment secondaryContractDeployment,
  address postDeploymentModule,
  bytes postDeploymentModuleCalldata
)
  external view
  returns (address primaryContractAddress, address secondaryContractAddress);
```

Computes the addresses of a primary contract and a secondary linked contract

#### Parameters

| Name                           |                               Type                                | Description                                                                                                                                                  |
| ------------------------------ | :---------------------------------------------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `primaryContractDeployment`    |  `struct ILSP23LinkedContractsFactory.PrimaryContractDeployment`  | Contains the needed parameter to deploy the primary contract. (`salt`, `fundingAmount`, `creationBytecode`)                                                  |
| `secondaryContractDeployment`  | `struct ILSP23LinkedContractsFactory.SecondaryContractDeployment` | Contains the needed parameter to deploy the secondary contract. (`fundingAmount`, `creationBytecode`, `addPrimaryContractAddress`, `extraConstructorParams`) |
| `postDeploymentModule`         |                             `address`                             | The optional module to be executed after deployment                                                                                                          |
| `postDeploymentModuleCalldata` |                              `bytes`                              | The data to be passed to the post deployment module                                                                                                          |

#### Returns

| Name                       |   Type    | Description                                     |
| -------------------------- | :-------: | ----------------------------------------------- |
| `primaryContractAddress`   | `address` | The address of the deployed primary contract.   |
| `secondaryContractAddress` | `address` | The address of the deployed secondary contract. |

<br/>

### computeERC1167Addresses

:::note References

- Specification details: [**LSP-23-LinkedContractsFactory**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-23-LinkedContractsFactory.md#computeerc1167addresses)
- Solidity implementation: [`ILSP23LinkedContractsFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp23-contracts/contracts/ILSP23LinkedContractsFactory.sol)
- Function signature: `computeERC1167Addresses(ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit,ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit,address,bytes)`
- Function selector: `0x72b19d36`

:::

```solidity
function computeERC1167Addresses(
  struct ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit primaryContractDeploymentInit,
  struct ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit secondaryContractDeploymentInit,
  address postDeploymentModule,
  bytes postDeploymentModuleCalldata
)
  external view
  returns (address primaryContractAddress, address secondaryContractAddress);
```

Computes the addresses of a primary and a secondary linked contracts ERC1167 proxies to be created

#### Parameters

| Name                              |                                 Type                                  | Description                                                                                                                                                                                            |
| --------------------------------- | :-------------------------------------------------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `primaryContractDeploymentInit`   |  `struct ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit`  | Contains the needed parameters to deploy a primary proxy contract. (`salt`, `fundingAmount`, `implementationContract`, `initializationCalldata`)                                                       |
| `secondaryContractDeploymentInit` | `struct ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit` | Contains the needed parameters to deploy the secondary proxy contract. (`fundingAmount`, `implementationContract`, `initializationCalldata`, `addPrimaryContractAddress`, `extraInitializationParams`) |
| `postDeploymentModule`            |                               `address`                               | The optional module to be executed after deployment.                                                                                                                                                   |
| `postDeploymentModuleCalldata`    |                                `bytes`                                | The data to be passed to the post deployment module.                                                                                                                                                   |

#### Returns

| Name                       |   Type    | Description                                          |
| -------------------------- | :-------: | ---------------------------------------------------- |
| `primaryContractAddress`   | `address` | The address of the deployed primary contract proxy   |
| `secondaryContractAddress` | `address` | The address of the deployed secondary contract proxy |

<br/>

### deployContracts

:::note References

- Specification details: [**LSP-23-LinkedContractsFactory**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-23-LinkedContractsFactory.md#deploycontracts)
- Solidity implementation: [`ILSP23LinkedContractsFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp23-contracts/contracts/ILSP23LinkedContractsFactory.sol)
- Function signature: `deployContracts(ILSP23LinkedContractsFactory.PrimaryContractDeployment,ILSP23LinkedContractsFactory.SecondaryContractDeployment,address,bytes)`
- Function selector: `0x754b86b5`

:::

```solidity
function deployContracts(
  struct ILSP23LinkedContractsFactory.PrimaryContractDeployment primaryContractDeployment,
  struct ILSP23LinkedContractsFactory.SecondaryContractDeployment secondaryContractDeployment,
  address postDeploymentModule,
  bytes postDeploymentModuleCalldata
)
  external payable
  returns (address primaryContractAddress, address secondaryContractAddress);
```

_Contracts deployed. Contract Address: `primaryContractAddress`. Primary Contract Address: `primaryContractAddress`_

Deploys a primary and a secondary linked contract.

#### Parameters

| Name                           |                               Type                                | Description                                                                                                                                                  |
| ------------------------------ | :---------------------------------------------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `primaryContractDeployment`    |  `struct ILSP23LinkedContractsFactory.PrimaryContractDeployment`  | Contains the needed parameter to deploy a contract. (`salt`, `fundingAmount`, `creationBytecode`)                                                            |
| `secondaryContractDeployment`  | `struct ILSP23LinkedContractsFactory.SecondaryContractDeployment` | Contains the needed parameter to deploy the secondary contract. (`fundingAmount`, `creationBytecode`, `addPrimaryContractAddress`, `extraConstructorParams`) |
| `postDeploymentModule`         |                             `address`                             | The optional module to be executed after deployment                                                                                                          |
| `postDeploymentModuleCalldata` |                              `bytes`                              | The data to be passed to the post deployment module                                                                                                          |

#### Returns

| Name                       |   Type    | Description                            |
| -------------------------- | :-------: | -------------------------------------- |
| `primaryContractAddress`   | `address` | The address of the primary contract.   |
| `secondaryContractAddress` | `address` | The address of the secondary contract. |

<br/>

### deployERC1167Proxies

:::note References

- Specification details: [**LSP-23-LinkedContractsFactory**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-23-LinkedContractsFactory.md#deployerc1167proxies)
- Solidity implementation: [`ILSP23LinkedContractsFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp23-contracts/contracts/ILSP23LinkedContractsFactory.sol)
- Function signature: `deployERC1167Proxies(ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit,ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit,address,bytes)`
- Function selector: `0x6a66a753`

:::

```solidity
function deployERC1167Proxies(
  struct ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit primaryContractDeploymentInit,
  struct ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit secondaryContractDeploymentInit,
  address postDeploymentModule,
  bytes postDeploymentModuleCalldata
)
  external payable
  returns (address primaryContractAddress, address secondaryContractAddress);
```

_Contract proxies deployed. Primary Proxy Address: `primaryContractAddress`. Secondary Contract Proxy Address: `secondaryContractAddress`_

Deploys ERC1167 proxies of a primary contract and a secondary linked contract

#### Parameters

| Name                              |                                 Type                                  | Description                                                                                                                                                                                            |
| --------------------------------- | :-------------------------------------------------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `primaryContractDeploymentInit`   |  `struct ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit`  | Contains the needed parameters to deploy a proxy contract. (`salt`, `fundingAmount`, `implementationContract`, `initializationCalldata`)                                                               |
| `secondaryContractDeploymentInit` | `struct ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit` | Contains the needed parameters to deploy the secondary proxy contract. (`fundingAmount`, `implementationContract`, `initializationCalldata`, `addPrimaryContractAddress`, `extraInitializationParams`) |
| `postDeploymentModule`            |                               `address`                               | The optional module to be executed after deployment.                                                                                                                                                   |
| `postDeploymentModuleCalldata`    |                                `bytes`                                | The data to be passed to the post deployment module.                                                                                                                                                   |

#### Returns

| Name                       |   Type    | Description                                          |
| -------------------------- | :-------: | ---------------------------------------------------- |
| `primaryContractAddress`   | `address` | The address of the deployed primary contract proxy   |
| `secondaryContractAddress` | `address` | The address of the deployed secondary contract proxy |

<br/>

## Events

### DeployedContracts

:::note References

- Specification details: [**LSP-23-LinkedContractsFactory**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-23-LinkedContractsFactory.md#deployedcontracts)
- Solidity implementation: [`ILSP23LinkedContractsFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp23-contracts/contracts/ILSP23LinkedContractsFactory.sol)
- Event signature: `DeployedContracts(address,address,ILSP23LinkedContractsFactory.PrimaryContractDeployment,ILSP23LinkedContractsFactory.SecondaryContractDeployment,address,bytes)`
- Event topic hash: `0x0e20ea3d6273aab49a7dabafc15cc94971c12dd63a07185ca810e497e4e87aa6`

:::

```solidity
event DeployedContracts(
  address indexed primaryContract,
  address indexed secondaryContract,
  struct ILSP23LinkedContractsFactory.PrimaryContractDeployment primaryContractDeployment,
  struct ILSP23LinkedContractsFactory.SecondaryContractDeployment secondaryContractDeployment,
  address postDeploymentModule,
  bytes postDeploymentModuleCalldata
);
```

Emitted when a primary and secondary contract are deployed.

#### Parameters

| Name                              |                               Type                                | Description                                            |
| --------------------------------- | :---------------------------------------------------------------: | ------------------------------------------------------ |
| `primaryContract` **`indexed`**   |                             `address`                             | Address of the deployed primary contract.              |
| `secondaryContract` **`indexed`** |                             `address`                             | Address of the deployed secondary contract.            |
| `primaryContractDeployment`       |  `struct ILSP23LinkedContractsFactory.PrimaryContractDeployment`  | Parameters used for the primary contract deployment.   |
| `secondaryContractDeployment`     | `struct ILSP23LinkedContractsFactory.SecondaryContractDeployment` | Parameters used for the secondary contract deployment. |
| `postDeploymentModule`            |                             `address`                             | Address of the post-deployment module.                 |
| `postDeploymentModuleCalldata`    |                              `bytes`                              | Calldata passed to the post-deployment module.         |

<br/>

### DeployedERC1167Proxies

:::note References

- Specification details: [**LSP-23-LinkedContractsFactory**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-23-LinkedContractsFactory.md#deployederc1167proxies)
- Solidity implementation: [`ILSP23LinkedContractsFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp23-contracts/contracts/ILSP23LinkedContractsFactory.sol)
- Event signature: `DeployedERC1167Proxies(address,address,ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit,ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit,address,bytes)`
- Event topic hash: `0xe20570ed9bda3b93eea277b4e5d975c8933fd5f85f2c824d0845ae96c55a54fe`

:::

```solidity
event DeployedERC1167Proxies(
  address indexed primaryContract,
  address indexed secondaryContract,
  struct ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit primaryContractDeploymentInit,
  struct ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit secondaryContractDeploymentInit,
  address postDeploymentModule,
  bytes postDeploymentModuleCalldata
);
```

Emitted when proxies of a primary and secondary contract are deployed.

#### Parameters

| Name                              |                                 Type                                  | Description                                                  |
| --------------------------------- | :-------------------------------------------------------------------: | ------------------------------------------------------------ |
| `primaryContract` **`indexed`**   |                               `address`                               | Address of the deployed primary contract proxy.              |
| `secondaryContract` **`indexed`** |                               `address`                               | Address of the deployed secondary contract proxy.            |
| `primaryContractDeploymentInit`   |  `struct ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit`  | Parameters used for the primary contract proxy deployment.   |
| `secondaryContractDeploymentInit` | `struct ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit` | Parameters used for the secondary contract proxy deployment. |
| `postDeploymentModule`            |                               `address`                               | Address of the post-deployment module.                       |
| `postDeploymentModuleCalldata`    |                                `bytes`                                | Calldata passed to the post-deployment module.               |

<br/>
