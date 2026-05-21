// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {
    LSP8CustomizableToken,
    LSP8MintableParams,
    LSP8NonTransferableParams,
    LSP8CappedParams,
    LSP8RevokableParams
} from "../../../contracts/presets/LSP8CustomizableToken.sol";
import {InvariantConstants} from "../helpers/InvariantConstants.sol";
import {
    _LSP4_TOKEN_TYPE_NFT
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {_LSP8_TOKENID_FORMAT_NUMBER} from "../../../contracts/LSP8Constants.sol";

/// @dev Handler for LSP8CustomizableToken preset invariants 26–35.
contract LSP8CustomizableTokenHandler is Test {
    uint256 internal constant NUM_ACTORS = 6;
    address internal constant DEAD_ADDRESS =
        0x000000000000000000000000000000000000dEaD;

    LSP8CustomizableToken public token;

    uint256 public configuredSupplyCap;
    uint256 public configuredBalanceCap;

    address[] public actors;
    address[] public trackedHolders;
    bytes32[] public trackedTokenIds;

    address internal currentActor;
    uint256 internal nextTokenId;

    bool public ghost_transferLockViolation;
    bool public ghost_revokeWhenDisabledSucceeded;
    bool public ghost_mintOverCapSucceeded;
    bool public ghost_mintInvariantViolation;
    bool public ghost_burnInvariantViolation;
    bool public ghost_transferInvariantViolation;
    bool public ghost_existenceInvariantViolation;

    modifier useActor(uint256 actorSeed) {
        currentActor = actors[bound(actorSeed, 0, actors.length - 1)];
        vm.startPrank(currentActor);
        _;
        vm.stopPrank();
    }

    constructor() {
        configuredSupplyCap = InvariantConstants.SUPPLY_CAP;
        configuredBalanceCap = InvariantConstants.BALANCE_CAP;

        for (uint256 i; i < NUM_ACTORS; ++i) {
            actors.push(makeAddr(string(abi.encodePacked("lsp8Actor", i))));
        }

        address deployer = address(this);

        bytes32[] memory initialTokenIds = new bytes32[](3);
        initialTokenIds[0] = bytes32(uint256(1));
        initialTokenIds[1] = bytes32(uint256(2));
        initialTokenIds[2] = bytes32(uint256(3));
        nextTokenId = 4;

        token = new LSP8CustomizableToken(
            "Invariant NFT",
            "INVNFT",
            deployer,
            _LSP4_TOKEN_TYPE_NFT,
            _LSP8_TOKENID_FORMAT_NUMBER,
            LSP8MintableParams({
                isMintable: true,
                initialMintTokenIds: initialTokenIds
            }),
            LSP8CappedParams({
                tokenBalanceCap: configuredBalanceCap,
                tokenSupplyCap: configuredSupplyCap
            }),
            LSP8NonTransferableParams({
                transferLockStart: InvariantConstants.TRANSFER_LOCK_START,
                transferLockEnd: InvariantConstants.TRANSFER_LOCK_END
            }),
            LSP8RevokableParams({isRevokable: true})
        );

        _trackHolder(deployer);
        for (uint256 i; i < initialTokenIds.length; ++i) {
            _trackTokenId(initialTokenIds[i]);
        }
    }

    function mint(uint256 toSeed) external {
        address to = actors[bound(toSeed, 0, actors.length - 1)];
        bytes32 tokenId = _freshTokenId();

        uint256 cap = configuredSupplyCap;
        if (cap != 0 && token.totalSupply() >= cap) {
            vm.prank(token.owner());
            try token.mint(to, tokenId, true, "") {
                ghost_mintOverCapSucceeded = true;
            } catch {}
            return;
        }

        uint256 balanceBefore = token.balanceOf(to);
        uint256 supplyBefore = token.totalSupply();

        vm.prank(token.owner());
        try token.mint(to, tokenId, true, "") {
            if (
                token.tokenOwnerOf(tokenId) != to ||
                token.balanceOf(to) != balanceBefore + 1 ||
                token.totalSupply() != supplyBefore + 1
            ) {
                ghost_mintInvariantViolation = true;
            }
            _trackHolder(to);
            _trackTokenId(tokenId);
            _assertRecipientBalanceCap(to);
        } catch {}
    }

    function burn(uint256 tokenIdSeed, uint256 actorSeed) external useActor(actorSeed) {
        bytes32 tokenId = _pickOwnedTokenId(tokenIdSeed);
        if (tokenId == bytes32(0)) return;

        address owner = token.tokenOwnerOf(tokenId);
        uint256 balanceBefore = token.balanceOf(owner);
        uint256 supplyBefore = token.totalSupply();

        try token.burn(tokenId, "") {
            if (
                token.tokenOwnerOf(tokenId) != address(0) ||
                token.balanceOf(owner) != balanceBefore - 1 ||
                token.totalSupply() != supplyBefore - 1
            ) {
                ghost_burnInvariantViolation = true;
            }
            _trackHolder(owner);
        } catch {}
    }

    function transfer(uint256 tokenIdSeed, uint256 toSeed, uint256 actorSeed) external useActor(actorSeed) {
        bytes32 tokenId = _pickOwnedTokenId(tokenIdSeed);
        if (tokenId == bytes32(0)) return;

        address to = actors[bound(toSeed, 0, actors.length - 1)];
        address from = currentActor;

        if (from == to) return;

        uint256 fromBalanceBefore = token.balanceOf(from);
        uint256 toBalanceBefore = token.balanceOf(to);
        address ownerBefore = token.tokenOwnerOf(tokenId);

        try token.transfer(from, to, tokenId, true, "") {
            if (
                !token.isTransferable() &&
                !token.hasRole(token.NON_TRANSFERABLE_BYPASS_ROLE(), from)
            ) {
                ghost_transferLockViolation = true;
            }

            if (
                token.balanceOf(from) != fromBalanceBefore - 1 ||
                token.balanceOf(to) != toBalanceBefore + 1 ||
                token.tokenOwnerOf(tokenId) != to
            ) {
                ghost_transferInvariantViolation = true;
            }

            if (ownerBefore != from) {
                ghost_existenceInvariantViolation = true;
            }

            _trackHolder(to);
            _trackHolder(from);
            _assertRecipientBalanceCap(to);
        } catch {}
    }

    function revoke(uint256 tokenIdSeed, uint256 holderSeed, uint256 recipientSeed) external {
        if (!token.isRevokable()) return;

        address holder = actors[bound(holderSeed, 0, actors.length - 1)];
        bytes32 tokenId = _pickTokenIdOwnedBy(holder, tokenIdSeed);
        if (tokenId == bytes32(0)) return;

        address recipient = _pickRevokeRecipient(recipientSeed);
        address ownerBefore = token.tokenOwnerOf(tokenId);

        vm.prank(token.owner());
        try token.revoke(holder, recipient, tokenId, "") {
            require(
                recipient == token.owner() ||
                    token.hasRole(token.REVOKER_ROLE(), recipient),
                "revoke destination must be owner or revoker"
            );
            if (ownerBefore != holder) {
                ghost_existenceInvariantViolation = true;
            }
            _trackHolder(recipient);
            _trackHolder(holder);
            _assertRecipientBalanceCap(recipient);
        } catch {}
    }

    function attemptRevokeWhenDisabled(uint256 tokenIdSeed, uint256 holderSeed) external {
        if (token.isRevokable()) return;

        address holder = actors[bound(holderSeed, 0, actors.length - 1)];
        bytes32 tokenId = _pickTokenIdOwnedBy(holder, tokenIdSeed);
        if (tokenId == bytes32(0)) return;

        uint256 supplyBefore = token.totalSupply();
        address ownerBefore = token.tokenOwnerOf(tokenId);

        vm.prank(token.owner());
        try token.revoke(holder, token.owner(), tokenId, "") {
            ghost_revokeWhenDisabledSucceeded = true;
            if (
                token.totalSupply() != supplyBefore ||
                token.tokenOwnerOf(tokenId) != ownerBefore
            ) {
                ghost_revokeWhenDisabledSucceeded = true;
            }
        } catch {}
    }

    function attemptOpsOnNonExistentToken(uint256 tokenIdSeed, uint256 actorSeed) external useActor(actorSeed) {
        bytes32 tokenId = bytes32(tokenIdSeed);
        if (token.tokenOwnerOf(tokenId) != address(0)) return;

        uint256 supplyBefore = token.totalSupply();

        try token.burn(tokenId, "") {
            ghost_existenceInvariantViolation = true;
        } catch {}

        try token.transfer(currentActor, actors[0], tokenId, true, "") {
            ghost_existenceInvariantViolation = true;
        } catch {}

        if (!token.isRevokable()) return;

        vm.prank(token.owner());
        try token.revoke(currentActor, token.owner(), tokenId, "") {
            if (token.totalSupply() != supplyBefore) {
                ghost_existenceInvariantViolation = true;
            }
        } catch {}
    }

    function disableRevokable() external {
        if (!token.isRevokable()) return;

        vm.prank(token.owner());
        try token.disableRevokable() {} catch {}
    }

    function makeTransferable() external {
        vm.prank(token.owner());
        try token.makeTransferable() {} catch {}
    }

    function updateTransferLockPeriod(uint256 newStart, uint256 newEnd) external {
        newStart = bound(newStart, 0, 30 days);
        newEnd = bound(newEnd, newStart, 60 days);

        vm.prank(token.owner());
        try token.updateTransferLockPeriod(newStart, newEnd) {} catch {}
    }

    function warpTime(uint256 secondsForward) external {
        secondsForward = bound(secondsForward, 1, 45 days);
        vm.warp(block.timestamp + secondsForward);
    }

    function sumTrackedBalances() external view returns (uint256 sum) {
        for (uint256 i; i < trackedHolders.length; ++i) {
            sum += token.balanceOf(trackedHolders[i]);
        }
    }

    function countExistingTokenIds() external view returns (uint256 count) {
        for (uint256 i; i < trackedTokenIds.length; ++i) {
            if (token.tokenOwnerOf(trackedTokenIds[i]) != address(0)) {
                ++count;
            }
        }
    }

    function isBalanceCapExempt(address account) public view returns (bool) {
        return
            account == address(0) ||
            account == DEAD_ADDRESS ||
            token.hasRole(token.UNCAPPED_BALANCE_ROLE(), account);
    }

    function _assertRecipientBalanceCap(address to) internal {
        uint256 cap = configuredBalanceCap;
        if (cap == 0 || isBalanceCapExempt(to)) return;

        assertLe(token.balanceOf(to), cap);
    }

    function _trackHolder(address account) internal {
        if (account == address(0)) return;
        for (uint256 i; i < trackedHolders.length; ++i) {
            if (trackedHolders[i] == account) return;
        }
        trackedHolders.push(account);
    }

    function _trackTokenId(bytes32 tokenId) internal {
        for (uint256 i; i < trackedTokenIds.length; ++i) {
            if (trackedTokenIds[i] == tokenId) return;
        }
        trackedTokenIds.push(tokenId);
    }

    function _freshTokenId() internal returns (bytes32) {
        return bytes32(++nextTokenId);
    }

    function _pickOwnedTokenId(uint256 seed) internal view returns (bytes32) {
        bytes32[] memory owned = token.tokenIdsOf(currentActor);
        if (owned.length == 0) return bytes32(0);
        return owned[bound(seed, 0, owned.length - 1)];
    }

    function _pickTokenIdOwnedBy(
        address holder,
        uint256 seed
    ) internal view returns (bytes32) {
        bytes32[] memory owned = token.tokenIdsOf(holder);
        if (owned.length == 0) return bytes32(0);
        return owned[bound(seed, 0, owned.length - 1)];
    }

    function _pickRevokeRecipient(uint256 seed) internal view returns (address) {
        if (seed % 2 == 0) return token.owner();

        address candidate = actors[bound(seed, 0, actors.length - 1)];
        if (token.hasRole(token.REVOKER_ROLE(), candidate)) return candidate;

        return token.owner();
    }
}
