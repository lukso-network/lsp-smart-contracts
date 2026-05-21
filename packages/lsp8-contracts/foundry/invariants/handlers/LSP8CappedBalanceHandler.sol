// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {MockLSP8CappedBalance} from "../mocks/InvariantTestMocks.sol";
import {InvariantConstants} from "../helpers/InvariantConstants.sol";
import {
    _LSP4_TOKEN_TYPE_NFT
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {_LSP8_TOKENID_FORMAT_NUMBER} from "../../../contracts/LSP8Constants.sol";

/// @dev Handler for LSP8CappedBalanceAbstract invariants 41–43.
contract LSP8CappedBalanceHandler is Test {
    address internal constant DEAD_ADDRESS =
        0x000000000000000000000000000000000000dEaD;

    MockLSP8CappedBalance public token;
    uint256 public configuredBalanceCap;
    uint256 internal nextTokenId;

    bool public ghost_exemptCapBypassFailed;

    constructor() {
        configuredBalanceCap = InvariantConstants.BALANCE_CAP;

        token = new MockLSP8CappedBalance(
            "Capped Balance",
            "CB",
            address(this),
            _LSP4_TOKEN_TYPE_NFT,
            _LSP8_TOKENID_FORMAT_NUMBER,
            configuredBalanceCap
        );
    }

    function mint(uint256 toSeed) external {
        address to = makeAddr(string(abi.encodePacked("cbTo", toSeed)));
        bytes32 tokenId = _freshTokenId();

        try token.mint(to, tokenId, true, "") {
            _assertRecipientBalanceCap(to);
        } catch {}
    }

    function transfer(uint256 fromSeed, uint256 toSeed) external {
        address from = makeAddr(string(abi.encodePacked("cbFrom", fromSeed)));
        address to = makeAddr(string(abi.encodePacked("cbToXfer", toSeed)));

        for (uint256 i; i < configuredBalanceCap; ++i) {
            token.mint(from, _freshTokenId(), true, "");
        }

        bytes32[] memory owned = token.tokenIdsOf(from);
        if (owned.length == 0) return;

        bytes32 tokenId = owned[0];

        try token.transfer(from, to, tokenId, true, "") {
            _assertRecipientBalanceCap(to);
        } catch {}
    }

    function grantUncappedRole(uint256 accountSeed) external {
        address account = makeAddr(string(abi.encodePacked("cbExempt", accountSeed)));

        vm.prank(token.owner());
        try token.grantRole(token.UNCAPPED_BALANCE_ROLE(), account) {} catch {}
    }

    function mintManyToExemptAccount(uint256 accountSeed) external {
        address account = makeAddr(string(abi.encodePacked("cbExempt", accountSeed)));
        if (!token.hasRole(token.UNCAPPED_BALANCE_ROLE(), account)) return;

        uint256 targetBalance = configuredBalanceCap + 2;
        while (token.balanceOf(account) < targetBalance) {
            try token.mint(account, _freshTokenId(), true, "") {} catch {
                ghost_exemptCapBypassFailed = true;
                return;
            }
        }
    }

    function _assertRecipientBalanceCap(address to) internal {
        if (configuredBalanceCap == 0) return;
        if (to == address(0) || to == DEAD_ADDRESS) return;
        if (token.hasRole(token.UNCAPPED_BALANCE_ROLE(), to)) return;

        assertLe(token.balanceOf(to), configuredBalanceCap);
    }

    function _freshTokenId() internal returns (bytes32) {
        return bytes32(++nextTokenId);
    }
}
