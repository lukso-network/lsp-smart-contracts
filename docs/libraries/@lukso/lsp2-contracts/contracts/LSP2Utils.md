<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP2Utils

:::info Standard Specifications

[`LSP-2-ERC725YJSONSchema`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md)

:::
:::info Solidity implementation

[`LSP2Utils.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp2-contracts/contracts/LSP2Utils.sol)

:::

> LSP2 Utility library.

LSP2Utils is a library of utility functions that can be used to encode data key of different key type defined on the LSP2 standard. Based on LSP2 ERC725Y JSON Schema standard.

## Internal Methods

Any method labeled as `internal` serves as utility function within the contract. They can be used when writing solidity contracts that inherit from this contract. These methods can be extended or modified by overriding their internal behavior to suit specific needs.

Internal functions cannot be called externally, whether from other smart contracts, dApp interfaces, or backend services. Their restricted accessibility ensures that they remain exclusively available within the context of the current contract, promoting controlled and encapsulated usage of these internal utilities.

### generateSingletonKey

```solidity
function generateSingletonKey(string keyName) internal pure returns (bytes32);
```

Generates a data key of keyType Singleton by hashing the string `keyName`. As:

```
keccak256("keyName")
```

#### Parameters

| Name      |   Type   | Description                                          |
| --------- | :------: | ---------------------------------------------------- |
| `keyName` | `string` | The string to hash to generate a Singleton data key. |

#### Returns

| Name |   Type    | Description                                             |
| ---- | :-------: | ------------------------------------------------------- |
| `0`  | `bytes32` | The generated `bytes32` data key of key type Singleton. |

<br/>

### generateArrayKey

```solidity
function generateArrayKey(string arrayKeyName) internal pure returns (bytes32);
```

Generates a data key of keyType Array by hashing `arrayKeyName`. As:

```
keccak256("arrayKeyName[]")
```

#### Parameters

| Name           |   Type   | Description                                                            |
| -------------- | :------: | ---------------------------------------------------------------------- |
| `arrayKeyName` | `string` | The string that will be used to generate a data key of key type Array. |

#### Returns

| Name |   Type    | Description                                         |
| ---- | :-------: | --------------------------------------------------- |
| `0`  | `bytes32` | The generated `bytes32` data key of key type Array. |

<br/>

### generateArrayElementKeyAtIndex

```solidity
function generateArrayElementKeyAtIndex(
  bytes32 arrayKey,
  uint128 index
) internal pure returns (bytes32);
```

Generates an Array data key at a specific `index` by concatenating together the first 16 bytes of `arrayKey`
with the 16 bytes of `index`. As:

```
arrayKey[index]
```

#### Parameters

| Name       |   Type    | Description                                                                         |
| ---------- | :-------: | ----------------------------------------------------------------------------------- |
| `arrayKey` | `bytes32` | The Array data key from which to generate the Array data key at a specific `index`. |
| `index`    | `uint128` | The index number in the `arrayKey`.                                                 |

#### Returns

| Name |   Type    | Description                                                               |
| ---- | :-------: | ------------------------------------------------------------------------- |
| `0`  | `bytes32` | The generated `bytes32` data key of key type Array at a specific `index`. |

<br/>

### generateMappingKey

```solidity
function generateMappingKey(
  string firstWord,
  string lastWord
) internal pure returns (bytes32);
```

Generates a data key of key type Mapping that map `firstWord` to `lastWord`. This is done by hashing two strings words `firstWord` and `lastWord`. As:

```
bytes10(firstWordHash):0000:bytes20(lastWordHash)
```

#### Parameters

| Name        |   Type   | Description                                          |
| ----------- | :------: | ---------------------------------------------------- |
| `firstWord` | `string` | The word to retrieve the first 10 bytes of its hash. |
| `lastWord`  | `string` | The word to retrieve the first 10 bytes of its hash. |

#### Returns

| Name |   Type    | Description                                                                                         |
| ---- | :-------: | --------------------------------------------------------------------------------------------------- |
| `0`  | `bytes32` | The generated `bytes32` data key of key type Mapping that map `firstWord` to a specific `lastWord`. |

<br/>

### generateMappingKey

```solidity
function generateMappingKey(
  string firstWord,
  address addr
) internal pure returns (bytes32);
```

Generates a data key of key type Mapping that map `firstWord` to an address `addr`.
This is done by hashing the string word `firstWord` and concatenating its first 10 bytes with `addr`. As:

```
bytes10(firstWordHash):0000:<address>
```

#### Parameters

| Name        |   Type    | Description                                          |
| ----------- | :-------: | ---------------------------------------------------- |
| `firstWord` | `string`  | The word to retrieve the first 10 bytes of its hash. |
| `addr`      | `address` | An address to map `firstWord` to.                    |

#### Returns

| Name |   Type    | Description                                                                                             |
| ---- | :-------: | ------------------------------------------------------------------------------------------------------- |
| `0`  | `bytes32` | The generated `bytes32` data key of key type Mapping that map `firstWord` to a specific address `addr`. |

<br/>

### generateMappingKey

```solidity
function generateMappingKey(
  bytes10 keyPrefix,
  bytes20 bytes20Value
) internal pure returns (bytes32);
```

Generate a data key of key type Mapping that map a 10 bytes `keyPrefix` to a `bytes20Value`. As:

```
keyPrefix:bytes20Value
```

#### Parameters

| Name           |   Type    | Description                                          |
| -------------- | :-------: | ---------------------------------------------------- |
| `keyPrefix`    | `bytes10` | The first part of the data key of key type Mapping.  |
| `bytes20Value` | `bytes20` | The second part of the data key of key type Mapping. |

#### Returns

| Name |   Type    | Description                                                                                               |
| ---- | :-------: | --------------------------------------------------------------------------------------------------------- |
| `0`  | `bytes32` | The generated `bytes32` data key of key type Mapping that map a `keyPrefix` to a specific `bytes20Value`. |

<br/>

### generateMappingWithGroupingKey

```solidity
function generateMappingWithGroupingKey(
  string firstWord,
  string secondWord,
  address addr
) internal pure returns (bytes32);
```

Generate a data key of key type MappingWithGrouping by using two strings `firstWord`
mapped to a `secondWord` mapped itself to a specific address `addr`. As:

```
bytes6(keccak256("firstWord")):bytes4(keccak256("secondWord")):0000:<address>
```

#### Parameters

| Name         |   Type    | Description                                                      |
| ------------ | :-------: | ---------------------------------------------------------------- |
| `firstWord`  | `string`  | The word to retrieve the first 6 bytes of its hash.              |
| `secondWord` | `string`  | The word to retrieve the first 4 bytes of its hash.              |
| `addr`       | `address` | The address that makes the last part of the MappingWithGrouping. |

#### Returns

| Name |   Type    | Description                                                                                                                             |
| ---- | :-------: | --------------------------------------------------------------------------------------------------------------------------------------- |
| `0`  | `bytes32` | The generated `bytes32` data key of key type MappingWithGrouping that map a `firstWord` to a `secondWord` to a specific address `addr`. |

<br/>

### generateMappingWithGroupingKey

```solidity
function generateMappingWithGroupingKey(
  bytes6 keyPrefix,
  bytes4 mapPrefix,
  bytes20 subMapKey
) internal pure returns (bytes32);
```

Generate a data key of key type MappingWithGrouping that map a `keyPrefix` to an other `mapPrefix` to a specific `subMapKey`. As:

```
keyPrefix:mapPrefix:0000:subMapKey
```

#### Parameters

| Name        |   Type    | Description                                                               |
| ----------- | :-------: | ------------------------------------------------------------------------- |
| `keyPrefix` | `bytes6`  | The first part (6 bytes) of the data key of keyType MappingWithGrouping.  |
| `mapPrefix` | `bytes4`  | The second part (4 bytes) of the data key of keyType MappingWithGrouping. |
| `subMapKey` | `bytes20` | The last part (bytes20) of the data key of keyType MappingWithGrouping.   |

#### Returns

| Name |   Type    | Description                                                                                                                         |
| ---- | :-------: | ----------------------------------------------------------------------------------------------------------------------------------- |
| `0`  | `bytes32` | The generated `bytes32` data key of key type MappingWithGrouping that map a `keyPrefix` to a `mapPrefix` to a specific `subMapKey`. |

<br/>

### generateMappingWithGroupingKey

```solidity
function generateMappingWithGroupingKey(
  bytes10 keyPrefix,
  bytes20 bytes20Value
) internal pure returns (bytes32);
```

Generate a data key of key type MappingWithGrouping that map a 10 bytes `keyPrefix` to a specific `bytes20Value`. As:

#### Parameters

| Name           |   Type    | Description                                                    |
| -------------- | :-------: | -------------------------------------------------------------- |
| `keyPrefix`    | `bytes10` | The first part of the data key of keyType MappingWithGrouping. |
| `bytes20Value` | `bytes20` | The last of the data key of keyType MappingWithGrouping.       |

#### Returns

| Name |   Type    | Description                                                                             |
| ---- | :-------: | --------------------------------------------------------------------------------------- |
| `0`  | `bytes32` | The generated `bytes32` data key of key type MappingWithGrouping that map a `keyPrefix` |

<br/>

### generateJSONURLValue

```solidity
function generateJSONURLValue(
  string hashFunction,
  string json,
  string url
) internal pure returns (bytes);
```

Generate a JSONURL value content.

#### Parameters

| Name           |   Type   | Description                              |
| -------------- | :------: | ---------------------------------------- |
| `hashFunction` | `string` | The function used to hash the JSON file. |
| `json`         | `string` | Bytes value of the JSON file.            |
| `url`          | `string` | The URL where the JSON file is hosted.   |

<br/>

### generateASSETURLValue

```solidity
function generateASSETURLValue(
  string hashFunction,
  string assetBytes,
  string url
) internal pure returns (bytes);
```

Generate a ASSETURL value content.

#### Parameters

| Name           |   Type   | Description                              |
| -------------- | :------: | ---------------------------------------- |
| `hashFunction` | `string` | The function used to hash the JSON file. |
| `assetBytes`   | `string` | Bytes value of the JSON file.            |
| `url`          | `string` | The URL where the JSON file is hosted.   |

#### Returns

| Name |  Type   | Description                         |
| ---- | :-----: | ----------------------------------- |
| `0`  | `bytes` | The encoded value as an `ASSETURL`. |

<br/>

### isCompactBytesArray

```solidity
function isCompactBytesArray(
  bytes compactBytesArray
) internal pure returns (bool);
```

Verify if `data` is a valid array of value encoded as a `CompactBytesArray` according to the LSP2 `CompactBytesArray` valueType specification.

#### Parameters

| Name                |  Type   | Description                |
| ------------------- | :-----: | -------------------------- |
| `compactBytesArray` | `bytes` | The bytes value to verify. |

#### Returns

| Name |  Type  | Description                                                                     |
| ---- | :----: | ------------------------------------------------------------------------------- |
| `0`  | `bool` | `true` if the `data` is correctly encoded CompactBytesArray, `false` otherwise. |

<br/>

### isValidLSP2ArrayLengthValue

```solidity
function isValidLSP2ArrayLengthValue(
  bytes arrayLength
) internal pure returns (bool);
```

Validates if the bytes `arrayLength` are exactly 16 bytes long, and are of the exact size of an LSP2 Array length value

#### Parameters

| Name          |  Type   | Description                           |
| ------------- | :-----: | ------------------------------------- |
| `arrayLength` | `bytes` | Plain bytes that should be validated. |

#### Returns

| Name |  Type  | Description                                              |
| ---- | :----: | -------------------------------------------------------- |
| `0`  | `bool` | `true` if the value is 16 bytes long, `false` otherwise. |

<br/>

### removeLastElementFromArrayAndMap

```solidity
function removeLastElementFromArrayAndMap(
  bytes32 arrayKey,
  uint128 newArrayLength,
  bytes32 removedElementIndexKey,
  bytes32 removedElementMapKey
) internal pure returns (bytes32[] dataKeys, bytes[] dataValues);
```

Generates Data Key/Value pairs for removing the last element from an LSP2 Array and a mapping Data Key.

#### Parameters

| Name                     |   Type    | Description                                                   |
| ------------------------ | :-------: | ------------------------------------------------------------- |
| `arrayKey`               | `bytes32` | The Data Key of Key Type Array.                               |
| `newArrayLength`         | `uint128` | The new Array Length for the `arrayKey`.                      |
| `removedElementIndexKey` | `bytes32` | The Data Key of Key Type Array Index for the removed element. |
| `removedElementMapKey`   | `bytes32` | The Data Key of a mapping to be removed.                      |

<br/>

### removeElementFromArrayAndMap

:::info

The function assumes that the Data Value stored under the mapping Data Key is of length 20 where the last 16 bytes are the index of the element in the array.

:::

```solidity
function removeElementFromArrayAndMap(contract IERC725Y erc725YContract, bytes32 arrayKey, uint128 newArrayLength, bytes32 removedElementIndexKey, uint128 removedElementIndex, bytes32 removedElementMapKey) internal view returns (bytes32[] dataKeys, bytes[] dataValues);
```

Generates Data Key/Value pairs for removing an element from an LSP2 Array and a mapping Data Key.

#### Parameters

| Name                     |        Type         | Description                                                   |
| ------------------------ | :-----------------: | ------------------------------------------------------------- |
| `erc725YContract`        | `contract IERC725Y` | The ERC725Y contract.                                         |
| `arrayKey`               |      `bytes32`      | The Data Key of Key Type Array.                               |
| `newArrayLength`         |      `uint128`      | The new Array Length for the `arrayKey`.                      |
| `removedElementIndexKey` |      `bytes32`      | The Data Key of Key Type Array Index for the removed element. |
| `removedElementIndex`    |      `uint128`      | the index of the removed element.                             |
| `removedElementMapKey`   |      `bytes32`      | The Data Key of a mapping to be removed.                      |

<br/>
