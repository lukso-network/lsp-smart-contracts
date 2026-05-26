# Invariants

## packages/lsp7-contracts/contracts/presets/LSP7CustomizableToken.sol & LSP7CustomizableTokenInit.sol

### 1. Capped supply is never exceeded by any mint, including initial mint.

**Function:** `_mint + _initialMint`

```solidity
If configuredTokenSupplyCap := LSP7CappedSupply{Init}Abstract.tokenSupplyCap() and configuredTokenSupplyCap != 0, then after any successful mint/initialMint: totalSupply() <= configuredTokenSupplyCap
```

### 2. If minting is disabled (isMintable==false), totalSupply must be constant across all future calls (no inflation).

**Function:** `Contract-wide`

```solidity
isMintable == false => totalSupply() cannot increase between any two states reachable by external calls
```

### 3. Total supply must equal the sum of all balances (accounting conservation).

**Function:** `Contract-wide (LSP7 state)`

```solidity
totalSupply() == Σ balanceOf(a) over all addresses a (as tracked by the token’s internal accounting); mint increases both totalSupply and recipient balance by same amount; burn decreases both by same amount; transfers keep totalSupply unchanged
```

### 4. Revocation bypass must not enable arbitrary transfers to non-owner / non-revoker destinations.

**Function:** `revoke (as mediated by _nonTransferableCheck)`

```solidity
Any successful revoke-based movement of tokens that bypasses non-transferable checks must have destination to == owner() OR hasRole(REVOKER_ROLE,to)
```

### 5. Balance-cap enforcement is never bypassed except for recipients explicitly exempted by role (and any documented hardcoded exceptions in the extension).

**Function:** `_beforeTokenTransfer (via LSP7CappedBalance{Init}Abstract)`

```solidity
For any transfer/mint resulting in recipientBalanceAfter := balanceOf(to) after mutation: if tokenBalanceCap != 0 and !hasRole(UNCAPPED_BALANCE_ROLE,to) (and to is not an explicitly exempt hardcoded sink if applicable), then recipientBalanceAfter <= tokenBalanceCap
```

### 6. When transfer lock is active, transfers must be blocked unless sender holds NON_TRANSFERABLE_BYPASS_ROLE or operation is mint/burn/revocation-bypass path.

**Function:** `_beforeTokenTransfer (via LSP7NonTransferable{Init}Abstract)`

```solidity
If transfer lock is enabled and current timestamp is within the locked interval (per extension semantics), then any successful non-mint (from!=0) and non-burn (to!=0) transfer must satisfy hasRole(NON_TRANSFERABLE_BYPASS_ROLE, from) OR the transfer is the revoke bypass case described in _nonTransferableCheck
```

### 7. No unauthorized path exists to bypass ownership/role-gated state transitions through ownership sync side-effects.

**Function:** `_transferOwnership (token presets overriding multiple parents)`

```solidity
After any successful ownership transfer, the new owner must end up able to administer roles (i.e., hasRole(DEFAULT_ADMIN_ROLE,newOwner)==true when newOwner!=0), and the old owner must not retain roles that were intended to migrate (i.e., roles formerly held solely due to being owner do not remain assigned unless explicitly granted independently)
```

## packages/lsp7-contracts/contracts/extensions/AccessControlExtended/AccessControlExtendedAbstract.sol & AccessControlExtendedInitAbstract.sol

### 8. DEFAULT_ADMIN_ROLE is always held by the current owner (cannot be lost), preventing administrative lockout.

**Function:** `Contract-wide`

```solidity
hasRole(DEFAULT_ADMIN_ROLE, owner()) == true in all reachable states
```

### 9. Role membership forward and reverse indexes are always consistent.

**Function:** `Contract-wide (AccessControlExtended)`

```solidity
For all accounts a and roles r: hasRole(r,a) == true <=> r is contained in rolesOf(a); additionally, getRoleMemberCount(r) equals the cardinality of addresses returned by getRoleMembers(r), and every address returned by getRoleMembers(r) satisfies hasRole(r,addr)==true
```

### 10. Role grant/revoke operations are idempotent and do not corrupt enumeration.

**Function:** `grantRole / revokeRole / _grantRole / _revokeRole`

