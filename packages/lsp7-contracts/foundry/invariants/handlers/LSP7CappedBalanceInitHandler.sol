// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

import {MockLSP7CappedBalanceInit} from "../mocks/InvariantTestMocks.sol";
import {InvariantConstants} from "../helpers/InvariantConstants.sol";
import {
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

/// @dev Handler for LSP7CappedBalanceInitAbstract invariant 13.
contract LSP7CappedBalanceInitHandler is Test {
    MockLSP7CappedBalanceInit public implementation;
    MockLSP7CappedBalanceInit public token;

    uint256 public configuredBalanceCap;

    constructor() {
        configuredBalanceCap = InvariantConstants.BALANCE_CAP;

        implementation = new MockLSP7CappedBalanceInit();
        address instance = Clones.clone(address(implementation));
        token = MockLSP7CappedBalanceInit(payable(instance));

        token.initialize(
            "Capped Balance Init",
            "CBI",
            address(this),
            _LSP4_TOKEN_TYPE_TOKEN,
            false,
            configuredBalanceCap
        );
    }

    function mint(uint256 amount, uint256 toSeed) external {
        amount = bound(amount, 1, configuredBalanceCap);
        address to = makeAddr(string(abi.encodePacked("cbInitTo", toSeed)));

        try token.mint(to, amount, true, "") {} catch {}
    }
}
