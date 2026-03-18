# Phase 1: Base Contract - Research

**Researched:** 2026-03-03
**Domain:** Solidity access control, OpenZeppelin 4.9.x, ERC-165 interface detection, proxy/initializable patterns
**Confidence:** HIGH

## Summary

Phase 1 builds a standalone `AccessControlExtended` base contract in the LSP7 package. The contract must provide OZ-standard role management (`grantRole`, `hasRole`, `revokeRole`, `renounceRole`, etc.) plus three extensions: reverse role lookups (`rolesOf(address)`), auxiliary data per role-address pair (`setRoleData`, `getRoleData`, `grantRoleWithData`), and auto-data-cleanup on revocation. Both Abstract (constructor) and InitAbstract (proxy/initializable) variants are required.

The primary technical challenge is integrating OZ's `AccessControl` pattern with the existing LSP7 inheritance chain, which already provides `ERC165` and `Ownable`/`OwnableUpgradeable` through `ERC725Y`. A STATE.md decision dictates composing OZ `EnumerableSet` primitives rather than directly inheriting `AccessControlEnumerable`, avoiding `ERC165` and `Context` diamond conflicts. The contract must implement `IAccessControl` and `IAccessControlEnumerable` interfaces manually while adding the extended functionality on top. The user requires a dual access path: both `owner()` AND `DEFAULT_ADMIN_ROLE` holders can manage roles, with owner having implicit admin access.

