// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// interfaces
import {ILSP7DigitalAsset} from "../ILSP7DigitalAsset.sol";
import {ILSP7CompatibleERC20} from "./ILSP7CompatibleERC20.sol";

// modules
import {LSP4Compatibility} from "../../LSP4DigitalAssetMetadata/LSP4Compatibility.sol";
import {LSP7DigitalAssetCore} from "../LSP7DigitalAssetCore.sol";

/**
 * @dev LSP7 extension, for compatibility for clients / tools that expect ERC20.
 */
abstract contract LSP7CompatibleERC20Core is
    LSP4Compatibility,
    LSP7DigitalAssetCore,
    ILSP7CompatibleERC20
{
    // --- Overrides

    /**
     * @inheritdoc ILSP7CompatibleERC20
     */
    function approve(address operator, uint256 amount) public virtual override returns (bool) {
        authorizeOperator(operator, amount);
        return true;
    }

    /**
     * @inheritdoc ILSP7CompatibleERC20
     */
    function allowance(address tokenOwner, address operator)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return authorizedAmountFor(operator, tokenOwner);
    }

    /**
     * @inheritdoc ILSP7CompatibleERC20
     * @dev Compatible with ERC20 transfer.
     * Using force=true so that EOA and any contract may receive the tokens.
     */
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        transfer(msg.sender, to, amount, true, "");
        return true;
    }

    /**
     * @inheritdoc ILSP7CompatibleERC20
     * @dev Compatible with ERC20 transferFrom.
     * Using force=true so that EOA and any contract may receive the tokens.
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        transfer(from, to, amount, true, "");
        return true;
    }

    function authorizeOperator(address operator, uint256 amount)
        public
        virtual
        override(ILSP7DigitalAsset, LSP7DigitalAssetCore)
    {
        super.authorizeOperator(operator, amount);

        emit Approval(msg.sender, operator, amount);
    }

    // --- Internals

    function _transfer(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual override {
        super._transfer(from, to, amount, force, data);

        emit Transfer(from, to, amount);
    }

    function _mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual override {
        super._mint(to, amount, force, data);

        emit Transfer(address(0), to, amount);
    }

    function _burn(
        address from,
        uint256 amount,
        bytes memory data
    ) internal virtual override {
        super._burn(from, amount, data);

        emit Transfer(from, address(0), amount);
    }
}
