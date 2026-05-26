// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {MockLSP8CappedSupply} from "../mocks/InvariantTestMocks.sol";
import {InvariantConstants} from "../helpers/InvariantConstants.sol";
import {
    _LSP4_TOKEN_TYPE_NFT
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {_LSP8_TOKENID_FORMAT_NUMBER} from "../../../contracts/LSP8Constants.sol";

/// @dev Handler for LSP8CappedSupplyAbstract invariants 45–46 (constructor: 45 only).
contract LSP8CappedSupplyHandler is Test {
    MockLSP8CappedSupply public token;

    uint256 public configuredSupplyCap;
    bool public ghost_mintOverCapSucceeded;
    uint256 internal nextTokenId;

    constructor() {
        configuredSupplyCap = InvariantConstants.SUPPLY_CAP;

        token = new MockLSP8CappedSupply(
            "Capped Supply",
            "CS",
            address(this),
            _LSP4_TOKEN_TYPE_NFT,
            _LSP8_TOKENID_FORMAT_NUMBER,
            configuredSupplyCap
        );
    }

    function mint(uint256 toSeed) external {
        address to = makeAddr(string(abi.encodePacked("csTo", toSeed)));

        try token.mint(to, _freshTokenId(), true, "") {} catch {}
    }

    function attemptMintOverSupplyCap(uint256 toSeed) external {
        uint256 cap = configuredSupplyCap;
        if (cap == 0) return;

        if (token.totalSupply() >= cap) {
            address to = makeAddr(string(abi.encodePacked("csOverCap", toSeed)));
            try token.mint(to, _freshTokenId(), true, "") {
                ghost_mintOverCapSucceeded = true;
            } catch {}
            return;
        }

        while (token.totalSupply() < cap) {
            token.mint(address(this), _freshTokenId(), true, "");
        }

        address to = makeAddr(string(abi.encodePacked("csOverCap", toSeed)));
        try token.mint(to, _freshTokenId(), true, "") {
            ghost_mintOverCapSucceeded = true;
        } catch {}
    }

    function _freshTokenId() internal returns (bytes32) {
        return bytes32(++nextTokenId);
    }
}
