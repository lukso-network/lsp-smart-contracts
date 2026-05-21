// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {InvariantTest} from "forge-std/InvariantTest.sol";

import {
    LSP7MintableInitHarness
} from "./mocks/InvariantTestMocks.sol";
import {
    LSP7MintableInitInitializeHandler
} from "./handlers/LSP7MintableInitInitializeHandler.sol";
import {
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

/// @dev Invariant 12 for LSP7CustomizableTokenInit.sol & LSP7MintableInit.sol.
/// Run: `FOUNDRY_PROFILE=lsp7 forge test --match-contract LSP7MintableInitInvariantTest`
contract LSP7MintableInitInvariantTest is InvariantTest {
    LSP7MintableInitInitializeHandler internal handler;

    function setUp() public {
        handler = new LSP7MintableInitInitializeHandler();

        targetContract(address(handler));

        LSP7MintableInitHarness freshImplementation = new LSP7MintableInitHarness();

        vm.expectRevert("Initializable: contract is already initialized");
        freshImplementation.initialize(
            "Implementation",
            "IMPL",
            address(this),
            _LSP4_TOKEN_TYPE_TOKEN,
            false
        );
    }

    /// @dev 12. Proxy implementations cannot be initialized via constructors and can only be initialized once. For *Init contracts, constructor must call _disableInitializers(), and initialize(...) (guarded by initializer) can succeed at most once per proxy instance
    function invariant_proxyInitializeOnceOnly() public {
        assertFalse(handler.ghost_secondInitializeSucceeded());
    }
}
