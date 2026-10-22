// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

import {
    LSP7CustomizableTokenInit
} from "../contracts/presets/LSP7CustomizableTokenInit.sol";
import {
    LSP7MintableParams,
    LSP7NonTransferableParams,
    LSP7CappedParams,
    LSP7RevokableParams
} from "../contracts/presets/LSP7CustomizableTokenConstants.sol";
import {
    LSP7TransferDisabled
} from "../contracts/extensions/LSP7NonTransferable/LSP7NonTransferableErrors.sol";
import {
    LSP7CappedSupplyCannotMintOverCap
} from "../contracts/extensions/LSP7CappedSupply/LSP7CappedSupplyErrors.sol";
import {
    LSP7CappedBalanceExceeded
} from "../contracts/extensions/LSP7CappedBalance/LSP7CappedBalanceErrors.sol";
import {
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

contract LSP7CustomizableTokenInitTest is Test {
    address internal owner = address(this);
    address internal user1 = vm.addr(101);
    address internal user2 = vm.addr(102);
    address internal newOwner = vm.addr(103);
    address internal revoker1 = vm.addr(104);
    address internal revoker2 = vm.addr(105);

    function test_InitImplementationCannotBeInitializedAfterDeployment()
        public
    {
        LSP7CustomizableTokenInit implementation = new LSP7CustomizableTokenInit();

        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            isMintable: true,
            initialMintAmount: 1_000
        });
        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: 0,
                transferLockEnd: 0
            });
        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: 2_000,
            tokenSupplyCap: 5_000
        });
        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: true
        });

        vm.expectRevert("Initializable: contract is already initialized");
        implementation.initialize(
            "Custom Token",
            "CT",
            address(this),
            _LSP4_TOKEN_TYPE_TOKEN,
            false,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
        );
    }

    function test_InitializeNonMintableInitialMintOverSupplyCapReverts(
        uint256 supplyCap,
        uint256 preMintAmount
    ) public {
        vm.assume(supplyCap > 0);
        vm.assume(preMintAmount > supplyCap);

        LSP7CustomizableTokenInit implementation = new LSP7CustomizableTokenInit();
        address instance = Clones.clone(address(implementation));
        LSP7CustomizableTokenInit token = LSP7CustomizableTokenInit(
            payable(instance)
        );

        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            isMintable: false,
            initialMintAmount: preMintAmount
        });

        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: 0,
            tokenSupplyCap: supplyCap
        });

        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: 0,
                transferLockEnd: 0
            });

        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: false
        });

        vm.expectRevert(LSP7CappedSupplyCannotMintOverCap.selector);
        token.initialize(
            "Custom Token",
            "CT",
            owner,
            _LSP4_TOKEN_TYPE_TOKEN,
            false,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
        );
    }

    function _deployClone(
        LSP7MintableParams memory mintableParams,
        LSP7NonTransferableParams memory nonTransferableParams,
        LSP7CappedParams memory cappedParams,
        LSP7RevokableParams memory revokableParams
    ) internal returns (LSP7CustomizableTokenInit token) {
        LSP7CustomizableTokenInit implementation = new LSP7CustomizableTokenInit();
        address instance = Clones.clone(address(implementation));
        token = LSP7CustomizableTokenInit(payable(instance));
        token.initialize(
            "Custom Token",
            "CT",
            owner,
            _LSP4_TOKEN_TYPE_TOKEN,
            false,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
        );
    }

    function test_InitializeRevertsIfInitialMintExceedsSupplyCap() public {
        uint256 supplyCap = 5_000;

        LSP7CustomizableTokenInit implementation = new LSP7CustomizableTokenInit();
        address instance = Clones.clone(address(implementation));
        LSP7CustomizableTokenInit token = LSP7CustomizableTokenInit(
            payable(instance)
        );

        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            isMintable: true,
            initialMintAmount: supplyCap + 1
        });
        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: 2_000,
            tokenSupplyCap: supplyCap
        });
        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: 0,
                transferLockEnd: 0
            });

        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: true
        });

        vm.expectRevert(LSP7CappedSupplyCannotMintOverCap.selector);
        token.initialize(
            "Custom Token",
            "CT",
            owner,
            _LSP4_TOKEN_TYPE_TOKEN,
            false,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
        );
    }

    function test_InitializeNonMintableTokenButPreMintTokens() public {
        uint256 preMintAmount = 1_000_000;

        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            isMintable: false,
            initialMintAmount: preMintAmount
        });

        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: 0,
            tokenSupplyCap: 0
        });

        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: 0,
                transferLockEnd: 0
            });

        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: false
        });

        LSP7CustomizableTokenInit nonMintableToken = _deployClone(
            mintableParams,
            nonTransferableParams,
            cappedParams,
            revokableParams
        );

        assertEq(nonMintableToken.balanceOf(owner), preMintAmount);
        assertEq(nonMintableToken.totalSupply(), preMintAmount);
        assertFalse(nonMintableToken.isMintable());
    }

    function test_CloneInitializeMintsToOwnerAndTransferWorksWhenUnlocked()
        public
    {
        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            isMintable: true,
            initialMintAmount: 500
        });
        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: 0,
                transferLockEnd: 0
            });
        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: 0,
            tokenSupplyCap: 0
        });
        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: true
        });

        LSP7CustomizableTokenInit token = _deployClone(
            mintableParams,
            nonTransferableParams,
            cappedParams,
            revokableParams
        );

        assertEq(token.balanceOf(owner), 500);
        assertTrue(token.isTransferable());

        token.transfer(owner, user1, 100, true, "");
        assertEq(token.balanceOf(user1), 100);
    }

    function test_TransferDisabledWhenNonTransferableViaEip1167Clone() public {
        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            isMintable: true,
            initialMintAmount: 0
        });
        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: 0,
                transferLockEnd: type(uint256).max
            });
        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: 0,
            tokenSupplyCap: 0
        });
        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: true
        });

        LSP7CustomizableTokenInit token = _deployClone(
            mintableParams,
            nonTransferableParams,
            cappedParams,
            revokableParams
        );

        token.mint(user1, 100, true, "");

        vm.prank(user1);
        vm.expectRevert(LSP7TransferDisabled.selector);
        token.transfer(user1, user2, 10, true, "");
    }

    function test_TransferRevertsDuringBoundedLockWindowViaEip1167Clone()
        public
    {
        uint256 lockStart = block.timestamp + 1 days;
        uint256 lockEnd = lockStart + 1 days;

        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            isMintable: true,
            initialMintAmount: 0
        });
        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: lockStart,
                transferLockEnd: lockEnd
            });
        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: 0,
            tokenSupplyCap: 0
        });
        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: true
        });

        LSP7CustomizableTokenInit token = _deployClone(
            mintableParams,
            nonTransferableParams,
            cappedParams,
            revokableParams
        );

        token.mint(user1, 50, true, "");
        assertTrue(token.isTransferable());

        vm.warp(lockStart + 1);
        assertFalse(token.isTransferable());

        vm.prank(user1);
        vm.expectRevert(LSP7TransferDisabled.selector);
        token.transfer(user1, user2, 10, true, "");

        vm.warp(lockEnd + 1);
        assertTrue(token.isTransferable());

        vm.prank(user1);
        token.transfer(user1, user2, 10, true, "");
        assertEq(token.balanceOf(user2), 10);
    }

    function test_RevokerCannotTransferDuringTransferLockWithoutBypassRoleViaEip1167Clone()
        public
    {
        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            isMintable: true,
            initialMintAmount: 0
        });
        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: 0,
                transferLockEnd: type(uint256).max
            });
        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: 0,
            tokenSupplyCap: 0
        });
        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: true
        });

        LSP7CustomizableTokenInit token = _deployClone(
            mintableParams,
            nonTransferableParams,
            cappedParams,
            revokableParams
        );

        token.grantRole(token.REVOKER_ROLE(), revoker1);
        token.mint(revoker1, 100, true, "");

        vm.prank(revoker1);
        vm.expectRevert(LSP7TransferDisabled.selector);
        token.transfer(revoker1, user2, 10, true, "");

        token.grantRole(token.NON_TRANSFERABLE_BYPASS_ROLE(), revoker1);

        vm.prank(revoker1);
        token.transfer(revoker1, user2, 10, true, "");

        assertEq(token.balanceOf(revoker1), 90);
        assertEq(token.balanceOf(user2), 10);
    }

    function test_RevokeToOwnerBypassesBalanceCapWhenOwnerLostUncappedRoleViaEip1167Clone()
        public
    {
        uint256 cap = 100;
        uint256 revokeAmount = 40;

        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            isMintable: true,
            initialMintAmount: 0
        });
        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: cap,
            tokenSupplyCap: 0
        });
        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: 0,
                transferLockEnd: 0
            });
        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: true
        });

        LSP7CustomizableTokenInit token = _deployClone(
            mintableParams,
            nonTransferableParams,
            cappedParams,
            revokableParams
        );

        token.mint(owner, cap, true, "");
        token.mint(user1, revokeAmount, true, "");
        token.grantRole(token.REVOKER_ROLE(), revoker1);
        token.revokeRole(token.UNCAPPED_BALANCE_ROLE(), owner);

        assertFalse(token.hasRole(token.UNCAPPED_BALANCE_ROLE(), owner));

        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7CappedBalanceExceeded.selector,
                owner,
                revokeAmount,
                cap,
                cap
            )
        );
        vm.prank(user1);
        token.transfer(user1, owner, revokeAmount, true, "");

        vm.prank(revoker1);
        token.revoke(user1, owner, revokeAmount, "");

        assertEq(token.balanceOf(owner), cap + revokeAmount);
        assertEq(token.balanceOf(user1), 0);
    }

    function test_RevokeToRevokerBypassesBalanceCapWhenRevokerHasNoUncappedRoleViaEip1167Clone()
        public
    {
        uint256 cap = 100;
        uint256 revokeAmount = 40;

        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            isMintable: true,
            initialMintAmount: 0
        });
        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: cap,
            tokenSupplyCap: 0
        });
        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: 0,
                transferLockEnd: 0
            });
        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: true
        });

        LSP7CustomizableTokenInit token = _deployClone(
            mintableParams,
            nonTransferableParams,
            cappedParams,
            revokableParams
        );

        token.grantRole(token.REVOKER_ROLE(), revoker1);
        token.mint(revoker1, cap, true, "");
        token.mint(user1, revokeAmount, true, "");

        assertFalse(token.hasRole(token.UNCAPPED_BALANCE_ROLE(), revoker1));

        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7CappedBalanceExceeded.selector,
                revoker1,
                revokeAmount,
                cap,
                cap
            )
        );
        vm.prank(user1);
        token.transfer(user1, revoker1, revokeAmount, true, "");

        vm.prank(revoker1);
        token.revoke(user1, revoker1, revokeAmount, "");

        assertEq(token.balanceOf(revoker1), cap + revokeAmount);
        assertEq(token.balanceOf(user1), 0);
    }

    function test_TransferOwnershipClearsRevokersAndMigratesOwnerRolesViaEip1167Clone()
        public
    {
        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            isMintable: true,
            initialMintAmount: 1_000
        });
        LSP7CappedParams memory cappedParams = LSP7CappedParams({
            tokenBalanceCap: 2_000,
            tokenSupplyCap: 5_000
        });
        LSP7NonTransferableParams
            memory nonTransferableParams = LSP7NonTransferableParams({
                transferLockStart: 0,
                transferLockEnd: 0
            });
        LSP7RevokableParams memory revokableParams = LSP7RevokableParams({
            isRevokable: true
        });

        LSP7CustomizableTokenInit token = _deployClone(
            mintableParams,
            nonTransferableParams,
            cappedParams,
            revokableParams
        );

        bytes32 revokerRole = token.REVOKER_ROLE();

        assertTrue(token.hasRole(revokerRole, owner));

        token.grantRole(revokerRole, revoker1);
        token.grantRole(revokerRole, revoker2);

        // Owner is granted the REVOKER_ROLE on initialize, so we expect 3 holders
        assertEq(token.getRoleMemberCount(revokerRole), 3);

        token.transferOwnership(newOwner);

        // CHECK new owner was passed the REVOKER_ROLE
        assertEq(token.owner(), newOwner);
        assertTrue(token.hasRole(revokerRole, newOwner));
        assertEq(token.getRoleMemberCount(revokerRole), 1);

        assertFalse(token.hasRole(revokerRole, owner));
        assertFalse(token.hasRole(revokerRole, revoker1));
        assertFalse(token.hasRole(revokerRole, revoker2));

        assertFalse(token.hasRole(token.DEFAULT_ADMIN_ROLE(), owner));
        assertFalse(token.hasRole(token.MINTER_ROLE(), owner));
        assertFalse(token.hasRole(token.UNCAPPED_BALANCE_ROLE(), owner));
        assertFalse(token.hasRole(token.NON_TRANSFERABLE_BYPASS_ROLE(), owner));

        assertTrue(token.hasRole(token.DEFAULT_ADMIN_ROLE(), newOwner));
        assertTrue(token.hasRole(token.MINTER_ROLE(), newOwner));
        assertTrue(token.hasRole(token.UNCAPPED_BALANCE_ROLE(), newOwner));
        assertTrue(
            token.hasRole(token.NON_TRANSFERABLE_BYPASS_ROLE(), newOwner)
        );
    }
}
