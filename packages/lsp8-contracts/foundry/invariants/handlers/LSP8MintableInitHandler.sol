// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

import {MockLSP8MintableInit} from "../mocks/InvariantTestMocks.sol";
import {
    _LSP4_TOKEN_TYPE_NFT
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {_LSP8_TOKENID_FORMAT_NUMBER} from "../../../contracts/LSP8Constants.sol";

/// @dev Handler for LSP8MintableInitAbstract invariants 47–48.
contract LSP8MintableInitHandler is Test {
    MockLSP8MintableInit public implementation;
    MockLSP8MintableInit public token;

    bool public ghost_mintingWasDisabled;
    bool public ghost_mintWhenDisabledSucceeded;
    uint256 internal nextTokenId;

    constructor() {
        implementation = new MockLSP8MintableInit();
        address instance = Clones.clone(address(implementation));
        token = MockLSP8MintableInit(payable(instance));

        token.initialize(
            "Mintable Init",
            "MNTI",
            address(this),
            _LSP4_TOKEN_TYPE_NFT,
            _LSP8_TOKENID_FORMAT_NUMBER,
            true
        );
    }

    function mint(uint256 toSeed) external {
        address to = makeAddr(string(abi.encodePacked("mntInitTo", toSeed)));

        try token.mint(to, _freshTokenId(), true, "") {} catch {}
    }

    function disableMinting() external {
        if (!token.isMintable()) return;

        try token.disableMinting() {
            ghost_mintingWasDisabled = true;
        } catch {}
    }

    function attemptMintWhenDisabled(uint256 toSeed) external {
        if (token.isMintable()) return;

        address to = makeAddr(string(abi.encodePacked("mntInitDisabledTo", toSeed)));

        try token.mint(to, _freshTokenId(), true, "") {
            ghost_mintWhenDisabledSucceeded = true;
        } catch {}
    }

    function _freshTokenId() internal returns (bytes32) {
        return bytes32(++nextTokenId);
    }
}
