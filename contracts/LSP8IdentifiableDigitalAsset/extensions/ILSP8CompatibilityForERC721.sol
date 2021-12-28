// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// interfaces
import "../ILSP8IdentifiableDigitalAsset.sol";

/**
 * @dev LSP8 extension, for compatibility for clients / tools that expect ERC721.
 */
interface ILSP8CompatibilityForERC721 is ILSP8IdentifiableDigitalAsset {
    /**
     * @dev To provide compatibility with indexing ERC721 events
     */
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    /**
     * @dev To provide compatibility with indexing ERC721 events.
     */
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);

    /*
     * @dev Compatible with ERC721 transferFrom.
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    /*
     * @dev Compatible with ERC721 safeTransferFrom.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    /*
     * @dev Compatible with ERC721 safeTransferFrom.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) external;

    /*
     * @dev Compatible with ERC721 ownerOf.
     */
    function ownerOf(uint256 tokenId) external returns (address);

    /*
     * @dev Compatible with ERC721 approve.
     */
    function approve(address operator, uint256 tokenId) external;

    /*
     * @dev Compatible with ERC721 getApproved.
     */
    function getApproved(uint256 tokenId) external returns (address);

    /*
     * @dev Compatible with ERC721 tokenURI.
     */
    function isApprovedForAll(uint256 tokenId) external returns (bool);

    /*
     * @dev Compatible with ERC721Metadata tokenURI.
     */
    function tokenURI(uint256 tokenId) external returns (string memory);
}
