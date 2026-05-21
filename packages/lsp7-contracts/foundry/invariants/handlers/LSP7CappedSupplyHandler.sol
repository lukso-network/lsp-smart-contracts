// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {MockLSP7CappedSupply} from "../mocks/InvariantTestMocks.sol";
import {InvariantConstants} from "../helpers/InvariantConstants.sol";
import {
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

/// @dev Handler for LSP7CappedSupplyAbstract invariants 15 (constructor) and 16.
contract LSP7CappedSupplyHandler is Test {
    MockLSP7CappedSupply public token;

    uint256 public configuredSupplyCap;
    bool public ghost_mintOverCapSucceeded;

    constructor() {
        configuredSupplyCap = InvariantConstants.SUPPLY_CAP;

        token = new MockLSP7CappedSupply(
            "Capped Supply",
            "CS",
            address(this),
            _LSP4_TOKEN_TYPE_TOKEN,
            false,
            configuredSupplyCap
        );
    }

    function mint(uint256 amount, uint256 toSeed) external {
        amount = bound(amount, 1, configuredSupplyCap);
        address to = makeAddr(string(abi.encodePacked("csTo", toSeed)));

        try token.mint(to, amount, true, "") {} catch {}
    }

    function attemptMintOverSupplyCap(uint256 amountSeed) external {
        uint256 cap = configuredSupplyCap;
        if (cap == 0) return;

        uint256 remaining = cap > token.totalSupply() ? cap - token.totalSupply() : 0;
        uint256 amount = bound(amountSeed, remaining + 1, remaining + 500);
        address to = makeAddr("csOverCapTo");

        try token.mint(to, amount, true, "") {
            ghost_mintOverCapSucceeded = true;
        } catch {}
    }
}
