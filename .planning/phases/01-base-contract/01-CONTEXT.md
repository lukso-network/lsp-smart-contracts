# Phase 1: Base Contract - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

AccessControlExtended base contract in the LSP7 package — OZ-compatible role management with reverse lookups and auxiliary data storage. Both Abstract and InitAbstract variants. Full Foundry test coverage. Extensions and LSP8 duplication are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Authority Model
- **Dual access path:** Both `owner()` AND addresses with `DEFAULT_ADMIN_ROLE` can grant/revoke roles. Owner has implicit admin access — does NOT rely on being explicitly granted `DEFAULT_ADMIN_ROLE`
- **Ownership transfer:** `DEFAULT_ADMIN_ROLE` auto-transfers on ownership transfer — revoked from previous owner, granted to new owner. Keeps dApp UIs accurate and prevents stale admin access
- **Admin delegation:** `DEFAULT_ADMIN_ROLE` holders CAN grant `DEFAULT_ADMIN_ROLE` to others (full OZ admin hierarchy)
- **Root admin:** `DEFAULT_ADMIN_ROLE` is always a root admin for all roles, even if a role has a custom per-role admin (e.g., `MINT_ADMIN` manages `MINTER_ROLE`, but `DEFAULT_ADMIN_ROLE` can also manage it)
- **Custom role admins:** Extensions can set custom admin roles per extension role via `_setRoleAdmin`
- **Standard OZ revocation:** Owner has implicit access for granting/revoking, but revocation of `DEFAULT_ADMIN_ROLE` from others follows OZ standard rules (must hold the role's admin role)
- **renounceRole:** Claude's discretion on whether to restrict renouncing critical roles

### Reserved Addresses
- **Extension-level handling only:** Base contract has NO special address handling. Each extension decides how to handle address(0) and 0xdEaD
- **Hardcoded bypass in hooks:** Extensions check for reserved addresses before checking roles — these bypasses cannot be revoked
- **Specific addresses:**
  - Burnable: address(0) + 0x0000...dEaD
  - Mintable: address(0)
  - Other extensions: Claude's discretion
- **Granting to reserved addresses:** Claude's discretion on whether to block or allow

### Role Data Edge Cases
- **setRoleData without role:** ALLOWED — data can be set for an account that doesn't hold the role yet (pre-configuration use case before granting)
- **Data on revoke:** Claude's discretion on whether to auto-clear or persist data
- **grantRoleWithData on existing role holder:** Claude's discretion on behavior
- **setRoleData authority:** Same as grantRole — owner, `DEFAULT_ADMIN_ROLE`, or the role's specific admin. No self-service by role holders

### API Naming
- **OZ-aligned naming:** Follow OZ conventions for all function names
- **Extended functions:** `grantRoleWithData(bytes32, address, bytes)`, `setRoleData(bytes32, address, bytes)`, `getRoleData(bytes32, address)`
- **Reverse lookup:** `rolesOf(address)` — concise, matches `balanceOf` convention
- **Event:** `RoleDataChanged(bytes32 indexed role, address indexed account, bytes data)`
- **Error naming:** Claude's discretion on prefix style
- **No revokeRoleWithData:** `revokeRole` is sufficient
- **Event emission for grantRoleWithData:** Claude's discretion on whether to emit both events or a combined event
- **Interface name:** `IAccessControlExtended`

### Role Constants
- **Public constants:** No underscore prefix — `MINTER_ROLE`, `TRANSFER_ROLE`, `UNCAPPED_ROLE` (matches OZ `DEFAULT_ADMIN_ROLE` style)
- **UTF-8 encoded bytes32:** Role values are `bytes32(bytes("Minter"))` not `keccak256("MINTER_ROLE")` — roles decode directly as human-readable strings from `rolesOf()` output
- **DEFAULT_ADMIN_ROLE:** Stays `bytes32(0)` per OZ convention (exception to UTF-8 pattern)

### Interface / ERC-165
- **supportsInterface returns true for all three:** `IAccessControl`, `IAccessControlEnumerable`, `IAccessControlExtended`
- **IAccessControlExtended:** Includes all OZ AccessControl functions + extended functions (rolesOf, grantRoleWithData, setRoleData, getRoleData, RoleDataChanged)

### Claude's Discretion
- renounceRole restriction policy for critical roles
- Whether to block granting roles to reserved addresses (address(0), 0xdEaD)
- Data clearing behavior on role revocation
- grantRoleWithData behavior when role already held
- Error naming prefix convention
- Event emission strategy for grantRoleWithData
- Owner visibility in hasRole for DEFAULT_ADMIN_ROLE
- Reserved address handling in extensions beyond Burnable and Mintable

</decisions>

<specifics>
## Specific Ideas

- Role constant values as UTF-8 bytes32 (`bytes32(bytes("Minter"))`) for direct decoding without off-chain mapping — key DX feature for dApp frontends calling `rolesOf()`
- Owner should always have implicit admin access independent of `DEFAULT_ADMIN_ROLE` being explicitly granted — guards against ownership transfer breaking admin capability
- `DEFAULT_ADMIN_ROLE` auto-transfer on ownership transfer keeps dApp UIs accurate about who has admin rights

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-base-contract*
*Context gathered: 2026-03-03*
