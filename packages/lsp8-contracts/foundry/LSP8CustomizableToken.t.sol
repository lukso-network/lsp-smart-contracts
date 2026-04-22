// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// foundry
import {Test} from "forge-std/Test.sol";

// modules
import {
    LSP8CustomizableToken,
    LSP8MintableParams,
    LSP8NonTransferableParams,
    LSP8CappedParams,
    LSP8RevokableParams
} from "../contracts/presets/LSP8CustomizableToken.sol";

// errors
import {
    AccessControlUnauthorizedAccount
} from "../contracts/extensions/AccessControlExtended/AccessControlExtendedErrors.sol";
import {
    LSP8MintDisabled
} from "../contracts/extensions/LSP8Mintable/LSP8MintableErrors.sol";
import {
    LSP8CappedBalanceExceeded
} from "../contracts/extensions/LSP8CappedBalance/LSP8CappedBalanceErrors.sol";
import {
    LSP8TransferDisabled,
    LSP8CannotUpdateTransferLockPeriod,
    LSP8TokenAlreadyTransferable,
    LSP8InvalidTransferLockPeriod
} from "../contracts/extensions/LSP8NonTransferable/LSP8NonTransferableErrors.sol";
import {
    LSP8CappedSupplyCannotMintOverCap
} from "../contracts/extensions/LSP8CappedSupply/LSP8CappedSupplyErrors.sol";
import {
    LSP8RevokableFeatureDisabled
} from "../contracts/extensions/LSP8Revokable/LSP8RevokableErrors.sol";

