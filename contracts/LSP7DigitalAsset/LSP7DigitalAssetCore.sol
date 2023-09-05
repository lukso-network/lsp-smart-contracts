// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.4;

// interfaces
import {
    ILSP1UniversalReceiver
} from "../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";
import {ILSP7DigitalAsset} from "./ILSP7DigitalAsset.sol";

// libraries
import {
    ERC165Checker
} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

// errors
import "./LSP7Errors.sol";

// constants
import {_INTERFACEID_LSP1} from "../LSP1UniversalReceiver/LSP1Constants.sol";
import {
    _TYPEID_LSP7_TOKENSSENDER,
    _TYPEID_LSP7_TOKENSRECIPIENT
} from "./LSP7Constants.sol";

/**
 * @title LSP7DigitalAsset contract
 * @author Matthew Stevens
 * @dev Core Implementation of a LSP7 compliant contract.
 *
 * This contract implement the core logic of the functions for the {ILSP7DigitalAsset} interface.
 *
 * Similar to ERC20, the non-standard {increaseAllowance} and {decreaseAllowance} functions
 * have been added to mitigate the well-known issues around setting allowances.
 */
abstract contract LSP7DigitalAssetCore is ILSP7DigitalAsset {
    using EnumerableSet for EnumerableSet.AddressSet;
    // --- Storage

    // Mapping from `tokenOwner` to an `amount` of tokens
    mapping(address => uint256) internal _tokenOwnerBalances;

    // Mapping a `tokenOwner` to an `operator` to `amount` of tokens.
    mapping(address => mapping(address => uint256))
        internal _operatorAuthorizedAmount;

    // Mapping an `address` to its authorized operator addresses.
    mapping(address => EnumerableSet.AddressSet) internal _operators;

    uint256 internal _existingTokens;

    bool internal _isNonDivisible;

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
    function balanceOf(
        address tokenOwner
    ) public view virtual returns (uint256) {
        return _tokenOwnerBalances[tokenOwner];
    }

    // --- Operator functionality

    /**
     * @inheritdoc ILSP7DigitalAsset
     *
     * @custom:danger To avoid front-running and Allowance Double-Spend Exploit when
     * increasing or decreasing the authorized amount of an operator, it is advised to:
     *
     *     1. either call {revokeOperator} first, and then re-call {authorizeOperator} with the new amount.
     *     2. or use the non-standard functions {increaseAllowance} or {decreaseAllowance}.
     *
     * For more information, see:
     * https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/
     */
    function authorizeOperator(
        address operator,
        uint256 amount
    ) public virtual {
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
    function authorizedAmountFor(
        address operator,
        address tokenOwner
    ) public view virtual returns (uint256) {
        if (tokenOwner == operator) {
            return _tokenOwnerBalances[tokenOwner];
        } else {
            return _operatorAuthorizedAmount[tokenOwner][operator];
        }
    }

    /**
     * @inheritdoc ILSP7DigitalAsset
     */
    function getOperatorsOf(
        address tokenOwner
    ) public view virtual returns (address[] memory) {
        return _operators[tokenOwner].values();
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
                revert LSP7AmountExceedsAuthorizedAmount(
                    from,
                    operatorAmount,
                    operator,
                    amount
                );
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

        for (uint256 i = 0; i < fromLength; ) {
            // using the public transfer function to handle updates to operator authorized amounts
            transfer(
                from[i],
                to[i],
                amount[i],
                allowNonLSP1Recipient[i],
                data[i]
            );

            unchecked {
                ++i;
            }
        }
    }

    /**
     * @custom:info This is a non-standard function, not part of the LSP7 standard interface.
     * It has been added in the LSP7 contract implementation so that it can be used as a prevention mechanism
     * against double spending allowance vulnerability.
     *
     * @notice Increase the allowance of `operator` by +`addedAmount`
     *
     * @dev Atomically increases the allowance granted to `operator` by the caller.
     * This is an alternative approach to {authorizeOperator} that can be used as a mitigation
     * for the double spending allowance problem.
     *
     * @param operator the operator to increase the allowance for `msg.sender`
     * @param addedAmount the additional amount to add on top of the current operator's allowance
     *
     * @custom:requirements
     *  - `operator` cannot be the same address as `msg.sender`
     *  - `operator` cannot be the zero address.
     *
     * @custom:events {AuthorizedOperator} indicating the updated allowance
     */
    function increaseAllowance(
        address operator,
        uint256 addedAmount
    ) public virtual {
        _updateOperator(
            msg.sender,
            operator,
            authorizedAmountFor(operator, msg.sender) + addedAmount
        );
    }

    /**
     * @custom:info This is a non-standard function, not part of the LSP7 standard interface.
     * It has been added in the LSP7 contract implementation so that it can be used as a prevention mechanism
     * against the double spending allowance vulnerability.
     *
     * @notice Decrease the allowance of `operator` by -`substractedAmount`
     *
     * @dev Atomically decreases the allowance granted to `operator` by the caller.
     * This is an alternative approach to {authorizeOperator} that can be used as a mitigation
     * for the double spending allowance problem.
     *
     * @custom:events
     *  - {AuthorizedOperator} event indicating the updated allowance after decreasing it.
     *  - {RevokeOperator} event if `substractedAmount` is the full allowance,
     *    indicating `operator` does not have any alauthorizedAmountForlowance left for `msg.sender`.
     *
     * @param operator the operator to decrease allowance for `msg.sender`
     * @param substractedAmount the amount to decrease by in the operator's allowance.
     *
     * @custom:requirements
     *  - `operator` cannot be the zero address.
     *  - `operator` must have allowance for the caller of at least `substractedAmount`.
     */
    function decreaseAllowance(
        address operator,
        uint256 substractedAmount
    ) public virtual {
        uint256 currentAllowance = authorizedAmountFor(operator, msg.sender);
        if (currentAllowance < substractedAmount) {
            revert LSP7DecreasedAllowanceBelowZero();
        }

        unchecked {
            _updateOperator(
                msg.sender,
                operator,
                currentAllowance - substractedAmount
            );
        }
    }

    /**
     * @dev Changes token `amount` the `operator` has access to from `tokenOwner` tokens.
     * If the amount is zero the operator is removed from the list of operators, otherwise he is added to the list of operators.
     * If the amount is zero then the operator is being revoked, otherwise the operator amount is being modified.
     *
     * @custom:events
     * - {RevokedOperator} event when operator's allowance is set to `0`.
     * - {AuthorizedOperator} event when operator's allowance is set to any other amount.
     *
     * @custom:requirements
     * - `operator` cannot be the zero address.
     * - `operator` cannot be the same address as `tokenOwner`.
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
            _operators[tokenOwner].add(operator);
            emit AuthorizedOperator(operator, tokenOwner, amount);
        } else {
            _operators[tokenOwner].remove(operator);
            emit RevokedOperator(operator, tokenOwner);
        }
    }

    /**
     * @dev Mints `amount` of tokens and transfers it to `to`.
     *
     * @param to the address to mint tokens for.
     * @param amount the amount of tokens to mint.
     * @param allowNonLSP1Recipient a boolean that describe if transfer to a `to` address that does not support LSP1 is allowed or not.
     * @param data Additional data the caller wants included in the emitted {Transfer} event, and sent in the LSP1 hook to the `to` address.
     *
     * @custom:requirements
     * - `to` cannot be the zero address.
     *
     * @custom:events {Transfer} event with `address(0)` as `from`.
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

        emit Transfer(
            operator,
            address(0),
            to,
            amount,
            allowNonLSP1Recipient,
            data
        );

        bytes memory lsp1Data = abi.encode(address(0), to, amount, data);
        _notifyTokenReceiver(to, allowNonLSP1Recipient, lsp1Data);
    }

    /**
     * @dev Burns (= destroys) `amount` of tokens, decrease the `from` balance. This is done by sending them to the zero address.
     *
     * Both the sender and recipient will be notified of the token transfer through the LSP1 {universalReceiver}
     * function, if they are contracts that support the LSP1 interface. Their `universalReceiver` function will receive
     * all the parameters in the calldata packed encoded.
     *
     * Any logic in the {_beforeTokenTransfer} function will run before updating the balances.
     *
     * @param from the address to burn tokens from its balance.
     * @param amount the amount of tokens to burn.
     * @param data Additional data the caller wants included in the emitted event, and sent in the LSP1 hook to the `from` and `to` address.
     *
     * @custom:hint In dApps, you can know which address is burning tokens by listening for the `Transfer` event and filter with the zero address as `to`.
     *
     * @custom:requirements
     * - `from` cannot be the zero address.
     * - `from` must have at least `amount` tokens.
     * - If the caller is not `from`, it must be an operator for `from` with access to at least
     * `amount` tokens.
     *
     * @custom:events {Transfer} event with `address(0)` as the `to` address
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
            uint256 authorizedAmount = _operatorAuthorizedAmount[from][
                operator
            ];
            if (amount > authorizedAmount) {
                revert LSP7AmountExceedsAuthorizedAmount(
                    from,
                    authorizedAmount,
                    operator,
                    amount
                );
            }
            _operatorAuthorizedAmount[from][operator] -= amount;
        }

        _beforeTokenTransfer(from, address(0), amount);

        // tokens being burnt
        _existingTokens -= amount;

        _tokenOwnerBalances[from] -= amount;

        emit Transfer(operator, from, address(0), amount, false, data);

        bytes memory lsp1Data = abi.encode(from, address(0), amount, data);
        _notifyTokenSender(from, lsp1Data);
    }

    /**
     * @dev Transfer tokens from `from` to `to` by decreasing the balance of `from` by `-amount` and increasing the balance
     * of `to` by `+amount`.
     *
     * Both the sender and recipient will be notified of the token transfer through the LSP1 {universalReceiver}
     * function, if they are contracts that support the LSP1 interface. Their `universalReceiver` function will receive
     * all the parameters in the calldata packed encoded.
     *
     * Any logic in the {_beforeTokenTransfer} function will run before updating the balances.
     *
     * @param from the address to decrease the balance.
     * @param to the address to increase the balance.
     * @param amount the amount of tokens to transfer from `from` to `to`.
     * @param allowNonLSP1Recipient a boolean that describe if transfer to a `to` address that does not support LSP1 is allowed or not.
     * @param data Additional data the caller wants included in the emitted event, and sent in the LSP1 hook to the `from` and `to` address.
     *
     * @custom:requirements
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `from` must have at least `amount` of tokens.
     *
     * @custom:events {Transfer} event.
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

        bytes memory lsp1Data = abi.encode(from, to, amount, data);

        _notifyTokenSender(from, lsp1Data);
        _notifyTokenReceiver(to, allowNonLSP1Recipient, lsp1Data);
    }

    /**
     * @dev Hook that is called before any token transfer, including minting and burning.
     * Allows to run custom logic before updating balances and notifiying sender/recipient by overriding this function.
     *
     * @param from The sender address
     * @param to The recipient address
     * @param amount The amount of token to transfer
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}

    /**
     * @dev Attempt to notify the token sender `from` about the `amount` of tokens being transferred.
     * This is done by calling its {universalReceiver} function with the `_TYPEID_LSP7_TOKENSSENDER` as typeId, if `from` is a contract that supports the LSP1 interface.
     * If `from` is an EOA or a contract that does not support the LSP1 interface, nothing will happen and no notification will be sent.
     
     * @param from The address to call the {universalReceiver} function on.                                                                                                                                                                                   
     * @param lsp1Data the data to be sent to the `from` address in the `universalReceiver` call.
     */
    function _notifyTokenSender(
        address from,
        bytes memory lsp1Data
    ) internal virtual {
        if (
            ERC165Checker.supportsERC165InterfaceUnchecked(
                from,
                _INTERFACEID_LSP1
            )
        ) {
            ILSP1UniversalReceiver(from).universalReceiver(
                _TYPEID_LSP7_TOKENSSENDER,
                lsp1Data
            );
        }
    }

    /**
     * @dev Attempt to notify the token receiver `to` about the `amount` tokens being received.
     * This is done by calling its {universalReceiver} function with the `_TYPEID_LSP7_TOKENSRECIPIENT` as typeId, if `to` is a contract that supports the LSP1 interface.
     *
     * If `to` is is an EOA or a contract that does not support the LSP1 interface, the behaviour will depend on the `allowNonLSP1Recipient` boolean flag.
     * - if `allowNonLSP1Recipient` is set to `true`, nothing will happen and no notification will be sent.
     * - if `allowNonLSP1Recipient` is set to `false, the transaction will revert.
     *
     * @param to The address to call the {universalReceiver} function on.
     * @param allowNonLSP1Recipient a boolean that describe if transfer to a `to` address that does not support LSP1 is allowed or not.
     * @param lsp1Data the data to be sent to the `to` address in the `universalReceiver(...)` call.
     */
    function _notifyTokenReceiver(
        address to,
        bool allowNonLSP1Recipient,
        bytes memory lsp1Data
    ) internal virtual {
        if (
            ERC165Checker.supportsERC165InterfaceUnchecked(
                to,
                _INTERFACEID_LSP1
            )
        ) {
            ILSP1UniversalReceiver(to).universalReceiver(
                _TYPEID_LSP7_TOKENSRECIPIENT,
                lsp1Data
            );
        } else if (!allowNonLSP1Recipient) {
            if (to.code.length > 0) {
                revert LSP7NotifyTokenReceiverContractMissingLSP1Interface(to);
            } else {
                revert LSP7NotifyTokenReceiverIsEOA(to);
            }
        }
    }
}
