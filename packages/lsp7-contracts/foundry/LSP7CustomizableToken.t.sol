// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.22;

// foundry
import {Test} from "forge-std/Test.sol";

// modules
import {
    LSP7CustomizableToken,
    LSP7MintableParams,
    LSP7NonTransferableParams,
    LSP7CappedParams,
    LSP7RevokableParams
} from "../contracts/presets/LSP7CustomizableToken.sol";

// errors
import {
    AccessControlUnauthorizedAccount
} from "../contracts/extensions/AccessControlExtended/AccessControlExtendedErrors.sol";
import {
    LSP7MintDisabled
} from "../contracts/extensions/LSP7Mintable/LSP7MintableErrors.sol";
import {
    LSP7CappedBalanceExceeded
} from "../contracts/extensions/LSP7CappedBalance/LSP7CappedBalanceErrors.sol";
import {
    LSP7TransferDisabled,
    LSP7CannotUpdateTransferLockPeriod,
    LSP7TokenAlreadyTransferable,
    LSP7InvalidTransferLockPeriod
} from "../contracts/extensions/LSP7NonTransferable/LSP7NonTransferableErrors.sol";
import {
    LSP7CappedSupplyCannotMintOverCap
} from "../contracts/extensions/LSP7CappedSupply/LSP7CappedSupplyErrors.sol";
import {
    LSP7RevokableFeatureDisabled
} from "../contracts/extensions/LSP7Revokable/LSP7RevokableErrors.sol";