// constants
import {
    _LSP4_TOKEN_TYPE_NFT
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

contract LSP8CustomizableTokenTest is Test {
    string name = "Custom NFT";
    string symbol = "CNFT";
    uint256 tokenType = _LSP4_TOKEN_TYPE_NFT;
    uint256 tokenIdFormat = 0; // NUMBER format
    bool isMintable = true;
    bool isRevokable = true;
    uint256 transferLockStart = 0;
    uint256 transferLockEnd = 0;
    uint256 tokenBalanceCap = 5; // Max 5 NFTs per address
    uint256 tokenSupplyCap = 100; // Max 100 total NFTs

    address owner = address(this);
    address nonOwner = vm.addr(100);
    address user1 = vm.addr(101);
    address user2 = vm.addr(102);
    address newOwner = vm.addr(103);
    address revoker1 = vm.addr(104);
    address revoker2 = vm.addr(105);
    address zeroAddress = address(0);

    bytes32 constant MINTER_ROLE =
        0x4d494e5445525f524f4c45000000000000000000000000000000000000000000;
    bytes32 constant NON_TRANSFERABLE_BYPASS_ROLE =
        0x4e4f4e5f5452414e5346455241424c455f4259504153535f524f4c4500000000;
    bytes32 constant UNCAPPED_ROLE =
        0x554e4341505045445f524f4c4500000000000000000000000000000000000000;

    // Initial token IDs to mint
    bytes32[] initialTokenIds;

    LSP8CustomizableToken token;

    function setUp() public {
        // Prepare initial token IDs
        initialTokenIds = new bytes32[](3);
        initialTokenIds[0] = bytes32(uint256(1));
        initialTokenIds[1] = bytes32(uint256(2));
        initialTokenIds[2] = bytes32(uint256(3));

        LSP8MintableParams memory mintableParams = LSP8MintableParams({
            isMintable: isMintable,
            initialMintTokenIds: initialTokenIds
        });

        LSP8NonTransferableParams
            memory nonTransferableParams = LSP8NonTransferableParams({
                transferLockStart: transferLockStart,
                transferLockEnd: transferLockEnd
            });

        LSP8CappedParams memory cappedParams = LSP8CappedParams({
            tokenBalanceCap: tokenBalanceCap,
            tokenSupplyCap: tokenSupplyCap
        });
        LSP8RevokableParams memory revokableParams = LSP8RevokableParams({
            isRevokable: isRevokable
        });

        token = new LSP8CustomizableToken(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
        );
    }

    function _deployToken(
        bool mintable_,
        bytes32[] memory initialTokenIds_,
        uint256 tokenBalanceCap_,
        uint256 tokenSupplyCap_,
        uint256 transferLockStart_,
        uint256 transferLockEnd_,
        bool revokable_
    ) internal returns (LSP8CustomizableToken deployedToken) {
        LSP8MintableParams memory mintableParams = LSP8MintableParams({
            isMintable: mintable_,
            initialMintTokenIds: initialTokenIds_
        });

        LSP8NonTransferableParams
            memory nonTransferableParams = LSP8NonTransferableParams({
                transferLockStart: transferLockStart_,
                transferLockEnd: transferLockEnd_
            });

        LSP8CappedParams memory cappedParams = LSP8CappedParams({
            tokenBalanceCap: tokenBalanceCap_,
            tokenSupplyCap: tokenSupplyCap_
        });

        LSP8RevokableParams memory revokableParams = LSP8RevokableParams({
            isRevokable: revokable_
        });

        deployedToken = new LSP8CustomizableToken(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
        );
    }

    function _assertOwnerFeatureRoles(
        LSP8CustomizableToken deployedToken,
        address contractOwner,
        bool shouldHaveRevokerRole
    ) internal {
        assertTrue(
            deployedToken.hasRole(
                deployedToken.DEFAULT_ADMIN_ROLE(),
                contractOwner
            )
        );
        assertTrue(
            deployedToken.hasRole(deployedToken.MINTER_ROLE(), contractOwner)
        );
        assertTrue(
            deployedToken.hasRole(deployedToken.UNCAPPED_ROLE(), contractOwner)
        );
        assertTrue(
            deployedToken.hasRole(
                deployedToken.NON_TRANSFERABLE_BYPASS_ROLE(),
                contractOwner
            )
        );

        if (shouldHaveRevokerRole) {
            assertTrue(
                deployedToken.hasRole(
                    deployedToken.REVOKER_ROLE(),
                    contractOwner
                )
            );
        } else {
            assertFalse(
                deployedToken.hasRole(
                    deployedToken.REVOKER_ROLE(),
                    contractOwner
                )
            );
        }
    }

    function _mintTokenIds(
        LSP8CustomizableToken deployedToken,
        address to,
        uint256 startTokenId,
        uint256 count
    ) internal {
        for (uint256 i = 0; i < count; i++) {
            deployedToken.mint(to, bytes32(startTokenId + i), true, "");
        }
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
        assertEq(
            token.isMintable(),
            isMintable,
            "Mintable status should be set"
        );
        assertTrue(token.isRevokable(), "Revokable status should be set");
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
        assertTrue(
            token.hasRole(MINTER_ROLE, owner),
            "Owner should have MINTER_ROLE"
        );
        assertTrue(
            token.hasRole(token.DEFAULT_ADMIN_ROLE(), owner),
            "Owner should have DEFAULT_ADMIN_ROLE"
        );
        assertTrue(
            token.hasRole(token.REVOKER_ROLE(), owner),
            "Owner should have REVOKER_ROLE"
        );
        assertTrue(
            token.hasRole(NON_TRANSFERABLE_BYPASS_ROLE, owner),
            "Owner should have bypass role"
        );
        assertTrue(
            token.hasRole(UNCAPPED_ROLE, owner),
            "Owner should have UNCAPPED_ROLE"
        );
    }

    function test_ConstructorAssignsOwnerRolesAcrossFeatureCombinations()
        public
    {
        _assertOwnerFeatureRoles(token, owner, true);

        bytes32[] memory emptyTokenIds = new bytes32[](0);
        LSP8CustomizableToken nonRevokableToken = _deployToken({
            mintable_: false,
            initialTokenIds_: emptyTokenIds,
            tokenBalanceCap_: 0,
            tokenSupplyCap_: 0,
            transferLockStart_: 0,
            transferLockEnd_: 0,
            revokable_: false
        });
        _assertOwnerFeatureRoles({
            deployedToken: nonRevokableToken,
            contractOwner: owner,
            shouldHaveRevokerRole: false
        });

        assertEq(
            nonRevokableToken.totalSupply(),
            0,
            "Total supply should be 0 since we passed an empty array of token IDs"
        );

        LSP8CustomizableToken lockedToken = _deployToken({
            mintable_: true,
            initialTokenIds_: emptyTokenIds,
            tokenBalanceCap_: 0,
            tokenSupplyCap_: 0,
            transferLockStart_: block.timestamp + 1 days,
            transferLockEnd_: 0,
            revokable_: true
        });
        _assertOwnerFeatureRoles(lockedToken, owner, true);
    }

    function test_ConstructorRevertsIfInitialMintExceedsSupplyCap() public {
        // Create more token IDs than the supply cap allows
        bytes32[] memory tooManyTokenIds = new bytes32[](101);
        for (uint256 i = 0; i < 101; i++) {
            tooManyTokenIds[i] = bytes32(uint256(i + 1));
        }

        LSP8MintableParams memory mintableParams = LSP8MintableParams({
            isMintable: isMintable,
            initialMintTokenIds: tooManyTokenIds
        });

        LSP8NonTransferableParams
            memory nonTransferableParams = LSP8NonTransferableParams({
                transferLockStart: transferLockStart,
                transferLockEnd: transferLockEnd
            });

        LSP8CappedParams memory cappedParams = LSP8CappedParams({
            tokenBalanceCap: tokenBalanceCap,
            tokenSupplyCap: tokenSupplyCap
        });
        LSP8RevokableParams memory revokableParams = LSP8RevokableParams({
            isRevokable: isRevokable
        });

        vm.expectRevert(LSP8CappedSupplyCannotMintOverCap.selector);
        new LSP8CustomizableToken(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
        );
    }

    function test_ConstructorSucceedsWithZeroInitialMint() public {
        bytes32[] memory emptyTokenIds = new bytes32[](0);
        LSP8MintableParams memory mintableParams = LSP8MintableParams({
            isMintable: isMintable,
            initialMintTokenIds: emptyTokenIds
        });

        LSP8NonTransferableParams
            memory nonTransferableParams = LSP8NonTransferableParams({
                transferLockStart: transferLockStart,
                transferLockEnd: transferLockEnd
            });

        LSP8CappedParams memory cappedParams = LSP8CappedParams({
            tokenBalanceCap: tokenBalanceCap,
            tokenSupplyCap: tokenSupplyCap
        });
        LSP8RevokableParams memory revokableParams = LSP8RevokableParams({
            isRevokable: isRevokable
        });

        LSP8CustomizableToken zeroMintToken = new LSP8CustomizableToken(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
        );
        assertEq(
            zeroMintToken.balanceOf(owner),
            0,
            "Owner should have no tokens"
        );
        assertEq(zeroMintToken.totalSupply(), 0, "Total supply should be zero");
    }

    function test_ConstructorRevertsWithInvalidLockPeriod() public {
        LSP8MintableParams memory mintableParams = LSP8MintableParams({
            isMintable: isMintable,
            initialMintTokenIds: initialTokenIds
        });
        LSP8NonTransferableParams
            memory nonTransferableParams = LSP8NonTransferableParams({
                transferLockStart: 200,
                transferLockEnd: 100 // End before start - invalid
            });

        LSP8CappedParams memory cappedParams = LSP8CappedParams({
            tokenBalanceCap: tokenBalanceCap,
            tokenSupplyCap: tokenSupplyCap
        });
        LSP8RevokableParams memory revokableParams = LSP8RevokableParams({
            isRevokable: isRevokable
        });

        vm.expectRevert(LSP8InvalidTransferLockPeriod.selector);
        new LSP8CustomizableToken(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
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
        LSP8MintableParams memory mintableParams = LSP8MintableParams({
            isMintable: isMintable,
            initialMintTokenIds: emptyTokenIds
        });

        LSP8NonTransferableParams
            memory nonTransferableParams = LSP8NonTransferableParams({
                transferLockStart: transferLockStart,
                transferLockEnd: transferLockEnd
            });

        // Both caps disabled
        LSP8CappedParams memory cappedParams = LSP8CappedParams({
            tokenBalanceCap: 0,
            tokenSupplyCap: 0
        });
        LSP8RevokableParams memory revokableParams = LSP8RevokableParams({
            isRevokable: isRevokable
        });

        LSP8CustomizableToken unlimitedToken = new LSP8CustomizableToken(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
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
        LSP8MintableParams memory mintableParams = LSP8MintableParams({
            isMintable: isMintable,
            initialMintTokenIds: emptyTokenIds
        });

        LSP8NonTransferableParams
            memory nonTransferableParams = LSP8NonTransferableParams({
                transferLockStart: transferLockStart,
                transferLockEnd: transferLockEnd
            });

        LSP8CappedParams memory cappedParams = LSP8CappedParams({
            tokenBalanceCap: 0, // tokenBalanceCap = 0 (disabled)
            tokenSupplyCap: 0 // tokenSupplyCap = 0 (disabled)
        });
        LSP8RevokableParams memory revokableParams = LSP8RevokableParams({
            isRevokable: isRevokable
        });

        LSP8CustomizableToken tokenWithoutBalanceCap = new LSP8CustomizableToken(
                name,
                symbol,
                owner,
                tokenType,
                tokenIdFormat,
                mintableParams,
                cappedParams,
                nonTransferableParams,
                revokableParams
            );

        // Should be able to hold many NFTs when balance cap is disabled
        for (uint256 i = 1; i <= 100; i++) {
            tokenWithoutBalanceCap.mint(user1, bytes32(uint256(i)), true, "");
        }
        assertEq(tokenWithoutBalanceCap.balanceOf(user1), 100);
    }

    // Minting Tests
    function test_OwnerCanMintToRegularAddress() public {
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
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                nonOwner,
                MINTER_ROLE
            )
        );
        token.mint(user1, bytes32(uint256(100)), true, "");
    }

    // Transfer Tests
    function test_TransferDisabledWhenNonTransferable() public {
        bytes32[] memory emptyTokenIds = new bytes32[](0);
        LSP8MintableParams memory mintableParams = LSP8MintableParams({
            isMintable: isMintable,
            initialMintTokenIds: emptyTokenIds
        });

        LSP8NonTransferableParams
            memory nonTransferableParams = LSP8NonTransferableParams({
                transferLockStart: 0,
                transferLockEnd: type(uint256).max // non-transferable
            });

        LSP8CappedParams memory cappedParams = LSP8CappedParams({
            tokenBalanceCap: 0, // tokenBalanceCap = 0 (disabled)
            tokenSupplyCap: 0 // tokenSupplyCap = 0 (disabled)
        });
        LSP8RevokableParams memory revokableParams = LSP8RevokableParams({
            isRevokable: isRevokable
        });

        LSP8CustomizableToken nonTransferableToken = new LSP8CustomizableToken(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
        );

        // Mint a token to user1 (no bypass role)
        nonTransferableToken.mint(user1, bytes32(uint256(1)), true, "");

        // user1 trying to transfer should fail
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

    function test_BypassRoleCanTransferWhenNonTransferable() public {
        bytes32[] memory emptyTokenIds = new bytes32[](0);
        LSP8MintableParams memory mintableParams = LSP8MintableParams({
            isMintable: isMintable,
            initialMintTokenIds: emptyTokenIds
        });

        // ALWAYS non-transferable
        LSP8NonTransferableParams
            memory nonTransferableParams = LSP8NonTransferableParams({
                transferLockStart: 0,
                transferLockEnd: type(uint256).max
            });

        LSP8CappedParams memory cappedParams = LSP8CappedParams({
            tokenBalanceCap: 0, // tokenBalanceCap = 0 (disabled)
            tokenSupplyCap: 0 // tokenSupplyCap = 0 (disabled)
        });
        LSP8RevokableParams memory revokableParams = LSP8RevokableParams({
            isRevokable: isRevokable
        });

        LSP8CustomizableToken nonTransferableToken = new LSP8CustomizableToken(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
        );

        // Mint a token to owner (has bypass role)
        nonTransferableToken.mint(owner, bytes32(uint256(1)), true, "");

        // Owner should be able to transfer
        nonTransferableToken.transfer(
            owner,
            user1,
            bytes32(uint256(1)),
            true,
            ""
        );
        assertEq(nonTransferableToken.balanceOf(user1), 1);

        // user1 should NOT be able to transfer
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
        LSP8MintableParams memory mintableParams = LSP8MintableParams({
            isMintable: isMintable,
            initialMintTokenIds: emptyTokenIds
        });

        // ALWAYS non-transferable
        LSP8NonTransferableParams
            memory nonTransferableParams = LSP8NonTransferableParams({
                transferLockStart: 0,
                transferLockEnd: type(uint256).max
            });

        LSP8CappedParams memory cappedParams = LSP8CappedParams({
            tokenBalanceCap: 0, // tokenBalanceCap = 0 (disabled)
            tokenSupplyCap: 0 // tokenSupplyCap = 0 (disabled)
        });
        LSP8RevokableParams memory revokableParams = LSP8RevokableParams({
            isRevokable: isRevokable
        });

        LSP8CustomizableToken nonTransferableToken = new LSP8CustomizableToken(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
        );

        // Mint a token
        nonTransferableToken.mint(user1, bytes32(uint256(1)), true, "");
        assertEq(nonTransferableToken.balanceOf(user1), 1);

        // Burning should still work
        vm.prank(user1);
        nonTransferableToken.burn(bytes32(uint256(1)), "");
        assertEq(nonTransferableToken.balanceOf(user1), 0);
    }

    // Role-based exemption tests
    function test_GrantNonTransferableBypassRole() public {
        assertFalse(token.hasRole(NON_TRANSFERABLE_BYPASS_ROLE, user1));
        token.grantRole(NON_TRANSFERABLE_BYPASS_ROLE, user1);
        assertTrue(token.hasRole(NON_TRANSFERABLE_BYPASS_ROLE, user1));
    }

    function test_RevokeNonTransferableBypassRole() public {
        token.grantRole(NON_TRANSFERABLE_BYPASS_ROLE, user1);
        assertTrue(token.hasRole(NON_TRANSFERABLE_BYPASS_ROLE, user1));
        token.revokeRole(NON_TRANSFERABLE_BYPASS_ROLE, user1);
        assertFalse(token.hasRole(NON_TRANSFERABLE_BYPASS_ROLE, user1));
    }

    function test_UncappedRoleBypassesBalanceCap() public {
        token.grantRole(UNCAPPED_ROLE, user1);

        // Mint many NFTs directly to user1 (beyond the cap)
        for (uint256 i = 100; i <= 110; i++) {
            token.mint(user1, bytes32(uint256(i)), true, "");
        }

        // user1 should have 11 NFTs, exceeding the cap of 5
        assertEq(token.balanceOf(user1), 11);
    }

    function test_TransferOwnershipClearsRevokersAndMigratesOwnerRoles()
        public
    {
        bytes32 revokerRole = token.REVOKER_ROLE();

        token.grantRole(revokerRole, revoker1);
        token.grantRole(revokerRole, revoker2);
        token.grantRole(revokerRole, newOwner);

        assertEq(token.getRoleMemberCount(revokerRole), 4);

        token.transferOwnership(newOwner);

        assertEq(token.owner(), newOwner);
        assertEq(token.getRoleMemberCount(revokerRole), 0);

        assertFalse(token.hasRole(revokerRole, owner));
        assertFalse(token.hasRole(revokerRole, newOwner));
        assertFalse(token.hasRole(revokerRole, revoker1));
        assertFalse(token.hasRole(revokerRole, revoker2));

        assertFalse(token.hasRole(token.DEFAULT_ADMIN_ROLE(), owner));
        assertFalse(token.hasRole(token.MINTER_ROLE(), owner));
        assertFalse(token.hasRole(token.UNCAPPED_ROLE(), owner));
        assertFalse(token.hasRole(token.NON_TRANSFERABLE_BYPASS_ROLE(), owner));

        assertTrue(token.hasRole(token.DEFAULT_ADMIN_ROLE(), newOwner));
        assertTrue(token.hasRole(token.MINTER_ROLE(), newOwner));
        assertTrue(token.hasRole(token.UNCAPPED_ROLE(), newOwner));
        assertTrue(
            token.hasRole(token.NON_TRANSFERABLE_BYPASS_ROLE(), newOwner)
        );
    }

    function test_IsTransferableMatchesBoundedLockWindow() public {
        bytes32[] memory emptyTokenIds = new bytes32[](0);
        uint256 lockStart = block.timestamp + 1 days;
        uint256 lockEnd = lockStart + 1 days;

        LSP8CustomizableToken lockedToken = _deployToken({
            mintable_: true,
            initialTokenIds_: emptyTokenIds,
            tokenBalanceCap_: 0,
            tokenSupplyCap_: 0,
            transferLockStart_: lockStart,
            transferLockEnd_: lockEnd,
            revokable_: true
        });
        _assertOwnerFeatureRoles({
            deployedToken: lockedToken,
            contractOwner: owner,
            shouldHaveRevokerRole: true
        });

        assertEq(
            lockedToken.totalSupply(),
            0,
            "Total supply should be 0 when initialTokenIds_ is empty"
        );

        assertTrue(lockedToken.isTransferable());

        vm.warp(lockStart + 1);
        assertFalse(lockedToken.isTransferable());

        vm.warp(lockEnd + 1);
        assertTrue(lockedToken.isTransferable());
    }

    function test_MakeTransferableClearsLockAndPreventsFurtherLockUpdates()
        public
    {
        bytes32[] memory emptyTokenIds = new bytes32[](0);

        LSP8CustomizableToken lockedToken = _deployToken({
            mintable_: true,
            initialTokenIds_: emptyTokenIds,
            tokenBalanceCap_: 0,
            tokenSupplyCap_: 0,
            transferLockStart_: 0,
            transferLockEnd_: type(uint256).max,
            revokable_: true
        });

        assertFalse(lockedToken.isTransferable());

        lockedToken.makeTransferable();

        assertTrue(lockedToken.isTransferable());
        assertEq(lockedToken.transferLockStart(), 0);
        assertEq(lockedToken.transferLockEnd(), 0);

        vm.expectRevert(LSP8TokenAlreadyTransferable.selector);
        lockedToken.makeTransferable();

        vm.expectRevert(LSP8CannotUpdateTransferLockPeriod.selector);
        lockedToken.updateTransferLockPeriod(1, 2);
    }

    // Fuzzing Tests
    function testFuzz_MintAmountRespectsBalanceCap(
        uint8 cap,
        uint8 currentBalance,
        uint8 mintAmount
    ) public {
        uint256 boundedCap = bound(uint256(cap), 1, 50);
        uint256 boundedCurrentBalance = bound(
            uint256(currentBalance),
            0,
            boundedCap
        );
        uint256 boundedMintAmount = bound(uint256(mintAmount), 1, 50);
        bytes32[] memory emptyTokenIds = new bytes32[](0);

        LSP8CustomizableToken cappedToken = _deployToken({
            mintable_: true,
            initialTokenIds_: emptyTokenIds,
            tokenBalanceCap_: boundedCap,
            tokenSupplyCap_: 0,
            transferLockStart_: 0,
            transferLockEnd_: 0,
            revokable_: true
        });

        _mintTokenIds(cappedToken, user1, 1, boundedCurrentBalance);

        uint256 availableCapacity = boundedCap - boundedCurrentBalance;

        if (boundedMintAmount > availableCapacity) {
            _mintTokenIds(cappedToken, user1, 1_000, availableCapacity);

            vm.expectRevert(
                abi.encodeWithSelector(
                    LSP8CappedBalanceExceeded.selector,
                    user1,
                    boundedCap,
                    boundedCap
                )
            );
            cappedToken.mint(
                user1,
                bytes32(1_000 + availableCapacity),
                true,
                ""
            );

            assertEq(cappedToken.balanceOf(user1), boundedCap);
            return;
        }

        _mintTokenIds(cappedToken, user1, 1_000, boundedMintAmount);
        assertEq(
            cappedToken.balanceOf(user1),
            boundedCurrentBalance + boundedMintAmount
        );
    }

    function testFuzz_TransferAmountRespectsBalanceCap(
        uint8 cap,
        uint8 currentBalance,
        uint8 transferAmount
    ) public {
        uint256 boundedCap = bound(uint256(cap), 1, 50);
        uint256 boundedCurrentBalance = bound(
            uint256(currentBalance),
            0,
            boundedCap
        );
        uint256 boundedTransferAmount = bound(uint256(transferAmount), 1, 50);
        bytes32[] memory emptyTokenIds = new bytes32[](0);

        LSP8CustomizableToken cappedToken = _deployToken({
            mintable_: true,
            initialTokenIds_: emptyTokenIds,
            tokenBalanceCap_: boundedCap,
            tokenSupplyCap_: 0,
            transferLockStart_: 0,
            transferLockEnd_: 0,
            revokable_: true
        });

        _mintTokenIds(cappedToken, user1, 1, boundedCurrentBalance);
        _mintTokenIds(cappedToken, owner, 10_000, boundedTransferAmount);

        uint256 availableCapacity = boundedCap - boundedCurrentBalance;

        if (boundedTransferAmount > availableCapacity) {
            for (uint256 i = 0; i < availableCapacity; i++) {
                cappedToken.transfer(
                    owner,
                    user1,
                    bytes32(10_000 + i),
                    true,
                    ""
                );
            }

            vm.expectRevert(
                abi.encodeWithSelector(
                    LSP8CappedBalanceExceeded.selector,
                    user1,
                    boundedCap,
                    boundedCap
                )
            );
            cappedToken.transfer(
                owner,
                user1,
                bytes32(10_000 + availableCapacity),
                true,
                ""
            );

            assertEq(cappedToken.balanceOf(user1), boundedCap);
            return;
        }

        for (uint256 i = 0; i < boundedTransferAmount; i++) {
            cappedToken.transfer(owner, user1, bytes32(10_000 + i), true, "");
        }

        assertEq(
            cappedToken.balanceOf(user1),
            boundedCurrentBalance + boundedTransferAmount
        );
    }

    function testFuzz_MintAmountRespectsSupplyCap(
        uint8 cap,
        uint8 amountToMint
    ) public {
        uint256 boundedCap = bound(uint256(cap), 1, 100);
        uint256 boundedAmountToMint = bound(uint256(amountToMint), 1, 150);
        bytes32[] memory emptyTokenIds = new bytes32[](0);

        LSP8CustomizableToken cappedToken = _deployToken({
            mintable_: true,
            initialTokenIds_: emptyTokenIds,
            tokenBalanceCap_: 0,
            tokenSupplyCap_: boundedCap,
            transferLockStart_: 0,
            transferLockEnd_: 0,
            revokable_: true
        });

        if (boundedAmountToMint > boundedCap) {
            _mintTokenIds(cappedToken, owner, 1, boundedCap);

            vm.expectRevert(LSP8CappedSupplyCannotMintOverCap.selector);
            cappedToken.mint(owner, bytes32(boundedCap + 1), true, "");

            assertEq(cappedToken.totalSupply(), boundedCap);
            return;
        }

        _mintTokenIds(cappedToken, owner, 1, boundedAmountToMint);
        assertEq(cappedToken.totalSupply(), boundedAmountToMint);
        assertEq(cappedToken.balanceOf(owner), boundedAmountToMint);
    }

    function test_ConstructorInitializesCorrectlyWithSomeTokenIds() public {
        bytes32[] memory someTokenIds = new bytes32[](3);
        someTokenIds[
            0
        ] = 0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa;
        someTokenIds[
            1
        ] = 0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb;
        someTokenIds[
            2
        ] = 0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc;

        LSP8CustomizableToken customToken = _deployToken({
            mintable_: true,
            initialTokenIds_: someTokenIds,
            tokenBalanceCap_: 0,
            tokenSupplyCap_: 0,
            transferLockStart_: 0,
            transferLockEnd_: 0,
            revokable_: true
        });
        _assertOwnerFeatureRoles({
            deployedToken: customToken,
            contractOwner: owner,
            shouldHaveRevokerRole: true
        });

        assertEq(customToken.totalSupply(), 3);
        assertEq(customToken.balanceOf(owner), 3);
        assertEq(customToken.tokenOwnerOf(someTokenIds[0]), owner);
        assertEq(customToken.tokenOwnerOf(someTokenIds[1]), owner);
        assertEq(customToken.tokenOwnerOf(someTokenIds[2]), owner);
    }

    function test_RevokeFailsWhenRevocationIsDisabled() public {
        bytes32 revokerRole = token.REVOKER_ROLE();
        bytes32[] memory emptyTokenIds = new bytes32[](0);
        LSP8MintableParams memory mintableParams = LSP8MintableParams({
            isMintable: isMintable,
            initialMintTokenIds: emptyTokenIds
        });
        LSP8NonTransferableParams
            memory nonTransferableParams = LSP8NonTransferableParams({
                transferLockStart: transferLockStart,
                transferLockEnd: transferLockEnd
            });

        LSP8CappedParams memory cappedParams = LSP8CappedParams({
            tokenBalanceCap: tokenBalanceCap,
            tokenSupplyCap: tokenSupplyCap
        });
        LSP8RevokableParams memory revokableParams = LSP8RevokableParams({
            isRevokable: false
        });

        LSP8CustomizableToken nonRevokableToken = new LSP8CustomizableToken(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
        );

        nonRevokableToken.mint(user1, bytes32(uint256(999)), true, "");

        assertFalse(nonRevokableToken.isRevokable());
        assertFalse(nonRevokableToken.hasRole(revokerRole, owner));

        nonRevokableToken.grantRole(revokerRole, owner);

        vm.expectRevert(LSP8RevokableFeatureDisabled.selector);
        nonRevokableToken.revoke(user1, owner, bytes32(uint256(999)), "");
    }
}
