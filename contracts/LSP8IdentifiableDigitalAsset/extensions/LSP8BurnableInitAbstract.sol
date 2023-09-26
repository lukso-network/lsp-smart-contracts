// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {
    LSP8IdentifiableDigitalAssetInitAbstract
} from "../LSP8IdentifiableDigitalAssetInitAbstract.sol";

// errors
import {LSP8NotTokenOperator} from "../LSP8Errors.sol";

/**
 * @dev LSP8 extension (proxy version) that allows token holders to destroy both
 * their own tokens and those that they have an allowance for as an operator.
 */
abstract contract LSP8BurnableInitAbstract is
    LSP8IdentifiableDigitalAssetInitAbstract
{
    function burn(bytes32 tokenId, bytes memory data) public virtual {
        if (!_isOperatorOrOwner(msg.sender, tokenId)) {
            revert LSP8NotTokenOperator(tokenId, msg.sender);
        }
        _burn(tokenId, data);
    }
}
