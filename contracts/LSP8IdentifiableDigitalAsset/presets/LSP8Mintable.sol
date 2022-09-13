// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// interfaces
import {ILSP8Mintable} from "./ILSP8Mintable.sol";

// modules
import {LSP8IdentifiableDigitalAsset} from "../LSP8IdentifiableDigitalAsset.sol";

/**
 * @dev LSP8 extension.
 */
contract LSP8Mintable is LSP8IdentifiableDigitalAsset, ILSP8Mintable {
    // solhint-disable no-empty-blocks
    /**
     * @notice Sets the token-Metadata and register LSP8InterfaceId
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param newOwner_ The owner of the the token-Metadata
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) LSP8IdentifiableDigitalAsset(name_, symbol_, newOwner_) {}

    /**
     * @inheritdoc ILSP8Mintable
     */
    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public virtual onlyOwner {
        _mint(to, tokenId, force, data);
    }
}
