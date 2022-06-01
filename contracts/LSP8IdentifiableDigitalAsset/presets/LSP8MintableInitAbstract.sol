// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import {LSP8IdentifiableDigitalAssetInitAbstract} from "../LSP8IdentifiableDigitalAssetInitAbstract.sol";
import {LSP8MintableCore} from "./LSP8MintableCore.sol";

/**
 * @dev LSP8 extension.
 */
abstract contract LSP8MintableInitAbstract is
    LSP8IdentifiableDigitalAssetInitAbstract,
    LSP8MintableCore
{
    function _initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) internal virtual override onlyInitializing {
        LSP8IdentifiableDigitalAssetInitAbstract._initialize(name_, symbol_, newOwner_);
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
