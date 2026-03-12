# Architecture Patterns

**Domain:** Solidity role management base contract for LSP7/LSP8 token extensions
**Researched:** 2026-02-27
**Confidence:** HIGH (based on direct codebase analysis and OZ v4.9.6 source code)

## Recommended Architecture

### Overview

AccessControlExtended is a base contract that sits between the OZ `AccessControlEnumerable` foundation and the existing LSP7/LSP8 extension contracts. It **replaces the Allowlist layer** as the bypass mechanism for extension restrictions, and it **replaces LSP7RoleOperators** as the role management system. Each extension that needs privileged bypasses inherits from AccessControlExtended instead of from Allowlist.

```
                    OZ AccessControlEnumerable
                              |
                    OZ AccessControl + ERC165
                              |
                   AccessControlExtendedAbstract   <-- NEW (adds: role data, reverse lookups)
                      /               \
          LSP7DigitalAsset      LSP8IdentifiableDigitalAsset
                |                         |
   Extension contracts            Extension contracts
   (NonTransferable,              (NonTransferable,
    CappedBalance,                 CappedBalance,
    Mintable)                      Mintable)
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `AccessControlExtendedAbstract` | Role storage, role data, reverse lookups, `hasRole()` checks. Extends OZ `AccessControlEnumerable` | Extensions via inheritance |
| `AccessControlExtendedInitAbstract` | Proxy-compatible variant with `__init` / `__init_unchained` | Extensions via inheritance |
| `IAccessControlExtended` | External interface adding `getRolesFor()`, `setRoleData()`, `getRoleData()` on top of `IAccessControlEnumerable` | External callers, UI tooling |
| `AccessControlExtendedConstants.sol` | Role constants (`_MINTER_ROLE`, `_TRANSFER_ROLE`, `_UNCAPPED_ROLE`) | Extensions import constants |
| `AccessControlExtendedErrors.sol` | Custom errors for role operations | AccessControlExtended contracts |
| Extension contracts (updated) | Define which roles bypass which restrictions via `hasRole()` checks in hooks/modifiers | AccessControlExtended via `super` calls |
| `LSP7CustomizableToken` / `LSP7CustomizableTokenInit` | Concrete tokens composing multiple extensions, resolving diamond inheritance | All extension abstracts |

### Data Flow

**Role assignment flow:**
1. Contract owner (DEFAULT_ADMIN_ROLE holder) calls `grantRole(role, account)` (OZ standard)
2. `AccessControlEnumerable._grantRole()` adds to role->members set
3. `AccessControlExtendedAbstract._grantRole()` override also adds to account->roles reverse mapping
4. `RoleGranted` event emitted (OZ standard)

**Role bypass flow (hook pattern -- NonTransferable, CappedBalance):**
1. User calls `transfer()` on LSP7
2. `LSP7DigitalAsset._transfer()` calls `_beforeTokenTransfer(from, to, amount, force, data)`
3. Extension's `_beforeTokenTransfer()` checks `hasRole(RELEVANT_ROLE, relevantAddress)`
4. If role holder: bypass restriction (return early)
5. If not role holder: apply normal restriction check

**Role gated action flow (modifier pattern -- Mintable):**
1. User calls `mint(to, amount, force, data)`
2. Modifier or explicit check: `require(hasRole(_MINTER_ROLE, msg.sender) || msg.sender == owner())`
3. If authorized: proceed with `_mint()`
4. If not: revert

## Inheritance Hierarchy

### Current Hierarchy (being replaced)

```
LSP7DigitalAsset
    |
    +-- LSP7AllowlistAbstract (adds: _allowlist EnumerableSet, isAllowlisted())
    |       |
    |       +-- LSP7NonTransferableAbstract (hook: _beforeTokenTransfer checks isAllowlisted)
    |       +-- LSP7CappedBalanceAbstract   (hook: _beforeTokenTransfer checks isAllowlisted)
    |
    +-- LSP7MintableAbstract (modifier: onlyOwner on mint())
    |
    +-- LSP7RoleOperatorsAbstract (custom role system, inherits LSP7DigitalAsset directly)
```

### New Hierarchy (with AccessControlExtended)

```
OZ AccessControlEnumerable
    + OZ AccessControl (hasRole, grantRole, revokeRole, onlyRole, DEFAULT_ADMIN_ROLE)
    + OZ ERC165

