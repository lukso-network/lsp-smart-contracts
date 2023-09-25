// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {
    LSP8IdentifiableDigitalAsset
} from "../LSP8IdentifiableDigitalAsset.sol";

// errors
import {LSP8NotTokenOperator} from "../LSP8Errors.sol";

/**
 * @dev LSP8 token extension that allows token holders to destroy both
 * their own tokens and those that they have an allowance for as an operator.
 */
abstract contract LSP8Burnable is LSP8IdentifiableDigitalAsset {
    /**
     * @notice Burning tokenId `tokenId`. This tokenId will not be recoverable! (additional data sent: `data`).
     *
     * @dev See internal {_burn} function for details.
     *
     * @param tokenId The tokenId to burn.
     * @param data Any extra data to be sent alongside burning the tokenId.
     */
    function burn(bytes32 tokenId, bytes memory data) public {
        if (!_isOperatorOrOwner(msg.sender, tokenId)) {
            revert LSP8NotTokenOperator(tokenId, msg.sender);
        }
        _burn(tokenId, data);
    }
}
