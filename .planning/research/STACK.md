# Technology Stack

**Project:** AccessControlExtended
**Researched:** 2026-02-27
**Dimension:** Stack -- OZ AccessControlEnumerable extension patterns

## Executive Decision

**Do NOT inherit from OZ AccessControlEnumerable directly.** Instead, compose the existing `EnumerableSet` primitives (already used throughout the codebase) into a custom `AccessControlExtended` contract that mirrors the OZ AccessControlEnumerable API shape but avoids the diamond inheritance conflicts with `LSP7DigitalAsset`.

**Rationale:** OZ `AccessControl` inherits from `Context`, `ERC165`, and `IAccessControl`. `LSP7DigitalAsset` already has its own ERC165 chain (`ERC725Y -> LSP17Extendable`), its own `supportsInterface` override, and uses `msg.sender` (not `_msgSender()`). Mixing in OZ's `AccessControl` creates an unresolvable diamond of `supportsInterface` overrides and introduces `Context._msgSender()` alongside the existing `msg.sender` pattern. The existing `LSP7RoleOperators` already proves this composing-from-primitives approach works.

## Recommended Stack

### Core Contracts (OZ 4.9.6)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `@openzeppelin/contracts` | 4.9.6 (installed) | EnumerableSet library, ERC165Checker | Already a dependency. Provides battle-tested set data structures. Do NOT upgrade to v5.x -- would break the entire codebase. |
| `EnumerableSet.AddressSet` | 4.9.6 | Role-to-members mapping | O(1) add/remove/contains, O(n) enumeration. Already used by LSP7RoleOperators and LSP7Allowlist. |
| `EnumerableSet.Bytes32Set` | 4.9.6 | Address-to-roles reverse mapping | O(1) role lookup per address. Already used by LSP7RoleOperators for `_operatorRoles`. |
| Solidity | ^0.8.27 | Contract pragma | Both LSP7 (0.8.27) and LSP8 (0.8.27) Foundry profiles compile with this version. Compatible with OZ 4.9.6 (`pragma ^0.8.0`). |

### Testing

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Foundry (forge) | Current | Unit/integration tests | Already the test framework for LSP7/LSP8. Uses profiles `[profile.lsp7]` and `[profile.lsp8]`. |

## OZ 4.9.6 AccessControlEnumerable -- API Reference (Verified from Source)

**Confidence: HIGH** -- Read directly from `node_modules/@openzeppelin/contracts/access/AccessControlEnumerable.sol` (installed v4.9.6).

### Inheritance Chain

```
AccessControlEnumerable
  -> IAccessControlEnumerable (getRoleMember, getRoleMemberCount)
  -> AccessControl
       -> IAccessControl (hasRole, getRoleAdmin, grantRole, revokeRole, renounceRole)
       -> Context (_msgSender, _msgData)
       -> ERC165 (supportsInterface)
```

### Key Internal Functions to Mirror

| Function | Signature (v4.9.6) | Behavior |
|----------|---------------------|----------|
| `_grantRole` | `function _grantRole(bytes32 role, address account) internal virtual` | Returns **void** in v4. Checks `!hasRole()` before granting. Emits `RoleGranted`. |
| `_revokeRole` | `function _revokeRole(bytes32 role, address account) internal virtual` | Returns **void** in v4. Checks `hasRole()` before revoking. Emits `RoleRevoked`. |
| `_checkRole` | `function _checkRole(bytes32 role) internal view virtual` | Reverts with string `"AccessControl: account 0x... is missing role 0x..."`. |
| `_setRoleAdmin` | `function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal virtual` | Emits `RoleAdminChanged`. |
| `hasRole` | `function hasRole(bytes32 role, address account) public view virtual returns (bool)` | Parameter order is `(role, account)` -- NOT `(account, role)`. |

### Key Difference: hasRole Parameter Order

The existing `LSP7RoleOperators.hasRole` uses `(address operator, bytes32 role)`. OZ uses `(bytes32 role, address account)`. AccessControlExtended **must adopt OZ parameter order** `(bytes32 role, address account)` for compatibility with the OZ `IAccessControl` interface and the `onlyRole` modifier.

### v4.9.6 vs v5.x Differences (Do Not Upgrade)

