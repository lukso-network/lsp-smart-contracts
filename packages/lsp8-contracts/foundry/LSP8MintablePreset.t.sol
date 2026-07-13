// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// foundry
import {Test} from "forge-std/Test.sol";

// contracts
import {LSP8Mintable} from "../contracts/presets/LSP8Mintable.sol";

// errors
import {LSP8NotTokenOperator} from "../contracts/LSP8Errors.sol";

// constants
import {
    _LSP4_TOKEN_TYPE_NFT
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {_LSP8_TOKENID_FORMAT_NUMBER} from "../contracts/LSP8Constants.sol";

contract LSP8MintablePresetTest is Test {
    LSP8Mintable lsp8Mintable;

    address tokenHolder;
    address operator;

    function setUp() public {
        tokenHolder = makeAddr("tokenHolder");
        operator = makeAddr("operator");

        lsp8Mintable = new LSP8Mintable(
            "Test NFT",
            "TNFT",
            address(this),
            _LSP4_TOKEN_TYPE_NFT,
            _LSP8_TOKENID_FORMAT_NUMBER
        );
    }

    function test_TokenHolderCanBurnToken() public {
        bytes32 tokenId = bytes32(uint256(1));
        lsp8Mintable.mint(tokenHolder, tokenId, true, "");

        vm.prank(tokenHolder);
        lsp8Mintable.burn(tokenId, "");

        assertEq(lsp8Mintable.balanceOf(tokenHolder), 0);
        assertEq(lsp8Mintable.totalSupply(), 0);
    }

    function test_OperatorCanBurnTokenOnBehalfOfTokenHolder() public {
        bytes32 tokenId = bytes32(uint256(1));
        lsp8Mintable.mint(tokenHolder, tokenId, true, "");

        vm.prank(tokenHolder);
        lsp8Mintable.authorizeOperator(operator, tokenId, "");

        vm.prank(operator);
        lsp8Mintable.burn(tokenId, "");

        assertEq(lsp8Mintable.balanceOf(tokenHolder), 0);
        assertEq(lsp8Mintable.totalSupply(), 0);
    }

    function testFuzz_OperatorCanBurnAuthorizedTokens(
        uint256 authorizedTokenCountSeed,
        uint256 burnTokenCountSeed
    ) public {
        uint256 authorizedTokenCount = bound(authorizedTokenCountSeed, 1, 10);
        uint256 burnTokenCount = bound(
            burnTokenCountSeed,
            1,
            authorizedTokenCount
        );

        for (uint256 ii = 1; ii <= authorizedTokenCount; ii++) {
            bytes32 tokenId = bytes32(ii);
            lsp8Mintable.mint(tokenHolder, tokenId, true, "");

            vm.prank(tokenHolder);
            lsp8Mintable.authorizeOperator(operator, tokenId, "");
        }

        for (uint256 ii = 1; ii <= burnTokenCount; ii++) {
            vm.prank(operator);
            lsp8Mintable.burn(bytes32(ii), "");
        }

        assertEq(
            lsp8Mintable.balanceOf(tokenHolder),
            authorizedTokenCount - burnTokenCount
        );
        assertEq(
            lsp8Mintable.totalSupply(),
            authorizedTokenCount - burnTokenCount
        );
    }

    function testFuzz_OperatorCannotBurnMoreThanAuthorizedTokens(
        uint256 authorizedTokenCountSeed
    ) public {
        uint256 authorizedTokenCount = bound(authorizedTokenCountSeed, 1, 10);

        for (uint256 ii = 1; ii <= authorizedTokenCount + 1; ii++) {
            bytes32 tokenId = bytes32(ii);
            lsp8Mintable.mint(tokenHolder, tokenId, true, "");

            if (ii > authorizedTokenCount) continue;

            vm.prank(tokenHolder);
            lsp8Mintable.authorizeOperator(operator, tokenId, "");
        }

        for (uint256 ii = 1; ii <= authorizedTokenCount; ii++) {
            vm.prank(operator);
            lsp8Mintable.burn(bytes32(ii), "");
        }

        bytes32 unauthorizedTokenId = bytes32(authorizedTokenCount + 1);

        vm.prank(operator);
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP8NotTokenOperator.selector,
                unauthorizedTokenId,
                operator
            )
        );
        lsp8Mintable.burn(unauthorizedTokenId, "");

        assertEq(lsp8Mintable.balanceOf(tokenHolder), 1);
        assertEq(lsp8Mintable.tokenOwnerOf(unauthorizedTokenId), tokenHolder);
    }
}
