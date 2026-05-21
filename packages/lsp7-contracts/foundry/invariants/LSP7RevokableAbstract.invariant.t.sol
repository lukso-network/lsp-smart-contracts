// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {InvariantTest} from "forge-std/InvariantTest.sol";

import {MockLSP7Revokable} from "./mocks/InvariantTestMocks.sol";
import {LSP7RevokableHandler} from "./handlers/LSP7RevokableHandler.sol";

/// @dev Invariants 24–25 for LSP7RevokableAbstract.sol.
/// Run: `FOUNDRY_PROFILE=lsp7 forge test --match-contract LSP7RevokableAbstractInvariantTest`
contract LSP7RevokableAbstractInvariantTest is InvariantTest {
    LSP7RevokableHandler internal handler;
    MockLSP7Revokable internal token;

    function setUp() public {
        handler = new LSP7RevokableHandler();
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
