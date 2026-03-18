# Domain Pitfalls

**Domain:** Solidity role-based access control extension for LSP7/LSP8 tokens (AccessControlExtended)
**Researched:** 2026-02-27

## Critical Pitfalls

Mistakes that cause rewrites, security vulnerabilities, or contract bricking.

---

### Pitfall 1: `hasRole` Parameter Order Reversal -- Breaking Interface Compatibility

**What goes wrong:** The existing `ILSP7RoleOperators.hasRole` signature is `hasRole(address operator, bytes32 role)` (address first, role second). OpenZeppelin's `AccessControl.hasRole` signature is `hasRole(bytes32 role, address account)` (role first, address second). If AccessControlExtended inherits from OZ AccessControl, the `hasRole` function signature changes -- breaking the public API for all existing consumers, indexers, and frontends that call `hasRole(address, bytes32)`.

**Why it happens:** The existing RoleOperators interface was designed independently of OZ's conventions. OZ's `hasRole(bytes32, address)` is baked into `IAccessControl` and enforced by the `onlyRole` modifier internally. You cannot change OZ's parameter order without forking the contract.

**Consequences:**
- All existing callers of `hasRole(address, bytes32)` silently get wrong results or revert
- External tools, indexers, and subgraphs break without warning
- If both signatures exist (via overloading), callers can accidentally invoke the wrong one -- a security-critical silent bug

**Prevention:**
- Accept OZ's `hasRole(bytes32, address)` as the canonical signature -- it is the industry standard
- Remove the old `ILSP7RoleOperators` interface entirely (project scope already calls for this)
- If backward compatibility is needed, add a separate view function with a distinct name (e.g., `accountHasRole(address, bytes32)`) rather than overloading `hasRole`
- Add explicit tests asserting the selector matches `IAccessControl.hasRole.selector`

**Detection:** Compile-time: if inheriting both `ILSP7RoleOperators` and `IAccessControl`, the compiler will error on conflicting function signatures. If not inheriting both, the problem is silent -- only caught by integration tests or manual review.

**Confidence:** HIGH (verified from codebase: ILSP7RoleOperators line 73 vs OZ AccessControl line 85)

**Phase:** Must be resolved in Phase 1 (base contract design), before any extension integration begins.

---

### Pitfall 2: `supportsInterface` Diamond Inheritance Collision

**What goes wrong:** The inheritance chain creates a diamond with multiple `supportsInterface` implementations:
- `ERC725Y` inherits `ERC165` (from OZ) and defines `supportsInterface`
- `LSP7DigitalAsset` overrides `supportsInterface` merging `ERC725Y` and `LSP17Extendable`
- `AccessControl` also inherits `ERC165` and defines its own `supportsInterface`
- `AccessControlEnumerable` overrides `supportsInterface` again

When AccessControlExtended inherits from both `LSP7DigitalAsset` (via extension chain) and `AccessControlEnumerable`, the compiler will emit "Derived contract must override function supportsInterface" because multiple unrelated base classes define it. If the override is incorrect, the contract will fail to report `IAccessControl` or `IAccessControlEnumerable` interface support, breaking ERC165 introspection.

**Why it happens:** Solidity's C3 linearization requires explicit disambiguation when the same function is defined in multiple branches of the diamond. Both OZ AccessControl and the LSP7 chain have independent `supportsInterface` implementations that don't know about each other.

