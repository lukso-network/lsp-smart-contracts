// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import {LSP8IdentifiableDigitalAsset} from "../LSP8IdentifiableDigitalAsset.sol";
import {LSP8IdentifiableDigitalAssetCore} from "../LSP8IdentifiableDigitalAssetCore.sol";
import {LSP8EnumerableCore} from "./LSP8EnumerableCore.sol";

/**
 * @dev LSP8 extension.
 */
abstract contract LSP8Enumerable is LSP8IdentifiableDigitalAsset, LSP8EnumerableCore {
    function _beforeTokenTransfer(
        address from,
        address to,
        bytes32 tokenId
    ) internal virtual override(LSP8IdentifiableDigitalAssetCore, LSP8EnumerableCore) {
        super._beforeTokenTransfer(from, to, tokenId);
    }
}