```solidity
Granting a role already held must not change rolesOf(account) or getRoleMembers(role) sets; revoking a role not held must not change them; in all cases, no duplicates can exist in getRoleMembers(role) or rolesOf(account)
```

### 11. Ownership transfer atomically migrates all roles from old owner to new owner (unless newOwner is zero).

**Function:** `_transferOwnership (AccessControlExtended)`

```solidity
Let R_old be the set of roles held by oldOwner immediately before transfer. After successful _transferOwnership(newOwner!=0): for each r in R_old, hasRole(r, oldOwner)==false and hasRole(r, newOwner)==true. After renounce (newOwner==0): for each r in R_old, hasRole(r, oldOwner)==false (and no roles are granted to address(0)).
```

## packages/lsp7-contracts/contracts/presets/LSP7CustomizableTokenInit.sol & LSP7MintableInit.sol

### 12. Proxy implementations cannot be initialized via constructors and can only be initialized once.

**Function:** `constructor / initialize`

```solidity
For *Init contracts, constructor must call _disableInitializers(), and initialize(...) (guarded by initializer) can succeed at most once per proxy instance
```

## packages/lsp7-contracts/contracts/extensions/LSP7CappedBalance/LSP7CappedBalanceInitAbstract.sol

### 13. Capped balance cap value is write-once during initialization (init/proxy variant)

**Function:** `Contract-wide`

```solidity
After initialization completes, tokenBalanceCap() remains equal to the initialized _tokenBalanceCap for the lifetime of the proxy
```

## packages/lsp7-contracts/contracts/extensions/LSP7CappedBalance/LSP7CappedBalanceAbstract.sol

### 14. Balance cap enforcement for non-exempt recipients when cap enabled

**Function:** `_beforeTokenTransfer / _tokenBalanceCapCheck`

```solidity
If tokenBalanceCap() != 0 and to not in {address(0), 0x000000000000000000000000000000000000dEaD} and !hasRole(UNCAPPED_BALANCE_ROLE,to), then any successful transfer/mint that increases balanceOf(to) must satisfy balanceOf(to) <= tokenBalanceCap() after state update
```

## packages/lsp7-contracts/contracts/extensions/LSP7CappedSupply/LSP7CappedSupplyInitAbstract.sol

### 15. Supply cap value is write-once during initialization (init/proxy variant)

**Function:** `Contract-wide`

```solidity
After initialization completes, tokenSupplyCap() remains equal to the initialized _tokenSupplyCap for the lifetime of the proxy
```

## packages/lsp7-contracts/contracts/extensions/LSP7CappedSupply/LSP7CappedSupplyAbstract.sol

### 16. Minting that would exceed supply cap must always revert

**Function:** `_tokenSupplyCapCheck`

```solidity
If tokenSupplyCap() != 0 and totalSupply()+amount > tokenSupplyCap(), then _mint(to,amount,*,*) must revert
```

## packages/lsp7-contracts/contracts/extensions/LSP7Mintable/LSP7MintableAbstract.sol

### 17. Minting status is monotonic: once disabled it can never be re-enabled

**Function:** `disableMinting / Contract-wide`

```solidity
isMintable can transition true -> false at most once; there is no reachable state transition false -> true
```

### 18. If isMintable is false then any mint attempt must revert (even by MINTER_ROLE)

**Function:** `mint / _mint`

```solidity
When isMintable == false, any call path reaching LSP7MintableAbstract._mint must revert with LSP7MintDisabled()
```

### 19. On ownership transfer, admin hierarchy for MINTER_ROLE is reset to DEFAULT_ADMIN_ROLE

**Function:** `_transferOwnership`

```solidity
After any successful ownership transfer, getRoleAdmin(MINTER_ROLE) == DEFAULT_ADMIN_ROLE
```

## packages/lsp7-contracts/contracts/extensions/LSP7NonTransferable/LSP7NonTransferableAbstract.sol

### 20. Transferability kill-switch is monotonic: once made transferable, lock can never be re-enabled

**Function:** `makeTransferable / Contract-wide`

```solidity
transferLockEnabled can transition true -> false at most once; there is no reachable state transition false -> true
```

### 21. If transferLockEnabled is false then lock parameters are cleared

**Function:** `makeTransferable / Contract-wide`

