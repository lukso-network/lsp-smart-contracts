<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# LSP4Utils

:::info Standard Specifications

[`LSP-4-DigitalAsset-Metadata`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-4-DigitalAsset-Metadata.md)

:::
:::info Solidity implementation

[`LSP4Utils.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp4-contracts/contracts/LSP4Utils.sol)

:::

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### toLSP4MetadataJSON

:::note References

- Specification details: [**LSP-4-DigitalAsset-Metadata**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-4-DigitalAsset-Metadata.md#tolsp4metadatajson)
- Solidity implementation: [`LSP4Utils.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp4-contracts/contracts/LSP4Utils.sol)
- Function signature: `toLSP4MetadataJSON(string,string,Link[],Attribute[],Icons,Images,Assets)`
- Function selector: `0x4821954f`

:::

```solidity
function toLSP4MetadataJSON(
  string name,
  string description,
  struct Link[] links,
  struct Attribute[] attributes,
  struct Icons icons,
  struct Images images,
  struct Assets assets
)
  external pure
  returns (string);
```

#### Parameters

| Name          |         Type         | Description |
| ------------- | :------------------: | ----------- |
| `name`        |       `string`       | -           |
| `description` |       `string`       | -           |
| `links`       |   `struct Link[]`    | -           |
| `attributes`  | `struct Attribute[]` | -           |
| `icons`       |    `struct Icons`    | -           |
| `images`      |   `struct Images`    | -           |
| `assets`      |   `struct Assets`    | -           |

#### Returns

| Name |   Type   | Description |
| ---- | :------: | ----------- |
| `0`  | `string` | -           |

<br/>

## Internal Methods

Any method labeled as `internal` serves as utility function within the contract. They can be used when writing solidity contracts that inherit from this contract. These methods can be extended or modified by overriding their internal behavior to suit specific needs.

Internal functions cannot be called externally, whether from other smart contracts, dApp interfaces, or backend services. Their restricted accessibility ensures that they remain exclusively available within the context of the current contract, promoting controlled and encapsulated usage of these internal utilities.

### toJSON

```solidity
function toJSON(struct Link link) internal pure returns (string);
```

#### Parameters

| Name   |     Type      | Description |
| ------ | :-----------: | ----------- |
| `link` | `struct Link` | -           |

#### Returns

| Name |   Type   | Description |
| ---- | :------: | ----------- |
| `0`  | `string` | -           |

<br/>

### toJSON

```solidity
function toJSON(struct Link[] links) internal pure returns (string object);
```

#### Parameters

| Name    |      Type       | Description |
| ------- | :-------------: | ----------- |
| `links` | `struct Link[]` | -           |

#### Returns

| Name     |   Type   | Description |
| -------- | :------: | ----------- |
| `object` | `string` | -           |

<br/>

### toJSON

```solidity
function toJSON(struct Attribute attribute) internal pure returns (string);
```

#### Parameters

| Name        |        Type        | Description |
| ----------- | :----------------: | ----------- |
| `attribute` | `struct Attribute` | -           |

#### Returns

| Name |   Type   | Description |
| ---- | :------: | ----------- |
| `0`  | `string` | -           |

<br/>

### toJSON

```solidity
function toJSON(struct Attribute[] attributes) internal pure returns (string object);
```

#### Parameters

| Name         |         Type         | Description |
| ------------ | :------------------: | ----------- |
| `attributes` | `struct Attribute[]` | -           |

#### Returns

| Name     |   Type   | Description |
| -------- | :------: | ----------- |
| `object` | `string` | -           |

<br/>

### toJSON

```solidity
function toJSON(struct Image image) internal pure returns (string);
```

#### Parameters

| Name    |      Type      | Description |
| ------- | :------------: | ----------- |
| `image` | `struct Image` | -           |

#### Returns

| Name |   Type   | Description |
| ---- | :------: | ----------- |
| `0`  | `string` | -           |

<br/>

### toJSON

```solidity
function toJSON(struct Image[] images) internal pure returns (string object);
```

#### Parameters

| Name     |       Type       | Description |
| -------- | :--------------: | ----------- |
| `images` | `struct Image[]` | -           |

#### Returns

| Name     |   Type   | Description |
| -------- | :------: | ----------- |
| `object` | `string` | -           |

<br/>

### toJSON

```solidity
function toJSON(struct Image[][] images) internal pure returns (string object);
```

#### Parameters

| Name     |        Type        | Description |
| -------- | :----------------: | ----------- |
| `images` | `struct Image[][]` | -           |

#### Returns

| Name     |   Type   | Description |
| -------- | :------: | ----------- |
| `object` | `string` | -           |

<br/>

