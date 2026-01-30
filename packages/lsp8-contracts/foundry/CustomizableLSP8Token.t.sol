// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// foundry
import "forge-std/Test.sol";

// modules
import {
    CustomizableLSP8Token,
    MintableParams,
    NonTransferableParams,
    CappedParams
} from "../contracts/CustomizableLSP8Token.sol";

// errors
import {LSP8MintDisabled} from "../contracts/extensions/LSP8Mintable/LSP8MintableErrors.sol";
import {LSP8CappedBalanceExceeded} from "../contracts/extensions/LSP8CappedBalance/LSP8CappedBalanceErrors.sol";
import {
    LSP8TransferDisabled,
    LSP8InvalidTransferLockPeriod
} from "../contracts/extensions/LSP8NonTransferable/LSP8NonTransferableErrors.sol";
import {LSP8CappedSupplyCannotMintOverCap} from "../contracts/extensions/LSP8CappedSupply/LSP8CappedSupplyErrors.sol";

// constants
import {_LSP4_TOKEN_TYPE_NFT} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

contract CustomizableLSP8TokenTest is Test {
    string name = "Custom NFT";
    string symbol = "CNFT";
    uint256 tokenType = _LSP4_TOKEN_TYPE_NFT;
    uint256 tokenIdFormat = 0; // NUMBER format
    bool mintable = true;
    bool transferable = true;
    uint256 transferLockStart = 0;
    uint256 transferLockEnd = 0;
    uint256 tokenBalanceCap = 5; // Max 5 NFTs per address
    uint256 tokenSupplyCap = 100; // Max 100 total NFTs

    address owner = address(this);
    address nonOwner = vm.addr(100);
    address user1 = vm.addr(101);
    address user2 = vm.addr(102);
    address zeroAddress = address(0);

    // Initial token IDs to mint
    bytes32[] initialTokenIds;

    CustomizableLSP8Token token;

    function setUp() public {
        // Prepare initial token IDs
        initialTokenIds = new bytes32[](3);
        initialTokenIds[0] = bytes32(uint256(1));
        initialTokenIds[1] = bytes32(uint256(2));
        initialTokenIds[2] = bytes32(uint256(3));

        MintableParams memory mintableParams = MintableParams(
            mintable,
            initialTokenIds
        );

        NonTransferableParams
            memory nonTransferableParams = NonTransferableParams(
                transferable,
                transferLockStart,
                transferLockEnd
            );

        CappedParams memory cappedParams = CappedParams(
            tokenBalanceCap,
            tokenSupplyCap
        );

        token = new CustomizableLSP8Token(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            mintableParams,
            nonTransferableParams,
            cappedParams
        );
    }

    // Constructor Tests
    function test_ConstructorInitializesCorrectly() public {
        assertEq(
            token.balanceOf(owner),
            3,
            "Owner should have 3 initial tokens"
        );
        assertEq(
            token.totalSupply(),
            3,
            "Total supply should match initial mint count"
        );
        assertEq(
            token.tokenBalanceCap(),
            tokenBalanceCap,
            "Balance cap should be set"
        );
        assertEq(token.isMintable(), mintable, "Mintable status should be set");
        assertTrue(token.isTransferable(), "Token should be transferable");
        assertEq(
            token.transferLockStart(),
            transferLockStart,
            "Lock start should be set"
        );
        assertEq(
            token.transferLockEnd(),
            transferLockEnd,
            "Lock end should be set"
        );
        assertEq(
            token.tokenSupplyCap(),
            tokenSupplyCap,
            "Supply cap should be set"
        );
        assertTrue(token.isAllowlisted(owner), "Owner should be allowlisted");
        assertTrue(
            token.isAllowlisted(zeroAddress),
            "Zero address should be allowlisted"
        );
    }

    function test_ConstructorRevertsIfInitialMintExceedsSupplyCap() public {
        // Create more token IDs than the supply cap allows
        bytes32[] memory tooManyTokenIds = new bytes32[](101);
        for (uint256 i = 0; i < 101; i++) {
            tooManyTokenIds[i] = bytes32(uint256(i + 1));
        }

        MintableParams memory mintableParams = MintableParams(
            mintable,
            tooManyTokenIds
        );

        NonTransferableParams
            memory nonTransferableParams = NonTransferableParams(
                transferable,
                transferLockStart,
                transferLockEnd
            );

        CappedParams memory cappedParams = CappedParams(
            tokenBalanceCap,
            tokenSupplyCap
        );

        vm.expectRevert(LSP8CappedSupplyCannotMintOverCap.selector);
        new CustomizableLSP8Token(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            mintableParams,
            nonTransferableParams,
            cappedParams
        );
    }

    function test_ConstructorSucceedsWithZeroInitialMint() public {
        bytes32[] memory emptyTokenIds = new bytes32[](0);
        MintableParams memory mintableParams = MintableParams(
            mintable,
            emptyTokenIds
        );

        NonTransferableParams
            memory nonTransferableParams = NonTransferableParams(
                transferable,
                transferLockStart,
                transferLockEnd
            );

        CappedParams memory cappedParams = CappedParams(
            tokenBalanceCap,
            tokenSupplyCap
        );

        CustomizableLSP8Token zeroMintToken = new CustomizableLSP8Token(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            mintableParams,
            nonTransferableParams,
            cappedParams
        );
        assertEq(
            zeroMintToken.balanceOf(owner),
            0,
            "Owner should have no tokens"
        );
        assertEq(zeroMintToken.totalSupply(), 0, "Total supply should be zero");
    }

    function test_ConstructorRevertsWithInvalidLockPeriod() public {
        MintableParams memory mintableParams = MintableParams(
            mintable,
            initialTokenIds
        );

        NonTransferableParams
            memory nonTransferableParams = NonTransferableParams(
                transferable,
                200,
                100 // End before start - invalid
            );

        CappedParams memory cappedParams = CappedParams(
            tokenBalanceCap,
            tokenSupplyCap
        );

        vm.expectRevert(LSP8InvalidTransferLockPeriod.selector);
        new CustomizableLSP8Token(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            mintableParams,
            nonTransferableParams,
            cappedParams
        );
    }

    // Supply Cap Tests
    function test_TokenSupplyCapReturnsCorrectValue() public {
        assertEq(
            token.tokenSupplyCap(),
            tokenSupplyCap,
            "Should return supply cap when isMintable"
        );
        token.disableMinting();
        assertEq(
            token.tokenSupplyCap(),
            3, // Initial mint count
            "Should return totalSupply when not isMintable"
        );
    }

    function test_MintFailsWhenExceedingSupplyCap() public {
        // Mint up to the cap
        for (uint256 i = 4; i <= tokenSupplyCap; i++) {
            token.mint(owner, bytes32(uint256(i)), true, "");
        }
        assertEq(
            token.totalSupply(),
            tokenSupplyCap,
            "Total supply should reach cap"
        );

        vm.expectRevert(LSP8CappedSupplyCannotMintOverCap.selector);
        token.mint(owner, bytes32(uint256(tokenSupplyCap + 1)), true, "");
    }

    function test_MintSucceedsUpToSupplyCap() public {
        // Mint up to the cap
        for (uint256 i = 4; i <= tokenSupplyCap; i++) {
            token.mint(owner, bytes32(uint256(i)), true, "");
        }
        assertEq(
            token.totalSupply(),
            tokenSupplyCap,
            "Total supply should match cap"
        );
    }

    function test_MintWithMaxSupplyCapAllowsUnlimitedMinting() public {
        bytes32[] memory emptyTokenIds = new bytes32[](0);
        MintableParams memory mintableParams = MintableParams(
            mintable,
            emptyTokenIds
        );

        NonTransferableParams
            memory nonTransferableParams = NonTransferableParams(
                transferable,
                transferLockStart,
                transferLockEnd
            );

        CappedParams memory cappedParams = CappedParams(0, 0); // Both caps disabled

        CustomizableLSP8Token unlimitedToken = new CustomizableLSP8Token(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            mintableParams,
            nonTransferableParams,
            cappedParams
        );

        // Should be able to mint many tokens
        for (uint256 i = 1; i <= 1000; i++) {
            unlimitedToken.mint(owner, bytes32(uint256(i)), true, "");
        }
        assertEq(
            unlimitedToken.totalSupply(),
            1000,
            "Should allow minting many tokens"
        );
    }

    // Balance Cap Tests
    function test_BalanceCapEnforcedCorrectly() public {
        // Transfer 3 NFTs to user1 (should work)
        token.transfer(owner, user1, bytes32(uint256(1)), true, "");
        token.transfer(owner, user1, bytes32(uint256(2)), true, "");
        token.transfer(owner, user1, bytes32(uint256(3)), true, "");
        assertEq(token.balanceOf(user1), 3);

        // Mint 2 more NFTs and transfer to user1
        token.mint(owner, bytes32(uint256(4)), true, "");
        token.mint(owner, bytes32(uint256(5)), true, "");
        token.transfer(owner, user1, bytes32(uint256(4)), true, "");
        token.transfer(owner, user1, bytes32(uint256(5)), true, "");
        assertEq(
            token.balanceOf(user1),
            5,
            "User1 should have 5 NFTs (at cap)"
        );

        // Mint one more and try to transfer - should fail
        token.mint(owner, bytes32(uint256(6)), true, "");
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP8CappedBalanceExceeded.selector,
                user1,
                5, // current balance
                tokenBalanceCap // cap
            )
        );
        token.transfer(owner, user1, bytes32(uint256(6)), true, "");
    }

    function test_BalanceCapDisabledWhenZero() public {
        bytes32[] memory emptyTokenIds = new bytes32[](0);
        MintableParams memory mintableParams = MintableParams(
            mintable,
            emptyTokenIds
        );

        NonTransferableParams
            memory nonTransferableParams = NonTransferableParams(
                transferable,
                transferLockStart,
                transferLockEnd
            );

        CappedParams memory cappedParams = CappedParams(
            0, // tokenBalanceCap = 0 (disabled)
            0 // tokenSupplyCap = 0 (disabled)
        );

        CustomizableLSP8Token tokenWithoutBalanceCap = new CustomizableLSP8Token(
                name,
                symbol,
                owner,
                tokenType,
                tokenIdFormat,
                mintableParams,
                nonTransferableParams,
                cappedParams
            );

        // Should be able to hold many NFTs when balance cap is disabled
        for (uint256 i = 1; i <= 100; i++) {
            tokenWithoutBalanceCap.mint(user1, bytes32(uint256(i)), true, "");
        }
        assertEq(tokenWithoutBalanceCap.balanceOf(user1), 100);
    }

    // Minting Tests
    function test_OwnerCanMintToNonAllowlistedAddress() public {
        assertFalse(
            token.isAllowlisted(user1),
            "User1 should not be allowlisted"
        );
        token.mint(user1, bytes32(uint256(100)), true, "");
        assertEq(token.balanceOf(user1), 1, "User1 should have 1 token");
        assertEq(
            token.tokenOwnerOf(bytes32(uint256(100))),
            user1,
            "User1 should own token 100"
        );
    }

    function test_MintFailsWhenDisabled() public {
        token.disableMinting();
        vm.expectRevert(LSP8MintDisabled.selector);
        token.mint(user1, bytes32(uint256(100)), true, "");
    }

    function test_NonOwnerCannotMint() public {
        vm.prank(nonOwner);
        vm.expectRevert();
        token.mint(user1, bytes32(uint256(100)), true, "");
    }

    // Transfer Tests
    function test_TransferDisabledWhenNonTransferable() public {
        bytes32[] memory emptyTokenIds = new bytes32[](0);
        MintableParams memory mintableParams = MintableParams(
            mintable,
            emptyTokenIds
        );

        NonTransferableParams
            memory nonTransferableParams = NonTransferableParams(
                false, // non-transferable
                0,
                0
            );

        CappedParams memory cappedParams = CappedParams(0, 0);

        CustomizableLSP8Token nonTransferableToken = new CustomizableLSP8Token(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            mintableParams,
            nonTransferableParams,
            cappedParams
        );

        // Mint a token to user1 (not allowlisted)
        nonTransferableToken.mint(user1, bytes32(uint256(1)), true, "");

        // user1 (not allowlisted) trying to transfer should fail
        vm.prank(user1);
        vm.expectRevert(LSP8TransferDisabled.selector);
        nonTransferableToken.transfer(
            user1,
            user2,
            bytes32(uint256(1)),
            true,
            ""
        );
    }

    function test_AllowlistedCanTransferWhenNonTransferable() public {
        bytes32[] memory emptyTokenIds = new bytes32[](0);
        MintableParams memory mintableParams = MintableParams(
            mintable,
            emptyTokenIds
        );

        NonTransferableParams
            memory nonTransferableParams = NonTransferableParams(
                false, // non-transferable
                0,
                0
            );

        CappedParams memory cappedParams = CappedParams(0, 0);

        CustomizableLSP8Token nonTransferableToken = new CustomizableLSP8Token(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            mintableParams,
            nonTransferableParams,
            cappedParams
        );

        // Mint a token to owner (allowlisted)
        nonTransferableToken.mint(owner, bytes32(uint256(1)), true, "");

        // Owner (allowlisted) should be able to transfer
        nonTransferableToken.transfer(
            owner,
            user1,
            bytes32(uint256(1)),
            true,
            ""
        );
        assertEq(nonTransferableToken.balanceOf(user1), 1);

        // user1 (not allowlisted) should NOT be able to transfer
        vm.prank(user1);
        vm.expectRevert(LSP8TransferDisabled.selector);
        nonTransferableToken.transfer(
            user1,
            user2,
            bytes32(uint256(1)),
            true,
            ""
        );
    }

    // Burning Tests
    function test_BurningAllowedWhenNonTransferable() public {
        bytes32[] memory emptyTokenIds = new bytes32[](0);
        MintableParams memory mintableParams = MintableParams(
            mintable,
            emptyTokenIds
        );

        NonTransferableParams
            memory nonTransferableParams = NonTransferableParams(
                false, // non-transferable
                0,
                0
            );

        CappedParams memory cappedParams = CappedParams(0, 0);

        CustomizableLSP8Token nonTransferableToken = new CustomizableLSP8Token(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            mintableParams,
            nonTransferableParams,
            cappedParams
        );

        // Mint a token
        nonTransferableToken.mint(user1, bytes32(uint256(1)), true, "");
        assertEq(nonTransferableToken.balanceOf(user1), 1);

        // Burning should still work
        vm.prank(user1);
        nonTransferableToken.burn(bytes32(uint256(1)), "");
        assertEq(nonTransferableToken.balanceOf(user1), 0);
    }

    // Allowlist Tests
    function test_AddToAllowlist() public {
        assertFalse(token.isAllowlisted(user1));
        token.addToAllowlist(user1);
        assertTrue(token.isAllowlisted(user1));
    }

    function test_RemoveFromAllowlist() public {
        token.addToAllowlist(user1);
        assertTrue(token.isAllowlisted(user1));
        token.removeFromAllowlist(user1);
        assertFalse(token.isAllowlisted(user1));
    }

    function test_AllowlistedBypassesBalanceCap() public {
        // Add user1 to allowlist
        token.addToAllowlist(user1);

        // Mint many NFTs directly to user1 (beyond the cap)
        for (uint256 i = 100; i <= 110; i++) {
            token.mint(user1, bytes32(uint256(i)), true, "");
        }

        // user1 should have 11 NFTs, exceeding the cap of 5
        assertEq(token.balanceOf(user1), 11);
    }
}