AccessControlExtendedAbstract (extends AccessControlEnumerable)
    adds: _operatorRoles reverse mapping
    adds: _roleOperatorData auxiliary data mapping
    adds: getRolesFor(address) -> bytes32[]
    adds: setRoleData(role, account, data)
    adds: getRoleData(role, account) -> bytes
    overrides: _grantRole (adds reverse mapping + data)
    overrides: _revokeRole (removes reverse mapping + clears data)

LSP7DigitalAsset (unchanged base)

    +-- LSP7NonTransferableAbstract
    |     inherits: AccessControlExtendedAbstract, LSP7DigitalAsset (replaces LSP7AllowlistAbstract)
    |     hook: _beforeTokenTransfer checks hasRole(_TRANSFER_ROLE, from) to bypass
    |
    +-- LSP7CappedBalanceAbstract
    |     inherits: AccessControlExtendedAbstract, LSP7DigitalAsset (replaces LSP7AllowlistAbstract)
    |     hook: _beforeTokenTransfer checks hasRole(_UNCAPPED_ROLE, to) to bypass
    |
    +-- LSP7MintableAbstract
          inherits: AccessControlExtendedAbstract, LSP7DigitalAsset (replaces onlyOwner)
          modifier: require(hasRole(_MINTER_ROLE, msg.sender)) on mint()
```

**Key change:** Allowlist was a flat "address is privileged for everything" mechanism. AccessControlExtended enables fine-grained "address is privileged for specific actions" via separate role constants.

### InitAbstract Variants (Proxy Pattern)

Each Abstract contract has a parallel InitAbstract variant following the existing pattern:

```
AccessControlExtendedAbstract          AccessControlExtendedInitAbstract
    constructor(newOwner_)                 __AccessControlExtended_init(newOwner_)
    {                                      __AccessControlExtended_init_unchained(newOwner_)
      _grantRole(DEFAULT_ADMIN_ROLE,       {
        newOwner_);                           _grantRole(DEFAULT_ADMIN_ROLE,
    }                                          newOwner_);
                                           }
```

The InitAbstract variants inherit from `LSP7DigitalAssetInitAbstract` (or `LSP8IdentifiableDigitalAssetInitAbstract`) instead of the non-proxy base.

## Patterns to Follow

### Pattern 1: Hook-Based Bypass (NonTransferable, CappedBalance)

**What:** Extensions that restrict token operations check for role membership in `_beforeTokenTransfer` and skip the restriction if the relevant address holds the bypass role.

**When:** The restriction applies to token transfers/mints/burns and can be bypassed per-address.

**Why this pattern:** The existing codebase already uses `_beforeTokenTransfer` for restrictions. The Allowlist used `isAllowlisted(from)` -- AccessControlExtended replaces this with `hasRole(SPECIFIC_ROLE, address)`, giving finer control.

**Example (LSP7NonTransferableAbstract -- updated):**
```solidity
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

import {AccessControlExtendedAbstract} from "../AccessControlExtended/AccessControlExtendedAbstract.sol";
import {_TRANSFER_ROLE} from "../AccessControlExtended/AccessControlExtendedConstants.sol";

abstract contract LSP7NonTransferableAbstract is
    ILSP7NonTransferable,
    AccessControlExtendedAbstract  // <-- replaces LSP7AllowlistAbstract
{
    // ... transfer lock fields unchanged ...

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual override {
        // Role-based bypass: address with TRANSFER_ROLE can transfer
        // even when token is non-transferable
        if (hasRole(_TRANSFER_ROLE, from)) return;
        _nonTransferableCheck(from, to, amount, force, data);
    }
}
```

### Pattern 2: Modifier-Based Role Gate (Mintable)

**What:** Functions that should only be callable by specific role holders use an explicit `hasRole()` check or the OZ `onlyRole()` modifier instead of `onlyOwner`.

**When:** A function should be callable by a specific set of addresses (not just the owner).

**Example (LSP7MintableAbstract -- updated):**
```solidity
abstract contract LSP7MintableAbstract is
    ILSP7Mintable,
    AccessControlExtendedAbstract  // <-- replaces LSP7DigitalAsset directly
{
    // mint() now uses role check instead of onlyOwner
    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public virtual override onlyRole(_MINTER_ROLE) {
        _mint(to, amount, force, data);
    }
}
```

**Important nuance:** `disableMinting()` may remain `onlyOwner` (or use `DEFAULT_ADMIN_ROLE`) since it is an administrative action distinct from the minting privilege. This is a design decision for implementation.

### Pattern 3: Constructor/Initializer Role Bootstrapping

**What:** The `AccessControlExtendedAbstract` constructor grants `DEFAULT_ADMIN_ROLE` to the owner. Each extension's constructor/initializer grants its specific roles to the owner and reserved addresses.

**When:** Always, during contract deployment or proxy initialization.

**Example:**
```solidity
// In AccessControlExtendedAbstract
constructor(address newOwner_) {
    _grantRole(DEFAULT_ADMIN_ROLE, newOwner_);
}

