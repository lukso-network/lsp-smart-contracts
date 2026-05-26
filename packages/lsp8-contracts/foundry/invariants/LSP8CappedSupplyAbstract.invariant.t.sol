// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {InvariantTest} from "forge-std/InvariantTest.sol";

import {MockLSP8CappedSupply} from "./mocks/InvariantTestMocks.sol";
import {LSP8CappedSupplyHandler} from "./handlers/LSP8CappedSupplyHandler.sol";

/// @dev Invariants 45–46 for LSP8CappedSupplyAbstract.sol (constructor: 45 only).
/// Run: `FOUNDRY_PROFILE=lsp8 forge test --match-contract LSP8CappedSupplyAbstractInvariantTest`
contract LSP8CappedSupplyAbstractInvariantTest is InvariantTest {
    LSP8CappedSupplyHandler internal handler;
    MockLSP8CappedSupply internal token;

    function setUp() public {
        handler = new LSP8CappedSupplyHandler();
        token = handler.token();

        targetContract(address(handler));
    }

    /// @dev 45. Capped supply: if supply cap is enabled, totalSupply can never exceed tokenSupplyCap. let cap = tokenSupplyCap(); if cap != 0 then totalSupply() <= cap always (in particular, post-mint totalSupply() <= cap)
    function invariant_cappedSupplyNeverExceeded() public {
        uint256 cap = handler.configuredSupplyCap();
        if (cap == 0) return;

        assertLe(token.totalSupply(), cap);
        assertFalse(handler.ghost_mintOverCapSucceeded());
    }

    /// @dev 46. Capped supply init variant: tokenSupplyCap is set exactly once during initialization and never changes afterwards. after initialization completes, tokenSupplyCap() remains constant for the lifetime of the proxy instance
    function invariant_tokenSupplyCapIsImmutableForConstructorVariant() public {
        assertEq(token.tokenSupplyCap(), handler.configuredSupplyCap());
    }
}
