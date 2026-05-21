// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

import {LSP7MintableInitHarness} from "../mocks/InvariantTestMocks.sol";
import {
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

/// @dev Handler for invariant 12 on LSP7MintableInit.
contract LSP7MintableInitInitializeHandler is Test {
    LSP7MintableInitHarness public implementation;
    LSP7MintableInitHarness public token;

    bool public ghost_secondInitializeSucceeded;

    constructor() {
        implementation = new LSP7MintableInitHarness();
        address instance = Clones.clone(address(implementation));
        token = LSP7MintableInitHarness(payable(instance));

        token.initialize(
            "Mintable Init",
            "MNTI",
            address(this),
            _LSP4_TOKEN_TYPE_TOKEN,
            false
        );
    }

    function attemptSecondInitialize() external {
        try
            token.initialize(
                "Reinit",
                "RE",
                address(this),
                _LSP4_TOKEN_TYPE_TOKEN,
                false
            )
        {
            ghost_secondInitializeSucceeded = true;
        } catch {}
    }
}
