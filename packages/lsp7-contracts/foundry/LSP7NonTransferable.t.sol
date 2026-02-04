// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.22;

// foundry
import "forge-std/Test.sol";

// modules
import {LSP7DigitalAsset} from "../contracts/LSP7DigitalAsset.sol";
import {LSP7AllowlistAbstract} from "../contracts/extensions/LSP7Allowlist/LSP7AllowlistAbstract.sol";
import {LSP7NonTransferableAbstract} from "../contracts/extensions/LSP7NonTransferable/LSP7NonTransferableAbstract.sol";

// interfaces
import {ILSP7NonTransferable} from "../contracts/extensions/LSP7NonTransferable/ILSP7NonTransferable.sol";

// errors
import {
    LSP7TransferDisabled,
    LSP7CannotUpdateTransferLockPeriod,
    LSP7InvalidTransferLockPeriod,
    LSP7TokenAlreadyTransferable
} from "../contracts/extensions/LSP7NonTransferable/LSP7NonTransferableErrors.sol";

// constants
import {_LSP4_TOKEN_TYPE_TOKEN} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

contract MockLSP7NonTransferable is LSP7NonTransferableAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
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
        LSP7NonTransferableAbstract(transferLockStart_, transferLockEnd_)
        LSP7AllowlistAbstract(newOwner_)
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

    // For "always non-transferable" token: start = 0, end = type(uint256).max
    uint256 transferLockStart = 0;
    uint256 transferLockEnd = type(uint256).max;

    // For "lock period" token: specific start and end times
    uint256 lockPeriodStart = block.timestamp + 3600;
    uint256 lockPeriodEnd = lockPeriodStart + 3600;

    address zeroAddress = address(0);
    address owner = address(this);
    address randomCaller = vm.addr(100);
    address allowlistedUser = vm.addr(101);
    address nonAllowlistedUser = vm.addr(102);
    address recipient = vm.addr(103);

    MockLSP7NonTransferable lsp7NonTransferable;
    MockLSP7NonTransferable lsp7TransferableWithLockPeriod;

    function setUp() public {
        // Token that's always non-transferable (start=0, end=max)
        lsp7NonTransferable = new MockLSP7NonTransferable(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            transferLockStart,
            transferLockEnd
        );

        // Token with a specific lock period (transferable outside the period)
        lsp7TransferableWithLockPeriod = new MockLSP7NonTransferable(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            lockPeriodStart,
            lockPeriodEnd
        );

        lsp7NonTransferable.mint(owner, 100, true, "");
        lsp7NonTransferable.mint(randomCaller, 100, true, "");
        lsp7NonTransferable.mint(allowlistedUser, 100, true, "");

        lsp7TransferableWithLockPeriod.mint(randomCaller, 100, true, "");

        vm.label(address(lsp7NonTransferable), "lsp7NonTransferable");
        vm.label(
            address(lsp7TransferableWithLockPeriod),
            "lsp7TransferableWithLockPeriod"
        );
        vm.label(owner, "owner");
        vm.label(randomCaller, "randomCaller");
        vm.label(allowlistedUser, "allowlistedUser");

        lsp7NonTransferable.addToAllowlist(allowlistedUser);
    }

    // Constructor and Initial State
    function test_ConstructorSetsInitialStateAndEmitsEvents() public {
        // Token with start=0, end=0 --> always transferable
        uint256 token1_TransferLockStart = 0;
        uint256 token1_TransferLockEnd = 0;

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
            token1_TransferLockStart,
            token1_TransferLockEnd
        );

        assertTrue(token1.isTransferable());

        // -------------------------------

        // Token with start=0, end=max --> always non-transferable
        uint256 token2_TransferLockStart = 0;
        uint256 token2_TransferLockEnd = type(uint256).max;

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
            100,
            50 // end < start (non-zero end < start)
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
        vm.warp(lockPeriodStart + 50); // Inside lock period
        assertFalse(lsp7TransferableWithLockPeriod.isTransferable());
        vm.prank(randomCaller);
        vm.expectRevert(LSP7TransferDisabled.selector);
        lsp7TransferableWithLockPeriod.transfer(
            randomCaller,
            recipient,
            10,
            true,
            ""
        );
        assertEq(lsp7TransferableWithLockPeriod.balanceOf(recipient), 0);
    }

    function test_TransferSucceedsBeforeLockPeriod() public {
        vm.warp(lockPeriodStart - 50); // Before lock period
        assertTrue(lsp7TransferableWithLockPeriod.isTransferable());
        vm.prank(randomCaller);
        lsp7TransferableWithLockPeriod.transfer(
            randomCaller,
            recipient,
            10,
            true,
            ""
        );
        assertEq(lsp7TransferableWithLockPeriod.balanceOf(recipient), 10);
    }

    function test_TransferSucceedsAfterLockPeriod() public {
        vm.warp(lockPeriodEnd + 50); // After lock period
        assertTrue(lsp7TransferableWithLockPeriod.isTransferable());
        vm.prank(randomCaller);
        lsp7TransferableWithLockPeriod.transfer(
            randomCaller,
            recipient,
            10,
            true,
            ""
        );
        assertEq(lsp7TransferableWithLockPeriod.balanceOf(recipient), 10);
    }

    function test_TransferWhenLockStartsAndEndIsTheSameBlockCannotTransferatSpecificBlock()
        public
    {
        address tokenSender = vm.addr(100);
        address tokenRecipient = vm.addr(101);

        uint256 transferLockStartBlock = block.timestamp + 100;
        uint256 transferLockEndBlock = transferLockStartBlock;

        MockLSP7NonTransferable lsp7NonTransferableToken = new MockLSP7NonTransferable(
                "Test Non Transferable Token",
                "TNTT",
                msg.sender,
                _LSP4_TOKEN_TYPE_TOKEN,
                false, // isNonDivisible
                transferLockStartBlock,
                transferLockEndBlock
            );

        lsp7NonTransferableToken.mint(tokenSender, 100, true, "");
        assertEq(lsp7NonTransferableToken.balanceOf(tokenSender), 100);

        // CHECK we can transfer before the lock start block
        vm.warp(block.timestamp + 50);
        vm.prank(tokenSender);
        lsp7NonTransferableToken.transfer(
            tokenSender,
            tokenRecipient,
            10,
            true,
            ""
        );
        assertEq(lsp7NonTransferableToken.balanceOf(tokenSender), 90);
        assertEq(lsp7NonTransferableToken.balanceOf(tokenRecipient), 10);

        // CHECK we cannot transfer at the lock start block
        vm.warp(transferLockStartBlock);
        vm.prank(tokenSender);
        vm.expectRevert(LSP7TransferDisabled.selector);
        lsp7NonTransferableToken.transfer(
            tokenSender,
            tokenRecipient,
            10,
            true,
            ""
        );
        assertEq(lsp7NonTransferableToken.balanceOf(tokenSender), 90);
        assertEq(lsp7NonTransferableToken.balanceOf(tokenRecipient), 10);

        // CHECK we cannot transfer at the lock end block
        vm.warp(transferLockEndBlock);
        vm.prank(tokenSender);
        vm.expectRevert(LSP7TransferDisabled.selector);
        lsp7NonTransferableToken.transfer(
            tokenSender,
            tokenRecipient,
            10,
            true,
            ""
        );
        assertEq(lsp7NonTransferableToken.balanceOf(tokenSender), 90);
        assertEq(lsp7NonTransferableToken.balanceOf(tokenRecipient), 10);

        // CHECK we can transfer after the lock end block
        vm.warp(transferLockEndBlock + 1);
        vm.prank(tokenSender);
        lsp7NonTransferableToken.transfer(
            tokenSender,
            tokenRecipient,
            10,
            true,
            ""
        );
        assertEq(lsp7NonTransferableToken.balanceOf(tokenSender), 80);
        assertEq(lsp7NonTransferableToken.balanceOf(tokenRecipient), 20);
    }

    // Allowlist Behavior
    function test_AllowlistedAddressCanTransferDuringLockPeriod() public {
        // lsp7NonTransferable has start=0, end=max (always non-transferable for non-allowlisted)
        assertFalse(lsp7NonTransferable.isTransferable());
        vm.prank(allowlistedUser);
        lsp7NonTransferable.transfer(allowlistedUser, recipient, 10, true, "");
        assertEq(lsp7NonTransferable.balanceOf(recipient), 10);
    }

    function test_NonAllowlistedAddressCannotTransferDuringLockPeriod() public {
        // lsp7NonTransferable has start=0, end=max (always non-transferable for non-allowlisted)
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

    // makeTransferable() Function
    function test_MakeTransferableEnablesTransfers() public {
        // lsp7NonTransferable has start=0, end=max (always non-transferable)
        assertFalse(lsp7NonTransferable.isTransferable());
        lsp7NonTransferable.makeTransferable();
        assertTrue(lsp7NonTransferable.isTransferable());

        vm.prank(randomCaller);
        lsp7NonTransferable.transfer(randomCaller, recipient, 10, true, "");
        assertEq(lsp7NonTransferable.balanceOf(recipient), 10);
    }

    function test_MakeTransferableEnablesTransfersFromLockPeriod() public {
        // Create a token with a lock period
        MockLSP7NonTransferable tokenWithLock = new MockLSP7NonTransferable(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            block.timestamp + 100,
            block.timestamp + 200
        );
        tokenWithLock.mint(randomCaller, 100, true, "");

        vm.warp(block.timestamp + 150); // Inside lock period
        assertFalse(tokenWithLock.isTransferable());

        tokenWithLock.makeTransferable();
        assertTrue(tokenWithLock.isTransferable());

        vm.prank(randomCaller);
        tokenWithLock.transfer(randomCaller, recipient, 10, true, "");
        assertEq(tokenWithLock.balanceOf(recipient), 10);
    }

    function test_NonOwnerCannotCallMakeTransferable() public {
        vm.prank(randomCaller);
        vm.expectRevert("Ownable: caller is not the owner"); // Expect revert due to onlyOwner modifier
        lsp7NonTransferable.makeTransferable();
    }

    function test_MakeTransferableRevertsWhenAlreadyTransferable() public {
        // Create a token that's already transferable (both lock periods = 0)
        MockLSP7NonTransferable transferableToken = new MockLSP7NonTransferable(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            0,
            0
        );
        assertTrue(transferableToken.isTransferable());

        // Calling makeTransferable should revert since it's already transferable
        vm.expectRevert(LSP7TokenAlreadyTransferable.selector);
        transferableToken.makeTransferable();
    }

    function test_MakeTransferableRevertsWhenCalledTwice() public {
        // lsp7NonTransferable has start=0, end=max (non-transferable)
        assertFalse(lsp7NonTransferable.isTransferable());

        // First call should succeed
        lsp7NonTransferable.makeTransferable();
        assertTrue(lsp7NonTransferable.isTransferable());

        // Second call should revert since it's now transferable
        vm.expectRevert(LSP7TokenAlreadyTransferable.selector);
        lsp7NonTransferable.makeTransferable();
    }

    // Lock Period Updates
    function test_UpdateTransferLockPeriodSucceedsBeforeStart() public {
        uint256 newTransferLockStart = lockPeriodStart + 150;
        uint256 newTransferLockEnd = lockPeriodEnd + 250;

        vm.expectEmit(true, true, false, false);
        emit ILSP7NonTransferable.TransferLockPeriodChanged(
            newTransferLockStart,
            newTransferLockEnd
        );
        lsp7TransferableWithLockPeriod.updateTransferLockPeriod(
            newTransferLockStart,
            newTransferLockEnd
        );
        assertEq(
            lsp7TransferableWithLockPeriod.transferLockStart(),
            newTransferLockStart
        );
        assertEq(
            lsp7TransferableWithLockPeriod.transferLockEnd(),
            newTransferLockEnd
        );
    }

    function test_UpdateTransferLockPeriodRevertsAfterStart() public {
        uint256 newTransferLockStart = lockPeriodStart + 150;
        uint256 newTransferLockEnd = lockPeriodEnd + 250;

        vm.warp(lockPeriodStart + 50);
        vm.expectRevert(LSP7CannotUpdateTransferLockPeriod.selector);
        lsp7TransferableWithLockPeriod.updateTransferLockPeriod(
            newTransferLockStart,
            newTransferLockEnd
        );
    }

    function test_UpdateTransferLockPeriodRevertsAfterEnd() public {
        uint256 newTransferLockStart = lockPeriodStart + 150;
        uint256 newTransferLockEnd = lockPeriodEnd + 250;

        vm.warp(lockPeriodEnd + 50);
        vm.expectRevert(LSP7CannotUpdateTransferLockPeriod.selector);
        lsp7TransferableWithLockPeriod.updateTransferLockPeriod(
            newTransferLockStart,
            newTransferLockEnd
        );
    }

    function test_UpdateTransferLockPeriodRevertsInvalidPeriod() public {
        uint256 newTransferLockStart = lockPeriodStart + 150;
        uint256 newTransferLockEnd = newTransferLockStart - 50;

        vm.expectRevert(LSP7InvalidTransferLockPeriod.selector);
        lsp7TransferableWithLockPeriod.updateTransferLockPeriod(
            newTransferLockStart,
            newTransferLockEnd
        );
    }

    // Test for new behavior: disabling lock periods by setting to 0 according to feedback
    function test_UpdateTransferLockPeriodWithZeroStart() public {
        // When transferLockStart is set to 0, transfers should be locked until transferLockEnd
        uint256 newTransferLockStart = 0;
        uint256 newTransferLockEnd = lockPeriodEnd + 250;

        vm.expectEmit(true, true, false, false);
        emit ILSP7NonTransferable.TransferLockPeriodChanged(
            newTransferLockStart,
            newTransferLockEnd
        );
        lsp7TransferableWithLockPeriod.updateTransferLockPeriod(
            newTransferLockStart,
            newTransferLockEnd
        );

        assertEq(
            lsp7TransferableWithLockPeriod.transferLockStart(),
            newTransferLockStart
        );
        assertEq(
            lsp7TransferableWithLockPeriod.transferLockEnd(),
            newTransferLockEnd
        );

        vm.warp(newTransferLockEnd - 50); // Before new end time
        assertFalse(lsp7TransferableWithLockPeriod.isTransferable());

        vm.warp(newTransferLockEnd + 50); // After new end time
        assertTrue(lsp7TransferableWithLockPeriod.isTransferable());
    }

    function test_UpdateTransferLockPeriodWithZeroEnd() public {
        // When transferLockEnd is set to 0, transfers should be locked from transferLockStart to forever
        uint256 newTransferLockStart = lockPeriodStart + 150;
        uint256 newTransferLockEnd = 0;

        vm.expectEmit(true, true, false, false);
        emit ILSP7NonTransferable.TransferLockPeriodChanged(
            newTransferLockStart,
            newTransferLockEnd
        );
        lsp7TransferableWithLockPeriod.updateTransferLockPeriod(
            newTransferLockStart,
            newTransferLockEnd
        );

        assertEq(
            lsp7TransferableWithLockPeriod.transferLockStart(),
            newTransferLockStart
        );
        assertEq(
            lsp7TransferableWithLockPeriod.transferLockEnd(),
            newTransferLockEnd
        );

        // With end=0, transfers should be locked from start time forever
        vm.warp(newTransferLockStart - 50); // Before new start time
        assertTrue(lsp7TransferableWithLockPeriod.isTransferable());

        vm.warp(newTransferLockStart + 50); // After new start time
        assertFalse(lsp7TransferableWithLockPeriod.isTransferable());
    }

    function test_UpdateTransferLockPeriodWithBothZero() public {
        // When both are set to 0, transfers should be allowed anytime
        uint256 newTransferLockStart = 0;
        uint256 newTransferLockEnd = 0;

        vm.expectEmit(true, true, false, false);
        emit ILSP7NonTransferable.TransferLockPeriodChanged(
            newTransferLockStart,
            newTransferLockEnd
        );
        lsp7TransferableWithLockPeriod.updateTransferLockPeriod(
            newTransferLockStart,
            newTransferLockEnd
        );

        assertEq(
            lsp7TransferableWithLockPeriod.transferLockStart(),
            newTransferLockStart
        );
        assertEq(
            lsp7TransferableWithLockPeriod.transferLockEnd(),
            newTransferLockEnd
        );

        // With both 0, transfers should be allowed anytime
        vm.warp(lockPeriodStart - 50); // Before original start time
        assertTrue(lsp7TransferableWithLockPeriod.isTransferable());

        vm.warp(lockPeriodEnd + 50); // After original end time
        assertTrue(lsp7TransferableWithLockPeriod.isTransferable());
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

    // Test for zero transfer lock period values
    function test_ConstructorWithZeroLockPeriods() public {
        MockLSP7NonTransferable token = new MockLSP7NonTransferable(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            0, // transferLockStart = 0 (no start time restriction)
            0 // transferLockEnd = 0 (no end time restriction)
        );

        assertTrue(token.isTransferable());
        assertEq(token.transferLockStart(), 0);
        assertEq(token.transferLockEnd(), 0);
    }

    function test_UpdateTransferLockPeriodWithZeroValues() public {
        // Test updating to zero values
        lsp7TransferableWithLockPeriod.updateTransferLockPeriod(0, 0);
        assertEq(lsp7TransferableWithLockPeriod.transferLockStart(), 0);
        assertEq(lsp7TransferableWithLockPeriod.transferLockEnd(), 0);
        assertTrue(lsp7TransferableWithLockPeriod.isTransferable());
    }

    function test_TransferWithZeroStart() public {
        // Create a non-transferable token with zero start
        MockLSP7NonTransferable token = new MockLSP7NonTransferable(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            0, // transferLockStart = 0 (no restriction)
            1000 // transferLockEnd = 1000 (restricted until then)
        );

        vm.warp(500); // Before lock end time
        assertFalse(token.isTransferable()); // Should be locked before end time

        vm.warp(1500); // After lock end time
        assertTrue(token.isTransferable()); // Should be transferable after end time
    }

    function test_TransferWithZeroEnd() public {
        // Create a non-transferable token with zero end
        MockLSP7NonTransferable token = new MockLSP7NonTransferable(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            1000, // transferLockStart = 1000 (restricted from then)
            0 // transferLockEnd = 0 (no restriction after start = perpetual lock)
        );

        vm.warp(500); // Before lock start time
        assertTrue(token.isTransferable()); // Should be transferable before start time

        vm.warp(1500); // After lock start time
        assertFalse(token.isTransferable()); // Should be locked after start time (perpetually)
    }

    function test_NonOwnerCannotUpdateLockPeriod() public {
        vm.prank(recipient);
        vm.expectRevert(); // Expect revert due to onlyOwner modifier
        lsp7TransferableWithLockPeriod.updateTransferLockPeriod(
            block.timestamp + 100,
            block.timestamp + 200
        );
    }

    // ------ Fuzzing ------

    function testFuzz_TransferRespectsLockPeriod(
        uint256 amount,
        uint256 timestamp
    ) public {
        vm.assume(
            amount <= type(uint256).max - lsp7NonTransferable.totalSupply()
        );
        vm.assume(timestamp <= type(uint64).max);

        lsp7NonTransferable.mint(nonAllowlistedUser, amount, true, "");
        vm.warp(timestamp);

        if (!lsp7NonTransferable.isTransferable()) {
            vm.prank(nonAllowlistedUser);
            vm.expectRevert(LSP7TransferDisabled.selector);
            lsp7NonTransferable.transfer(
                nonAllowlistedUser,
                recipient,
                amount,
                true,
                ""
            );
        } else {
            vm.prank(nonAllowlistedUser);
            lsp7NonTransferable.transfer(
                nonAllowlistedUser,
                recipient,
                amount,
                true,
                ""
            );
            assertEq(
                lsp7NonTransferable.balanceOf(recipient),
                amount,
                "Recipient balance should increase"
            );
        }
    }

    function testFuzz_UpdateLockPeriod(
        uint256 newStart,
        uint256 newEnd,
        uint256 currentTime
    ) public {
        vm.warp(currentTime);

        // If newEnd < newStart, expect revert
        if (newEnd != 0 && newEnd < newStart) {
            vm.expectRevert(LSP7InvalidTransferLockPeriod.selector);
            lsp7TransferableWithLockPeriod.updateTransferLockPeriod(
                newStart,
                newEnd
            );
        }
        // If block.timestamp >= transferLockStart and newStart is non-zero, expect revert
        else if (newStart != 0 && currentTime >= lockPeriodStart) {
            vm.expectRevert(LSP7CannotUpdateTransferLockPeriod.selector);
            lsp7TransferableWithLockPeriod.updateTransferLockPeriod(
                newStart,
                newEnd
            );
        }
        // If block.timestamp >= transferLockEnd and newEnd is non-zero, expect revert
        else if (newEnd != 0 && currentTime >= lockPeriodEnd) {
            vm.expectRevert(LSP7CannotUpdateTransferLockPeriod.selector);
            lsp7TransferableWithLockPeriod.updateTransferLockPeriod(
                newStart,
                newEnd
            );
        } else {
            vm.expectEmit(true, true, false, false);
            emit ILSP7NonTransferable.TransferLockPeriodChanged(
                newStart,
                newEnd
            );
            lsp7TransferableWithLockPeriod.updateTransferLockPeriod(
                newStart,
                newEnd
            );
            assertEq(
                lsp7TransferableWithLockPeriod.transferLockStart(),
                newStart,
                "Lock start should update"
            );
            assertEq(
                lsp7TransferableWithLockPeriod.transferLockEnd(),
                newEnd,
                "Lock end should update"
            );
        }
    }

    function testFuzz_BurningAllowedAnyTime(
        uint256 amount,
        uint256 timestamp
    ) public {
        vm.assume(
            amount < type(uint256).max - lsp7NonTransferable.totalSupply()
        );
        vm.assume(timestamp <= type(uint64).max);

        lsp7NonTransferable.mint(nonAllowlistedUser, amount, true, "");

        vm.warp(timestamp);

        // Burning should always succeed
        vm.prank(nonAllowlistedUser);
        lsp7NonTransferable.burn(nonAllowlistedUser, amount, "");
        assertEq(
            lsp7NonTransferable.balanceOf(nonAllowlistedUser),
            0,
            "Balance should be zero after burning"
        );
    }
}