```solidity
transferLockEnabled == false implies transferLockStart == 0 and transferLockEnd == 0 and isTransferable() == true
```

### 22. Non-transferable restriction: regular transfers must be blocked when not transferable

**Function:** `_beforeTokenTransfer / _nonTransferableCheck`

```solidity
For any transfer where from != address(0) and to != address(0) and !hasRole(NON_TRANSFERABLE_BYPASS_ROLE,from): the transfer can only succeed if isTransferable() == true
```

### 23. On ownership transfer, admin hierarchy for NON_TRANSFERABLE_BYPASS_ROLE is reset to DEFAULT_ADMIN_ROLE

**Function:** `_transferOwnership`

```solidity
After any successful ownership transfer, getRoleAdmin(NON_TRANSFERABLE_BYPASS_ROLE) == DEFAULT_ADMIN_ROLE
```

## packages/lsp7-contracts/contracts/extensions/LSP7Revokable/LSP7RevokableAbstract.sol

### 24. Revokable status is monotonic: once disabled it can never be re-enabled

**Function:** `disableRevokable / Contract-wide`

```solidity
isRevokable() can transition true -> false at most once; there is no reachable state transition false -> true
```

### 25. After ownership transfer, REVOKER_ROLE member set is cleared except for the new owner

**Function:** `_transferOwnership`

```solidity
After a successful ownership transfer, for all addresses a != newOwner: hasRole(REVOKER_ROLE,a) == false (i.e., the only remaining revoker is the new owner)
```

## packages/lsp8-contracts/contracts/presets/LSP8CustomizableToken.sol

### 26. Total supply equals number of existing tokenIds (no phantom supply).

**Function:** `Contract-wide (LSP8*)`

```solidity
totalSupply() == |{ tokenId : tokenOwnerOf(tokenId) != address(0) }|
```

### 27. Balances sum to total supply (conservation across owners).

**Function:** `Contract-wide (LSP8*)`

```solidity
sum_over_all_owners(balanceOf(owner)) == totalSupply()
```

### 28. Token existence is equivalent to having a non-zero owner, and nonexistent tokens cannot be transferred/burned/revoked as existing ones.

**Function:** `Contract-wide (LSP8*)`

```solidity
tokenId exists iff tokenOwnerOf(tokenId) != address(0); any transfer/burn/revoke referencing a tokenId must require tokenOwnerOf(tokenId) == from (or equivalent existence check).
```

### 29. Transfer updates balances by exactly ±1 and moves tokenId ownership exactly once.

**Function:** `transfer / internal transfer hook chain`

```solidity
If a transfer of tokenId from A to B succeeds with A != B, then balanceOf(A) decreases by 1, balanceOf(B) increases by 1, and tokenOwnerOf(tokenId) becomes B.
```

### 30. Mint updates supply and recipient balance by exactly +1 and assigns ownership to recipient.

**Function:** `mint / _mint / internal mint path`

```solidity
If mint(to, tokenId, ...) succeeds, then tokenOwnerOf(tokenId) == to, balanceOf(to) increases by 1, and totalSupply() increases by 1.
```

### 31. Burn updates supply and holder balance by exactly -1 and clears token ownership.

**Function:** `burn / internal burn path`

```solidity
If burn(from, tokenId, ...) succeeds, then tokenOwnerOf(tokenId) == address(0), balanceOf(from) decreases by 1, and totalSupply() decreases by 1.
```

### 32. Capped supply is never exceeded by any mint after deployment/initialization.

**Function:** `_mint (via LSP8CappedSupply*(Abstract))`

```solidity
If configured supply cap != 0 then totalSupply() <= configuredSupplyCap always holds, and any mint that would make totalSupply()+1 > configuredSupplyCap must revert.
```

### 33. Capped balance is enforced for recipients that are not exempt.

**Function:** `_beforeTokenTransfer (via LSP8CappedBalance*(Abstract))`

```solidity
If tokenBalanceCap != 0 and recipient `to` does NOT have UNCAPPED_BALANCE_ROLE and to != address(0), then balanceOf(to) after transfer/mint must be <= tokenBalanceCap; otherwise the operation must revert.
```

### 34. Non-transferable lock is enforced for senders that are not exempt (except burn/mint), with the specified lock window semantics.

