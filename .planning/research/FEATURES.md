# Feature Research

**Domain:** Solidity role-based access control extension for LSP7/LSP8 token contracts
**Researched:** 2026-02-27
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features that any developer consuming AccessControlExtended would assume exist. Missing any of these makes the contract feel incomplete or forces workarounds.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Grant role to address | Core OZ AccessControl behavior; `grantRole(bytes32, address)` is the foundation of RBAC | LOW | Inherited from OZ AccessControlEnumerable -- zero custom code needed. Only `DEFAULT_ADMIN_ROLE` holder (or the role's admin) can grant. |
| Revoke role from address | Complementary to granting; `revokeRole(bytes32, address)` removes permissions | LOW | Inherited from OZ. Same admin constraints as grant. |
| Check role membership | `hasRole(bytes32, address)` is what extensions call in hooks/modifiers to gate behavior | LOW | Inherited from OZ. This is the primary consumption point for downstream extensions like NonTransferable, CappedBalance, Mintable. |
| Enumerate role members (forward lookup) | `getRoleMember(bytes32, uint256)` and `getRoleMemberCount(bytes32)` -- needed for admin dashboards and off-chain tooling to list who has a role | LOW | Inherited from OZ AccessControlEnumerable. Uses `EnumerableSet.AddressSet` per role. Already in OZ, no custom work. |
| Self-revocation (renounce) | `renounceRole(bytes32, address)` -- OZ standard safety mechanism; allows compromised accounts to relinquish their own role | LOW | Inherited from OZ. Existing `LSP7RoleOperators` already supports self-revocation (`msg.sender == operator`). OZ maps this to `renounceRole` which requires `account == _msgSender()`. |
| Role admin hierarchy | `getRoleAdmin(bytes32)` and `_setRoleAdmin(bytes32, bytes32)` -- allows defining which role can manage which other role | LOW | Inherited from OZ. Existing codebase uses `onlyOwner` for all role management. With OZ, `DEFAULT_ADMIN_ROLE` serves this purpose. Extensions can set custom admin roles per role if needed. |
| Event emission on role changes | `RoleGranted`, `RoleRevoked`, `RoleAdminChanged` events for off-chain indexing and transparency | LOW | Inherited from OZ. Replaces the custom `RoleOperatorChanged` event from `LSP7RoleOperators`. |
| ERC-165 interface support | `supportsInterface(bytes4)` for both `IAccessControl` and `IAccessControlEnumerable` | LOW | Inherited from OZ. Critical for on-chain introspection by tooling and other contracts. |
| `onlyRole(bytes32)` modifier | Declarative access gating for functions like `mint()` | LOW | Inherited from OZ. Replaces the current `onlyOwner` pattern on privileged functions. Extensions define their own role constants and use this modifier. |
| Both Abstract and InitAbstract variants | Every contract in the repo has a constructor-based and initializer-based variant for proxy deployments | MEDIUM | Must duplicate the AccessControlExtended contract into both patterns, matching the existing dual-variant convention. OZ provides both `AccessControl` and `AccessControlUpgradeable` for this. |
| Extension-defined role constants | Each extension (NonTransferable, CappedBalance, Mintable) defines its own `bytes32` role constants in a separate `*Constants.sol` file | LOW | Already the pattern in existing code (`_MINT_ROLE`, `_ALLOW_TRANSFER_ROLE`, `_INFINITE_BALANCE_ROLE`). AccessControlExtended itself defines no roles. |
| Role-based bypass in `_beforeTokenTransfer` hooks | Extensions check `hasRole(from/to, SPECIFIC_ROLE)` to skip restriction enforcement | MEDIUM | Replaces the current `isAllowlisted(addr)` pattern. Instead of a flat allowlist, extensions check for specific roles. E.g., NonTransferable checks `hasRole(from, _ALLOW_TRANSFER_ROLE)`, CappedBalance checks `hasRole(to, _INFINITE_BALANCE_ROLE)`. |
| Owner gets DEFAULT_ADMIN_ROLE on deployment | The contract deployer/owner must be granted `DEFAULT_ADMIN_ROLE` so they can manage all roles | LOW | Constructor/initializer must call `_setupRole(DEFAULT_ADMIN_ROLE, owner)`. Maps to how existing code grants the owner all roles in the constructor. |

### Differentiators (Competitive Advantage)

Features that go beyond standard OZ AccessControl and provide the unique value proposition of AccessControlExtended. These are what justify building a custom extension rather than using OZ directly.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Auxiliary data per role-address pair | `setRoleData(bytes32 role, address account, bytes data)` / `getRoleData(bytes32 role, address account)` -- store arbitrary metadata alongside a role grant (e.g., a minter's daily limit, a transferor's expiry timestamp, a balance cap override) | MEDIUM | New mapping: `mapping(bytes32 => mapping(address => bytes)) _roleData`. Not in OZ. Directly ported from `LSP7RoleOperators._roleOperatorData`. Critical differentiator: lets extensions attach context to role assignments without separate storage contracts. |
| Grant role with data atomically | `grantRoleWithData(bytes32 role, address account, bytes data)` -- authorize and set data in a single transaction | LOW | Thin wrapper: call `_grantRole` then set data mapping. Existing `authorizeRoleOperator(role, operator, data)` does exactly this. Avoids two-transaction workflow and the window where a role exists without its expected configuration data. |
| Reverse role lookup (address-to-roles) | `getRolesOf(address account)` -- retrieve all roles assigned to a specific address | MEDIUM | New mapping: `mapping(address => EnumerableSet.Bytes32Set) _accountRoles`. Not in OZ (OZ only has role-to-addresses via AccessControlEnumerable). Must override `_grantRole` and `_revokeRole` to maintain the reverse index. Direct port from `LSP7RoleOperators._operatorRoles`. Valuable for admin UIs and on-chain role introspection. |
| Role count for an address | `getRoleCountOf(address account)` -- how many roles does this address have? | LOW | Trivial: `_accountRoles[account].length()`. Complements reverse lookup. Useful for gas-efficient existence checks before iterating. |
| Data-aware role revocation | When revoking a role, automatically clear associated auxiliary data and emit a data-cleared event | LOW | Override `_revokeRole` to `delete _roleData[role][account]` and emit `RoleDataChanged(role, account, "")`. Prevents stale data from lingering after role removal. Existing `LSP7RoleOperators.revokeRoleOperator` already does this. |
| Custom `RoleDataChanged` event | `event RoleDataChanged(bytes32 indexed role, address indexed account, bytes data)` -- dedicated event for data mutations separate from role grant/revoke events | LOW | Enables off-chain indexers to track data changes independently of role membership changes. Port from existing `RoleOperatorDataChanged` event. |
| Reserved address handling | `address(0)` and `0xdEaD` pre-granted specific roles so that minting (from `address(0)`) and burning (to `address(0)` / `0xdEaD`) bypass restrictions by default | MEDIUM | Existing pattern in both `LSP7AllowlistAbstract` and `LSP7RoleOperatorsAbstract`. Must decide: pre-grant these in the base contract constructor, or let each extension handle it. Recommendation: handle in extensions (NonTransferable, CappedBalance) since role semantics are extension-specific. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems in this context.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Batch role operations (`grantRoles`, `revokeRoles`) | Convenience for initial setup with many roles/addresses | Explicitly out of scope per PROJECT.md. Adds gas complexity for a rarely-used operation. OZ AccessControl handles single grants, and initial setup is typically a constructor/initializer concern, not a recurring operation. Batch operations on storage-heavy sets increase deployment size for minimal benefit. | Call `grantRole` in a loop off-chain or in a multicall wrapper. |
| LSP1 Universal Receiver notifications on role changes | Existing `LSP7RoleOperators` notifies role operators via `universalReceiver` callback | Explicitly out of scope per PROJECT.md. OZ AccessControl already emits `RoleGranted`/`RoleRevoked` events which are indexable. Adding `universalReceiver` calls adds gas overhead (~5-20k per grant/revoke), creates reentrancy vectors, and couples the access control layer to the LUKSO-specific LSP1 protocol. The notification was a nice-to-have, not a necessity. | Rely on OZ's standard `RoleGranted` / `RoleRevoked` events for off-chain indexing. If a contract needs to react to role changes, it can be built as a separate observer. |
| Predefined roles in the base contract | Tempting to define `MINTER_ROLE`, `TRANSFER_BYPASS_ROLE`, etc. in AccessControlExtended itself | Couples the base contract to specific extension semantics. AccessControlExtended should be generic. If it defines `MINTER_ROLE`, it becomes opinionated about what extensions exist. New extensions would need to modify the base. The existing `LSP7RoleOperators` suffered from this: it hard-coded `_MINT_ROLE`, `_ALLOW_TRANSFER_ROLE`, `_INFINITE_BALANCE_ROLE`. | Each extension defines its own role constants in its own `*Constants.sol` file. The base contract only knows about `DEFAULT_ADMIN_ROLE` (from OZ). |
| Role expiration / time-based roles | Roles that automatically expire after a deadline | Significantly increases storage cost (extra `uint256` per role-address pair for expiry). Requires checking timestamps on every `hasRole` call (gas overhead on every transfer). The auxiliary data feature already supports encoding an expiry into role data -- extensions can check `getRoleData` in their hooks if time-bounded roles are needed. | Encode expiry in auxiliary data. Extensions that need time-based roles decode from `getRoleData` and check `block.timestamp` in their specific hooks. |
| Multi-admin role management (quorum/multisig for role grants) | Protect against single-admin key compromise | Massively increases contract complexity. OZ already provides `AccessControlDefaultAdminRules` for 2-step admin transfer (available in v4.9). For multi-admin, this belongs at the wallet/governance layer (e.g., a Gnosis Safe as the `DEFAULT_ADMIN_ROLE` holder), not in the token contract. | Set a multisig address as the `DEFAULT_ADMIN_ROLE` holder. Use OZ `AccessControlDefaultAdminRules` if 2-step admin transfer is desired (separate future work). |
| Cross-contract role sharing | A single role grant applying across multiple contracts (e.g., grant MINTER_ROLE once, works on both LSP7 and LSP8 tokens) | Requires a shared registry contract, adds external call overhead, and the PROJECT.md explicitly states the base contract is duplicated in both packages without a shared package. Cross-contract roles create tight coupling between independently-deployed tokens. | Each token contract manages its own roles independently. Off-chain tooling can batch `grantRole` calls across contracts. |
| Role delegation (allow a role holder to temporarily delegate their role to another address) | Enables representative operations without permanently granting roles | Adds significant complexity: delegation tracking, revocation of delegations, circular delegation prevention. The OZ `AccessControl` model is grant-based, not delegation-based. Delegation fundamentally changes the security model. | Use the existing OZ `grantRole` / `revokeRole` for permanent grants. For temporary access, use auxiliary data with an expiry pattern. |
| Overriding `supportsInterface` with a custom `IAccessControlExtended` interface ID | Custom interface detection beyond `IAccessControl` and `IAccessControlEnumerable` | The project constraints say to follow existing interface patterns (separate `I*.sol` files). A custom interface is fine, but it must be additive to the OZ interfaces, not replacing them. Consumers expect standard OZ interface IDs. | Define `IAccessControlExtended` that extends `IAccessControlEnumerable` with the new functions (`getRolesOf`, `grantRoleWithData`, `setRoleData`, `getRoleData`). Register both standard and custom interface IDs in `supportsInterface`. |

## Feature Dependencies

```
[OZ AccessControlEnumerable]
    |
    +--provides--> [Grant/Revoke/HasRole/Enumerate Members]
    |                  |
    |                  +--enables--> [Role-based bypass in hooks]
    |                  |                 |
    |                  |                 +--used-by--> [NonTransferable admin bypass]
    |                  |                 +--used-by--> [CappedBalance admin bypass]
    |                  |                 +--used-by--> [Mintable role-gating]
    |                  |
    |                  +--enables--> [onlyRole modifier for extensions]
    |
    +--overridden-by--> [Reverse role lookup]
    |                       |
    |                       +--requires--> [_grantRole override to maintain _accountRoles]
    |                       +--requires--> [_revokeRole override to maintain _accountRoles]
    |
    +--extended-by--> [Auxiliary data per role-address]
                          |
                          +--enables--> [Grant role with data atomically]
                          +--enables--> [Data-aware role revocation]
                          +--emits----> [RoleDataChanged event]

[AccessControlExtended base contract]
    |
    +--consumed-by--> [LSP7NonTransferable]
    +--consumed-by--> [LSP7CappedBalance]
    +--consumed-by--> [LSP7Mintable]
    +--consumed-by--> [LSP8 equivalents]

[Abstract variant] --mirrors--> [InitAbstract variant]
```

### Dependency Notes

- **Reverse role lookup requires _grantRole/_revokeRole overrides:** The reverse index (`_accountRoles`) must be updated every time a role is granted or revoked. Since OZ AccessControlEnumerable already overrides these internals for its forward index, AccessControlExtended overrides them a second time (calling `super` first). This is the single most important implementation detail to get right -- missing an update path creates data inconsistency.
- **Auxiliary data requires the role to exist:** `setRoleData` should revert if the address does not hold the role (matching existing `LSP7RoleOperators.setRoleOperatorData` behavior). `grantRoleWithData` bundles grant + data set atomically, avoiding this check.
- **Role-based bypass replaces Allowlist:** Currently, `LSP7NonTransferable` and `LSP7CappedBalance` inherit from `LSP7AllowlistAbstract`. With AccessControlExtended, the allowlist is replaced by role membership checks (`hasRole`). This means `LSP7AllowlistAbstract` is no longer needed in these extensions -- it gets replaced, not wrapped.
- **Extension role constants are independent of the base:** If `LSP7NonTransferable` defines `_ALLOW_TRANSFER_ROLE` and `LSP7CappedBalance` defines `_INFINITE_BALANCE_ROLE`, these are separate bytes32 constants. The base contract does not know about them.
- **Both variants must have identical external APIs:** Abstract and InitAbstract must expose the same functions, events, and errors. The only difference is constructor vs. initializer initialization.

## MVP Definition

### Launch With (v1)

Minimum viable AccessControlExtended -- what the updated extensions need to function.

- [x] **OZ AccessControlEnumerable inheritance** -- provides grant, revoke, hasRole, enumerate, events, modifier
- [x] **Reverse role lookup** -- `getRolesOf(address)` with `Bytes32Set` reverse index
- [x] **Auxiliary data storage** -- `setRoleData` / `getRoleData` with `mapping(bytes32 => mapping(address => bytes))`
- [x] **Atomic grant-with-data** -- `grantRoleWithData(bytes32, address, bytes)` for single-tx role + data setup
- [x] **Data-clearing on revocation** -- automatic cleanup when a role is revoked
- [x] **RoleDataChanged event** -- for off-chain indexing of data mutations
- [x] **Custom IAccessControlExtended interface** -- with ERC-165 support
- [x] **Both Abstract and InitAbstract variants** -- matching repo convention
- [x] **DEFAULT_ADMIN_ROLE granted to owner** -- in constructor/initializer
- [x] **Updated LSP7NonTransferable** -- uses `hasRole(from, _ALLOW_TRANSFER_ROLE)` instead of `isAllowlisted(from)`
- [x] **Updated LSP7CappedBalance** -- uses `hasRole(to, _INFINITE_BALANCE_ROLE)` instead of `isAllowlisted(to)`
- [x] **Updated LSP7Mintable** -- uses `onlyRole(_MINT_ROLE)` or `hasRole(msg.sender, _MINT_ROLE)` instead of `onlyOwner`
- [x] **LSP8 equivalents** -- same updates for LSP8 NonTransferable, CappedBalance, Mintable
- [x] **Foundry tests** -- for base contract and each updated extension

### Add After Validation (v1.x)

Features to add once the core is deployed and validated.

- [ ] **CappedSupply extension integration** -- gating supply cap bypass with a role (out of v1 scope per PROJECT.md)
- [ ] **Burnable extension integration** -- gating burn permissions with a role (out of v1 scope per PROJECT.md)
- [ ] **Paginated reverse lookup** -- `getRolesOfByIndex(address, uint256 start, uint256 end)` for gas-safe enumeration of addresses with many roles
- [ ] **Role count getter** -- `getRoleCountOf(address)` for efficient existence checks

### Future Consideration (v2+)

Features to defer until the pattern is proven.

- [ ] **AccessControlDefaultAdminRules integration** -- 2-step admin transfer (available in OZ v4.9 but adds complexity; defer until security audit requests it)
- [ ] **Role-based event filtering** -- custom events per extension role for more granular off-chain indexing
- [ ] **Shared AccessControlExtended package** -- extract to a shared package if the inline-duplicate pattern proves unworkable at scale

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| OZ AccessControlEnumerable inheritance | HIGH | LOW | P1 |
| Reverse role lookup (`getRolesOf`) | HIGH | MEDIUM | P1 |
| Auxiliary data storage | HIGH | MEDIUM | P1 |
| Atomic grant-with-data | MEDIUM | LOW | P1 |
| Data-clearing on revocation | MEDIUM | LOW | P1 |
| RoleDataChanged event | MEDIUM | LOW | P1 |
| IAccessControlExtended interface | MEDIUM | LOW | P1 |
| Dual variant (Abstract + InitAbstract) | HIGH | MEDIUM | P1 |
| Updated NonTransferable | HIGH | MEDIUM | P1 |
| Updated CappedBalance | HIGH | MEDIUM | P1 |
| Updated Mintable | HIGH | MEDIUM | P1 |
| LSP8 equivalents | HIGH | LOW (copy from LSP7) | P1 |
| Foundry test suite | HIGH | HIGH | P1 |
| Paginated reverse lookup | LOW | LOW | P2 |
| Role count getter | LOW | LOW | P2 |
| CappedSupply integration | MEDIUM | MEDIUM | P3 |
| Burnable integration | MEDIUM | MEDIUM | P3 |
| DefaultAdminRules | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch -- required to replace LSP7RoleOperators and update extensions
- P2: Should have, add when possible -- improves API completeness
- P3: Nice to have, future consideration -- separate scope decisions

## Competitor Feature Analysis

| Feature | OZ AccessControl | OZ AccessControlEnumerable | Existing LSP7RoleOperators | AccessControlExtended (our plan) |
|---------|-----------------|---------------------------|---------------------------|----------------------------------|
| Grant/revoke roles | Yes | Yes | Yes (custom impl) | Yes (inherited from OZ) |
| Role membership check | Yes | Yes | Yes (custom impl) | Yes (inherited from OZ) |
| Enumerate role members | No | Yes | Yes (custom impl with pagination) | Yes (inherited from OZ) |
| Role admin hierarchy | Yes | Yes | No (onlyOwner only) | Yes (inherited from OZ) |
| Reverse lookup (address-to-roles) | No | No | Yes (`getRolesFor`) | Yes (`getRolesOf`) |
| Auxiliary data per role-address | No | No | Yes (`getRoleOperatorData`/`setRoleOperatorData`) | Yes (`getRoleData`/`setRoleData`) |
| Atomic grant + data | No | No | Yes (`authorizeRoleOperator`) | Yes (`grantRoleWithData`) |
| Self-revocation | Yes (`renounceRole`) | Yes (`renounceRole`) | Yes (caller == operator) | Yes (inherited `renounceRole`) |
| LSP1 notifications | No | No | Yes | No (anti-feature) |
| Batch operations | No | No | No (was out of scope) | No (anti-feature) |
| ERC-165 support | Yes | Yes | No | Yes (inherited + custom) |
| Role admin per role | Yes (`_setRoleAdmin`) | Yes (`_setRoleAdmin`) | No | Yes (inherited from OZ) |
| Data cleanup on revoke | N/A | N/A | Yes | Yes |
| Pre-defined roles | No | No | Yes (MINT, TRANSFER, BALANCE) | No (extensions define their own) |
| Reserved address handling | No | No | Yes (address(0), 0xdEaD) | Extension-level (not base) |

## OZ AccessControl vs. Existing LSP7RoleOperators -- Migration Mapping

This table maps existing RoleOperators functions to their AccessControlExtended equivalents, to guide the migration.

| Existing (LSP7RoleOperators) | New (AccessControlExtended) | Notes |
|------------------------------|---------------------------|-------|
| `authorizeRoleOperator(role, operator, data)` | `grantRoleWithData(role, account, data)` | Rename; semantics identical |
| `revokeRoleOperator(role, operator)` | `revokeRole(role, account)` | OZ standard; data cleanup added in override |
| `hasRole(operator, role)` | `hasRole(role, account)` | **Parameter order swapped** -- OZ convention is `(role, account)`, existing code was `(operator, role)`. All call sites must update. |
| `getRolesFor(operator)` | `getRolesOf(account)` | Rename; semantics identical |
| `getOperatorsCountForRole(role)` | `getRoleMemberCount(role)` | OZ standard name |
| `getRoleOperatorsByIndex(role, start, end)` | `getRoleMember(role, index)` | OZ returns one-at-a-time, not a slice. Paginated access requires loop or custom wrapper. |
| `setRoleOperatorData(role, operator, data)` | `setRoleData(role, account, data)` | Rename; semantics identical |
| `getRoleOperatorData(role, operator)` | `getRoleData(role, account)` | Rename; semantics identical |
| `RoleOperatorChanged` event | `RoleGranted` / `RoleRevoked` events | OZ standard events replace custom event |
| `RoleOperatorDataChanged` event | `RoleDataChanged` event | Rename |
| `_notifyRoleOperator` (LSP1) | *Removed* | Anti-feature; no replacement |

## Sources

- [OpenZeppelin AccessControl v4.x API](https://docs.openzeppelin.com/contracts/4.x/api/access) -- HIGH confidence, official docs
- [OpenZeppelin AccessControlEnumerable v4.9 source](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.9/contracts/access/AccessControlEnumerable.sol) -- HIGH confidence, verified source code
- [OpenZeppelin Access Control guide](https://docs.openzeppelin.com/contracts/4.x/access-control) -- HIGH confidence, official docs
- [OpenZeppelin EnumerableSet](https://docs.openzeppelin.com/contracts/4.x/api/utils#EnumerableSet) -- HIGH confidence, official docs
- [AccessControlDefaultAdminRules announcement (OZ v4.9)](https://www.openzeppelin.com/news/introducing-openzeppelin-contracts-v4.9) -- MEDIUM confidence
- [Lazy Sol RBAC (bitmask alternative)](https://github.com/lazy-sol/access-control) -- LOW confidence, alternative pattern reference
- [Role Management in Solidity (DEV Community)](https://dev.to/hgky95/role-management-in-solidity-1lhc) -- LOW confidence, community pattern
- Existing codebase analysis: `LSP7RoleOperatorsAbstract.sol`, `LSP7AllowlistAbstract.sol`, `LSP7NonTransferableAbstract.sol`, `LSP7CappedBalanceAbstract.sol`, `LSP7MintableAbstract.sol`, `LSP7CustomizableToken.sol` -- HIGH confidence, primary source

---
*Feature research for: AccessControlExtended (Solidity role management for LSP7/LSP8)*
*Researched: 2026-02-27*
