// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// modules
import {
    LSP8IdentifiableDigitalAsset,
    LSP8IdentifiableDigitalAssetCore
} from "../LSP8IdentifiableDigitalAsset.sol";

/**
 * @dev LSP8 extension that enables to enumerate over all the `tokenIds` ever minted.
 *
 * @custom:warning Note that in this extension contract, any `tokenId` that been burnt is removed from the set of the enumerable tokenIds.
 */
abstract contract LSP8Enumerable is LSP8IdentifiableDigitalAsset {
    // Mapping from token index to token id
    mapping(uint256 => bytes32) private _indexToken;

    // Mapping from token id to index
    mapping(bytes32 => uint256) private _tokenIndex;

    /**
     * @notice Retrieving the `tokenId` for `msg.sender` located in its list at index number `index`.
     *
     * @dev Returns a token id at index. See {totalSupply} to get total number of minted tokens.
     * @param index The index to search to search in the enumerable mapping.
     * @return TokenId or `bytes32(0)` if no tokenId exist at `index`.
     */
    function tokenAt(uint256 index) public view returns (bytes32) {
        return _indexToken[index];
    }

    /**
     * @inheritdoc LSP8IdentifiableDigitalAssetCore
     *
     * @param from The address sending the `tokenId` (`address(0)` when `tokenId` is being minted).
     * @param to The address receiving the `tokenId` (`address(0)` when `tokenId` is being burnt).
     * @param tokenId The bytes32 identifier of the token being transferred.
     * @param data The data sent alongside the the token transfer.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        bytes32 tokenId,
        bytes memory data
    ) internal virtual override(LSP8IdentifiableDigitalAssetCore) {
        // `tokenId` being minted
        if (from == address(0)) {
            uint256 index = totalSupply();
            _indexToken[index] = tokenId;
            _tokenIndex[tokenId] = index;
        }

        // `tokenId` being burnt
        if (to == address(0)) {
            uint256 lastIndex = totalSupply() - 1;
            uint256 index = _tokenIndex[tokenId];
            if (index < lastIndex) {
                bytes32 lastTokenId = _indexToken[lastIndex];
                _indexToken[index] = lastTokenId;
                _tokenIndex[lastTokenId] = index;
            }
            delete _indexToken[lastIndex];
            delete _tokenIndex[tokenId];
        }

        super._beforeTokenTransfer(from, to, tokenId, data);
    }
}