**Primary recommendation:** Compose `EnumerableSet.AddressSet` and `EnumerableSet.Bytes32Set` from OZ to implement the three storage mappings (forward role-to-members, reverse address-to-roles, auxiliary data). Implement the standard `IAccessControl` and `IAccessControlEnumerable` interface functions manually. Override `_checkRole` to provide owner-as-implicit-admin. Override `_transferOwnership` to auto-sync `DEFAULT_ADMIN_ROLE`. Place all files in `extensions/AccessControlExtended/` following the existing folder convention.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Dual access path:** Both `owner()` AND addresses with `DEFAULT_ADMIN_ROLE` can grant/revoke roles. Owner has implicit admin access -- does NOT rely on being explicitly granted `DEFAULT_ADMIN_ROLE`
- **Ownership transfer:** `DEFAULT_ADMIN_ROLE` auto-transfers on ownership transfer -- revoked from previous owner, granted to new owner. Keeps dApp UIs accurate and prevents stale admin access
- **Admin delegation:** `DEFAULT_ADMIN_ROLE` holders CAN grant `DEFAULT_ADMIN_ROLE` to others (full OZ admin hierarchy)
- **Root admin:** `DEFAULT_ADMIN_ROLE` is always a root admin for all roles, even if a role has a custom per-role admin (e.g., `MINT_ADMIN` manages `MINTER_ROLE`, but `DEFAULT_ADMIN_ROLE` can also manage it)
- **Custom role admins:** Extensions can set custom admin roles per extension role via `_setRoleAdmin`
- **Standard OZ revocation:** Owner has implicit access for granting/revoking, but revocation of `DEFAULT_ADMIN_ROLE` from others follows OZ standard rules (must hold the role's admin role)
- **renounceRole:** Claude's discretion on whether to restrict renouncing critical roles
- **Extension-level handling only:** Base contract has NO special address handling. Each extension decides how to handle address(0) and 0xdEaD
- **Hardcoded bypass in hooks:** Extensions check for reserved addresses before checking roles -- these bypasses cannot be revoked
- **setRoleData without role:** ALLOWED -- data can be set for an account that doesn't hold the role yet (pre-configuration use case before granting)
- **setRoleData authority:** Same as grantRole -- owner, `DEFAULT_ADMIN_ROLE`, or the role's specific admin. No self-service by role holders
- **OZ-aligned naming:** Follow OZ conventions for all function names
- **Extended functions:** `grantRoleWithData(bytes32, address, bytes)`, `setRoleData(bytes32, address, bytes)`, `getRoleData(bytes32, address)`
- **Reverse lookup:** `rolesOf(address)` -- concise, matches `balanceOf` convention
- **Event:** `RoleDataChanged(bytes32 indexed role, address indexed account, bytes data)`
- **No revokeRoleWithData:** `revokeRole` is sufficient
- **Interface name:** `IAccessControlExtended`
- **Role constants:** Public, no underscore prefix -- `MINTER_ROLE`, `TRANSFER_ROLE`, `UNCAPPED_ROLE` (matches OZ `DEFAULT_ADMIN_ROLE` style)
- **UTF-8 encoded bytes32:** Role values are `bytes32(bytes("Minter"))` not `keccak256("MINTER_ROLE")` -- roles decode directly as human-readable strings
- **DEFAULT_ADMIN_ROLE:** Stays `bytes32(0)` per OZ convention (exception to UTF-8 pattern)
- **supportsInterface returns true for all three:** `IAccessControl`, `IAccessControlEnumerable`, `IAccessControlExtended`

### Claude's Discretion
- renounceRole restriction policy for critical roles
- Whether to block granting roles to reserved addresses (address(0), 0xdEaD)
- Data clearing behavior on role revocation
- grantRoleWithData behavior when role already held
- Error naming prefix convention
- Event emission strategy for grantRoleWithData
- Owner visibility in hasRole for DEFAULT_ADMIN_ROLE
- Reserved address handling in extensions beyond Burnable and Mintable

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BASE-01 | AccessControlExtended extends OZ AccessControlEnumerable with three storage mappings (forward role-to-members, reverse address-to-roles, auxiliary bytes per role-address) | Compose EnumerableSet primitives per STATE.md decision; implement IAccessControl + IAccessControlEnumerable interfaces manually. Three mappings: `_roleMembers` (bytes32 -> AddressSet), `_addressRoles` (address -> Bytes32Set), `_roleData` (bytes32 -> address -> bytes). See Architecture Patterns. |
| BASE-02 | `grantRole(bytes32, address)` and `revokeRole(bytes32, address)` follow OZ standard parameter order and behavior | Override with owner-as-implicit-admin in `_checkRole`. OZ v4.9 signatures verified: `grantRole(bytes32 role, address account)`, `revokeRole(bytes32 role, address account)`. Use `onlyRole(getRoleAdmin(role))` guard with custom `_checkRole` override. |
| BASE-03 | `hasRole(bytes32, address)` returns true if account holds the specified role | Direct lookup on `_roleMembers[role].contains(account)`. Discretion area: whether `hasRole(DEFAULT_ADMIN_ROLE, owner())` returns true implicitly. |
| BASE-04 | `getRoleMember(bytes32, uint256)` and `getRoleMemberCount(bytes32)` enumerate members of a role (forward lookup) | Use `_roleMembers[role].at(index)` and `_roleMembers[role].length()` from OZ EnumerableSet.AddressSet. |
| BASE-05 | `rolesOf(address)` returns all roles assigned to a given address (reverse lookup via Bytes32Set) | Use `_addressRoles[account].values()` from OZ EnumerableSet.Bytes32Set. Renamed from `getRolesOf` to `rolesOf` per CONTEXT.md. |
| BASE-06 | `setRoleData(bytes32, address, bytes)` stores arbitrary data for a role-address pair, reverting if account does not hold the role | Per CONTEXT.md, setRoleData WITHOUT role is ALLOWED (overrides BASE-06 revert behavior). Authority: owner, DEFAULT_ADMIN_ROLE, or role's admin. Emit `RoleDataChanged`. |
| BASE-07 | `getRoleData(bytes32, address)` retrieves auxiliary data for a role-address pair | Direct mapping lookup: `_roleData[role][account]`. Returns empty bytes if no data. |
| BASE-08 | `grantRoleWithData(bytes32, address, bytes)` atomically grants a role and sets auxiliary data in one transaction | Calls `_grantRole` then sets data in `_roleData`. Emits both `RoleGranted` and `RoleDataChanged`. |
| BASE-09 | Revoking a role automatically clears associated auxiliary data and emits `RoleDataChanged` | Override `_revokeRole` to delete `_roleData[role][account]` and emit `RoleDataChanged` with empty bytes. |
| BASE-10 | `RoleDataChanged(bytes32 indexed role, address indexed account, bytes data)` event emitted on any data mutation | Declared in `IAccessControlExtended` interface. Emitted in `setRoleData`, `grantRoleWithData`, and `_revokeRole` (when data exists). |
| BASE-11 | `renounceRole(bytes32, address)` allows an account to self-revoke a role (OZ standard) | OZ standard: `require(account == _msgSender())`. Self-revocation triggers data cleanup per BASE-09. Discretion: whether to restrict renouncing DEFAULT_ADMIN_ROLE. |
| BASE-12 | `onlyRole(bytes32)` modifier available for extensions to gate function access | Modifier calls `_checkRole(role)` which calls `_checkRole(role, _msgSender())`. Custom override adds owner-as-admin fallback. |
| BASE-13 | `DEFAULT_ADMIN_ROLE` granted to contract owner in constructor/initializer | Call `_grantRole(DEFAULT_ADMIN_ROLE, newOwner_)` in constructor. For InitAbstract, do the same in `__AccessControlExtended_init_unchained`. |
| BASE-14 | `IAccessControlExtended` interface extending `IAccessControlEnumerable` with custom functions, registered via ERC-165 | Interface inherits `IAccessControlEnumerable` (from `@openzeppelin/contracts`). Adds `rolesOf`, `grantRoleWithData`, `setRoleData`, `getRoleData`, `RoleDataChanged`. |
| BASE-15 | `supportsInterface` correctly returns true for `IAccessControl`, `IAccessControlEnumerable`, and `IAccessControlExtended` | Override `supportsInterface` in the abstract contract. Check all three interface IDs explicitly, chain to `super.supportsInterface()` for LSP7's existing checks. |
| BASE-16 | `AccessControlExtendedAbstract` (constructor-based variant) compiles and works with LSP7DigitalAsset inheritance chain | Inherits `LSP7DigitalAsset`. Does NOT inherit `AccessControlEnumerable` (per STATE.md). Implements interfaces manually. Overrides `supportsInterface` with explicit resolution. |
| BASE-17 | `AccessControlExtendedInitAbstract` (proxy/initializable variant) uses proper storage gaps and `onlyInitializing` modifier | Inherits `LSP7DigitalAssetInitAbstract`. Uses `onlyInitializing` on `__AccessControlExtended_init` and `__AccessControlExtended_init_unchained`. No storage gaps needed since EnumerableSet mappings don't use fixed slots. |
| BASE-18 | `AccessControlExtendedConstants.sol` defines shared role constants (if any) and interface IDs | Define `_INTERFACEID_ACCESSCONTROLEXTENDED`. Role constants are NOT defined here (base is generic, per locked decision). Extensions define their own. |
| BASE-19 | `AccessControlExtendedErrors.sol` defines custom errors following codebase convention | Follow existing pattern: `LSP7RoleOperatorsNotAuthorized` style. Define errors for: unauthorized access, missing role. Use custom errors (not string reverts) matching Solidity 0.8.27+ style. |
| TEST-01 | Foundry tests for AccessControlExtended base contract: grant, revoke, hasRole, enumerate, reverse lookup, auxiliary data, grant-with-data, data cleanup on revoke | Use `forge-std/Test.sol`. Mock contract inheriting AccessControlExtendedAbstract with LSP7DigitalAsset. Pattern from existing `LSP7RoleOperators.t.sol`. |
| TEST-02 | Foundry tests for `supportsInterface` returning correct values for all three interface IDs | Compute interface IDs using `type(IAccessControl).interfaceId`, `type(IAccessControlEnumerable).interfaceId`, `type(IAccessControlExtended).interfaceId`. Assert all return true. |
| TEST-03 | Foundry tests for InitAbstract variant: initialization, double-initialization revert, storage gap verification | Deploy behind proxy, call initializer, attempt re-initialization (should revert). Verify state matches Abstract variant behavior. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| OpenZeppelin Contracts | 4.9.6 (`^4.9.6` in package.json) | EnumerableSet, IAccessControl, IAccessControlEnumerable, ERC165 | Already a project dependency; provides battle-tested enumerable sets and standard interfaces |
| OpenZeppelin Contracts Upgradeable | 4.9.x (transitive dep) | OwnableUpgradeable, ERC165Upgradeable (used by ERC725YInitAbstract) | Already in the chain for InitAbstract variants |
| ERC725 Smart Contracts v8 | (transitive via @lukso/lsp4-contracts) | ERC725Y (owner(), _transferOwnership) | Base ownership model for all LSP7/LSP8 contracts |
| Forge Std | (from lib/forge-std) | Test framework, assertions, vm cheatcodes | Project-standard test framework |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@openzeppelin/contracts/utils/structs/EnumerableSet.sol` | 4.9.6 | AddressSet for forward lookup, Bytes32Set for reverse lookup | Core storage primitives for role management |
| `@openzeppelin/contracts/access/IAccessControl.sol` | 4.9.6 | Standard interface with events (RoleGranted, RoleRevoked, RoleAdminChanged) | Implement -- do NOT inherit AccessControl base class |
| `@openzeppelin/contracts/access/IAccessControlEnumerable.sol` | 4.9.6 | Standard interface for enumeration (getRoleMember, getRoleMemberCount) | Implement -- do NOT inherit AccessControlEnumerable |
| `@openzeppelin/contracts/utils/Strings.sol` | 4.9.6 | String conversion for revert messages (if using OZ-style string reverts) | Only needed if mimicking OZ string revert pattern; likely NOT needed since project uses custom errors |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Composing EnumerableSet primitives | Directly inheriting AccessControlEnumerable | Simpler code but creates ERC165 diamond conflict with ERC725Y and Context constructor issues; STATE.md explicitly chose composition |
| OZ IAccessControl interface | Custom interface | OZ interface guarantees compatibility with tooling (Etherscan, Tenderly, etc.) that recognizes IAccessControl; always use OZ's |
| Custom string reverts (OZ v4 style) | Custom error types | Project uses custom errors (e.g., `LSP7RoleOperatorsNotAuthorized`); follow codebase convention, not OZ's string reverts |

## Architecture Patterns

### Recommended Project Structure
```
packages/lsp7-contracts/contracts/extensions/
    AccessControlExtended/
        IAccessControlExtended.sol            # Interface (extends IAccessControlEnumerable)
        AccessControlExtendedAbstract.sol     # Constructor variant (inherits LSP7DigitalAsset)
        AccessControlExtendedInitAbstract.sol # Proxy variant (inherits LSP7DigitalAssetInitAbstract)
        AccessControlExtendedConstants.sol    # Interface ID, maybe shared constants
        AccessControlExtendedErrors.sol       # Custom errors
```

### Pattern 1: Composition over Inheritance for AccessControl
**What:** Instead of `is AccessControlEnumerable`, the contract inherits only from `LSP7DigitalAsset` and `IAccessControlExtended`, then manually implements all AccessControl logic using `EnumerableSet` primitives.

**When to use:** When the existing inheritance chain already provides `ERC165` and `Ownable` through a different path (ERC725Y), and direct OZ AccessControl inheritance would create diamond conflicts.

**Why this works:** The existing LSP7RoleOperatorsAbstract already uses exactly this pattern -- it manually manages `EnumerableSet.AddressSet` and `EnumerableSet.Bytes32Set` without inheriting any OZ access control base. AccessControlExtended does the same but implements the standard OZ function signatures.

**Example (Abstract variant):**
```solidity
// Source: Derived from codebase analysis of LSP7RoleOperatorsAbstract.sol + OZ AccessControl.sol
abstract contract AccessControlExtendedAbstract is
    IAccessControlExtended,
    LSP7DigitalAsset
{
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    struct RoleData {
        EnumerableSet.AddressSet members;
        bytes32 adminRole;
    }

    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;

    mapping(bytes32 => RoleData) private _roles;
    mapping(address => EnumerableSet.Bytes32Set) private _addressRoles;
    mapping(bytes32 => mapping(address => bytes)) private _roleData;

    modifier onlyRole(bytes32 role) {
        _checkRole(role);
        _;
    }
    // ... implements all IAccessControl + IAccessControlEnumerable functions
}
```

### Pattern 2: Owner-as-Implicit-Admin via _checkRole Override
**What:** Override `_checkRole` so that `owner()` always passes the role check, giving the owner implicit admin authority without needing to be explicitly granted `DEFAULT_ADMIN_ROLE`.

**When to use:** When the contract owner must always be able to manage roles, even if they have not been explicitly granted `DEFAULT_ADMIN_ROLE`.

**Critical detail:** `_grantRole(DEFAULT_ADMIN_ROLE, newOwner_)` is STILL called in the constructor to make the owner visible in enumeration (`getRoleMember`, `rolesOf`). The `_checkRole` override is a safety net, not the primary mechanism.

**Example:**
```solidity
// Source: Derived from OZ AccessControl._checkRole + project CONTEXT.md decisions
function _checkRole(bytes32 role, address account) internal view virtual {
    if (!hasRole(role, account) && account != owner()) {
        if (role != DEFAULT_ADMIN_ROLE || account != owner()) {
            revert AccessControlExtendedUnauthorized(account, role);
        }
    }
}

// Simplified: owner always passes, everyone else needs the role or its admin
function _checkRole(bytes32 role, address account) internal view virtual {
    if (account == owner()) return; // Owner implicitly has all admin rights
    if (!hasRole(role, account)) {
        revert AccessControlExtendedUnauthorized(account, role);
    }
}
```

**Important nuance:** The `_checkRole` in `grantRole`/`revokeRole` checks `getRoleAdmin(role)`, not `role` itself. So the guard is:
```solidity
function grantRole(bytes32 role, address account) public virtual {
    // OZ pattern: onlyRole(getRoleAdmin(role))
    // Our override: owner() always passes _checkRole
    _checkRole(getRoleAdmin(role));
    _grantRole(role, account);
}
```
Since `getRoleAdmin` returns `DEFAULT_ADMIN_ROLE` by default (0x00), and owner always passes `_checkRole`, owner can grant any role.

### Pattern 3: Ownership Transfer Sync via _transferOwnership Override
**What:** Override `_transferOwnership` to automatically revoke `DEFAULT_ADMIN_ROLE` from the old owner and grant it to the new owner.

**When to use:** Required by locked decisions -- `DEFAULT_ADMIN_ROLE` must auto-transfer on ownership transfer.

**Example:**
```solidity
// Source: Derived from OZ Ownable._transferOwnership + project decisions
function _transferOwnership(address newOwner) internal virtual override {
    address oldOwner = owner();
    super._transferOwnership(newOwner);
    // Sync DEFAULT_ADMIN_ROLE
    if (oldOwner != address(0)) {
        _revokeRole(DEFAULT_ADMIN_ROLE, oldOwner);
    }
    if (newOwner != address(0)) {
        _grantRole(DEFAULT_ADMIN_ROLE, newOwner);
    }
}
```

**Caution:** The `_transferOwnership` in `ERC725Y` comes from OZ `Ownable`. The override must chain correctly through the LSP7 -> LSP4 -> ERC725Y -> Ownable hierarchy.

### Pattern 4: InitAbstract Dual Initializer Pattern
**What:** The InitAbstract variant uses `__Name_init` (chained) and `__Name_init_unchained` (standalone) functions, both guarded by `onlyInitializing`.

**When to use:** Always, for the proxy/initializable variant.

**Example (from existing codebase):**
```solidity
// Source: packages/lsp7-contracts/contracts/extensions/LSP7Allowlist/LSP7AllowlistInitAbstract.sol
function __AccessControlExtended_init(
    string memory name_,
    string memory symbol_,
    address newOwner_,
    uint256 lsp4TokenType_,
    bool isNonDivisible_
) internal virtual onlyInitializing {
    LSP7DigitalAssetInitAbstract._initialize(
        name_, symbol_, newOwner_, lsp4TokenType_, isNonDivisible_
    );
    __AccessControlExtended_init_unchained(newOwner_);
}

function __AccessControlExtended_init_unchained(
    address newOwner_
) internal virtual onlyInitializing {
    _grantRole(DEFAULT_ADMIN_ROLE, newOwner_);
}
```

### Anti-Patterns to Avoid
- **Inheriting OZ AccessControl or AccessControlEnumerable directly:** Creates ERC165 diamond and Context diamond with the ERC725Y chain. The STATE.md explicitly decided against this.
- **Using OZ string revert messages:** The project uses custom errors (`error XYZ(...)` pattern). Do not use `string(abi.encodePacked("AccessControl: account ..."))`.
- **Storing role constants in the base contract:** Base is generic; extensions define role constants. Only `DEFAULT_ADMIN_ROLE = 0x00` belongs in the base.
- **Using `keccak256("ROLE_NAME")` for role values:** The user locked UTF-8 bytes32 encoding: `bytes32(bytes("Minter"))`. This produces human-readable output from `rolesOf()`. However, the base contract itself does not define any role constants except `DEFAULT_ADMIN_ROLE`.
- **Making hasRole return true for owner implicitly:** This is a discretion area. Be careful -- if `hasRole(DEFAULT_ADMIN_ROLE, owner())` returns true without the owner being in the EnumerableSet, then `getRoleMemberCount` and `rolesOf` will not include the owner. The cleaner approach is to always explicitly grant `DEFAULT_ADMIN_ROLE` to the owner and use `_checkRole` override for the authority bypass only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Enumerable address sets | Custom linked lists or arrays | `EnumerableSet.AddressSet` from OZ | O(1) add/remove/contains, tested for millions of gas-optimized operations |
| Enumerable bytes32 sets | Custom arrays with index tracking | `EnumerableSet.Bytes32Set` from OZ | Same benefits; already used throughout codebase |
| ERC-165 interface detection | Manual `interfaceId` computation | `type(IAccessControl).interfaceId` | Compiler-guaranteed correct XOR of all function selectors |
| Role admin hierarchy | Custom admin mapping | Replicate OZ's `RoleData.adminRole` + `_setRoleAdmin` pattern | Proven pattern with clear security semantics |

**Key insight:** The existing `LSP7RoleOperatorsAbstract` is essentially a hand-rolled version of AccessControl with EnumerableSet. This phase replaces it with OZ-compatible function signatures while using the exact same underlying primitives.

## Common Pitfalls

### Pitfall 1: ERC165 Diamond Conflict
**What goes wrong:** Inheriting both `LSP7DigitalAsset` (which chains to ERC725Y -> Ownable -> ERC165) and `AccessControlEnumerable` (which chains to AccessControl -> ERC165) creates a Solidity diamond requiring explicit `supportsInterface` override in every concrete contract.
**Why it happens:** Both paths override `supportsInterface`. If the final contract doesn't explicitly override it listing all bases, the compiler errors.
**How to avoid:** Composition pattern -- implement interfaces manually instead of inheriting OZ AccessControl. The `supportsInterface` in AccessControlExtendedAbstract explicitly checks `IAccessControl`, `IAccessControlEnumerable`, and `IAccessControlExtended` interface IDs, then delegates to `super.supportsInterface()`.
**Warning signs:** Compiler error: "Derived contract must override function 'supportsInterface'. Two or more base classes define function with same name and parameter types."

### Pitfall 2: _transferOwnership Override Chain
**What goes wrong:** The `_transferOwnership` function exists in OZ's `Ownable` (used by `ERC725Y`). If overridden in AccessControlExtendedAbstract, the override must properly chain through the C3 linearization.
**Why it happens:** `LSP7DigitalAsset` -> `LSP4DigitalAssetMetadata` -> `ERC725Y` -> `Ownable`. The `_transferOwnership` in the AccessControlExtended contract overrides `Ownable._transferOwnership`. If `ERC725Y` or any intermediate also overrides it, the chain must be correct.
**How to avoid:** Use `super._transferOwnership(newOwner)` to chain. Verify the full C3 linearization in tests. Check that `owner()` returns the correct value after transfer AND that `DEFAULT_ADMIN_ROLE` membership is updated.
**Warning signs:** After `transferOwnership`, the old owner still has `DEFAULT_ADMIN_ROLE` or the new owner doesn't.

### Pitfall 3: _grantRole / _revokeRole Must Update All Three Mappings
**What goes wrong:** Since we compose instead of inherit, `_grantRole` and `_revokeRole` must manually sync `_roleMembers`, `_addressRoles`, and the OZ-style `RoleData.members` (if used). Missing one creates inconsistencies.
**Why it happens:** OZ's `AccessControlEnumerable._grantRole` calls `super._grantRole()` (which sets `RoleData.members`) then adds to `_roleMembers`. We need to do all of this manually.
**How to avoid:** Use a single struct pattern. `_grantRole` adds to `_roleMembers[role]`, adds to `_addressRoles[account]`, emits `RoleGranted`. `_revokeRole` removes from both, clears `_roleData`, emits `RoleRevoked` and `RoleDataChanged` (if data existed).
**Warning signs:** `hasRole` returns true but `rolesOf` doesn't include the role, or vice versa.

### Pitfall 4: Data Cleanup Race in renounceRole
**What goes wrong:** `renounceRole` calls `_revokeRole` which clears data. If the caller expects to read data after renouncing, it's gone.
**Why it happens:** `_revokeRole` auto-clears data per BASE-09. `renounceRole` delegates to `_revokeRole`.
**How to avoid:** This is correct behavior per requirements. Document it clearly. Test that data is cleared after `renounceRole`.
**Warning signs:** None -- this is intentional.

### Pitfall 5: Solidity Compiler Version Mismatch
**What goes wrong:** Contracts use `pragma solidity ^0.8.27` but OZ interfaces use `pragma solidity ^0.8.0`. The foundry profile compiles with `solc = "0.8.27"` with `via_ir = true`.
**Why it happens:** Different packages have different pragma ranges. The actual compiler used is set by foundry.toml.
**How to avoid:** Use `pragma solidity ^0.8.27` for all new contracts (matching existing LSP7 contracts). Ensure the foundry profile compiles with `0.8.27`.
**Warning signs:** Compile errors about unsupported features or different bytecode between environments.

### Pitfall 6: InitAbstract Storage Layout
**What goes wrong:** The InitAbstract variant must have compatible storage layout with the Abstract variant for proxy upgrades.
**Why it happens:** EnumerableSet mappings are stored at deterministic storage slots based on mapping keys, so they don't need explicit `__gap` reservations. But any regular state variables DO need consistent ordering.
**How to avoid:** Place all state variables in the same order in both variants. Since the storage is only mappings (which use hashed slots), no `__gap` is strictly necessary. However, if any plain variables are added, they must be in the same position.
**Warning signs:** Proxy deployment reverts or returns garbage data after initialization.

### Pitfall 7: hasRole Parameter Order
**What goes wrong:** The existing `LSP7RoleOperators.hasRole(address, bytes32)` has REVERSED parameter order compared to OZ's `IAccessControl.hasRole(bytes32, address)`. The new contract must use OZ order.
**Why it happens:** The old custom implementation chose a different parameter order.
**How to avoid:** Use `hasRole(bytes32 role, address account)` -- OZ standard. Tests must verify the correct order. Anyone calling the old RoleOperators interface will need to swap parameters.
**Warning signs:** Tests pass but integration fails because parameter order is wrong.

## Code Examples

Verified patterns from the codebase and OZ sources:

### Storage Layout
```solidity
// Source: Adapted from OZ AccessControl + AccessControlEnumerable + LSP7RoleOperatorsAbstract
using EnumerableSet for EnumerableSet.AddressSet;
using EnumerableSet for EnumerableSet.Bytes32Set;

// OZ AccessControl equivalent: tracks admin role per role
mapping(bytes32 => bytes32) private _roleAdmins;

// OZ AccessControlEnumerable equivalent: forward lookup (role -> members)
mapping(bytes32 => EnumerableSet.AddressSet) private _roleMembers;

// Reverse lookup (address -> roles) -- not in OZ, our extension
mapping(address => EnumerableSet.Bytes32Set) private _addressRoles;

// Auxiliary data per role-address pair -- not in OZ, our extension
mapping(bytes32 => mapping(address => bytes)) private _roleData;
```

### _grantRole Implementation
```solidity
// Source: OZ AccessControl._grantRole + AccessControlEnumerable._grantRole + reverse lookup
function _grantRole(bytes32 role, address account) internal virtual {
    if (!_roleMembers[role].contains(account)) {
        _roleMembers[role].add(account);
        _addressRoles[account].add(role);
        emit RoleGranted(role, account, msg.sender);
    }
}
```

### _revokeRole with Data Cleanup
```solidity
// Source: OZ AccessControl._revokeRole + BASE-09 data cleanup
function _revokeRole(bytes32 role, address account) internal virtual {
    if (_roleMembers[role].contains(account)) {
        _roleMembers[role].remove(account);
        _addressRoles[account].remove(role);
        emit RoleRevoked(role, account, msg.sender);

        // Auto-clear auxiliary data (BASE-09)
        if (_roleData[role][account].length > 0) {
            delete _roleData[role][account];
            emit RoleDataChanged(role, account, "");
        }
    }
}
```

### grantRoleWithData
```solidity
// Source: Derived from BASE-08 requirement + OZ grantRole pattern
function grantRoleWithData(
    bytes32 role,
    address account,
    bytes calldata data
) public virtual {
    _checkRole(getRoleAdmin(role));
    _grantRole(role, account);
    if (data.length > 0) {
        _roleData[role][account] = data;
        emit RoleDataChanged(role, account, data);
    }
}
```

### supportsInterface Resolution
```solidity
// Source: Derived from LSP7DigitalAsset.supportsInterface pattern + interface IDs
function supportsInterface(
    bytes4 interfaceId
) public view virtual override returns (bool) {
    return
        interfaceId == type(IAccessControl).interfaceId ||
        interfaceId == type(IAccessControlEnumerable).interfaceId ||
        interfaceId == type(IAccessControlExtended).interfaceId ||
        super.supportsInterface(interfaceId);
}
```

### Mock Contract for Testing
```solidity
// Source: Adapted from packages/lsp7-contracts/foundry/LSP7RoleOperators.t.sol
contract MockAccessControlExtended is AccessControlExtendedAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_
    )
        LSP7DigitalAsset(name_, symbol_, newOwner_, lsp4TokenType_, isNonDivisible_)
        AccessControlExtendedAbstract(newOwner_)
    {}

    function mint(address to, uint256 amount, bool force, bytes memory data) public {
        _mint(to, amount, force, data);
    }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `LSP7RoleOperatorsAbstract` with custom API | `AccessControlExtendedAbstract` with OZ-compatible API | This phase | Breaking change -- function names and parameter orders change |
