// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// interfaces
import {
    ILSP8IdentifiableDigitalAsset
} from "../ILSP8IdentifiableDigitalAsset.sol";

/**
 * @dev LSP8 extension, mintable.
 */
interface ILSP8Mintable is ILSP8IdentifiableDigitalAsset {
    /**
     * @param to The address to mint tokens
     * @param tokenId The tokenId to mint
     * @param force When set to TRUE, to may be any address but
     * when set to FALSE to must be a contract that supports LSP1 UniversalReceiver
     * @param data Additional data the caller wants included in the emitted event, and sent in the hooks to `from` and `to` addresses.
     * @dev Mints `amount` tokens and transfers it to `to`.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     *
     * Emits a {Transfer} event.
     */
    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) external;
}
