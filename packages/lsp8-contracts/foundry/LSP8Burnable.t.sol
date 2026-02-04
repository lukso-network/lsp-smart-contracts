// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// foundry
import "forge-std/Test.sol";

// modules
import {LSP8Burnable} from "../contracts/extensions/LSP8Burnable.sol";
import {LSP8IdentifiableDigitalAsset} from "../contracts/LSP8IdentifiableDigitalAsset.sol";

// errors
import {LSP8NotTokenOperator, LSP8NonExistentTokenId} from "../contracts/LSP8Errors.sol";

// constants
import {_LSP4_TOKEN_TYPE_NFT} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {_LSP8_TOKENID_FORMAT_NUMBER} from "../contracts/LSP8Constants.sol";

// Mock contract to test LSP8Burnable functionality
contract MockLSP8Burnable is LSP8Burnable {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_
    ) LSP8IdentifiableDigitalAsset(name_, symbol_, newOwner_, lsp4TokenType_, lsp8TokenIdFormat_) {}

    // Helper function to mint tokens for testing
    function mint(address to, bytes32 tokenId, bool force, bytes memory data) public {
        _mint(to, tokenId, force, data);
    }
}

contract LSP8BurnableTest is Test {
    string name = "Test NFT";
    string symbol = "TNFT";
    uint256 tokenType = _LSP4_TOKEN_TYPE_NFT;
    uint256 tokenIdFormat = _LSP8_TOKENID_FORMAT_NUMBER;

    address owner = address(this);
    address nonOwner = vm.addr(100);
    address user1 = vm.addr(101);
    address user2 = vm.addr(102);
    address operator = vm.addr(103);

    bytes32 tokenId1 = bytes32(uint256(1));
    bytes32 tokenId2 = bytes32(uint256(2));
    bytes32 tokenId3 = bytes32(uint256(3));
    bytes32 nonExistentTokenId = bytes32(uint256(999));

    MockLSP8Burnable lsp8Burnable;

    function setUp() public {
        lsp8Burnable = new MockLSP8Burnable(name, symbol, owner, tokenType, tokenIdFormat);

        // Mint some tokens for testing
        lsp8Burnable.mint(owner, tokenId1, true, "");
        lsp8Burnable.mint(user1, tokenId2, true, "");
        lsp8Burnable.mint(user2, tokenId3, true, "");
    }

    // Test owner can burn their own tokens
    function test_OwnerCanBurnOwnToken() public {
        assertEq(lsp8Burnable.balanceOf(owner), 1);
        assertEq(lsp8Burnable.totalSupply(), 3);

        lsp8Burnable.burn(tokenId1, "");

        assertEq(lsp8Burnable.balanceOf(owner), 0);
        assertEq(lsp8Burnable.totalSupply(), 2);
    }

    function test_UserCanBurnOwnToken() public {
        assertEq(lsp8Burnable.balanceOf(user1), 1);
        assertEq(lsp8Burnable.totalSupply(), 3);

        vm.prank(user1);
        lsp8Burnable.burn(tokenId2, "");

        assertEq(lsp8Burnable.balanceOf(user1), 0);
        assertEq(lsp8Burnable.totalSupply(), 2);
    }

    // Test operator can burn tokens they have allowance for
    function test_OperatorCanBurnToken() public {
        // User1 authorizes operator
        vm.prank(user1);
        lsp8Burnable.authorizeOperator(operator, tokenId2, "");

        assertEq(lsp8Burnable.balanceOf(user1), 1);

        // Operator burns the token
        vm.prank(operator);
        lsp8Burnable.burn(tokenId2, "");

        assertEq(lsp8Burnable.balanceOf(user1), 0);
        assertEq(lsp8Burnable.totalSupply(), 2);
    }

    // Test non-operator cannot burn
    function test_NonOperatorCannotBurn() public {
        vm.prank(nonOwner);
        vm.expectRevert(abi.encodeWithSelector(LSP8NotTokenOperator.selector, tokenId1, nonOwner));
        lsp8Burnable.burn(tokenId1, "");

        // Token should still exist
        assertEq(lsp8Burnable.balanceOf(owner), 1);
    }

    function test_UserCannotBurnOtherUsersToken() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(LSP8NotTokenOperator.selector, tokenId1, user1));
        lsp8Burnable.burn(tokenId1, "");

        assertEq(lsp8Burnable.balanceOf(owner), 1);
    }

    // Test burning non-existent token fails
    function test_BurningNonExistentTokenFails() public {
        vm.expectRevert(abi.encodeWithSelector(LSP8NonExistentTokenId.selector, nonExistentTokenId));
        lsp8Burnable.burn(nonExistentTokenId, "");
    }

    // Test supply decreases after burn
    function test_SupplyDecreasesAfterBurn() public {
        assertEq(lsp8Burnable.totalSupply(), 3);

        lsp8Burnable.burn(tokenId1, "");
        assertEq(lsp8Burnable.totalSupply(), 2);

        vm.prank(user1);
        lsp8Burnable.burn(tokenId2, "");
        assertEq(lsp8Burnable.totalSupply(), 1);

        vm.prank(user2);
        lsp8Burnable.burn(tokenId3, "");
        assertEq(lsp8Burnable.totalSupply(), 0);
    }

    // Test balance decreases after burn
    function test_BalanceDecreasesAfterBurn() public {
        // Mint additional token to user1
        lsp8Burnable.mint(user1, bytes32(uint256(10)), true, "");
        assertEq(lsp8Burnable.balanceOf(user1), 2);

        vm.prank(user1);
        lsp8Burnable.burn(tokenId2, "");
        assertEq(lsp8Burnable.balanceOf(user1), 1);

        vm.prank(user1);
        lsp8Burnable.burn(bytes32(uint256(10)), "");
        assertEq(lsp8Burnable.balanceOf(user1), 0);
    }

    // Test burn with data
    function test_BurnWithData() public {
        bytes memory data = abi.encode("burn data");
        lsp8Burnable.burn(tokenId1, data);

        assertEq(lsp8Burnable.balanceOf(owner), 0);
    }

    // Test burning same token twice fails
    function test_BurningSameTokenTwiceFails() public {
        lsp8Burnable.burn(tokenId1, "");

        vm.expectRevert(abi.encodeWithSelector(LSP8NonExistentTokenId.selector, tokenId1));
        lsp8Burnable.burn(tokenId1, "");
    }

    // ------ Fuzzing ------

    function testFuzz_BurnOwnToken(uint256 tokenIdNum) public {
        vm.assume(tokenIdNum > 100); // Avoid collision with existing tokens
        bytes32 tokenId = bytes32(tokenIdNum);

        lsp8Burnable.mint(user1, tokenId, true, "");
        uint256 balanceBefore = lsp8Burnable.balanceOf(user1);
        uint256 supplyBefore = lsp8Burnable.totalSupply();

        vm.prank(user1);
        lsp8Burnable.burn(tokenId, "");

        assertEq(lsp8Burnable.balanceOf(user1), balanceBefore - 1);
        assertEq(lsp8Burnable.totalSupply(), supplyBefore - 1);
    }

    function testFuzz_NonOwnerCannotBurn(address attacker, uint256 tokenIdNum) public {
        vm.assume(tokenIdNum > 100);
        vm.assume(attacker != user1);
        vm.assume(attacker != address(0));

        bytes32 tokenId = bytes32(tokenIdNum);
        lsp8Burnable.mint(user1, tokenId, true, "");

        vm.prank(attacker);
        vm.expectRevert(abi.encodeWithSelector(LSP8NotTokenOperator.selector, tokenId, attacker));
        lsp8Burnable.burn(tokenId, "");

        // Token should still exist
        assertEq(lsp8Burnable.tokenOwnerOf(tokenId), user1);
    }
}