**Function:** `_beforeTokenTransfer / _nonTransferableCheck (via LSP8NonTransferable*(Abstract))`

```solidity
During the active lock window (per transferLockStart/transferLockEnd semantics), any transfer with from != address(0) and to != address(0) must revert unless `from` has NON_TRANSFERABLE_BYPASS_ROLE or another explicit bypass condition applies.
```

### 35. Revocation feature flag correctness: when revocation is disabled, revocation-related state transitions cannot occur.

**Function:** `revoke / isRevokable gated logic (in revokable extensions)`

```solidity
If isRevokable() == false then any call that would perform a revoke transfer/burn must revert or be unreachable; supply/ownership cannot change via revoke.
```

## packages/lsp8-contracts/contracts/extensions/AccessControlExtended/AccessControlExtendedAbstract.sol

### 36. AccessControl forward and reverse enumerations remain consistent.

**Function:** `Contract-wide (AccessControlExtended*)`

```solidity
For all roles R and accounts A: hasRole(R,A) == true iff (A ∈ getRoleMembers(R)) iff (R ∈ rolesOf(A)).
```

### 37. Current owner always retains DEFAULT_ADMIN_ROLE (no administrative lockout).

**Function:** `revokeRole / renounceRole / ownership transfer hook`

```solidity
It is impossible for (role == DEFAULT_ADMIN_ROLE && account == owner()) to be revoked or renounced; after any successful ownership transfer to newOwner!=address(0), hasRole(DEFAULT_ADMIN_ROLE,newOwner) == true.
```

### 38. Ownership transfer migrates all roles from old owner to new owner (except on renounce).

**Function:** `_transferOwnership (AccessControlExtended*)`

```solidity
On successful _transferOwnership(newOwner!=address(0)): for every role R that oldOwner held immediately before transfer, newOwner holds R afterwards, and oldOwner does not hold R afterwards.
```

### 39. Renouncing ownership clears roles from old owner and does not assign roles to address(0).

**Function:** `_transferOwnership (AccessControlExtended*) via renounceOwnership`

```solidity
On successful ownership renounce (newOwner == address(0)): for every role R that oldOwner held immediately before renounce, oldOwner does not hold R afterwards, and no role membership is granted to address(0).
```

## packages/lsp8-contracts/contracts/presets/LSP8CustomizableTokenInit.sol

### 40. Upgradeable implementations are not initializable after deployment (implementation lock).

**Function:** `constructor (Init presets)`

```solidity
For LSP8CustomizableTokenInit and LSP8MintableInit implementation contracts, _disableInitializers() is executed in the constructor, so calling initialize on the implementation address must revert.
```

## packages/lsp8-contracts/contracts/extensions/LSP8CappedBalance/\*

### 41. Capped balance: if balance cap is enabled, no non-exempt, non-burn recipient can ever end up holding more than the cap after any transfer/mint.

**Function:** `LSP8CappedBalanceAbstract._beforeTokenTransfer / LSP8CappedBalanceInitAbstract._beforeTokenTransfer`

```solidity
let cap = tokenBalanceCap(); if cap != 0 and to != address(0) and to != 0x000000000000000000000000000000000000dEaD and !hasRole(UNCAPPED_BALANCE_ROLE,to) then balanceOf(to) (post-state) <= cap
```

### 42. Capped balance: recipients with UNCAPPED_BALANCE_ROLE are always exempt from the cap, regardless of cap value.

**Function:** `LSP8CappedBalanceAbstract._tokenBalanceCapCheck / LSP8CappedBalanceInitAbstract._tokenBalanceCapCheck`

```solidity
if hasRole(UNCAPPED_BALANCE_ROLE,to) then cap check is bypassed (no revert due to cap)
```

## packages/lsp8-contracts/contracts/extensions/LSP8CappedBalance/LSP8CappedBalanceAbstract.sol

### 43. Capped balance: tokenBalanceCap is immutable for constructor-based variant.

**Function:** `LSP8CappedBalanceAbstract.tokenBalanceCap`

```solidity
tokenBalanceCap() is constant over time (cannot change after deployment)
```

## packages/lsp8-contracts/contracts/extensions/LSP8CappedBalance/LSP8CappedBalanceInitAbstract.sol

