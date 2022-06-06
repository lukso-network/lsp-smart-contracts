// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// interfaces
import {ILSP8Mintable} from "./ILSP8Mintable.sol";

// modules
import {LSP8IdentifiableDigitalAssetCore} from "../LSP8IdentifiableDigitalAssetCore.sol";

/**
 * @dev LSP8 extension
 */
abstract contract LSP8MintableCore is LSP8IdentifiableDigitalAssetCore, ILSP8Mintable {
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
