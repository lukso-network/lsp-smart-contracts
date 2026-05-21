// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

import {LSP7MintableInitHarness} from "../mocks/InvariantTestMocks.sol";
import {
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

/// @dev Handler for LSP7MintableInitAbstract invariants 17–19.
contract LSP7MintableInitHandler is Test {
    LSP7MintableInitHarness public implementation;
    LSP7MintableInitHarness public token;

    bool public ghost_mintingWasDisabled;
    bool public ghost_mintWhenDisabledSucceeded;

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

    function mint(uint256 amount, uint256 toSeed) external {
        amount = bound(amount, 1, 500);
        address to = makeAddr(string(abi.encodePacked("mintInitTo", toSeed)));

        try token.mint(to, amount, true, "") {} catch {}
    }

    function disableMinting() external {
        if (!token.isMintable()) return;

        try token.disableMinting() {
            ghost_mintingWasDisabled = true;
        } catch {}
    }

    function attemptMintWhenDisabled(uint256 amountSeed) external {
        if (token.isMintable()) return;

        uint256 amount = bound(amountSeed, 1, 100);
        address to = makeAddr("disabledMintInitTo");

        try token.mint(to, amount, true, "") {
            ghost_mintWhenDisabledSucceeded = true;
        } catch {}
    }

    function transferOwnership(uint256 newOwnerSeed) external {
        address newOwner = makeAddr(string(abi.encodePacked("mintInitOwner", newOwnerSeed)));

        vm.prank(token.owner());
        try token.transferOwnership(newOwner) {
            assertEq(
                token.getRoleAdmin(token.MINTER_ROLE()),
                token.DEFAULT_ADMIN_ROLE()
            );
        } catch {}
    }
}
