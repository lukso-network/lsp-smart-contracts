// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

import {MockLSP8CappedSupplyInit} from "../mocks/InvariantTestMocks.sol";
import {InvariantConstants} from "../helpers/InvariantConstants.sol";
import {
    _LSP4_TOKEN_TYPE_NFT
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {_LSP8_TOKENID_FORMAT_NUMBER} from "../../../contracts/LSP8Constants.sol";

/// @dev Handler for LSP8CappedSupplyInitAbstract invariants 45–46.
contract LSP8CappedSupplyInitHandler is Test {
    MockLSP8CappedSupplyInit public implementation;
    MockLSP8CappedSupplyInit public token;

    uint256 public configuredSupplyCap;
    bool public ghost_mintOverCapSucceeded;
    uint256 internal nextTokenId;

    constructor() {
        configuredSupplyCap = InvariantConstants.SUPPLY_CAP;

        implementation = new MockLSP8CappedSupplyInit();
        address instance = Clones.clone(address(implementation));
        token = MockLSP8CappedSupplyInit(payable(instance));

        token.initialize(
            "Capped Supply Init",
            "CSI",
            address(this),
            _LSP4_TOKEN_TYPE_NFT,
            _LSP8_TOKENID_FORMAT_NUMBER,
            configuredSupplyCap
        );
    }

    function mint(uint256 toSeed) external {
        address to = makeAddr(string(abi.encodePacked("csInitTo", toSeed)));

        try token.mint(to, _freshTokenId(), true, "") {} catch {}
    }

    function attemptMintOverSupplyCap(uint256 toSeed) external {
        uint256 cap = configuredSupplyCap;
        if (cap == 0) return;

        if (token.totalSupply() >= cap) {
            address to = makeAddr(string(abi.encodePacked("csInitOverCap", toSeed)));
            try token.mint(to, _freshTokenId(), true, "") {
                ghost_mintOverCapSucceeded = true;
            } catch {}
            return;
        }

        while (token.totalSupply() < cap) {
            token.mint(address(this), _freshTokenId(), true, "");
        }

        address to = makeAddr(string(abi.encodePacked("csInitOverCap", toSeed)));
        try token.mint(to, _freshTokenId(), true, "") {
            ghost_mintOverCapSucceeded = true;
        } catch {}
    }

    function _freshTokenId() internal returns (bytes32) {
        return bytes32(++nextTokenId);
    }
}
