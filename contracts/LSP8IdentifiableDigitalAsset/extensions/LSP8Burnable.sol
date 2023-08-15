// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {
    LSP8IdentifiableDigitalAsset
} from "../LSP8IdentifiableDigitalAsset.sol";

// errors
import {LSP8NotTokenOperator} from "../LSP8Errors.sol";

/**
 * @dev LSP8 extension (standard version) that allows token holders to destroy both
 * their own tokens and those that they have an allowance for as an operator.
 */
abstract contract LSP8Burnable is LSP8IdentifiableDigitalAsset {
    function burn(bytes32 tokenId, bytes memory data) public virtual {
        if (!_isOperatorOrOwner(msg.sender, tokenId)) {
            revert LSP8NotTokenOperator(tokenId, msg.sender);
        }
        _burn(tokenId, data);
    }
}
