// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// interfaces
import {ILSP8IdentifiableDigitalAsset} from "../ILSP8IdentifiableDigitalAsset.sol";

/**
 * @dev LSP8 extension, for compatibility for clients / tools that expect ERC721.
 */
interface ILSP8CompatibleERC721 is ILSP8IdentifiableDigitalAsset {
    /**
     * @notice To provide compatibility with indexing ERC721 events.
     * @dev Emitted when `tokenId` token is transferred from `from` to `to`.
     * @param from The sending address
     * @param to The receiving address
     * @param tokenId The tokenId to transfer
     */
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    /**
     * @notice To provide compatibility with indexing ERC721 events.
     * @dev Emitted when `owner` enables `approved` for `tokenId`.
     * @param owner The address of the owner of the `tokenId`
     * @param approved The address set as operator
     * @param tokenId The approved tokenId
     */
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);

    /**
     * @dev This emits when an operator is enabled or disabled for an owner.
     * The operator can manage all NFTs of the owner.
     */
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

    /**
     * @dev Compatible with ERC721 transferFrom.
     * @param from The sending address
     * @param to The receiving address
     * @param tokenId The tokenId to transfer
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    /**
     * @dev Compatible with ERC721 transferFrom.
     * @param from The sending address
     * @param to The receiving address
     * @param tokenId The tokenId to transfer
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    /**
     * @dev Compatible with ERC721 safeTransferFrom.
     * @param from The sending address
     * @param to The receiving address
     * @param tokenId The tokenId to transfer
     * @param data The data to be sent with the transfer
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) external;

    /**
     * @dev Compatible with ERC721 ownerOf.
     * @param tokenId The tokenId to query
     * @return The owner of the tokenId
     */
    function ownerOf(uint256 tokenId) external view returns (address);

    /**
     * @dev Compatible with ERC721 approve.
     * @param operator The address to approve for `amount`
     * @param tokenId The tokenId to approve
     */
    function approve(address operator, uint256 tokenId) external;

    /**
     * @notice Enable or disable approval for a third party ("operator") to manage all of `msg.sender`'s assets
     * @dev Emits the ApprovalForAll event. The contract MUST allow multiple operators per owner.
     * @param _operator Address to add to the set of authorized operators
     * @param _approved True if the operator is approved, false to revoke approval
     */
    function setApprovalForAll(address _operator, bool _approved) external;

    /**
     * @dev Compatible with ERC721 getApproved.
     * @param tokenId The tokenId to query
     * @return The address of the operator for `tokenId`
     */
    function getApproved(uint256 tokenId) external view returns (address);

    /*
     * @dev Compatible with ERC721 isApprovedForAll.
     * @param owner The tokenOwner address to query
     * @param operator The operator address to query
     * @return Returns if the `operator` is allowed to manage all of the assets of `owner`
     */
    function isApprovedForAll(address owner, address operator) external view returns (bool);

    /*
     * @dev Compatible with ERC721Metadata tokenURI.
     * @param tokenId The tokenId to query
     * @return The token URI
     */
    function tokenURI(uint256 tokenId) external returns (string memory);
}
