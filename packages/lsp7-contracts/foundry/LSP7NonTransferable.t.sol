// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// foundry
import "forge-std/Test.sol";

// modules
import {LSP7DigitalAsset} from "../contracts/LSP7DigitalAsset.sol";
import {LSP7Allowlist} from "../contracts/customizable/LSP7Allowlist.sol";
import {
    LSP7NonTransferable
} from "../contracts/customizable/LSP7NonTransferable.sol";

// interfaces
import {
    ILSP7NonTransferable
} from "../contracts/customizable/ILSP7NonTransferable.sol";

// errors
import {
    LSP7TransferDisabled,
    LSP7CannotUpdateTransferLockPeriod,
    LSP7CannotUpdateTransferLockEnd,
    LSP7InvalidTransferLockPeriod
} from "../contracts/customizable/LSP7NonTransferableErrors.sol";

// constants
import {
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

contract MockLSP7NonTransferable is LSP7NonTransferable {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        bool transferable_,
        uint256 transferLockStart_,
        uint256 transferLockEnd_
    )
        LSP7DigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        )
        LSP7NonTransferable(transferable_, transferLockStart_, transferLockEnd_)
        LSP7Allowlist(newOwner_)
    {}

    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public virtual {
        _mint(to, amount, force, data);
    }

    function burn(
        address from,
        uint256 amount,
        bytes memory data
    ) public virtual {
        if (msg.sender != from) {
            _spendAllowance(msg.sender, from, amount);
        }

        _burn(from, amount, data);
    }
}

