// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import {LSP7DigitalAsset, LSP4DigitalAssetMetadata, ERC725YCore} from "../LSP7DigitalAsset.sol";
import {LSP7DigitalAssetCore} from "../LSP7DigitalAssetCore.sol";
import {LSP7CompatibilityForERC20Core} from "./LSP7CompatibilityForERC20Core.sol";

contract LSP7CompatibilityForERC20 is LSP7DigitalAsset, LSP7CompatibilityForERC20Core {
    /* solhint-disable no-empty-blocks */
    /**
     * @notice Sets the name, the symbol and the owner of the token
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param newOwner_ The owner of the token
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) LSP7DigitalAsset(name_, symbol_, newOwner_, false) {}

    // --- Overrides

    function authorizeOperator(address operator, uint256 amount)
        public
        virtual
        override(LSP7DigitalAssetCore, LSP7CompatibilityForERC20Core)
    {
        super.authorizeOperator(operator, amount);
    }

    function _burn(
        address from,
        uint256 amount,
        bytes memory data
    ) internal virtual override(LSP7DigitalAssetCore, LSP7CompatibilityForERC20Core) {
        super._burn(from, amount, data);
    }

    function _mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual override(LSP7DigitalAssetCore, LSP7CompatibilityForERC20Core) {
        super._mint(to, amount, force, data);
    }

    function _transfer(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual override(LSP7DigitalAssetCore, LSP7CompatibilityForERC20Core) {
        super._transfer(from, to, amount, force, data);
    }

    function _setData(bytes32 key, bytes memory value)
        internal
        virtual
        override(LSP4DigitalAssetMetadata, ERC725YCore)
    {
        super._setData(key, value);
    }
}
