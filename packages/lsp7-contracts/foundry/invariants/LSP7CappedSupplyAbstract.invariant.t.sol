// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {InvariantTest} from "forge-std/InvariantTest.sol";

import {MockLSP7CappedSupply} from "./mocks/InvariantTestMocks.sol";
import {
    LSP7CappedSupplyHandler
} from "./handlers/LSP7CappedSupplyHandler.sol";

/// @dev Invariants 15 (constructor) and 16 for LSP7CappedSupplyAbstract.sol.
/// Run: `FOUNDRY_PROFILE=lsp7 forge test --match-contract LSP7CappedSupplyAbstractInvariantTest`
contract LSP7CappedSupplyAbstractInvariantTest is InvariantTest {
    LSP7CappedSupplyHandler internal handler;
    MockLSP7CappedSupply internal token;

    function setUp() public {
        handler = new LSP7CappedSupplyHandler();
        token = handler.token();

        targetContract(address(handler));
    }

    /// @dev 15. Supply cap value is write-once during initialization (constructor variant). After initialization completes, tokenSupplyCap() remains equal to the initialized _tokenSupplyCap for the lifetime of the contract
    function invariant_tokenSupplyCapIsWriteOnce() public {
        assertEq(token.tokenSupplyCap(), handler.configuredSupplyCap());
    }

    /// @dev 16. Minting that would exceed supply cap must always revert. If tokenSupplyCap() != 0 and totalSupply()+amount > tokenSupplyCap(), then _mint(to,amount,*,*) must revert
    function invariant_mintOverSupplyCapAlwaysReverts() public {
        assertFalse(handler.ghost_mintOverCapSucceeded());
    }
}
