// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {InvariantTest} from "forge-std/InvariantTest.sol";

import {MockLSP7CappedSupplyInit} from "./mocks/InvariantTestMocks.sol";
import {
    LSP7CappedSupplyInitHandler
} from "./handlers/LSP7CappedSupplyInitHandler.sol";

/// @dev Invariant 15 for LSP7CappedSupplyInitAbstract.sol.
/// Run: `FOUNDRY_PROFILE=lsp7 forge test --match-contract LSP7CappedSupplyInitAbstractInvariantTest`
contract LSP7CappedSupplyInitAbstractInvariantTest is InvariantTest {
    LSP7CappedSupplyInitHandler internal handler;
    MockLSP7CappedSupplyInit internal token;

    function setUp() public {
        handler = new LSP7CappedSupplyInitHandler();
        token = handler.token();

        targetContract(address(handler));
    }

    /// @dev 15. Supply cap value is write-once during initialization (init/proxy variant). After initialization completes, tokenSupplyCap() remains equal to the initialized _tokenSupplyCap for the lifetime of the proxy
    function invariant_tokenSupplyCapIsWriteOnce() public {
        assertEq(token.tokenSupplyCap(), handler.configuredSupplyCap());
    }
}
