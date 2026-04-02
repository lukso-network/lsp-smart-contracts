// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {
    LSP8IdentifiableDigitalAsset
} from "../../LSP8IdentifiableDigitalAsset.sol";

import {
    ERC725Y
} from "@erc725/smart-contracts-v8/contracts/ERC725Y.sol";

// interfaces
import {ILSP8MusicNFT} from "./ILSP8MusicNFT.sol";
import {
    IERC725Y
} from "@erc725/smart-contracts-v8/contracts/interfaces/IERC725Y.sol";

// constants
import {
    _LSP33_SUPPORTED_STANDARDS_KEY,
    _LSP33_SUPPORTED_STANDARDS_VALUE,
    _LSP33_OWNABLE_TRACK_TOKEN_KEY,
    _LSP33_METADATA_KEY
} from "./LSP8MusicNFTConstants.sol";

import {
    _LSP4_METADATA_KEY
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

import {
    _LSP8_REFERENCE_CONTRACT
} from "../../LSP8Constants.sol";

// errors
import {
    LSP33BidirectionalLinkMismatch,
    LSP33NotTokenOwner
} from "./LSP8MusicNFTErrors.sol";

import {
    LSP8TokenIdsDataLengthMismatch,
    LSP8TokenIdsDataEmptyArray
} from "../../LSP8Errors.sol";

/// @title LSP8MusicNFTAbstract
/// @dev LSP33 Music NFT extension for LSP8 collections. Proxies metadata reads/writes
/// to linked LSP7 track token contracts and verifies bidirectional links.
abstract contract LSP8MusicNFTAbstract is
    ILSP8MusicNFT,
    LSP8IdentifiableDigitalAsset
{
    constructor() {
        ERC725Y._setData(
            _LSP33_SUPPORTED_STANDARDS_KEY,
            _LSP33_SUPPORTED_STANDARDS_VALUE
        );
    }

    // --- Access Control ---

    /// @dev Override setDataForTokenId to require the caller is the tokenId owner
    /// (not the contract owner). This is consistent with LSP7, where owner()
    /// resolves to tokenOwnerOf(tokenId) via LSP34.
    function setDataForTokenId(
        bytes32 tokenId,
        bytes32 dataKey,
        bytes memory dataValue
    ) public virtual override {
        address tokenOwner = tokenOwnerOf(tokenId);
        if (msg.sender != tokenOwner) {
            revert LSP33NotTokenOwner(msg.sender, tokenId, tokenOwner);
        }
        _setDataForTokenId(tokenId, dataKey, dataValue);
    }

    /// @dev Override setDataBatchForTokenIds to require the caller is each tokenId's owner.
    function setDataBatchForTokenIds(
        bytes32[] memory tokenIds,
        bytes32[] memory dataKeys,
        bytes[] memory dataValues
    ) public virtual override {
        require(
            tokenIds.length == dataKeys.length &&
                dataKeys.length == dataValues.length,
            LSP8TokenIdsDataLengthMismatch()
        );
        require(tokenIds.length != 0, LSP8TokenIdsDataEmptyArray());

        for (uint256 i; i < tokenIds.length; ) {
            address tokenOwner = tokenOwnerOf(tokenIds[i]);
            if (msg.sender != tokenOwner) {
                revert LSP33NotTokenOwner(msg.sender, tokenIds[i], tokenOwner);
            }
            _setDataForTokenId(tokenIds[i], dataKeys[i], dataValues[i]);
            unchecked {
                ++i;
            }
        }
    }

    // --- Read Proxy ---

    /// @dev Override to proxy metadata reads to linked LSP7 track tokens.
    function _getDataForTokenId(
        bytes32 tokenId,
        bytes32 dataKey
    ) internal view virtual override returns (bytes memory dataValues) {
        // Check if this tokenId has a linked LSP7
        bytes memory linkedLSP7 = super._getDataForTokenId(
            tokenId,
            _LSP33_OWNABLE_TRACK_TOKEN_KEY
        );

        if (
            linkedLSP7.length >= 20 &&
            (dataKey == _LSP4_METADATA_KEY || dataKey == _LSP33_METADATA_KEY)
        ) {
            address lsp7Address = _extractAddress(linkedLSP7);

            // Try reading from the linked LSP7
            try IERC725Y(lsp7Address).getData(dataKey) returns (
                bytes memory lsp7Data
            ) {
                return lsp7Data;
            } catch {
                // Fall back to local storage
                return super._getDataForTokenId(tokenId, dataKey);
            }
        }

        return super._getDataForTokenId(tokenId, dataKey);
    }

    // --- Write Forwarding ---

    /// @dev Override to forward metadata writes to linked LSP7 track tokens
    /// and verify bidirectional links when setting LSP33OwnableTrackToken.
    function _setDataForTokenId(
        bytes32 tokenId,
        bytes32 dataKey,
        bytes memory dataValue
    ) internal virtual override {
        // Bidirectional link verification when setting LSP33OwnableTrackToken
        if (dataKey == _LSP33_OWNABLE_TRACK_TOKEN_KEY) {
            if (dataValue.length >= 20) {
                address lsp7Address = _extractAddress(dataValue);
                _verifyBidirectionalLink(lsp7Address, tokenId);
            }
            super._setDataForTokenId(tokenId, dataKey, dataValue);
            return;
        }

        // Check if this tokenId has a linked LSP7
        bytes memory linkedLSP7 = super._getDataForTokenId(
            tokenId,
            _LSP33_OWNABLE_TRACK_TOKEN_KEY
        );

        if (
            linkedLSP7.length >= 20 &&
            (dataKey == _LSP4_METADATA_KEY || dataKey == _LSP33_METADATA_KEY)
        ) {
            address lsp7Address = _extractAddress(linkedLSP7);

            // Forward the write to the linked LSP7 (reverts if external call reverts)
            IERC725Y(lsp7Address).setData(dataKey, dataValue);
            return;
        }

        // Normal local write for non-metadata keys or unlinked tokenIds
        super._setDataForTokenId(tokenId, dataKey, dataValue);
    }

    // --- Bidirectional Link Verification ---

    /// @dev Extracts an address from encoded bytes. Handles both 20-byte
    /// (abi.encodePacked) and 32-byte (abi.encode / left-padded) formats.
    function _extractAddress(
        bytes memory data
    ) internal pure returns (address) {
        if (data.length == 20) {
            return address(bytes20(data));
        }
        return abi.decode(data, (address));
    }

    /// @dev Verifies that the LSP7 contract points back to this LSP8 contract and tokenId.
    function _verifyBidirectionalLink(
        address lsp7Address,
        bytes32 tokenId
    ) internal view {
        bytes memory refData = IERC725Y(lsp7Address).getData(
            _LSP8_REFERENCE_CONTRACT
        );

        if (refData.length < 52) {
            revert LSP33BidirectionalLinkMismatch(lsp7Address, tokenId);
        }

        (address refAddress, bytes32 refTokenId) = abi.decode(
            refData,
            (address, bytes32)
        );

        if (refAddress != address(this) || refTokenId != tokenId) {
            revert LSP33BidirectionalLinkMismatch(lsp7Address, tokenId);
        }
    }
}
