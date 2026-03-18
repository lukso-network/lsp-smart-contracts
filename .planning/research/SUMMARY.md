# Project Research Summary

**Project:** AccessControlExtended
**Domain:** Solidity role-based access control extension for LSP7/LSP8 token contracts
**Researched:** 2026-02-27
**Confidence:** HIGH

## Executive Summary

AccessControlExtended is a new base contract that replaces the existing `LSP7RoleOperators` and `LSP7Allowlist` systems with a composable, OZ-compatible role management layer for LSP7 and LSP8 token extensions. Rather than inheriting from OpenZeppelin's `AccessControlEnumerable` directly (which creates an unresolvable ERC165 diamond conflict with the LSP7/LSP8 inheritance chain), the contract composes OZ's `EnumerableSet` primitives into a standalone abstract that mirrors the OZ `AccessControlEnumerable` API surface. This approach is validated by the existing codebase: `LSP7RoleOperators` already proves the composing-from-primitives pattern works in this inheritance chain. The net result is that three LSP7 extensions (NonTransferable, CappedBalance, Mintable) and their LSP8 equivalents gain fine-grained, per-role bypass logic where a flat allowlist or single-owner gate previously existed.

The recommended implementation uses three storage mappings: a forward role-to-members set (matching OZ), a reverse address-to-roles set (unique to this contract), and a per-role-per-address auxiliary bytes mapping for arbitrary metadata. These mappings are direct ports from `LSP7RoleOperatorsAbstract`, which already implemented and tested all three patterns. The public API adopts OZ naming conventions (`grantRole`, `revokeRole`, `hasRole(bytes32, address)`) rather than the existing custom naming, and extends it with `grantRoleWithData`, `getRolesOf`, `setRoleData`, and `getRoleData`. No new npm dependencies are required — everything uses the already-installed `@openzeppelin/contracts` v4.9.6.

The most critical risks are all design-time decisions that must be locked in before any code is written: the `hasRole` parameter order reversal (old code has `(address, bytes32)`, OZ standard is `(bytes32, address)`), the `supportsInterface` diamond collision between OZ AccessControl and LSP7's ERC165 chain, and the dual-authority confusion between `onlyOwner` and `DEFAULT_ADMIN_ROLE`. Each of these is a blocking issue if deferred: parameter order causes silent call-site failures, interface collision prevents compilation, and the authority gap can brick role management after an ownership transfer. All three must be resolved in Phase 1 before extension integration begins.

## Key Findings

### Recommended Stack

The project must stay on OpenZeppelin Contracts v4.9.6 (already installed). Upgrading to v5.x would break the entire monorepo: `_grantRole`/`_revokeRole` return types change from `void` to `bool`, error handling switches from string messages to custom errors, import paths change, and minimum Solidity changes to ^0.8.24. None of these are acceptable breaking changes in scope. All new contracts use `pragma ^0.8.27`, matching the existing LSP7 and LSP8 Foundry profiles. No new packages are added.

**Core technologies:**
- `EnumerableSet.AddressSet` (OZ 4.9.6): role-to-members forward index — already used by LSP7RoleOperators and LSP7Allowlist; battle-tested
- `EnumerableSet.Bytes32Set` (OZ 4.9.6): address-to-roles reverse index — already used by LSP7RoleOperators; zero new dependencies
- `AccessControlEnumerableUpgradeable` (OZ 4.9.6): base for InitAbstract variant only — provides storage gaps required for safe proxy upgrades
- Foundry (forge): testing — already the project test framework with lsp7 and lsp8 profiles configured
- Solidity ^0.8.27: pragma — compatible with OZ 4.9.6 and Prague EVM target

### Expected Features

The feature set splits cleanly into inherited OZ table stakes and three unique differentiators that justify building a custom extension rather than using OZ directly.

