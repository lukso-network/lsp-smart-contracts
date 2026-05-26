// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {InvariantTest} from "forge-std/InvariantTest.sol";

import {MockLSP7CappedBalanceInit} from "./mocks/InvariantTestMocks.sol";
import {
    LSP7CappedBalanceInitHandler
} from "./handlers/LSP7CappedBalanceInitHandler.sol";

/// @dev Invariant 13 for LSP7CappedBalanceInitAbstract.sol.
/// Run: `FOUNDRY_PROFILE=lsp7 forge test --match-contract LSP7CappedBalanceInitAbstractInvariantTest`
contract LSP7CappedBalanceInitAbstractInvariantTest is InvariantTest {
    LSP7CappedBalanceInitHandler internal handler;
    MockLSP7CappedBalanceInit internal token;

    function setUp() public {
        handler = new LSP7CappedBalanceInitHandler();
        token = handler.token();

        targetContract(address(handler));
    }

    /// @dev 13. Capped balance cap value is write-once during initialization (init/proxy variant). After initialization completes, tokenBalanceCap() remains equal to the initialized _tokenBalanceCap for the lifetime of the proxy
    function invariant_tokenBalanceCapIsWriteOnce() public {
        assertEq(token.tokenBalanceCap(), handler.configuredBalanceCap());
    }
}
