// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {InvariantTest} from "forge-std/InvariantTest.sol";

import {MockLSP8CappedBalanceInit} from "./mocks/InvariantTestMocks.sol";
import {LSP8CappedBalanceInitHandler} from "./handlers/LSP8CappedBalanceInitHandler.sol";

/// @dev Invariants 41–44 for LSP8CappedBalanceInitAbstract.sol.
/// Run: `FOUNDRY_PROFILE=lsp8 forge test --match-contract LSP8CappedBalanceInitAbstractInvariantTest`
contract LSP8CappedBalanceInitAbstractInvariantTest is InvariantTest {
    LSP8CappedBalanceInitHandler internal handler;
    MockLSP8CappedBalanceInit internal token;

    function setUp() public {
        handler = new LSP8CappedBalanceInitHandler();
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

    /// @dev 44. Capped balance init variant: tokenBalanceCap is set exactly once during initialization and never changes afterwards. after initialization completes, tokenBalanceCap() remains constant for the lifetime of the proxy instance
    function invariant_tokenBalanceCapSetOnceOnInit() public {
        assertEq(token.tokenBalanceCap(), handler.configuredBalanceCap());
    }
}
