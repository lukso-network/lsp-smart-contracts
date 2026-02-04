// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.22;

// test
import "forge-std/Test.sol";

// modules
import {LSP7CappedBalanceAbstract} from "../contracts/extensions/LSP7CappedBalance/LSP7CappedBalanceAbstract.sol";
import {LSP7AllowlistAbstract} from "../contracts/extensions/LSP7Allowlist/LSP7AllowlistAbstract.sol";
import {LSP7DigitalAsset} from "../contracts/LSP7DigitalAsset.sol";

// errors
import {LSP7CappedBalanceExceeded} from "../contracts/extensions/LSP7CappedBalance/LSP7CappedBalanceErrors.sol";

// constants
import {_LSP4_TOKEN_TYPE_TOKEN} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

// Mock contract to test LSP7CappedBalanceAbstract functionality
contract MockLSP7CappedBalance is LSP7CappedBalanceAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        uint256 tokenBalanceCap_
    )
        LSP7DigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        )
        LSP7AllowlistAbstract(newOwner_)
        LSP7CappedBalanceAbstract(tokenBalanceCap_)
    {}

    // Helper function to mint tokens for testing
    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public {
        _mint(to, amount, force, data);
    }

    // Helper function to burn tokens for testing
    function burn(address from, uint256 amount, bytes memory data) public {
        if (msg.sender != from) {
            _spendAllowance(msg.sender, from, amount);
        }
        _burn(from, amount, data);
    }
}

