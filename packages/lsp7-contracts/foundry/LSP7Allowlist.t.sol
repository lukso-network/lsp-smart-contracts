// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.22;

// foundry
import "forge-std/Test.sol";

// modules
import {
    LSP7AllowlistAbstract
} from "../contracts/extensions/LSP7Allowlist/LSP7AllowlistAbstract.sol";
import {LSP7DigitalAsset} from "../contracts/LSP7DigitalAsset.sol";

// interfaces
import {
    ILSP7Allowlist
} from "../contracts/extensions/LSP7Allowlist/ILSP7Allowlist.sol";

// constants
import {
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

// errors
import {
    LSP7AllowListInvalidIndexRange,
    LSP7AllowListCannotRemoveReservedAddress
} from "../contracts/extensions/LSP7Allowlist/LSP7AllowlistErrors.sol";

// Mock contract to test LSP7AllowlistAbstract functionality
contract MockLSP7Allowlist is LSP7AllowlistAbstract {
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
        LSP7AllowlistAbstract(newOwner_)
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
}

contract LSP7AllowlistTest is Test {
    string name = "Test Token";
    string symbol = "TT";
    uint256 tokenType = _LSP4_TOKEN_TYPE_TOKEN;
    bool isNonDivisible = false;

    address owner = address(this);
    address nonOwner = vm.addr(100);
    address user1 = vm.addr(101);
    address user2 = vm.addr(102);
    address zeroAddress = address(0);
    address deadAddress = 0x000000000000000000000000000000000000dEaD;

    MockLSP7Allowlist lsp7Allowlist;

    function setUp() public {
        lsp7Allowlist = new MockLSP7Allowlist(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible
        );
    }

    // Test constructor initialization
    function test_ConstructorInitializesAllowlist() public {
        assertTrue(
            lsp7Allowlist.isAllowlisted(owner),
            "Owner should be allowlisted"
        );
        assertTrue(
            lsp7Allowlist.isAllowlisted(zeroAddress),
            "Zero address should be allowlisted"
        );
        assertTrue(
            lsp7Allowlist.isAllowlisted(deadAddress),
            "Dead address should be allowlisted"
        );
        assertFalse(
            lsp7Allowlist.isAllowlisted(user1),
            "Non-owner should not be allowlisted"
        );
    }

    // Test addToAllowlist functionality
    function test_AddToAllowlistAsOwner() public {
        vm.expectEmit(true, true, false, true, address(lsp7Allowlist));
        emit ILSP7Allowlist.AllowlistChanged(user1, true);
        lsp7Allowlist.addToAllowlist(user1);
        assertTrue(
            lsp7Allowlist.isAllowlisted(user1),
            "User1 should be allowlisted"
        );
    }

    function test_AddToAllowlistAlreadyAdded() public {
        lsp7Allowlist.addToAllowlist(user1);
        assertTrue(
            lsp7Allowlist.isAllowlisted(user1),
            "User1 should be allowlisted"
        );
        // Adding again should not revert, but should not emit since address is already in the set
        vm.recordLogs();
        lsp7Allowlist.addToAllowlist(user1);
        Vm.Log[] memory entries = vm.getRecordedLogs();
        assertEq(
            entries.length,
            0,
            "No event should be emitted for duplicate add"
        );
        assertTrue(
            lsp7Allowlist.isAllowlisted(user1),
            "User1 should still be allowlisted"
        );
    }

    function test_NonOwnerCannotAddToAllowlist() public {
        vm.prank(nonOwner);
        vm.expectRevert(); // Expect revert due to onlyOwner modifier
        lsp7Allowlist.addToAllowlist(user1);
        assertFalse(
            lsp7Allowlist.isAllowlisted(user1),
            "User1 should not be allowlisted"
        );
    }

    // Test removeFromAllowlist functionality
    function test_RemoveFromAllowlistAsOwner() public {
        lsp7Allowlist.addToAllowlist(user1);
        assertTrue(
            lsp7Allowlist.isAllowlisted(user1),
            "User1 should be allowlisted initially"
        );
        vm.expectEmit(true, true, false, true, address(lsp7Allowlist));
        emit ILSP7Allowlist.AllowlistChanged(user1, false);
        lsp7Allowlist.removeFromAllowlist(user1);
        assertFalse(
            lsp7Allowlist.isAllowlisted(user1),
            "User1 should not be allowlisted"
        );
    }

    function test_RemoveFromAllowlistNotAdded() public {
        assertFalse(
            lsp7Allowlist.isAllowlisted(user2),
            "User2 should not be allowlisted initially"
        );
        // Removing a non-allowlisted address should not revert or emit
        vm.expectEmit(true, true, false, false, address(lsp7Allowlist));
        emit ILSP7Allowlist.AllowlistChanged(user2, false);
        lsp7Allowlist.removeFromAllowlist(user2);
        assertFalse(
            lsp7Allowlist.isAllowlisted(user2),
            "User2 should still not be allowlisted"
        );
    }

    function test_NonOwnerCannotRemoveFromAllowlist() public {
        lsp7Allowlist.addToAllowlist(user1);
        vm.prank(nonOwner);
        vm.expectRevert(); // Expect revert due to onlyOwner modifier
        lsp7Allowlist.removeFromAllowlist(user1);
        assertTrue(
            lsp7Allowlist.isAllowlisted(user1),
            "User1 should still be allowlisted"
        );
    }

    // Test isAllowlisted functionality
    function test_IsAllowlistedReturnsCorrectStatus() public {
        assertTrue(
            lsp7Allowlist.isAllowlisted(owner),
            "Owner should be allowlisted"
        );
        assertTrue(
            lsp7Allowlist.isAllowlisted(zeroAddress),
            "Zero address should be allowlisted"
        );
        assertFalse(
            lsp7Allowlist.isAllowlisted(user1),
            "User1 should not be allowlisted initially"
        );
        lsp7Allowlist.addToAllowlist(user1);
        assertTrue(
            lsp7Allowlist.isAllowlisted(user1),
            "User1 should be allowlisted after addition"
        );
        lsp7Allowlist.removeFromAllowlist(user1);
        assertFalse(
            lsp7Allowlist.isAllowlisted(user1),
            "User1 should not be allowlisted after removal"
        );
    }

    // Edge cases
    function test_AddZeroAddressToAllowlist() public {
        // Zero address is already allowlisted in constructor, so re-adding should not emit
        vm.recordLogs();
        lsp7Allowlist.addToAllowlist(zeroAddress);
        Vm.Log[] memory entries = vm.getRecordedLogs();
        assertEq(
            entries.length,
            0,
            "No event should be emitted for duplicate add"
        );
        assertTrue(
            lsp7Allowlist.isAllowlisted(zeroAddress),
            "Zero address should remain allowlisted"
        );
    }

    function test_CannotRemoveZeroAddressFromAllowlist() public {
        assertTrue(
            lsp7Allowlist.isAllowlisted(zeroAddress),
            "Zero address should be allowlisted initially"
        );
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7AllowListCannotRemoveReservedAddress.selector,
                zeroAddress
            )
        );
        lsp7Allowlist.removeFromAllowlist(zeroAddress);
        assertTrue(
            lsp7Allowlist.isAllowlisted(zeroAddress),
            "Zero address should still be allowlisted"
        );
    }

    function test_CannotRemoveDeadAddressFromAllowlist() public {
        assertTrue(
            lsp7Allowlist.isAllowlisted(deadAddress),
            "Dead address should be allowlisted initially"
        );
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7AllowListCannotRemoveReservedAddress.selector,
                deadAddress
            )
        );
        lsp7Allowlist.removeFromAllowlist(deadAddress);
        assertTrue(
            lsp7Allowlist.isAllowlisted(deadAddress),
            "Dead address should still be allowlisted"
        );
    }

    function test_MultipleAddressesInAllowlist() public {
        lsp7Allowlist.addToAllowlist(user1);
        lsp7Allowlist.addToAllowlist(user2);
        assertTrue(
            lsp7Allowlist.isAllowlisted(user1),
            "User1 should be allowlisted"
        );
        assertTrue(
            lsp7Allowlist.isAllowlisted(user2),
            "User2 should be allowlisted"
        );
        lsp7Allowlist.removeFromAllowlist(user1);
        assertFalse(
            lsp7Allowlist.isAllowlisted(user1),
            "User1 should not be allowlisted"
        );
        assertTrue(
            lsp7Allowlist.isAllowlisted(user2),
            "User2 should still be allowlisted"
        );
    }

    // ------ Fuzzing ------

    function testFuzz_AllowlistManagement(address addr, bool add) public {
        vm.assume(addr != address(0));
        vm.assume(addr != deadAddress); // Exclude dead address (protected)
        vm.assume(addr != owner); // Exclude owner to test new addresses

        if (add) {
            vm.expectEmit(true, true, false, true, address(lsp7Allowlist));
            emit ILSP7Allowlist.AllowlistChanged(addr, true);
            lsp7Allowlist.addToAllowlist(addr);
            assertTrue(
                lsp7Allowlist.isAllowlisted(addr),
                "Address should be allowlisted"
            );
        } else {
            vm.expectEmit(true, true, false, true, address(lsp7Allowlist));
            emit ILSP7Allowlist.AllowlistChanged(addr, false);
            lsp7Allowlist.removeFromAllowlist(addr);
            assertFalse(
                lsp7Allowlist.isAllowlisted(addr),
                "Address should not be allowlisted"
            );
        }

        // Non-owner should revert
        vm.prank(addr);
        vm.expectRevert(); // Expect revert due to onlyOwner
        if (add) {
            lsp7Allowlist.addToAllowlist(addr);
        } else {
            lsp7Allowlist.removeFromAllowlist(addr);
        }
    }

    function testFuzz_GetAllowlistedAddressesByIndex(
        uint256 startIndex,
        uint256 endIndex
    ) public {
        startIndex = bound(startIndex, 0, 100);
        endIndex = bound(endIndex, 0, 100);
        vm.assume(startIndex > endIndex);

        uint256 currentLength = lsp7Allowlist.getAllowlistedAddressesLength();

        for (uint256 i = 0; i < 100; i++) {
            vm.prank(owner);
            lsp7Allowlist.addToAllowlist(vm.addr(100 + i));
        }

        uint256 newLength = lsp7Allowlist.getAllowlistedAddressesLength();
        assertEq(newLength, currentLength + 100);

        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7AllowListInvalidIndexRange.selector,
                startIndex,
                endIndex,
                newLength
            )
        );
        lsp7Allowlist.getAllowlistedAddressesByIndex(startIndex, endIndex);
    }
}
