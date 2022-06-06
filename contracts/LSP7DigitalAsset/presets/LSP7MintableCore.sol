// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// interfaces
import {ILSP7Mintable} from "./ILSP7Mintable.sol";

// modules
import {LSP7DigitalAssetCore} from "../LSP7DigitalAssetCore.sol";

/**
 * @dev LSP7 extension, mintable .
 */
abstract contract LSP7MintableCore is LSP7DigitalAssetCore, ILSP7Mintable {
    /**
     * @inheritdoc ILSP7Mintable
     */
    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public virtual override {
        _mint(to, amount, force, data);
    }
}
