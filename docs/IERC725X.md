# IERC725X



> The interface for ERC725X General executor



*ERC725X provides the ability to call arbitrary functions at any other smart contract and itself, including using `delegatecall`, `staticcall`, as well creating contracts using `create` and `create2` This is the basis for a smart contract based account system, but could also be used as a proxy account system*

## Methods

### execute

```solidity
function execute(uint256 operationType, address to, uint256 value, bytes data) external payable returns (bytes)
```



*Executes any other smart contract. SHOULD only be callable by the owner of the contract set via ERC173 Emits a {Executed} event, when a call is executed under `operationType` 0, 3 and 4 Emits a {ContractCreated} event, when a contract is created under `operationType` 1 and 2*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operationType | uint256 | The operation to execute: CALL = 0 CREATE = 1 CREATE2 = 2 STATICCALL = 3 DELEGATECALL = 4
| to | address | The smart contract or address to interact with, `to` will be unused if a contract is created (operation 1 and 2)
| value | uint256 | The value to transfer
| data | bytes | The call data, or the contract data to deploy

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes | undefined



## Events

### ContractCreated

```solidity
event ContractCreated(uint256 indexed operation, address indexed contractAddress, uint256 indexed value)
```

Emitted when a contract is created



#### Parameters

| Name | Type | Description |
|---|---|---|
| operation `indexed` | uint256 | The operation used to create a contract |
| contractAddress `indexed` | address | The created contract address |
| value `indexed` | uint256 | The value sent to the created contract address |

### Executed

```solidity
event Executed(uint256 indexed operation, address indexed to, uint256 indexed value, bytes data)
```

Emitted when a contract executed.



#### Parameters

| Name | Type | Description |
|---|---|---|
| operation `indexed` | uint256 | The operation used to execute a contract |
| to `indexed` | address | The address where the call is executed |
| value `indexed` | uint256 | The value sent to the created contract address |
| data  | bytes | The data sent with the call |



