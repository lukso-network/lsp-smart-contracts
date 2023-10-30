// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

// interfaces
import {
    IERC20Metadata,
    IERC20
} from "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";

// modules
import {
    LSP7DigitalAssetCore,
    LSP7DigitalAssetInitAbstract
} from "../LSP7DigitalAssetInitAbstract.sol";

// constants
import {
    _LSP4_TOKEN_NAME_KEY,
    _LSP4_TOKEN_SYMBOL_KEY
} from "../../LSP4DigitalAssetMetadata/LSP4Constants.sol";

/**
 * @dev LSP7 extension, for compatibility for clients / tools that expect ERC20.
 */
abstract contract LSP7CompatibleERC20InitAbstract is
    IERC20Metadata,
    LSP7DigitalAssetInitAbstract
{
    /**
     * @notice Initializing a `LSP7CompatibleERC20` token contract with: token name = `name_`, token symbol = `symbol_`, and
     * address `newOwner_` as the token contract owner.
     *
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param newOwner_ The owner of the token
     */
    function _initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) internal virtual override onlyInitializing {
        LSP7DigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            false
        );
    }

    /**
     * @inheritdoc IERC20Metadata
     * @dev Returns the name of the token.
     * For compatibility with clients & tools that expect ERC20.
     *
     * @return The name of the token
     */
    function name() public view virtual override returns (string memory) {
        bytes memory data = _getData(_LSP4_TOKEN_NAME_KEY);
        return string(data);
    }

    /**
     * @inheritdoc IERC20Metadata
     * @dev Returns the symbol of the token, usually a shorter version of the name.
     * For compatibility with clients & tools that expect ERC20.
     *
     * @return The symbol of the token
     */
    function symbol() public view virtual override returns (string memory) {
        bytes memory data = _getData(_LSP4_TOKEN_SYMBOL_KEY);
        return string(data);
    }

    /**
     * @inheritdoc LSP7DigitalAssetCore
     */
    function decimals()
        public
        view
        virtual
        override(IERC20Metadata, LSP7DigitalAssetCore)
        returns (uint8)
    {
        return super.decimals();
    }

    /**
     * @inheritdoc LSP7DigitalAssetCore
     */
    function totalSupply()
        public
        view
        virtual
        override(IERC20, LSP7DigitalAssetCore)
        returns (uint256)
    {
        return super.totalSupply();
    }

    /**
     * @inheritdoc LSP7DigitalAssetCore
     */
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
     * @inheritdoc LSP7DigitalAssetInitAbstract
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return
            interfaceId == type(IERC20).interfaceId ||
            interfaceId == type(IERC20Metadata).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @inheritdoc IERC20
     * @dev Function to get operator allowance allowed to spend on behalf of `tokenOwner` from the ERC20 standard interface.
     *
     * @param tokenOwner The address of the token owner
     * @param operator The address approved by the `tokenOwner`
     *
     * @return The amount `operator` is approved by `tokenOwner`
     */
    function allowance(
        address tokenOwner,
        address operator
    ) public view virtual override returns (uint256) {
        return authorizedAmountFor(operator, tokenOwner);
    }

    /**
     * @inheritdoc IERC20
     * @dev Approval function from th ERC20 standard interface.
     *
     * @param operator The address to approve for `amount`
     * @param amount The amount to approve.
     *
     * @return `true` on successful approval.
     */
    function approve(
        address operator,
        uint256 amount
    ) public virtual returns (bool) {
        if (amount != 0) {
            authorizeOperator(operator, amount, "");
        } else {
            revokeOperator(operator, false, "");
        }
        return true;
    }

    /**
     * @inheritdoc IERC20
     * @dev Transfer functions for operators from the ERC20 standard interface.
     *
     * @param from The address sending tokens.
     * @param to The address receiving tokens.
     * @param amount The amount of tokens to transfer.
     *
     * @return `true` on successful transfer.
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
     * @dev Transfer function from the ERC20 standard interface.
     *
     * @param to The address receiving tokens.
     * @param amount The amount of tokens to transfer.
     *
     * @return `true` on successful transfer.
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

    /**
     * @inheritdoc LSP7DigitalAssetCore
     */
    function _updateOperator(
        address tokenOwner,
        address operator,
        uint256 amount,
        bool notified,
        bytes memory operatorNotificationData
    ) internal virtual override {
        super._updateOperator(
            tokenOwner,
            operator,
            amount,
            notified,
            operatorNotificationData
        );
        emit IERC20.Approval(tokenOwner, operator, amount);
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
        emit IERC20.Transfer(from, to, amount);
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
        emit IERC20.Transfer(address(0), to, amount);
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
        emit IERC20.Transfer(from, address(0), amount);
        super._burn(from, amount, data);
    }
}
