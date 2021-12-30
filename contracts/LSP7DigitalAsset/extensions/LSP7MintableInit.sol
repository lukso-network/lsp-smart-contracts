// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./LSP7MintableCore.sol";
import "../LSP7DigitalAssetInit.sol";

/**
 * @dev LSP7 extension, mintable.
 */
contract LSP7MintableInit is LSP7MintableCore, LSP7DigitalAssetInit {
    /**
     * @notice Sets the token-Metadata and register LSP7InterfaceId
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param newOwner_ The owner of the the token-Metadata
     * @param isNFT_ Specify if the LSP7 token is a fungible or non-fungible token
     */
    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        bool isNFT_
    ) public virtual override initializer {
        LSP7DigitalAssetInit.initialize(name_, symbol_, newOwner_, isNFT_);
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