**Consequences:**
- Compiler error (best case) -- blocks compilation until resolved
- If resolved incorrectly (e.g., only calling one branch's `super`), the contract silently fails to report interface support for AccessControl or LSP7
- External contracts that check `supportsInterface(type(IAccessControl).interfaceId)` get `false` when they should get `true`

**Prevention:**
- AccessControlExtended MUST explicitly override `supportsInterface` with an `override(LSP7DigitalAsset, AccessControlEnumerable)` specifier (or the full list of conflicting parents)
- The override body must chain both: `return AccessControlEnumerable.supportsInterface(interfaceId) || LSP7DigitalAsset.supportsInterface(interfaceId);` (or use `super` if linearization is set up correctly)
- Write explicit tests: `assertTrue(contract.supportsInterface(type(IAccessControl).interfaceId))` AND `assertTrue(contract.supportsInterface(type(ILSP7).interfaceId))`
- Do the same for `IAccessControlEnumerable` interface ID

**Detection:** Compiler error when inheriting both chains -- this is actually helpful. The danger is solving it incorrectly, which is only caught by interface-specific tests.

**Confidence:** HIGH (verified from source: LSP7DigitalAsset.sol line 216-223, AccessControlEnumerable.sol line 21, AccessControl.sol line 78)

**Phase:** Must be resolved in Phase 1 (base contract design). Every extension that inherits AccessControlExtended inherits this problem.

---

### Pitfall 3: Dual Authority Model -- `onlyOwner` vs `DEFAULT_ADMIN_ROLE` Confusion

**What goes wrong:** The existing LSP7 extensions use `onlyOwner` (from OZ Ownable, inherited via ERC725Y) for privileged operations like `addToAllowlist`, `disableMinting`, `authorizeRoleOperator`. OZ AccessControl introduces a separate authority model: `DEFAULT_ADMIN_ROLE` (bytes32(0)) controls who can `grantRole`/`revokeRole`. These are independent systems: the `owner()` is NOT automatically the `DEFAULT_ADMIN_ROLE` holder, and the `DEFAULT_ADMIN_ROLE` holder is NOT automatically the `owner()`.

**Why it happens:** OZ Ownable and OZ AccessControl are designed as alternatives, not complements. The LSP7 chain already uses Ownable deeply. Adding AccessControl on top creates two independent authority hierarchies that must be kept in sync manually.

**Consequences:**
- The deployer sets `owner` but forgets to grant `DEFAULT_ADMIN_ROLE` -- nobody can ever grant or revoke roles
- Admin grants roles via `grantRole` but forgets that extension management functions still require `onlyOwner`
- Token owner transfers ownership but forgets to transfer `DEFAULT_ADMIN_ROLE` -- new owner cannot manage roles
- If `DEFAULT_ADMIN_ROLE` is renounced, role management is permanently bricked even though `owner()` still exists

**Prevention:**
- In the constructor/initializer of AccessControlExtended, ALWAYS grant `DEFAULT_ADMIN_ROLE` to the same address as `owner()`: `_grantRole(DEFAULT_ADMIN_ROLE, owner())`
- Override `transferOwnership` to also transfer `DEFAULT_ADMIN_ROLE` (or document clearly that they are independent and why)
- Consider overriding `grantRole`/`revokeRole` to use `onlyOwner` instead of `onlyRole(getRoleAdmin(role))` if the project wants single-authority semantics (simpler, matches existing pattern)
- Alternatively, override `_checkRole` to also accept `owner()` as having all roles
- Write tests: deploy, transfer ownership, assert new owner can still grant/revoke roles
- Write tests: renounce DEFAULT_ADMIN_ROLE, assert role management still works via owner (or assert it correctly fails)

**Detection:** Only caught by integration tests that exercise the full lifecycle (deploy, grant roles, transfer ownership, grant more roles). Unit tests that only test initial state will miss this.

**Confidence:** HIGH (verified from codebase: all extensions use `onlyOwner`, OZ AccessControl uses `onlyRole(getRoleAdmin(role))` for grantRole)

**Phase:** Must be designed in Phase 1 (base contract), tested extensively in Phase 2 (integration with extensions).

---

### Pitfall 4: InitAbstract Storage Layout Corruption with AccessControlEnumerable

**What goes wrong:** The InitAbstract (proxy/upgradeable) variant must use `AccessControlEnumerableUpgradeable` (not the regular `AccessControlEnumerable`) because the upgradeable variant includes storage gaps (`uint256[49] private __gap`) that protect the storage layout for future upgrades. Using the non-upgradeable `AccessControlEnumerable` in a proxy pattern means no storage gaps, so any future state variable additions in the base classes will collide with extension storage.

Additionally, `AccessControlEnumerableUpgradeable` uses `EnumerableSetUpgradeable` while the existing LSP7 code uses the non-upgradeable `EnumerableSet`. Mixing these creates two separate set implementations with potentially different storage slot calculations.

**Why it happens:** OZ maintains separate contract packages (`@openzeppelin/contracts` vs `@openzeppelin/contracts-upgradeable`) for this reason. The existing LSP7 codebase uses `@openzeppelin/contracts/utils/structs/EnumerableSet.sol` (non-upgradeable) directly even in InitAbstract variants (see LSP7AllowlistInitAbstract.sol line 12, LSP7RoleOperatorsInitAbstract.sol line 15). This works because those are library contracts with no storage of their own. But AccessControlEnumerable's `_roleMembers` mapping holds storage, and the upgradeable variant includes the critical `__gap`.

**Consequences:**
- Future upgrades to OZ's AccessControl base shift storage slots, corrupting role data
- Without storage gaps, any variable added to the base invalidates all deployed proxies
- Potential for silent data corruption: role checks return wrong results on upgraded contracts

**Prevention:**
- For the Abstract (constructor) variant: use `@openzeppelin/contracts/access/AccessControlEnumerable.sol` -- this is correct
- For the InitAbstract variant: use `@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol`
- Call `__AccessControlEnumerable_init()` in the `__AccessControlExtended_init()` function
- Add storage gaps at the end of AccessControlExtended: `uint256[50] private __gap;`
- Verify with `forge inspect` or `slither-check-upgradeability` that storage layouts are compatible
- Follow the existing pattern: `LSP7AllowlistInitAbstract` inherits `LSP7DigitalAssetInitAbstract`, so `AccessControlExtendedInitAbstract` should inherit from the Upgradeable variant

**Detection:** No compiler error -- this is a silent bug. Only caught by explicit storage layout verification tools or upgrade-testing frameworks.

**Confidence:** HIGH (verified: both packages exist in node_modules, upgradeable variant has `__gap` at line 76 of AccessControlEnumerableUpgradeable.sol)

**Phase:** Must be addressed in Phase 1 (base contract), with storage layout tests added in Phase 2.

---

### Pitfall 5: `_beforeTokenTransfer` Hook Bypass -- Role Check on Wrong Address

**What goes wrong:** The existing NonTransferable extension checks `isAllowlisted(from)` in `_beforeTokenTransfer` -- if the sender is allowlisted, the transfer restriction is bypassed. The plan is to replace `isAllowlisted(from)` with `hasRole(ALLOW_TRANSFER_ROLE, from)`. But in LSP7, the `from` address in `_beforeTokenTransfer` is the token owner, NOT `msg.sender`. When an operator transfers tokens on behalf of an owner, `from` is the owner and `msg.sender` is the operator. If the role check uses `from`, then the TOKEN OWNER needs the role, not the operator performing the transfer. If the role check uses `msg.sender`, then the operator needs the role.

For CappedBalance, the same issue exists: `isAllowlisted(to)` checks the recipient. Should the RECIPIENT have `INFINITE_BALANCE_ROLE`, or should the SENDER/OPERATOR have a bypass role?

**Why it happens:** The hook receives `from` and `to` (the token owner addresses), but the actual caller (`msg.sender`) is not passed to the hook. The existing Allowlist pattern checks `from`/`to` because it maintains an allowlist of addresses (not callers). With AccessControl roles, the semantics become ambiguous: is the role about "who you are" (address identity) or "who initiated this" (caller authority)?

**Consequences:**
- If checking `from`: a role-holding address's tokens can be transferred by ANY operator, even without the operator having the role -- the bypass applies to the address, not the caller
- If checking `msg.sender`: token holders without the role cannot transfer their own tokens even if the operator has the role, which might be the desired behavior but is a semantic change from the current Allowlist
- Inconsistent behavior between minting (where `from` is `address(0)`) and transfers

**Prevention:**
- Explicitly decide and document the semantics: "The ALLOW_TRANSFER_ROLE is an ADDRESS property (the address is exempt from restrictions) not a CALLER property (the caller has permission to bypass)"
- The existing pattern checks `from` (address property) -- maintain this for backward compatibility unless there's a strong reason to change
- For CappedBalance: checking `to` (recipient exemption) is correct and should stay
- Add explicit tests for the operator-on-behalf-of-owner scenario: operator WITH role transferring for owner WITHOUT role, and vice versa
- Document in NatSpec which address the role applies to

**Detection:** Only caught by scenario-specific tests. Standard unit tests that use direct transfers (sender == from) will not reveal the discrepancy.

**Confidence:** HIGH (verified from codebase: LSP7NonTransferableAbstract line 153 checks `from`, LSP7DigitalAsset._transfer line 467 shows `msg.sender` can differ from `from`)

**Phase:** Must be decided in Phase 1 (design), tested in Phase 2 (extension integration). Affects every extension that uses role checks in hooks.

---

## Moderate Pitfalls

### Pitfall 6: Forgetting to Set Role Admins -- Roles Become Ungrantable After Deployment

**What goes wrong:** In OZ AccessControl, every role has an "admin role" that controls who can grant/revoke it. By default, all roles have `DEFAULT_ADMIN_ROLE` (0x00) as their admin. This means only holders of `DEFAULT_ADMIN_ROLE` can grant any role. If `DEFAULT_ADMIN_ROLE` is never granted to anyone (see Pitfall 3), or if a custom admin role is set via `_setRoleAdmin` but nobody holds that admin role, the role becomes permanently ungrantable.

**Prevention:**
- In the constructor/initializer, after granting `DEFAULT_ADMIN_ROLE`, verify that the admin for each custom role (MINT_ROLE, ALLOW_TRANSFER_ROLE, INFINITE_BALANCE_ROLE) is either `DEFAULT_ADMIN_ROLE` (default) or explicitly set to a role that someone holds
- If overriding the admin model to use `onlyOwner` for role management (see Pitfall 3 prevention), this is less of a concern but should still be documented
- Test: deploy, grant each custom role, revoke each custom role -- assert all succeed

**Confidence:** HIGH (OZ documentation explicitly warns about this)

**Phase:** Phase 1 (base contract design), Phase 2 (integration tests).

---

### Pitfall 7: Duplicated AccessControlExtended Contracts Drifting Between LSP7 and LSP8 Packages

**What goes wrong:** The project requires the same AccessControlExtended base contract to be duplicated in both `lsp7-contracts` and `lsp8-contracts` packages (no shared package). Over time, bug fixes or enhancements applied to one copy are forgotten in the other. The two copies diverge silently. Deployed LSP7 tokens have different role behavior than deployed LSP8 tokens.

**Why it happens:** Code duplication without tooling enforcement. The decision to avoid a shared package means the synchronization is manual. Different Solidity compiler versions (LSP7: 0.8.28, LSP8: 0.8.27) may also cause divergence if a feature or bugfix depends on compiler version.

**Prevention:**
- Use a script or CI check that diffs the two copies and fails if they diverge (e.g., `diff packages/lsp7-contracts/contracts/extensions/AccessControlExtended/ packages/lsp8-contracts/contracts/extensions/AccessControlExtended/`)
- Consider a `sync-access-control.sh` script that copies from a canonical source
- When modifying one, always modify both in the same PR
- Compiler version difference (0.8.28 vs 0.8.27): ensure the contract uses only features available in 0.8.27 (the lower version), since it must compile under both. Notably, 0.8.28 introduced some changes but the pragma should be `^0.8.27` to enforce compatibility

**Detection:** Only caught by CI diff checks or manual review discipline. No compiler or test will catch behavioral divergence between packages.

**Confidence:** HIGH (verified constraint from PROJECT.md: "No new packages: Base contract duplicated in lsp7-contracts and lsp8-contracts")

**Phase:** Phase 1 (establish the pattern and CI check), ongoing through all phases.

---

### Pitfall 8: `_grantRole` Calling in Constructor vs Initializer Mismatch

**What goes wrong:** In the Abstract (constructor) variant, initial roles should be granted in the constructor via `_grantRole`. In the InitAbstract variant, initial roles must be granted in the `__AccessControlExtended_init_unchained` function protected by `onlyInitializing`. If the InitAbstract variant accidentally calls `_grantRole` outside of the initializer (e.g., in a function that can be called multiple times), roles can be re-granted after initialization. Conversely, the `_setupRole` function (deprecated in OZ v4.9.3 but still present) should NOT be used -- use `_grantRole` directly.

**Why it happens:** The dual-variant pattern requires manually duplicating logic between constructor and initializer. The existing `LSP7RoleOperatorsInitAbstract` shows the correct pattern (line 51-85) with `onlyInitializing` guards, but it's easy to miss when writing new code.

**Prevention:**
- Follow the existing InitAbstract pattern exactly: `__AccessControlExtended_init()` calls parent init + `__AccessControlExtended_init_unchained()`
- The `_unchained` function has `onlyInitializing` modifier and calls `_grantRole`
- Never use `_setupRole` -- it is deprecated and just calls `_grantRole` anyway
- Write a test that calls the initializer twice and asserts it reverts on the second call

**Detection:** The `onlyInitializing` modifier will revert on double-initialization, but only if the modifier is actually applied. Missing the modifier is the bug, and it is only caught by code review or the specific test.

**Confidence:** HIGH (verified pattern from LSP7RoleOperatorsInitAbstract.sol and AccessControlEnumerableUpgradeable.sol)

**Phase:** Phase 1 (base contract), tested in Phase 2.

---

### Pitfall 9: Context._msgSender() vs raw msg.sender Inconsistency

**What goes wrong:** OZ AccessControl inherits from `Context` and uses `_msgSender()` internally (for `_checkRole`, `renounceRole`, and event emission). The LSP7DigitalAsset code uses raw `msg.sender` everywhere (verified: 15+ uses of `msg.sender` in LSP7DigitalAsset.sol, zero uses of `_msgSender()`). Both `Ownable` and `AccessControl` share `Context` as a base, so `_msgSender()` resolves to the same implementation. In the default `Context` contract, `_msgSender()` simply returns `msg.sender`, so there is no behavioral difference TODAY.

However, if a meta-transaction or GSN forwarder pattern is ever introduced (by overriding `_msgSender()`), the LSP7 code paths would still use raw `msg.sender` while AccessControl code paths would use the overridden `_msgSender()`. This creates split-brain identity: the token considers one address the caller while AccessControl considers a different address.

**Prevention:**
- In AccessControlExtended, consistently use `_msgSender()` if overriding any AccessControl functions
- If the project never plans to support meta-transactions, this is a documentation-only concern -- add a comment noting the inconsistency
- Do NOT override `_msgSender()` without auditing all LSP7 `msg.sender` uses first
- If meta-transaction support is ever added, it must be added to LSP7DigitalAsset simultaneously

**Detection:** No compiler warning. Only caught by code review or a grep for `msg.sender` vs `_msgSender()` usage.

**Confidence:** MEDIUM (the inconsistency is real and verified, but the practical impact requires meta-transaction support which is not in scope)

**Phase:** Phase 1 (document the decision), not blocking.

---

## Minor Pitfalls

### Pitfall 10: EnumerableSet Gas Cost for Reverse Role Lookup

**What goes wrong:** The project requires a reverse lookup: given an address, return all roles assigned to it. This requires maintaining a second `EnumerableSet.Bytes32Set` per address (mapping `address => EnumerableSet.Bytes32Set`), exactly as the existing `_operatorRoles` mapping does. OZ `AccessControlEnumerable` only provides forward lookup (role -> addresses). The reverse lookup adds gas cost to every `_grantRole` and `_revokeRole` call (additional SSTORE operations). For contracts with many role grants, this can become expensive.

**Prevention:**
- Override `_grantRole` and `_revokeRole` in AccessControlExtended to maintain the reverse mapping (same pattern as existing RoleOperators code)
- Accept the gas overhead -- it is the cost of the feature
- Consider whether the reverse lookup is truly needed on-chain, or if it could be derived off-chain from events (reducing gas)
- Benchmark: a single `EnumerableSet.add()` costs ~45,000 gas for a new entry; the reverse mapping doubles this to ~90,000 per grant

**Confidence:** HIGH (verified from existing pattern in LSP7RoleOperatorsAbstract.sol lines 40-48)

**Phase:** Phase 1 (design decision), gas benchmarks in Phase 2.

---

### Pitfall 11: Role Data Storage Not Cleaned on Role Revocation

**What goes wrong:** The project stores auxiliary data per role-address pair (`_roleOperatorData[role][operator]`). When a role is revoked via OZ's `revokeRole`, the standard OZ `_revokeRole` implementation only removes the address from the role's member set. It does NOT clear any auxiliary data stored in custom mappings. If the address is later re-granted the role, stale data from the previous grant persists.

**Why it happens:** OZ AccessControl has no concept of auxiliary data, so its `_revokeRole` cannot clean up custom storage. The existing `LSP7RoleOperatorsAbstract.revokeRoleOperator` (line 102) explicitly clears `_roleOperatorData` on revocation. If AccessControlExtended overrides `_revokeRole` but forgets to clear auxiliary data, the cleanup is lost.

**Prevention:**
- Override `_revokeRole` in AccessControlExtended to also clear `_roleOperatorData[role][account]`
- Emit the `RoleOperatorDataChanged` event (or equivalent) when data is cleared
- Write a test: grant role with data, revoke role, re-grant role, assert data is empty

**Confidence:** HIGH (verified from existing cleanup logic in LSP7RoleOperatorsAbstract.sol line 102-105)

**Phase:** Phase 1 (base contract implementation).

---

### Pitfall 12: `renounceRole` Allows Unsupervised Self-Revocation

**What goes wrong:** OZ AccessControl provides `renounceRole(bytes32 role, address account)` which allows any account to revoke its own role. This is by design (compromise recovery). But in the existing RoleOperators, the equivalent `revokeRoleOperator` requires either `owner()` or self -- and it explicitly prevents removing reserved addresses (`address(0)`, dead address). OZ's `renounceRole` has no such protection: any role holder can renounce without the owner's knowledge.

For critical roles like `MINT_ROLE`, an accidental or malicious `renounceRole` could remove the only minter, with no way to recover if `DEFAULT_ADMIN_ROLE` was also renounced.

**Prevention:**
- If the project needs to prevent self-revocation for certain roles, override `renounceRole` to add restrictions (e.g., revert for critical roles, or require owner approval)
- At minimum, never grant `DEFAULT_ADMIN_ROLE` as the sole holder to a non-secured address
- Consider overriding `renounceRole` to preserve the existing pattern: allow self-revocation for regular roles but protect reserved addresses
- Write tests: `renounceRole` for each role type, verify expected behavior

**Confidence:** HIGH (OZ documentation explicitly warns about DEFAULT_ADMIN_ROLE renunciation)

**Phase:** Phase 1 (decide policy), Phase 2 (implement and test).

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Base contract design (Phase 1) | supportsInterface diamond (#2) | Explicit override with tests for all interface IDs |
| Base contract design (Phase 1) | Dual authority onlyOwner vs DEFAULT_ADMIN_ROLE (#3) | Design authority model upfront, document the decision |
| Base contract design (Phase 1) | hasRole parameter order (#1) | Accept OZ signature, remove old interface |
| Base contract design (Phase 1) | Storage layout for InitAbstract (#4) | Use Upgradeable variants, add storage gaps |
| Extension integration (Phase 2) | Hook address semantics (#5) | Decide from/to vs msg.sender, test operator scenarios |
| Extension integration (Phase 2) | Role admin configuration (#6) | Test full lifecycle: deploy, grant, transfer ownership, grant again |
| Cross-package sync (Phase 2+) | LSP7/LSP8 drift (#7) | CI diff check, canonical source script |
| Test suite (Phase 3) | Operator-on-behalf scenarios (#5) | Dedicated test scenarios for delegated transfers with role holders |
| Test suite (Phase 3) | Double-initialization (#8) | Test that initializer reverts on second call |
| Test suite (Phase 3) | Auxiliary data cleanup (#11) | Test grant-with-data, revoke, re-grant, assert no stale data |

## Sources

- [OpenZeppelin AccessControl v4.9.x source](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/AccessControl.sol) -- HIGH confidence (read from node_modules)
- [OpenZeppelin AccessControlEnumerable v4.9.x source](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/AccessControlEnumerable.sol) -- HIGH confidence (read from node_modules)
- [OpenZeppelin AccessControlEnumerableUpgradeable source](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/master/contracts/access/AccessControlEnumerableUpgradeable.sol) -- HIGH confidence (read from node_modules)
- [OpenZeppelin Access Control documentation](https://docs.openzeppelin.com/contracts/5.x/access-control) -- MEDIUM confidence (v5 docs, project uses v4.9.3)
- [OpenZeppelin AccessControlDefaultAdminRules](https://docs.openzeppelin.com/contracts/4.x/api/access) -- MEDIUM confidence
- [OpenZeppelin Forum: supportsInterface diamond problem](https://forum.openzeppelin.com/t/derived-contract-must-override-function-supportsinterface/6315) -- MEDIUM confidence
- [OZ Issue #3488: _setupRole deprecation](https://github.com/OpenZeppelin/openzeppelin-contracts/issues/3488) -- HIGH confidence
- [OZ Issue #3623: AccessControl Admin Rules](https://github.com/OpenZeppelin/openzeppelin-contracts/issues/3623) -- HIGH confidence
- Codebase analysis: LSP7RoleOperatorsAbstract.sol, LSP7NonTransferableAbstract.sol, LSP7CappedBalanceAbstract.sol, LSP7MintableAbstract.sol, LSP7DigitalAsset.sol, LSP7AllowlistAbstract.sol -- HIGH confidence (direct source read)
