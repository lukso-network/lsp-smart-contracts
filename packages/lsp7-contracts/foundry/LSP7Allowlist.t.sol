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
        // Adding again should not revert or emit another event
        vm.expectEmit(true, true, false, false, address(lsp7Allowlist));
        emit ILSP7Allowlist.AllowlistChanged(user1, true);
        lsp7Allowlist.addToAllowlist(user1);
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
        // Zero address is already allowlisted in constructor
        vm.expectEmit(true, true, false, false, address(lsp7Allowlist));
        emit ILSP7Allowlist.AllowlistChanged(zeroAddress, true);
        lsp7Allowlist.addToAllowlist(zeroAddress);
        assertTrue(
            lsp7Allowlist.isAllowlisted(zeroAddress),
            "Zero address should remain allowlisted"
        );
    }

    function test_RemoveZeroAddressFromAllowlist() public {
        assertTrue(
            lsp7Allowlist.isAllowlisted(zeroAddress),
            "Zero address should be allowlisted initially"
        );
        vm.expectEmit(true, true, false, true, address(lsp7Allowlist));
        emit ILSP7Allowlist.AllowlistChanged(zeroAddress, false);
        lsp7Allowlist.removeFromAllowlist(zeroAddress);
        assertFalse(
            lsp7Allowlist.isAllowlisted(zeroAddress),
            "Zero address should not be allowlisted"
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
        vm.assume(addr != owner); // Exclude owner to test new addresses

        bool initialStatus = lsp7Allowlist.isAllowlisted(addr);

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
}
