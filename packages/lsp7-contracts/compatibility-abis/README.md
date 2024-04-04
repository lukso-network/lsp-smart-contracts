# Compatibility ABIs for LSP7

This folder contains historical ABIs of LSP7DigitalAsset from previous release versions.

This is to enable dApps and projects to be backward compatible in their interfaces to display and interact with LSP7 token contracts deployed with these old versions, by consuming their old ABIs.

**🧬 Interface ID changes**

- `0.14.0`: LSP7 interface ID was `0xb3c4928f`.
- `0.12.0`: LSP7 interface ID was `0xdaa746b7`.

## List of ABI changes from `0.12.0` to `0.14.0`:

- event `AuthorizedOperator` renamed to `OperatorAuthorizationChanged`
- event `RevokedOperator` renamed to `OperatorRevoked`
- new function `batchCalls(bytes[])` function.
- new custom errors: `LSP4TokenTypeNotEditable()` and `LSP7BatchCallFailed(uint256)`
- `version()` endpoint removed from `0.12.0`

- `0.14.0`: LSP7 interface ID was `0xb3c4928f`.

## List of ABI changes from `0.14.0` to `latest`:

- removed custom error `LSP7CannotSendToSelf()`.
- new custom errors `LSP7DecreaseAllowanceNotAuthorized` and `LSP7RevokeOperatorNotAuthorized`.
- new function parameter `tokenOwner` in functions `decreaseAllowance(...)` and `revokedOperator(...)`