### toJSON

```solidity
function toJSON(struct Asset asset) internal pure returns (string);
```

#### Parameters

| Name    |      Type      | Description |
| ------- | :------------: | ----------- |
| `asset` | `struct Asset` | -           |

#### Returns

| Name |   Type   | Description |
| ---- | :------: | ----------- |
| `0`  | `string` | -           |

<br/>

### toJSON

```solidity
function toJSON(struct Asset[] assets) internal pure returns (string object);
```

#### Parameters

| Name     |       Type       | Description |
| -------- | :--------------: | ----------- |
| `assets` | `struct Asset[]` | -           |

#### Returns

| Name     |   Type   | Description |
| -------- | :------: | ----------- |
| `object` | `string` | -           |

<br/>

### toJSON

```solidity
function toJSON(struct LSP7Asset asset) internal pure returns (string);
```

#### Parameters

| Name    |        Type        | Description |
| ------- | :----------------: | ----------- |
| `asset` | `struct LSP7Asset` | -           |

#### Returns

| Name |   Type   | Description |
| ---- | :------: | ----------- |
| `0`  | `string` | -           |

<br/>

### toJSON

```solidity
function toJSON(struct LSP7Asset[] assets) internal pure returns (string object);
```

#### Parameters

| Name     |         Type         | Description |
| -------- | :------------------: | ----------- |
| `assets` | `struct LSP7Asset[]` | -           |

#### Returns

| Name     |   Type   | Description |
| -------- | :------: | ----------- |
| `object` | `string` | -           |

<br/>

### toJSON

```solidity
function toJSON(struct LSP7Asset[][] assets) internal pure returns (string object);
```

#### Parameters

| Name     |          Type          | Description |
| -------- | :--------------------: | ----------- |
| `assets` | `struct LSP7Asset[][]` | -           |

#### Returns

| Name     |   Type   | Description |
| -------- | :------: | ----------- |
| `object` | `string` | -           |

<br/>

### toJSON

```solidity
function toJSON(struct LSP8Asset asset) internal pure returns (string);
```

#### Parameters

| Name    |        Type        | Description |
| ------- | :----------------: | ----------- |
| `asset` | `struct LSP8Asset` | -           |

#### Returns

| Name |   Type   | Description |
| ---- | :------: | ----------- |
| `0`  | `string` | -           |

<br/>

### toJSON

```solidity
function toJSON(struct LSP8Asset[] assets) internal pure returns (string object);
```

#### Parameters

| Name     |         Type         | Description |
| -------- | :------------------: | ----------- |
| `assets` | `struct LSP8Asset[]` | -           |

#### Returns

| Name     |   Type   | Description |
| -------- | :------: | ----------- |
| `object` | `string` | -           |

<br/>

### toJSON

```solidity
function toJSON(struct LSP8Asset[][] assets) internal pure returns (string object);
```

#### Parameters

| Name     |          Type          | Description |
| -------- | :--------------------: | ----------- |
| `assets` | `struct LSP8Asset[][]` | -           |

#### Returns

| Name     |   Type   | Description |
| -------- | :------: | ----------- |
| `object` | `string` | -           |

<br/>

### toJSON

```solidity
function toJSON(struct Icons icons) internal pure returns (string object);
```

#### Parameters

| Name    |      Type      | Description |
| ------- | :------------: | ----------- |
| `icons` | `struct Icons` | -           |

#### Returns

| Name     |   Type   | Description |
| -------- | :------: | ----------- |
| `object` | `string` | -           |

<br/>

### toJSON

```solidity
function toJSON(struct Images images) internal pure returns (string object);
```

#### Parameters

| Name     |      Type       | Description |
| -------- | :-------------: | ----------- |
| `images` | `struct Images` | -           |

#### Returns

| Name     |   Type   | Description |
| -------- | :------: | ----------- |
| `object` | `string` | -           |

<br/>

### toJSON

```solidity
function toJSON(struct Assets assets) internal pure returns (string object);
```

#### Parameters

| Name     |      Type       | Description |
| -------- | :-------------: | ----------- |
| `assets` | `struct Assets` | -           |

#### Returns

| Name     |   Type   | Description |
| -------- | :------: | ----------- |
| `object` | `string` | -           |

<br/>

### toVerifiableURI

```solidity
function toVerifiableURI(
  string data
) internal pure returns (bytes verifiableURI);
```

#### Parameters

| Name   |   Type   | Description |
| ------ | :------: | ----------- |
| `data` | `string` | -           |

#### Returns

| Name            |  Type   | Description |
| --------------- | :-----: | ----------- |
| `verifiableURI` | `bytes` | -           |

<br/>