| `keccak256("MINTER")` for role IDs | `bytes32(bytes("Minter"))` for UTF-8 human-readable roles | User decision | Role values are directly decodable without off-chain mapping |
| `onlyOwner` for minting/access control | `onlyRole(MINTER_ROLE)` with OZ AccessControl hierarchy | This phase (extensions phase later) | Multiple addresses can have privileged access, not just owner |
| LSP1 Universal Receiver notifications on role changes | Standard OZ `RoleGranted`/`RoleRevoked` events only | This phase | Simpler, no reentrancy risk from notifications, lower gas |
| `authorizeRoleOperator(role, operator, data)` | `grantRole(role, account)` + `grantRoleWithData(role, account, data)` | This phase | OZ-standard naming, split atomic functions |

**Deprecated/outdated:**
- `LSP7RoleOperators`: Entire module being replaced in Phase 5 (migration). Base contract is built first, extensions updated, then RoleOperators deleted.
- `_notifyRoleOperator`: LSP1 notifications for role changes are out of scope (removed).

## Open Questions

1. **_checkRole behavior: owner bypass scope**
   - What we know: Owner must have implicit admin access for grant/revoke. `_checkRole` is the right override point.
   - What's unclear: Should owner bypass ALL `onlyRole` checks (meaning owner can call any role-gated function) or only admin-level operations (grant/revoke)? If owner bypasses all `onlyRole` checks, the owner could call extension functions gated by `MINTER_ROLE` without explicitly having it.
   - Recommendation: Owner bypasses `_checkRole` completely -- this is the simplest and most consistent. The owner is the most privileged entity. If finer control is needed, transfer ownership to a contract with more nuanced logic. Document clearly.

