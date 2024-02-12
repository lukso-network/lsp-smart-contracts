// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// modules
import {
    LSP7DigitalAssetInitAbstract
} from "@lukso/lsp7-contracts/contracts/LSP7DigitalAssetInitAbstract.sol";
import {
    LSP7BurnableInitAbstract
} from "@lukso/lsp7-contracts/contracts/extensions/LSP7BurnableInitAbstract.sol";

contract LSP7InitTester is
    LSP7DigitalAssetInitAbstract,
    LSP7BurnableInitAbstract
{
    function initialize(
        string memory tokenName_,
        string memory tokenSymbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_
    ) public initializer {
        LSP7DigitalAssetInitAbstract._initialize(
            tokenName_,
            tokenSymbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
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
