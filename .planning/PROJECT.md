# AccessControlExtended

## What This Is

A role management base contract extending OpenZeppelin's `AccessControlEnumerable` with additional capabilities: role data storage, reverse role lookups (address-to-roles), and auxiliary data per role-address pair. It replaces the existing custom `LSP7RoleOperators` implementation with a battle-tested OZ foundation. Used by LSP7 and LSP8 extension contracts to enable admin bypasses of extension restrictions and privileged functionality.

## Core Value

Provide a standardized, OZ-backed role management system that extensions can inherit to gate privileged actions and bypass restrictions, without requiring each extension to implement its own access control.

## Requirements

### Validated

<!-- Existing capabilities from the codebase that this project builds on. -->

- ✓ LSP7/LSP8 extension architecture (Abstract + InitAbstract dual pattern) — existing
- ✓ Extension composition via multiple inheritance — existing
- ✓ Hook-based validation in `_beforeTokenTransfer` / `_afterTokenTransfer` — existing
- ✓ Modifier-based access control (`onlyOwner`) in extensions — existing
- ✓ Custom error pattern in separate `*Errors.sol` files — existing
- ✓ Constants pattern in separate `*Constants.sol` files — existing
- ✓ Interface pattern in separate `I*.sol` files — existing

### Active

<!-- Current scope. Building toward these. -->

- [ ] AccessControlExtended base contract extending OZ AccessControlEnumerable
- [ ] Grant roles with auxiliary data (data per role-address pair)
- [ ] Reverse role lookup (get all roles assigned to a given address)
- [ ] Get/set extra data alongside a role for a specific address
- [ ] Both Abstract and InitAbstract variants of AccessControlExtended
- [ ] Same contract duplicated in both lsp7-contracts and lsp8-contracts packages
- [ ] LSP7NonTransferable updated to use AccessControlExtended (admin can transfer despite restriction)
- [ ] LSP7CappedBalance updated to use AccessControlExtended (admin can exceed per-address balance cap)
- [ ] LSP7Mintable updated to use AccessControlExtended (admin role for minting)
- [ ] Equivalent LSP8 extensions updated (NonTransferable, CappedBalance, Mintable)
- [ ] Foundry tests for AccessControlExtended base contract
- [ ] Foundry tests for each updated extension (LSP7 + LSP8)
- [ ] Updated interfaces for all modified contracts
- [ ] Delete existing LSP7RoleOperators code entirely

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- LSP1 Universal Receiver notifications on role changes — was in RoleOperators but not needed with OZ AccessControl events
- Batch role operations — keep it simple, OZ AccessControl handles single grants
- New npm package for shared contracts — base contract is duplicated inline in both LSP7 and LSP8 packages
- LSP8RoleOperators equivalent — never existed, not needed since AccessControlExtended covers LSP8 too
- CappedSupply extension integration — not in v1 scope
- Burnable extension integration — not in v1 scope

## Context

- **Existing pattern being replaced:** `LSP7RoleOperators` uses custom `EnumerableSet`-based role management with `_MINT_ROLE`, `_ALLOW_TRANSFER_ROLE`, `_INFINITE_BALANCE_ROLE`. This is being replaced by OZ's `AccessControlEnumerable` with extensions for data storage and reverse lookups.
- **OZ version:** 4.9.3 (from current dependencies)
- **Solidity versions:** LSP7 uses 0.8.28 (via IR, EVM prague), LSP8 uses 0.8.27
- **Extension file structure:** Each extension lives in `extensions/ExtensionName/` with interface, abstract, initabstract, errors, and constants files
- **Role definition:** AccessControlExtended defines no roles itself — each extension defines its own `bytes32` role constants and uses `hasRole()` checks in hooks or modifiers

## Constraints

- **OZ version**: Must use OpenZeppelin 4.9.3 (current dependency) — AccessControlEnumerable API from v4
- **Dual variant**: Every contract needs both Abstract (constructor) and InitAbstract (proxy/initializable) variants
- **Solidity compiler**: LSP7 = 0.8.28, LSP8 = 0.8.27 — contracts must compile under both
- **No new packages**: Base contract duplicated in lsp7-contracts and lsp8-contracts, not a shared package
- **Extension pattern**: Must follow existing `extensions/ExtensionName/` folder structure with interface, abstract, initabstract, errors, constants files

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Extend OZ AccessControlEnumerable (not plain AccessControl) | Need to enumerate role members, not just check membership | — Pending |
| Inline duplicate in both packages (not shared package) | Simpler dependency graph, no new internal package needed | — Pending |
| Delete RoleOperators (not deprecate) | Clean break, no maintenance burden for two role systems | — Pending |
| Generic base with no predefined roles | Extensions define their own roles — more flexible, less coupling | — Pending |
| AccessControlExtended naming (not LSP7AccessControl) | Same contract in both packages, not LSP-specific | — Pending |

---
*Last updated: 2026-02-27 after initialization*
