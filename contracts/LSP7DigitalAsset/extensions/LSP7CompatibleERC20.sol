// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

// interfaces
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {ILSP7CompatibleERC20} from "./ILSP7CompatibleERC20.sol";

// modules
import {
    LSP4Compatibility
} from "../../LSP4DigitalAssetMetadata/LSP4Compatibility.sol";
import {
    LSP7DigitalAsset,
    LSP7DigitalAssetCore,
    LSP4DigitalAssetMetadata,
    ERC725YCore
} from "../LSP7DigitalAsset.sol";

/**
 * @dev LSP7 extension, for compatibility for clients / tools that expect ERC20.
 */
abstract contract LSP7CompatibleERC20 is
    ILSP7CompatibleERC20,
    LSP4Compatibility,
    LSP7DigitalAsset
{
    /**
     * @notice Deploying a `LSP7CompatibleERC20` token contract with: token name = `name_`, token symbol = `symbol_`, and
     * address `newOwner_` as the token contract owner.
     *
     * @param name_ The name of the token.
     * @param symbol_ The symbol of the token.
     * @param newOwner_ The owner of the token contract.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) LSP7DigitalAsset(name_, symbol_, newOwner_, false) {}

    /**
     * @inheritdoc LSP7DigitalAsset
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(IERC165, ERC725YCore, LSP7DigitalAsset)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @inheritdoc ILSP7CompatibleERC20
     */
    function allowance(
        address tokenOwner,
        address operator
    ) public view virtual returns (uint256) {
        return authorizedAmountFor(operator, tokenOwner);
    }

    /**
     * @inheritdoc ILSP7CompatibleERC20
     */
    function approve(
        address operator,
        uint256 amount
    ) public virtual returns (bool) {
        authorizeOperator(operator, amount);
        return true;
    }

    /**
     * @inheritdoc ILSP7CompatibleERC20
     *
     * @custom:info This function uses the `allowNonLSP1Recipient` parameter as `true` so that EOA and any contract can receive tokens.
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual returns (bool) {
        transfer(from, to, amount, true, "");
        return true;
    }

    // --- Overrides

    /**
     * @inheritdoc ILSP7CompatibleERC20
     *
     * @custom:info This function uses the `allowNonLSP1Recipient` parameter as `true` so that EOA and any contract can receive tokens.
     */
    function transfer(
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        transfer(msg.sender, to, amount, true, "");
        return true;
    }

    /**
     * @inheritdoc LSP7DigitalAssetCore
     */
    function _updateOperator(
        address tokenOwner,
        address operator,
        uint256 amount
    ) internal virtual override {
        super._updateOperator(tokenOwner, operator, amount);
        emit Approval(tokenOwner, operator, amount);
    }

    /**
     * @inheritdoc LSP7DigitalAssetCore
     *
     * @custom:events
     * - LSP7 {Transfer} event.
     * - ERC20 {Transfer} event.
     */
    function _transfer(
        address from,
        address to,
        uint256 amount,
        bool allowNonLSP1Recipient,
        bytes memory data
    ) internal virtual override {
        emit Transfer(from, to, amount);
        super._transfer(from, to, amount, allowNonLSP1Recipient, data);
    }

    /**
     * @inheritdoc LSP7DigitalAssetCore
     *
     * @custom:events
     * - LSP7 {Transfer} event with `address(0)` as `from`.
     * - ERC20 {Transfer} event with `address(0)` as `from`.
     */
    function _mint(
        address to,
        uint256 amount,
        bool allowNonLSP1Recipient,
        bytes memory data
    ) internal virtual override {
        emit Transfer(address(0), to, amount);
        super._mint(to, amount, allowNonLSP1Recipient, data);
    }

    /**
     * @inheritdoc LSP7DigitalAssetCore
     *
     * @custom:events
     * - LSP7 {Transfer} event with `address(0)` as the `to` address.
     * - ERC20 {Transfer} event with `address(0)` as the `to` address.
     */
    function _burn(
        address from,
        uint256 amount,
        bytes memory data
    ) internal virtual override {
        emit Transfer(from, address(0), amount);
        super._burn(from, amount, data);
    }

    /**
     * @inheritdoc LSP4DigitalAssetMetadata
     */
    function _setData(
        bytes32 key,
        bytes memory value
    ) internal virtual override(LSP4DigitalAssetMetadata, ERC725YCore) {
        super._setData(key, value);
    }
}
