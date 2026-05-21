// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {MockLSP7Mintable} from "../mocks/InvariantTestMocks.sol";
import {
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

/// @dev Handler for LSP7MintableAbstract invariants 17–19.
contract LSP7MintableHandler is Test {
    MockLSP7Mintable public token;

    uint256 public ghost_supplyWhenMintDisabled;
    bool public ghost_mintingWasDisabled;
    bool public ghost_mintWhenDisabledSucceeded;

    constructor() {
        token = new MockLSP7Mintable(
            "Mintable",
            "MNT",
            address(this),
            _LSP4_TOKEN_TYPE_TOKEN,
            false,
            true
        );
    }

    function mint(uint256 amount, uint256 toSeed) external {
        amount = bound(amount, 1, 500);
        address to = makeAddr(string(abi.encodePacked("mintTo", toSeed)));

        try token.mint(to, amount, true, "") {} catch {}
    }

    function disableMinting() external {
        if (!token.isMintable()) return;

        try token.disableMinting() {
            ghost_mintingWasDisabled = true;
            ghost_supplyWhenMintDisabled = token.totalSupply();
        } catch {}
    }

    function attemptMintWhenDisabled(uint256 amountSeed) external {
        if (token.isMintable()) return;

        uint256 amount = bound(amountSeed, 1, 100);
        address to = makeAddr("disabledMintTo");

        try token.mint(to, amount, true, "") {
            ghost_mintWhenDisabledSucceeded = true;
        } catch {}
    }

    function transferOwnership(uint256 newOwnerSeed) external {
        address newOwner = makeAddr(string(abi.encodePacked("mintOwner", newOwnerSeed)));

        vm.prank(token.owner());
        try token.transferOwnership(newOwner) {
            assertEq(
                token.getRoleAdmin(token.MINTER_ROLE()),
                token.DEFAULT_ADMIN_ROLE()
            );
        } catch {}
    }
}
