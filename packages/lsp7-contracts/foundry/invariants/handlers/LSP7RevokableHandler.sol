// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {MockLSP7Revokable} from "../mocks/InvariantTestMocks.sol";
import {
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

/// @dev Handler for LSP7RevokableAbstract invariants 24–25.
contract LSP7RevokableHandler is Test {
    uint256 internal constant NUM_ACTORS = 5;

    MockLSP7Revokable public token;

    address[] public actors;

    bool public ghost_revokableWasDisabled;
    bool public ghost_revokerRoleViolationAfterOwnershipTransfer;

    constructor() {
        for (uint256 i; i < NUM_ACTORS; ++i) {
            actors.push(makeAddr(string(abi.encodePacked("revActor", i))));
        }

        token = new MockLSP7Revokable(
            "Revokable",
            "RVK",
            address(this),
            _LSP4_TOKEN_TYPE_TOKEN,
            false,
            true
        );

        token.mint(address(this), 1_000, true, "");
        for (uint256 i; i < NUM_ACTORS; ++i) {
            token.mint(actors[i], 200, true, "");
        }
    }

    function mint(uint256 amount, uint256 toSeed) external {
        amount = bound(amount, 1, 200);
        address to = actors[bound(toSeed, 0, actors.length - 1)];

        try token.mint(to, amount, true, "") {} catch {}
    }

    function revoke(
        uint256 amount,
        uint256 holderSeed,
        uint256 recipientSeed
    ) external {
        if (!token.isRevokable()) return;

        address holder = actors[bound(holderSeed, 0, actors.length - 1)];
        uint256 holderBalance = token.balanceOf(holder);
        if (holderBalance == 0) return;

        amount = bound(amount, 1, holderBalance);
        address recipient = _pickRevokeRecipient(recipientSeed);

        vm.prank(token.owner());
        try token.revoke(holder, recipient, amount, "") {} catch {}
    }

    function disableRevokable() external {
        if (!token.isRevokable()) return;

        vm.prank(token.owner());
        try token.disableRevokable() {
            ghost_revokableWasDisabled = true;
        } catch {}
    }

    function grantRevokerRole(uint256 actorSeed) external {
        address actor = actors[bound(actorSeed, 0, actors.length - 1)];

        vm.prank(token.owner());
        try token.grantRole(token.REVOKER_ROLE(), actor) {} catch {}
    }

    function transferOwnership(uint256 newOwnerSeed) external {
        address newOwner = makeAddr(
            string(abi.encodePacked("revOwner", newOwnerSeed))
        );
        address oldOwner = token.owner();

        vm.prank(oldOwner);
        try token.transferOwnership(newOwner) {
            if (!_onlyNewOwnerHasRevokerRole(newOwner)) {
                ghost_revokerRoleViolationAfterOwnershipTransfer = true;
            }
        } catch {}
    }

    function _pickRevokeRecipient(uint256 seed) internal view returns (address) {
        if (seed % 2 == 0) return token.owner();

        address candidate = actors[bound(seed, 0, actors.length - 1)];
        if (token.hasRole(token.REVOKER_ROLE(), candidate)) return candidate;

        return token.owner();
    }

    function _onlyNewOwnerHasRevokerRole(
        address newOwner
    ) internal view returns (bool) {
        if (!token.hasRole(token.REVOKER_ROLE(), newOwner)) return false;

        address[] memory revokers = token.getRoleMembers(token.REVOKER_ROLE());
        for (uint256 i; i < revokers.length; ++i) {
            if (
                revokers[i] != newOwner &&
                token.hasRole(token.REVOKER_ROLE(), revokers[i])
            ) {
                return false;
            }
        }

        return true;
    }
}
