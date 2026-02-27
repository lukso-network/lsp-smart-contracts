# Roadmap: AccessControlExtended

## Overview

This project replaces the custom `LSP7RoleOperators` system with `AccessControlExtended`, a composable OZ-backed role management base contract for LSP7 and LSP8 token extensions. The build progresses from a fully tested base contract in the LSP7 package, through duplication into LSP8, then updates each package's extensions (NonTransferable, CappedBalance, Mintable) to use role-based access control, and finishes with composite contract integration and old code deletion.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Base Contract** - AccessControlExtended implementation with full Foundry test coverage in the LSP7 package
- [ ] **Phase 2: LSP8 Package Duplication** - Copy base contract to lsp8-contracts with adjusted imports
- [ ] **Phase 3: LSP7 Extension Updates** - Update NonTransferable, CappedBalance, and Mintable extensions to use role-based access control
- [ ] **Phase 4: LSP8 Extension Updates** - Mirror LSP7 extension changes for all LSP8 equivalents
- [ ] **Phase 5: Integration and Cleanup** - Composite contract resolution, old code deletion, and full integration tests

## Phase Details

### Phase 1: Base Contract
**Goal**: A fully tested AccessControlExtended base contract exists in the LSP7 package with OZ-compatible role management, reverse lookups, and auxiliary data storage
**Depends on**: Nothing (first phase)
**Requirements**: BASE-01, BASE-02, BASE-03, BASE-04, BASE-05, BASE-06, BASE-07, BASE-08, BASE-09, BASE-10, BASE-11, BASE-12, BASE-13, BASE-14, BASE-15, BASE-16, BASE-17, BASE-18, BASE-19, TEST-01, TEST-02, TEST-03
**Success Criteria** (what must be TRUE):
  1. A developer can grant, revoke, and check roles using OZ-standard function signatures (`grantRole(bytes32, address)`, `hasRole(bytes32, address)`) and the contract compiles under Solidity 0.8.28
  2. A developer can call `getRolesOf(address)` to get all roles for an address, `grantRoleWithData` to atomically grant a role with metadata, and `getRoleData`/`setRoleData` for auxiliary data -- and revoking a role automatically clears its associated data
  3. Both Abstract (constructor) and InitAbstract (proxy) variants exist, the InitAbstract variant reverts on double initialization, and `supportsInterface` returns true for `IAccessControl`, `IAccessControlEnumerable`, and `IAccessControlExtended`
  4. All Foundry tests pass: role grant/revoke/enumerate, reverse lookup, auxiliary data lifecycle, interface detection, and InitAbstract storage safety
**Plans**: TBD

Plans:
- [ ] 01-01: TBD
- [ ] 01-02: TBD

### Phase 2: LSP8 Package Duplication
**Goal**: An identical AccessControlExtended base contract exists in the LSP8 package with LSP8-specific imports, verified by passing the same Foundry tests
**Depends on**: Phase 1
**Requirements**: EXT8-01
**Success Criteria** (what must be TRUE):
  1. All five base contract files (interface, abstract, initabstract, constants, errors) exist in `packages/lsp8-contracts/contracts/extensions/AccessControlExtended/` with correct LSP8 import paths
  2. LSP8 Foundry tests for the base contract pass with identical coverage to the LSP7 base contract tests
**Plans**: TBD

Plans:
- [ ] 02-01: TBD

### Phase 3: LSP7 Extension Updates
**Goal**: LSP7 NonTransferable, CappedBalance, and Mintable extensions use AccessControlExtended role checks instead of owner-only or allowlist gates
**Depends on**: Phase 1
**Requirements**: EXT7-01, EXT7-02, EXT7-03, EXT7-04, EXT7-05, EXT7-06, TEST-04, TEST-05, TEST-06
**Success Criteria** (what must be TRUE):
  1. An address granted `_TRANSFER_ROLE` can transfer tokens on a NonTransferable LSP7 contract; addresses without the role still cannot transfer
  2. An address granted `_UNCAPPED_ROLE` can exceed the per-address balance cap on a CappedBalance LSP7 contract; addresses without the role are still capped
  3. An address granted `_MINTER_ROLE` can mint tokens on a Mintable LSP7 contract; addresses without the role cannot mint (replacing `onlyOwner`)
  4. Both Abstract and InitAbstract variants of each extension compile and pass Foundry tests covering normal restriction enforcement, role-based bypass, and operator-on-behalf-of-owner scenarios
  5. Updated interfaces exist for all modified LSP7 contracts and `LSP7CustomizableToken` compiles with resolved `supportsInterface` and `_beforeTokenTransfer` diamond
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD
- [ ] 03-03: TBD

### Phase 4: LSP8 Extension Updates
**Goal**: LSP8 NonTransferable, CappedBalance, and Mintable extensions use AccessControlExtended role checks, mirroring the LSP7 extension updates
**Depends on**: Phase 2
**Requirements**: EXT8-02, EXT8-03, EXT8-04, EXT8-05, EXT8-06, EXT8-07, TEST-07
**Success Criteria** (what must be TRUE):
  1. An address granted `_TRANSFER_ROLE` can transfer tokens on a NonTransferable LSP8 contract; addresses without the role still cannot transfer
  2. An address granted `_UNCAPPED_ROLE` can exceed the per-address balance cap on a CappedBalance LSP8 contract; addresses without the role are still capped
  3. An address granted `_MINTER_ROLE` can mint tokens on a Mintable LSP8 contract; addresses without the role cannot mint
  4. Both Abstract and InitAbstract variants of each LSP8 extension compile and pass Foundry tests, and composite contracts (if they exist) compile with resolved diamonds
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD
- [ ] 04-03: TBD

### Phase 5: Integration and Cleanup
**Goal**: Old RoleOperators code is deleted, all references removed, and a full integration test suite validates the complete system working end-to-end
**Depends on**: Phase 3, Phase 4
**Requirements**: MIGR-01, MIGR-02, MIGR-03, TEST-08
**Success Criteria** (what must be TRUE):
  1. The `packages/lsp7-contracts/contracts/extensions/LSP7RoleOperators/` directory no longer exists and no file in the codebase imports from it
  2. Any existing tests that previously referenced RoleOperators now use AccessControlExtended and pass
  3. Integration Foundry tests pass for the composite contract with all extensions combined, verifying that role grants, bypasses, and revocations work correctly across NonTransferable + CappedBalance + Mintable in a single deployment
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5
Note: Phase 3 depends on Phase 1 and Phase 4 depends on Phase 2, so 3 and 4 could overlap after their respective dependencies complete.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Base Contract | 0/2 | Not started | - |
| 2. LSP8 Package Duplication | 0/1 | Not started | - |
| 3. LSP7 Extension Updates | 0/3 | Not started | - |
| 4. LSP8 Extension Updates | 0/3 | Not started | - |
| 5. Integration and Cleanup | 0/1 | Not started | - |