contract LSP7CappedBalanceTest is Test {
    string name = "Capped Token";
    string symbol = "CT";
    uint256 tokenType = _LSP4_TOKEN_TYPE_TOKEN;
    bool isNonDivisible = false;
    uint256 tokenBalanceCap = 1000;

    address zeroAddress = address(0);
    address owner = address(this);
    address allowlistedUser = vm.addr(101);
    address allowlistedUserExtra = vm.addr(102);
    address nonAllowlistedUser = vm.addr(103);
    address recipient = vm.addr(104);

    MockLSP7CappedBalance lsp7CappedBalance;

    function setUp() public {
        lsp7CappedBalance = new MockLSP7CappedBalance(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            tokenBalanceCap
        );

        lsp7CappedBalance.addToAllowlist(allowlistedUser);
        lsp7CappedBalance.addToAllowlist(allowlistedUserExtra);
    }

    // Test constructor initialization
    function test_ConstructorSetsBalanceCap() public {
        assertEq(
            lsp7CappedBalance.tokenBalanceCap(),
            tokenBalanceCap,
            "Balance cap should be set correctly"
        );
        assertTrue(
            lsp7CappedBalance.isAllowlisted(owner),
            "Owner should be allowlisted"
        );
        assertTrue(
            lsp7CappedBalance.isAllowlisted(zeroAddress),
            "Zero address should be allowlisted"
        );
    }

    // Test tokenBalanceCap function
    function test_TokenBalanceCapReturnsCorrectValue() public {
        assertEq(
            lsp7CappedBalance.tokenBalanceCap(),
            tokenBalanceCap,
            "Should return the correct balance cap"
        );
    }

    // Test balance cap enforcement
    function test_TransferFailsWhenExceedingCapForNonAllowlisted() public {
        uint256 overCapAmount = tokenBalanceCap * 2;

        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7CappedBalanceExceeded.selector,
                recipient,
                overCapAmount,
                lsp7CappedBalance.balanceOf(recipient),
                tokenBalanceCap
            )
        );
        lsp7CappedBalance.mint(recipient, overCapAmount, true, "");
        assertEq(
            lsp7CappedBalance.balanceOf(recipient),
            0,
            "recipient should have no tokens"
        );
    }

    function test_TransferSucceedsWithinCapForNonAllowlisted() public {
        lsp7CappedBalance.mint(nonAllowlistedUser, 500, true, "");
        assertEq(
            lsp7CappedBalance.balanceOf(nonAllowlistedUser),
            500,
            "nonAllowlistedUser should have 500 tokens"
        );

        vm.prank(nonAllowlistedUser);
        lsp7CappedBalance.transfer(
            nonAllowlistedUser,
            recipient,
            400,
            true,
            ""
        );
        assertEq(
            lsp7CappedBalance.balanceOf(recipient),
            400,
            "recipient should have 400 tokens"
        );
    }

    // Test allowlist exemption
    function test_AllowlistedAddressCanExceedCap() public {
        uint256 amountToMint = 1100;
        lsp7CappedBalance.mint(allowlistedUser, amountToMint, true, "");
        assertEq(
            lsp7CappedBalance.balanceOf(allowlistedUser),
            amountToMint,
            "allowlistedUser should have 1100 tokens despite cap"
        );
    }

    // Test burning exemption
    function test_NonAllowlistedAddressCanBurnTokens() public {
        lsp7CappedBalance.mint(nonAllowlistedUser, 500, true, "");
        assertEq(
            lsp7CappedBalance.balanceOf(nonAllowlistedUser),
            500,
            "nonAllowlistedUser should have 500 tokens"
        );

        vm.prank(nonAllowlistedUser);
        lsp7CappedBalance.burn(nonAllowlistedUser, 200, "");
        assertEq(
            lsp7CappedBalance.balanceOf(nonAllowlistedUser),
            300,
            "nonAllowlistedUser should have 300 tokens after burning"
        );
    }

    // Test edge cases
    function test_ZeroAmountTransferSucceedsForNonAllowlisted() public {
        lsp7CappedBalance.mint(nonAllowlistedUser, 500, true, "");
        vm.prank(nonAllowlistedUser);
        lsp7CappedBalance.transfer(nonAllowlistedUser, recipient, 0, true, "");
        assertEq(
            lsp7CappedBalance.balanceOf(recipient),
            0,
            "recipient should have no tokens"
        );
    }

    function test_TransferToSelfWithinCap() public {
        lsp7CappedBalance.mint(nonAllowlistedUser, 500, true, "");
        vm.prank(nonAllowlistedUser);
        lsp7CappedBalance.transfer(
            nonAllowlistedUser,
            nonAllowlistedUser,
            200,
            true,
            ""
        );
        assertEq(
            lsp7CappedBalance.balanceOf(nonAllowlistedUser),
            500,
            "nonAllowlistedUser balance should remain 500"
        );
    }

    function test_TransferToSelfExceedingCapFailsForNonAllowlisted() public {
        lsp7CappedBalance.mint(nonAllowlistedUser, 900, true, "");

        uint256 amount = 200;

        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7CappedBalanceExceeded.selector,
                nonAllowlistedUser,
                amount,
                lsp7CappedBalance.balanceOf(nonAllowlistedUser),
                tokenBalanceCap
            )
        );
        vm.prank(nonAllowlistedUser);
        lsp7CappedBalance.transfer(
            nonAllowlistedUser,
            nonAllowlistedUser,
            amount,
            true,
            ""
        );
        assertEq(
            lsp7CappedBalance.balanceOf(nonAllowlistedUser),
            900,
            "nonAllowlistedUser balance should remain 900"
        );
    }

    function test_AllowlistedAddressCanReceiveTokensFromAllowlisted() public {
        lsp7CappedBalance.mint(allowlistedUser, 1200, true, "");

        vm.prank(allowlistedUser);
        lsp7CappedBalance.transfer(
            allowlistedUser,
            allowlistedUserExtra,
            1100,
            true,
            ""
        );
        assertEq(
            lsp7CappedBalance.balanceOf(allowlistedUserExtra),
            1100,
            "allowlistedUserExtra should have 1100 tokens"
        );
    }

    // ------ Fuzzing ------

    function testFuzz_CannotHoldMoreThanMaxBalance(uint256 amount) public {
        lsp7CappedBalance.mint(recipient, 900, true, "");
        assertEq(lsp7CappedBalance.balanceOf(recipient), 900);

        vm.assume(amount > 100);
        vm.assume(
            amount <= type(uint256).max - lsp7CappedBalance.totalSupply()
        );

        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7CappedBalanceExceeded.selector,
                recipient,
                amount,
                lsp7CappedBalance.balanceOf(recipient),
                tokenBalanceCap
            )
        );
        lsp7CappedBalance.mint(recipient, amount, true, "");
    }

    function testFuzz_TransferRespectsBalanceCap(uint256 amount) public {
        vm.assume(
            amount <= type(uint256).max - lsp7CappedBalance.totalSupply()
        );

        lsp7CappedBalance.mint(owner, amount, true, "");

        if (amount > tokenBalanceCap) {
            vm.expectRevert(
                abi.encodeWithSelector(
                    LSP7CappedBalanceExceeded.selector,
                    nonAllowlistedUser,
                    amount,
                    lsp7CappedBalance.balanceOf(nonAllowlistedUser),
                    tokenBalanceCap
                )
            );
            lsp7CappedBalance.transfer(
                owner,
                nonAllowlistedUser,
                amount,
                true,
                ""
            );
        } else {
            lsp7CappedBalance.transfer(
                owner,
                nonAllowlistedUser,
                amount,
                true,
                ""
            );
            assertEq(
                lsp7CappedBalance.balanceOf(nonAllowlistedUser),
                amount,
                "Recipient balance should increase"
            );
        }
    }

    function testFuzz_MintRespectsBalanceCap(uint256 amount) public {
        vm.assume(
            amount <= type(uint256).max - lsp7CappedBalance.totalSupply()
        );

        if (amount > tokenBalanceCap) {
            vm.expectRevert(
                abi.encodeWithSelector(
                    LSP7CappedBalanceExceeded.selector,
                    nonAllowlistedUser,
                    amount,
                    lsp7CappedBalance.balanceOf(nonAllowlistedUser),
                    tokenBalanceCap
                )
            );
            lsp7CappedBalance.mint(nonAllowlistedUser, amount, true, "");
        } else {
            lsp7CappedBalance.mint(nonAllowlistedUser, amount, true, "");
            assertEq(
                lsp7CappedBalance.balanceOf(nonAllowlistedUser),
                amount,
                "Recipient balance should increase"
            );
        }
    }

    function testFuzz_ConstructorBalanceCap(uint256 cap) public {
        vm.assume(cap <= type(uint256).max / 2); // Avoid overflow

        MockLSP7CappedBalance newToken = new MockLSP7CappedBalance(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            cap
        );
        assertEq(newToken.tokenBalanceCap(), cap, "Balance cap should be set");
    }
}
