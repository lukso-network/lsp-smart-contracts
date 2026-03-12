---
phase: 01-base-contract
plan: 01
subsystem: auth
tags: [solidity, access-control, openzeppelin, enumerable-set, erc165, proxy-pattern]

# Dependency graph
requires: []
provides:
  - "IAccessControlExtended interface extending IAccessControlEnumerable"
  - "AccessControlExtendedAbstract constructor-based abstract contract"
  - "AccessControlExtendedInitAbstract proxy/initializable abstract contract"
  - "Custom errors (AccessControlExtendedUnauthorized, AccessControlExtendedCanOnlyRenounceForSelf)"
  - "Interface ID constant (_INTERFACEID_ACCESSCONTROLEXTENDED)"
affects: [02-tests, 03-extensions, 04-lsp8-duplication, 05-migration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "EnumerableSet composition over OZ AccessControl inheritance"
    - "Owner-as-implicit-admin via _checkRole override"
    - "DEFAULT_ADMIN_ROLE as root admin for all roles"
    - "Dual initializer pattern (__init + __init_unchained)"
    - "Automatic DEFAULT_ADMIN_ROLE sync on _transferOwnership"

key-files:
  created:
    - "packages/lsp7-contracts/contracts/extensions/AccessControlExtended/IAccessControlExtended.sol"
    - "packages/lsp7-contracts/contracts/extensions/AccessControlExtended/AccessControlExtendedErrors.sol"
    - "packages/lsp7-contracts/contracts/extensions/AccessControlExtended/AccessControlExtendedConstants.sol"
    - "packages/lsp7-contracts/contracts/extensions/AccessControlExtended/AccessControlExtendedAbstract.sol"
    - "packages/lsp7-contracts/contracts/extensions/AccessControlExtended/AccessControlExtendedInitAbstract.sol"
  modified: []

key-decisions:
  - "Owner bypasses _checkRole completely (simplest, most consistent implicit admin)"
  - "DEFAULT_ADMIN_ROLE holders also bypass _checkRole as root admin for ALL roles"
  - "renounceRole follows OZ standard (allowed for any role including DEFAULT_ADMIN_ROLE)"
  - "setRoleData does NOT revert if account lacks the role (pre-configuration pattern per CONTEXT.md)"
  - "grantRoleWithData updates data silently if role already held (no duplicate RoleGranted)"
  - "_revokeRole auto-clears auxiliary data and emits RoleDataChanged with empty bytes (BASE-09)"
  - "Error prefix uses full AccessControlExtended name for clarity"

patterns-established:
  - "Composition pattern: compose EnumerableSet primitives, implement IAccessControl manually"
  - "Three-tier access in _checkRole: owner > DEFAULT_ADMIN_ROLE > specific role"
  - "Natspec style: @inheritdoc for interface implementations, section separators"

requirements-completed: [BASE-01, BASE-02, BASE-03, BASE-04, BASE-05, BASE-06, BASE-07, BASE-08, BASE-09, BASE-10, BASE-11, BASE-12, BASE-13, BASE-14, BASE-15, BASE-16, BASE-17, BASE-18, BASE-19]

# Metrics
duration: 5min
completed: 2026-03-03
---

# Phase 1 Plan 1: Base Contract Summary

**OZ-compatible AccessControlExtended with EnumerableSet composition, reverse lookups, auxiliary data, and dual owner/DEFAULT_ADMIN_ROLE bypass -- both constructor and proxy variants**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-03T14:03:00Z
- **Completed:** 2026-03-03T14:07:48Z
- **Tasks:** 3
- **Files created:** 5

## Accomplishments
- Complete IAccessControlExtended interface extending IAccessControlEnumerable with rolesOf, grantRoleWithData, setRoleData, getRoleData, RoleDataChanged
- Full AccessControlExtendedAbstract implementing OZ-compatible role management via EnumerableSet composition (no OZ AccessControl inheritance to avoid ERC165 diamond)
- Proxy-compatible AccessControlExtendedInitAbstract mirroring Abstract with onlyInitializing guard
- Three-tier _checkRole: owner implicit admin > DEFAULT_ADMIN_ROLE root admin > specific role holder
- Automatic DEFAULT_ADMIN_ROLE sync on _transferOwnership

## Task Commits

Each task was committed atomically:

1. **Task 1: Create IAccessControlExtended interface, errors, and constants** - `168ee6fb` (feat)
2. **Task 2: Create AccessControlExtendedAbstract (constructor-based variant)** - `8937a821` (feat)
3. **Task 3: Create AccessControlExtendedInitAbstract (proxy/initializable variant)** - `44baa911` (feat)

## Files Created/Modified
- `packages/lsp7-contracts/contracts/extensions/AccessControlExtended/IAccessControlExtended.sol` - Interface extending IAccessControlEnumerable with rolesOf, grantRoleWithData, setRoleData, getRoleData, RoleDataChanged
- `packages/lsp7-contracts/contracts/extensions/AccessControlExtended/AccessControlExtendedErrors.sol` - Custom errors: AccessControlExtendedUnauthorized, AccessControlExtendedCanOnlyRenounceForSelf
- `packages/lsp7-contracts/contracts/extensions/AccessControlExtended/AccessControlExtendedConstants.sol` - Interface ID constant _INTERFACEID_ACCESSCONTROLEXTENDED
- `packages/lsp7-contracts/contracts/extensions/AccessControlExtended/AccessControlExtendedAbstract.sol` - Constructor-based abstract implementing full AccessControlExtended logic with LSP7DigitalAsset inheritance
- `packages/lsp7-contracts/contracts/extensions/AccessControlExtended/AccessControlExtendedInitAbstract.sol` - Proxy/initializable abstract with LSP7DigitalAssetInitAbstract inheritance

## Decisions Made
- **Owner bypasses _checkRole completely:** Simplest and most consistent approach. Owner is the most privileged entity. If finer control is needed, transfer ownership to a contract with more nuanced logic.
- **DEFAULT_ADMIN_ROLE as root admin:** Holders bypass _checkRole for ALL roles, even those with custom per-role admins. This matches the locked CONTEXT.md decision.
- **renounceRole unrestricted:** Follows OZ standard -- any role can be renounced including DEFAULT_ADMIN_ROLE. Safe because owner always has implicit admin via _checkRole.
- **setRoleData pre-configuration:** Does NOT revert if account lacks the role, per locked CONTEXT.md decision.
- **grantRoleWithData on existing holder:** Updates data silently, does NOT emit duplicate RoleGranted (OZ _grantRole skips if role exists).
- **Auto-clear data on revoke:** _revokeRole deletes auxiliary data and emits RoleDataChanged with empty bytes (BASE-09).
- **Error naming:** Full `AccessControlExtended` prefix for clarity, matching `LSP7RoleOperators` prefix convention.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **Pre-existing build issue:** LSP7CustomizableToken.sol and LSP7CustomizableTokenInit.sol import deleted LSP7Burnable.sol files, causing full forge build to fail. This is unrelated to AccessControlExtended changes. Worked around by using `--skip '*/LSP7CustomizableToken*'` flag during verification. This is a pre-existing issue in the repo.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All five AccessControlExtended files compile cleanly
- Ready for Plan 02 (Foundry tests) to verify behavior
- Ready for Phase 2 (Extensions) to inherit AccessControlExtendedAbstract
- No blockers

## Self-Check: PASSED

All 5 created files verified present on disk. All 3 task commits verified in git history.

---
*Phase: 01-base-contract*
*Completed: 2026-03-03*
