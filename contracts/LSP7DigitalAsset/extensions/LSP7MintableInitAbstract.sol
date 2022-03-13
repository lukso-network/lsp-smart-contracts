// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./LSP7MintableCore.sol";
import "../LSP7DigitalAssetInit.sol";

/**
 * @dev LSP7 extension, mintable.
 */
abstract contract LSP7MintableInitAbstract is
    LSP7MintableCore,
    LSP7DigitalAssetInit
{
    function _initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        bool isNFT_
    ) internal virtual override onlyInitializing {
        LSP7DigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            isNFT_
        );
    }

    /**
     * @inheritdoc LSP7MintableCore
     */
    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public override onlyOwner {
        _mint(to, amount, force, data);
    }
}
