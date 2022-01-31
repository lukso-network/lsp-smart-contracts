# LSP0ERC725AccountInitAbstract

*Fabian Vogelsteller &lt;fabian@lukso.network&gt;, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)*

> Inheritable Proxy Implementation of ERC725Account



*Bundles ERC725X and ERC725Y, ERC1271 and LSP1UniversalReceiver and allows receiving native tokens*

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

### getData

```solidity
function getData(bytes32[] keys) external view returns (bytes[] values)
```

Gets array of data at multiple given keys



#### Parameters

| Name | Type | Description |
|---|---|---|
| keys | bytes32[] | The array of keys which values to retrieve

#### Returns

| Name | Type | Description |
|---|---|---|
| values | bytes[] | The array of data stored at multiple keys

### initialize

```solidity
function initialize(address _newOwner) external nonpayable
```

Sets the owner of the contract and register ERC725Account, ERC1271 and LSP1UniversalReceiver interfacesId



#### Parameters

| Name | Type | Description |
|---|---|---|
| _newOwner | address | the owner of the contract

### isValidSignature

```solidity
function isValidSignature(bytes32 _hash, bytes _signature) external view returns (bytes4 magicValue)
```

Checks if an owner signed `_data`. ERC1271 interface.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _hash | bytes32 | hash of the data signed//Arbitrary length data signed on the behalf of address(this)
| _signature | bytes | owner&#39;s signature(s) of the data

#### Returns

| Name | Type | Description |
|---|---|---|
| magicValue | bytes4 | undefined

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


### setData

```solidity
function setData(bytes32[] _keys, bytes[] _values) external nonpayable
```



*Sets array of data at multiple given `key` SHOULD only be callable by the owner of the contract set via ERC173 Emits a {DataChanged} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _keys | bytes32[] | undefined
| _values | bytes[] | undefined

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

### universalReceiver

```solidity
function universalReceiver(bytes32 _typeId, bytes _data) external nonpayable returns (bytes returnValue)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _typeId | bytes32 | undefined
| _data | bytes | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| returnValue | bytes | undefined



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

### DataChanged

```solidity
event DataChanged(bytes32 indexed key, bytes value)
```

Emitted when data at a key is changed



#### Parameters

| Name | Type | Description |
|---|---|---|
| key `indexed` | bytes32 | undefined |
| value  | bytes | undefined |

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

### UniversalReceiver

```solidity
event UniversalReceiver(address indexed from, bytes32 indexed typeId, bytes indexed returnedValue, bytes receivedData)
```

Emitted when the universalReceiver function is succesfully executed



#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | undefined |
| typeId `indexed` | bytes32 | undefined |
| returnedValue `indexed` | bytes | undefined |
| receivedData  | bytes | undefined |

### ValueReceived

```solidity
event ValueReceived(address indexed sender, uint256 indexed value)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| sender `indexed` | address | undefined |
| value `indexed` | uint256 | undefined |



