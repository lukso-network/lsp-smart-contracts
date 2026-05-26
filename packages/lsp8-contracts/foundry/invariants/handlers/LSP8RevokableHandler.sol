// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {MockLSP8Revokable} from "../mocks/InvariantTestMocks.sol";
import {
    _LSP4_TOKEN_TYPE_NFT
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {_LSP8_TOKENID_FORMAT_NUMBER} from "../../../contracts/LSP8Constants.sol";

/// @dev Handler for LSP8RevokableAbstract invariants 51–53.
contract LSP8RevokableHandler is Test {
    uint256 internal constant NUM_ACTORS = 5;

    MockLSP8Revokable public token;

    address[] public actors;
    uint256 internal nextTokenId;

    bool public ghost_revokableWasDisabled;
    bool public ghost_revokeDestinationViolation;
    bool public ghost_revokerRoleViolationAfterOwnershipTransfer;

    constructor() {
        for (uint256 i; i < NUM_ACTORS; ++i) {
            actors.push(makeAddr(string(abi.encodePacked("revActor", i))));
        }

        token = new MockLSP8Revokable(
            "Revokable",
            "RVK",
            address(this),
            _LSP4_TOKEN_TYPE_NFT,
            _LSP8_TOKENID_FORMAT_NUMBER,
            true
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

    function revoke(uint256 tokenIdSeed, uint256 holderSeed, uint256 recipientSeed) external {
        if (!token.isRevokable()) return;

        address holder = actors[bound(holderSeed, 0, actors.length - 1)];
        bytes32 tokenId = _pickTokenIdOwnedBy(holder, tokenIdSeed);
        if (tokenId == bytes32(0)) return;

        address recipient = _pickRevokeRecipient(recipientSeed);

        vm.prank(token.owner());
        try token.revoke(holder, recipient, tokenId, "") {
            if (
                recipient != token.owner() &&
                !token.hasRole(token.REVOKER_ROLE(), recipient)
            ) {
                ghost_revokeDestinationViolation = true;
            }
        } catch {}
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
            if (!_revokerSetHardenedAfterTransfer(newOwner)) {
                ghost_revokerRoleViolationAfterOwnershipTransfer = true;
            }
        } catch {}
    }

    function _revokerSetHardenedAfterTransfer(
        address newOwner
    ) internal view returns (bool) {
        if (
            token.getRoleAdmin(token.REVOKER_ROLE()) !=
            token.DEFAULT_ADMIN_ROLE()
        ) {
            return false;
        }

        address[] memory revokers = token.getRoleMembers(token.REVOKER_ROLE());
        for (uint256 i; i < revokers.length; ++i) {
            if (revokers[i] != newOwner) return false;
        }

        return true;
    }

    function _pickRevokeRecipient(uint256 seed) internal view returns (address) {
        if (seed % 2 == 0) return token.owner();

        address candidate = actors[bound(seed, 0, actors.length - 1)];
        if (token.hasRole(token.REVOKER_ROLE(), candidate)) return candidate;

        return token.owner();
    }

    function _pickTokenIdOwnedBy(
        address holder,
        uint256 seed
    ) internal view returns (bytes32) {
        bytes32[] memory owned = token.tokenIdsOf(holder);
        if (owned.length == 0) return bytes32(0);
        return owned[bound(seed, 0, owned.length - 1)];
    }

    function _freshTokenId() internal returns (bytes32) {
        return bytes32(++nextTokenId);
    }
}
