// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

import {
    LSP8CustomizableTokenInit
} from "../contracts/presets/LSP8CustomizableTokenInit.sol";
import {
    LSP8MintableParams,
    LSP8NonTransferableParams,
    LSP8CappedParams,
    LSP8RevokableParams
} from "../contracts/presets/LSP8CustomizableTokenConstants.sol";
import {LSP8TransferDisabled} from "../contracts/extensions/LSP8NonTransferable/LSP8NonTransferableErrors.sol";
import {
    LSP8CappedSupplyCannotMintOverCap
} from "../contracts/extensions/LSP8CappedSupply/LSP8CappedSupplyErrors.sol";
import {
    _LSP4_TOKEN_TYPE_NFT
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

contract LSP8CustomizableTokenInitTest is Test {
    uint256 internal constant tokenIdFormat = 0;

    address internal owner = address(this);
    address internal user1 = vm.addr(101);
    address internal user2 = vm.addr(102);
    address internal revoker1 = vm.addr(104);

    function test_InitImplementationCannotBeInitializedAfterDeployment()
        public
    {
        LSP8CustomizableTokenInit implementation = new LSP8CustomizableTokenInit();

        bytes32[] memory initialTokenIds = new bytes32[](3);
        initialTokenIds[0] = bytes32(uint256(1));
        initialTokenIds[1] = bytes32(uint256(2));
        initialTokenIds[2] = bytes32(uint256(3));

        LSP8MintableParams memory mintableParams = LSP8MintableParams({
            isMintable: true,
            initialMintTokenIds: initialTokenIds
        });
        LSP8NonTransferableParams
            memory nonTransferableParams = LSP8NonTransferableParams({
                transferLockStart: 0,
                transferLockEnd: 0
            });
        LSP8CappedParams memory cappedParams = LSP8CappedParams({
            tokenBalanceCap: 5,
            tokenSupplyCap: 100
        });
        LSP8RevokableParams memory revokableParams = LSP8RevokableParams({
            isRevokable: true
        });

        vm.expectRevert("Initializable: contract is already initialized");
        implementation.initialize(
            "Custom NFT",
            "CNFT",
            address(this),
            _LSP4_TOKEN_TYPE_NFT,
            0,
            mintableParams,
            nonTransferableParams,
            cappedParams,
            revokableParams
        );
    }

    function test_InitializeRevertsIfInitialMintExceedsSupplyCap() public {
        uint256 supplyCap = 100;

        bytes32[] memory tooManyTokenIds = new bytes32[](supplyCap + 1);
        for (uint256 i = 0; i < supplyCap + 1; ++i) {
            tooManyTokenIds[i] = bytes32(uint256(i + 1));
        }

        LSP8CustomizableTokenInit implementation = new LSP8CustomizableTokenInit();
        address instance = Clones.clone(address(implementation));
        LSP8CustomizableTokenInit token = LSP8CustomizableTokenInit(payable(instance));

        LSP8MintableParams memory mintableParams =
            LSP8MintableParams({isMintable: true, initialMintTokenIds: tooManyTokenIds});
        LSP8NonTransferableParams memory nonTransferableParams =
            LSP8NonTransferableParams({transferLockStart: 0, transferLockEnd: 0});
        LSP8CappedParams memory cappedParams = LSP8CappedParams({
            tokenBalanceCap: 5,
            tokenSupplyCap: supplyCap
        });
        LSP8RevokableParams memory revokableParams = LSP8RevokableParams({isRevokable: true});

        vm.expectRevert(LSP8CappedSupplyCannotMintOverCap.selector);
        token.initialize(
            "Custom NFT",
            "CNFT",
            owner,
            _LSP4_TOKEN_TYPE_NFT,
            tokenIdFormat,
            mintableParams,
            nonTransferableParams,
            cappedParams,
            revokableParams
        );
    }

    /// @dev LSP8 mints one NFT per id; use a moderate count so the test stays within practical gas (LSP7 uses one _mint of 1_000_000).
    function _preMintTokenIds(uint256 count) internal pure returns (bytes32[] memory ids) {
        ids = new bytes32[](count);
        for (uint256 i = 0; i < count; ++i) {
            ids[i] = bytes32(i + 1);
        }
    }

    function test_InitializeNonMintableTokenButPreMintTokens() public {
        uint256 preMintAmount = 1_000;

        LSP8MintableParams memory mintableParams = LSP8MintableParams({
            isMintable: false,
            initialMintTokenIds: _preMintTokenIds(preMintAmount)
        });

        LSP8NonTransferableParams
            memory nonTransferableParams = LSP8NonTransferableParams({
                transferLockStart: 0,
                transferLockEnd: 0
            });

        LSP8CappedParams memory cappedParams = LSP8CappedParams({
            tokenBalanceCap: 0,
            tokenSupplyCap: 0
        });

        LSP8RevokableParams memory revokableParams = LSP8RevokableParams({
            isRevokable: false
        });

        LSP8CustomizableTokenInit nonMintableToken = _deployClone(
            mintableParams,
            nonTransferableParams,
            cappedParams,
            revokableParams
        );

        assertEq(nonMintableToken.balanceOf(owner), preMintAmount);
        assertEq(nonMintableToken.totalSupply(), preMintAmount);
        assertFalse(nonMintableToken.isMintable());
    }

    function _deployClone(
        LSP8MintableParams memory mintableParams,
        LSP8NonTransferableParams memory nonTransferableParams,
        LSP8CappedParams memory cappedParams,
        LSP8RevokableParams memory revokableParams
    ) internal returns (LSP8CustomizableTokenInit token) {
        LSP8CustomizableTokenInit implementation = new LSP8CustomizableTokenInit();
        address instance = Clones.clone(address(implementation));
        token = LSP8CustomizableTokenInit(payable(instance));
        token.initialize(
            "Custom NFT",
            "CNFT",
            owner,
            _LSP4_TOKEN_TYPE_NFT,
            tokenIdFormat,
            mintableParams,
            nonTransferableParams,
            cappedParams,
            revokableParams
        );
    }

    function test_CloneInitializeMintsToOwnerAndTransferWorksWhenUnlocked()
        public
    {
        bytes32[] memory initialTokenIds = new bytes32[](1);
        initialTokenIds[0] = bytes32(uint256(1));

        LSP8MintableParams memory mintableParams =
            LSP8MintableParams({isMintable: true, initialMintTokenIds: initialTokenIds});
        LSP8NonTransferableParams memory nonTransferableParams =
            LSP8NonTransferableParams({transferLockStart: 0, transferLockEnd: 0});
        LSP8CappedParams memory cappedParams =
            LSP8CappedParams({tokenBalanceCap: 0, tokenSupplyCap: 0});
        LSP8RevokableParams memory revokableParams = LSP8RevokableParams({isRevokable: true});

        LSP8CustomizableTokenInit token = _deployClone(
            mintableParams, nonTransferableParams, cappedParams, revokableParams
        );

        bytes32 tokenId = bytes32(uint256(1));
        assertEq(token.balanceOf(owner), 1);
        assertEq(token.tokenOwnerOf(tokenId), owner);
        assertTrue(token.isTransferable());

        token.transfer(owner, user1, tokenId, true, "");
        assertEq(token.balanceOf(user1), 1);
        assertEq(token.tokenOwnerOf(tokenId), user1);
    }

    function test_TransferDisabledWhenNonTransferableViaEip1167Clone() public {
        bytes32[] memory emptyTokenIds = new bytes32[](0);
        LSP8MintableParams memory mintableParams =
            LSP8MintableParams({isMintable: true, initialMintTokenIds: emptyTokenIds});
        LSP8NonTransferableParams memory nonTransferableParams = LSP8NonTransferableParams({
            transferLockStart: 0,
            transferLockEnd: type(uint256).max
        });
        LSP8CappedParams memory cappedParams =
            LSP8CappedParams({tokenBalanceCap: 0, tokenSupplyCap: 0});
        LSP8RevokableParams memory revokableParams = LSP8RevokableParams({isRevokable: true});

        LSP8CustomizableTokenInit token = _deployClone(
            mintableParams, nonTransferableParams, cappedParams, revokableParams
        );

        bytes32 tokenId = bytes32(uint256(1));
        token.mint(user1, tokenId, true, "");

        vm.prank(user1);
        vm.expectRevert(LSP8TransferDisabled.selector);
        token.transfer(user1, user2, tokenId, true, "");
    }

    function test_TransferRevertsDuringBoundedLockWindowViaEip1167Clone() public {
        uint256 lockStart = block.timestamp + 1 days;
        uint256 lockEnd = lockStart + 1 days;

        bytes32[] memory emptyTokenIds = new bytes32[](0);
        LSP8MintableParams memory mintableParams =
            LSP8MintableParams({isMintable: true, initialMintTokenIds: emptyTokenIds});
        LSP8NonTransferableParams memory nonTransferableParams = LSP8NonTransferableParams({
            transferLockStart: lockStart,
            transferLockEnd: lockEnd
        });
        LSP8CappedParams memory cappedParams =
            LSP8CappedParams({tokenBalanceCap: 0, tokenSupplyCap: 0});
        LSP8RevokableParams memory revokableParams = LSP8RevokableParams({isRevokable: true});

        LSP8CustomizableTokenInit token = _deployClone(
            mintableParams, nonTransferableParams, cappedParams, revokableParams
        );

        bytes32 tokenId = bytes32(uint256(1));
        token.mint(user1, tokenId, true, "");
        assertTrue(token.isTransferable());

        vm.warp(lockStart + 1);
        assertFalse(token.isTransferable());

        vm.prank(user1);
        vm.expectRevert(LSP8TransferDisabled.selector);
        token.transfer(user1, user2, tokenId, true, "");

        vm.warp(lockEnd + 1);
        assertTrue(token.isTransferable());

        vm.prank(user1);
        token.transfer(user1, user2, tokenId, true, "");
        assertEq(token.tokenOwnerOf(tokenId), user2);
    }

    function test_RevokerCannotTransferDuringTransferLockWithoutBypassRoleViaEip1167Clone()
        public
    {
        bytes32[] memory emptyTokenIds = new bytes32[](0);
        LSP8MintableParams memory mintableParams =
            LSP8MintableParams({isMintable: true, initialMintTokenIds: emptyTokenIds});
        LSP8NonTransferableParams memory nonTransferableParams = LSP8NonTransferableParams({
            transferLockStart: 0,
            transferLockEnd: type(uint256).max
        });
        LSP8CappedParams memory cappedParams =
            LSP8CappedParams({tokenBalanceCap: 0, tokenSupplyCap: 0});
        LSP8RevokableParams memory revokableParams = LSP8RevokableParams({isRevokable: true});

        LSP8CustomizableTokenInit token = _deployClone(
            mintableParams, nonTransferableParams, cappedParams, revokableParams
        );

        bytes32 tokenId = bytes32(uint256(1));
        token.grantRole(token.REVOKER_ROLE(), revoker1);
        token.mint(revoker1, tokenId, true, "");

        vm.prank(revoker1);
        vm.expectRevert(LSP8TransferDisabled.selector);
        token.transfer(revoker1, user2, tokenId, true, "");

        token.grantRole(token.NON_TRANSFERABLE_BYPASS_ROLE(), revoker1);

        vm.prank(revoker1);
        token.transfer(revoker1, user2, tokenId, true, "");

        assertEq(token.balanceOf(revoker1), 0);
        assertEq(token.tokenOwnerOf(tokenId), user2);
    }
}
