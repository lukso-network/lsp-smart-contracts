// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// interfaces
import {
    ILSP8IdentifiableDigitalAsset
} from "../ILSP8IdentifiableDigitalAsset.sol";

// --- ERC165 interface ids
bytes4 constant _INTERFACEID_ERC721 = 0x80ac58cd;
bytes4 constant _INTERFACEID_ERC721METADATA = 0x5b5e139f;

/**
 * @dev LSP8 extension, for compatibility for clients / tools that expect ERC721.
 */
interface ILSP8CompatibleERC721 is ILSP8IdentifiableDigitalAsset {
    /**
     * @notice ERC721 `Transfer` compatible event emitted. Successfully transferred tokenId `tokenId` from `from` to `to`.
     *
     * @dev ERC721 `Transfer` event emitted when `tokenId` token is transferred from `from` to `to`.
     * To provide compatibility with indexing ERC721 events.
     *
     * @param from The sending address.
     * @param to The receiving address.
     * @param tokenId The tokenId to transfer.
     */
    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );

    /**
     * @notice ERC721 `Approval` compatible event emitted. Successfully approved operator `operator` to operate on tokenId `tokenId` on behalf of token owner `owner`.
     *
     * @dev ERC721 `Approval` event emitted when `owner` enables `operator` for `tokenId`.
     * To provide compatibility with indexing ERC721 events.
     *
     * @param owner The address of the owner of the `tokenId`.
     * @param operator The address set as operator.
     * @param tokenId The approved tokenId.
     */
    event Approval(
        address indexed owner,
        address indexed operator,
        uint256 indexed tokenId
    );

    /**
     * @notice ERC721 `ApprovalForAll` compatible event emitted. Successfully set "approved for all" status to `approved` for operator `operator` for token owner `owner`.
     *
     * @dev ERC721 `ApprovalForAll` event emitted when an `operator` is enabled or disabled for an owner
     * to transfer any of its tokenIds. The operator can manage all NFTs of the owner.
     *
     * @param owner The address of the owner of tokenIds.
     * @param operator The address set as operator.
     * @param approved If `operator` is approved for all NFTs or not.
     */
    event ApprovalForAll(
        address indexed owner,
        address indexed operator,
        bool approved
    );

    /**
     * @notice Calling `transferFrom` function on `ILSP8CompatibleERC721` contract. Transferring tokenId `tokenId` from address `from` to address `to`.
     *
     * @dev Transfer functions from the ERC721 standard interface.
     *
     * @param from The sending address.
     * @param to The receiving address.
     * @param tokenId The tokenId to transfer.
     */
    function transferFrom(address from, address to, uint256 tokenId) external;

    /**
     * @notice Calling `safeTransferFrom` function on `ILSP8CompatibleERC721` contract. Transferring tokenId `tokenId` from address `from` to address `to`.
     *
     * @dev Safe Transfer function without optional data from the ERC721 standard interface.
     *
     * @param from The sending address.
     * @param to The receiving address.
     * @param tokenId The tokenId to transfer.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    /**
     * @notice Calling `safeTransferFrom` function with `data` on `ILSP8CompatibleERC721` contract. Transferring tokenId `tokenId` from address `from` to address `to`.
     *
     * @dev Safe Transfer function with optional data from the ERC721 standard interface.
     *
     * @param from The sending address.
     * @param to The receiving address.
     * @param tokenId The tokenId to transfer.
     * @param data The data to be sent with the transfer.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) external;

    /**
     * @notice Retrieving the address that own tokenId `tokenId`.
     *
     * @dev Compatible with ERC721 ownerOf.
     *
     * @param tokenId The tokenId to query.
     * @return The owner of the tokenId.
     */
    function ownerOf(uint256 tokenId) external view returns (address);

    /**
     * @notice Calling `approve` function on `ILSP8CompatibleERC721` contract. Approving operator at address `operator` to transfer tokenId `tokenId` on behalf of its owner.
     *
     * @dev Approval function compatible with ERC721 `approve(address,uint256)`.
     *
     * @param operator The address to approve for `tokenId`.
     * @param tokenId The tokenId to approve.
     */
    function approve(address operator, uint256 tokenId) external;

    /**
     * @notice Setting the "approval for all" status of operator `_operator` to `_approved` to allow it to transfer any tokenIds on behalf of `msg.sender`.
     *
     * @dev Enable or disable approval for a third party ("operator") to manage all of `msg.sender`'s assets. The contract MUST allow multiple operators per owner.
     *
     * @param _operator Address to add to the set of authorized operators.
     * @param _approved True if the operator is approved, false to revoke approval.
     *
     * @custom:events {ApprovalForAll} event
     */
    function setApprovalForAll(address _operator, bool _approved) external;

    /**
     * @notice Retrieving the address other than the token owner that is approved to transfer tokenId `tokenId` on behalf of its owner.
     *
     * @dev Compatible with ERC721 getApproved.
     *
     * @param tokenId The tokenId to query.
     * @return The address of the operator for `tokenId`.
     */
    function getApproved(uint256 tokenId) external view returns (address);

    /*
     * @notice Checking if address `operator` is approved to transfer any tokenId owned by address `owner`.
     *
     * @dev Compatible with ERC721 isApprovedForAll.
     *
     * @param owner The tokenOwner address to query.
     * @param operator The operator address to query.
     *
     * @return Returns if the `operator` is allowed to manage all of the assets of `owner`
     */
    function isApprovedForAll(
        address owner,
        address operator
    ) external view returns (bool);

    /*
     * @notice Retrieving the token URI of tokenId `tokenId`.
     *
     * @dev Compatible with ERC721Metadata tokenURI.
     *
     * @param tokenId The tokenId to query.
     *
     * @return The token URI.
     */
    function tokenURI(uint256 tokenId) external returns (string memory);
}
