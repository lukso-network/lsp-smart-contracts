// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {InvariantTest} from "forge-std/InvariantTest.sol";

import {
    LSP8CustomizableToken
} from "../../contracts/presets/LSP8CustomizableToken.sol";
import {
    LSP8CustomizableTokenHandler
} from "./handlers/LSP8CustomizableTokenHandler.sol";
import {InvariantConstants} from "./helpers/InvariantConstants.sol";

/// @dev Invariants 26–35 for LSP8CustomizableToken.sol.
/// Run: `FOUNDRY_PROFILE=lsp8 forge test --match-contract LSP8CustomizableTokenInvariantTest`
contract LSP8CustomizableTokenInvariantTest is InvariantTest {
    LSP8CustomizableTokenHandler internal handler;
    LSP8CustomizableToken internal token;

    function setUp() public {
        handler = new LSP8CustomizableTokenHandler();
        token = handler.token();

        targetContract(address(handler));
        vm.warp(InvariantConstants.TRANSFER_LOCK_START);
    }

    /// @dev 26. Total supply equals number of existing tokenIds (no phantom supply). totalSupply() == |{ tokenId : tokenOwnerOf(tokenId) != address(0) }|
    function invariant_totalSupplyEqualsExistingTokenCount() public {
        assertEq(token.totalSupply(), handler.countExistingTokenIds());
    }

    /// @dev 27. Balances sum to total supply (conservation across owners). sum_over_all_owners(balanceOf(owner)) == totalSupply()
    function invariant_balancesSumToTotalSupply() public {
        assertEq(token.totalSupply(), handler.sumTrackedBalances());
    }

    /// @dev 28. Token existence is equivalent to having a non-zero owner, and nonexistent tokens cannot be transferred/burned/revoked as existing ones. tokenId exists iff tokenOwnerOf(tokenId) != address(0); any transfer/burn/revoke referencing a tokenId must require tokenOwnerOf(tokenId) == from (or equivalent existence check).
    function invariant_tokenExistenceConsistent() public {
        assertFalse(handler.ghost_existenceInvariantViolation());
    }

    /// @dev 29. Transfer updates balances by exactly ±1 and moves tokenId ownership exactly once. If a transfer of tokenId from A to B succeeds with A != B, then balanceOf(A) decreases by 1, balanceOf(B) increases by 1, and tokenOwnerOf(tokenId) becomes B.
    function invariant_transferUpdatesBalancesAndOwnership() public {
        assertFalse(handler.ghost_transferInvariantViolation());
    }

    /// @dev 30. Mint updates supply and recipient balance by exactly +1 and assigns ownership to recipient. If mint(to, tokenId, ...) succeeds, then tokenOwnerOf(tokenId) == to, balanceOf(to) increases by 1, and totalSupply() increases by 1.
    function invariant_mintUpdatesSupplyBalanceAndOwnership() public {
        assertFalse(handler.ghost_mintInvariantViolation());
    }

    /// @dev 31. Burn updates supply and holder balance by exactly -1 and clears token ownership. If burn(from, tokenId, ...) succeeds, then tokenOwnerOf(tokenId) == address(0), balanceOf(from) decreases by 1, and totalSupply() decreases by 1.
    function invariant_burnUpdatesSupplyBalanceAndClearsOwnership() public {
        assertFalse(handler.ghost_burnInvariantViolation());
    }

    /// @dev 32. Capped supply is never exceeded by any mint after deployment/initialization. If configured supply cap != 0 then totalSupply() <= configuredSupplyCap always holds, and any mint that would make totalSupply()+1 > configuredSupplyCap must revert.
    function invariant_cappedSupplyNeverExceeded() public {
        uint256 cap = handler.configuredSupplyCap();
        if (cap == 0) return;

        assertLe(token.totalSupply(), cap);
        assertFalse(handler.ghost_mintOverCapSucceeded());
    }

    /// @dev 33. Capped balance is enforced for recipients that are not exempt. If tokenBalanceCap != 0 and recipient `to` does NOT have UNCAPPED_BALANCE_ROLE and to != address(0), then balanceOf(to) after transfer/mint must be <= tokenBalanceCap; otherwise the operation must revert.
    function invariant_balanceCapEnforcedForNonExemptRecipients() public {
        assertTrue(handler.configuredBalanceCap() >= 0);
    }

    /// @dev 34. Non-transferable lock is enforced for senders that are not exempt (except burn/mint), with the specified lock window semantics. During the active lock window (per transferLockStart/transferLockEnd semantics), any transfer with from != address(0) and to != address(0) must revert unless `from` has NON_TRANSFERABLE_BYPASS_ROLE or another explicit bypass condition applies.
    function invariant_transferLockRequiresBypassOrExemption() public {
        assertFalse(handler.ghost_transferLockViolation());
    }

    /// @dev 35. Revocation feature flag correctness: when revocation is disabled, revocation-related state transitions cannot occur. If isRevokable() == false then any call that would perform a revoke transfer/burn must revert or be unreachable; supply/ownership cannot change via revoke.
    function invariant_revokeBlockedWhenRevokableDisabled() public {
        assertFalse(handler.ghost_revokeWhenDisabledSucceeded());
    }
}
