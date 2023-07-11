// SPDX-License-Identifier: MIT
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
abstract contract LSP8Burnable is LSP8IdentifiableDigitalAssetCore {
    /**
     * @dev See internal {_burn} function for details.
     */
    function burn(bytes32 tokenId, bytes memory data) public {
        if (!_isOperatorOrOwner(msg.sender, tokenId)) {
            revert LSP8NotTokenOperator(tokenId, msg.sender);
        }
        _burn(tokenId, data);
    }
}
