<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# ILSP26FollowerSystem

:::info Standard Specifications

[`LSP-26-FollowerSystem`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-26-FollowerSystem.md)

:::
:::info Solidity implementation

[`ILSP26FollowerSystem.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp26-contracts/contracts/ILSP26FollowerSystem.sol)

:::

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### follow

:::note References

- Specification details: [**LSP-26-FollowerSystem**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-26-FollowerSystem.md#follow)
- Solidity implementation: [`ILSP26FollowerSystem.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp26-contracts/contracts/ILSP26FollowerSystem.sol)
- Function signature: `follow(address)`
- Function selector: `0x4dbf27cc`

:::

```solidity
function follow(address addr) external nonpayable;
```

_Follow an specific address._

<blockquote>

**Emitted events:**

- [`Follow`](#follow) event when following an address.

</blockquote>

#### Parameters

| Name   |   Type    | Description                     |
| ------ | :-------: | ------------------------------- |
| `addr` | `address` | The address to start following. |

<br/>

### followBatch

:::note References

- Specification details: [**LSP-26-FollowerSystem**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-26-FollowerSystem.md#followbatch)
- Solidity implementation: [`ILSP26FollowerSystem.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp26-contracts/contracts/ILSP26FollowerSystem.sol)
- Function signature: `followBatch(address[])`
- Function selector: `0xcf8711c8`

:::

```solidity
function followBatch(address[] addresses) external nonpayable;
```

_Follow a list of addresses._

<blockquote>

**Emitted events:**

- [`Follow`](#follow) event when following each address in the list.

</blockquote>

#### Parameters

| Name        |    Type     | Description                      |
| ----------- | :---------: | -------------------------------- |
| `addresses` | `address[]` | The list of addresses to follow. |

<br/>

### followerCount

:::note References

- Specification details: [**LSP-26-FollowerSystem**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-26-FollowerSystem.md#followercount)
- Solidity implementation: [`ILSP26FollowerSystem.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp26-contracts/contracts/ILSP26FollowerSystem.sol)
- Function signature: `followerCount(address)`
- Function selector: `0x30b3a890`

:::

```solidity
function followerCount(address addr) external view returns (uint256);
```

_Get the number of followers for an address._

#### Parameters

| Name   |   Type    | Description                                     |
| ------ | :-------: | ----------------------------------------------- |
| `addr` | `address` | The address whose followers count is requested. |

#### Returns

| Name |   Type    | Description                        |
| ---- | :-------: | ---------------------------------- |
| `0`  | `uint256` | The number of followers of `addr`. |

<br/>

### followingCount

:::note References

- Specification details: [**LSP-26-FollowerSystem**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-26-FollowerSystem.md#followingcount)
- Solidity implementation: [`ILSP26FollowerSystem.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp26-contracts/contracts/ILSP26FollowerSystem.sol)
- Function signature: `followingCount(address)`
- Function selector: `0x64548707`

:::

```solidity
function followingCount(address addr) external view returns (uint256);
```

_Get the number of addresses an address is following._

#### Parameters

| Name   |   Type    | Description                                                     |
| ------ | :-------: | --------------------------------------------------------------- |
| `addr` | `address` | The address of the follower whose following count is requested. |

#### Returns

| Name |   Type    | Description                                       |
| ---- | :-------: | ------------------------------------------------- |
| `0`  | `uint256` | The number of addresses that `addr` is following. |

<br/>

### getFollowersByIndex

:::note References

- Specification details: [**LSP-26-FollowerSystem**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-26-FollowerSystem.md#getfollowersbyindex)
- Solidity implementation: [`ILSP26FollowerSystem.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp26-contracts/contracts/ILSP26FollowerSystem.sol)
- Function signature: `getFollowersByIndex(address,uint256,uint256)`
- Function selector: `0xb2a8d069`

:::

```solidity
function getFollowersByIndex(
  address addr,
  uint256 startIndex,
  uint256 endIndex
) external view returns (address[]);
```

_Get the list of addresses that follow an address within a specified range._

#### Parameters

| Name         |   Type    | Description                                |
| ------------ | :-------: | ------------------------------------------ |
| `addr`       | `address` | The address whose followers are requested. |
| `startIndex` | `uint256` | The start index of the range (inclusive).  |
| `endIndex`   | `uint256` | The end index of the range (exclusive).    |

#### Returns

| Name |    Type     | Description                                            |
| ---- | :---------: | ------------------------------------------------------ |
| `0`  | `address[]` | An array of addresses that are following an addresses. |

<br/>

### getFollowsByIndex

:::note References

- Specification details: [**LSP-26-FollowerSystem**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-26-FollowerSystem.md#getfollowsbyindex)
- Solidity implementation: [`ILSP26FollowerSystem.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp26-contracts/contracts/ILSP26FollowerSystem.sol)
- Function signature: `getFollowsByIndex(address,uint256,uint256)`
- Function selector: `0x5a39c581`

:::

```solidity
function getFollowsByIndex(
  address addr,
  uint256 startIndex,
  uint256 endIndex
) external view returns (address[]);
```

_Get the list of addresses the given address is following within a specified range._

#### Parameters

| Name         |   Type    | Description                                         |
| ------------ | :-------: | --------------------------------------------------- |
| `addr`       | `address` | The address whose followed addresses are requested. |
| `startIndex` | `uint256` | The start index of the range (inclusive).           |
| `endIndex`   | `uint256` | The end index of the range (exclusive).             |

#### Returns

| Name |    Type     | Description                                          |
| ---- | :---------: | ---------------------------------------------------- |
| `0`  | `address[]` | An array of addresses followed by the given address. |

<br/>

### isFollowing

:::note References

- Specification details: [**LSP-26-FollowerSystem**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-26-FollowerSystem.md#isfollowing)
- Solidity implementation: [`ILSP26FollowerSystem.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp26-contracts/contracts/ILSP26FollowerSystem.sol)
- Function signature: `isFollowing(address,address)`
- Function selector: `0x99ec3a42`

:::

```solidity
function isFollowing(
  address follower,
  address addr
) external view returns (bool);
```

_Check if an address is following a specific address._

#### Parameters

| Name       |   Type    | Description                           |
| ---------- | :-------: | ------------------------------------- |
| `follower` | `address` | The address of the follower to check. |
| `addr`     | `address` | The address being followed.           |

#### Returns

| Name |  Type  | Description                                              |
| ---- | :----: | -------------------------------------------------------- |
| `0`  | `bool` | True if `follower` is following `addr`, false otherwise. |

<br/>

### unfollow

:::note References

- Specification details: [**LSP-26-FollowerSystem**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-26-FollowerSystem.md#unfollow)
- Solidity implementation: [`ILSP26FollowerSystem.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp26-contracts/contracts/ILSP26FollowerSystem.sol)
- Function signature: `unfollow(address)`
- Function selector: `0x015a4ead`

:::

```solidity
function unfollow(address addr) external nonpayable;
```

_Unfollow a specific address._

<blockquote>

**Emitted events:**

- [`Unfollow`](#unfollow) event when unfollowing an address.

</blockquote>

#### Parameters

| Name   |   Type    | Description                    |
| ------ | :-------: | ------------------------------ |
| `addr` | `address` | The address to stop following. |

<br/>

### unfollowBatch

:::note References

- Specification details: [**LSP-26-FollowerSystem**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-26-FollowerSystem.md#unfollowbatch)
- Solidity implementation: [`ILSP26FollowerSystem.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp26-contracts/contracts/ILSP26FollowerSystem.sol)
- Function signature: `unfollowBatch(address[])`
- Function selector: `0x8dd1e47e`

:::

```solidity
function unfollowBatch(address[] addresses) external nonpayable;
```

_Unfollow a list of addresses._

<blockquote>

**Emitted events:**

- [`Follow`](#follow) event when unfollowing each address in the list.

</blockquote>

#### Parameters

| Name        |    Type     | Description                        |
| ----------- | :---------: | ---------------------------------- |
| `addresses` | `address[]` | The list of addresses to unfollow. |

<br/>

## Events

### Follow

:::note References

- Specification details: [**LSP-26-FollowerSystem**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-26-FollowerSystem.md#follow)
- Solidity implementation: [`ILSP26FollowerSystem.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp26-contracts/contracts/ILSP26FollowerSystem.sol)
- Event signature: `Follow(address,address)`
- Event topic hash: `0xbccc71dc7842b86291138666aa18e133ee6d41aa71e6d7c650debad1a0576635`

:::

```solidity
event Follow(address follower, address addr);
```

_Emitted when following an address._

#### Parameters

| Name       |   Type    | Description                                |
| ---------- | :-------: | ------------------------------------------ |
| `follower` | `address` | The address that follows `addr`            |
| `addr`     | `address` | The address that is followed by `follower` |

<br/>

### Unfollow

:::note References

- Specification details: [**LSP-26-FollowerSystem**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-26-FollowerSystem.md#unfollow)
- Solidity implementation: [`ILSP26FollowerSystem.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp26-contracts/contracts/ILSP26FollowerSystem.sol)
- Event signature: `Unfollow(address,address)`
- Event topic hash: `0x083700fd0d85112c9d8c5823585c7542e8fadb693c9902e5bc590ab367f7a15e`

:::

```solidity
event Unfollow(address unfollower, address addr);
```

_Emitted when unfollowing an address._

#### Parameters

| Name         |   Type    | Description                                  |
| ------------ | :-------: | -------------------------------------------- |
| `unfollower` | `address` | The address that unfollows `addr`            |
| `addr`       | `address` | The address that is unfollowed by `follower` |

<br/>
