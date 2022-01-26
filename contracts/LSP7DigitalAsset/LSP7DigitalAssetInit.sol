// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import "./LSP7DigitalAssetInitAbstract.sol";

/**
 * @title LSP7DigitalAsset contract
 * @author Matthew Stevens
 * @dev Proxy Implementation of a LSP7 compliant contract.
 */
contract LSP7DigitalAssetInit is LSP7DigitalAssetInitAbstract {
    /**
     * @inheritdoc LSP7DigitalAssetInitAbstract
     */
    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        bool isNFT_
    ) public virtual override initializer {
        LSP7DigitalAssetInitAbstract.initialize(
            name_,
            symbol_,
            newOwner_,
            isNFT_
        );
    }
}