### 44. Capped balance init variant: tokenBalanceCap is set exactly once during initialization and never changes afterwards.

**Function:** `LSP8CappedBalanceInitAbstract.__LSP8CappedBalance_init_unchained`

```solidity
after initialization completes, tokenBalanceCap() remains constant for the lifetime of the proxy instance
```

## packages/lsp8-contracts/contracts/extensions/LSP8CappedSupply/\*

### 45. Capped supply: if supply cap is enabled, totalSupply can never exceed tokenSupplyCap.

**Function:** `LSP8CappedSupplyAbstract._mint / LSP8CappedSupplyInitAbstract._mint`

```solidity
let cap = tokenSupplyCap(); if cap != 0 then totalSupply() <= cap always (in particular, post-mint totalSupply() <= cap)
```

## packages/lsp8-contracts/contracts/extensions/LSP8CappedSupply/LSP8CappedSupplyInitAbstract.sol

### 46. Capped supply init variant: tokenSupplyCap is set exactly once during initialization and never changes afterwards.

**Function:** `LSP8CappedSupplyInitAbstract.__LSP8CappedSupply_init_unchained`

```solidity
after initialization completes, tokenSupplyCap() remains constant for the lifetime of the proxy instance
```

## packages/lsp8-contracts/contracts/extensions/LSP8Mintable/\*

### 47. Minting kill switch: once isMintable becomes false, it can never become true again.

**Function:** `LSP8MintableAbstract.disableMinting / LSP8MintableInitAbstract.disableMinting`

```solidity
isMintable is monotonic: it may transition true -> false at most once; false -> true is impossible
```

### 48. Mint gating: if isMintable == false, minting must be impossible even for MINTER_ROLE holders.

**Function:** `LSP8MintableAbstract._mint / LSP8MintableInitAbstract._mint`

```solidity
if isMintable == false then any call path that reaches _mint(to,tokenId,force,data) reverts with LSP8MintDisabled() before minting state changes
```

## packages/lsp8-contracts/contracts/extensions/LSP8NonTransferable/\*

### 49. Non-transferable kill switch: makeTransferable permanently disables the lock feature and zeros the lock window.

**Function:** `LSP8NonTransferableAbstract.makeTransferable / LSP8NonTransferableInitAbstract.makeTransferable`

```solidity
after successful makeTransferable(): transferLockEnabled == false AND transferLockStart == 0 AND transferLockEnd == 0, and these values never change afterwards
```

### 50. Non-transferable enforcement: when token is not transferable, transfers must revert unless burning/minting or bypass-role applies.

**Function:** `LSP8NonTransferableAbstract._nonTransferableCheck / LSP8NonTransferableInitAbstract._nonTransferableCheck`

```solidity
if from!=address(0) and to!=address(0) and !hasRole(NON_TRANSFERABLE_BYPASS_ROLE,from) and isTransferable()==false then transfer must revert with LSP8TransferDisabled()
```

## packages/lsp8-contracts/contracts/extensions/LSP8Revokable/\*

### 51. Revokable kill switch: once isRevokable becomes false, it can never become true again.

**Function:** `LSP8RevokableAbstract.disableRevokable / LSP8RevokableInitAbstract.disableRevokable`

```solidity
isRevokable() is monotonic: it may transition true -> false at most once; false -> true is impossible
```

### 52. Revoke destination restriction: revoked token can only be transferred to owner or another revoker.

**Function:** `LSP8RevokableAbstract.revoke / LSP8RevokableInitAbstract.revoke`

```solidity
if revoke(from,to,tokenId,data) succeeds then (to == owner()) OR hasRole(REVOKER_ROLE,to) held in the pre-state
```

### 53. Ownership transfer hardening (revokable): after ownership transfer, REVOKER_ROLE admin is DEFAULT_ADMIN_ROLE and only the new owner may remain a revoker (all other revokers are removed).

**Function:** `LSP8RevokableAbstract._transferOwnership / LSP8RevokableInitAbstract._transferOwnership`

```solidity
after successful ownership transfer: getRoleAdmin(REVOKER_ROLE)==DEFAULT_ADMIN_ROLE AND for all a in getRoleMembers(REVOKER_ROLE): a==owner() (i.e., the set is either {owner()} or empty if feature was never enabled/granted)
```
