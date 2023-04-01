// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

// interfaces
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {ILSP7CompatibleERC20} from "./ILSP7CompatibleERC20.sol";
import {ILSP7DigitalAsset} from "../ILSP7DigitalAsset.sol";

// modules
import {LSP4Compatibility} from "../../LSP4DigitalAssetMetadata/LSP4Compatibility.sol";
import {
    LSP7DigitalAssetInitAbstract,
    LSP4DigitalAssetMetadataInitAbstract,
    ERC725YCore
} from "../LSP7DigitalAssetInitAbstract.sol";
import {LSP7DigitalAssetCore} from "../LSP7DigitalAssetCore.sol";

/**
 * @dev LSP7 extension, for compatibility for clients / tools that expect ERC20.
 */
abstract contract LSP7CompatibleERC20InitAbstract is
    ILSP7CompatibleERC20,
    LSP4Compatibility,
    LSP7DigitalAssetInitAbstract
{
    /**
     * @notice Sets the name, the symbol and the owner of the token
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param newOwner_ The owner of the token
     */

    function _initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) internal virtual override onlyInitializing {
        LSP7DigitalAssetInitAbstract._initialize(name_, symbol_, newOwner_, false);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(IERC165, ERC725YCore, LSP7DigitalAssetInitAbstract)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @inheritdoc ILSP7CompatibleERC20
     */
    function allowance(address tokenOwner, address operator) public view virtual returns (uint256) {
        return authorizedAmountFor(operator, tokenOwner);
    }

    /**
     * @inheritdoc ILSP7CompatibleERC20
     */
    function approve(address operator, uint256 amount) public virtual returns (bool) {
        authorizeOperator(operator, amount);
        return true;
    }

    /**
     * @inheritdoc ILSP7CompatibleERC20
     * @dev Compatible with ERC20 transferFrom.
     * Using allowNonLSP1Recipient=true so that EOA and any contract may receive the tokens.
     */
    function transferFrom(address from, address to, uint256 amount) public virtual returns (bool) {
        transfer(from, to, amount, true, "");
        return true;
    }

    // --- Overrides

    /**
     * @inheritdoc ILSP7CompatibleERC20
     * @dev Compatible with ERC20 transfer.
     * Using allowNonLSP1Recipient=true so that EOA and any contract may receive the tokens.
     */
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        transfer(msg.sender, to, amount, true, "");
        return true;
    }

    /**
     * @dev same behaviour as LSP7DigitalAssetCore
     * with the addition of emitting ERC20 Approval event.
     */
    function _updateOperator(
        address tokenOwner,
        address operator,
        uint256 amount
    ) internal virtual override {
        super._updateOperator(tokenOwner, operator, amount);
        emit Approval(tokenOwner, operator, amount);
    }

    function _transfer(
        address from,
        address to,
        uint256 amount,
        bool allowNonLSP1Recipient,
        bytes memory data
    ) internal virtual override {
        super._transfer(from, to, amount, allowNonLSP1Recipient, data);
        emit Transfer(from, to, amount);
    }

    function _mint(
        address to,
        uint256 amount,
        bool allowNonLSP1Recipient,
        bytes memory data
    ) internal virtual override {
        super._mint(to, amount, allowNonLSP1Recipient, data);
        emit Transfer(address(0), to, amount);
    }

    function _burn(address from, uint256 amount, bytes memory data) internal virtual override {
        super._burn(from, amount, data);
        emit Transfer(from, address(0), amount);
    }

    function _setData(
        bytes32 key,
        bytes memory value
    ) internal virtual override(LSP4DigitalAssetMetadataInitAbstract, ERC725YCore) {
        super._setData(key, value);
    }
}
