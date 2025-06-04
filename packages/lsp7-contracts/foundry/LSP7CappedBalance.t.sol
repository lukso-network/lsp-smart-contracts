// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import "forge-std/Test.sol";

import {
    LSP7CappedBalance
} from "../contracts/customizable/LSP7CappedBalance.sol";

contract MockLSP7CappedBalance is LSP7CappedBalance {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        uint256 maxAllowedBalance_
    )
        LSP7CappedBalance(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_,
            maxAllowedBalance_
        )
    {}

    function mint(uint256 amount, address _recipient) public {
        _mint(_recipient, amount, true, "");
    }
}

contract LSP7CappedBalanceTest is Test {
    MockLSP7CappedBalance lsp7CappedBalance;

    uint256 constant MAX_BALANCE_ALLOWED = 100;

    address recipient;

    function setUp() public {
        // 1. Deploy the contract that has CappedBalance
        lsp7CappedBalance = new MockLSP7CappedBalance(
            "Daniel Token to become rich",
            "NFA",
            address(this),
            0,
            false,
            MAX_BALANCE_ALLOWED
        );

        recipient = vm.addr(100);

        // 2. mint some tokens
        lsp7CappedBalance.mint(90, recipient);
    }

    function test_CannotHoldMoreThanMaxBalance() public {
        // 3. test that it does not go over
        assertEq(lsp7CappedBalance.balanceOf(recipient), 90);

        vm.expectRevert("Maximum allowed balance exeeded");
        lsp7CappedBalance.mint(100, recipient);
    }

    function testFuzz_CannotHoldMoreThanMaxBalance(uint256 amount) public {
        assertEq(lsp7CappedBalance.balanceOf(recipient), 90);

        vm.assume(amount > 10);
        vm.assume(
            amount <= type(uint256).max - lsp7CappedBalance.totalSupply()
        );

        vm.expectRevert("Maximum allowed balance exeeded");
        lsp7CappedBalance.mint(amount, recipient);
    }

    function test_CanHoldUpToTheMaxBalance() public {
        assertEq(lsp7CappedBalance.balanceOf(recipient), 90);

        lsp7CappedBalance.mint(10, recipient);

        assertEq(lsp7CappedBalance.balanceOf(recipient), 100);

        vm.expectRevert("Maximum allowed balance exeeded");
        lsp7CappedBalance.mint(10, recipient);
    }
}
