// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// foundry
import "forge-std/Test.sol";

// modules
import {LSP8MintableAbstract} from "../contracts/extensions/LSP8Mintable/LSP8MintableAbstract.sol";
import {LSP8IdentifiableDigitalAsset} from "../contracts/LSP8IdentifiableDigitalAsset.sol";

// interfaces
import {ILSP8Mintable} from "../contracts/extensions/LSP8Mintable/ILSP8Mintable.sol";

// errors
import {LSP8MintDisabled} from "../contracts/extensions/LSP8Mintable/LSP8MintableErrors.sol";
import {LSP8TokenIdAlreadyMinted} from "../contracts/LSP8Errors.sol";

// constants
import {_LSP4_TOKEN_TYPE_NFT} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {_LSP8_TOKENID_FORMAT_NUMBER} from "../contracts/LSP8Constants.sol";

// Mock contract to test LSP8MintableAbstract functionality
contract MockLSP8Mintable is LSP8MintableAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_,
        bool mintable_
    )
        LSP8IdentifiableDigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        )
        LSP8MintableAbstract(mintable_)
    {}
}

contract LSP8MintableTest is Test {
    string name = "Test NFT";
    string symbol = "TNFT";
    uint256 tokenType = _LSP4_TOKEN_TYPE_NFT;
    uint256 tokenIdFormat = _LSP8_TOKENID_FORMAT_NUMBER;

    address owner = address(this);
    address nonOwner = vm.addr(100);
    address user1 = vm.addr(101);
    address user2 = vm.addr(102);

    bytes32 tokenId1 = bytes32(uint256(1));
    bytes32 tokenId2 = bytes32(uint256(2));
    bytes32 tokenId3 = bytes32(uint256(3));

    MockLSP8Mintable lsp8Mintable;
    MockLSP8Mintable lsp8NonMintable;

    function setUp() public {
        lsp8Mintable = new MockLSP8Mintable(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            true // mintable
        );

        lsp8NonMintable = new MockLSP8Mintable(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            false // not mintable
        );
    }

    // Test constructor initialization
    function test_ConstructorInitializesCorrectly() public {
        assertTrue(lsp8Mintable.isMintable(), "Token should be mintable");
        assertFalse(
            lsp8NonMintable.isMintable(),
            "Token should not be mintable"
        );
    }

    // Test owner can mint tokens
    function test_OwnerCanMint() public {
        lsp8Mintable.mint(user1, tokenId1, true, "");

        assertEq(lsp8Mintable.balanceOf(user1), 1);
        assertEq(lsp8Mintable.tokenOwnerOf(tokenId1), user1);
        assertEq(lsp8Mintable.totalSupply(), 1);
    }

    function test_OwnerCanMintMultipleTokens() public {
        lsp8Mintable.mint(user1, tokenId1, true, "");
        lsp8Mintable.mint(user1, tokenId2, true, "");
        lsp8Mintable.mint(user2, tokenId3, true, "");

        assertEq(lsp8Mintable.balanceOf(user1), 2);
        assertEq(lsp8Mintable.balanceOf(user2), 1);
        assertEq(lsp8Mintable.totalSupply(), 3);
    }

    // Test non-owner cannot mint
    function test_NonOwnerCannotMint() public {
        vm.prank(nonOwner);
        vm.expectRevert(); // Ownable: caller is not the owner
        lsp8Mintable.mint(user1, tokenId1, true, "");
    }

    function test_UserCannotMint() public {
        vm.prank(user1);
        vm.expectRevert(); // Ownable: caller is not the owner
        lsp8Mintable.mint(user1, tokenId1, true, "");
    }

    // Test disableMinting permanently disables minting
    function test_DisableMintingPreventsNewMints() public {
        // Mint before disabling
        lsp8Mintable.mint(user1, tokenId1, true, "");
        assertEq(lsp8Mintable.totalSupply(), 1);

        // Disable minting
        lsp8Mintable.disableMinting();
        assertFalse(lsp8Mintable.isMintable());

        // Try to mint after disabling
        vm.expectRevert(LSP8MintDisabled.selector);
        lsp8Mintable.mint(user1, tokenId2, true, "");

        // Supply should remain unchanged
        assertEq(lsp8Mintable.totalSupply(), 1);
    }

    // Test minting after disable reverts
    function test_MintingAfterDisableReverts() public {
        lsp8Mintable.disableMinting();

        vm.expectRevert(LSP8MintDisabled.selector);
        lsp8Mintable.mint(user1, tokenId1, true, "");
    }

    // Test isMintable flag changes correctly
    function test_IsMintableFlagChanges() public {
        assertTrue(lsp8Mintable.isMintable());

        lsp8Mintable.disableMinting();

        assertFalse(lsp8Mintable.isMintable());
    }

    // Test disableMinting is only callable by owner
    function test_NonOwnerCannotDisableMinting() public {
        vm.prank(nonOwner);
        vm.expectRevert(); // Ownable: caller is not the owner
        lsp8Mintable.disableMinting();

        // Should still be mintable
        assertTrue(lsp8Mintable.isMintable());
    }

    // Test deploying as non-mintable
    function test_DeployedAsNonMintable() public {
        assertFalse(lsp8NonMintable.isMintable());

        vm.expectRevert(LSP8MintDisabled.selector);
        lsp8NonMintable.mint(user1, tokenId1, true, "");
    }

    // Test calling disableMinting multiple times reverts on second call
    function test_DisableMintingMultipleTimes() public {
        lsp8Mintable.disableMinting();
        assertFalse(lsp8Mintable.isMintable());

        // Calling again should revert since minting is already disabled
        vm.expectRevert(LSP8MintDisabled.selector);
        lsp8Mintable.disableMinting();
        assertFalse(lsp8Mintable.isMintable());
    }

    // Test minting with data
    function test_MintWithData() public {
        bytes memory data = abi.encode("mint data");
        lsp8Mintable.mint(user1, tokenId1, true, data);

        assertEq(lsp8Mintable.tokenOwnerOf(tokenId1), user1);
    }

    // Test minting with force = false
    function test_MintWithForceFalse() public {
        // Minting to EOA with force=false should revert (no LSP1 support)
        vm.expectRevert();
        lsp8Mintable.mint(user1, tokenId1, false, "");
    }

    // Test minting same tokenId twice fails
    function test_MintingSameTokenIdTwiceFails() public {
        lsp8Mintable.mint(user1, tokenId1, true, "");

        vm.expectRevert(
            abi.encodeWithSelector(LSP8TokenIdAlreadyMinted.selector, tokenId1)
        );
        lsp8Mintable.mint(user2, tokenId1, true, "");
    }

    // Test minting to different addresses
    function test_MintingToDifferentAddresses() public {
        lsp8Mintable.mint(user1, tokenId1, true, "");
        lsp8Mintable.mint(user2, tokenId2, true, "");
        lsp8Mintable.mint(owner, tokenId3, true, "");

        assertEq(lsp8Mintable.tokenOwnerOf(tokenId1), user1);
        assertEq(lsp8Mintable.tokenOwnerOf(tokenId2), user2);
        assertEq(lsp8Mintable.tokenOwnerOf(tokenId3), owner);
    }

    // ------ Fuzzing ------

    function testFuzz_OwnerCanMint(
        uint128 recipientSeed,
        uint256 tokenIdNum
    ) public {
        vm.assume(recipientSeed > 10); // Avoid precompile addresses
        vm.assume(tokenIdNum > 0);

        address recipient = vm.addr(uint256(recipientSeed));
        bytes32 tokenId = bytes32(tokenIdNum);
        lsp8Mintable.mint(recipient, tokenId, true, "");

        assertEq(lsp8Mintable.tokenOwnerOf(tokenId), recipient);
        assertEq(lsp8Mintable.balanceOf(recipient), 1);
    }

    function testFuzz_NonOwnerCannotMint(
        address attacker,
        address recipient,
        uint256 tokenIdNum
    ) public {
        vm.assume(attacker != owner);
        vm.assume(attacker != address(0));
        vm.assume(recipient != address(0));
        vm.assume(tokenIdNum > 0);

        bytes32 tokenId = bytes32(tokenIdNum);

        vm.prank(attacker);
        vm.expectRevert();
        lsp8Mintable.mint(recipient, tokenId, true, "");
    }

    function testFuzz_MintDisabledPreventsAllMints(uint8 mintCount) public {
        vm.assume(mintCount > 0 && mintCount <= 10);

        // Mint some tokens first
        for (uint256 i = 1; i <= mintCount; i++) {
            lsp8Mintable.mint(user1, bytes32(i), true, "");
        }

        uint256 supplyBefore = lsp8Mintable.totalSupply();

        // Disable minting
        lsp8Mintable.disableMinting();

        // Try to mint more
        vm.expectRevert(LSP8MintDisabled.selector);
        lsp8Mintable.mint(user1, bytes32(uint256(100)), true, "");

        assertEq(lsp8Mintable.totalSupply(), supplyBefore);
    }

    function testFuzz_MultipleMintsToSameRecipient(uint8 mintCount) public {
        vm.assume(mintCount > 0 && mintCount <= 100);

        for (uint256 i = 1; i <= mintCount; i++) {
            lsp8Mintable.mint(user1, bytes32(i), true, "");
        }

        assertEq(lsp8Mintable.balanceOf(user1), mintCount);
        assertEq(lsp8Mintable.totalSupply(), mintCount);
    }
}
