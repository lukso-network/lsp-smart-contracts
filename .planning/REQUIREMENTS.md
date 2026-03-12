# Requirements: AccessControlExtended

**Defined:** 2026-02-27
**Core Value:** Provide a standardized, OZ-backed role management system that extensions can inherit to gate privileged actions and bypass restrictions

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Base Contract

- [x] **BASE-01**: AccessControlExtended extends OZ AccessControlEnumerable with three storage mappings (forward role-to-members, reverse address-to-roles, auxiliary bytes per role-address)
- [x] **BASE-02**: `grantRole(bytes32, address)` and `revokeRole(bytes32, address)` follow OZ standard parameter order and behavior
- [x] **BASE-03**: `hasRole(bytes32, address)` returns true if account holds the specified role
- [x] **BASE-04**: `getRoleMember(bytes32, uint256)` and `getRoleMemberCount(bytes32)` enumerate members of a role (forward lookup)
- [x] **BASE-05**: `rolesOf(address)` returns all roles assigned to a given address (reverse lookup via Bytes32Set)
- [x] **BASE-06**: `setRoleData(bytes32, address, bytes)` stores arbitrary data for a role-address pair; allows pre-configuration without requiring the account to hold the role; requires admin authority (owner, `DEFAULT_ADMIN_ROLE`, or role's admin)
- [x] **BASE-07**: `getRoleData(bytes32, address)` retrieves auxiliary data for a role-address pair
- [x] **BASE-08**: `grantRoleWithData(bytes32, address, bytes)` atomically grants a role and sets auxiliary data in one transaction
- [x] **BASE-09**: Revoking a role automatically clears associated auxiliary data and emits `RoleDataChanged`
- [x] **BASE-10**: `RoleDataChanged(bytes32 indexed role, address indexed account, bytes data)` event emitted on any data mutation
- [x] **BASE-11**: `renounceRole(bytes32, address)` allows an account to self-revoke a role (OZ standard)
- [x] **BASE-12**: `onlyRole(bytes32)` modifier available for extensions to gate function access
- [x] **BASE-13**: `DEFAULT_ADMIN_ROLE` granted to contract owner in constructor/initializer
- [x] **BASE-14**: `IAccessControlExtended` interface extending `IAccessControlEnumerable` with custom functions, registered via ERC-165
- [x] **BASE-15**: `supportsInterface` correctly returns true for `IAccessControl`, `IAccessControlEnumerable`, and `IAccessControlExtended`
- [x] **BASE-16**: `AccessControlExtendedAbstract` (constructor-based variant) compiles and works with LSP7DigitalAsset inheritance chain
- [x] **BASE-17**: `AccessControlExtendedInitAbstract` (proxy/initializable variant) uses proper storage gaps and `onlyInitializing` modifier
- [x] **BASE-18**: `AccessControlExtendedConstants.sol` defines shared role constants (if any) and interface IDs
- [x] **BASE-19**: `AccessControlExtendedErrors.sol` defines custom errors following codebase convention

### LSP7 Extension Updates

- [ ] **EXT7-01**: LSP7NonTransferable checks `hasRole(_TRANSFER_ROLE, from)` in `_beforeTokenTransfer` to allow role holders to bypass non-transferable restriction
- [ ] **EXT7-02**: LSP7CappedBalance checks `hasRole(_UNCAPPED_ROLE, to)` in `_beforeTokenTransfer` to allow role holders to exceed per-address balance cap
- [ ] **EXT7-03**: LSP7Mintable uses `onlyRole(_MINTER_ROLE)` or `hasRole` check instead of `onlyOwner` for minting
- [ ] **EXT7-04**: Both Abstract and InitAbstract variants updated for each LSP7 extension
- [ ] **EXT7-05**: LSP7CustomizableToken composite contract updated with resolved `supportsInterface` and `_beforeTokenTransfer` diamond
- [ ] **EXT7-06**: Updated interfaces for modified LSP7 extension contracts

### LSP8 Extension Updates

- [ ] **EXT8-01**: AccessControlExtended base contract duplicated in lsp8-contracts package with LSP8-specific imports
- [ ] **EXT8-02**: LSP8NonTransferable checks `hasRole(_TRANSFER_ROLE, from)` in `_beforeTokenTransfer` to allow role holders to bypass non-transferable restriction
- [ ] **EXT8-03**: LSP8CappedBalance checks `hasRole(_UNCAPPED_ROLE, to)` in `_beforeTokenTransfer` to allow role holders to exceed per-address balance cap
- [ ] **EXT8-04**: LSP8Mintable uses `onlyRole(_MINTER_ROLE)` or `hasRole` check instead of `onlyOwner` for minting
- [ ] **EXT8-05**: Both Abstract and InitAbstract variants updated for each LSP8 extension
- [ ] **EXT8-06**: LSP8 composite contract updated (if exists) with resolved diamond
- [ ] **EXT8-07**: Updated interfaces for modified LSP8 extension contracts

### Testing

- [x] **TEST-01**: Foundry tests for AccessControlExtended base contract: grant, revoke, hasRole, enumerate, reverse lookup, auxiliary data, grant-with-data, data cleanup on revoke
- [x] **TEST-02**: Foundry tests for `supportsInterface` returning correct values for all three interface IDs
- [x] **TEST-03**: Foundry tests for InitAbstract variant: initialization, double-initialization revert, storage gap verification
- [ ] **TEST-04**: Foundry tests for LSP7NonTransferable with AccessControlExtended: normal restriction + role bypass
- [ ] **TEST-05**: Foundry tests for LSP7CappedBalance with AccessControlExtended: normal cap enforcement + role bypass
- [ ] **TEST-06**: Foundry tests for LSP7Mintable with AccessControlExtended: role-gated minting
- [ ] **TEST-07**: Foundry tests for LSP8 equivalents of all extension tests
- [ ] **TEST-08**: Integration tests for composite contract with all extensions combined

### Migration

- [ ] **MIGR-01**: Delete `packages/lsp7-contracts/contracts/extensions/LSP7RoleOperators/` directory entirely
- [ ] **MIGR-02**: Remove all imports and references to LSP7RoleOperators from the codebase
- [ ] **MIGR-03**: Update any existing tests that reference RoleOperators to use AccessControlExtended

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Base Contract Enhancements

- **BASE-V2-01**: Paginated reverse lookup `getRolesOfByIndex(address, start, end)` for gas-safe enumeration
- **BASE-V2-02**: `getRoleCountOf(address)` for efficient existence checks before iterating

### Additional Extensions

- **EXT-V2-01**: CappedSupply extension integration with role-based supply cap bypass
- **EXT-V2-02**: Burnable extension integration with role-gated burn permissions
- **EXT-V2-03**: `AccessControlDefaultAdminRules` integration for 2-step admin transfer

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| LSP1 Universal Receiver notifications on role changes | Adds gas overhead and reentrancy vectors; OZ standard events are sufficient |
| Batch role operations (grantRoles, revokeRoles) | Keep it simple; use multicall wrapper if needed |
| Predefined roles in base contract | Base must be generic; extensions define their own role constants |
| Role expiration / time-based roles | Encode expiry in auxiliary data instead; avoids per-hasRole timestamp check overhead |
| Cross-contract role sharing | Requires shared registry; out of scope since base is duplicated per package |
| Role delegation | Fundamentally changes security model; use grant/revoke for permanent access |
| Shared npm package for AccessControlExtended | Base contract duplicated inline; revisit only if drift proves unmanageable |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| BASE-01 | Phase 1 | Complete |
| BASE-02 | Phase 1 | Complete |
| BASE-03 | Phase 1 | Complete |
| BASE-04 | Phase 1 | Complete |
| BASE-05 | Phase 1 | Complete |
| BASE-06 | Phase 1 | Complete |
| BASE-07 | Phase 1 | Complete |
| BASE-08 | Phase 1 | Complete |
| BASE-09 | Phase 1 | Complete |
| BASE-10 | Phase 1 | Complete |
| BASE-11 | Phase 1 | Complete |
| BASE-12 | Phase 1 | Complete |
| BASE-13 | Phase 1 | Complete |
| BASE-14 | Phase 1 | Complete |
| BASE-15 | Phase 1 | Complete |
| BASE-16 | Phase 1 | Complete |
| BASE-17 | Phase 1 | Complete |
| BASE-18 | Phase 1 | Complete |
| BASE-19 | Phase 1 | Complete |
| EXT7-01 | Phase 3 | Pending |
| EXT7-02 | Phase 3 | Pending |
| EXT7-03 | Phase 3 | Pending |
| EXT7-04 | Phase 3 | Pending |
| EXT7-05 | Phase 3 | Pending |
| EXT7-06 | Phase 3 | Pending |
| EXT8-01 | Phase 2 | Pending |
| EXT8-02 | Phase 4 | Pending |
| EXT8-03 | Phase 4 | Pending |
| EXT8-04 | Phase 4 | Pending |
| EXT8-05 | Phase 4 | Pending |
| EXT8-06 | Phase 4 | Pending |
| EXT8-07 | Phase 4 | Pending |
| TEST-01 | Phase 1 | Complete |
| TEST-02 | Phase 1 | Complete |
| TEST-03 | Phase 1 | Complete |
| TEST-04 | Phase 3 | Pending |
| TEST-05 | Phase 3 | Pending |
| TEST-06 | Phase 3 | Pending |
| TEST-07 | Phase 4 | Pending |
| TEST-08 | Phase 5 | Pending |
| MIGR-01 | Phase 5 | Pending |
| MIGR-02 | Phase 5 | Pending |
| MIGR-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 43 total
- Mapped to phases: 43
- Unmapped: 0

---
*Requirements defined: 2026-02-27*
*Last updated: 2026-02-27 after roadmap creation*
