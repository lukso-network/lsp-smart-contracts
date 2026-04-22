// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";

import {LSP7DigitalAsset} from "../contracts/LSP7DigitalAsset.sol";
import {
    LSP7CappedSupplyAbstract
} from "../contracts/extensions/LSP7CappedSupply/LSP7CappedSupplyAbstract.sol";

import {
    LSP7CappedSupplyCannotMintOverCap
} from "../contracts/extensions/LSP7CappedSupply/LSP7CappedSupplyErrors.sol";

import {
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

contract MockLSP7CappedSupply is LSP7CappedSupplyAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        uint256 tokenSupplyCap_
    )
        LSP7DigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        )
        LSP7CappedSupplyAbstract(tokenSupplyCap_)
    {}

    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public {
        _mint(to, amount, force, data);
    }

    function burn(address from, uint256 amount, bytes memory data) public {
        if (msg.sender != from) _spendAllowance(msg.sender, from, amount);

        _burn(from, amount, data);
    }
}

contract LSP7CappedSupplyTest is Test {
    string name = "Capped Token";
    string symbol = "CT";
    uint256 tokenType = _LSP4_TOKEN_TYPE_TOKEN;
    bool isNonDivisible = false;
    uint256 tokenSupplyCap = 1_000;

    address owner = address(this);
    address user1 = vm.addr(101);
    address user2 = vm.addr(102);

    MockLSP7CappedSupply lsp7CappedSupply;

    function setUp() public {
        lsp7CappedSupply = new MockLSP7CappedSupply(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            tokenSupplyCap
        );
    }

    function test_ConstructorInitializesCorrectly() public {
        assertEq(lsp7CappedSupply.tokenSupplyCap(), tokenSupplyCap);
        assertEq(lsp7CappedSupply.totalSupply(), 0);
    }

    function test_MintingUpToCapSucceeds() public {
        lsp7CappedSupply.mint(user1, tokenSupplyCap, true, "");

        assertEq(lsp7CappedSupply.totalSupply(), tokenSupplyCap);
        assertEq(lsp7CappedSupply.balanceOf(user1), tokenSupplyCap);
    }

    function test_MintingExceedingCapReverts() public {
        vm.expectRevert(LSP7CappedSupplyCannotMintOverCap.selector);
        lsp7CappedSupply.mint(user1, tokenSupplyCap + 1, true, "");
    }

    function test_BurningAllowsReminting() public {
        lsp7CappedSupply.mint(user1, tokenSupplyCap, true, "");

        vm.prank(user1);
        lsp7CappedSupply.burn(user1, 1, "");

        assertEq(lsp7CappedSupply.totalSupply(), tokenSupplyCap - 1);

        lsp7CappedSupply.mint(user2, 1, true, "");
        assertEq(lsp7CappedSupply.totalSupply(), tokenSupplyCap);
        assertEq(lsp7CappedSupply.balanceOf(user2), 1);
    }

    function testFuzz_MintAmountRespectsSupplyCap(
        uint256 cap,
        uint256 amountToMint
    ) public {
        cap = bound(cap, 1, type(uint128).max);
        amountToMint = bound(amountToMint, 1, type(uint128).max);

        MockLSP7CappedSupply token = new MockLSP7CappedSupply(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            cap
        );

        if (amountToMint > cap) {
            vm.expectRevert(LSP7CappedSupplyCannotMintOverCap.selector);
            token.mint(user1, amountToMint, true, "");

            assertEq(token.totalSupply(), 0);
            return;
        }

        token.mint(user1, amountToMint, true, "");

        assertEq(token.totalSupply(), amountToMint);
        assertEq(token.balanceOf(user1), amountToMint);
    }
}