| Aspect | v4.9.6 (Current) | v5.x |
|--------|-------------------|------|
| `_grantRole` return | `void` | `bool` |
| `_revokeRole` return | `void` | `bool` |
| `_checkRole` revert | String message via `abi.encodePacked` | Custom error `AccessControlUnauthorizedAccount(address, bytes32)` |
| Min Solidity | `^0.8.0` | `^0.8.24` |
| Import path | `access/AccessControlEnumerable.sol` | `access/extensions/AccessControlEnumerable.sol` |
| `getRoleMembers()` | Not available | Added in v5.1.0, returns `address[] memory` |
| Upgradeable variant | Separate `@openzeppelin/contracts-upgradeable` package | Separate package |
| Namespaced storage | Not used | Used (ERC-7201) |

**Why not upgrade:** v5.x changes return types of `_grantRole`/`_revokeRole`, changes error handling from strings to custom errors, and requires Solidity ^0.8.24. The entire LUKSO contracts ecosystem depends on OZ 4.9.6. Upgrading is a multi-package breaking change outside scope.

## Storage Architecture for AccessControlExtended

**Confidence: HIGH** -- Based on verified OZ source code patterns and existing LSP7RoleOperators implementation.

### Three Storage Mappings Required

```solidity
// 1. Role -> Members (same as OZ AccessControlEnumerable)
mapping(bytes32 role => EnumerableSet.AddressSet members) internal _roleMembers;

// 2. Role -> Member -> Auxiliary Data (NEW: not in OZ)
mapping(bytes32 role => mapping(address account => bytes data)) internal _roleData;

// 3. Address -> Roles reverse lookup (NEW: not in OZ)
mapping(address account => EnumerableSet.Bytes32Set roles) internal _accountRoles;
```

### Why This Pattern

**Mapping 1 (`_roleMembers`):** Direct equivalent of OZ's `_roleMembers` in `AccessControlEnumerable`. Uses `EnumerableSet.AddressSet` for O(1) membership checks and O(n) enumeration. This is the canonical pattern.

**Mapping 2 (`_roleData`):** Stores arbitrary `bytes` data per role-address pair. The existing `LSP7RoleOperators` already uses this exact pattern as `_roleOperatorData`. Use `bytes` (not a fixed struct) because different extensions need different data shapes -- a capped balance extension might store a `uint256` cap, while a mintable extension needs no data. Keeping it as raw `bytes` maximizes flexibility while letting each extension decode as needed.

**Mapping 3 (`_accountRoles`):** Reverse lookup from address to set of roles. The existing `LSP7RoleOperators` already uses this as `_operatorRoles`. Essential for answering "what can this address do?" without iterating all possible roles. Uses `EnumerableSet.Bytes32Set` for O(1) role-check and O(n) enumeration per address.

### Storage Gas Costs

| Operation | Gas (approx) | Notes |
|-----------|-------------|-------|
| `grantRole` (new member) | ~65k | 3 SSTORE ops: membership bool, AddressSet entry, Bytes32Set entry |
| `grantRole` (existing) | ~5k | No-op, just reads |
| `revokeRole` | ~30k | 3 SSTORE ops: clear membership, remove from AddressSet, remove from Bytes32Set |
| `hasRole` | ~2.6k | Single SLOAD from AddressSet contains() |
| `getRolesFor` | ~2.6k + n*2.1k | Reads Bytes32Set values() -- unbounded, OK for view calls |
| `setRoleData` | ~22k (new) / ~5k (update) | Single SSTORE for bytes data |

### Why NOT Inherit OZ AccessControl Directly

1. **ERC165 Diamond Problem:** `LSP7DigitalAsset.supportsInterface()` overrides `(ERC725Y, LSP17Extendable)`. OZ `AccessControl.supportsInterface()` overrides `ERC165`. Combining them requires resolving a 3-way diamond -- error-prone and fragile to maintain.

2. **Context Mismatch:** OZ `AccessControl` inherits `Context` and uses `_msgSender()`. The LSP7 codebase uses `msg.sender` directly. Introducing `Context` into the inheritance chain could cause subtle bugs if any meta-transaction relay is ever introduced on one path but not the other.

3. **Admin Role Model Mismatch:** OZ's `grantRole` requires `onlyRole(getRoleAdmin(role))` -- the caller must hold the admin role for the target role. The existing pattern uses `onlyOwner` -- the contract owner manages all roles. AccessControlExtended should use `onlyOwner` to match the existing codebase convention, overriding OZ's role-admin model. This is simpler but means we lose nothing by not inheriting.

