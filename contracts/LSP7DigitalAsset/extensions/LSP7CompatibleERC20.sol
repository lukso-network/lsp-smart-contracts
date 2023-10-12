// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;
// interfaces
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {
    IERC20Metadata,
    IERC20
} from "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";
import {ILSP7CompatibleERC20} from "./ILSP7CompatibleERC20.sol";

// modules
import {
    ERC725YCore,
    LSP4DigitalAssetMetadata,
    LSP7DigitalAssetCore,
    LSP7DigitalAsset
} from "../LSP7DigitalAsset.sol";

// constants
import {
    _LSP4_TOKEN_NAME_KEY,
    _LSP4_TOKEN_SYMBOL_KEY
} from "../../LSP4DigitalAssetMetadata/LSP4Constants.sol";

/**
 * @dev LSP7 extension, for compatibility for clients / tools that expect ERC20.
 */
abstract contract LSP7CompatibleERC20 is IERC20Metadata, LSP7DigitalAsset {
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
     * @dev Returns the name of the token.
     * @return The name of the token
     */
    function name() public view virtual override returns (string memory) {
        bytes memory data = _getData(_LSP4_TOKEN_NAME_KEY);
        return string(data);
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the name.
     * @return The symbol of the token
     */
    function symbol() public view virtual override returns (string memory) {
        bytes memory data = _getData(_LSP4_TOKEN_SYMBOL_KEY);
        return string(data);
    }

    function decimals()
        public
        view
        virtual
        override(IERC20Metadata, LSP7DigitalAssetCore)
        returns (uint8)
    {
        return super.decimals();
    }

    function totalSupply()
        public
        view
        virtual
        override(IERC20, LSP7DigitalAssetCore)
        returns (uint256)
    {
        return super.totalSupply();
    }

    function balanceOf(
        address tokenOwner
    )
        public
        view
        virtual
        override(IERC20, LSP7DigitalAssetCore)
        returns (uint256)
    {
        return super.balanceOf(tokenOwner);
    }

    /**
     * @inheritdoc LSP7DigitalAsset
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        // TODO: add support interface for ERC20
        return super.supportsInterface(interfaceId);
    }

    /**
     * @inheritdoc IERC20
     */
    function allowance(
        address tokenOwner,
        address operator
    ) public view virtual returns (uint256) {
        return authorizedAmountFor(operator, tokenOwner);
    }

    /**
     * @inheritdoc IERC20
     */
    function approve(
        address operator,
        uint256 amount
    ) public virtual returns (bool) {
        authorizeOperator(operator, amount, "");
        return true;
    }

    /**
     * @inheritdoc IERC20
     *
     * @custom:info This function uses the `force` parameter as `true` so that EOA and any contract can receive tokens.
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
     * @inheritdoc IERC20
     *
     * @custom:info This function uses the `force` parameter as `true` so that EOA and any contract can receive tokens.
     */
    function transfer(
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        transfer(msg.sender, to, amount, true, "");
        return true;
    }

    function _updateOperator(
        address tokenOwner,
        address operator,
        uint256 amount,
        bytes memory operatorNotificationData
    ) internal virtual override {
        super._updateOperator(
            tokenOwner,
            operator,
            amount,
            operatorNotificationData
        );
        emit Approval(tokenOwner, operator, amount);
    }

    /**
     * @custom:events
     * - LSP7 {Transfer} event.
     * - ERC20 {Transfer} event.
     */
    function _transfer(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual override {
        emit Transfer(from, to, amount);
        super._transfer(from, to, amount, force, data);
    }

    /**
     * @custom:events
     * - LSP7 {Transfer} event with `address(0)` as `from`.
     * - ERC20 {Transfer} event with `address(0)` as `from`.
     */
    function _mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual override {
        emit Transfer(address(0), to, amount);
        super._mint(to, amount, force, data);
    }

    /**
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
    ) internal virtual override {
        super._setData(key, value);
    }
}
