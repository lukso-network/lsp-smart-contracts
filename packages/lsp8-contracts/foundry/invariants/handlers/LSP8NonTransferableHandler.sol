// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {MockLSP8NonTransferable} from "../mocks/InvariantTestMocks.sol";
import {InvariantConstants} from "../helpers/InvariantConstants.sol";
import {
    _LSP4_TOKEN_TYPE_NFT
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {_LSP8_TOKENID_FORMAT_NUMBER} from "../../../contracts/LSP8Constants.sol";

/// @dev Handler for LSP8NonTransferableAbstract invariants 49–50.
contract LSP8NonTransferableHandler is Test {
    uint256 internal constant NUM_ACTORS = 4;

    MockLSP8NonTransferable public token;

    address[] public actors;
    address internal currentActor;
    uint256 internal nextTokenId;

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

        token = new MockLSP8NonTransferable(
            "NonTransferable",
            "NT",
            address(this),
            _LSP4_TOKEN_TYPE_NFT,
            _LSP8_TOKENID_FORMAT_NUMBER,
            InvariantConstants.TRANSFER_LOCK_START,
            InvariantConstants.TRANSFER_LOCK_END
        );

        token.mint(address(this), bytes32(uint256(1)), true, "");
        for (uint256 i; i < NUM_ACTORS; ++i) {
            token.mint(actors[i], bytes32(uint256(i + 2)), true, "");
        }
        nextTokenId = NUM_ACTORS + 2;
    }

    function mint(uint256 toSeed) external {
        address to = actors[bound(toSeed, 0, actors.length - 1)];

        try token.mint(to, _freshTokenId(), true, "") {} catch {}
    }

    function transfer(uint256 tokenIdSeed, uint256 toSeed, uint256 actorSeed) external useActor(actorSeed) {
        bytes32 tokenId = _pickOwnedTokenId(tokenIdSeed);
        if (tokenId == bytes32(0)) return;

        address to = actors[bound(toSeed, 0, actors.length - 1)];

        try token.transfer(currentActor, to, tokenId, true, "") {
            if (
                !token.isTransferable() &&
                !token.hasRole(token.NON_TRANSFERABLE_BYPASS_ROLE(), currentActor)
            ) {
                ghost_transferLockViolation = true;
            }
        } catch {}
    }

    function makeTransferable() external {
        if (!token.transferLockEnabled()) return;

        vm.prank(token.owner());
        try token.makeTransferable() {
            ghost_transferLockWasDisabled = true;
        } catch {}
    }

    function warpTime(uint256 secondsForward) external {
        secondsForward = bound(secondsForward, 1, 45 days);
        vm.warp(block.timestamp + secondsForward);
    }

    function _pickOwnedTokenId(uint256 seed) internal view returns (bytes32) {
        bytes32[] memory owned = token.tokenIdsOf(currentActor);
        if (owned.length == 0) return bytes32(0);
        return owned[bound(seed, 0, owned.length - 1)];
    }

    function _freshTokenId() internal returns (bytes32) {
        return bytes32(++nextTokenId);
    }
}
