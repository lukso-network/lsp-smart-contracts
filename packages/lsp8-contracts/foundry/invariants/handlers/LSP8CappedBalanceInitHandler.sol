// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

import {MockLSP8CappedBalanceInit} from "../mocks/InvariantTestMocks.sol";
import {InvariantConstants} from "../helpers/InvariantConstants.sol";
import {
    _LSP4_TOKEN_TYPE_NFT
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {_LSP8_TOKENID_FORMAT_NUMBER} from "../../../contracts/LSP8Constants.sol";

/// @dev Handler for LSP8CappedBalanceInitAbstract invariants 41–44.
contract LSP8CappedBalanceInitHandler is Test {
    address internal constant DEAD_ADDRESS =
        0x000000000000000000000000000000000000dEaD;

    MockLSP8CappedBalanceInit public implementation;
    MockLSP8CappedBalanceInit public token;

    uint256 public configuredBalanceCap;
    uint256 internal nextTokenId;

    bool public ghost_exemptCapBypassFailed;

    constructor() {
        configuredBalanceCap = InvariantConstants.BALANCE_CAP;

        implementation = new MockLSP8CappedBalanceInit();
        address instance = Clones.clone(address(implementation));
        token = MockLSP8CappedBalanceInit(payable(instance));

        token.initialize(
            "Capped Balance Init",
            "CBI",
            address(this),
            _LSP4_TOKEN_TYPE_NFT,
            _LSP8_TOKENID_FORMAT_NUMBER,
            configuredBalanceCap
        );
    }

    function mint(uint256 toSeed) external {
        address to = makeAddr(string(abi.encodePacked("cbInitTo", toSeed)));
        bytes32 tokenId = _freshTokenId();

        try token.mint(to, tokenId, true, "") {
            _assertRecipientBalanceCap(to);
        } catch {}
    }

    function transfer(uint256 fromSeed, uint256 toSeed) external {
        address from = makeAddr(string(abi.encodePacked("cbInitFrom", fromSeed)));
        address to = makeAddr(string(abi.encodePacked("cbInitToXfer", toSeed)));

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
        address account = makeAddr(string(abi.encodePacked("cbInitExempt", accountSeed)));

        vm.prank(token.owner());
        try token.grantRole(token.UNCAPPED_BALANCE_ROLE(), account) {} catch {}
    }

    function mintManyToExemptAccount(uint256 accountSeed) external {
        address account = makeAddr(string(abi.encodePacked("cbInitExempt", accountSeed)));
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
