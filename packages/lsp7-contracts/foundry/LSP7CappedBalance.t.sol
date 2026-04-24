// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.22;

// test
import {Test} from "forge-std/Test.sol";

// modules
import {
    LSP7CappedBalanceAbstract
} from "../contracts/extensions/LSP7CappedBalance/LSP7CappedBalanceAbstract.sol";
import {
    AccessControlExtendedAbstract
} from "../contracts/extensions/AccessControlExtended/AccessControlExtendedAbstract.sol";
import {LSP7DigitalAsset} from "../contracts/LSP7DigitalAsset.sol";

// errors
import {
    AccessControlUnauthorizedAccount
} from "../contracts/extensions/AccessControlExtended/AccessControlExtendedErrors.sol";
import {
    LSP7CappedBalanceExceeded
} from "../contracts/extensions/LSP7CappedBalance/LSP7CappedBalanceErrors.sol";

// constants
import {
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

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
        AccessControlExtendedAbstract()
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

    bytes32 uncappedBalanceRole;

    function setUp() public {
        lsp7CappedBalance = new MockLSP7CappedBalance(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            tokenBalanceCap
        );
        uncappedBalanceRole = lsp7CappedBalance.UNCAPPED_ROLE();

        lsp7CappedBalance.grantRole(uncappedBalanceRole, allowlistedUser);
        lsp7CappedBalance.grantRole(uncappedBalanceRole, allowlistedUserExtra);
    }

    // Test constructor initialization
    function test_ConstructorSetsBalanceCapAndBypassRoles() public {
        assertEq(
            lsp7CappedBalance.tokenBalanceCap(),
            tokenBalanceCap,
            "Balance cap should be set correctly"
        );

        // Default addresses set in constructor
        assertTrue(
            lsp7CappedBalance.hasRole(uncappedBalanceRole, owner),
            "Owner should have uncapped balance role"
        );

        // Extra addresses allowed to bypass balance cap after deployment
        assertTrue(
            lsp7CappedBalance.hasRole(uncappedBalanceRole, allowlistedUser),
            "Allowlisted user should have uncapped balance role"
        );
        assertTrue(
            lsp7CappedBalance.hasRole(
                uncappedBalanceRole,
                allowlistedUserExtra
            ),
            "Allowlisted user extra should have uncapped balance role"
        );
        assertFalse(
            lsp7CappedBalance.hasRole(uncappedBalanceRole, nonAllowlistedUser),
            "Non allowlisted user should not have uncapped balance role"
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

    // Test transfer ownership
    function test_TransferOwnershipClearsUncappedBalanceRoleAdmin() public {
        bytes32 uncappedBalanceAdminRole = keccak256("UNCAPPED_ADMIN_ROLE");
        address uncappedBalanceAdmin = makeAddr("A Uncapped Balance Admin");

        lsp7CappedBalance.setRoleAdmin(
            uncappedBalanceRole,
            uncappedBalanceAdminRole
        );
        assertEq(
            lsp7CappedBalance.getRoleAdmin(uncappedBalanceRole),
            uncappedBalanceAdminRole
        );

        lsp7CappedBalance.grantRole(
            uncappedBalanceAdminRole,
            uncappedBalanceAdmin
        );
        assertTrue(
            lsp7CappedBalance.hasRole(
                uncappedBalanceAdminRole,
                uncappedBalanceAdmin
            )
        );

        vm.prank(uncappedBalanceAdmin);
        lsp7CappedBalance.grantRole(uncappedBalanceRole, address(11111));
        assertTrue(
            lsp7CappedBalance.hasRole(uncappedBalanceRole, address(11111))
        );

        lsp7CappedBalance.transferOwnership(vm.addr(200));

        assertEq(
            lsp7CappedBalance.getRoleAdmin(uncappedBalanceRole),
            lsp7CappedBalance.DEFAULT_ADMIN_ROLE()
        );

        // Test previous admin cannot use its role
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                uncappedBalanceAdmin,
                lsp7CappedBalance.DEFAULT_ADMIN_ROLE()
            )
        );
        vm.prank(uncappedBalanceAdmin);
        lsp7CappedBalance.grantRole(uncappedBalanceRole, address(22222));

        // Addresses with previously granted role still persist
        assertTrue(
            lsp7CappedBalance.hasRole(uncappedBalanceRole, address(11111))
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

    function testFuzz_MintAmountRespectsBalanceCap(
        uint256 cap,
        uint256 currentBalance,
        uint256 mintAmount
    ) public {
        cap = bound(cap, 1, type(uint128).max);
        currentBalance = bound(currentBalance, 1, cap);
        mintAmount = bound(mintAmount, 1, type(uint128).max);

        MockLSP7CappedBalance token = new MockLSP7CappedBalance(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            cap
        );

        token.mint(recipient, currentBalance, true, "");

        uint256 newExpectedBalance = currentBalance + mintAmount;

        if (newExpectedBalance > cap) {
            // If the new balance is expected to be greater than the cap, test that it reverts
            vm.expectRevert(
                abi.encodeWithSelector(
                    LSP7CappedBalanceExceeded.selector,
                    recipient,
                    mintAmount,
                    currentBalance,
                    cap
                )
            );
            token.mint(recipient, mintAmount, true, "");

            assertEq(token.balanceOf(recipient), currentBalance);
        } else {
            // Otherwise test that mint succeeds and the balance increased
            token.mint(recipient, mintAmount, true, "");
            assertEq(token.balanceOf(recipient), currentBalance + mintAmount);
        }
    }

    function testFuzz_TransferAmountRespectsBalanceCap(
        uint256 cap,
        uint256 currentBalance,
        uint256 transferAmount
    ) public {
        uint256 boundedCap = bound(cap, 1, type(uint128).max);
        uint256 boundedCurrentBalance = bound(currentBalance, 0, boundedCap);
        uint256 boundedTransferAmount = bound(
            transferAmount,
            1,
            type(uint128).max
        );

        MockLSP7CappedBalance token = new MockLSP7CappedBalance(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            boundedCap
        );

        token.mint(
            owner,
            boundedCurrentBalance + boundedTransferAmount,
            true,
            ""
        );

        if (boundedCurrentBalance > 0) {
            token.transfer(owner, recipient, boundedCurrentBalance, true, "");
        }

        if (boundedCurrentBalance + boundedTransferAmount > boundedCap) {
            vm.expectRevert(
                abi.encodeWithSelector(
                    LSP7CappedBalanceExceeded.selector,
                    recipient,
                    boundedTransferAmount,
                    boundedCurrentBalance,
                    boundedCap
                )
            );
            token.transfer(owner, recipient, boundedTransferAmount, true, "");

            assertEq(token.balanceOf(recipient), boundedCurrentBalance);
            return;
        }

        token.transfer(owner, recipient, boundedTransferAmount, true, "");
        assertEq(
            token.balanceOf(recipient),
            boundedCurrentBalance + boundedTransferAmount
        );
    }

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
