// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {InvariantTest} from "forge-std/InvariantTest.sol";

import {MockLSP7RevokableInit} from "./mocks/InvariantTestMocks.sol";
import {LSP7RevokableInitHandler} from "./handlers/LSP7RevokableInitHandler.sol";

/// @dev Invariants 24–25 for LSP7RevokableInitAbstract.sol.
/// Run: `FOUNDRY_PROFILE=lsp7 forge test --match-contract LSP7RevokableInitAbstractInvariantTest`
contract LSP7RevokableInitAbstractInvariantTest is InvariantTest {
    LSP7RevokableInitHandler internal handler;
    MockLSP7RevokableInit internal token;

    function setUp() public {
        handler = new LSP7RevokableInitHandler();
        token = handler.token();

        targetContract(address(handler));
    }

    /// @dev 24. Revokable status is monotonic: once disabled it can never be re-enabled. isRevokable() can transition true -> false at most once; there is no reachable state transition false -> true
    function invariant_revokableStatusMonotonic() public {
        if (handler.ghost_revokableWasDisabled()) {
            assertFalse(token.isRevokable());
        }
    }

    /// @dev 25. After ownership transfer, REVOKER_ROLE member set is cleared except for the new owner. After a successful ownership transfer, for all addresses a != newOwner: hasRole(REVOKER_ROLE,a) == false (i.e., the only remaining revoker is the new owner)
    function invariant_onlyNewOwnerHasRevokerRoleAfterOwnershipTransfer() public {
        assertFalse(handler.ghost_revokerRoleViolationAfterOwnershipTransfer());
    }
}