**Must have (table stakes):**
- `grantRole(bytes32, address)` / `revokeRole(bytes32, address)` — core RBAC; OZ convention
- `hasRole(bytes32, address)` — primary consumption point for all downstream extension hooks and modifiers
- `getRoleMember(bytes32, uint256)` / `getRoleMemberCount(bytes32)` — forward enumeration; required for admin tooling
- `renounceRole(bytes32, address)` — OZ safety mechanism for compromise recovery
- `onlyRole(bytes32)` modifier — declarative access gate for mint() and similar functions
- `DEFAULT_ADMIN_ROLE` granted to owner in constructor/initializer — maps owner into OZ authority model
- Dual Abstract and InitAbstract variants — every contract in the repo has both; required convention
- Both `RoleGranted` and `RoleRevoked` OZ-standard events — replace custom `RoleOperatorChanged`
- ERC-165 support for `IAccessControl` and `IAccessControlEnumerable` interface IDs

**Should have (differentiators — the actual value of building this):**
- `getRolesOf(address)` — reverse lookup; not in OZ; required for on-chain role introspection
- `setRoleData(bytes32, address, bytes)` / `getRoleData(bytes32, address)` — arbitrary per-role-per-address metadata; not in OZ; enables extension-specific configuration (balance caps, expiry, limits) without separate storage contracts
- `grantRoleWithData(bytes32, address, bytes)` — atomic grant + data in one transaction; eliminates the two-step window where a role exists without its configuration
- Automatic data cleanup on revocation — `_revokeRole` override clears auxiliary data and emits `RoleDataChanged`
- `RoleDataChanged` event — separates data mutations from role membership changes for off-chain indexers

**Defer (v2+):**
- Paginated reverse lookup `getRolesOfByIndex(address, start, end)` — useful for addresses with many roles, but gas impact is acceptable for v1
- `AccessControlDefaultAdminRules` integration — 2-step admin transfer; defer until security audit requests it
- CappedSupply and Burnable extension integration — explicitly out of v1 scope
- Shared AccessControlExtended package extraction — the inline-duplicate pattern is the project constraint; revisit only if divergence proves unmanageable

**Anti-features (explicitly excluded):**
- Batch role operations — out of scope; use multicall wrappers
- LSP1 Universal Receiver notifications on role changes — adds gas overhead and reentrancy vectors; OZ events are sufficient
- Pre-defined roles in the base contract — base must be generic; extensions define their own role constants
- Role expiration / time-based roles — encode expiry in auxiliary data if needed

### Architecture Approach

AccessControlExtended sits between the OZ AccessControlEnumerable foundation and the existing LSP7/LSP8 extension contracts. It replaces the Allowlist layer entirely: extensions that previously inherited `LSP7AllowlistAbstract` now inherit `AccessControlExtendedAbstract` instead. The Allowlist contracts remain for backward compatibility of other consumers but are no longer used by the three target extensions. The critical architectural choice is composition over inheritance: AccessControlExtended does NOT inherit from OZ `AccessControlEnumerable` because doing so creates an ERC165 diamond conflict with the LSP7/LSP8 chain. Instead it composes `EnumerableSet` primitives directly, mirrors the OZ API, and explicitly overrides `supportsInterface` to chain both LSP7's and AccessControl's interface checks.

**Major components:**
1. `AccessControlExtendedAbstract` / `AccessControlExtendedInitAbstract` — base role storage, OZ-compatible API, reverse index, auxiliary data; the single source of truth for all role operations
2. `IAccessControlExtended` — interface extending `IAccessControlEnumerable` with `getRolesOf`, `setRoleData`, `getRoleData`, `grantRoleWithData`; enables standard OZ tooling to detect the contract plus discover extended capabilities
3. `AccessControlExtendedConstants.sol` — centralized `bytes32` role constants (`_MINTER_ROLE`, `_TRANSFER_ROLE`, `_UNCAPPED_ROLE`); extensions import from here rather than defining their own
4. `AccessControlExtendedErrors.sol` — custom errors matching existing codebase convention
5. Updated extension abstracts (LSP7NonTransferable, LSP7CappedBalance, LSP7Mintable and LSP8 equivalents) — replace allowlist/owner checks with `hasRole()` checks in `_beforeTokenTransfer` hooks and function modifiers

The build order is strictly: constants and errors first (no dependencies), then the interface, then the base abstracts, then the LSP8 copies, then extension updates, then composite contract updates, then deletion of the old RoleOperators directory.

