// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {InvariantTest} from "forge-std/InvariantTest.sol";

import {MockLSP8MintableInit} from "./mocks/InvariantTestMocks.sol";
import {LSP8MintableInitHandler} from "./handlers/LSP8MintableInitHandler.sol";

/// @dev Invariants 47–48 for LSP8MintableInitAbstract.sol.
/// Run: `FOUNDRY_PROFILE=lsp8 forge test --match-contract LSP8MintableInitAbstractInvariantTest`
contract LSP8MintableInitAbstractInvariantTest is InvariantTest {
    LSP8MintableInitHandler internal handler;
    MockLSP8MintableInit internal token;

    function setUp() public {
        handler = new LSP8MintableInitHandler();
        token = handler.token();

        targetContract(address(handler));
    }

    /// @dev 47. Minting kill switch: once isMintable becomes false, it can never become true again. isMintable is monotonic: it may transition true -> false at most once; false -> true is impossible
    function invariant_mintingStatusMonotonic() public {
        if (handler.ghost_mintingWasDisabled()) {
            assertFalse(token.isMintable());
        }
    }

    /// @dev 48. Mint gating: if isMintable == false, minting must be impossible even for MINTER_ROLE holders. if isMintable == false then any call path that reaches _mint(to,tokenId,force,data) reverts with LSP8MintDisabled() before minting state changes
    function invariant_mintRevertsWhenMintingDisabled() public {
        assertFalse(handler.ghost_mintWhenDisabledSucceeded());
    }
}
