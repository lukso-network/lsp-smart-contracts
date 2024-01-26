<!-- This file is auto-generated. Do not edit! -->
<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->


# Extension4337

:::info Standard Specifications

[`LSP-17-Extensions`](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-17-Extensions.md)

:::
:::info Solidity implementation

[`Extension4337.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP17Extensions/Extension4337.sol)

:::










## Public Methods


Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.
When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.


### constructor

:::note References

- Specification details: [**LSP-17-Extensions**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-17-Extensions.md#constructor)
- Solidity implementation: [`Extension4337.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP17Extensions/Extension4337.sol)


:::










```solidity
constructor(address entryPoint_);
```










#### Parameters

| Name | Type | Description |
|---|:-:|---|
| `entryPoint_` | `address` | - |


<br/>


### VERSION

:::note References

- Specification details: [**LSP-17-Extensions**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-17-Extensions.md#version)
- Solidity implementation: [`Extension4337.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP17Extensions/Extension4337.sol)
- Function signature: `VERSION()`
- Function selector: `0xffa1ad74`

:::










```solidity
function VERSION() external view returns (string);
```


*Contract version.*










#### Returns

| Name | Type | Description |
|---|:-:|---|
| `0` | `string` | - |
<br/>


### entryPoint

:::note References

- Specification details: [**LSP-17-Extensions**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-17-Extensions.md#entrypoint)
- Solidity implementation: [`Extension4337.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP17Extensions/Extension4337.sol)
- Function signature: `entryPoint()`
- Function selector: `0xb0d691fe`

:::










```solidity
function entryPoint() external view returns (address);
```




Get the address of the Entry Point contract that will execute the user operation.







#### Returns

| Name | Type | Description |
|---|:-:|---|
| `0` | `address` | The address of the EntryPoint contract |
<br/>


### supportsInterface

:::note References

- Specification details: [**LSP-17-Extensions**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-17-Extensions.md#supportsinterface)
- Solidity implementation: [`Extension4337.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP17Extensions/Extension4337.sol)
- Function signature: `supportsInterface(bytes4)`
- Function selector: `0x01ffc9a7`

:::










```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool);
```




See [`IERC165-supportsInterface`](#ierc165-supportsinterface).





#### Parameters

| Name | Type | Description |
|---|:-:|---|
| `interfaceId` | `bytes4` | - |


#### Returns

| Name | Type | Description |
|---|:-:|---|
| `0` | `bool` | - |
<br/>


### validateUserOp

:::note References

- Specification details: [**LSP-17-Extensions**](https://github.com/lukso-network/lips/tree/main/LSPs/LSP-17-Extensions.md#validateuserop)
- Solidity implementation: [`Extension4337.sol`](https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP17Extensions/Extension4337.sol)
- Function signature: `validateUserOp(UserOperation,bytes32,uint256)`
- Function selector: `0xe86fc51e`

:::


:::info

In addition to the logic of the `IAccount` interface from 4337, the permissions of the address that signed the user operation are checked to ensure that it has the permission `_4337_PERMISSION`.

:::








```solidity
function validateUserOp(UserOperation userOp, bytes32 userOpHash, uint256) external nonpayable returns (uint256);
```




Validate user's signature and nonce. The entryPoint will make the call to the recipient only if this validation call returns successfully. Signature failure should be reported by returning `SIG_VALIDATION_FAILED` (`1`). This allows making a "simulation call" without a valid signature. Other failures (_e.g. nonce mismatch, or invalid signature format_) should still revert to signal failure. The third parameter (not mentioned but `missingAccountFunds` from the `IAccount` interface) describes the missing funds on the account's deposit in the entrypoint. This is the minimum amount to transfer to the sender(entryPoint) to be able to make the call. The excess is left as a deposit in the entrypoint, for future calls. Can be withdrawn anytime using "entryPoint.withdrawTo()" In case there is a paymaster in the request (or the current deposit is high enough), this value will be zero.

<blockquote>

**Requirements:**

- caller MUST be the **entrypoint contract**.
- the signature and nonce must be valid.


</blockquote>




#### Parameters

| Name | Type | Description |
|---|:-:|---|
| `userOp` | `UserOperation` | - |
| `userOpHash` | `bytes32` | - |
| `_2` | `uint256` | - |


#### Returns

| Name | Type | Description |
|---|:-:|---|
| `0` | `uint256` | validationData packaged ValidationData structure. use `_packValidationData` and `_unpackValidationData` to encode and decode - `<20-byte>` sigAuthorizer - 0 for valid signature, 1 to mark signature failure, otherwise, an address of an "authorizer" contract. - `<6-byte>` validUntil - last timestamp this operation is valid. 0 for "indefinite" - `<6-byte>` validAfter - first timestamp this operation is valid If an account doesn't use time-range, it is enough to return SIG_VALIDATION_FAILED value (1) for signature failure. Note that the validation code cannot use block.timestamp (or block.number) directly. |
<br/>







## Internal Methods

Any method labeled as `internal` serves as utility function within the contract. They can be used when writing solidity contracts that inherit from this contract. These methods can be extended or modified by overriding their internal behavior to suit specific needs.

Internal functions cannot be called externally, whether from other smart contracts, dApp interfaces, or backend services. Their restricted accessibility ensures that they remain exclusively available within the context of the current contract, promoting controlled and encapsulated usage of these internal utilities.


### _extendableMsgData








```solidity
function _extendableMsgData() internal view returns (bytes);
```




Returns the original `msg.data` passed to the extendable contract
 without the appended `msg.sender` and `msg.value`.







<br/>

### _extendableMsgSender








```solidity
function _extendableMsgSender() internal view returns (address);
```




Returns the original `msg.sender` calling the extendable contract.







<br/>

### _extendableMsgValue








```solidity
function _extendableMsgValue() internal view returns (uint256);
```




Returns the original `msg.value` sent to the extendable contract.







<br/>