2. **renounceRole for DEFAULT_ADMIN_ROLE**
   - What we know: OZ standard allows renouncing any role. User left this to Claude's discretion.
   - What's unclear: Should the last `DEFAULT_ADMIN_ROLE` holder be allowed to renounce? If owner is implicit admin, it doesn't matter as much since owner still has access.
   - Recommendation: Allow renouncing `DEFAULT_ADMIN_ROLE` -- follow OZ standard. Since owner always has implicit admin, renouncing `DEFAULT_ADMIN_ROLE` doesn't lock out the contract. This is safe and standard.

3. **grantRoleWithData when role already held**
   - What we know: User left this to Claude's discretion.
   - What's unclear: Should it update data silently, revert, or emit only `RoleDataChanged`?
   - Recommendation: If role already held, update data only (emit `RoleDataChanged`). Do NOT emit duplicate `RoleGranted` (OZ's `_grantRole` already skips if role exists). This matches `authorizeRoleOperator` behavior in the old code.

4. **setRoleData authority vs CONTEXT.md conflict**
   - What we know: BASE-06 says "reverting if account does not hold the role" but CONTEXT.md says "setRoleData without role: ALLOWED".
   - What's unclear: Which takes precedence?
   - Recommendation: CONTEXT.md takes precedence (user locked decision). `setRoleData` DOES NOT revert if account lacks the role. This enables pre-configuration patterns.

5. **Error naming convention**
   - What we know: Existing errors use `LSP7RoleOperators` prefix. User left prefix to Claude's discretion.
   - What's unclear: Should errors use `AccessControlExtended` prefix or `ACE` shorthand?
   - Recommendation: Use `AccessControlExtended` prefix for clarity: `AccessControlExtendedUnauthorized(address account, bytes32 role)`, `AccessControlExtendedCanOnlyRenounceForSelf(address caller, address account)`. This follows the pattern of the contract name as error prefix.

## Sources

### Primary (HIGH confidence)
- OZ AccessControl.sol v4.9.0 (node_modules/@openzeppelin/contracts/access/AccessControl.sol) -- full source read, verified API and internal patterns
- OZ AccessControlEnumerable.sol v4.5.0 (node_modules/@openzeppelin/contracts/access/AccessControlEnumerable.sol) -- full source read, verified EnumerableSet composition
- OZ IAccessControl.sol v4.4.1 (node_modules/@openzeppelin/contracts/access/IAccessControl.sol) -- full source read, verified events and function signatures
- OZ IAccessControlEnumerable.sol v4.4.1 (node_modules/@openzeppelin/contracts/access/IAccessControlEnumerable.sol) -- full source read, verified interface
- LSP7RoleOperatorsAbstract.sol (packages/lsp7-contracts/contracts/extensions/LSP7RoleOperators/LSP7RoleOperatorsAbstract.sol) -- full source read, existing composition pattern
- LSP7RoleOperatorsInitAbstract.sol (packages/lsp7-contracts/contracts/extensions/LSP7RoleOperators/LSP7RoleOperatorsInitAbstract.sol) -- full source read, InitAbstract pattern
- LSP7DigitalAsset.sol (packages/lsp7-contracts/contracts/LSP7DigitalAsset.sol) -- full source read, inheritance chain analysis
- LSP7DigitalAssetInitAbstract.sol (packages/lsp7-contracts/contracts/LSP7DigitalAssetInitAbstract.sol) -- full source read, init pattern
- ERC725Y.sol (node_modules/@erc725/smart-contracts-v8/contracts/ERC725Y.sol) -- confirmed Ownable inheritance, _transferOwnership availability
- ERC725YInitAbstract.sol (node_modules/@erc725/smart-contracts-v8/contracts/ERC725YInitAbstract.sol) -- confirmed OwnableUpgradeable, ERC165Upgradeable usage
- foundry.toml [profile.lsp7] -- confirmed solc 0.8.27, via_ir, optimizer settings
- Existing Foundry tests (packages/lsp7-contracts/foundry/LSP7RoleOperators.t.sol) -- full source read, test pattern reference

### Secondary (MEDIUM confidence)
- STATE.md decision: "Compose OZ EnumerableSet primitives instead of inheriting AccessControlEnumerable" -- drives the composition architecture
- PROJECT.md constraint: OZ version 4.9.3/4.9.6 -- confirmed from package.json `"@openzeppelin/contracts": "^4.9.6"`
- CONTEXT.md role constant encoding: `bytes32(bytes("Minter"))` -- user decision, not verified for gas implications

### Tertiary (LOW confidence)
- Solidity compiler version: PROJECT.md says LSP7 uses 0.8.28 but actual code uses `pragma solidity ^0.8.27` and foundry.toml compiles with `solc = "0.8.27"`. The 0.8.27 from the codebase is authoritative. Flag for validation that 0.8.28 is not actually required.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already in project dependencies, versions verified from package.json and node_modules
- Architecture: HIGH -- composition pattern directly observed in existing LSP7RoleOperatorsAbstract, OZ contract internals fully read
- Pitfalls: HIGH -- all pitfalls derived from actual codebase analysis (diamond inheritance, storage layout, parameter order difference)

**Research date:** 2026-03-03
**Valid until:** 2026-04-03 (stable domain -- OZ 4.9.x is in maintenance mode, no breaking changes expected)
