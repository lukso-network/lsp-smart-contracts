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
    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) public virtual override initializer {
        LSP8IdentifiableDigitalAssetInit.initialize(name_, symbol_, newOwner_);
    }

    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public virtual override onlyOwner {
        _mint(to, tokenId, force, data);
    }
}
