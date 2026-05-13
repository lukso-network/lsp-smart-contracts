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
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

contract LSP7CustomizableTokenInitTest is Test {
    address internal owner = address(this);
    address internal user1 = vm.addr(101);
    address internal user2 = vm.addr(102);
    address internal revoker1 = vm.addr(104);

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
            nonTransferableParams,
            cappedParams,
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
            nonTransferableParams,
            cappedParams,
            revokableParams
        );
    }

    function test_InitializeNonMintableTokenButPreMintTokens() public {
        uint256 preMintAmount = 1_000_000;

        LSP7MintableParams memory mintableParams = LSP7MintableParams({
            isMintable: false,
            initialMintAmount: preMintAmount
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
}
