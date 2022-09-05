// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// interfaces
import {ILSP8Enumerable} from "./ILSP8Enumerable.sol";

// modules
import {LSP8IdentifiableDigitalAssetCore} from "../LSP8IdentifiableDigitalAssetCore.sol";

/**
 * @dev LSP8 extension, adds access to a token id by an index.
 */
abstract contract LSP8EnumerableCore is LSP8IdentifiableDigitalAssetCore, ILSP8Enumerable {
    // Mapping from token index to token id
    mapping(uint256 => bytes32) private _indexToken;

    // Mapping from token id to index
    mapping(bytes32 => uint256) private _tokenIndex;

    /**
     * @inheritdoc ILSP8Enumerable
     */
    function tokenAt(uint256 index) public view returns (bytes32) {
        return _indexToken[index];
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        bytes32 tokenId
    ) internal virtual override(LSP8IdentifiableDigitalAssetCore) {
        if (from == address(0)) {
            uint256 index = _existingTokens;
            _indexToken[index] = tokenId;
            _tokenIndex[tokenId] = index;
        } else if (to == address(0)) {
            uint256 lastIndex = _existingTokens - 1;
            uint256 index = _tokenIndex[tokenId];
            if (index < lastIndex) {
                bytes32 lastTokenId = _indexToken[lastIndex];
                _indexToken[index] = lastTokenId;
                _tokenIndex[lastTokenId] = index;
            }
            delete _indexToken[lastIndex];
            delete _tokenIndex[tokenId];
        }
        super._beforeTokenTransfer(from, to, tokenId);
    }
}
