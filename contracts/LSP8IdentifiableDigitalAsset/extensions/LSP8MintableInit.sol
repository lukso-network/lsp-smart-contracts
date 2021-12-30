// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./LSP8MintableCore.sol";
import "../LSP8IdentifiableDigitalAssetInit.sol";

/**
 * @dev LSP8 extension.
 */
contract LSP8MintableInit is
    LSP8MintableCore,
    LSP8IdentifiableDigitalAssetInit
{
    /**
     * @notice Sets the token-Metadata and register LSP8InterfaceId
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param newOwner_ The owner of the the token-Metadata
     */
    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) public virtual override initializer {
        LSP8IdentifiableDigitalAssetInit.initialize(name_, symbol_, newOwner_);
    }

    /**
     * @inheritdoc LSP8MintableCore
     */
    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public virtual override onlyOwner {
        _mint(to, tokenId, force, data);
    }
}
