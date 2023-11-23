// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// modules
import {
    LSP7DigitalAssetInitAbstract
} from "../../LSP7DigitalAsset/LSP7DigitalAssetInitAbstract.sol";
import {
    LSP7BurnableInitAbstract
} from "../../LSP7DigitalAsset/extensions/LSP7BurnableInitAbstract.sol";

contract LSP7InitTester is
    LSP7DigitalAssetInitAbstract,
    LSP7BurnableInitAbstract
{
    function initialize(
        string memory tokenName_,
        string memory tokenSymbol_,
        address newOwner_,
        bool isNonDivisible_,
        uint256 lsp4TokenType_
    ) public initializer {
        LSP7DigitalAssetInitAbstract._initialize(
            tokenName_,
            tokenSymbol_,
            newOwner_,
            isNonDivisible_,
            lsp4TokenType_
        );
    }

    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public {
        _mint(to, amount, force, data);
    }
}