### Critical Pitfalls

1. **`hasRole` parameter order reversal** — OZ standard is `(bytes32 role, address account)`, existing code has `(address operator, bytes32 role)`. Silent call-site failures if not caught. Prevention: adopt OZ signature exclusively, delete `ILSP7RoleOperators`, add selector-matching tests. Must be resolved in Phase 1.

2. **`supportsInterface` diamond collision** — OZ `AccessControl` and the LSP7/LSP8 chain each define `supportsInterface` independently. Compiler will error; but solving it incorrectly causes silent ERC165 failures. Prevention: explicit `override(AccessControlEnumerable, LSP7DigitalAsset)` with chained return, plus explicit interface-ID tests for `IAccessControl`, `IAccessControlEnumerable`, and `ILSP7`. Must be resolved in Phase 1.

3. **Dual authority model (`onlyOwner` vs `DEFAULT_ADMIN_ROLE`)** — the contract owner is NOT automatically the `DEFAULT_ADMIN_ROLE` holder; after an ownership transfer the new owner cannot manage roles unless `DEFAULT_ADMIN_ROLE` is also transferred. Prevention: grant `DEFAULT_ADMIN_ROLE` to owner in constructor/initializer; override `_transferOwnership` or document the requirement explicitly; test the full lifecycle (deploy, transfer ownership, grant roles). Must be designed in Phase 1.

4. **InitAbstract storage layout corruption** — using the non-upgradeable `AccessControlEnumerable` in proxy deployments means no storage gaps, risking slot collisions on upgrades. Prevention: use `AccessControlEnumerableUpgradeable` for the InitAbstract variant, call `__AccessControlEnumerable_init()`, add `uint256[50] private __gap`. Must be addressed in Phase 1.

5. **`_beforeTokenTransfer` hook role check on wrong address** — in LSP7, `from` is the token owner, not `msg.sender` (which may be an operator). The existing pattern checks `from` (address property, not caller property). Prevention: explicitly document that roles are address properties, maintain the `from`/`to` check pattern, add dedicated operator-on-behalf-of-owner test scenarios. Decide in Phase 1, test in Phase 2.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Base Contract Foundation

**Rationale:** All five critical pitfalls require design decisions before any extension code is written. The base contract has no dependencies on extensions; extensions all depend on it. Getting this wrong means rewriting extension code.

**Delivers:** `IAccessControlExtended`, `AccessControlExtendedAbstract`, `AccessControlExtendedInitAbstract`, `AccessControlExtendedConstants.sol`, `AccessControlExtendedErrors.sol` in the LSP7 package. Foundry tests for the base contract in isolation: role grant, revoke, reverse lookup, auxiliary data, `supportsInterface`, double-initialization revert, data cleanup on revocation, ownership transfer lifecycle.

**Addresses:** Table stakes features (grant, revoke, hasRole, enumerate, onlyRole, events, ERC-165), differentiators (reverse lookup, auxiliary data, atomic grant-with-data, data cleanup), dual variant convention.

**Avoids:** Pitfalls 1 (parameter order), 2 (supportsInterface diamond), 3 (dual authority), 4 (storage layout), 8 (initializer double-call).

### Phase 2: LSP8 Package Copy

**Rationale:** The project constraint requires the base contract to be duplicated in both packages. Doing this immediately after Phase 1 (before extension updates) keeps the copy operation simple: no extension-specific logic to port yet. Phase 3 and 4 then build on both copies in parallel.

**Delivers:** Identical copy of all 5 Phase 1 files in `packages/lsp8-contracts/contracts/extensions/AccessControlExtended/`, with import paths adjusted for `LSP8IdentifiableDigitalAsset`. LSP8 Foundry tests for the base contract. CI diff check script established to prevent future drift (Pitfall 7 mitigation).

**Uses:** Same OZ 4.9.6 stack as Phase 1.

**Implements:** Extension file structure pattern (Pattern 5 from ARCHITECTURE.md).

### Phase 3: LSP7 Extension Updates

