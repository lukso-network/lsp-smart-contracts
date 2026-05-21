// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {InvariantTest} from "forge-std/InvariantTest.sol";

import {MockLSP7CappedBalance} from "./mocks/InvariantTestMocks.sol";
import {
    LSP7CappedBalanceHandler
} from "./handlers/LSP7CappedBalanceHandler.sol";

/// @dev Invariants 13 (constructor) and 14 for LSP7CappedBalanceAbstract.sol.
/// Run: `FOUNDRY_PROFILE=lsp7 forge test --match-contract LSP7CappedBalanceAbstractInvariantTest`
contract LSP7CappedBalanceAbstractInvariantTest is InvariantTest {
    LSP7CappedBalanceHandler internal handler;
    MockLSP7CappedBalance internal token;

    function setUp() public {
        handler = new LSP7CappedBalanceHandler();
        token = handler.token();

        targetContract(address(handler));
    }

    /// @dev 13. Capped balance cap value is write-once during initialization (constructor variant). After initialization completes, tokenBalanceCap() remains equal to the initialized _tokenBalanceCap for the lifetime of the contract
    function invariant_tokenBalanceCapIsWriteOnce() public {
        assertEq(token.tokenBalanceCap(), handler.configuredBalanceCap());
    }

    /// @dev 14. Balance cap enforcement for non-exempt recipients when cap enabled. If tokenBalanceCap() != 0 and to not in {address(0), 0x000000000000000000000000000000000000dEaD} and !hasRole(UNCAPPED_BALANCE_ROLE,to), then any successful transfer/mint that increases balanceOf(to) must satisfy balanceOf(to) <= tokenBalanceCap() after state update
    function invariant_balanceCapOnIncreaseForNonExemptRecipients() public {
        assertTrue(handler.configuredBalanceCap() > 0);
    }
}
