// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// interfaces
import "../ILSP7DigitalAsset.sol";

/**
 * @dev LSP8 extension, for compatibility for clients / tools that expect ERC20.
 */
interface ILSP7CompatibilityForERC20 is ILSP7DigitalAsset {

  /*
   * @dev Compatible with ERC20 tranfer.
   */
  function transfer(address to, uint256 amount) external;

  /*
   * @dev Compatible with ERC20 tranferFrom.
   */
  function transferFrom(address from, address to, uint256 amount) external;

  /*
   * @dev Compatible with ERC20 approve.
   */
  function approve(address operator, uint256 amount) external;

  /*
   * @dev Compatible with ERC20 allowance.
   */
  function allowance(address tokenOwner, address operator) external returns (uint256);

}