**Rationale:** Extensions have a direct dependency on the base contract (Phase 1). All three LSP7 extensions are independent of each other and can be updated in any order, but grouping them in one phase allows the `supportsInterface` diamond in `LSP7CustomizableToken` to be resolved once at the end of the phase rather than incrementally.

**Delivers:** Updated `LSP7NonTransferableAbstract` and `LSP7NonTransferableInitAbstract` (hook-based bypass via `hasRole(_TRANSFER_ROLE, from)`), updated `LSP7CappedBalanceAbstract` and init variant (hook-based bypass via `hasRole(_UNCAPPED_ROLE, to)`), updated `LSP7MintableAbstract` and init variant (`onlyRole(_MINTER_ROLE)` instead of `onlyOwner`). Foundry tests for each updated extension covering normal operation, role bypass, and operator-on-behalf scenarios (Pitfall 5 mitigation).

**Avoids:** Pitfall 5 (hook address semantics), Anti-Pattern 1 (no dual Allowlist + AccessControl inheritance).

### Phase 4: LSP8 Extension Updates

**Rationale:** Same changes as Phase 3 but for LSP8 variants. Grouped separately to allow parallel progress and ensure CI diff check catches any divergence introduced during Phase 3.

**Delivers:** Updated LSP8NonTransferable, LSP8CappedBalance, and LSP8Mintable abstract pairs. Same Foundry tests adapted for LSP8.

### Phase 5: Composite Contract Updates and Cleanup