// In LSP7NonTransferableAbstract
constructor(uint256 lockStart_, uint256 lockEnd_) {
    // Owner, address(0), and dead address get transfer bypass
    _grantRole(_TRANSFER_ROLE, owner());     // already done if owner has DEFAULT_ADMIN_ROLE
    _grantRole(_TRANSFER_ROLE, address(0));  // minting from address(0) bypasses
    _grantRole(_TRANSFER_ROLE, _DEAD_ADDRESS); // burning to dead bypasses
}
```

### Pattern 4: supportsInterface Resolution

**What:** Both OZ `AccessControl` and `LSP7DigitalAsset` implement `supportsInterface`. The diamond must be resolved explicitly.

**When:** Any contract inheriting both AccessControlExtended and LSP7/LSP8.

**Example:**
```solidity
function supportsInterface(bytes4 interfaceId)
    public view virtual override(
        AccessControlEnumerable,  // provides IAccessControl, IAccessControlEnumerable
        LSP7DigitalAsset          // provides ILSP7, ERC725Y, LSP17
    )
    returns (bool)
{
    return
        AccessControlEnumerable.supportsInterface(interfaceId) ||
        LSP7DigitalAsset.supportsInterface(interfaceId);
}
```

### Pattern 5: Extension File Structure

**What:** Following the existing convention, AccessControlExtended lives in `extensions/AccessControlExtended/` with standard file set.

**When:** Always -- every new extension follows this structure.

**File layout:**
```
packages/lsp7-contracts/contracts/extensions/AccessControlExtended/
    IAccessControlExtended.sol              -- Interface (extends IAccessControlEnumerable)
    AccessControlExtendedAbstract.sol       -- Abstract implementation (constructor)
    AccessControlExtendedInitAbstract.sol   -- Proxy-compatible variant (initializer)
    AccessControlExtendedConstants.sol      -- Role constants (shared across extensions)
    AccessControlExtendedErrors.sol         -- Custom errors

packages/lsp8-contracts/contracts/extensions/AccessControlExtended/
    (identical copy of all files above)
```

### Pattern 6: Role Constants Defined Centrally, Consumed by Extensions

**What:** Role `bytes32` constants are defined in `AccessControlExtendedConstants.sol`, not in each extension.

**When:** Always -- avoids fragmented constant definitions.

**Example:**
```solidity
// AccessControlExtendedConstants.sol

// keccak256("MINTER_ROLE")
bytes32 constant _MINTER_ROLE = 0x...;

// keccak256("TRANSFER_ROLE")
bytes32 constant _TRANSFER_ROLE = 0x...;

// keccak256("UNCAPPED_ROLE")
bytes32 constant _UNCAPPED_ROLE = 0x...;

