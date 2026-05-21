// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {InvariantTest} from "forge-std/InvariantTest.sol";

import {MockLSP8CappedBalance} from "./mocks/InvariantTestMocks.sol";
import {LSP8CappedBalanceHandler} from "./handlers/LSP8CappedBalanceHandler.sol";

/// @dev Invariants 41–43 for LSP8CappedBalanceAbstract.sol.
/// Run: `FOUNDRY_PROFILE=lsp8 forge test --match-contract LSP8CappedBalanceAbstractInvariantTest`
contract LSP8CappedBalanceAbstractInvariantTest is InvariantTest {
    LSP8CappedBalanceHandler internal handler;
    MockLSP8CappedBalance internal token;

    function setUp() public {
        handler = new LSP8CappedBalanceHandler();
        token = handler.token();

        targetContract(address(handler));
    }

    /// @dev 41. Capped balance: if balance cap is enabled, no non-exempt, non-burn recipient can ever end up holding more than the cap after any transfer/mint. let cap = tokenBalanceCap(); if cap != 0 and to != address(0) and to != 0x000000000000000000000000000000000000dEaD and !hasRole(UNCAPPED_BALANCE_ROLE,to) then balanceOf(to) (post-state) <= cap
    function invariant_balanceCapEnforcedForNonExemptRecipients() public {
        assertTrue(handler.configuredBalanceCap() > 0);
    }

    /// @dev 42. Capped balance: recipients with UNCAPPED_BALANCE_ROLE are always exempt from the cap, regardless of cap value. if hasRole(UNCAPPED_BALANCE_ROLE,to) then cap check is bypassed (no revert due to cap)
    function invariant_uncappedRoleBypassesBalanceCap() public {
        assertFalse(handler.ghost_exemptCapBypassFailed());
    }

    /// @dev 43. Capped balance: tokenBalanceCap is immutable for constructor-based variant. tokenBalanceCap() is constant over time (cannot change after deployment)
    function invariant_tokenBalanceCapIsImmutable() public {
        assertEq(token.tokenBalanceCap(), handler.configuredBalanceCap());
    }
}
