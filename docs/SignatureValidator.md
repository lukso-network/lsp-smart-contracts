# SignatureValidator







*sample contract that implements ERC1271 (Standard Signature Validation Method for Contracts)  used to test the permission ALLOWEDSTANDARDS implementation code taken from: https://eips.ethereum.org/EIPS/eip-1271*

## Methods

### isValidSignature

```solidity
function isValidSignature(bytes32 _hash, bytes _signature) external pure returns (bytes4)
```

Verifies that the signer is the owner of the signing contract.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _hash | bytes32 | undefined
| _signature | bytes | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes4 | undefined

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




