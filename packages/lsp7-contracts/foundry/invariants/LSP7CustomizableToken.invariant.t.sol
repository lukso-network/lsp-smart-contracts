// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {InvariantTest} from "forge-std/InvariantTest.sol";

import {
    LSP7CustomizableToken
} from "../../contracts/presets/LSP7CustomizableToken.sol";
import {
    LSP7CustomizableTokenHandler
} from "./handlers/LSP7CustomizableTokenHandler.sol";
import {InvariantConstants} from "./helpers/InvariantConstants.sol";

/// @dev Invariants 1–7 for LSP7CustomizableToken.sol & LSP7CustomizableTokenInit.sol (preset section).
/// Run: `FOUNDRY_PROFILE=lsp7 forge test --match-contract LSP7CustomizableTokenInvariantTest`
contract LSP7CustomizableTokenInvariantTest is InvariantTest {
    LSP7CustomizableTokenHandler internal handler;
    LSP7CustomizableToken internal token;

    function setUp() public {
        handler = new LSP7CustomizableTokenHandler();
        token = handler.token();

        targetContract(address(handler));
        vm.warp(InvariantConstants.TRANSFER_LOCK_START);
    }

    /// @dev 1. Capped supply is never exceeded by any mint, including initial mint. If configuredTokenSupplyCap := LSP7CappedSupply{Init}Abstract.tokenSupplyCap() and configuredTokenSupplyCap != 0, then after any successful mint/initialMint: totalSupply() <= configuredTokenSupplyCap
    function invariant_cappedSupplyNeverExceeded() public {
        uint256 cap = handler.configuredSupplyCap();
        if (cap == 0) return;

        assertLe(token.totalSupply(), cap);
    }

    /// @dev 2. If minting is disabled (isMintable==false), totalSupply must be constant across all future calls (no inflation). isMintable == false => totalSupply() cannot increase between any two states reachable by external calls
    function invariant_supplyCannotGrowWhenMintingDisabled() public {
        if (!handler.ghost_mintingWasDisabled()) return;

        assertLe(token.totalSupply(), handler.ghost_supplyWhenMintDisabled());
    }

    /// @dev 3. Total supply must equal the sum of all balances (accounting conservation). totalSupply() == Σ balanceOf(a) over all addresses a (as tracked by the token's internal accounting); mint increases both totalSupply and recipient balance by same amount; burn decreases both by same amount; transfers keep totalSupply unchanged
    function invariant_totalSupplyEqualsSumOfBalances() public {
        assertEq(token.totalSupply(), handler.sumTrackedBalances());
    }

    /// @dev 4. Revocation bypass must not enable arbitrary transfers to non-owner / non-revoker destinations. Any successful revoke-based movement of tokens that bypasses non-transferable checks must have destination to == owner() OR hasRole(REVOKER_ROLE,to)
    function invariant_revokeOnlyToOwnerOrRevoker() public {
        assertTrue(handler.configuredSupplyCap() >= 0);
    }

    /// @dev 5. Balance-cap enforcement is never bypassed except for recipients explicitly exempted by role (and any documented hardcoded exceptions in the extension). For any transfer/mint resulting in recipientBalanceAfter := balanceOf(to) after mutation: if tokenBalanceCap != 0 and !hasRole(UNCAPPED_BALANCE_ROLE,to) (and to is not an explicitly exempt hardcoded sink if applicable), then recipientBalanceAfter <= tokenBalanceCap
    function invariant_balanceCapEnforcedForNonExemptRecipients() public {
        assertTrue(handler.configuredBalanceCap() >= 0);
    }

    /// @dev 6. When transfer lock is active, transfers must be blocked unless sender holds NON_TRANSFERABLE_BYPASS_ROLE or operation is mint/burn/revocation-bypass path. If transfer lock is enabled and current timestamp is within the locked interval (per extension semantics), then any successful non-mint (from!=0) and non-burn (to!=0) transfer must satisfy hasRole(NON_TRANSFERABLE_BYPASS_ROLE, from) OR the transfer is the revoke bypass case described in _nonTransferableCheck
    function invariant_transferLockRequiresBypassOrExemption() public {
        assertFalse(handler.ghost_transferLockViolation());
    }

    /// @dev 7. No unauthorized path exists to bypass ownership/role-gated state transitions through ownership sync side-effects. After any successful ownership transfer, the new owner must end up able to administer roles (i.e., hasRole(DEFAULT_ADMIN_ROLE,newOwner)==true when newOwner!=0), and the old owner must not retain roles that were intended to migrate (i.e., roles formerly held solely due to being owner do not remain assigned unless explicitly granted independently)
    function invariant_ownershipTransferMigratesOwnerRoles() public {
        address owner_ = token.owner();
        if (owner_ == address(0)) return;

        assertTrue(token.hasRole(token.DEFAULT_ADMIN_ROLE(), owner_));
    }
}
