// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {MockLSP7CappedBalance} from "../mocks/InvariantTestMocks.sol";
import {InvariantConstants} from "../helpers/InvariantConstants.sol";
import {
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

/// @dev Handler for LSP7CappedBalanceAbstract invariants 13 (constructor) and 14.
contract LSP7CappedBalanceHandler is Test {
    address internal constant DEAD_ADDRESS =
        0x000000000000000000000000000000000000dEaD;

    MockLSP7CappedBalance public token;
    uint256 public configuredBalanceCap;

    constructor() {
        configuredBalanceCap = InvariantConstants.BALANCE_CAP;

        token = new MockLSP7CappedBalance(
            "Capped Balance",
            "CB",
            address(this),
            _LSP4_TOKEN_TYPE_TOKEN,
            false,
            configuredBalanceCap
        );
    }

    function mint(uint256 amount, uint256 toSeed) external {
        amount = bound(amount, 1, configuredBalanceCap);
        address to = makeAddr(string(abi.encodePacked("cbTo", toSeed)));

        try token.mint(to, amount, true, "") {
            _assertRecipientBalanceCap(to);
        } catch {}
    }

    function transfer(uint256 amount, uint256 fromSeed, uint256 toSeed) external {
        address from = makeAddr(string(abi.encodePacked("cbFrom", fromSeed)));
        address to = makeAddr(string(abi.encodePacked("cbToXfer", toSeed)));

        token.mint(from, configuredBalanceCap, true, "");
        amount = bound(amount, 1, configuredBalanceCap);

        try token.transfer(from, to, amount, true, "") {
            _assertRecipientBalanceCap(to);
        } catch {}
    }

    function _assertRecipientBalanceCap(address to) internal {
        if (configuredBalanceCap == 0) return;
        if (to == address(0) || to == DEAD_ADDRESS) return;
        if (token.hasRole(token.UNCAPPED_BALANCE_ROLE(), to)) return;

        assertLe(token.balanceOf(to), configuredBalanceCap);
    }
}
