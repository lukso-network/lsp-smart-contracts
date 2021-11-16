// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../LSP8IdentifiableDigitalAsset.sol";

// interfaces
import "./ILSP8CompatibilityForERC721.sol";

/**
 * @dev LSP8 extension, for compatibility for clients / tools that expect ERC721.
 */
contract LSP8CompatibilityForERC721 is ILSP8CompatibilityForERC721, LSP8IdentifiableDigitalAsset {
    using EnumerableSet for EnumerableSet.AddressSet;

    /* solhint-disable no-empty-blocks */
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) LSP8IdentifiableDigitalAsset(name_, symbol_, newOwner_) {}

    /*
     * @dev Compatible with ERC721 ownerOf.
     */
    function ownerOf(uint256 tokenId) external view virtual override returns (address) {
        return tokenOwnerOf(bytes32(tokenId));
    }

    /*
     * @dev Compatible with ERC721 approve.
     */
    function approve(address operator, uint256 tokenId) external virtual override {
        return authorizeOperator(operator, bytes32(tokenId));
    }

    /*
     * @dev Compatible with ERC721 getApproved.
     */
    function getApproved(uint256 tokenId) external view virtual override returns (address) {
        require(_exists(bytes32(tokenId)), "LSP8: can not query operator for non existent token");

        EnumerableSet.AddressSet storage operatorsForTokenId = _operators[bytes32(tokenId)];
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
     * @dev Compatible with ERC721 transferFrom.
     * Using force=true so that EOA and any contract may receive the tokenId.
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external virtual override {
        return transfer(from, to, bytes32(tokenId), true, "compat-transferFrom");
    }

    /*
     * @dev Compatible with ERC721 safeTransferFrom.
     * Using force=false so that no EOA and only contracts supporting LSP1 interface may receive the tokenId.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external virtual override {
        return transfer(from, to, bytes32(tokenId), false, "compat-safeTransferFrom");
    }
}
