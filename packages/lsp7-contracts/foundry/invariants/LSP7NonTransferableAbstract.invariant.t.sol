// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {InvariantTest} from "forge-std/InvariantTest.sol";

import {MockLSP7NonTransferable} from "./mocks/InvariantTestMocks.sol";
import {LSP7NonTransferableHandler} from "./handlers/LSP7NonTransferableHandler.sol";

/// @dev Invariants 20–23 for LSP7NonTransferableAbstract.sol.
/// Run: `FOUNDRY_PROFILE=lsp7 forge test --match-contract LSP7NonTransferableAbstractInvariantTest`
contract LSP7NonTransferableAbstractInvariantTest is InvariantTest {
    LSP7NonTransferableHandler internal handler;
    MockLSP7NonTransferable internal token;

    function setUp() public {
        handler = new LSP7NonTransferableHandler();
        token = handler.token();

        targetContract(address(handler));
    }

    /// @dev 20. Transferability kill-switch is monotonic: once made transferable, lock can never be re-enabled. transferLockEnabled can transition true -> false at most once; there is no reachable state transition false -> true
    function invariant_transferLockMonotonic() public {
        if (handler.ghost_transferLockWasDisabled()) {
            assertFalse(token.transferLockEnabled());
        }
    }

    /// @dev 21. If transferLockEnabled is false then lock parameters are cleared. transferLockEnabled == false implies transferLockStart == 0 and transferLockEnd == 0 and isTransferable() == true
    function invariant_lockParamsClearedWhenDisabled() public {
        if (!token.transferLockEnabled()) {
            assertEq(token.transferLockStart(), 0);
            assertEq(token.transferLockEnd(), 0);
            assertTrue(token.isTransferable());
        }
    }

    /// @dev 22. Non-transferable restriction: regular transfers must be blocked when not transferable. For any transfer where from != address(0) and to != address(0) and !hasRole(NON_TRANSFERABLE_BYPASS_ROLE,from): the transfer can only succeed if isTransferable() == true
    function invariant_transfersBlockedWhenNotTransferable() public {
        assertFalse(handler.ghost_transferLockViolation());
    }

    /// @dev 23. On ownership transfer, admin hierarchy for NON_TRANSFERABLE_BYPASS_ROLE is reset to DEFAULT_ADMIN_ROLE. After any successful ownership transfer, getRoleAdmin(NON_TRANSFERABLE_BYPASS_ROLE) == DEFAULT_ADMIN_ROLE
    function invariant_bypassRoleAdminResetOnOwnershipTransfer() public {
        assertEq(
            token.getRoleAdmin(token.NON_TRANSFERABLE_BYPASS_ROLE()),
            token.DEFAULT_ADMIN_ROLE()
        );
    }
}
