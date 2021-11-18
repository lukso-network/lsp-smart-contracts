// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// interfaces
import "../ILSP7DigitalAsset.sol";

/**
 * @dev LSP7 extension, adds token supply cap.
 */
interface ILSP7CappedSupply is ILSP7DigitalAsset {
  /**
   * @dev Returns the number of tokens that can be minted
   */
  function tokenSupplyCap() external view returns (uint256);
}
