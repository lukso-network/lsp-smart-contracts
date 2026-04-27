// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";

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
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

contract LSP7CustomizableTokenInitTest is Test {
    function test_InitImplementationCannotBeInitializedAfterDeployment() public {
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
}
