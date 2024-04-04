# Compatibility ABIs for LSP0

This folder contains the historical ABI of LSP0ERC725Account from release `0.12.0`.

This is to enable dApps and projects to be backward compatible in their interfaces to display and interact with LSP0 token contracts deployed with these old versions, by consuming their old ABIs.

## List of ABI changes from `0.12.0` to `latest`:

- `version()` endpoint in `0.12.0`, _vs_ `VERSION()` endpoint in the new releases.

- `Executed` event, where:
  - in `0.12.0`, the `value` parameter was `indexed` ✅ but not the `selector` parameter ❌.
  - in the new releases, the `value` parameter is not `indexed` anymore ❌, but the `selector` is ✅ (other way around).
