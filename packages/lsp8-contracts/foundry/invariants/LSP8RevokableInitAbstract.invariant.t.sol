// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {InvariantTest} from "forge-std/InvariantTest.sol";

import {MockLSP8RevokableInit} from "./mocks/InvariantTestMocks.sol";
import {LSP8RevokableInitHandler} from "./handlers/LSP8RevokableInitHandler.sol";

/// @dev Invariants 51–53 for LSP8RevokableInitAbstract.sol.
/// Run: `FOUNDRY_PROFILE=lsp8 forge test --match-contract LSP8RevokableInitAbstractInvariantTest`
contract LSP8RevokableInitAbstractInvariantTest is InvariantTest {
    LSP8RevokableInitHandler internal handler;
    MockLSP8RevokableInit internal token;

    function setUp() public {
        handler = new LSP8RevokableInitHandler();
        token = handler.token();

        targetContract(address(handler));
    }

    /// @dev 51. Revokable kill switch: once isRevokable becomes false, it can never become true again. isRevokable() is monotonic: it may transition true -> false at most once; false -> true is impossible
    function invariant_revokableStatusMonotonic() public {
        if (handler.ghost_revokableWasDisabled()) {
            assertFalse(token.isRevokable());
        }
    }

    /// @dev 52. Revoke destination restriction: revoked token can only be transferred to owner or another revoker. if revoke(from,to,tokenId,data) succeeds then (to == owner()) OR hasRole(REVOKER_ROLE,to) held in the pre-state
    function invariant_revokeOnlyToOwnerOrRevoker() public {
        assertFalse(handler.ghost_revokeDestinationViolation());
    }

    /// @dev 53. Ownership transfer hardening (revokable): after ownership transfer, REVOKER_ROLE admin is DEFAULT_ADMIN_ROLE and only the new owner may remain a revoker (all other revokers are removed). after successful ownership transfer: getRoleAdmin(REVOKER_ROLE)==DEFAULT_ADMIN_ROLE AND for all a in getRoleMembers(REVOKER_ROLE): a==owner() (i.e., the set is either {owner()} or empty if feature was never enabled/granted)
    function invariant_revokerSetHardenedAfterOwnershipTransfer() public {
        assertFalse(handler.ghost_revokerRoleViolationAfterOwnershipTransfer());
        assertEq(
            token.getRoleAdmin(token.REVOKER_ROLE()),
            token.DEFAULT_ADMIN_ROLE()
        );
    }
}