contract LSP7NonTransferableTest is Test {
    string name = "Test Token";
    string symbol = "TT";
    uint256 tokenType = _LSP4_TOKEN_TYPE_TOKEN;
    bool isNonDivisible = false;

    bool transferable = false;
    uint256 transferLockStart = block.timestamp + 3600;
    uint256 transferLockEnd = transferLockStart + 3600;

    address zeroAddress = address(0);
    address owner = address(this);
    address randomCaller = vm.addr(100);
    address allowlistedUser = vm.addr(101);
    address nonAllowlistedUser = vm.addr(102);
    address recipient = vm.addr(103);

    MockLSP7NonTransferable lsp7NonTransferable;

    function setUp() public {
        lsp7NonTransferable = new MockLSP7NonTransferable(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            transferable,
            transferLockStart,
            transferLockEnd
        );

        lsp7NonTransferable.mint(owner, 100, true, "");
        lsp7NonTransferable.mint(randomCaller, 100, true, "");
        lsp7NonTransferable.mint(allowlistedUser, 100, true, "");

        lsp7NonTransferable.addToAllowlist(allowlistedUser);
    }

    // Constructor and Initial State
    function test_ConstructorSetsInitialStateAndEmitsEvents() public {
        bool token1_Transferable = true;
        uint256 token1_TransferLockStart = 1111;
        uint256 token1_TransferLockEnd = 2222;

        vm.expectEmit(true, false, false, false);
        emit ILSP7NonTransferable.TransferabilityChanged(token1_Transferable);
        vm.expectEmit(true, true, false, false);
        emit ILSP7NonTransferable.TransferLockPeriodChanged(
            token1_TransferLockStart,
            token1_TransferLockEnd
        );

        MockLSP7NonTransferable token1 = new MockLSP7NonTransferable(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            token1_Transferable,
            token1_TransferLockStart,
            token1_TransferLockEnd
        );

        assertTrue(token1.isTransferable());

        // -------------------------------

        bool token2_Transferable = false;
        uint256 token2_TransferLockStart = 3333;
        uint256 token2_TransferLockEnd = 4444;

        vm.expectEmit(true, false, false, false);
        emit ILSP7NonTransferable.TransferabilityChanged(token2_Transferable);
        vm.expectEmit(true, true, false, false);
        emit ILSP7NonTransferable.TransferLockPeriodChanged(
            token2_TransferLockStart,
            token2_TransferLockEnd
        );

        MockLSP7NonTransferable token2 = new MockLSP7NonTransferable(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            token2_Transferable,
            token2_TransferLockStart,
            token2_TransferLockEnd
        );

        assertFalse(token2.isTransferable());
    }

    function test_ConstructorRevertsWithInvalidLockPeriod() public {
        vm.expectRevert(LSP7InvalidTransferLockPeriod.selector);
        new MockLSP7NonTransferable(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            false,
            100,
            50 // end < start
        );
    }

    // Transferability
    function test_OwnerCanTransfer() public {
        assertEq(lsp7NonTransferable.balanceOf(recipient), 0);
        lsp7NonTransferable.transfer(owner, recipient, 10, true, "");
        assertEq(lsp7NonTransferable.balanceOf(recipient), 10);
    }

    function test_RandomCallerCannotTransfer() public {
        assertEq(lsp7NonTransferable.balanceOf(recipient), 0);
        vm.prank(randomCaller);
        vm.expectRevert(LSP7TransferDisabled.selector);
        lsp7NonTransferable.transfer(randomCaller, recipient, 10, true, "");
        assertEq(lsp7NonTransferable.balanceOf(recipient), 0);
    }

    function test_RandomCallerShouldBeAllowedToBurn() public {
        assertEq(lsp7NonTransferable.balanceOf(randomCaller), 100);
        vm.prank(randomCaller);
        lsp7NonTransferable.burn(randomCaller, 10, "");
        assertEq(lsp7NonTransferable.balanceOf(randomCaller), 90);
    }

    // Transfer Lock Period
    function test_TransferFailsDuringLockPeriod() public {
        lsp7NonTransferable.makeTransferable(); // change tarnsferable flag to true

        vm.warp(transferLockStart + 50); // Inside lock period
        assertFalse(lsp7NonTransferable.isTransferable());
        vm.prank(randomCaller);
        vm.expectRevert(LSP7TransferDisabled.selector);
        lsp7NonTransferable.transfer(randomCaller, recipient, 10, true, "");
        assertEq(lsp7NonTransferable.balanceOf(recipient), 0);
    }

    function test_TransferSucceedsBeforeLockPeriod() public {
        lsp7NonTransferable.makeTransferable(); // change tarnsferable flag to true

        vm.warp(transferLockStart - 50); // Before lock period
        assertTrue(lsp7NonTransferable.isTransferable());
        vm.prank(randomCaller);
        lsp7NonTransferable.transfer(randomCaller, recipient, 10, true, "");
        assertEq(lsp7NonTransferable.balanceOf(recipient), 10);
    }

    function test_TransferSucceedsAfterLockPeriod() public {
        lsp7NonTransferable.makeTransferable(); // change tarnsferable flag to true

        vm.warp(transferLockEnd + 50); // After lock period
        assertTrue(lsp7NonTransferable.isTransferable());
        vm.prank(randomCaller);
        lsp7NonTransferable.transfer(randomCaller, recipient, 10, true, "");
        assertEq(lsp7NonTransferable.balanceOf(recipient), 10);
    }

    // Allowlist Behavior
    function test_AllowlistedAddressCanTransferDuringLockPeriod() public {
        vm.warp(transferLockStart + 50); // Inside lock period
        assertFalse(lsp7NonTransferable.isTransferable());
        vm.prank(allowlistedUser);
        lsp7NonTransferable.transfer(allowlistedUser, recipient, 10, true, "");
        assertEq(lsp7NonTransferable.balanceOf(recipient), 10);
    }

    function test_NonAllowlistedAddressCannotTransferDuringLockPeriod() public {
        vm.warp(transferLockStart + 50); // Inside lock period
        assertFalse(lsp7NonTransferable.isTransferable());
        vm.prank(nonAllowlistedUser);
        vm.expectRevert(LSP7TransferDisabled.selector);
        lsp7NonTransferable.transfer(
            nonAllowlistedUser,
            recipient,
            10,
            true,
            ""
        );
        assertEq(lsp7NonTransferable.balanceOf(recipient), 0);
    }

    // Transferability Flag
    function test_MakeTransferableEnablesTransfersBeforeLockPeriod() public {
        vm.warp(transferLockStart - 50); // Before lock period

        assertFalse(lsp7NonTransferable.isTransferable());
        vm.expectEmit(true, false, false, false);
        emit ILSP7NonTransferable.TransferabilityChanged(true);
        lsp7NonTransferable.makeTransferable();
        assertTrue(lsp7NonTransferable.isTransferable());

        vm.prank(randomCaller);
        lsp7NonTransferable.transfer(randomCaller, recipient, 10, true, "");
        assertEq(lsp7NonTransferable.balanceOf(recipient), 10);
    }

    function test_MakeTransferableEnablesTransfersAfterLockPeriod() public {
        vm.warp(transferLockEnd + 50); // Before lock period

        assertFalse(lsp7NonTransferable.isTransferable());
        vm.expectEmit(true, false, false, false);
        emit ILSP7NonTransferable.TransferabilityChanged(true);
        lsp7NonTransferable.makeTransferable();
        assertTrue(lsp7NonTransferable.isTransferable());

        vm.prank(randomCaller);
        lsp7NonTransferable.transfer(randomCaller, recipient, 10, true, "");
        assertEq(lsp7NonTransferable.balanceOf(recipient), 10);
    }

    function test_MakeTransferableDoesNotEnableTransfersInLockPeriod() public {
        vm.warp(transferLockStart + 50); // Before lock period

        assertFalse(lsp7NonTransferable.isTransferable());
        vm.expectEmit(true, false, false, false);
        emit ILSP7NonTransferable.TransferabilityChanged(true);
        lsp7NonTransferable.makeTransferable();
        assertFalse(lsp7NonTransferable.isTransferable());

        vm.expectRevert(LSP7TransferDisabled.selector);
        vm.prank(randomCaller);
        lsp7NonTransferable.transfer(randomCaller, recipient, 10, true, "");
        assertEq(lsp7NonTransferable.balanceOf(recipient), 0);
    }

    function test_NonOwnerCannotCallMakeTransferable() public {
        vm.prank(randomCaller);
        vm.expectRevert("Ownable: caller is not the owner"); // Expect revert due to onlyOwner modifier
        lsp7NonTransferable.makeTransferable();
    }

    // Lock Period Updates
    function test_UpdateTransferLockPeriodSucceedsBeforeStart() public {
        uint256 newTransferLockStart = transferLockStart + 150;
        uint256 newTransferLockEnd = transferLockEnd + 250;

        vm.expectEmit(true, true, false, false);
        emit ILSP7NonTransferable.TransferLockPeriodChanged(
            newTransferLockStart,
            newTransferLockEnd
        );
        lsp7NonTransferable.updateTransferLockPeriod(
            newTransferLockStart,
            newTransferLockEnd
        );
        assertEq(lsp7NonTransferable.transferLockStart(), newTransferLockStart);
        assertEq(lsp7NonTransferable.transferLockEnd(), newTransferLockEnd);
    }

    function test_UpdateTransferLockPeriodRevertsAfterStart() public {
        uint256 newTransferLockStart = transferLockStart + 150;
        uint256 newTransferLockEnd = transferLockEnd + 250;

        vm.warp(transferLockStart + 50);
        vm.expectRevert(LSP7CannotUpdateTransferLockPeriod.selector);
        lsp7NonTransferable.updateTransferLockPeriod(
            newTransferLockStart,
            newTransferLockEnd
        );
    }

    function test_UpdateTransferLockPeriodRevertsAfterEnd() public {
        uint256 newTransferLockStart = transferLockStart + 150;
        uint256 newTransferLockEnd = transferLockEnd + 250;

        vm.warp(transferLockEnd + 50);
        vm.expectRevert(LSP7CannotUpdateTransferLockPeriod.selector);
        lsp7NonTransferable.updateTransferLockPeriod(
            newTransferLockStart,
            newTransferLockEnd
        );
    }

    function test_UpdateTransferLockPeriodRevertsInvalidPeriod() public {
        uint256 newTransferLockStart = transferLockStart + 150;
        uint256 newTransferLockEnd = newTransferLockStart - 50;

        vm.expectRevert(LSP7InvalidTransferLockPeriod.selector);
        lsp7NonTransferable.updateTransferLockPeriod(
            newTransferLockStart,
            newTransferLockEnd
        );
    }

    function test_UpdateTransferLockEndSucceedsBeforeEnd() public {
        uint256 newTransferLockEnd = transferLockEnd + 250;

        vm.expectEmit(true, true, false, false);
        emit ILSP7NonTransferable.TransferLockPeriodChanged(
            transferLockStart,
            transferLockEnd
        );
        lsp7NonTransferable.updateTransferLockEnd(transferLockEnd);
        assertEq(lsp7NonTransferable.transferLockEnd(), transferLockEnd);
    }

    function test_UpdateTransferLockEndRevertsAfterEnd() public {
        uint256 newTransferLockEnd = transferLockEnd + 250;

        vm.warp(transferLockEnd + 50);
        vm.expectRevert(LSP7CannotUpdateTransferLockEnd.selector);
        lsp7NonTransferable.updateTransferLockEnd(newTransferLockEnd);
    }

    function test_UpdateTransferLockEndRevertsInvalidPeriod() public {
        uint256 newTransferLockEnd = transferLockStart - 50;

        vm.expectRevert(LSP7InvalidTransferLockPeriod.selector);
        lsp7NonTransferable.updateTransferLockEnd(newTransferLockEnd);
    }

    // Edge Cases
    function test_ZeroAmountTransferSucceedsWhenTransferable() public {
        lsp7NonTransferable.transfer(owner, recipient, 0, true, "");
        assertEq(lsp7NonTransferable.balanceOf(recipient), 0);
    }

    function test_TransferToSelfSucceedsWhenTransferable() public {
        uint256 initialBalance = lsp7NonTransferable.balanceOf(owner);
        lsp7NonTransferable.transfer(owner, owner, 10, true, "");
        assertEq(lsp7NonTransferable.balanceOf(owner), initialBalance);
    }

    function test_BurnZeroAmount() public {
        uint256 initialBalance = lsp7NonTransferable.balanceOf(owner);
        lsp7NonTransferable.burn(owner, 0, "");
        assertEq(lsp7NonTransferable.balanceOf(owner), initialBalance);
    }

    function test_NonOwnerCannotUpdateLockPeriod() public {
        vm.prank(recipient);
        vm.expectRevert(); // Expect revert due to onlyOwner modifier
        lsp7NonTransferable.updateTransferLockPeriod(
            block.timestamp + 100,
            block.timestamp + 200
        );

        vm.prank(recipient);
        vm.expectRevert(); // Expect revert due to onlyOwner modifier
        lsp7NonTransferable.updateTransferLockEnd(block.timestamp + 200);
    }
}
