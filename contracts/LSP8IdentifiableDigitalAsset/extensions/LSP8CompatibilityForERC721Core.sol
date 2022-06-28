// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// interfaces
import {ILSP8IdentifiableDigitalAsset} from "../ILSP8IdentifiableDigitalAsset.sol";
import {ILSP8CompatibilityForERC721} from "./ILSP8CompatibilityForERC721.sol";

// libraries
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";

// modules
import {LSP4Compatibility} from "../../LSP4DigitalAssetMetadata/LSP4Compatibility.sol";
import {LSP8IdentifiableDigitalAssetCore} from "../LSP8IdentifiableDigitalAssetCore.sol";

// constants
import {_LSP4_METADATA_KEY} from "../../LSP4DigitalAssetMetadata/LSP4Constants.sol";

/**
 * @dev LSP8 extension, for compatibility for clients / tools that expect ERC721.
 */
abstract contract LSP8CompatibilityForERC721Core is
    LSP4Compatibility,
    LSP8IdentifiableDigitalAssetCore,
    ILSP8CompatibilityForERC721
{
    using EnumerableSet for EnumerableSet.AddressSet;

    /*
     * @inheritdoc ILSP8CompatibilityForERC721
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        // silence compiler warning about unused variable
        tokenId;

        bytes memory data = _getData(_LSP4_METADATA_KEY);

        // offset = bytes4(hashSig) + bytes32(contentHash) -> 4 + 32 = 36
        uint256 offset = 36;

        bytes memory uriBytes = BytesLib.slice(data, offset, data.length - offset);
        return string(uriBytes);
    }

    /**
     * @inheritdoc ILSP8CompatibilityForERC721
     */
    function ownerOf(uint256 tokenId) public view virtual override returns (address) {
        return tokenOwnerOf(bytes32(tokenId));
    }

    /**
     * @inheritdoc ILSP8CompatibilityForERC721
     */
    function approve(address operator, uint256 tokenId) public virtual override {
        authorizeOperator(operator, bytes32(tokenId));

        emit Approval(tokenOwnerOf(bytes32(tokenId)), operator, tokenId);
    }

    /**
     * @inheritdoc ILSP8CompatibilityForERC721
     */
    function getApproved(uint256 tokenId) public view virtual override returns (address) {
        bytes32 tokenIdAsBytes32 = bytes32(tokenId);
        _existsOrError(tokenIdAsBytes32);

        EnumerableSet.AddressSet storage operatorsForTokenId = _operators[tokenIdAsBytes32];
        uint256 operatorListLength = operatorsForTokenId.length();

        if (operatorListLength == 0) {
            return address(0);
        } else {
            // Read the last added operator authorized to provide "best" compatibility.
            // In ERC721 there is one operator address at a time for a tokenId, so multiple calls to
            // `approve` would cause `getApproved` to return the last added operator. In this
            // compatibility version the same is true, when the authorized operators were not previously
            // authorized. If addresses are removed, then `getApproved` returned address can change due
            // to implementation of `EnumberableSet._remove`.
            return operatorsForTokenId.at(operatorListLength - 1);
        }
    }

    /*
     * @inheritdoc ILSP8CompatibilityForERC721
     */
    function isApprovedForAll(address tokenOwner, address operator)
        public
        view
        virtual
        override
        returns (bool)
    {
        // silence compiler warning about unused variable
        tokenOwner;
        operator;

        return false;
    }

    /**
     * @inheritdoc ILSP8CompatibilityForERC721
     * @dev Compatible with ERC721 transferFrom.
     * Using force=true so that EOA and any contract may receive the tokenId.
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        return transfer(from, to, bytes32(tokenId), true, "");
    }

    /**
     * @inheritdoc ILSP8CompatibilityForERC721
     * @dev Compatible with ERC721 safeTransferFrom.
     * Using force=false so that no EOA and only contracts supporting LSP1 interface may receive the tokenId.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        return transfer(from, to, bytes32(tokenId), false, "");
    }

    /*
     * @dev Compatible with ERC721 safeTransferFrom.
     * Using force=false so that no EOA and only contracts supporting LSP1 interface may receive the tokenId.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual override {
        return transfer(from, to, bytes32(tokenId), false, data);
    }

    // --- Overrides

    function authorizeOperator(address operator, bytes32 tokenId)
        public
        virtual
        override(ILSP8IdentifiableDigitalAsset, LSP8IdentifiableDigitalAssetCore)
    {
        super.authorizeOperator(operator, tokenId);

        emit Approval(
            tokenOwnerOf(tokenId),
            operator,
            abi.decode(abi.encodePacked(tokenId), (uint256))
        );
    }

    function _transfer(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) internal virtual override {
        super._transfer(from, to, tokenId, force, data);

        emit Transfer(from, to, abi.decode(abi.encodePacked(tokenId), (uint256)));
    }

    function _mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) internal virtual override {
        super._mint(to, tokenId, force, data);

        emit Transfer(address(0), to, abi.decode(abi.encodePacked(tokenId), (uint256)));
    }

    function _burn(bytes32 tokenId, bytes memory data) internal virtual override {
        address tokenOwner = tokenOwnerOf(tokenId);

        super._burn(tokenId, data);

        emit Transfer(tokenOwner, address(0), abi.decode(abi.encodePacked(tokenId), (uint256)));
    }
}
