// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// foundry
import {Test} from "forge-std/Test.sol";

// contracts
import {LSP7Mintable} from "../contracts/presets/LSP7Mintable.sol";

// errors
import {LSP7AmountExceedsAuthorizedAmount} from "../contracts/LSP7Errors.sol";

// constants
import {
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

contract LSP7MintablePresetTest is Test {
    LSP7Mintable lsp7Mintable;

    address tokenHolder;
    address operator;

    function setUp() public {
        tokenHolder = makeAddr("tokenHolder");
        operator = makeAddr("operator");

        lsp7Mintable = new LSP7Mintable(
            "Test Token",
            "TT",
            address(this),
            _LSP4_TOKEN_TYPE_TOKEN,
            false
        );
    }

    function test_TokenHolderCanBurnTokens() public {
        uint256 mintedAmount = 100;
        uint256 burnAmount = 40;

        lsp7Mintable.mint(tokenHolder, mintedAmount, true, "");

        vm.prank(tokenHolder);
        lsp7Mintable.burn(tokenHolder, burnAmount, "");

        assertEq(lsp7Mintable.balanceOf(tokenHolder), mintedAmount - burnAmount);
        assertEq(lsp7Mintable.totalSupply(), mintedAmount - burnAmount);
    }

    function test_OperatorCanBurnTokensOnBehalfOfTokenHolder() public {
        uint256 mintedAmount = 100;
        uint256 authorizedAmount = 60;
        uint256 burnAmount = 40;

        lsp7Mintable.mint(tokenHolder, mintedAmount, true, "");

        vm.prank(tokenHolder);
        lsp7Mintable.authorizeOperator(operator, authorizedAmount, "");

        vm.prank(operator);
        lsp7Mintable.burn(tokenHolder, burnAmount, "");

        assertEq(lsp7Mintable.balanceOf(tokenHolder), mintedAmount - burnAmount);
        assertEq(
            lsp7Mintable.authorizedAmountFor(operator, tokenHolder),
            authorizedAmount - burnAmount
        );
    }

    function testFuzz_OperatorCanBurnTokensWithinAuthorizedAmount(
        uint256 mintedAmountSeed,
        uint256 authorizedAmountSeed,
        uint256 burnAmountSeed
    ) public {
        uint256 mintedAmount = bound(mintedAmountSeed, 1, type(uint128).max);
        uint256 authorizedAmount = bound(authorizedAmountSeed, 1, mintedAmount);
        uint256 burnAmount = bound(burnAmountSeed, 1, authorizedAmount);

        lsp7Mintable.mint(tokenHolder, mintedAmount, true, "");

        vm.prank(tokenHolder);
        lsp7Mintable.authorizeOperator(operator, authorizedAmount, "");

        vm.prank(operator);
        lsp7Mintable.burn(tokenHolder, burnAmount, "");

        assertEq(lsp7Mintable.balanceOf(tokenHolder), mintedAmount - burnAmount);
        assertEq(
            lsp7Mintable.authorizedAmountFor(operator, tokenHolder),
            authorizedAmount - burnAmount
        );
    }

    function testFuzz_OperatorCannotBurnMoreThanAuthorizedAmount(
        uint256 mintedAmountSeed,
        uint256 authorizedAmountSeed,
        uint256 burnAmountSeed
    ) public {
        uint256 mintedAmount = bound(mintedAmountSeed, 2, type(uint128).max);
        uint256 authorizedAmount = bound(
            authorizedAmountSeed,
            1,
            mintedAmount - 1
        );
        uint256 burnAmount = bound(
            burnAmountSeed,
            authorizedAmount + 1,
            mintedAmount
        );

        lsp7Mintable.mint(tokenHolder, mintedAmount, true, "");

        vm.prank(tokenHolder);
        lsp7Mintable.authorizeOperator(operator, authorizedAmount, "");

        vm.prank(operator);
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7AmountExceedsAuthorizedAmount.selector,
                tokenHolder,
                authorizedAmount,
                operator,
                burnAmount
            )
        );
        lsp7Mintable.burn(tokenHolder, burnAmount, "");

        assertEq(lsp7Mintable.balanceOf(tokenHolder), mintedAmount);
        assertEq(
            lsp7Mintable.authorizedAmountFor(operator, tokenHolder),
            authorizedAmount
        );
    }
}
