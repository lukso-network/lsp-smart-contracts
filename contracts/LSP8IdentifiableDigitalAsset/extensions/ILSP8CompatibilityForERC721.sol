// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// interfaces
import "../ILSP8IdentifiableDigitalAsset.sol";

/**
 * @dev LSP8 extension, for compatibility for clients / tools that expect ERC721.
 */
interface ILSP8CompatibilityForERC721 is ILSP8IdentifiableDigitalAsset {

  /*
   * @dev Compatible with ERC721 tranferFrom.
   */
  function transferFrom(address from, address to, uint256 tokenId) external;

  /*
   * @dev Compatible with ERC721 tranferFrom.
   */
  function safeTransferFrom(address from, address to, uint256 tokenId) external;

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

}
