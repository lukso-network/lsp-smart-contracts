# Compatibility ABIs for LS8

This folder contains historical ABIs from previous release versions.

**🧬 Interface ID changes**

- `v0.14.0`: LSP8 interface ID was `0x3a271706`.
- `v0.13.0`: LSP8 interface ID was `0xecad9f75`.
- `v0.12.0`: LSP8 interface ID was `0x30dc5278`.

This is to enable dApps and projects to be backward compatible in their interfaces to display and interact with LSP8 token contracts deployed with these old versions, by consuming their old ABIs.

## List of ABI changes from `0.12.0` to `0.13.0`:

**Events**

- event `AuthorizedOperator` renamed to `OperatorAuthorizationChanged`
- event `RevokedOperator` renamed to `OperatorRevoked`

**Functions**

- new function `batchCalls(bytes[])`.
- new function `getTokenIdData(bytes32)`, `getTokenIdDataBatch(bytes32[])`, `setTokenIdData(bytes32,bytes)` and `setTokenIdDataBatch(bytes32[],bytes[])`.
- `version()` endpoint removed from `0.12.0`.

**Errors**

- new custom errors: `LSP4TokenTypeNotEditable()`, `LSP8BatchCallFailed(uint256)`, `LSP8TokenIdsDataEmptyArray()` and `LSP8TokenIdsDataLengthMismatch()`.
- custom error `LSP8TokenIdTypeNotEditable` renamed to `LSP8TokenIdSchemaNotEditable`

## List of ABI changes from `0.13.0` to `0.14.0`:

- custom error `LSP8TokenIdSchemaNotEditable` renamed to `LSP8TokenIdFormatNotEditable`.
- functions renamed as follow:
  - `getTokenIdData(bytes32)` --> `getDataForTokenId(bytes32)`
  - `getTokenIdDataBatch(bytes32[])` --> `getDataBatchForTokenId(bytes32[])`
  - `setTokenIdData(bytes32,bytes)` --> `setDataForTokenId(bytes32,bytes)`
  - `setTokenIdDataBatch(bytes32[],bytes[])` --> `setDataBatchForTokenId(bytes32[],bytes[])`

## List of ABI changes from `0.14.0` to `latest`:

- removed custom error `LSP8CannotSendToSelf()`.
- new custom errors `LSP8TokenOwnerChanged` and `LSP8RevokeOperatorNotAuthorized`.
