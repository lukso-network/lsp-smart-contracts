// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

import {MockLSP7CappedSupplyInit} from "../mocks/InvariantTestMocks.sol";
import {InvariantConstants} from "../helpers/InvariantConstants.sol";
import {
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

/// @dev Handler for LSP7CappedSupplyInitAbstract invariant 15.
contract LSP7CappedSupplyInitHandler is Test {
    MockLSP7CappedSupplyInit public implementation;
    MockLSP7CappedSupplyInit public token;

    uint256 public configuredSupplyCap;

    constructor() {
        configuredSupplyCap = InvariantConstants.SUPPLY_CAP;

        implementation = new MockLSP7CappedSupplyInit();
        address instance = Clones.clone(address(implementation));
        token = MockLSP7CappedSupplyInit(payable(instance));

        token.initialize(
            "Capped Supply Init",
            "CSI",
            address(this),
            _LSP4_TOKEN_TYPE_TOKEN,
            false,
            configuredSupplyCap
        );
    }

    function mint(uint256 amount, uint256 toSeed) external {
        amount = bound(amount, 1, configuredSupplyCap);
        address to = makeAddr(string(abi.encodePacked("csInitTo", toSeed)));

        try token.mint(to, amount, true, "") {} catch {}
    }
}
