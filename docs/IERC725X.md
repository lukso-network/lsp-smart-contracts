# IERC725X







*Contract module which provides the ability to call arbitrary functions at any other smart contract and itself, including using `delegatecall`, `staticcall`, as well creating contracts using `create` and `create2`. This is the basis for a smart contract based account system, but could also be used as a proxy account system. `execute` should only be callable by the owner of the contract set via ERC173.*

## Methods

### execute

```solidity
function execute(uint256 operationType, address to, uint256 value, bytes data) external payable returns (bytes)
```



*Executes any other smart contract. SHOULD only be callable by the owner of the contract set via ERC173. Requirements: - `operationType`, the operation to execute. So far defined is:     CALL = 0;     CREATE = 1;     CREATE2 = 2;     STATICCALL = 3;     DELEGATECALL = 4; - `data` the call data that will be used with the contract at `to` Emits a {ContractCreated} event, when a contract is created under `operationType` 1 and 2.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operationType | uint256 | undefined
| to | address | undefined
| value | uint256 | undefined
| data | bytes | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes | undefined



## Events

### ContractCreated

```solidity
event ContractCreated(uint256 indexed _operation, address indexed _contractAddress, uint256 indexed _value)
```



*Emitted when a contract is created.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _operation `indexed` | uint256 | undefined |
| _contractAddress `indexed` | address | undefined |
| _value `indexed` | uint256 | undefined |

### Executed

```solidity
event Executed(uint256 indexed _operation, address indexed _to, uint256 indexed _value, bytes _data)
```



*Emitted when a contract executed.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _operation `indexed` | uint256 | undefined |
| _to `indexed` | address | undefined |
| _value `indexed` | uint256 | undefined |
| _data  | bytes | undefined |



