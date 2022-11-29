// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

// modules
import {
    LSP8IdentifiableDigitalAssetInitAbstract
} from "../LSP8IdentifiableDigitalAssetInitAbstract.sol";
import {LSP8IdentifiableDigitalAssetCore} from "../LSP8IdentifiableDigitalAssetCore.sol";

/**
 * @dev LSP8 extension.
 */
abstract contract LSP8EnumerableInitAbstract is LSP8IdentifiableDigitalAssetInitAbstract {
    // Mapping from token index to token id
    mapping(uint256 => bytes32) private _indexToken;

    // Mapping from token id to index
    mapping(bytes32 => uint256) private _tokenIndex;

    /**
     * @dev Returns a token id at index. See totalSupply() to get total number of minted tokens.
     * @return TokenId or 0x00 if no token exist at the index `index`
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
