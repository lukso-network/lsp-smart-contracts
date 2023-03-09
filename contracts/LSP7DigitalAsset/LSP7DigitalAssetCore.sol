// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.4;

// interfaces
import {ILSP1UniversalReceiver} from "../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";
import {ILSP7DigitalAsset} from "./ILSP7DigitalAsset.sol";

// libraries
import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {GasLib} from "../Utils/GasLib.sol";
import {LSP1Utils} from "../LSP1UniversalReceiver/LSP1Utils.sol";

// modules
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import {ERC725Y} from "@erc725/smart-contracts/contracts/ERC725Y.sol";

// errors
import "./LSP7Errors.sol";

// constants
import {_INTERFACEID_LSP1} from "../LSP1UniversalReceiver/LSP1Constants.sol";
import {_TYPEID_LSP7_TOKENSSENDER, _TYPEID_LSP7_TOKENSRECIPIENT} from "./LSP7Constants.sol";

/**
 * @title LSP7DigitalAsset contract
 * @author Matthew Stevens
 * @dev Core Implementation of a LSP7 compliant contract.
 *
 * This contract implement the core logic of the functions for the {ILSP7DigitalAsset} interface.
 */
abstract contract LSP7DigitalAssetCore is ILSP7DigitalAsset {
    using LSP1Utils for address;

    // --- Storage

    bool internal _isNonDivisible;

    uint256 internal _existingTokens;

    // Mapping from `tokenOwner` to an `amount` of tokens
    mapping(address => uint256) internal _tokenOwnerBalances;

    // Mapping a `tokenOwner` to an `operator` to `amount` of tokens.
    mapping(address => mapping(address => uint256)) internal _operatorAuthorizedAmount;

    // --- Token queries

    /**
     * @inheritdoc ILSP7DigitalAsset
     */
    function decimals() public view virtual returns (uint8) {
        return _isNonDivisible ? 0 : 18;
    }

    /**
     * @inheritdoc ILSP7DigitalAsset
     */
    function totalSupply() public view virtual returns (uint256) {
        return _existingTokens;
    }

    // --- Token owner queries

    /**
     * @inheritdoc ILSP7DigitalAsset
     */
    function balanceOf(address tokenOwner) public view virtual returns (uint256) {
        return _tokenOwnerBalances[tokenOwner];
    }

    // --- Operator functionality

    /**
     * @inheritdoc ILSP7DigitalAsset
     *
     * @dev To avoid front-running and Allowance Double-Spend Exploit when
     * increasing or decreasing the authorized amount of an operator,
     * it is advised to:
     *     1. call {revokeOperator} first, and
     *     2. then re-call {authorizeOperator} with the new amount
     *
     * for more information, see:
     * https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/
     *
     */
    function authorizeOperator(address operator, uint256 amount) public virtual {
        _updateOperator(msg.sender, operator, amount);
    }

    /**
     * @inheritdoc ILSP7DigitalAsset
     */
    function revokeOperator(address operator) public virtual {
        _updateOperator(msg.sender, operator, 0);
    }

    /**
     * @inheritdoc ILSP7DigitalAsset
     */
    function authorizedAmountFor(address operator, address tokenOwner)
        public
        view
        virtual
        returns (uint256)
    {
        if (tokenOwner == operator) {
            return _tokenOwnerBalances[tokenOwner];
        } else {
            return _operatorAuthorizedAmount[tokenOwner][operator];
        }
    }

    // --- Transfer functionality

    /**
     * @inheritdoc ILSP7DigitalAsset
     */
    function transfer(
        address from,
        address to,
        uint256 amount,
        bool allowNonLSP1Recipient,
        bytes memory data
    ) public virtual {
        if (from == to) revert LSP7CannotSendToSelf();

        address operator = msg.sender;
        if (operator != from) {
            uint256 operatorAmount = _operatorAuthorizedAmount[from][operator];
            if (amount > operatorAmount) {
                revert LSP7AmountExceedsAuthorizedAmount(from, operatorAmount, operator, amount);
            }

            _updateOperator(from, operator, operatorAmount - amount);
        }

        _transfer(from, to, amount, allowNonLSP1Recipient, data);
    }

    /**
     * @inheritdoc ILSP7DigitalAsset
     */
    function transferBatch(
        address[] memory from,
        address[] memory to,
        uint256[] memory amount,
        bool[] memory allowNonLSP1Recipient,
        bytes[] memory data
    ) public virtual {
        uint256 fromLength = from.length;
        if (
            fromLength != to.length ||
            fromLength != amount.length ||
            fromLength != allowNonLSP1Recipient.length ||
            fromLength != data.length
        ) {
            revert LSP7InvalidTransferBatch();
        }

        for (uint256 i = 0; i < fromLength; i = GasLib.uncheckedIncrement(i)) {
            // using the public transfer function to handle updates to operator authorized amounts
            transfer(from[i], to[i], amount[i], allowNonLSP1Recipient[i], data[i]);
        }
    }

    /**
     * @dev Changes token `amount` the `operator` has access to from `tokenOwner` tokens. If the
     * amount is zero then the operator is being revoked, otherwise the operator amount is being
     * modified.
     *
     * See {authorizedAmountFor}.
     *
     * Emits either {AuthorizedOperator} or {RevokedOperator} event.
     *
     * Requirements
     *
     * - `operator` cannot be the zero address.
     */
    function _updateOperator(
        address tokenOwner,
        address operator,
        uint256 amount
    ) internal virtual {
        if (operator == address(0)) {
            revert LSP7CannotUseAddressZeroAsOperator();
        }

        if (operator == tokenOwner) {
            revert LSP7TokenOwnerCannotBeOperator();
        }

        _operatorAuthorizedAmount[tokenOwner][operator] = amount;

        if (amount != 0) {
            emit AuthorizedOperator(operator, tokenOwner, amount);
        } else {
            emit RevokedOperator(operator, tokenOwner);
        }
    }

    /**
     * @dev Mints `amount` tokens and transfers it to `to`.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     *
     * Emits a {Transfer} event.
     */
    function _mint(
        address to,
        uint256 amount,
        bool allowNonLSP1Recipient,
        bytes memory data
    ) internal virtual {
        if (to == address(0)) {
            revert LSP7CannotSendWithAddressZero();
        }

        address operator = msg.sender;

        _beforeTokenTransfer(address(0), to, amount);

        // tokens being minted
        _existingTokens += amount;

        _tokenOwnerBalances[to] += amount;

        emit Transfer(operator, address(0), to, amount, allowNonLSP1Recipient, data);

        bytes memory lsp1Data = abi.encodePacked(address(0), to, amount, data);
        _notifyTokenReceiver(to, allowNonLSP1Recipient, lsp1Data);
    }

    /**
     * @dev Destroys `amount` tokens.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `from` must have at least `amount` tokens.
     * - If the caller is not `from`, it must be an operator for `from` with access to at least
     * `amount` tokens.
     *
     * Emits a {Transfer} event.
     */
    function _burn(
        address from,
        uint256 amount,
        bytes memory data
    ) internal virtual {
        if (from == address(0)) {
            revert LSP7CannotSendWithAddressZero();
        }

        uint256 balance = _tokenOwnerBalances[from];
        if (amount > balance) {
            revert LSP7AmountExceedsBalance(balance, from, amount);
        }

        address operator = msg.sender;
        if (operator != from) {
            uint256 authorizedAmount = _operatorAuthorizedAmount[from][operator];
            if (amount > authorizedAmount) {
                revert LSP7AmountExceedsAuthorizedAmount(from, authorizedAmount, operator, amount);
            }
            _operatorAuthorizedAmount[from][operator] -= amount;
        }

        _beforeTokenTransfer(from, address(0), amount);

        // tokens being burned
        _existingTokens -= amount;

        _tokenOwnerBalances[from] -= amount;

        emit Transfer(operator, from, address(0), amount, false, data);

        bytes memory lsp1Data = abi.encodePacked(from, address(0), amount, data);

        /// @dev An attempt is made to notify the token sender about
        /// the `amount` of tokens being burnt using LSP1.
        from.tryNotifyUniversalReceiver(_TYPEID_LSP7_TOKENSSENDER, lsp1Data);
    }

    /**
     * @dev Transfers `amount` tokens from `from` to `to`.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - `from` cannot be the zero address.
     * - `from` must have at least `amount` tokens.
     * - If the caller is not `from`, it must be an operator for `from` with access to at least
     * `amount` tokens.
     *
     * Emits a {Transfer} event.
     */
    function _transfer(
        address from,
        address to,
        uint256 amount,
        bool allowNonLSP1Recipient,
        bytes memory data
    ) internal virtual {
        if (from == address(0) || to == address(0)) {
            revert LSP7CannotSendWithAddressZero();
        }

        uint256 balance = _tokenOwnerBalances[from];
        if (amount > balance) {
            revert LSP7AmountExceedsBalance(balance, from, amount);
        }

        address operator = msg.sender;

        _beforeTokenTransfer(from, to, amount);

        _tokenOwnerBalances[from] -= amount;
        _tokenOwnerBalances[to] += amount;

        emit Transfer(operator, from, to, amount, allowNonLSP1Recipient, data);

        bytes memory lsp1Data = abi.encodePacked(from, to, amount, data);

        /// @dev An attempt is made to notify the token sender and recipients about
        /// the `amount` of tokens changing owners using LSP1.
        from.tryNotifyUniversalReceiver(_TYPEID_LSP7_TOKENSSENDER, lsp1Data);
        _notifyTokenReceiver(to, allowNonLSP1Recipient, lsp1Data);
    }

    /**
     * @dev Hook that is called before any token transfer. This includes minting
     * and burning.
     *
     * Calling conditions:
     *
     * - When `from` and `to` are both non-zero, ``from``'s `amount` tokens will be
     * transferred to `to`.
     * - When `from` is zero, `amount` tokens will be minted for `to`.
     * - When `to` is zero, ``from``'s `amount` tokens will be burned.
     * - `from` and `to` are never both zero.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}

    /**
     * @dev An attempt is made to notify the token receiver about the `amount` tokens changing owners
     * using LSP1 interface. When allowNonLSP1Recipient is FALSE the token receiver MUST support LSP1.
     *
     * The receiver may revert when the token being sent is not wanted.
     */
    function _notifyTokenReceiver(
        address to,
        bool allowNonLSP1Recipient,
        bytes memory lsp1Data
    ) internal virtual {
        if (ERC165Checker.supportsERC165InterfaceUnchecked(to, _INTERFACEID_LSP1)) {
            ILSP1UniversalReceiver(to).universalReceiver(_TYPEID_LSP7_TOKENSRECIPIENT, lsp1Data);
        } else if (!allowNonLSP1Recipient) {
            if (to.code.length > 0) {
                revert LSP7NotifyTokenReceiverContractMissingLSP1Interface(to);
            } else {
                revert LSP7NotifyTokenReceiverIsEOA(to);
            }
        }
    }
}
