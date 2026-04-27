// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";

import {
    LSP8CustomizableTokenInit
} from "../contracts/presets/LSP8CustomizableTokenInit.sol";
import {
    LSP8MintableParams,
    LSP8NonTransferableParams,
    LSP8CappedParams,
    LSP8RevokableParams
} from "../contracts/presets/LSP8CustomizableTokenConstants.sol";
import {
    _LSP4_TOKEN_TYPE_NFT
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

contract LSP8CustomizableTokenInitTest is Test {
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
}