**Rationale:** `LSP7CustomizableToken` and its init variant inherit from all three updated extensions and must resolve the new diamond (AccessControlExtended + LSP7DigitalAsset + each extension's `_beforeTokenTransfer`). This is the final integration step that exercises all prior phases working together. Old code is deleted only after new code is confirmed working.

**Delivers:** Updated `LSP7CustomizableToken` and `LSP7CustomizableTokenInit` (resolved `supportsInterface` diamond, resolved `_beforeTokenTransfer` diamond using `hasRole` pattern). LSP8 equivalent composite updates if they exist. Deletion of `packages/lsp7-contracts/contracts/extensions/LSP7RoleOperators/` directory and all references. Updated interfaces (`ILSP7NonTransferable`, `ILSP7CappedBalance`, `ILSP7Mintable`) if needed to remove Allowlist references. Full integration Foundry tests covering the complete composite contract.

**Avoids:** Pitfall 2 (supportsInterface resolved in composite), Anti-Pattern 4 (onlyRole used for role-gated functions, onlyOwner reserved for admin functions).

### Phase Ordering Rationale

- **Phases 1-2 before 3-4:** Extension contracts have a compile-time dependency on the base contract. No extension code can be written before the base interface and implementation are finalized.
- **Phase 2 immediately after Phase 1:** Copying before extension logic is added keeps the diff minimal and the CI check easy to establish.
- **Phases 3 and 4 can overlap:** LSP7 and LSP8 extension updates are independent of each other. If parallel implementation is available, they can be done simultaneously.
- **Phase 5 last:** Composite contract resolution requires all extension updates to be complete; old code deletion requires the new code to be verified working.
- **No test phase separation:** Each phase includes its own Foundry tests. Testing is not deferred to a final phase because each phase's pitfalls require test verification before the next phase builds on it.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (supportsInterface override):** The exact `override(...)` specifier list for the composite of OZ AccessControlEnumerable and LSP7DigitalAsset needs to be verified against the actual compiler output. Research or prototype the interface ID calculation for `IAccessControlExtended` to ensure it matches the registered value.
- **Phase 4 (LSP8 composite):** Whether `LSP8CustomizableToken` exists and what its current diamond looks like needs verification against the current LSP8 package state before planning Phase 5 for LSP8.

Phases with standard patterns (skip research-phase):
- **Phase 2 (copy operation):** File copy with import path substitution is mechanical; no new design decisions.
- **Phase 3 hook pattern:** Hook-based bypass (`_beforeTokenTransfer` + `hasRole`) is a proven pattern documented in ARCHITECTURE.md with code examples. No research needed.
- **Phase 5 diamond resolution:** The `supportsInterface` diamond resolution pattern is already established in the existing `LSP7CustomizableToken`. Same pattern applies with AccessControlExtended added to the list.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommendations verified from installed source code in node_modules; no external dependencies added |
| Features | HIGH | Feature set derived from direct codebase reading; OZ API verified from installed contracts; existing LSP7RoleOperators proves the pattern |
| Architecture | HIGH | All conclusions from reading actual source code; inheritance chains traced manually; diamond conflicts confirmed from compiler behavior |
| Pitfalls | HIGH | All critical pitfalls verified from source code line references; not inferred from documentation alone |

**Overall confidence:** HIGH

### Gaps to Address

- **Gas cost benchmarks:** Estimated costs for `grantRole` (~65k), `revokeRole` (~30k), and `hasRole` (~2.6k) are derived from known SSTORE costs but not benchmarked against this specific contract. Run `forge test --gas-report` after Phase 1 to get real numbers and confirm the per-transfer hot path is neutral vs. the Allowlist.
- **EVM Prague opcode compatibility:** OZ 4.9.6 compatibility with the Prague EVM target (configured in foundry.toml) is unverified. Risk is LOW since AccessControlExtended only uses `EnumerableSet` (no assembly, no new opcodes), but this should be verified during Phase 1 compilation.
- **Ownership-to-role sync strategy:** The decision of whether to override `_transferOwnership` to also transfer `DEFAULT_ADMIN_ROLE`, or to document it as a manual step, is a security policy decision that was flagged but not resolved in research. Resolve in Phase 1 design.
- **`renounceRole` policy for critical roles:** Whether to allow unrestricted self-revocation of `_MINTER_ROLE` or `DEFAULT_ADMIN_ROLE` is a policy decision that needs a project call. The existing code allowed self-revocation; OZ allows it; but accidental renunciation of the sole minter is not recoverable.

## Sources

### Primary (HIGH confidence)
- `node_modules/@openzeppelin/contracts/access/AccessControlEnumerable.sol` (v4.9.6) — API surface, inheritance chain, storage patterns
- `node_modules/@openzeppelin/contracts/access/AccessControl.sol` (v4.9.6) — `hasRole` signature, `onlyRole` modifier, `_grantRole`/`_revokeRole` behavior
- `node_modules/@openzeppelin/contracts/access/IAccessControl.sol` (v4.9.6) — interface selector verification
- `node_modules/@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol` (v4.9.6) — storage gaps, `__gap` variable
- `packages/lsp7-contracts/contracts/extensions/LSP7RoleOperators/LSP7RoleOperatorsAbstract.sol` — existing proven pattern for 3-mapping storage, reverse lookup, auxiliary data
- `packages/lsp7-contracts/contracts/extensions/LSP7Allowlist/LSP7AllowlistAbstract.sol` — current bypass mechanism being replaced
- `packages/lsp7-contracts/contracts/extensions/LSP7NonTransferable/LSP7NonTransferableAbstract.sol` — hook pattern to be updated
- `packages/lsp7-contracts/contracts/extensions/LSP7CappedBalance/LSP7CappedBalanceAbstract.sol` — hook pattern to be updated
- `packages/lsp7-contracts/contracts/extensions/LSP7Mintable/LSP7MintableAbstract.sol` — modifier pattern to be updated
- `packages/lsp7-contracts/contracts/LSP7CustomizableToken.sol` — composite diamond resolution reference
- `foundry.toml` — Foundry profiles, Solidity version, EVM target

### Secondary (MEDIUM confidence)
- [OZ v5 release notes](https://www.openzeppelin.com/news/introducing-openzeppelin-contracts-5.0) — v4/v5 breaking change list (used to confirm: do not upgrade)
- [OZ AccessControl docs v4.x](https://docs.openzeppelin.com/contracts/4.x/access-control) — role admin hierarchy documentation
- [OZ AccessControlEnumerable v5 source (GitHub master)](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/extensions/AccessControlEnumerable.sol) — `getRoleMembers()` feature added in v5.1

### Tertiary (LOW confidence)
- Gas cost estimates — derived from known SSTORE costs (~22k new, ~5k update), not benchmarked on this specific contract; needs validation in Phase 1

---
*Research completed: 2026-02-27*
*Ready for roadmap: yes*
