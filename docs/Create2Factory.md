# Create2Factory



> contract to deploy contracts with precomputed addresses, using create2 opcode based on https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Create2.sol DO NOT TOUCH





## Methods

### computeAddress

```solidity
function computeAddress(bytes32 salt, bytes32 bytecodeHash, address deployer) external pure returns (address)
```



*Returns the address where a contract will be stored if deployed via {deploy} from a contract located at `deployer`. If `deployer` is this contract&#39;s address, returns the same value as {computeAddress}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| salt | bytes32 | undefined
| bytecodeHash | bytes32 | undefined
| deployer | address | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

### deploy

```solidity
function deploy(bytes32 salt, bytes bytecode) external payable returns (address)
```



*Deploys a contract using `CREATE2`. The address where the contract will be deployed can be known in advance via {computeAddress}. The bytecode for a contract can be obtained from Solidity with `type(contractName).creationCode`. Requirements: - `bytecode` must not be empty. - `salt` must have not been used for `bytecode` already.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| salt | bytes32 | undefined
| bytecode | bytes | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined



## Events

### ContractCreated

```solidity
event ContractCreated(address addr, bytes32 salt)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| addr  | address | undefined |
| salt  | bytes32 | undefined |



