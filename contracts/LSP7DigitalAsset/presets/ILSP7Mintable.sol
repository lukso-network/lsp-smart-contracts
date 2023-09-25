// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// interfaces
import {ILSP7DigitalAsset} from "../ILSP7DigitalAsset.sol";

/**
 * @dev LSP7 extension, Mintable version.
 */
interface ILSP7Mintable is ILSP7DigitalAsset {
    /**
     * @param to The address to mint tokens
     * @param amount The amount to mint
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
        uint256 amount,
        bool force,
        bytes memory data
    ) external;
}