// constants
import {
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

contract LSP7CustomizableTokenTest is Test {
    string name = "Custom Token";
    string symbol = "CT";
    uint256 tokenType = _LSP4_TOKEN_TYPE_TOKEN;
    bool isNonDivisible = false;
    bool isMintable = true;
    bool isRevokable = true;
    uint256 initialMintAmount = 1000;
    uint256 transferLockStart = 0;
    uint256 transferLockEnd = 0;
    uint256 tokenBalanceCap = 2000;
    uint256 tokenSupplyCap = 5000;

    address owner = address(this);
    address nonOwner = vm.addr(100);
    address user1 = vm.addr(101);
    address user2 = vm.addr(102);
    address newOwner = vm.addr(103);
    address revoker1 = vm.addr(104);
    address revoker2 = vm.addr(105);
    address zeroAddress = address(0);

    LSP7CustomizableToken token;

    function setUp() public {
        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            isMintable: isMintable,
            initialMintAmount: initialMintAmount
        });

        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: tokenBalanceCap,
            tokenSupplyCap: tokenSupplyCap
        });

        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: transferLockStart,
                transferLockEnd: transferLockEnd
            });
        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: isRevokable
        });

        token = new LSP7CustomizableToken(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
        );
    }

    function _deployToken(
        bool isMintable_,
        uint256 initialMintAmount_,
        uint256 tokenBalanceCap_,
        uint256 tokenSupplyCap_,
        uint256 transferLockStart_,
        uint256 transferLockEnd_,
        bool isRevokable_
    ) internal returns (LSP7CustomizableToken deployedToken) {
        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            isMintable: isMintable_,
            initialMintAmount: initialMintAmount_
        });

        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: tokenBalanceCap_,
            tokenSupplyCap: tokenSupplyCap_
        });

        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: transferLockStart_,
                transferLockEnd: transferLockEnd_
            });

        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: isRevokable_
        });

        deployedToken = new LSP7CustomizableToken(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
        );
    }

    function _assertOwnerFeatureRoles(
        LSP7CustomizableToken deployedToken,
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

    // Constructor Tests
    function test_ConstructorInitializesCorrectly() public {
        assertEq(
            token.balanceOf(owner),
            initialMintAmount,
            "Owner should have initial tokens"
        );
        assertEq(
            token.totalSupply(),
            initialMintAmount,
            "Total supply should match initial mint"
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
            token.hasRole(token.DEFAULT_ADMIN_ROLE(), owner),
            "Owner should have DEFAULT_ADMIN_ROLE"
        );
        assertTrue(token.hasRole(token.MINTER_ROLE(), owner));
        assertTrue(token.hasRole(token.REVOKER_ROLE(), owner));
        assertTrue(token.hasRole(token.UNCAPPED_ROLE(), owner));
        assertTrue(token.hasRole(token.NON_TRANSFERABLE_BYPASS_ROLE(), owner));
    }

    function test_ConstructorAssignsOwnerRolesAcrossFeatureCombinations()
        public
    {
        _assertOwnerFeatureRoles({
            deployedToken: token,
            contractOwner: owner,
            shouldHaveRevokerRole: true
        });

        LSP7CustomizableToken nonRevokableToken = _deployToken({
            isMintable_: false,
            initialMintAmount_: 0,
            tokenBalanceCap_: 0,
            tokenSupplyCap_: 0,
            transferLockStart_: 0,
            transferLockEnd_: 0,
            isRevokable_: false
        });
        _assertOwnerFeatureRoles({
            deployedToken: nonRevokableToken,
            contractOwner: owner,
            shouldHaveRevokerRole: false
        });

        assertEq(
            nonRevokableToken.totalSupply(),
            0,
            "Total supply should be 0 when initialMintAmount_ is 0"
        );

        // -----
        uint256 lockStart = block.timestamp + 1 days;

        LSP7CustomizableToken lockedToken = _deployToken({
            isMintable_: true,
            initialMintAmount_: 0,
            tokenBalanceCap_: 0,
            tokenSupplyCap_: 0,
            transferLockStart_: lockStart,
            transferLockEnd_: 0,
            isRevokable_: true
        });
        _assertOwnerFeatureRoles({
            deployedToken: lockedToken,
            contractOwner: owner,
            shouldHaveRevokerRole: true
        });

        assertEq(
            lockedToken.totalSupply(),
            0,
            "Total supply should be 0 when initialMintAmount_ is 0"
        );

        assertTrue(lockedToken.isRevokable(), "Token should be revokable");
        assertEq(
            lockedToken.transferLockStart(),
            lockStart,
            "Transfer lock start should be set"
        );
        assertEq(
            lockedToken.transferLockEnd(),
            0,
            "Transfer lock end should be 0"
        );

        assertTrue(
            lockedToken.isTransferable(),
            "Token should be transferable before the lock starts"
        );
        assertTrue(
            lockedToken.transferLockEnabled(),
            "Transfer lock should stay enabled until makeTransferable is called"
        );

        vm.warp(lockStart + 1);
        assertFalse(lockedToken.isTransferable());
        assertTrue(lockedToken.transferLockEnabled());
    }

    function test_ConstructorRevertsIfInitialMintExceedsSupplyCap() public {
        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            isMintable: isMintable,
            initialMintAmount: tokenSupplyCap + 1
        });

        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: transferLockStart,
                transferLockEnd: transferLockEnd
            });

        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: tokenBalanceCap,
            tokenSupplyCap: tokenSupplyCap
        });
        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: isRevokable
        });

        vm.expectRevert(LSP7CappedSupplyCannotMintOverCap.selector);
        new LSP7CustomizableToken(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
        );
    }

    function test_ConstructorSucceedsWithZeroInitialMint() public {
        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            isMintable: isMintable,
            initialMintAmount: 0
        });

        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: transferLockStart,
                transferLockEnd: transferLockEnd
            });

        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: tokenBalanceCap,
            tokenSupplyCap: tokenSupplyCap
        });
        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: isRevokable
        });

        LSP7CustomizableToken zeroMintToken = new LSP7CustomizableToken(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
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
        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            isMintable: isMintable,
            initialMintAmount: initialMintAmount
        });

        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: 200,
                transferLockEnd: 100
            });

        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: tokenBalanceCap,
            tokenSupplyCap: tokenSupplyCap
        });
        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: isRevokable
        });

        vm.expectRevert(LSP7InvalidTransferLockPeriod.selector);
        new LSP7CustomizableToken(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
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
            initialMintAmount,
            "Should return totalSupply when not isMintable"
        );
    }

    function test_MintFailsWhenExceedingSupplyCap() public {
        token.mint(owner, tokenSupplyCap - initialMintAmount, true, "");
        assertEq(
            token.totalSupply(),
            tokenSupplyCap,
            "Total supply should reach cap"
        );

        vm.expectRevert(LSP7CappedSupplyCannotMintOverCap.selector);
        token.mint(owner, 1, true, "");
    }

    function test_MintSucceedsUpToSupplyCap() public {
        uint256 amount = tokenSupplyCap - initialMintAmount;
        token.mint(owner, amount, true, "");
        assertEq(
            token.totalSupply(),
            tokenSupplyCap,
            "Total supply should match cap"
        );
    }

    function test_MintWithMaxSupplyCapAllowsUnlimitedMinting() public {
        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            isMintable: isMintable,
            initialMintAmount: initialMintAmount
        });

        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: transferLockStart,
                transferLockEnd: transferLockEnd
            });

        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: tokenBalanceCap,
            tokenSupplyCap: 0
        });
        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: isRevokable
        });

        LSP7CustomizableToken unlimitedToken = new LSP7CustomizableToken(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
        );
        unlimitedToken.mint(owner, type(uint256).max / 2, true, "");
        assertEq(
            unlimitedToken.balanceOf(owner),
            type(uint256).max / 2 + initialMintAmount,
            "Should allow large mint"
        );
    }

    // Balance Cap Tests
    function test_BalanceCapEnforcedCorrectly() public {
        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            isMintable: isMintable,
            initialMintAmount: 2000
        });

        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: transferLockStart,
                transferLockEnd: transferLockEnd
            });

        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: 1500,
            tokenSupplyCap: 0
        });
        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: isRevokable
        });

        LSP7CustomizableToken tokenWithBalanceCap = new LSP7CustomizableToken(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
        );

        // Should be able to transfer up to the balance cap
        tokenWithBalanceCap.transfer(owner, user1, 1000, true, "");
        assertEq(tokenWithBalanceCap.balanceOf(user1), 1000);

        // Should fail when trying to exceed the balance cap
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7CappedBalanceExceeded.selector,
                user1,
                600,
                1000,
                1500
            )
        );
        tokenWithBalanceCap.transfer(owner, user1, 600, true, ""); // Would make total 1600 > 1500 cap
    }

    function test_BalanceCapDisabledWhenZero() public {
        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            isMintable: isMintable,
            initialMintAmount: 1000000
        });

        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: transferLockStart,
                transferLockEnd: transferLockEnd
            });

        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: 0, // tokenBalanceCap = 0 (disabled)
            tokenSupplyCap: 0 // tokenSupplyCap = 0 (disabled)
        });
        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: isRevokable
        });

        LSP7CustomizableToken tokenWithoutBalanceCap = new LSP7CustomizableToken(
                name,
                symbol,
                owner,
                tokenType,
                isNonDivisible,
                mintableParams,
                cappedParams,
                nonTransferableParams,
                revokableParams
            );

        // Should be able to transfer any amount when balance cap is disabled
        tokenWithoutBalanceCap.transfer(owner, user1, 1000000, true, "");
        assertEq(tokenWithoutBalanceCap.balanceOf(user1), 1000000);
    }

    // Minting Tests
    function test_OwnerCanMintToNonAllowlistedAddress() public {
        token.mint(user1, 500, true, "");
        assertEq(token.balanceOf(user1), 500, "User1 should have 500 tokens");
    }

    function test_MintFailsWhenDisabled() public {
        token.disableMinting();
        vm.expectRevert(LSP7MintDisabled.selector);
        token.mint(user1, 500, true, "");
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

    function test_TransferOwnershipClearsSpecificRoleAdminsOnMultiFeatureToken()
        public
    {
        bytes32 minterRole = token.MINTER_ROLE();
        bytes32 revokerRole = token.REVOKER_ROLE();
        bytes32 uncappedRole = token.UNCAPPED_ROLE();
        bytes32 nonTransferableBypassRole = token
            .NON_TRANSFERABLE_BYPASS_ROLE();

        bytes32 minterAdminRole = keccak256("MINTER_ADMIN_ROLE");
        bytes32 revokerAdminRole = keccak256("REVOKER_ADMIN_ROLE");
        bytes32 uncappedAdminRole = keccak256("UNCAPPED_ADMIN_ROLE");
        bytes32 nonTransferableBypassAdminRole = keccak256(
            "NON_TRANSFERABLE_BYPASS_ADMIN_ROLE"
        );

        token.setRoleAdmin(minterRole, minterAdminRole);
        token.setRoleAdmin(revokerRole, revokerAdminRole);
        token.setRoleAdmin(uncappedRole, uncappedAdminRole);
        token.setRoleAdmin(
            nonTransferableBypassRole,
            nonTransferableBypassAdminRole
        );

        address minterAdmin = makeAddr("a minter admin");
        address revokerAdmin = makeAddr("a revoker admin");
        address uncappedAdmin = makeAddr("a uncapped admin");
        address nonTransferableBypassAdmin = makeAddr(
            "a non transferable bypass admin"
        );

        assertEq(token.getRoleAdmin(minterRole), minterAdminRole);
        assertEq(token.getRoleAdmin(revokerRole), revokerAdminRole);
        assertEq(token.getRoleAdmin(uncappedRole), uncappedAdminRole);
        assertEq(
            token.getRoleAdmin(nonTransferableBypassRole),
            nonTransferableBypassAdminRole
        );

        token.grantRole(minterAdminRole, minterAdmin);
        token.grantRole(revokerAdminRole, revokerAdmin);
        token.grantRole(uncappedAdminRole, uncappedAdmin);
        token.grantRole(
            nonTransferableBypassAdminRole,
            nonTransferableBypassAdmin
        );

        assertTrue(token.hasRole(minterAdminRole, minterAdmin));
        assertTrue(token.hasRole(revokerAdminRole, revokerAdmin));
        assertTrue(token.hasRole(uncappedAdminRole, uncappedAdmin));
        assertTrue(
            token.hasRole(
                nonTransferableBypassAdminRole,
                nonTransferableBypassAdmin
            )
        );

        vm.prank(minterAdmin);
        token.grantRole(minterRole, address(11111));
        assertTrue(token.hasRole(minterRole, address(11111)));

        vm.prank(revokerAdmin);
        token.grantRole(revokerRole, address(22222));
        assertTrue(token.hasRole(revokerRole, address(22222)));

        vm.prank(uncappedAdmin);
        token.grantRole(uncappedRole, address(33333));
        assertTrue(token.hasRole(uncappedRole, address(33333)));

        vm.prank(nonTransferableBypassAdmin);
        token.grantRole(nonTransferableBypassRole, address(44444));
        assertTrue(token.hasRole(nonTransferableBypassRole, address(44444)));

        token.transferOwnership(newOwner);

        // CHECK specific admin role previously set was cleared
        assertEq(token.getRoleAdmin(minterRole), token.DEFAULT_ADMIN_ROLE());
        assertEq(token.getRoleAdmin(revokerRole), token.DEFAULT_ADMIN_ROLE());
        assertEq(token.getRoleAdmin(uncappedRole), token.DEFAULT_ADMIN_ROLE());
        assertEq(
            token.getRoleAdmin(nonTransferableBypassRole),
            token.DEFAULT_ADMIN_ROLE()
        );

        // The previous addresses should still have their former Admin roles
        assertTrue(token.hasRole(minterAdminRole, minterAdmin));
        assertTrue(token.hasRole(revokerAdminRole, revokerAdmin));
        assertTrue(token.hasRole(uncappedAdminRole, uncappedAdmin));
        assertTrue(
            token.hasRole(
                nonTransferableBypassAdminRole,
                nonTransferableBypassAdmin
            )
        );

        // But they shouldn't be able to use them, it MUST revert if they try to-reuse these admin roles
        // to grant roles, as all the admin roles for these roles have been reset to DEFAULT_ADMIN_ROLE
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                minterAdmin,
                token.DEFAULT_ADMIN_ROLE()
            )
        );
        vm.prank(minterAdmin);
        token.grantRole(minterRole, address(33333));

        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                revokerAdmin,
                token.DEFAULT_ADMIN_ROLE()
            )
        );
        vm.prank(revokerAdmin);
        token.grantRole(revokerRole, address(44444));

        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                uncappedAdmin,
                token.DEFAULT_ADMIN_ROLE()
            )
        );
        vm.prank(uncappedAdmin);
        token.grantRole(uncappedRole, address(55555));

        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                nonTransferableBypassAdmin,
                token.DEFAULT_ADMIN_ROLE()
            )
        );
        vm.prank(nonTransferableBypassAdmin);
        token.grantRole(nonTransferableBypassRole, address(66666));

        // The previous addresses should persist and still have the Minter + uncapped bypass and non transferable bypass roles
        assertTrue(token.hasRole(minterRole, address(11111)));
        assertTrue(token.hasRole(uncappedRole, address(33333)));
        assertTrue(token.hasRole(nonTransferableBypassRole, address(44444)));

        // only exception is addresses with revoker roles that are cleared
        assertFalse(token.hasRole(revokerRole, address(22222)));
    }

    function test_TransferDisabledWhenNonTransferable() public {
        LSP7CustomizableToken nonTransferableToken = _deployToken({
            isMintable_: true,
            initialMintAmount_: 0,
            tokenBalanceCap_: 0,
            tokenSupplyCap_: 0,
            transferLockStart_: 0,
            transferLockEnd_: type(uint256).max,
            isRevokable_: true
        });
        _assertOwnerFeatureRoles({
            deployedToken: nonTransferableToken,
            contractOwner: owner,
            shouldHaveRevokerRole: true
        });

        assertEq(nonTransferableToken.totalSupply(), 0);
        assertEq(nonTransferableToken.balanceOf(owner), 0);
        assertEq(nonTransferableToken.balanceOf(user1), 0);
        assertEq(nonTransferableToken.balanceOf(user2), 0);

        nonTransferableToken.mint(user1, 100, true, "");

        vm.prank(user1);
        vm.expectRevert(LSP7TransferDisabled.selector);
        nonTransferableToken.transfer(user1, user2, 10, true, "");
    }

    function test_IsTransferableMatchesBoundedLockWindow() public {
        uint256 lockStart = block.timestamp + 1 days;
        uint256 lockEnd = lockStart + 1 days;

        LSP7CustomizableToken lockedToken = _deployToken({
            isMintable_: true,
            initialMintAmount_: 0,
            tokenBalanceCap_: 0,
            tokenSupplyCap_: 0,
            transferLockStart_: lockStart,
            transferLockEnd_: lockEnd,
            isRevokable_: true
        });

        assertTrue(lockedToken.isTransferable());

        vm.warp(lockStart + 1);
        assertFalse(lockedToken.isTransferable());

        vm.warp(lockEnd + 1);
        assertTrue(lockedToken.isTransferable());
    }

    function test_MakeTransferableClearsLockAndPreventsFurtherLockUpdates()
        public
    {
        LSP7CustomizableToken lockedToken = _deployToken({
            isMintable_: true,
            initialMintAmount_: 0,
            tokenBalanceCap_: 0,
            tokenSupplyCap_: 0,
            transferLockStart_: 0,
            transferLockEnd_: type(uint256).max,
            isRevokable_: true
        });

        assertFalse(lockedToken.isTransferable());
        assertTrue(lockedToken.transferLockEnabled());

        lockedToken.makeTransferable();

        assertTrue(lockedToken.isTransferable());
        assertFalse(lockedToken.transferLockEnabled());
        assertEq(lockedToken.transferLockStart(), 0);
        assertEq(lockedToken.transferLockEnd(), 0);

        vm.expectRevert(LSP7TokenAlreadyTransferable.selector);
        lockedToken.makeTransferable();

        vm.expectRevert(LSP7CannotUpdateTransferLockPeriod.selector);
        lockedToken.updateTransferLockPeriod(1, 2);
    }

    // Fuzzing Tests
    function testFuzz_MintAmountRespectsBalanceCap(
        uint256 cap,
        uint256 currentBalance,
        uint256 mintAmount
    ) public {
        uint256 boundedCap = bound(cap, 1, type(uint128).max);
        uint256 boundedCurrentBalance = bound(currentBalance, 0, boundedCap);
        uint256 boundedMintAmount = bound(mintAmount, 1, type(uint128).max);

        LSP7CustomizableToken cappedToken = _deployToken({
            isMintable_: true,
            initialMintAmount_: 0,
            tokenBalanceCap_: boundedCap,
            tokenSupplyCap_: 0,
            transferLockStart_: 0,
            transferLockEnd_: 0,
            isRevokable_: true
        });

        if (boundedCurrentBalance > 0) {
            cappedToken.mint(user1, boundedCurrentBalance, true, "");
        }

        if (boundedCurrentBalance + boundedMintAmount > boundedCap) {
            vm.expectRevert(
                abi.encodeWithSelector(
                    LSP7CappedBalanceExceeded.selector,
                    user1,
                    boundedMintAmount,
                    boundedCurrentBalance,
                    boundedCap
                )
            );
            cappedToken.mint(user1, boundedMintAmount, true, "");

            assertEq(cappedToken.balanceOf(user1), boundedCurrentBalance);
            return;
        }

        cappedToken.mint(user1, boundedMintAmount, true, "");
        assertEq(
            cappedToken.balanceOf(user1),
            boundedCurrentBalance + boundedMintAmount
        );
    }

    function testFuzz_TransferAmountRespectsBalanceCap(
        uint256 cap,
        uint256 currentBalance,
        uint256 transferAmount
    ) public {
        uint256 boundedCap = bound(cap, 1, type(uint128).max);
        uint256 boundedCurrentBalance = bound(currentBalance, 0, boundedCap);
        uint256 boundedTransferAmount = bound(
            transferAmount,
            1,
            type(uint128).max
        );

        LSP7CustomizableToken cappedToken = _deployToken({
            isMintable_: true,
            initialMintAmount_: boundedCurrentBalance + boundedTransferAmount,
            tokenBalanceCap_: boundedCap,
            tokenSupplyCap_: 0,
            transferLockStart_: 0,
            transferLockEnd_: 0,
            isRevokable_: true
        });

        if (boundedCurrentBalance > 0) {
            cappedToken.transfer(owner, user1, boundedCurrentBalance, true, "");
        }

        if (boundedCurrentBalance + boundedTransferAmount > boundedCap) {
            vm.expectRevert(
                abi.encodeWithSelector(
                    LSP7CappedBalanceExceeded.selector,
                    user1,
                    boundedTransferAmount,
                    boundedCurrentBalance,
                    boundedCap
                )
            );
            cappedToken.transfer(owner, user1, boundedTransferAmount, true, "");

            assertEq(cappedToken.balanceOf(user1), boundedCurrentBalance);
            return;
        }

        cappedToken.transfer(owner, user1, boundedTransferAmount, true, "");
        assertEq(
            cappedToken.balanceOf(user1),
            boundedCurrentBalance + boundedTransferAmount
        );
    }

    function testFuzz_MintAmountRespectsSupplyCap(
        uint256 cap,
        uint256 amountToMint
    ) public {
        uint256 boundedCap = bound(cap, 1, type(uint128).max);
        uint256 boundedAmountToMint = bound(amountToMint, 1, type(uint128).max);

        LSP7CustomizableToken cappedToken = _deployToken({
            isMintable_: true,
            initialMintAmount_: 0,
            tokenBalanceCap_: 0,
            tokenSupplyCap_: boundedCap,
            transferLockStart_: 0,
            transferLockEnd_: 0,
            isRevokable_: true
        });

        if (boundedAmountToMint > boundedCap) {
            vm.expectRevert(LSP7CappedSupplyCannotMintOverCap.selector);
            cappedToken.mint(owner, boundedAmountToMint, true, "");

            assertEq(cappedToken.totalSupply(), 0);
            return;
        }

        cappedToken.mint(owner, boundedAmountToMint, true, "");
        assertEq(cappedToken.totalSupply(), boundedAmountToMint);
        assertEq(cappedToken.balanceOf(owner), boundedAmountToMint);
    }

    function test_RevokeFailsWhenRevocationIsDisabled() public {
        bytes32 revokerRole = token.REVOKER_ROLE();
        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            isMintable: isMintable,
            initialMintAmount: 1000
        });
        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: transferLockStart,
                transferLockEnd: transferLockEnd
            });
        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: tokenBalanceCap,
            tokenSupplyCap: tokenSupplyCap
        });
        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: false
        });

        LSP7CustomizableToken nonRevokableToken = new LSP7CustomizableToken(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
        );

        nonRevokableToken.transfer(owner, user1, 500, true, "");

        assertFalse(nonRevokableToken.isRevokable());
        assertFalse(nonRevokableToken.hasRole(revokerRole, owner));

        nonRevokableToken.grantRole(revokerRole, owner);

        vm.expectRevert(LSP7RevokableFeatureDisabled.selector);
        nonRevokableToken.revoke(user1, owner, 100, "");
    }
}
