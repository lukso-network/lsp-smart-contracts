// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// foundry
import "forge-std/Test.sol";

// modules
import {LSP8IdentifiableDigitalAsset} from "../contracts/LSP8IdentifiableDigitalAsset.sol";
import {LSP8AllowlistAbstract} from "../contracts/extensions/LSP8Allowlist/LSP8AllowlistAbstract.sol";
import {LSP8NonTransferableAbstract} from "../contracts/extensions/LSP8NonTransferable/LSP8NonTransferableAbstract.sol";

// interfaces
import {ILSP8NonTransferable} from "../contracts/extensions/LSP8NonTransferable/ILSP8NonTransferable.sol";

// errors
import {
    LSP8TransferDisabled,
    LSP8CannotUpdateTransferLockPeriod,
    LSP8InvalidTransferLockPeriod,
    LSP8TokenAlreadyTransferable
} from "../contracts/extensions/LSP8NonTransferable/LSP8NonTransferableErrors.sol";

// constants
import {_LSP4_TOKEN_TYPE_NFT} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {_LSP8_TOKENID_FORMAT_NUMBER} from "../contracts/LSP8Constants.sol";

contract MockLSP8NonTransferable is LSP8NonTransferableAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_,
        uint256 transferLockStart_,
        uint256 transferLockEnd_
    )
        LSP8IdentifiableDigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        )
        LSP8NonTransferableAbstract(transferLockStart_, transferLockEnd_)
        LSP8AllowlistAbstract(newOwner_)
    {}

    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public virtual {
        _mint(to, tokenId, force, data);
    }

    function burn(bytes32 tokenId, bytes memory data) public virtual {
        _burn(tokenId, data);
    }
}

