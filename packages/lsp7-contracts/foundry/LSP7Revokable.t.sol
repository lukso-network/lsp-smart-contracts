// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.22;

// foundry
import "forge-std/Test.sol";

// modules
import {LSP7RevokableAbstract} from "../contracts/extensions/LSP7Revokable/LSP7RevokableAbstract.sol";
import {LSP7DigitalAsset} from "../contracts/LSP7DigitalAsset.sol";

// interfaces
import {ILSP7Revokable} from "../contracts/extensions/LSP7Revokable/ILSP7Revokable.sol";

// errors
import {
    LSP7NotAuthorizedRevoker,
    LSP7InvalidRevokerIndexRange
} from "../contracts/extensions/LSP7Revokable/LSP7RevokableErrors.sol";
import {LSP7AmountExceedsBalance} from "../contracts/LSP7Errors.sol";

// constants
import {_LSP4_TOKEN_TYPE_TOKEN} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

/// @dev Mock contract to test LSP7RevokableAbstract functionality
contract MockLSP7Revokable is LSP7RevokableAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_
    )
        LSP7DigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        )
    {}

    /// @dev Helper function to mint tokens for testing
    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public {
        _mint(to, amount, force, data);
    }
}

contract LSP7RevokableTest is Test {
    string name = "Revokable Token";
    string symbol = "RT";
    uint256 tokenType = _LSP4_TOKEN_TYPE_TOKEN;
    bool isNonDivisible = false;

    address owner = address(this);
    address nonOwner = vm.addr(100);
    address user1 = vm.addr(101);
    address user2 = vm.addr(102);
    address revoker1 = vm.addr(103);
    address revoker2 = vm.addr(104);
    address zeroAddress = address(0);

    MockLSP7Revokable lsp7Revokable;

    function setUp() public {
        lsp7Revokable = new MockLSP7Revokable(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible
        );

        // Label addresses for better trace output
        vm.label(address(lsp7Revokable), "LSP7Revokable");
        vm.label(owner, "owner");
        vm.label(nonOwner, "nonOwner");
        vm.label(user1, "user1");
        vm.label(user2, "user2");
        vm.label(revoker1, "revoker1");
        vm.label(revoker2, "revoker2");
    }

    // =========================================================================
    // Constructor / Initialization Tests
    // =========================================================================

    function test_ConstructorInitializesCorrectly() public {
        // Owner should be implicitly a revoker
        assertTrue(
            lsp7Revokable.isRevoker(owner),
            "Owner should be a revoker"
        );
        // No delegated revokers initially
        assertEq(
            lsp7Revokable.getRevokersCount(),
            0,
            "No delegated revokers initially"
        );
        // Non-owner should not be a revoker
        assertFalse(
            lsp7Revokable.isRevoker(nonOwner),
            "Non-owner should not be a revoker"
        );
    }

    // =========================================================================
    // Revoker Management Tests
    // =========================================================================

    function test_AddRevokerAsOwner() public {
        vm.expectEmit(true, false, false, true, address(lsp7Revokable));
        emit ILSP7Revokable.RevokerAdded(revoker1);

        lsp7Revokable.addRevoker(revoker1);

        assertTrue(
            lsp7Revokable.isRevoker(revoker1),
            "Revoker1 should be a revoker"
        );
        assertEq(
            lsp7Revokable.getRevokersCount(),
            1,
            "Should have 1 delegated revoker"
        );
    }

    function test_AddRevokerAlreadyAdded() public {
        lsp7Revokable.addRevoker(revoker1);
        assertTrue(
            lsp7Revokable.isRevoker(revoker1),
            "Revoker1 should be a revoker"
        );

        // Adding again should not emit event
        vm.recordLogs();
        lsp7Revokable.addRevoker(revoker1);
        Vm.Log[] memory entries = vm.getRecordedLogs();
        assertEq(entries.length, 0, "No event should be emitted for duplicate add");

        assertTrue(
            lsp7Revokable.isRevoker(revoker1),
            "Revoker1 should still be a revoker"
        );
        assertEq(
            lsp7Revokable.getRevokersCount(),
            1,
            "Should still have 1 delegated revoker"
        );
    }

    function test_NonOwnerCannotAddRevoker() public {
        vm.prank(nonOwner);
        vm.expectRevert("Ownable: caller is not the owner");
        lsp7Revokable.addRevoker(revoker1);

        assertFalse(
            lsp7Revokable.isRevoker(revoker1),
            "Revoker1 should not be a revoker"
        );
    }

    function test_RemoveRevokerAsOwner() public {
        lsp7Revokable.addRevoker(revoker1);
        assertTrue(
            lsp7Revokable.isRevoker(revoker1),
            "Revoker1 should be a revoker initially"
        );

        vm.expectEmit(true, false, false, true, address(lsp7Revokable));
        emit ILSP7Revokable.RevokerRemoved(revoker1);

        lsp7Revokable.removeRevoker(revoker1);

        assertFalse(
            lsp7Revokable.isRevoker(revoker1),
            "Revoker1 should not be a revoker"
        );
        assertEq(
            lsp7Revokable.getRevokersCount(),
            0,
            "Should have 0 delegated revokers"
        );
    }

    function test_RemoveRevokerNotAdded() public {
        assertFalse(
            lsp7Revokable.isRevoker(revoker1),
            "Revoker1 should not be a revoker initially"
        );

        // Removing a non-revoker should not emit event
        vm.recordLogs();
        lsp7Revokable.removeRevoker(revoker1);
        Vm.Log[] memory entries = vm.getRecordedLogs();
        assertEq(entries.length, 0, "No event should be emitted");

        assertFalse(
            lsp7Revokable.isRevoker(revoker1),
            "Revoker1 should still not be a revoker"
        );
    }

    function test_NonOwnerCannotRemoveRevoker() public {
        lsp7Revokable.addRevoker(revoker1);

        vm.prank(nonOwner);
        vm.expectRevert("Ownable: caller is not the owner");
        lsp7Revokable.removeRevoker(revoker1);

        assertTrue(
            lsp7Revokable.isRevoker(revoker1),
            "Revoker1 should still be a revoker"
        );
    }

    function test_MultipleRevokers() public {
        lsp7Revokable.addRevoker(revoker1);
        lsp7Revokable.addRevoker(revoker2);

        assertTrue(lsp7Revokable.isRevoker(revoker1), "Revoker1 should be a revoker");
        assertTrue(lsp7Revokable.isRevoker(revoker2), "Revoker2 should be a revoker");
        assertEq(lsp7Revokable.getRevokersCount(), 2, "Should have 2 delegated revokers");

        // Remove one
        lsp7Revokable.removeRevoker(revoker1);
        assertFalse(lsp7Revokable.isRevoker(revoker1), "Revoker1 should not be a revoker");
        assertTrue(lsp7Revokable.isRevoker(revoker2), "Revoker2 should still be a revoker");
        assertEq(lsp7Revokable.getRevokersCount(), 1, "Should have 1 delegated revoker");
    }

    // =========================================================================
    // getRevokersByIndex Tests
    // =========================================================================

    function test_GetRevokersByIndex() public {
        lsp7Revokable.addRevoker(revoker1);
        lsp7Revokable.addRevoker(revoker2);

        address[] memory revokers = lsp7Revokable.getRevokersByIndex(0, 2);
        assertEq(revokers.length, 2, "Should return 2 revokers");
        assertEq(revokers[0], revoker1, "First revoker should be revoker1");
        assertEq(revokers[1], revoker2, "Second revoker should be revoker2");
    }

    function test_GetRevokersByIndexPartialRange() public {
        lsp7Revokable.addRevoker(revoker1);
        lsp7Revokable.addRevoker(revoker2);

        address[] memory revokers = lsp7Revokable.getRevokersByIndex(0, 1);
        assertEq(revokers.length, 1, "Should return 1 revoker");
        assertEq(revokers[0], revoker1, "Should return revoker1");
    }

    function test_GetRevokersByIndexInvalidRange() public {
        lsp7Revokable.addRevoker(revoker1);

        // startIndex >= endIndex
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7InvalidRevokerIndexRange.selector,
                1,
                1,
                1
            )
        );
        lsp7Revokable.getRevokersByIndex(1, 1);

        // endIndex > count
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7InvalidRevokerIndexRange.selector,
                0,
                5,
                1
            )
        );
        lsp7Revokable.getRevokersByIndex(0, 5);
    }

    // =========================================================================
    // isRevoker Tests
    // =========================================================================

    function test_IsRevokerForOwner() public {
        assertTrue(
            lsp7Revokable.isRevoker(owner),
            "Owner should always be a revoker"
        );
    }

    function test_IsRevokerForDelegatedRevoker() public {
        assertFalse(
            lsp7Revokable.isRevoker(revoker1),
            "Revoker1 should not be a revoker initially"
        );

        lsp7Revokable.addRevoker(revoker1);

        assertTrue(
            lsp7Revokable.isRevoker(revoker1),
            "Revoker1 should be a revoker after addition"
        );
    }

    function test_IsRevokerForNonRevoker() public {
        assertFalse(
            lsp7Revokable.isRevoker(nonOwner),
            "Non-owner should not be a revoker"
        );
        assertFalse(
            lsp7Revokable.isRevoker(user1),
            "User1 should not be a revoker"
        );
    }

    // =========================================================================
    // Revoke Tests
    // =========================================================================

    function test_RevokeAsOwner() public {
        // Mint tokens to user1
        lsp7Revokable.mint(user1, 1000, true, "");
        assertEq(lsp7Revokable.balanceOf(user1), 1000, "User1 should have 1000 tokens");
        assertEq(lsp7Revokable.balanceOf(owner), 0, "Owner should have 0 tokens");

        // Revoke tokens
        lsp7Revokable.revoke(user1, 500, "");

        assertEq(lsp7Revokable.balanceOf(user1), 500, "User1 should have 500 tokens");
        assertEq(lsp7Revokable.balanceOf(owner), 500, "Owner should have 500 tokens");
    }

    function test_RevokeAsDelegatedRevoker() public {
        lsp7Revokable.addRevoker(revoker1);
        lsp7Revokable.mint(user1, 1000, true, "");

        vm.prank(revoker1);
        lsp7Revokable.revoke(user1, 300, "");

        assertEq(lsp7Revokable.balanceOf(user1), 700, "User1 should have 700 tokens");
        assertEq(lsp7Revokable.balanceOf(owner), 300, "Owner should have 300 tokens");
    }

    function test_RevokeAllTokens() public {
        lsp7Revokable.mint(user1, 1000, true, "");

        lsp7Revokable.revoke(user1, 1000, "");

        assertEq(lsp7Revokable.balanceOf(user1), 0, "User1 should have 0 tokens");
        assertEq(lsp7Revokable.balanceOf(owner), 1000, "Owner should have 1000 tokens");
    }

    function test_RevokeZeroAmount() public {
        lsp7Revokable.mint(user1, 1000, true, "");

        // Zero amount should succeed (no-op)
        lsp7Revokable.revoke(user1, 0, "");

        assertEq(lsp7Revokable.balanceOf(user1), 1000, "User1 should still have 1000 tokens");
        assertEq(lsp7Revokable.balanceOf(owner), 0, "Owner should still have 0 tokens");
    }

    function test_RevokeFailsForNonRevoker() public {
        lsp7Revokable.mint(user1, 1000, true, "");

        vm.prank(nonOwner);
        vm.expectRevert(
            abi.encodeWithSelector(LSP7NotAuthorizedRevoker.selector, nonOwner)
        );
        lsp7Revokable.revoke(user1, 500, "");

        assertEq(lsp7Revokable.balanceOf(user1), 1000, "User1 should still have 1000 tokens");
    }

    function test_RevokeFailsForUserWithoutTokens() public {
        // User1 has no tokens
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7AmountExceedsBalance.selector,
                0,
                user1,
                500
            )
        );
        lsp7Revokable.revoke(user1, 500, "");
    }

    function test_RevokeFailsWhenAmountExceedsBalance() public {
        lsp7Revokable.mint(user1, 100, true, "");

        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7AmountExceedsBalance.selector,
                100,
                user1,
                500
            )
        );
        lsp7Revokable.revoke(user1, 500, "");
    }

    function test_RevokeSelfTokensAsOwner() public {
        // Owner has tokens and revokes from themselves (edge case)
        lsp7Revokable.mint(owner, 1000, true, "");

        lsp7Revokable.revoke(owner, 500, "");

        // Tokens go back to owner, so balance should remain the same
        assertEq(lsp7Revokable.balanceOf(owner), 1000, "Owner balance should remain 1000");
    }

    // =========================================================================
    // RevokeAndBurn Tests
    // =========================================================================

    function test_RevokeAndBurnAsOwner() public {
        lsp7Revokable.mint(user1, 1000, true, "");
        uint256 initialSupply = lsp7Revokable.totalSupply();

        lsp7Revokable.revokeAndBurn(user1, 500, "");

        assertEq(lsp7Revokable.balanceOf(user1), 500, "User1 should have 500 tokens");
        assertEq(lsp7Revokable.totalSupply(), initialSupply - 500, "Total supply should decrease");
    }

    function test_RevokeAndBurnAsDelegatedRevoker() public {
        lsp7Revokable.addRevoker(revoker1);
        lsp7Revokable.mint(user1, 1000, true, "");
        uint256 initialSupply = lsp7Revokable.totalSupply();

        vm.prank(revoker1);
        lsp7Revokable.revokeAndBurn(user1, 400, "");

        assertEq(lsp7Revokable.balanceOf(user1), 600, "User1 should have 600 tokens");
        assertEq(lsp7Revokable.totalSupply(), initialSupply - 400, "Total supply should decrease");
    }

    function test_RevokeAndBurnAllTokens() public {
        lsp7Revokable.mint(user1, 1000, true, "");

        lsp7Revokable.revokeAndBurn(user1, 1000, "");

        assertEq(lsp7Revokable.balanceOf(user1), 0, "User1 should have 0 tokens");
    }

    function test_RevokeAndBurnZeroAmount() public {
        lsp7Revokable.mint(user1, 1000, true, "");
        uint256 initialSupply = lsp7Revokable.totalSupply();

        lsp7Revokable.revokeAndBurn(user1, 0, "");

        assertEq(lsp7Revokable.balanceOf(user1), 1000, "User1 should still have 1000 tokens");
        assertEq(lsp7Revokable.totalSupply(), initialSupply, "Total supply should remain");
    }

    function test_RevokeAndBurnFailsForNonRevoker() public {
        lsp7Revokable.mint(user1, 1000, true, "");

        vm.prank(nonOwner);
        vm.expectRevert(
            abi.encodeWithSelector(LSP7NotAuthorizedRevoker.selector, nonOwner)
        );
        lsp7Revokable.revokeAndBurn(user1, 500, "");

        assertEq(lsp7Revokable.balanceOf(user1), 1000, "User1 should still have 1000 tokens");
    }

    function test_RevokeAndBurnFailsWhenAmountExceedsBalance() public {
        lsp7Revokable.mint(user1, 100, true, "");

        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7AmountExceedsBalance.selector,
                100,
                user1,
                500
            )
        );
        lsp7Revokable.revokeAndBurn(user1, 500, "");
    }

    // =========================================================================
    // Ownership Transfer Tests
    // =========================================================================

    function test_NewOwnerBecomesRevoker() public {
        address newOwner = vm.addr(200);

        // Initially, newOwner is not a revoker
        assertFalse(
            lsp7Revokable.isRevoker(newOwner),
            "New owner should not be a revoker initially"
        );

        // Transfer ownership
        lsp7Revokable.transferOwnership(newOwner);

        // Old owner should no longer be a revoker (unless explicitly added)
        assertFalse(
            lsp7Revokable.isRevoker(owner),
            "Old owner should not be a revoker after transfer"
        );

        // New owner should be a revoker
        assertTrue(
            lsp7Revokable.isRevoker(newOwner),
            "New owner should be a revoker"
        );
    }

    function test_RevokeGoesToCurrentOwner() public {
        address newOwner = vm.addr(200);
        lsp7Revokable.addRevoker(revoker1);
        lsp7Revokable.mint(user1, 1000, true, "");

        // Transfer ownership
        lsp7Revokable.transferOwnership(newOwner);

        // Revoker1 revokes - tokens should go to NEW owner
        vm.prank(revoker1);
        lsp7Revokable.revoke(user1, 500, "");

        assertEq(lsp7Revokable.balanceOf(user1), 500, "User1 should have 500 tokens");
        assertEq(lsp7Revokable.balanceOf(newOwner), 500, "New owner should have 500 tokens");
        assertEq(lsp7Revokable.balanceOf(owner), 0, "Old owner should have 0 tokens");
    }

    // =========================================================================
    // Fuzzing Tests
    // =========================================================================

    function testFuzz_RevokerManagement(address addr, bool add) public {
        vm.assume(addr != address(0));
        vm.assume(addr != owner);

        if (add) {
            vm.expectEmit(true, false, false, true, address(lsp7Revokable));
            emit ILSP7Revokable.RevokerAdded(addr);
            lsp7Revokable.addRevoker(addr);
            assertTrue(
                lsp7Revokable.isRevoker(addr),
                "Address should be a revoker"
            );
        } else {
            // First add, then remove
            lsp7Revokable.addRevoker(addr);
            vm.expectEmit(true, false, false, true, address(lsp7Revokable));
            emit ILSP7Revokable.RevokerRemoved(addr);
            lsp7Revokable.removeRevoker(addr);
            assertFalse(
                lsp7Revokable.isRevoker(addr),
                "Address should not be a revoker"
            );
        }

        // Non-owner should revert
        vm.prank(addr);
        vm.expectRevert("Ownable: caller is not the owner");
        if (add) {
            lsp7Revokable.addRevoker(addr);
        } else {
            lsp7Revokable.removeRevoker(addr);
        }
    }

    function testFuzz_RevokeAmount(
        address from,
        uint256 mintAmount,
        uint256 revokeAmount
    ) public {
        vm.assume(from != address(0));
        vm.assume(from != owner);
        vm.assume(uint160(from) > 10); // Exclude precompile addresses (0x1-0x9)
        vm.assume(mintAmount > 0);
        vm.assume(mintAmount <= type(uint128).max); // Reasonable upper bound
        vm.assume(revokeAmount <= mintAmount);

        lsp7Revokable.mint(from, mintAmount, true, "");

        lsp7Revokable.revoke(from, revokeAmount, "");

        assertEq(
            lsp7Revokable.balanceOf(from),
            mintAmount - revokeAmount,
            "From balance should decrease"
        );
        assertEq(
            lsp7Revokable.balanceOf(owner),
            revokeAmount,
            "Owner balance should increase"
        );
    }

    function testFuzz_RevokeAndBurnAmount(
        address from,
        uint256 mintAmount,
        uint256 burnAmount
    ) public {
        vm.assume(from != address(0));
        vm.assume(uint160(from) > 10); // Exclude precompile addresses (0x1-0x9)
        vm.assume(mintAmount > 0);
        vm.assume(mintAmount <= type(uint128).max);
        vm.assume(burnAmount <= mintAmount);

        lsp7Revokable.mint(from, mintAmount, true, "");
        uint256 initialSupply = lsp7Revokable.totalSupply();

        lsp7Revokable.revokeAndBurn(from, burnAmount, "");

        assertEq(
            lsp7Revokable.balanceOf(from),
            mintAmount - burnAmount,
            "From balance should decrease"
        );
        assertEq(
            lsp7Revokable.totalSupply(),
            initialSupply - burnAmount,
            "Total supply should decrease"
        );
    }

    function testFuzz_NonRevokerCannotRevoke(address caller) public {
        vm.assume(caller != owner);
        vm.assume(caller != address(0));

        lsp7Revokable.mint(user1, 1000, true, "");

        vm.prank(caller);
        vm.expectRevert(
            abi.encodeWithSelector(LSP7NotAuthorizedRevoker.selector, caller)
        );
        lsp7Revokable.revoke(user1, 500, "");
    }

    function testFuzz_DelegatedRevokerCanRevoke(address delegatedRevoker) public {
        vm.assume(delegatedRevoker != owner);
        vm.assume(delegatedRevoker != address(0));

        lsp7Revokable.addRevoker(delegatedRevoker);
        lsp7Revokable.mint(user1, 1000, true, "");

        vm.prank(delegatedRevoker);
        lsp7Revokable.revoke(user1, 500, "");

        assertEq(lsp7Revokable.balanceOf(user1), 500, "User1 should have 500 tokens");
        assertEq(lsp7Revokable.balanceOf(owner), 500, "Owner should have 500 tokens");
    }
}
