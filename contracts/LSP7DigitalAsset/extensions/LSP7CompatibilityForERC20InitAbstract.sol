// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import "../LSP7DigitalAssetInitAbstract.sol";
import "./LSP7CompatibilityForERC20Core.sol";

contract LSP7CompatibilityForERC20InitAbstract is LSP7CompatibilityForERC20Core, LSP7DigitalAssetInitAbstract {
    /**
     * @notice Sets the name, the symbol and the owner of the token
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param newOwner_ The owner of the token
     */
    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) public virtual override onlyInitializing {
        LSP7DigitalAssetInitAbstract.initialize(name_, symbol_, newOwner_, false);
    }

    // --- Overrides

    function authorizeOperator(address operator, uint256 amount)
    public
        virtual
        override(LSP7DigitalAssetCore, LSP7CompatibilityForERC20Core)
    {
        super.authorizeOperator(operator, amount);
    }

    function _burn(address from, uint256 amount, bytes memory data)
        internal
        virtual
        override(LSP7DigitalAssetCore, LSP7CompatibilityForERC20Core)
    {
        super._burn(from, amount, data);
    }

    function _mint(address to, uint256 amount, bool force, bytes memory data)
    internal
        virtual
        override(LSP7DigitalAssetCore, LSP7CompatibilityForERC20Core) {
            super._mint(to, amount, force, data);
    }

    function _transfer(address from, address to, uint256 amount, bool force, bytes memory data)
    internal
        virtual
        override(LSP7DigitalAssetCore, LSP7CompatibilityForERC20Core) {
            super._transfer(from, to, amount, force, data);
    }
}
