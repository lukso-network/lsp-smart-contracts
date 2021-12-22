// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import "../LSP8IdentifiableDigitalAssetCore.sol";

// interfaces
import "./ILSP8Mintable.sol";

/**
 * @dev LSP8 extension
 */
abstract contract LSP8MintableCore is
    ILSP8Mintable,
    LSP8IdentifiableDigitalAssetCore
{
    /**
     * @inheritdoc ILSP8Mintable
     */
    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public virtual override {
        _mint(to, tokenId, force, data);
    }
}