4. **InitAbstract Pattern Mismatch:** The project's InitAbstract pattern uses `__ContractName_init` / `__ContractName_init_unchained` with `onlyInitializing`. OZ's Upgradeable variants follow the same pattern BUT the LSP7 InitAbstract contracts inherit from `LSP7DigitalAssetInitAbstract`, not from OZ's `Initializable` directly. The `onlyInitializing` modifier comes from the LSP4 -> ERC725Y chain, not from OZ's `Initializable`. Mixing OZ's `AccessControlUpgradeable` (which imports its own `Initializable`) with the existing LUKSO `onlyInitializing` could cause initialization guard conflicts.

**Bottom line:** Composing from `EnumerableSet` (like the existing code does) is cleaner, simpler, and avoids 4 distinct integration hazards. The AccessControlExtended contract will be a standalone abstract that uses OZ's data structures but not OZ's inheritance chain.

## API Design Recommendations

### Follow OZ Naming Conventions (Not LSP7RoleOperators)

| Current (LSP7RoleOperators) | Recommended (AccessControlExtended) | Why |
|------------------------------|--------------------------------------|-----|
| `authorizeRoleOperator(role, operator, data)` | `grantRole(bytes32 role, address account)` + separate `setRoleData()` | Match OZ `IAccessControl` naming. Separate grant from data-set for clarity. |
| `revokeRoleOperator(role, operator)` | `revokeRole(bytes32 role, address account)` | Match OZ naming. |
| `hasRole(address, bytes32)` | `hasRole(bytes32 role, address account)` | Match OZ parameter order. |
| `getRolesFor(address)` | `getRolesOf(address account)` | Slight rename for clarity. Not in OZ -- this is our extension. |
| `getOperatorsCountForRole(role)` | `getRoleMemberCount(bytes32 role)` | Match OZ `IAccessControlEnumerable` naming. |
| `getRoleOperatorsByIndex(role, start, end)` | `getRoleMembersByIndex(bytes32 role, uint256 start, uint256 end)` | Match OZ naming pattern, keep pagination. |
| `setRoleOperatorData(role, operator, data)` | `setRoleData(bytes32 role, address account, bytes data)` | Cleaner naming. |
| `getRoleOperatorData(role, operator)` | `getRoleData(bytes32 role, address account)` | Cleaner naming. |
| N/A | `grantRoleWithData(bytes32 role, address account, bytes data)` | Convenience function for atomic grant+data. |

### Events

```solidity
// Mirror OZ events for tooling compatibility
event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);

// Extension-specific events (carry over from RoleOperators)
event RoleDataChanged(bytes32 indexed role, address indexed account, bytes data);
```

### Error Pattern

Use custom errors (matching existing codebase convention):

```solidity
error AccessControlExtendedUnauthorizedAccount(address account, bytes32 role);
error AccessControlExtendedInvalidIndexRange(uint256 startIndex, uint256 endIndex, uint256 length);
```

## Dual Variant Strategy (Abstract + InitAbstract)

**Confidence: HIGH** -- Verified from 3+ existing extensions (Allowlist, NonTransferable, RoleOperators).

### Abstract Variant

```solidity
abstract contract AccessControlExtendedAbstract is
    IAccessControlExtended,
    LSP7DigitalAsset  // or LSP8IdentifiableDigitalAsset for LSP8 copy
{
    // Storage + logic
    // Constructor for initial role setup (e.g., grant DEFAULT_ADMIN_ROLE to owner)
    constructor(address newOwner_) {
        _grantRole(DEFAULT_ADMIN_ROLE, newOwner_);
    }
}
```

### InitAbstract Variant

```solidity
abstract contract AccessControlExtendedInitAbstract is
    IAccessControlExtended,
    LSP7DigitalAssetInitAbstract  // or LSP8 variant
{
    // Same storage + logic

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
}
```

### File Structure Per Package

```
packages/lsp7-contracts/contracts/extensions/AccessControlExtended/
  IAccessControlExtended.sol          -- Interface
  AccessControlExtendedAbstract.sol   -- Constructor variant
  AccessControlExtendedInitAbstract.sol -- Proxy/initializable variant
  AccessControlExtendedErrors.sol     -- Custom errors
  AccessControlExtendedConstants.sol  -- DEFAULT_ADMIN_ROLE constant
```

