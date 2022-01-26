# ERC725XInit

*Fabian Vogelsteller &lt;fabian@lukso.network&gt;*

> ERC725 X executor



*Implementation of a contract module which provides the ability to call arbitrary functions at any other smart contract and itself, including using `delegatecall`, `staticcall` as well creating contracts using `create` and `create2`. This is the basis for a smart contract based account system, but could also be used as a proxy account system. `execute` MUST only be called by the owner of the contract set via ERC173.*

## Methods

### execute

```solidity
function execute(uint256 _operation, address _to, uint256 _value, bytes _data) external payable returns (bytes result)
```

Executes any other smart contract. Is only callable by the owner.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _operation | uint256 | the operation to execute: CALL = 0; CREATE = 1; CREATE2 = 2; STATICCALL = 3; DELEGATECALL = 4;
| _to | address | the smart contract or address to interact with. `_to` will be unused if a contract is created (operation 1 and 2)
| _value | uint256 | the value of ETH to transfer
| _data | bytes | the call data, or the contract data to deploy

#### Returns

| Name | Type | Description |
|---|---|---|
| result | bytes | undefined

### initialize

```solidity
function initialize(address _newOwner) external nonpayable
```

Sets the owner of the contract



#### Parameters

| Name | Type | Description |
|---|---|---|
| _newOwner | address | the owner of the contract.

### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.*


### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```



*See {IERC165-supportsInterface}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| interfaceId | bytes4 | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```



*Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined



## Events

### ContractCreated

```solidity
event ContractCreated(uint256 indexed _operation, address indexed _contractAddress, uint256 indexed _value)
```





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





#### Parameters

| Name | Type | Description |
|---|---|---|
| _operation `indexed` | uint256 | undefined |
| _to `indexed` | address | undefined |
| _value `indexed` | uint256 | undefined |
| _data  | bytes | undefined |

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |



