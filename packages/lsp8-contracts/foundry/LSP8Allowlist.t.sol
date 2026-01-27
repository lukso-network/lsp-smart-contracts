// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.22;

// foundry
import "forge-std/Test.sol";

// modules
import {LSP8AllowlistAbstract} from "../contracts/extensions/LSP8Allowlist/LSP8AllowlistAbstract.sol";
import {LSP8IdentifiableDigitalAsset} from "../contracts/LSP8IdentifiableDigitalAsset.sol";

// interfaces
import {ILSP8Allowlist} from "../contracts/extensions/LSP8Allowlist/ILSP8Allowlist.sol";

// constants
import {_LSP4_TOKEN_TYPE_NFT} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {_LSP8_TOKENID_FORMAT_NUMBER} from "../contracts/LSP8Constants.sol";

// Mock contract to test LSP8AllowlistAbstract functionality
contract MockLSP8Allowlist is LSP8AllowlistAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_
    )
        LSP8IdentifiableDigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        )
        LSP8AllowlistAbstract(newOwner_)
    {}

    // Helper function to mint tokens for testing
    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public {
        _mint(to, tokenId, force, data);
    }
}

contract LSP8AllowlistTest is Test {
    string name = "Test NFT";
    string symbol = "TNFT";
    uint256 tokenType = _LSP4_TOKEN_TYPE_NFT;
    uint256 tokenIdFormat = _LSP8_TOKENID_FORMAT_NUMBER;

    address owner = address(this);
    address nonOwner = vm.addr(100);
    address user1 = vm.addr(101);
    address user2 = vm.addr(102);
    address zeroAddress = address(0);

    MockLSP8Allowlist lsp8Allowlist;

    function setUp() public {
        lsp8Allowlist = new MockLSP8Allowlist(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat
        );
    }

    // Test constructor initialization
    function test_ConstructorInitializesAllowlist() public {
        assertTrue(
            lsp8Allowlist.isAllowlisted(owner),
            "Owner should be allowlisted"
        );
        assertTrue(
            lsp8Allowlist.isAllowlisted(zeroAddress),
            "Zero address should be allowlisted"
        );
        assertFalse(
            lsp8Allowlist.isAllowlisted(user1),
            "Non-owner should not be allowlisted"
        );
    }

    // Test addToAllowlist functionality
    function test_AddToAllowlistAsOwner() public {
        vm.expectEmit(true, true, false, true, address(lsp8Allowlist));
        emit ILSP8Allowlist.AllowlistChanged(user1, true);
        lsp8Allowlist.addToAllowlist(user1);
        assertTrue(
            lsp8Allowlist.isAllowlisted(user1),
            "User1 should be allowlisted"
        );
    }

    function test_AddToAllowlistAlreadyAdded() public {
        lsp8Allowlist.addToAllowlist(user1);
        assertTrue(
            lsp8Allowlist.isAllowlisted(user1),
            "User1 should be allowlisted"
        );
        // Adding again should not revert
        vm.expectEmit(true, true, false, false, address(lsp8Allowlist));
        emit ILSP8Allowlist.AllowlistChanged(user1, true);
        lsp8Allowlist.addToAllowlist(user1);
        assertTrue(
            lsp8Allowlist.isAllowlisted(user1),
            "User1 should still be allowlisted"
        );
    }

    function test_NonOwnerCannotAddToAllowlist() public {
        vm.prank(nonOwner);
        vm.expectRevert(); // Expect revert due to onlyOwner modifier
        lsp8Allowlist.addToAllowlist(user1);
        assertFalse(
            lsp8Allowlist.isAllowlisted(user1),
            "User1 should not be allowlisted"
        );
    }

    // Test removeFromAllowlist functionality
    function test_RemoveFromAllowlistAsOwner() public {
        lsp8Allowlist.addToAllowlist(user1);
        assertTrue(
            lsp8Allowlist.isAllowlisted(user1),
            "User1 should be allowlisted initially"
        );
        vm.expectEmit(true, true, false, true, address(lsp8Allowlist));
        emit ILSP8Allowlist.AllowlistChanged(user1, false);
        lsp8Allowlist.removeFromAllowlist(user1);
        assertFalse(
            lsp8Allowlist.isAllowlisted(user1),
            "User1 should not be allowlisted"
        );
    }

    function test_RemoveFromAllowlistNotAdded() public {
        assertFalse(
            lsp8Allowlist.isAllowlisted(user2),
            "User2 should not be allowlisted initially"
        );
        // Removing a non-allowlisted address should not revert
        vm.expectEmit(true, true, false, false, address(lsp8Allowlist));
        emit ILSP8Allowlist.AllowlistChanged(user2, false);
        lsp8Allowlist.removeFromAllowlist(user2);
        assertFalse(
            lsp8Allowlist.isAllowlisted(user2),
            "User2 should still not be allowlisted"
        );
    }

    function test_NonOwnerCannotRemoveFromAllowlist() public {
        lsp8Allowlist.addToAllowlist(user1);
        vm.prank(nonOwner);
        vm.expectRevert(); // Expect revert due to onlyOwner modifier
        lsp8Allowlist.removeFromAllowlist(user1);
        assertTrue(
            lsp8Allowlist.isAllowlisted(user1),
            "User1 should still be allowlisted"
        );
    }

    // Test isAllowlisted functionality
    function test_IsAllowlistedReturnsCorrectStatus() public {
        assertTrue(
            lsp8Allowlist.isAllowlisted(owner),
            "Owner should be allowlisted"
        );
        assertTrue(
            lsp8Allowlist.isAllowlisted(zeroAddress),
            "Zero address should be allowlisted"
        );
        assertFalse(
            lsp8Allowlist.isAllowlisted(user1),
            "User1 should not be allowlisted initially"
        );
        lsp8Allowlist.addToAllowlist(user1);
        assertTrue(
            lsp8Allowlist.isAllowlisted(user1),
            "User1 should be allowlisted after addition"
        );
        lsp8Allowlist.removeFromAllowlist(user1);
        assertFalse(
            lsp8Allowlist.isAllowlisted(user1),
            "User1 should not be allowlisted after removal"
        );
    }

    // Test getAllowlistedAddressesLength
    function test_GetAllowlistedAddressesLength() public {
        // Initially owner and address(0) are allowlisted
        assertEq(
            lsp8Allowlist.getAllowlistedAddressesLength(),
            2,
            "Initial allowlist should have 2 entries"
        );

        lsp8Allowlist.addToAllowlist(user1);
        assertEq(
            lsp8Allowlist.getAllowlistedAddressesLength(),
            3,
            "Allowlist should have 3 entries after adding user1"
        );

        lsp8Allowlist.addToAllowlist(user2);
        assertEq(
            lsp8Allowlist.getAllowlistedAddressesLength(),
            4,
            "Allowlist should have 4 entries after adding user2"
        );

        lsp8Allowlist.removeFromAllowlist(user1);
        assertEq(
            lsp8Allowlist.getAllowlistedAddressesLength(),
            3,
            "Allowlist should have 3 entries after removing user1"
        );
    }

    // Test getAllowlistedAddressesByIndex
    function test_GetAllowlistedAddressesByIndex() public {
        lsp8Allowlist.addToAllowlist(user1);
        lsp8Allowlist.addToAllowlist(user2);

        address[] memory addresses = lsp8Allowlist
            .getAllowlistedAddressesByIndex(0, 4);
        assertEq(addresses.length, 4, "Should return 4 addresses");
        // Verify actual addresses in the returned array
        assertEq(addresses[0], owner, "First address should be owner");
        assertEq(
            addresses[1],
            zeroAddress,
            "Second address should be zero address"
        );
        assertEq(addresses[2], user1, "Third address should be user1");
        assertEq(addresses[3], user2, "Fourth address should be user2");

        // Get partial slice
        address[] memory partialAddresses = lsp8Allowlist
            .getAllowlistedAddressesByIndex(1, 3);
        assertEq(partialAddresses.length, 2, "Should return 2 addresses");
        assertEq(
            partialAddresses[0],
            zeroAddress,
            "Partial slice should start with zero address"
        );
        assertEq(
            partialAddresses[1],
            user1,
            "Partial slice should include user1"
        );
    }

    function test_GetAllowlistedAddressesByIndexEmptySlice() public {
        address[] memory addresses = lsp8Allowlist
            .getAllowlistedAddressesByIndex(0, 0);
        assertEq(addresses.length, 0, "Should return empty array");
    }

    // Edge cases
    function test_AddZeroAddressToAllowlist() public {
        // Zero address is already allowlisted in constructor
        vm.expectEmit(true, true, false, false, address(lsp8Allowlist));
        emit ILSP8Allowlist.AllowlistChanged(zeroAddress, true);
        lsp8Allowlist.addToAllowlist(zeroAddress);
        assertTrue(
            lsp8Allowlist.isAllowlisted(zeroAddress),
            "Zero address should remain allowlisted"
        );
    }

    function test_RemoveZeroAddressFromAllowlist() public {
        assertTrue(
            lsp8Allowlist.isAllowlisted(zeroAddress),
            "Zero address should be allowlisted initially"
        );
        vm.expectEmit(true, true, false, true, address(lsp8Allowlist));
        emit ILSP8Allowlist.AllowlistChanged(zeroAddress, false);
        lsp8Allowlist.removeFromAllowlist(zeroAddress);
        assertFalse(
            lsp8Allowlist.isAllowlisted(zeroAddress),
            "Zero address should not be allowlisted"
        );
    }

    function test_MultipleAddressesInAllowlist() public {
        lsp8Allowlist.addToAllowlist(user1);
        lsp8Allowlist.addToAllowlist(user2);
        assertTrue(
            lsp8Allowlist.isAllowlisted(user1),
            "User1 should be allowlisted"
        );
        assertTrue(
            lsp8Allowlist.isAllowlisted(user2),
            "User2 should be allowlisted"
        );
        lsp8Allowlist.removeFromAllowlist(user1);
        assertFalse(
            lsp8Allowlist.isAllowlisted(user1),
            "User1 should not be allowlisted"
        );
        assertTrue(
            lsp8Allowlist.isAllowlisted(user2),
            "User2 should still be allowlisted"
        );
    }

    // ------ Fuzzing ------

    function testFuzz_AllowlistManagement(address addr, bool add) public {
        vm.assume(addr != address(0));
        vm.assume(addr != owner); // Exclude owner to test new addresses

        if (add) {
            vm.expectEmit(true, true, false, true, address(lsp8Allowlist));
            emit ILSP8Allowlist.AllowlistChanged(addr, true);
            lsp8Allowlist.addToAllowlist(addr);
            assertTrue(
                lsp8Allowlist.isAllowlisted(addr),
                "Address should be allowlisted"
            );
        } else {
            vm.expectEmit(true, true, false, true, address(lsp8Allowlist));
            emit ILSP8Allowlist.AllowlistChanged(addr, false);
            lsp8Allowlist.removeFromAllowlist(addr);
            assertFalse(
                lsp8Allowlist.isAllowlisted(addr),
                "Address should not be allowlisted"
            );
        }

        // Non-owner should revert
        vm.prank(addr);
        vm.expectRevert(); // Expect revert due to onlyOwner
        if (add) {
            lsp8Allowlist.addToAllowlist(addr);
        } else {
            lsp8Allowlist.removeFromAllowlist(addr);
        }
    }
}
