// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// interfaces
import "../ILSP7DigitalAsset.sol";

/**
 * @dev LSP7 extension, mintable.
 */
interface ILSP7Mintable is ILSP7DigitalAsset {
    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) external;
}
