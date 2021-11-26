// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// interfaces
import "../ILSP8IdentifiableDigitalAsset.sol";

/**
 * @dev LSP8 extension, mintable.
 */
interface ILSP8Mintable is ILSP8IdentifiableDigitalAsset {
    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) external;
}
