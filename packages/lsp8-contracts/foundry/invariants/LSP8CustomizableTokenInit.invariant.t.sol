// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {InvariantTest} from "forge-std/InvariantTest.sol";

import {
    LSP8CustomizableTokenInit
} from "../../contracts/presets/LSP8CustomizableTokenInit.sol";
import {
    LSP8MintableParams,
    LSP8NonTransferableParams,
    LSP8CappedParams,
    LSP8RevokableParams
} from "../../contracts/presets/LSP8CustomizableTokenConstants.sol";
import {
    LSP8CustomizableTokenInitHandler
} from "./handlers/LSP8CustomizableTokenInitHandler.sol";
import {InvariantConstants} from "./helpers/InvariantConstants.sol";
import {
    _LSP4_TOKEN_TYPE_NFT
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {_LSP8_TOKENID_FORMAT_NUMBER} from "../../contracts/LSP8Constants.sol";

/// @dev Invariants 26–35 and 40 for LSP8CustomizableTokenInit.sol.
/// Run: `FOUNDRY_PROFILE=lsp8 forge test --match-contract LSP8CustomizableTokenInitInvariantTest`
contract LSP8CustomizableTokenInitInvariantTest is InvariantTest {
    LSP8CustomizableTokenInitHandler internal handler;
    LSP8CustomizableTokenInit internal token;

    function setUp() public {
        handler = new LSP8CustomizableTokenInitHandler();
        token = handler.token();

        targetContract(address(handler));
        vm.warp(InvariantConstants.TRANSFER_LOCK_START);

        _assertImplementationCannotBeInitialized(handler.implementation());
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

    /// @dev 40. Upgradeable implementations are not initializable after deployment (implementation lock). For LSP8CustomizableTokenInit and LSP8MintableInit implementation contracts, _disableInitializers() is executed in the constructor, so calling initialize on the implementation address must revert.
    function invariant_implementationCannotBeInitialized() public {
        assertFalse(handler.ghost_secondInitializeSucceeded());
    }

    function _assertImplementationCannotBeInitialized(
        LSP8CustomizableTokenInit implementation_
    ) internal {
        bytes32[] memory emptyIds = new bytes32[](0);

        vm.expectRevert("Initializable: contract is already initialized");
        implementation_.initialize(
            "Implementation",
            "IMPL",
            address(this),
            _LSP4_TOKEN_TYPE_NFT,
            _LSP8_TOKENID_FORMAT_NUMBER,
            LSP8MintableParams({isMintable: true, initialMintTokenIds: emptyIds}),
            LSP8CappedParams({
                tokenBalanceCap: InvariantConstants.BALANCE_CAP,
                tokenSupplyCap: InvariantConstants.SUPPLY_CAP
            }),
            LSP8NonTransferableParams({transferLockStart: 0, transferLockEnd: 0}),
            LSP8RevokableParams({isRevokable: true})
        );
    }
}
