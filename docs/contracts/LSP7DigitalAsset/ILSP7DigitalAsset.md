<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->

# ILSP7DigitalAsset

:::info Standard Specifications

[`LSP-7-DigitalAsset`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md)

:::
:::info Solidity implementation

[`ILSP7DigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/ILSP7DigitalAsset.sol)

:::

> Interface of the LSP7

- Digital Asset standard, a fungible digital asset.

## Public Methods

Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.

### authorizeOperator

:::note References

- Specification details: [**LSP-7-DigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md#authorizeoperator)
- Solidity implementation: [`ILSP7DigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/ILSP7DigitalAsset.sol)
- Function signature: `authorizeOperator(address,uint256,bytes)`
- Function selector: `0xb49506fd`

:::

```solidity
function authorizeOperator(
  address operator,
  uint256 amount,
  bytes operatorNotificationData
) external nonpayable;
```

Sets an `amount` of tokens that an `operator` has access from the caller's balance (allowance). See [`authorizedAmountFor`](#authorizedamountfor). Notify the operator based on the LSP1-UniversalReceiver standard

<blockquote>

**Requirements:**

- `operator` cannot be the zero address.

</blockquote>

<blockquote>

**Emitted events:**

- [`OperatorAuthorizationChanged`](#operatorauthorizationchanged) when allowance is given to a new operator or an existing operator's allowance is updated.

</blockquote>

#### Parameters

| Name                       |   Type    | Description                                            |
| -------------------------- | :-------: | ------------------------------------------------------ |
| `operator`                 | `address` | The address to authorize as an operator.               |
| `amount`                   | `uint256` | The allowance amount of tokens operator has access to. |
| `operatorNotificationData` |  `bytes`  | The data to notify the operator about via LSP1.        |

<br/>

### authorizedAmountFor

:::note References

- Specification details: [**LSP-7-DigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md#authorizedamountfor)
- Solidity implementation: [`ILSP7DigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/ILSP7DigitalAsset.sol)
- Function signature: `authorizedAmountFor(address,address)`
- Function selector: `0x65aeaa95`

:::

:::info

If this function is called with the same address for `operator` and `tokenOwner`, it will simply read the `tokenOwner`'s balance (since a tokenOwner is its own operator).

:::

```solidity
function authorizedAmountFor(
  address operator,
  address tokenOwner
) external view returns (uint256);
```

Get the amount of tokens `operator` address has access to from `tokenOwner`. Operators can send and burn tokens on behalf of their owners.

#### Parameters

| Name         |   Type    | Description                                                |
| ------------ | :-------: | ---------------------------------------------------------- |
| `operator`   | `address` | The operator's address to query the authorized amount for. |
| `tokenOwner` | `address` | The token owner that `operator` has allowance on.          |

#### Returns

| Name |   Type    | Description                                                                             |
| ---- | :-------: | --------------------------------------------------------------------------------------- |
| `0`  | `uint256` | The amount of tokens the `operator`'s address has access on the `tokenOwner`'s balance. |

<br/>

### balanceOf

:::note References

- Specification details: [**LSP-7-DigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md#balanceof)
- Solidity implementation: [`ILSP7DigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/ILSP7DigitalAsset.sol)
- Function signature: `balanceOf(address)`
- Function selector: `0x70a08231`

:::

```solidity
function balanceOf(address tokenOwner) external view returns (uint256);
```

Get the number of tokens owned by `tokenOwner`. If the token is divisible (the [`decimals`](#decimals) function returns `18`), the amount returned should be divided by 1e18 to get a better picture of the actual balance of the `tokenOwner`. _Example:_ `balanceOf(someAddress) -> 42_000_000_000_000_000_000 / 1e18 = 42 tokens`

#### Parameters

| Name         |   Type    | Description                                               |
| ------------ | :-------: | --------------------------------------------------------- |
| `tokenOwner` | `address` | The address of the token holder to query the balance for. |

#### Returns

| Name |   Type    | Description                                 |
| ---- | :-------: | ------------------------------------------- |
| `0`  | `uint256` | The amount of tokens owned by `tokenOwner`. |

<br/>

### batchCalls

:::note References

- Specification details: [**LSP-7-DigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md#batchcalls)
- Solidity implementation: [`ILSP7DigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/ILSP7DigitalAsset.sol)
- Function signature: `batchCalls(bytes[])`
- Function selector: `0x6963d438`

:::

```solidity
function batchCalls(bytes[] data) external nonpayable returns (bytes[] results);
```

_Executing the following batch of abi-encoded function calls on the contract: `data`._

Allows a caller to batch different function calls in one call. Perform a `delegatecall` on self, to call different functions with preserving the context.

#### Parameters

| Name   |   Type    | Description                                                          |
| ------ | :-------: | -------------------------------------------------------------------- |
| `data` | `bytes[]` | An array of ABI encoded function calls to be called on the contract. |

#### Returns

| Name      |   Type    | Description                                                      |
| --------- | :-------: | ---------------------------------------------------------------- |
| `results` | `bytes[]` | An array of abi-encoded data returned by the functions executed. |

<br/>

### decimals

:::note References

- Specification details: [**LSP-7-DigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md#decimals)
- Solidity implementation: [`ILSP7DigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/ILSP7DigitalAsset.sol)
- Function signature: `decimals()`
- Function selector: `0x313ce567`

:::

```solidity
function decimals() external view returns (uint8);
```

Returns the number of decimals used to get its user representation. If the asset contract has been set to be non-divisible via the `isNonDivisible_` parameter in the `constructor`, the decimals returned will be `0`. Otherwise `18` is the common value.

#### Returns

| Name |  Type   | Description                                                             |
| ---- | :-----: | ----------------------------------------------------------------------- |
| `0`  | `uint8` | the number of decimals. If `0` is returned, the asset is non-divisible. |

<br/>

### decreaseAllowance

:::note References

- Specification details: [**LSP-7-DigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md#decreaseallowance)
- Solidity implementation: [`ILSP7DigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/ILSP7DigitalAsset.sol)
- Function signature: `decreaseAllowance(address,address,uint256,bytes)`
- Function selector: `0x78381670`

:::

:::info

This function in the LSP7 contract can be used as a prevention mechanism against the double spending allowance vulnerability.

:::

```solidity
function decreaseAllowance(
  address operator,
  address tokenOwner,
  uint256 subtractedAmount,
  bytes operatorNotificationData
) external nonpayable;
```

_Decrease the allowance of `operator` by -`subtractedAmount`_

Atomically decreases the allowance granted to `operator` by the caller. This is an alternative approach to [`authorizeOperator`](#authorizeoperator) that can be used as a mitigation for the double spending allowance problem. Notify the operator based on the LSP1-UniversalReceiver standard

<blockquote>

**Requirements:**

- `operator` cannot be the zero address.
- `operator` must have allowance for the caller of at least `subtractedAmount`.

</blockquote>

<blockquote>

**Emitted events:**

- [`OperatorAuthorizationChanged`](#operatorauthorizationchanged) event indicating the updated allowance after decreasing it.
- [`OperatorRevoked`](#operatorrevoked) event if `subtractedAmount` is the full allowance, indicating `operator` does not have any alauthorizedAmountForlowance left for `msg.sender`.

</blockquote>

#### Parameters

| Name                       |   Type    | Description                                            |
| -------------------------- | :-------: | ------------------------------------------------------ |
| `operator`                 | `address` | The operator to decrease allowance for `msg.sender`    |
| `tokenOwner`               | `address` | The address of the token owner.                        |
| `subtractedAmount`         | `uint256` | The amount to decrease by in the operator's allowance. |
| `operatorNotificationData` |  `bytes`  | -                                                      |

<br/>

### getOperatorsOf

:::note References

- Specification details: [**LSP-7-DigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md#getoperatorsof)
- Solidity implementation: [`ILSP7DigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/ILSP7DigitalAsset.sol)
- Function signature: `getOperatorsOf(address)`
- Function selector: `0xd72fc29a`

:::

```solidity
function getOperatorsOf(address tokenOwner) external view returns (address[]);
```

Returns all `operator` addresses that are allowed to transfer or burn on behalf of `tokenOwner`.

#### Parameters

| Name         |   Type    | Description                               |
| ------------ | :-------: | ----------------------------------------- |
| `tokenOwner` | `address` | The token owner to get the operators for. |

#### Returns

| Name |    Type     | Description                                                                         |
| ---- | :---------: | ----------------------------------------------------------------------------------- |
| `0`  | `address[]` | An array of operators allowed to transfer or burn tokens on behalf of `tokenOwner`. |

<br/>

### increaseAllowance

:::note References

- Specification details: [**LSP-7-DigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md#increaseallowance)
- Solidity implementation: [`ILSP7DigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/ILSP7DigitalAsset.sol)
- Function signature: `increaseAllowance(address,uint256,bytes)`
- Function selector: `0x2bc1da82`

:::

:::info

This function in the LSP7 contract can be used as a prevention mechanism against double spending allowance vulnerability.

:::

```solidity
function increaseAllowance(
  address operator,
  uint256 addedAmount,
  bytes operatorNotificationData
) external nonpayable;
```

_Increase the allowance of `operator` by +`addedAmount`_

Atomically increases the allowance granted to `operator` by the caller. This is an alternative approach to [`authorizeOperator`](#authorizeoperator) that can be used as a mitigation for the double spending allowance problem. Notify the operator based on the LSP1-UniversalReceiver standard

<blockquote>

**Requirements:**

- `operator` cannot be the same address as `msg.sender`
- `operator` cannot be the zero address.

</blockquote>

<blockquote>

**Emitted events:**

- [`OperatorAuthorizationChanged`](#operatorauthorizationchanged) indicating the updated allowance

</blockquote>

#### Parameters

| Name                       |   Type    | Description                                                             |
| -------------------------- | :-------: | ----------------------------------------------------------------------- |
| `operator`                 | `address` | The operator to increase the allowance for `msg.sender`                 |
| `addedAmount`              | `uint256` | The additional amount to add on top of the current operator's allowance |
| `operatorNotificationData` |  `bytes`  | -                                                                       |

<br/>

### revokeOperator

:::note References

- Specification details: [**LSP-7-DigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md#revokeoperator)
- Solidity implementation: [`ILSP7DigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/ILSP7DigitalAsset.sol)
- Function signature: `revokeOperator(address,address,bool,bytes)`
- Function selector: `0x30d0dc37`

:::

```solidity
function revokeOperator(
  address operator,
  address tokenOwner,
  bool notify,
  bytes operatorNotificationData
) external nonpayable;
```

Enables `tokenOwner` to remove `operator` for its tokens, disallowing it to send any amount of tokens on its behalf. This function also allows the `operator` to remove itself if it is the caller of this function

<blockquote>

**Requirements:**

- caller MUST be `operator` or `tokenOwner`
- `operator` cannot be the zero address.

</blockquote>

<blockquote>

**Emitted events:**

- [`OperatorRevoked`](#operatorrevoked) event with address of the operator being revoked for the caller (token holder).

</blockquote>

#### Parameters

| Name                       |   Type    | Description                                               |
| -------------------------- | :-------: | --------------------------------------------------------- |
| `operator`                 | `address` | The address to revoke as an operator.                     |
| `tokenOwner`               | `address` | The address of the token owner.                           |
| `notify`                   |  `bool`   | Boolean indicating whether to notify the operator or not. |
| `operatorNotificationData` |  `bytes`  | The data to notify the operator about via LSP1.           |

<br/>

### totalSupply

:::note References

- Specification details: [**LSP-7-DigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md#totalsupply)
- Solidity implementation: [`ILSP7DigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/ILSP7DigitalAsset.sol)
- Function signature: `totalSupply()`
- Function selector: `0x18160ddd`

:::

```solidity
function totalSupply() external view returns (uint256);
```

Returns the number of existing tokens that have been minted in this contract.

#### Returns

| Name |   Type    | Description                    |
| ---- | :-------: | ------------------------------ |
| `0`  | `uint256` | The number of existing tokens. |

<br/>

### transfer

:::note References

- Specification details: [**LSP-7-DigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md#transfer)
- Solidity implementation: [`ILSP7DigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/ILSP7DigitalAsset.sol)
- Function signature: `transfer(address,address,uint256,bool,bytes)`
- Function selector: `0x760d9bba`

:::

:::info

if the `to` address is a contract that implements LSP1, it will always be notified via its `universalReceiver(...)` function, regardless if `force` is set to `true` or `false`.Note that token transfers revert when no allowance is given, including when the `amount` is `0`. This is to prevent this function from being used maliciously, such as performing zero-value token transfer phishing attacks.

:::

:::tip Hint

The `force` parameter **MUST be set to `true`** to transfer tokens to Externally Owned Accounts (EOAs) or contracts that do not implement the LSP1 Universal Receiver Standard. Otherwise the function will revert making the transfer fail.

:::

:::caution Warning

Be aware that when either the sender or the recipient can have logic that revert in their `universalReceiver(...)` function when being notified. This even if the `force` was set to `true`.

:::

```solidity
function transfer(
  address from,
  address to,
  uint256 amount,
  bool force,
  bytes data
) external nonpayable;
```

Transfers an `amount` of tokens from the `from` address to the `to` address and notify both sender and recipients via the LSP1 [`universalReceiver(...)`](#`universalreceiver) function. If the tokens are transferred by an operator on behalf of a token holder, the allowance for the operator will be decreased by `amount` once the token transfer has been completed (See [`authorizedAmountFor`](#authorizedamountfor)).

<blockquote>

**Requirements:**

- `from` cannot be the zero address.
- `to` cannot be the zero address.
- `from` and `to` cannot be the same address (`from` cannot send tokens to itself).
- `from` MUST have a balance of at least `amount` tokens.
- If the caller is not `from`, it must be an operator for `from` with an allowance of at least `amount` of tokens.

</blockquote>

<blockquote>

**Emitted events:**

- [`Transfer`](#transfer) event when tokens get successfully transferred.
- if the transfer is triggered by an operator, either the [`OperatorAuthorizationChanged`](#operatorauthorizationchanged) event will be emitted with the updated allowance or the [`OperatorRevoked`](#operatorrevoked) event will be emitted if the operator has no more allowance left.

</blockquote>

#### Parameters

| Name     |   Type    | Description                                                                                                                                                          |
| -------- | :-------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `from`   | `address` | The sender address.                                                                                                                                                  |
| `to`     | `address` | The recipient address.                                                                                                                                               |
| `amount` | `uint256` | The amount of tokens to transfer.                                                                                                                                    |
| `force`  |  `bool`   | When set to `true`, the `to` address CAN be any address. When set to `false`, the `to` address MUST be a contract that supports the LSP1 UniversalReceiver standard. |
| `data`   |  `bytes`  | Any additional data the caller wants included in the emitted event, and sent in the hooks of the `from` and `to` addresses.                                          |

<br/>

### transferBatch

:::note References

- Specification details: [**LSP-7-DigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md#transferbatch)
- Solidity implementation: [`ILSP7DigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/ILSP7DigitalAsset.sol)
- Function signature: `transferBatch(address[],address[],uint256[],bool[],bytes[])`
- Function selector: `0x2d7667c9`

:::

:::info

If any transfer in the batch fail or revert, the whole call will revert.

:::

```solidity
function transferBatch(
  address[] from,
  address[] to,
  uint256[] amount,
  bool[] force,
  bytes[] data
) external nonpayable;
```

Same as [`transfer(...)`](#`transfer) but transfer multiple tokens based on the arrays of `from`, `to`, `amount`.

<blockquote>

**Requirements:**

- `from`, `to`, `amount` lists MUST be of the same length.
- no values in `from` can be the zero address.
- no values in `to` can be the zero address.
- each `amount` tokens MUST be owned by `from`.
- for each transfer, if the caller is not `from`, it MUST be an operator for `from` with access to at least `amount` tokens.

</blockquote>

<blockquote>

**Emitted events:**

- [`Transfer`](#transfer) event **for each token transfer**.

</blockquote>

#### Parameters

| Name     |    Type     | Description                                                                                                                                                                             |
| -------- | :---------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `from`   | `address[]` | An array of sending addresses.                                                                                                                                                          |
| `to`     | `address[]` | An array of receiving addresses.                                                                                                                                                        |
| `amount` | `uint256[]` | An array of amount of tokens to transfer for each `from -> to` transfer.                                                                                                                |
| `force`  |  `bool[]`   | For each transfer, when set to `true`, the `to` address CAN be any address. When set to `false`, the `to` address MUST be a contract that supports the LSP1 UniversalReceiver standard. |
| `data`   |  `bytes[]`  | An array of additional data the caller wants included in the emitted event, and sent in the hooks to `from` and `to` addresses.                                                         |

<br/>

## Events

### OperatorAuthorizationChanged

:::note References

- Specification details: [**LSP-7-DigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md#operatorauthorizationchanged)
- Solidity implementation: [`ILSP7DigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/ILSP7DigitalAsset.sol)
- Event signature: `OperatorAuthorizationChanged(address,address,uint256,bytes)`
- Event topic hash: `0xf772a43bfdf4729b196e3fb54a818b91a2ca6c49d10b2e16278752f9f515c25d`

:::

```solidity
event OperatorAuthorizationChanged(
  address indexed operator,
  address indexed tokenOwner,
  uint256 indexed amount,
  bytes operatorNotificationData
);
```

Emitted when `tokenOwner` enables `operator` for `amount` tokens.

#### Parameters

| Name                       |   Type    | Description                                                             |
| -------------------------- | :-------: | ----------------------------------------------------------------------- |
| `operator` **`indexed`**   | `address` | The address authorized as an operator                                   |
| `tokenOwner` **`indexed`** | `address` | The token owner                                                         |
| `amount` **`indexed`**     | `uint256` | The amount of tokens `operator` address has access to from `tokenOwner` |
| `operatorNotificationData` |  `bytes`  | The data to notify the operator about via LSP1.                         |

<br/>

### OperatorRevoked

:::note References

- Specification details: [**LSP-7-DigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md#operatorrevoked)
- Solidity implementation: [`ILSP7DigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/ILSP7DigitalAsset.sol)
- Event signature: `OperatorRevoked(address,address,bool,bytes)`
- Event topic hash: `0x0ebf5762d8855cbe012d2ca42fb33a81175e17c8a8751f8859931ba453bd4167`

:::

```solidity
event OperatorRevoked(
  address indexed operator,
  address indexed tokenOwner,
  bool indexed notified,
  bytes operatorNotificationData
);
```

Emitted when `tokenOwner` disables `operator` for `amount` tokens and set its [`authorizedAmountFor(...)`](#`authorizedamountfor) to `0`.

#### Parameters

| Name                       |   Type    | Description                                                   |
| -------------------------- | :-------: | ------------------------------------------------------------- |
| `operator` **`indexed`**   | `address` | The address revoked from operating                            |
| `tokenOwner` **`indexed`** | `address` | The token owner                                               |
| `notified` **`indexed`**   |  `bool`   | Bool indicating whether the operator has been notified or not |
| `operatorNotificationData` |  `bytes`  | The data to notify the operator about via LSP1.               |

<br/>

### Transfer

:::note References

- Specification details: [**LSP-7-DigitalAsset**](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md#transfer)
- Solidity implementation: [`ILSP7DigitalAsset.sol`](https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages/lsp7-contracts/contracts/ILSP7DigitalAsset.sol)
- Event signature: `Transfer(address,address,address,uint256,bool,bytes)`
- Event topic hash: `0x3997e418d2cef0b3b0e907b1e39605c3f7d32dbd061e82ea5b4a770d46a160a6`

:::

```solidity
event Transfer(
  address indexed operator,
  address indexed from,
  address indexed to,
  uint256 amount,
  bool force,
  bytes data
);
```

Emitted when the `from` transferred successfully `amount` of tokens to `to`.

#### Parameters

| Name                     |   Type    | Description                                                                                                                  |
| ------------------------ | :-------: | ---------------------------------------------------------------------------------------------------------------------------- |
| `operator` **`indexed`** | `address` | The address of the operator that executed the transfer.                                                                      |
| `from` **`indexed`**     | `address` | The address which tokens were sent from (balance decreased by `-amount`).                                                    |
| `to` **`indexed`**       | `address` | The address that received the tokens (balance increased by `+amount`).                                                       |
| `amount`                 | `uint256` | The amount of tokens transferred.                                                                                            |
| `force`                  |  `bool`   | if the transferred enforced the `to` recipient address to be a contract that implements the LSP1 standard or not.            |
| `data`                   |  `bytes`  | Any additional data included by the caller during the transfer, and sent in the LSP1 hooks to the `from` and `to` addresses. |

<br/>