Duplicated identically in `packages/lsp8-contracts/contracts/extensions/AccessControlExtended/` per project constraint.

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Base contract | Compose from EnumerableSet | Inherit OZ AccessControlEnumerable | ERC165 diamond, Context mismatch, admin model mismatch, InitAbstract conflicts (see detailed section above) |
| OZ version | Stay on 4.9.6 | Upgrade to 5.x | Breaking changes across entire monorepo, different `_grantRole`/`_revokeRole` signatures, different error model |
| Role data storage | `bytes` (flexible) | Fixed struct per role type | Different extensions need different data shapes; bytes is more flexible and matches existing pattern |
| Reverse lookup | `EnumerableSet.Bytes32Set` per address | Off-chain indexing via events | On-chain reverse lookup is a stated requirement; events-only wouldn't satisfy `getRolesOf()` |
| Admin model | `onlyOwner` (matching codebase) | OZ role-admin hierarchy | The codebase uses `onlyOwner` consistently; role-admin adds complexity without benefit for this use case |
| Package sharing | Duplicate in lsp7 + lsp8 | Shared package | Project constraint: no new internal packages |
| Upgradeable | Use existing LUKSO `onlyInitializing` chain | Use OZ `AccessControlUpgradeable` | Initialization guard conflict risk; not listed as a dependency in lsp7-contracts |

## Solidity Compiler Considerations

| Concern | Detail | Impact |
|---------|--------|--------|
| Pragma | `^0.8.27` for new contracts | Compatible with OZ 4.9.6 (`^0.8.0`) and Foundry profiles |
| via_ir | Enabled for both lsp7 and lsp8 profiles | May affect stack-too-deep with deep inheritance; test early |
| optimizer | Enabled, 1000 runs | Standard for production contracts |
| EVM target | Prague (per PROJECT.md for LSP7) | Check OZ 4.9.6 compatibility with Prague opcodes -- LOW risk since we only use EnumerableSet |

## Installation

No new dependencies needed. Everything uses existing packages:

```bash
# Already installed:
# @openzeppelin/contracts ^4.9.6  (provides EnumerableSet)
# No new npm installs required
```

## Sources

- **OZ AccessControlEnumerable v4.9.6 source:** Read from `node_modules/@openzeppelin/contracts/access/AccessControlEnumerable.sol` -- HIGH confidence
- **OZ AccessControl v4.9.6 source:** Read from `node_modules/@openzeppelin/contracts/access/AccessControl.sol` -- HIGH confidence
- **OZ IAccessControl v4.9.6 source:** Read from `node_modules/@openzeppelin/contracts/access/IAccessControl.sol` -- HIGH confidence
- **OZ IAccessControlEnumerable v4.9.6 source:** Read from `node_modules/@openzeppelin/contracts/access/IAccessControlEnumerable.sol` -- HIGH confidence
- **OZ AccessControlEnumerableUpgradeable v4.9.6:** Read from `node_modules/@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol` -- HIGH confidence
- **OZ AccessControlEnumerable v5.5.0 source:** [GitHub master branch](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/extensions/AccessControlEnumerable.sol) -- MEDIUM confidence (WebFetch)
- **OZ v4 vs v5 breaking changes:** [OZ v5 release notes](https://www.openzeppelin.com/news/introducing-openzeppelin-contracts-5.0), [OZ docs v4](https://docs.openzeppelin.com/contracts/4.x/api/access), [OZ docs v5](https://docs.openzeppelin.com/contracts/5.x/access-control) -- MEDIUM confidence (WebSearch)
- **Existing LSP7RoleOperators implementation:** Read from source -- HIGH confidence
- **Existing LSP7Allowlist implementation:** Read from source -- HIGH confidence
- **Existing LSP7NonTransferable implementation:** Read from source -- HIGH confidence
- **Foundry profiles:** Read from `foundry.toml` -- HIGH confidence
- **Package dependencies:** Read from `packages/lsp7-contracts/package.json` -- HIGH confidence

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| OZ 4.9.6 API surface | HIGH | Read directly from installed source code |
| Storage pattern recommendation | HIGH | Matches proven existing pattern in LSP7RoleOperators |
| Diamond inheritance avoidance | HIGH | Verified by reading both inheritance chains |
| OZ v5 differences | MEDIUM | WebFetch of GitHub source + WebSearch; return type change confirmed from v5 source |
| Gas cost estimates | LOW | Approximate from known SSTORE costs; not benchmarked on this specific contract |
| EVM Prague compatibility | LOW | Not verified; flagged as needing testing |