contract LSP8NonTransferableTest is Test {
    string name = "Test NFT";
    string symbol = "TNFT";
    uint256 tokenType = _LSP4_TOKEN_TYPE_NFT;
    uint256 tokenIdFormat = _LSP8_TOKENID_FORMAT_NUMBER;

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

    bytes32 tokenId1 = bytes32(uint256(1));
    bytes32 tokenId2 = bytes32(uint256(2));
    bytes32 tokenId3 = bytes32(uint256(3));

    MockLSP8NonTransferable lsp8NonTransferable;
    MockLSP8NonTransferable lsp8TransferableWithLockPeriod;

    function setUp() public {
        // Token that's always non-transferable (start=0, end=max)
        lsp8NonTransferable = new MockLSP8NonTransferable(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            transferLockStart,
            transferLockEnd
        );

        // Token with a specific lock period (transferable outside the period)
        lsp8TransferableWithLockPeriod = new MockLSP8NonTransferable(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            lockPeriodStart,
            lockPeriodEnd
        );

        lsp8NonTransferable.mint(owner, tokenId1, true, "");
        lsp8NonTransferable.mint(randomCaller, tokenId2, true, "");
        lsp8NonTransferable.mint(allowlistedUser, tokenId3, true, "");

        lsp8TransferableWithLockPeriod.mint(
            randomCaller,
            bytes32(uint256(10)),
            true,
            ""
        );

        vm.label(address(lsp8NonTransferable), "lsp8NonTransferable");
        vm.label(
            address(lsp8TransferableWithLockPeriod),
            "lsp8TransferableWithLockPeriod"
        );
        vm.label(owner, "owner");
        vm.label(randomCaller, "randomCaller");
        vm.label(allowlistedUser, "allowlistedUser");

        lsp8NonTransferable.addToAllowlist(allowlistedUser);
    }

    // Constructor and Initial State
    function test_ConstructorSetsInitialStateAndEmitsEvents() public {
        // Token with start=0, end=0 --> always transferable
        uint256 token1_TransferLockStart = 0;
        uint256 token1_TransferLockEnd = 0;

        vm.expectEmit(true, true, false, false);
        emit ILSP8NonTransferable.TransferLockPeriodChanged(
            token1_TransferLockStart,
            token1_TransferLockEnd
        );

        MockLSP8NonTransferable token1 = new MockLSP8NonTransferable(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            token1_TransferLockStart,
            token1_TransferLockEnd
        );

        assertTrue(token1.isTransferable());

        // -------------------------------

        // Token with start=0, end=max --> always non-transferable
        uint256 token2_TransferLockStart = 0;
        uint256 token2_TransferLockEnd = type(uint256).max;

        vm.expectEmit(true, true, false, false);
        emit ILSP8NonTransferable.TransferLockPeriodChanged(
            token2_TransferLockStart,
            token2_TransferLockEnd
        );

        MockLSP8NonTransferable token2 = new MockLSP8NonTransferable(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            token2_TransferLockStart,
            token2_TransferLockEnd
        );

        assertFalse(token2.isTransferable());
    }

    function test_ConstructorRevertsWithInvalidLockPeriod() public {
        vm.expectRevert(LSP8InvalidTransferLockPeriod.selector);
        new MockLSP8NonTransferable(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            100,
            50 // end < start (non-zero end < start)
        );
    }

    // Transferability
    function test_OwnerCanTransfer() public {
        assertEq(lsp8NonTransferable.balanceOf(recipient), 0);
        lsp8NonTransferable.transfer(owner, recipient, tokenId1, true, "");
        assertEq(lsp8NonTransferable.balanceOf(recipient), 1);
    }

    function test_RandomCallerCannotTransfer() public {
        assertEq(lsp8NonTransferable.balanceOf(recipient), 0);
        vm.prank(randomCaller);
        vm.expectRevert(LSP8TransferDisabled.selector);
        lsp8NonTransferable.transfer(
            randomCaller,
            recipient,
            tokenId2,
            true,
            ""
        );
        assertEq(lsp8NonTransferable.balanceOf(recipient), 0);
    }

    function test_RandomCallerShouldBeAllowedToBurn() public {
        assertEq(lsp8NonTransferable.balanceOf(randomCaller), 1);
        vm.prank(randomCaller);
        lsp8NonTransferable.burn(tokenId2, "");
        assertEq(lsp8NonTransferable.balanceOf(randomCaller), 0);
    }

    // Transfer Lock Period
    function test_TransferFailsDuringLockPeriod() public {
        vm.warp(lockPeriodStart + 50); // Inside lock period
        assertFalse(lsp8TransferableWithLockPeriod.isTransferable());
        vm.prank(randomCaller);
        vm.expectRevert(LSP8TransferDisabled.selector);
        lsp8TransferableWithLockPeriod.transfer(
            randomCaller,
            recipient,
            bytes32(uint256(10)),
            true,
            ""
        );
        assertEq(lsp8TransferableWithLockPeriod.balanceOf(recipient), 0);
    }

    function test_TransferSucceedsBeforeLockPeriod() public {
        vm.warp(lockPeriodStart - 50); // Before lock period
        assertTrue(lsp8TransferableWithLockPeriod.isTransferable());
        vm.prank(randomCaller);
        lsp8TransferableWithLockPeriod.transfer(
            randomCaller,
            recipient,
            bytes32(uint256(10)),
            true,
            ""
        );
        assertEq(lsp8TransferableWithLockPeriod.balanceOf(recipient), 1);
    }

    function test_TransferSucceedsAfterLockPeriod() public {
        vm.warp(lockPeriodEnd + 50); // After lock period
        assertTrue(lsp8TransferableWithLockPeriod.isTransferable());
        vm.prank(randomCaller);
        lsp8TransferableWithLockPeriod.transfer(
            randomCaller,
            recipient,
            bytes32(uint256(10)),
            true,
            ""
        );
        assertEq(lsp8TransferableWithLockPeriod.balanceOf(recipient), 1);
    }

    // Allowlist Behavior
    function test_AllowlistedAddressCanTransferDuringLockPeriod() public {
        vm.warp(lockPeriodStart + 50); // Inside lock period
        assertFalse(lsp8NonTransferable.isTransferable());
        vm.prank(allowlistedUser);
        lsp8NonTransferable.transfer(
            allowlistedUser,
            recipient,
            tokenId3,
            true,
            ""
        );
        assertEq(lsp8NonTransferable.balanceOf(recipient), 1);
    }

    function test_NonAllowlistedAddressCannotTransferDuringLockPeriod() public {
        // Mint a token to nonAllowlistedUser
        lsp8NonTransferable.mint(
            nonAllowlistedUser,
            bytes32(uint256(50)),
            true,
            ""
        );

        vm.warp(lockPeriodStart + 50); // Inside lock period
        assertFalse(lsp8NonTransferable.isTransferable());
        vm.prank(nonAllowlistedUser);
        vm.expectRevert(LSP8TransferDisabled.selector);
        lsp8NonTransferable.transfer(
            nonAllowlistedUser,
            recipient,
            bytes32(uint256(50)),
            true,
            ""
        );
        assertEq(lsp8NonTransferable.balanceOf(recipient), 0);
    }

    // makeTransferable() Function
    function test_MakeTransferableEnablesTransfers() public {
        // lsp8NonTransferable has start=0, end=max (always non-transferable)
        assertFalse(lsp8NonTransferable.isTransferable());
        lsp8NonTransferable.makeTransferable();
        assertTrue(lsp8NonTransferable.isTransferable());

        vm.prank(randomCaller);
        lsp8NonTransferable.transfer(
            randomCaller,
            recipient,
            tokenId2,
            true,
            ""
        );
        assertEq(lsp8NonTransferable.balanceOf(recipient), 1);
    }

    function test_MakeTransferableEnablesTransfersFromLockPeriod() public {
        // Create a token with a lock period
        MockLSP8NonTransferable tokenWithLock = new MockLSP8NonTransferable(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            block.timestamp + 100,
            block.timestamp + 200
        );
        tokenWithLock.mint(randomCaller, tokenId1, true, "");

        vm.warp(block.timestamp + 150); // Inside lock period
        assertFalse(tokenWithLock.isTransferable());

        tokenWithLock.makeTransferable();
        assertTrue(tokenWithLock.isTransferable());

        vm.prank(randomCaller);
        tokenWithLock.transfer(randomCaller, recipient, tokenId1, true, "");
        assertEq(tokenWithLock.balanceOf(recipient), 1);
    }

    function test_NonOwnerCannotCallMakeTransferable() public {
        vm.prank(randomCaller);
        vm.expectRevert("Ownable: caller is not the owner"); // Expect revert due to onlyOwner modifier
        lsp8NonTransferable.makeTransferable();
    }

    function test_MakeTransferableRevertsWhenAlreadyTransferable() public {
        // Create a token that's already transferable (both lock periods = 0)
        MockLSP8NonTransferable transferableToken = new MockLSP8NonTransferable(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            0,
            0
        );
        assertTrue(transferableToken.isTransferable());

        // Calling makeTransferable should revert since it's already transferable
        vm.expectRevert(LSP8TokenAlreadyTransferable.selector);
        transferableToken.makeTransferable();
    }

    function test_MakeTransferableRevertsWhenCalledTwice() public {
        // lsp8NonTransferable has start=0, end=max (non-transferable)
        assertFalse(lsp8NonTransferable.isTransferable());

        // First call should succeed
        lsp8NonTransferable.makeTransferable();
        assertTrue(lsp8NonTransferable.isTransferable());

        // Second call should revert since it's now transferable
        vm.expectRevert(LSP8TokenAlreadyTransferable.selector);
        lsp8NonTransferable.makeTransferable();
    }

    // Lock Period Updates
    function test_UpdateTransferLockPeriodSucceedsBeforeStart() public {
        uint256 newTransferLockStart = lockPeriodStart + 150;
        uint256 newTransferLockEnd = lockPeriodEnd + 250;

        vm.expectEmit(true, true, false, false);
        emit ILSP8NonTransferable.TransferLockPeriodChanged(
            newTransferLockStart,
            newTransferLockEnd
        );
        lsp8TransferableWithLockPeriod.updateTransferLockPeriod(
            newTransferLockStart,
            newTransferLockEnd
        );
        assertEq(
            lsp8TransferableWithLockPeriod.transferLockStart(),
            newTransferLockStart
        );
        assertEq(
            lsp8TransferableWithLockPeriod.transferLockEnd(),
            newTransferLockEnd
        );
    }

    function test_UpdateTransferLockPeriodRevertsAfterStart() public {
        uint256 newTransferLockStart = lockPeriodStart + 150;
        uint256 newTransferLockEnd = lockPeriodEnd + 250;

        vm.warp(lockPeriodStart + 50);
        vm.expectRevert(LSP8CannotUpdateTransferLockPeriod.selector);
        lsp8TransferableWithLockPeriod.updateTransferLockPeriod(
            newTransferLockStart,
            newTransferLockEnd
        );
    }

    function test_UpdateTransferLockPeriodRevertsAfterEnd() public {
        uint256 newTransferLockStart = lockPeriodStart + 150;
        uint256 newTransferLockEnd = lockPeriodEnd + 250;

        vm.warp(lockPeriodEnd + 50);
        vm.expectRevert(LSP8CannotUpdateTransferLockPeriod.selector);
        lsp8TransferableWithLockPeriod.updateTransferLockPeriod(
            newTransferLockStart,
            newTransferLockEnd
        );
    }

    function test_UpdateTransferLockPeriodRevertsInvalidPeriod() public {
        uint256 newTransferLockStart = lockPeriodStart + 150;
        uint256 newTransferLockEnd = newTransferLockStart - 50;

        vm.expectRevert(LSP8InvalidTransferLockPeriod.selector);
        lsp8TransferableWithLockPeriod.updateTransferLockPeriod(
            newTransferLockStart,
            newTransferLockEnd
        );
    }

    // Test for new behavior: disabling lock periods by setting to 0
    function test_UpdateTransferLockPeriodWithZeroStart() public {
        // When transferLockStart is set to 0, transfers should be locked until transferLockEnd
        uint256 newTransferLockStart = 0;
        uint256 newTransferLockEnd = lockPeriodEnd + 250;

        vm.expectEmit(true, true, false, false);
        emit ILSP8NonTransferable.TransferLockPeriodChanged(
            newTransferLockStart,
            newTransferLockEnd
        );
        lsp8TransferableWithLockPeriod.updateTransferLockPeriod(
            newTransferLockStart,
            newTransferLockEnd
        );

        assertEq(
            lsp8TransferableWithLockPeriod.transferLockStart(),
            newTransferLockStart
        );
        assertEq(
            lsp8TransferableWithLockPeriod.transferLockEnd(),
            newTransferLockEnd
        );

        vm.warp(newTransferLockEnd - 50); // Before new end time
        assertFalse(lsp8TransferableWithLockPeriod.isTransferable());

        vm.warp(newTransferLockEnd + 50); // After new end time
        assertTrue(lsp8TransferableWithLockPeriod.isTransferable());
    }

    function test_UpdateTransferLockPeriodWithZeroEnd() public {
        // When transferLockEnd is set to 0, transfers should be locked from transferLockStart to forever
        uint256 newTransferLockStart = lockPeriodStart + 150;
        uint256 newTransferLockEnd = 0;

        vm.expectEmit(true, true, false, false);
        emit ILSP8NonTransferable.TransferLockPeriodChanged(
            newTransferLockStart,
            newTransferLockEnd
        );
        lsp8TransferableWithLockPeriod.updateTransferLockPeriod(
            newTransferLockStart,
            newTransferLockEnd
        );

        assertEq(
            lsp8TransferableWithLockPeriod.transferLockStart(),
            newTransferLockStart
        );
        assertEq(
            lsp8TransferableWithLockPeriod.transferLockEnd(),
            newTransferLockEnd
        );

        // With end=0, transfers should be locked from start time forever
        vm.warp(newTransferLockStart - 50); // Before new start time
        assertTrue(lsp8TransferableWithLockPeriod.isTransferable());

        vm.warp(newTransferLockStart + 50); // After new start time
        assertFalse(lsp8TransferableWithLockPeriod.isTransferable());
    }

    function test_UpdateTransferLockPeriodWithBothZero() public {
        // When both are set to 0, transfers should be allowed anytime
        uint256 newTransferLockStart = 0;
        uint256 newTransferLockEnd = 0;

        vm.expectEmit(true, true, false, false);
        emit ILSP8NonTransferable.TransferLockPeriodChanged(
            newTransferLockStart,
            newTransferLockEnd
        );
        lsp8TransferableWithLockPeriod.updateTransferLockPeriod(
            newTransferLockStart,
            newTransferLockEnd
        );

        assertEq(
            lsp8TransferableWithLockPeriod.transferLockStart(),
            newTransferLockStart
        );
        assertEq(
            lsp8TransferableWithLockPeriod.transferLockEnd(),
            newTransferLockEnd
        );

        // With both 0, transfers should be allowed anytime
        vm.warp(lockPeriodStart - 50); // Before original start time
        assertTrue(lsp8TransferableWithLockPeriod.isTransferable());

        vm.warp(lockPeriodEnd + 50); // After original end time
        assertTrue(lsp8TransferableWithLockPeriod.isTransferable());
    }

    // Edge Cases
    function test_TransferToSelfSucceedsWhenTransferable() public {
        uint256 initialBalance = lsp8NonTransferable.balanceOf(owner);
        lsp8NonTransferable.transfer(owner, owner, tokenId1, true, "");
        assertEq(lsp8NonTransferable.balanceOf(owner), initialBalance);
    }

    // Test for zero transfer lock period values
    function test_ConstructorWithZeroLockPeriods() public {
        MockLSP8NonTransferable token = new MockLSP8NonTransferable(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            0, // transferLockStart = 0 (no start time restriction)
            0 // transferLockEnd = 0 (no end time restriction)
        );

        assertTrue(token.isTransferable());
        assertEq(token.transferLockStart(), 0);
        assertEq(token.transferLockEnd(), 0);
    }

    function test_UpdateTransferLockPeriodWithZeroValues() public {
        // Test updating to zero values
        lsp8TransferableWithLockPeriod.updateTransferLockPeriod(0, 0);
        assertEq(lsp8TransferableWithLockPeriod.transferLockStart(), 0);
        assertEq(lsp8TransferableWithLockPeriod.transferLockEnd(), 0);
        assertTrue(lsp8TransferableWithLockPeriod.isTransferable());
    }

    function test_TransferWithZeroStart() public {
        // Create a token with zero start
        MockLSP8NonTransferable token = new MockLSP8NonTransferable(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            0, // transferLockStart = 0 (no restriction)
            1000 // transferLockEnd = 1000 (restricted until then)
        );

        vm.warp(500); // Before lock end time
        assertFalse(token.isTransferable()); // Should be locked before end time

        vm.warp(1500); // After lock end time
        assertTrue(token.isTransferable()); // Should be unlocked after end time
    }

    function test_TransferWithZeroEnd() public {
        // Create a token with zero end
        MockLSP8NonTransferable token = new MockLSP8NonTransferable(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            1000, // transferLockStart = 1000 (restricted from then)
            0 // transferLockEnd = 0 (no restriction after start)
        );

        vm.warp(500); // Before lock start time
        assertTrue(token.isTransferable()); // Should be allowed before start time

        vm.warp(1500); // After lock start time
        assertFalse(token.isTransferable()); // Should be restricted after start time
    }

    function test_NonOwnerCannotUpdateLockPeriod() public {
        vm.prank(recipient);
        vm.expectRevert(); // Expect revert due to onlyOwner modifier
        lsp8NonTransferable.updateTransferLockPeriod(
            block.timestamp + 100,
            block.timestamp + 200
        );
    }

    // ------ Fuzzing ------

    function testFuzz_TransferRespectsLockPeriod(uint256 timestamp) public {
        vm.assume(timestamp <= type(uint64).max);

        lsp8NonTransferable.mint(
            nonAllowlistedUser,
            bytes32(uint256(100)),
            true,
            ""
        );
        vm.warp(timestamp);

        if (!lsp8NonTransferable.isTransferable()) {
            vm.prank(nonAllowlistedUser);
            vm.expectRevert(LSP8TransferDisabled.selector);
            lsp8NonTransferable.transfer(
                nonAllowlistedUser,
                recipient,
                bytes32(uint256(100)),
                true,
                ""
            );
        } else {
            vm.prank(nonAllowlistedUser);
            lsp8NonTransferable.transfer(
                nonAllowlistedUser,
                recipient,
                bytes32(uint256(100)),
                true,
                ""
            );
            assertEq(
                lsp8NonTransferable.balanceOf(recipient),
                1,
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
            vm.expectRevert(LSP8InvalidTransferLockPeriod.selector);
            lsp8NonTransferable.updateTransferLockPeriod(newStart, newEnd);
        }
        // If block.timestamp >= transferLockStart and newStart is non-zero, expect revert
        else if (newStart != 0 && currentTime >= transferLockStart) {
            vm.expectRevert(LSP8CannotUpdateTransferLockPeriod.selector);
            lsp8NonTransferable.updateTransferLockPeriod(newStart, newEnd);
        }
        // If block.timestamp >= transferLockEnd and newEnd is non-zero, expect revert
        else if (newEnd != 0 && currentTime >= transferLockEnd) {
            vm.expectRevert(LSP8CannotUpdateTransferLockPeriod.selector);
            lsp8NonTransferable.updateTransferLockPeriod(newStart, newEnd);
        } else {
            vm.expectEmit(true, true, false, false);
            emit ILSP8NonTransferable.TransferLockPeriodChanged(
                newStart,
                newEnd
            );
            lsp8NonTransferable.updateTransferLockPeriod(newStart, newEnd);
            assertEq(
                lsp8NonTransferable.transferLockStart(),
                newStart,
                "Lock start should update"
            );
            assertEq(
                lsp8NonTransferable.transferLockEnd(),
                newEnd,
                "Lock end should update"
            );
        }
    }

    function testFuzz_BurningAllowedAnyTime(uint256 timestamp) public {
        vm.assume(timestamp <= type(uint64).max);

        lsp8NonTransferable.mint(
            nonAllowlistedUser,
            bytes32(uint256(200)),
            true,
            ""
        );

        vm.warp(timestamp);

        // Burning should always succeed
        vm.prank(nonAllowlistedUser);
        lsp8NonTransferable.burn(bytes32(uint256(200)), "");
        assertEq(
            lsp8NonTransferable.balanceOf(nonAllowlistedUser),
            0,
            "Balance should be zero after burning"
        );
    }
}
