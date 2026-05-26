// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {InvariantTest} from "forge-std/InvariantTest.sol";

import {LSP7MintableInitHarness} from "./mocks/InvariantTestMocks.sol";
import {
    LSP7MintableInitHandler
} from "./handlers/LSP7MintableInitHandler.sol";

/// @dev Invariants 17–19 for LSP7MintableInitAbstract.sol.
/// Run: `FOUNDRY_PROFILE=lsp7 forge test --match-contract LSP7MintableInitAbstractInvariantTest`
contract LSP7MintableInitAbstractInvariantTest is InvariantTest {
    LSP7MintableInitHandler internal handler;
    LSP7MintableInitHarness internal token;

    function setUp() public {
        handler = new LSP7MintableInitHandler();
        token = handler.token();

        targetContract(address(handler));
    }

    /// @dev 17. Minting status is monotonic: once disabled it can never be re-enabled. isMintable can transition true -> false at most once; there is no reachable state transition false -> true
    function invariant_mintingStatusMonotonic() public {
        if (handler.ghost_mintingWasDisabled()) {
            assertFalse(token.isMintable());
        }
    }

    /// @dev 18. If isMintable is false then any mint attempt must revert (even by MINTER_ROLE). When isMintable == false, any call path reaching LSP7MintableAbstract._mint must revert with LSP7MintDisabled()
    function invariant_mintRevertsWhenMintingDisabled() public {
        assertFalse(handler.ghost_mintWhenDisabledSucceeded());
    }

    /// @dev 19. On ownership transfer, admin hierarchy for MINTER_ROLE is reset to DEFAULT_ADMIN_ROLE. After any successful ownership transfer, getRoleAdmin(MINTER_ROLE) == DEFAULT_ADMIN_ROLE
    function invariant_minterRoleAdminResetOnOwnershipTransfer() public {
        assertEq(
            token.getRoleAdmin(token.MINTER_ROLE()),
            token.DEFAULT_ADMIN_ROLE()
        );
    }
}