address constant _DEAD_ADDRESS = 0x000000000000000000000000000000000000dEaD;
```

**Rationale:** The existing `LSP7RoleOperatorsConstants.sol` defines `_MINT_ROLE`, `_ALLOW_TRANSFER_ROLE`, `_INFINITE_BALANCE_ROLE` in a single file. This pattern continues but with naming aligned to OZ conventions (`_MINTER_ROLE` instead of `_MINT_ROLE`). Naming decision is for implementation, but centralizing is the architectural choice.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Inheriting Both Allowlist and AccessControlExtended

**What:** An extension inheriting from both `LSP7AllowlistAbstract` and `AccessControlExtendedAbstract`.

**Why bad:** Both provide bypass mechanisms. Having two systems creates confusion, storage bloat, and conflicting authorization paths. The Allowlist is being replaced, not supplemented.

**Instead:** Each extension inherits from AccessControlExtended only. The Allowlist contracts (`LSP7AllowlistAbstract`, `LSP7AllowlistInitAbstract`) continue to exist for backward compatibility of other extensions (like `LSP7Votes`) but are NOT used by the updated extensions.

### Anti-Pattern 2: Extensions Defining Their Own hasRole() Logic

**What:** An extension re-implementing role-checking logic outside the OZ framework.

**Why bad:** The existing `LSP7RoleOperatorsAbstract` duplicated `hasRole()` and role management. This is exactly what is being eliminated.

**Instead:** Use `AccessControlEnumerable.hasRole(role, account)` from the OZ base. Extensions only need to define which role constants to check and where.

### Anti-Pattern 3: Putting Role Data in the AccessControl RoleData Struct

**What:** Trying to store auxiliary per-role-per-address data inside OZ's `AccessControl.RoleData` struct.

**Why bad:** OZ's `_roles` mapping is `private`, not `internal`. You cannot extend it. The struct only has `members` and `adminRole`.

**Instead:** AccessControlExtended maintains its own `_roleOperatorData` mapping alongside the OZ storage, exactly as the existing `LSP7RoleOperatorsAbstract` does. The `_grantRole` and `_revokeRole` overrides keep both systems in sync.

### Anti-Pattern 4: Using onlyOwner When onlyRole Would Work

**What:** Extension functions using `onlyOwner` when the purpose is role-based access.

**Why bad:** The whole point of AccessControlExtended is to move away from single-owner gating toward role-based gating. Using `onlyOwner` defeats the purpose for role-gated actions.

**Instead:** Use `onlyRole(ROLE_CONSTANT)` for role-gated functions. Reserve `onlyOwner` for truly owner-only administrative functions (like `disableMinting`).

### Anti-Pattern 5: Granting DEFAULT_ADMIN_ROLE to address(0) or Reserved Addresses

**What:** Giving the admin role to zero address, dead address, or other reserved addresses.

**Why bad:** `DEFAULT_ADMIN_ROLE` can grant/revoke any role. address(0) as admin is a security hole (anyone could impersonate address(0) in certain edge cases with delegatecall).

**Instead:** Only grant DEFAULT_ADMIN_ROLE to the contract owner. Grant specific bypass roles (_TRANSFER_ROLE, _UNCAPPED_ROLE) to reserved addresses.

## Critical Design Decisions

### 1. hasRole() Parameter Order Conflict

**Problem:** OZ's `hasRole(bytes32 role, address account)` has `role` first. The existing `ILSP7RoleOperators.hasRole(address operator, bytes32 role)` has `address` first. These are different function signatures.

**Resolution:** Use OZ's signature. The `IAccessControlExtended` interface extends `IAccessControlEnumerable` which inherits the `hasRole(bytes32, address)` signature. The old `ILSP7RoleOperators` interface is deleted entirely.

**Impact:** External consumers calling `hasRole()` must update their parameter order. This is a breaking change but acceptable since `LSP7RoleOperators` is being deleted.

### 2. AccessControl's Role Admin System vs onlyOwner

**Problem:** OZ AccessControl uses a role-admin hierarchy where `DEFAULT_ADMIN_ROLE` (0x00) is the admin for all roles by default. The existing codebase uses `onlyOwner` for role management.

**Resolution:** Grant `DEFAULT_ADMIN_ROLE` to the contract owner in the constructor. This means the owner can grant/revoke roles via OZ's standard `grantRole()`/`revokeRole()` functions. No need for custom `authorizeRoleOperator()`/`revokeRoleOperator()`.

**Additional consideration:** The contract owner and the DEFAULT_ADMIN_ROLE holder should stay in sync. If ownership is transferred, the new owner needs DEFAULT_ADMIN_ROLE too. This may require overriding `_transferOwnership()` or documenting that role admin transfer is separate.

### 3. AccessControl's ERC165 vs LSP7's ERC165

**Problem:** OZ AccessControl inherits `ERC165`. LSP7DigitalAsset inherits `ERC725Y` which also implements `supportsInterface`. Both chains merge at `supportsInterface`.

**Resolution:** Every concrete contract that inherits both must explicitly override `supportsInterface` listing all conflicting bases. This is already done in `LSP7CustomizableToken` for other diamond merges -- the pattern is established.

### 4. OZ Context._msgSender() vs msg.sender

**Problem:** OZ AccessControl uses `_msgSender()` from `Context`. LSP7DigitalAsset uses `msg.sender` directly. Both patterns coexist.

**Resolution:** No conflict. `Context._msgSender()` returns `msg.sender` by default. The behavior is identical unless meta-transactions are added later. This is a non-issue for the current architecture.

### 5. What Happens to LSP7Allowlist?

**Decision:** Allowlist contracts remain in the codebase but the three updated extensions (NonTransferable, CappedBalance, Mintable) no longer inherit from them. Other extensions that currently use Allowlist (if any) remain unaffected.

**Impact on CustomizableToken:** `LSP7CustomizableToken` currently inherits `LSP7AllowlistAbstract`. After the update, it inherits `AccessControlExtendedAbstract` instead (via the updated extension abstracts). The Allowlist constructor call is removed. The `_beforeTokenTransfer` diamond is resolved using the same pattern but with `hasRole()` checks instead of `isAllowlisted()`.

## Build Order (Dependency Graph)

Build order matters because of the inheritance chain. Each numbered step depends on the previous.

### Phase 1: Base Contract (no dependencies on extensions)

```
1. AccessControlExtendedConstants.sol    -- role bytes32 constants, no dependencies
2. AccessControlExtendedErrors.sol       -- custom errors, no dependencies
3. IAccessControlExtended.sol            -- interface extending IAccessControlEnumerable
4. AccessControlExtendedAbstract.sol     -- abstract, depends on (1), (2), (3), OZ AccessControlEnumerable, LSP7DigitalAsset
5. AccessControlExtendedInitAbstract.sol -- proxy variant, depends on (1), (2), (3), OZ AccessControlEnumerable, LSP7DigitalAssetInitAbstract
```

**Test:** Foundry tests for AccessControlExtended in isolation (role granting, revoking, data storage, reverse lookups, enumeration).

### Phase 2: Duplicate to LSP8 Package

```
6. Copy all 5 files from Phase 1 into packages/lsp8-contracts/contracts/extensions/AccessControlExtended/
7. Adjust imports: LSP7DigitalAsset -> LSP8IdentifiableDigitalAsset
```

**Test:** Same Foundry tests adapted for LSP8.

### Phase 3: Update Extensions (LSP7)

```
8.  LSP7NonTransferableAbstract.sol     -- change parent from AllowlistAbstract to AccessControlExtendedAbstract
9.  LSP7NonTransferableInitAbstract.sol -- change parent from AllowlistInitAbstract to AccessControlExtendedInitAbstract
10. LSP7CappedBalanceAbstract.sol       -- change parent from AllowlistAbstract to AccessControlExtendedAbstract
11. LSP7CappedBalanceInitAbstract.sol   -- change parent from AllowlistInitAbstract to AccessControlExtendedInitAbstract
12. LSP7MintableAbstract.sol            -- change parent from LSP7DigitalAsset to AccessControlExtendedAbstract, replace onlyOwner with role check
13. LSP7MintableInitAbstract.sol        -- same for proxy variant
```

**Dependencies between extensions:** NonTransferable, CappedBalance, and Mintable are independent -- they can be updated in any order. All depend only on AccessControlExtended (Phase 1).

### Phase 4: Update Extensions (LSP8)

```
14-19. Same changes as Phase 3, but for LSP8 variants
```

### Phase 5: Update Composite Contracts

```
20. LSP7CustomizableToken.sol           -- update inheritance list, resolve _beforeTokenTransfer diamond, update constructor
21. LSP7CustomizableTokenInit.sol       -- proxy variant
22. LSP8CustomizableToken.sol (if exists)
23. LSP8CustomizableTokenInit.sol (if exists)
```

### Phase 6: Delete Old Code

```
24. Delete packages/lsp7-contracts/contracts/extensions/LSP7RoleOperators/ (entire directory)
25. Remove RoleOperators imports/references from any remaining files
```

### Phase 7: Update Interfaces

```
26. Update ILSP7NonTransferable if needed (no allowlist references)
27. Update ILSP7CappedBalance if needed
28. Update ILSP7Mintable if needed
```

## Diamond Inheritance Resolution

The most architecturally complex part is resolving the diamond inheritance in composite contracts like `LSP7CustomizableToken`. Here is the complete resolution:

### Current Diamond

```
LSP7CustomizableToken
    |-- LSP7MintableAbstract ---------> LSP7DigitalAsset
    |-- LSP7NonTransferableAbstract --> LSP7AllowlistAbstract --> LSP7DigitalAsset
    |-- LSP7CappedBalanceAbstract ----> LSP7AllowlistAbstract --> LSP7DigitalAsset
    |-- LSP7CappedSupplyAbstract -----> LSP7DigitalAsset
    |-- LSP7Burnable -----------------> LSP7DigitalAsset
