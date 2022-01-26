# ERC725X

*Fabian Vogelsteller &lt;fabian@lukso.network&gt;*

> ERC725 X executor



*Implementation of a contract module which provides the ability to call arbitrary functions at any other smart contract and itself, including using `delegatecall`, `staticcall` as well creating contracts using `create` and `create2` This is the basis for a smart contract based account system, but could also be used as a proxy account system*

## Methods

### execute

```solidity
function execute(uint256 _operation, address _to, uint256 _value, bytes _data) external payable returns (bytes result)
```



*Executes any other smart contract. SHOULD only be callable by the owner of the contract set via ERC173 Emits a {Executed} event, when a call is executed under `operationType` 0, 3 and 4 Emits a {ContractCreated} event, when a contract is created under `operationType` 1 and 2*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _operation | uint256 | undefined
| _to | address | undefined
| _value | uint256 | undefined
| _data | bytes | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| result | bytes | undefined

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
event ContractCreated(uint256 indexed operation, address indexed contractAddress, uint256 indexed value)
```

Emitted when a contract is created



#### Parameters

| Name | Type | Description |
|---|---|---|
| operation `indexed` | uint256 | undefined |
| contractAddress `indexed` | address | undefined |
| value `indexed` | uint256 | undefined |

### Executed

```solidity
event Executed(uint256 indexed operation, address indexed to, uint256 indexed value, bytes data)
```

Emitted when a contract executed.



#### Parameters

| Name | Type | Description |
|---|---|---|
| operation `indexed` | uint256 | undefined |
| to `indexed` | address | undefined |
| value `indexed` | uint256 | undefined |
| data  | bytes | undefined |

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |



