// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {InvariantTest} from "forge-std/InvariantTest.sol";

import {MockLSP8NonTransferableInit} from "./mocks/InvariantTestMocks.sol";
import {LSP8NonTransferableInitHandler} from "./handlers/LSP8NonTransferableInitHandler.sol";
import {InvariantConstants} from "./helpers/InvariantConstants.sol";

/// @dev Invariants 49–50 for LSP8NonTransferableInitAbstract.sol.
/// Run: `FOUNDRY_PROFILE=lsp8 forge test --match-contract LSP8NonTransferableInitAbstractInvariantTest`
contract LSP8NonTransferableInitAbstractInvariantTest is InvariantTest {
    LSP8NonTransferableInitHandler internal handler;
    MockLSP8NonTransferableInit internal token;

    function setUp() public {
        handler = new LSP8NonTransferableInitHandler();
        token = handler.token();

        targetContract(address(handler));
        vm.warp(InvariantConstants.TRANSFER_LOCK_START);
    }

    /// @dev 49. Non-transferable kill switch: makeTransferable permanently disables the lock feature and zeros the lock window. after successful makeTransferable(): transferLockEnabled == false AND transferLockStart == 0 AND transferLockEnd == 0, and these values never change afterwards
    function invariant_makeTransferablePermanentlyDisablesLock() public {
        if (handler.ghost_transferLockWasDisabled()) {
            assertFalse(token.transferLockEnabled());
            assertEq(token.transferLockStart(), 0);
            assertEq(token.transferLockEnd(), 0);
            assertTrue(token.isTransferable());
        }
    }

    /// @dev 50. Non-transferable enforcement: when token is not transferable, transfers must revert unless burning/minting or bypass-role applies. if from!=address(0) and to!=address(0) and !hasRole(NON_TRANSFERABLE_BYPASS_ROLE,from) and isTransferable()==false then transfer must revert with LSP8TransferDisabled()
    function invariant_transfersBlockedWhenNotTransferable() public {
        assertFalse(handler.ghost_transferLockViolation());
    }
}