```

**Conflicts resolved in current code:**
- `_beforeTokenTransfer`: overridden to call both NonTransferable and CappedBalance
- `_mint`: overridden to check mintable + supply cap
- `supportsInterface`: overridden listing all bases

### New Diamond

```
LSP7CustomizableToken
    |-- LSP7MintableAbstract ---------> AccessControlExtendedAbstract --> LSP7DigitalAsset
    |-- LSP7NonTransferableAbstract --> AccessControlExtendedAbstract --> LSP7DigitalAsset
    |-- LSP7CappedBalanceAbstract ----> AccessControlExtendedAbstract --> LSP7DigitalAsset
    |-- LSP7CappedSupplyAbstract -----> LSP7DigitalAsset
    |-- LSP7Burnable -----------------> LSP7DigitalAsset
```

**New conflicts to resolve:**
- `_beforeTokenTransfer`: same pattern as before, but using `hasRole()` instead of `isAllowlisted()`
- `supportsInterface`: must now also include `AccessControlEnumerable.supportsInterface`
- `_grantRole` / `_revokeRole`: only one override needed (from AccessControlExtended) since Solidity C3 linearization ensures single path
- `grantRole` / `revokeRole`: inherited from OZ, no conflict (these don't exist on LSP7DigitalAsset)

### C3 Linearization

For `LSP7CustomizableToken` inheriting `(LSP7MintableAbstract, LSP7NonTransferableAbstract, LSP7CappedBalanceAbstract, ...)`:

All three inherit from `AccessControlExtendedAbstract` which inherits from `LSP7DigitalAsset`. Solidity's C3 linearization will place `AccessControlExtendedAbstract` once in the chain, before `LSP7DigitalAsset`. This means:

1. `hasRole()` is available to all extensions through a single path
2. `_grantRole()` / `_revokeRole()` overrides in AccessControlExtended apply once
3. No storage duplication -- the role mappings exist once

## Gas Considerations

| Operation | Current (Allowlist) | New (AccessControlExtended) | Delta |
|-----------|--------------------|-----------------------------|-------|
| Check bypass | `_allowlist.contains(addr)` ~2100 gas (SLOAD) | `hasRole(role, addr)` ~2100 gas (SLOAD) | Neutral |
| Grant privilege | `addToAllowlist(addr)` -- one SSTORE | `grantRole(role, addr)` -- one SSTORE + role members set + reverse mapping | +~5000 gas |
| Revoke privilege | `removeFromAllowlist(addr)` | `revokeRole(role, addr)` | +~5000 gas |
| Storage overhead | 1 EnumerableSet | OZ role mapping + EnumerableSet (from AccessControlEnumerable) + reverse EnumerableSet + data mapping | Higher |

**Assessment:** Grant/revoke operations are admin actions called infrequently. The per-transfer cost (the hot path) is identical -- a single `hasRole()` SLOAD check. The architecture prioritizes correctness and flexibility over admin-action gas optimization.

## Sources

- OpenZeppelin Contracts v4.9.6 -- `AccessControl.sol`, `AccessControlEnumerable.sol`, `IAccessControl.sol`, `IAccessControlEnumerable.sol` (read directly from node_modules)
- Existing codebase: `LSP7RoleOperatorsAbstract.sol`, `LSP7AllowlistAbstract.sol`, `LSP7NonTransferableAbstract.sol`, `LSP7CappedBalanceAbstract.sol`, `LSP7MintableAbstract.sol`, `LSP7DigitalAsset.sol`, `LSP7CustomizableToken.sol` and all InitAbstract variants
- Existing LSP8 mirrors: `LSP8NonTransferableAbstract.sol`, `LSP8CappedBalanceAbstract.sol`, `LSP8MintableAbstract.sol`
- Confidence: HIGH -- all conclusions derived from reading actual source code, not external documentation
