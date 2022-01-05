// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import "../LSP7DigitalAssetCore.sol";

// interfaces
import "./ILSP7Mintable.sol";

/**
 * @dev LSP7 extension, mintable .
 */
abstract contract LSP7MintableCore is ILSP7Mintable, LSP7DigitalAssetCore {
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
