// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {MockLSP7NonTransferable} from "../mocks/InvariantTestMocks.sol";
import {InvariantConstants} from "../helpers/InvariantConstants.sol";
import {
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

/// @dev Handler for LSP7NonTransferableAbstract invariants 20–23.
contract LSP7NonTransferableHandler is Test {
    uint256 internal constant NUM_ACTORS = 4;

    MockLSP7NonTransferable public token;

    address[] public actors;
    address internal currentActor;

    bool public ghost_transferLockWasDisabled;
    bool public ghost_transferLockViolation;

    modifier useActor(uint256 actorSeed) {
        currentActor = actors[bound(actorSeed, 0, actors.length - 1)];
        vm.startPrank(currentActor);
        _;
        vm.stopPrank();
    }

    constructor() {
        for (uint256 i; i < NUM_ACTORS; ++i) {
            actors.push(makeAddr(string(abi.encodePacked("ntActor", i))));
        }

        token = new MockLSP7NonTransferable(
            "NonTransferable",
            "NT",
            address(this),
            _LSP4_TOKEN_TYPE_TOKEN,
            false,
            InvariantConstants.TRANSFER_LOCK_START,
            InvariantConstants.TRANSFER_LOCK_END
        );

        token.mint(address(this), 1_000, true, "");
        for (uint256 i; i < NUM_ACTORS; ++i) {
            token.mint(actors[i], 100, true, "");
        }
    }

    function mint(uint256 amount, uint256 toSeed) external {
        amount = bound(amount, 1, 200);
        address to = actors[bound(toSeed, 0, actors.length - 1)];

        try token.mint(to, amount, true, "") {} catch {}
    }

    function transfer(
        uint256 amount,
        uint256 toSeed,
        uint256 actorSeed
    ) external useActor(actorSeed) {
        uint256 balance = token.balanceOf(currentActor);
        if (balance == 0) return;

        amount = bound(amount, 1, balance);
        address to = actors[bound(toSeed, 0, actors.length - 1)];

        try token.transfer(currentActor, to, amount, true, "") {
            if (
                !token.isTransferable() &&
                !token.hasRole(token.NON_TRANSFERABLE_BYPASS_ROLE(), currentActor)
            ) {
                ghost_transferLockViolation = true;
            }
        } catch {}
    }

    function burn(uint256 amount, uint256 actorSeed) external useActor(actorSeed) {
        uint256 balance = token.balanceOf(currentActor);
        if (balance == 0) return;

        amount = bound(amount, 1, balance);

        try token.burn(currentActor, amount, "") {} catch {}
    }

    function makeTransferable() external {
        if (!token.transferLockEnabled()) return;

        vm.prank(token.owner());
        try token.makeTransferable() {
            ghost_transferLockWasDisabled = true;
        } catch {}
    }

    function updateTransferLockPeriod(uint256 newStart, uint256 newEnd) external {
        if (!token.transferLockEnabled()) return;

        newStart = bound(newStart, 0, 30 days);
        newEnd = bound(newEnd, newStart, 60 days);

        vm.prank(token.owner());
        try token.updateTransferLockPeriod(newStart, newEnd) {} catch {}
    }

    function warpTime(uint256 secondsForward) external {
        secondsForward = bound(secondsForward, 1, 45 days);
        vm.warp(block.timestamp + secondsForward);
    }

    function grantBypassRole(uint256 actorSeed) external {
        address actor = actors[bound(actorSeed, 0, actors.length - 1)];

        vm.prank(token.owner());
        try token.grantRole(token.NON_TRANSFERABLE_BYPASS_ROLE(), actor) {} catch {}
    }

    function transferOwnership(uint256 newOwnerSeed) external {
        address newOwner = makeAddr(
            string(abi.encodePacked("ntOwner", newOwnerSeed))
        );

        vm.prank(token.owner());
        try token.transferOwnership(newOwner) {
            assertEq(
                token.getRoleAdmin(token.NON_TRANSFERABLE_BYPASS_ROLE()),
                token.DEFAULT_ADMIN_ROLE()
            );
        } catch {}
    }
}
