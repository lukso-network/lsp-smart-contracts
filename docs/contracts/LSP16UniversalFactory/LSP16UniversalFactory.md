# LSP16UniversalFactory

:::info Soldity contract

[`LSP16UniversalFactory.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP16UniversalFactory/LSP16UniversalFactory.sol)

:::

> LSP16 Universal Factory

Factory contract to deploy different types of contracts using the CREATE2 opcode standardized as LSP16

- UniversalFactory: https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-16-UniversalFactory.md The UniversalFactory will be deployed using Nick's Factory (0x4e59b44847b379578588920ca78fbf26c0b4956c) The deployed address can be found in the LSP16 specification. Please refer to the LSP16 Specification to obtain the exact bytecode and salt that should be used to produce the address of the UniversalFactory on different chains. This factory contract is designed to deploy contracts at the same address on multiple chains. The UniversalFactory can deploy 2 types of contracts:

- non-initializable (normal deployment)

- initializable (external call after deployment, e.g: proxy contracts) The `providedSalt` parameter given by the deployer is not used directly as the salt by the CREATE2 opcode. Instead, it is used along with these parameters:

- `initializable` boolean

- `initializeCalldata` (when the contract is initializable and `initializable` is set to `true`). These three parameters are concatenated together and hashed to generate the final salt for CREATE2. See [`generateSalt`](#generatesalt) function for more details. The constructor and `initializeCalldata` SHOULD NOT include any network-specific parameters (e.g: chain-id, a local token contract address), otherwise the deployed contract will not be recreated at the same address across different networks, thus defeating the purpose of the UniversalFactory. One way to solve this problem is to set an EOA owner in the `initializeCalldata`/constructor that can later call functions that set these parameters as variables in the contract. The UniversalFactory must be deployed at the same address on different chains to successfully deploy contracts at the same address across different chains.

## Methods

### computeAddress

:::note Links

- Specification details in [**LSP-16-UniversalFactory**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-16-UniversalFactory.md#computeaddress)
- Solidity implementation in [**LSP16UniversalFactory**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP16UniversalFactory/LSP16UniversalFactory.sol)
- Function signature: `computeAddress(bytes32,bytes32,bool,bytes)`
- Function selector: `0x3b315680`

:::

```solidity
function computeAddress(
  bytes32 byteCodeHash,
  bytes32 providedSalt,
  bool initializable,
  bytes initializeCalldata
) external view returns (address);
```

Computes the address of a contract to be deployed using CREATE2, based on the input parameters. Any change in one of these parameters will result in a different address. When the `initializable` boolean is set to `false`, `initializeCalldata` will not affect the function output.

#### Parameters

| Name                 |   Type    | Description                                                                                                                                        |
| -------------------- | :-------: | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `byteCodeHash`       | `bytes32` | The keccak256 hash of the bytecode to be deployed                                                                                                  |
| `providedSalt`       | `bytes32` | The salt provided by the deployer, which will be used to generate the final salt that will be used by the `CREATE2` opcode for contract deployment |
| `initializable`      |  `bool`   | A boolean that indicates whether an external call should be made to initialize the contract after deployment                                       |
| `initializeCalldata` |  `bytes`  | The calldata to be executed on the created contract if `initializable` is set to `true`                                                            |

#### Returns

| Name |   Type    | Description                                     |
| ---- | :-------: | ----------------------------------------------- |
| `0`  | `address` | The address where the contract will be deployed |

### computeERC1167Address

:::note Links

- Specification details in [**LSP-16-UniversalFactory**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-16-UniversalFactory.md#computeerc1167address)
- Solidity implementation in [**LSP16UniversalFactory**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP16UniversalFactory/LSP16UniversalFactory.sol)
- Function signature: `computeERC1167Address(address,bytes32,bool,bytes)`
- Function selector: `0xe888edcb`

:::

```solidity
function computeERC1167Address(
  address implementationContract,
  bytes32 providedSalt,
  bool initializable,
  bytes initializeCalldata
) external view returns (address);
```

Computes the address of an ERC1167 proxy contract based on the input parameters. Any change in one of these parameters will result in a different address. When the `initializable` boolean is set to `false`, `initializeCalldata` will not affect the function output.

#### Parameters

| Name                     |   Type    | Description                                                                                                                                        |
| ------------------------ | :-------: | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `implementationContract` | `address` | The contract to create a clone of according to ERC1167                                                                                             |
| `providedSalt`           | `bytes32` | The salt provided by the deployer, which will be used to generate the final salt that will be used by the `CREATE2` opcode for contract deployment |
| `initializable`          |  `bool`   | A boolean that indicates whether an external call should be made to initialize the proxy contract after deployment                                 |
| `initializeCalldata`     |  `bytes`  | The calldata to be executed on the created contract if `initializable` is set to `true`                                                            |

#### Returns

| Name |   Type    | Description                                                   |
| ---- | :-------: | ------------------------------------------------------------- |
| `0`  | `address` | The address where the ERC1167 proxy contract will be deployed |

### deployCreate2

:::note Links

- Specification details in [**LSP-16-UniversalFactory**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-16-UniversalFactory.md#deploycreate2)
- Solidity implementation in [**LSP16UniversalFactory**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP16UniversalFactory/LSP16UniversalFactory.sol)
- Function signature: `deployCreate2(bytes,bytes32)`
- Function selector: `0x26736355`

:::

```solidity
function deployCreate2(
  bytes byteCode,
  bytes32 providedSalt
) external payable returns (address);
```

Deploys a contract using the CREATE2 opcode. The address where the contract will be deployed can be known in advance via the [`computeAddress`](#computeaddress) function. This function deploys contracts without initialization (external call after deployment). The `providedSalt` parameter is not used directly as the salt by the CREATE2 opcode. Instead, it is hashed with keccak256: `keccak256(abi.encodePacked(false, providedSalt))`. See [`generateSalt`](#generatesalt) function for more details. Using the same `byteCode` and `providedSalt` multiple times will revert, as the contract cannot be deployed twice at the same address. If the constructor of the contract to deploy is payable, value can be sent to this function to fund the created contract. However, sending value to this function while the constructor is not payable will result in a revert.

#### Parameters

| Name           |   Type    | Description                                                                                                                                        |
| -------------- | :-------: | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `byteCode`     |  `bytes`  | The bytecode of the contract to be deployed                                                                                                        |
| `providedSalt` | `bytes32` | The salt provided by the deployer, which will be used to generate the final salt that will be used by the `CREATE2` opcode for contract deployment |

#### Returns

| Name |   Type    | Description                          |
| ---- | :-------: | ------------------------------------ |
| `0`  | `address` | The address of the deployed contract |

### deployCreate2AndInitialize

:::note Links

- Specification details in [**LSP-16-UniversalFactory**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-16-UniversalFactory.md#deploycreate2andinitialize)
- Solidity implementation in [**LSP16UniversalFactory**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP16UniversalFactory/LSP16UniversalFactory.sol)
- Function signature: `deployCreate2AndInitialize(bytes,bytes32,bytes,uint256,uint256)`
- Function selector: `0xcdbd473a`

:::

```solidity
function deployCreate2AndInitialize(
  bytes byteCode,
  bytes32 providedSalt,
  bytes initializeCalldata,
  uint256 constructorMsgValue,
  uint256 initializeCalldataMsgValue
) external payable returns (address);
```

Deploys a contract using the CREATE2 opcode. The address where the contract will be deployed can be known in advance via the [`computeAddress`](#computeaddress) function. This function deploys contracts with initialization (external call after deployment). The `providedSalt` parameter is not used directly as the salt by the CREATE2 opcode. Instead, it is hashed with keccak256: `keccak256(abi.encodePacked(true, initializeCalldata, providedSalt))`. See [`generateSalt`](#generatesalt) function for more details. Using the same `byteCode`, `providedSalt` and `initializeCalldata` multiple times will revert, as the contract cannot be deployed twice at the same address. If the constructor or the initialize function of the contract to deploy is payable, value can be sent along with the deployment/initialization to fund the created contract. However, sending value to this function while the constructor/initialize function is not payable will result in a revert. Will revert if the `msg.value` sent to the function is not equal to the sum of `constructorMsgValue` and `initializeCalldataMsgValue`.

#### Parameters

| Name                         |   Type    | Description                                                                                                                                        |
| ---------------------------- | :-------: | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `byteCode`                   |  `bytes`  | The bytecode of the contract to be deployed                                                                                                        |
| `providedSalt`               | `bytes32` | The salt provided by the deployer, which will be used to generate the final salt that will be used by the `CREATE2` opcode for contract deployment |
| `initializeCalldata`         |  `bytes`  | The calldata to be executed on the created contract                                                                                                |
| `constructorMsgValue`        | `uint256` | The value sent to the contract during deployment                                                                                                   |
| `initializeCalldataMsgValue` | `uint256` | The value sent to the contract during initialization                                                                                               |

#### Returns

| Name |   Type    | Description                          |
| ---- | :-------: | ------------------------------------ |
| `0`  | `address` | The address of the deployed contract |

### deployERC1167Proxy

:::note Links

- Specification details in [**LSP-16-UniversalFactory**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-16-UniversalFactory.md#deployerc1167proxy)
- Solidity implementation in [**LSP16UniversalFactory**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP16UniversalFactory/LSP16UniversalFactory.sol)
- Function signature: `deployERC1167Proxy(address,bytes32)`
- Function selector: `0x49d8abed`

:::

```solidity
function deployERC1167Proxy(
  address implementationContract,
  bytes32 providedSalt
) external nonpayable returns (address);
```

Deploys an ERC1167 minimal proxy contract using the CREATE2 opcode. The address where the contract will be deployed can be known in advance via the [`computeERC1167Address`](#computeerc1167address) function. This function deploys contracts without initialization (external call after deployment). The `providedSalt` parameter is not used directly as the salt by the CREATE2 opcode. Instead, it is hashed with keccak256: `keccak256(abi.encodePacked(false, providedSalt))`. See [`generateSalt`](#generatesalt) function for more details. See [`generateSalt`](#generatesalt) function for more details. Using the same `implementationContract` and `providedSalt` multiple times will revert, as the contract cannot be deployed twice at the same address. Sending value to the contract created is not possible since the constructor of the ERC1167 minimal proxy is not payable.

#### Parameters

| Name                     |   Type    | Description                                                                                                                                        |
| ------------------------ | :-------: | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `implementationContract` | `address` | The contract address to use as the base implementation behind the proxy that will be deployed                                                      |
| `providedSalt`           | `bytes32` | The salt provided by the deployer, which will be used to generate the final salt that will be used by the `CREATE2` opcode for contract deployment |

#### Returns

| Name |   Type    | Description                               |
| ---- | :-------: | ----------------------------------------- |
| `0`  | `address` | The address of the minimal proxy deployed |

### deployERC1167ProxyAndInitialize

:::note Links

- Specification details in [**LSP-16-UniversalFactory**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-16-UniversalFactory.md#deployerc1167proxyandinitialize)
- Solidity implementation in [**LSP16UniversalFactory**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP16UniversalFactory/LSP16UniversalFactory.sol)
- Function signature: `deployERC1167ProxyAndInitialize(address,bytes32,bytes)`
- Function selector: `0x5340165f`

:::

```solidity
function deployERC1167ProxyAndInitialize(
  address implementationContract,
  bytes32 providedSalt,
  bytes initializeCalldata
) external payable returns (address);
```

Deploys an ERC1167 minimal proxy contract using the CREATE2 opcode. The address where the contract will be deployed can be known in advance via the [`computeERC1167Address`](#computeerc1167address) function. This function deploys contracts with initialization (external call after deployment). The `providedSalt` parameter is not used directly as the salt by the CREATE2 opcode. Instead, it is hashed with keccak256: `keccak256(abi.encodePacked(true, initializeCalldata, providedSalt))`. See [`generateSalt`](#generatesalt) function for more details. Using the same `implementationContract`, `providedSalt` and `initializeCalldata` multiple times will revert, as the contract cannot be deployed twice at the same address. If the initialize function of the contract to deploy is payable, value can be sent along to fund the created contract while initializing. However, sending value to this function while the initialize function is not payable will result in a revert.

#### Parameters

| Name                     |   Type    | Description                                                                                                                                        |
| ------------------------ | :-------: | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `implementationContract` | `address` | The contract address to use as the base implementation behind the proxy that will be deployed                                                      |
| `providedSalt`           | `bytes32` | The salt provided by the deployer, which will be used to generate the final salt that will be used by the `CREATE2` opcode for contract deployment |
| `initializeCalldata`     |  `bytes`  | The calldata to be executed on the created contract                                                                                                |

#### Returns

| Name |   Type    | Description                               |
| ---- | :-------: | ----------------------------------------- |
| `0`  | `address` | The address of the minimal proxy deployed |

### generateSalt

:::note Links

- Specification details in [**LSP-16-UniversalFactory**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-16-UniversalFactory.md#generatesalt)
- Solidity implementation in [**LSP16UniversalFactory**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP16UniversalFactory/LSP16UniversalFactory.sol)
- Function signature: `generateSalt(bytes32,bool,bytes)`
- Function selector: `0x1a17ccbf`

:::

```solidity
function generateSalt(
  bytes32 providedSalt,
  bool initializable,
  bytes initializeCalldata
) external pure returns (bytes32);
```

Generates the salt used to deploy the contract by hashing the following parameters (concatenated together) with keccak256:

- the `providedSalt`

- the `initializable` boolean

- the `initializeCalldata`, only if the contract is initializable (the `initializable` boolean is set to `true`) The `providedSalt` parameter is not used directly as the salt by the CREATE2 opcode. Instead, it is used along with these parameters:

- `initializable` boolean

- `initializeCalldata` (when the contract is initializable and `initializable` is set to `true`). These three parameters are concatenated together and hashed to generate the final salt for CREATE2. This approach ensures that in order to reproduce an initializable contract at the same address on another chain, not only the `providedSalt` is required to be the same, but also the initialize parameters within the `initializeCalldata` must also be the same. This maintains consistent deployment behaviour. Users are required to initialize contracts with the same parameters across different chains to ensure contracts are deployed at the same address across different chains. ----------- Example (for initializable contracts) For an existing contract A on chain 1 owned by X, to replicate the same contract at the same address with the same owner X on chain 2, the salt used to generate the address should include the initializeCalldata that assigns X as the owner of contract A. For instance, if another user, Y, tries to deploy the contract at the same address on chain 2 using the same providedSalt, but with a different initializeCalldata to make Y the owner instead of X, the generated address would be different, preventing Y from deploying the contract with different ownership at the same address. ----------- However, for non-initializable contracts, if the constructor has arguments that specify the deployment behavior, they will be included in the bytecode. Any change in the constructor arguments will lead to a different contract's bytecode which will result in a different address on other chains. ----------- Example (for non-initializable contracts) If a contract is deployed with specific constructor arguments on chain 1, these arguments are embedded within the bytecode. For instance, if contract B is deployed with a specific `tokenName` and `tokenSymbol` on chain 1, and a user wants to deploy the same contract with the same `tokenName` and `tokenSymbol` on chain 2, they must use the same constructor arguments to produce the same bytecode. This ensures that the same deployment behaviour is maintained across different chains, as long as the same bytecode is used. If another user Z, tries to deploy the same contract B at the same address on chain 2 using the same `providedSalt` but different constructor arguments (a different `tokenName` and/or `tokenSymbol`), the generated address will be different. This prevents user Z from deploying the contract with different constructor arguments at the same address on chain

2. ----------- The providedSalt was hashed to produce the salt used by CREATE2 opcode to prevent users from deploying initializable contracts using non-initializable functions such as [`deployCreate2`](#deploycreate2) without having the initialization call. In other words, if the providedSalt was not hashed and was used as it is as the salt by the CREATE2 opcode, malicious users can check the generated salt used for the already deployed initializable contract on chain 1, and deploy the contract from [`deployCreate2`](#deploycreate2) function on chain 2, with passing the generated salt of the deployed contract as providedSalt that will produce the same address but without the initialization, where the malicious user can initialize after.

#### Parameters

| Name                 |   Type    | Description                                                                                                                                        |
| -------------------- | :-------: | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `providedSalt`       | `bytes32` | The salt provided by the deployer, which will be used to generate the final salt that will be used by the `CREATE2` opcode for contract deployment |
| `initializable`      |  `bool`   | The Boolean that specifies if the contract must be initialized or not                                                                              |
| `initializeCalldata` |  `bytes`  | The calldata to be executed on the created contract if `initializable` is set to `true`                                                            |

#### Returns

| Name |   Type    | Description                                                  |
| ---- | :-------: | ------------------------------------------------------------ |
| `0`  | `bytes32` | The generated salt which will be used for CREATE2 deployment |

## Events

### ContractCreated

:::note Links

- Specification details in [**LSP-16-UniversalFactory**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-16-UniversalFactory.md#contractcreated)
- Solidity implementation in [**LSP16UniversalFactory**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP16UniversalFactory/LSP16UniversalFactory.sol)
- Event signature: `ContractCreated(address,bytes32,bytes32,bool,bytes)`
- Event hash: `0x8872a323d65599f01bf90dc61c94b4e0cc8e2347d6af4122fccc3e112ee34a84`

:::

```solidity
event ContractCreated(address indexed contractCreated, bytes32 indexed providedSalt, bytes32 generatedSalt, bool indexed initialized, bytes initializeCalldata);
```

Emitted whenever a contract is created

#### Parameters

| Name                            |   Type    | Description                                                                                                                                        |
| ------------------------------- | :-------: | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `contractCreated` **`indexed`** | `address` | The address of the contract created                                                                                                                |
| `providedSalt` **`indexed`**    | `bytes32` | The salt provided by the deployer, which will be used to generate the final salt that will be used by the `CREATE2` opcode for contract deployment |
| `generatedSalt`                 | `bytes32` | The salt used by the `CREATE2` opcode for contract deployment                                                                                      |
| `initialized` **`indexed`**     |  `bool`   | The Boolean that specifies if the contract must be initialized or not                                                                              |
| `initializeCalldata`            |  `bytes`  | The bytes provided as initializeCalldata (Empty string when `initialized` is set to false)                                                         |

## Errors

### ContractInitializationFailed

:::note Links

- Specification details in [**LSP-16-UniversalFactory**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-16-UniversalFactory.md#contractinitializationfailed)
- Solidity implementation in [**LSP16UniversalFactory**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP16UniversalFactory/LSP16UniversalFactory.sol)
- Error signature: `ContractInitializationFailed()`
- Error hash: `0xc1ee8543`

:::

```solidity
error ContractInitializationFailed();
```

Reverts when there is no revert reason bubbled up by the contract created when initializing

### InvalidValueSum

:::note Links

- Specification details in [**LSP-16-UniversalFactory**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-16-UniversalFactory.md#invalidvaluesum)
- Solidity implementation in [**LSP16UniversalFactory**](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP16UniversalFactory/LSP16UniversalFactory.sol)
- Error signature: `InvalidValueSum()`
- Error hash: `0x2fd9ca91`

:::

```solidity
error InvalidValueSum();
```

Reverts when msg.value sent to [`deployCreate2AndInitialize`](#deploycreate2andinitialize) function is not equal to the sum of the `initializeCalldataMsgValue` and `constructorMsgValue`
