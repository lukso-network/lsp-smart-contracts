// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {
    ILSP1UniversalReceiver as ILSP1
} from "@lukso/lsp1-contracts/contracts/ILSP1UniversalReceiver.sol";
import {ILSP7DigitalAsset} from "./ILSP7DigitalAsset.sol";

// modules
import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {
    ERC165Checker
} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {
    LSP4DigitalAssetMetadata,
    ERC725Y
} from "@lukso/lsp4-contracts/contracts/LSP4DigitalAssetMetadata.sol";
import {
    LSP17Extendable
} from "@lukso/lsp17contractextension-contracts/contracts/LSP17Extendable.sol";

// libraries
import {LSP1Utils} from "@lukso/lsp1-contracts/contracts/LSP1Utils.sol";
import {LSP2Utils} from "@lukso/lsp2-contracts/contracts/LSP2Utils.sol";

// constants
import {
    _INTERFACEID_LSP1
} from "@lukso/lsp1-contracts/contracts/LSP1Constants.sol";
import {
    _LSP17_EXTENSION_PREFIX
} from "@lukso/lsp17contractextension-contracts/contracts/LSP17Constants.sol";
import {
    _INTERFACEID_LSP7,
    _TYPEID_LSP7_TOKENOPERATOR,
    _TYPEID_LSP7_TOKENSSENDER,
    _TYPEID_LSP7_TOKENSRECIPIENT
} from "./LSP7Constants.sol";

// errors
import {
    NoExtensionFoundForFunctionSelector,
    InvalidFunctionSelector,
    InvalidExtensionAddress
} from "@lukso/lsp17contractextension-contracts/contracts/LSP17Errors.sol";
import {
    LSP7TokenContractCannotHoldValue,
    LSP7AmountExceedsAuthorizedAmount,
    LSP7InvalidTransferBatch,
    LSP7AmountExceedsBalance,
    LSP7DecreasedAllowanceBelowZero,
    LSP7CannotUseAddressZeroAsOperator,
    LSP7TokenOwnerCannotBeOperator,
    LSP7CannotSendWithAddressZero,
    LSP7NotifyTokenReceiverContractMissingLSP1Interface,
    LSP7NotifyTokenReceiverIsEOA,
    OperatorAllowanceCannotBeIncreasedFromZero,
    LSP7BatchCallFailed,
    LSP7RevokeOperatorNotAuthorized,
    LSP7DecreaseAllowanceNotAuthorized
} from "./LSP7Errors.sol";

/**
 * @title LSP7DigitalAsset contract
 * @author Matthew Stevens
 * @dev Core Implementation of a LSP7 compliant contract.
 *
 * This contract implement the core logic of the functions for the {ILSP7DigitalAsset} interface.
 */

/**
 * @title Implementation of the LSP7 Digital Asset standard, a contract that represents a fungible token.
 * @author Matthew Stevens
 *
j
 */
abstract contract LSP7DigitalAsset is
    ILSP7DigitalAsset,
    LSP4DigitalAssetMetadata,
    LSP17Extendable
{
    using EnumerableSet for EnumerableSet.AddressSet;

    // --- Storage

    bool internal _isNonDivisible;

    uint256 internal _existingTokens;

    // Mapping from `tokenOwner` to an `amount` of tokens
    mapping(address => uint256) internal _tokenOwnerBalances;

    // Mapping an `address` to its authorized operator addresses.
    mapping(address => EnumerableSet.AddressSet) internal _operators;

    // Mapping a `tokenOwner` to an `operator` to `amount` of tokens.
    mapping(address => mapping(address => uint256))
        internal _operatorAuthorizedAmount;

    /**
     * @notice Sets the token-Metadata
     * @param name_ The name of the token.
     * @param symbol_ The symbol of the token.
     * @param newOwner_ The owner of the the token-Metadata.
     * @param lsp4TokenType_ The type of token this digital asset contract represents (`0` = Token, `1` = NFT, `2` = Collection).
     * @param isNonDivisible_ Specify if the LSP7 token is a fungible or non-fungible token.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_
    ) LSP4DigitalAssetMetadata(name_, symbol_, newOwner_, lsp4TokenType_) {
        _isNonDivisible = isNonDivisible_;
    }

    // fallback functions

    /**
     * @notice The `fallback` function was called with the following amount of native tokens: `msg.value`; and the following calldata: `callData`.
     *
     * @dev Achieves the goal of [LSP-17-ContractExtension] standard by extending the contract to handle calls of functions that do not exist natively,
     * forwarding the function call to the extension address mapped to the function being called.
     *
     * This function is executed when:
     *    - Sending data of length less than 4 bytes to the contract.
     *    - The first 4 bytes of the calldata do not match any publicly callable functions from the contract ABI.
     *    - Receiving native tokens
     *
     * 1. If the data is equal or longer than 4 bytes, the [ERC-725Y] storage is queried with the following data key: [_LSP17_EXTENSION_PREFIX] + `bytes4(msg.sig)` (Check [LSP-2-ERC725YJSONSchema] for encoding the data key)
     *
     *   - If there is no address stored under the following data key, revert with {NoExtensionFoundForFunctionSelector(bytes4)}. The data key relative to `bytes4(0)` is an exception, where no reverts occurs if there is no extension address stored under. This exception is made to allow users to send random data (graffiti) to the account and to be able to react on it.
     *
     *   - If there is an address, forward the `msg.data` to the extension using the CALL opcode, appending 52 bytes (20 bytes of `msg.sender` and 32 bytes of `msg.value`). Return what the calls returns, or revert if the call failed.
     *
     * 2. If the data sent to this function is of length less than 4 bytes (not a function selector), revert.
     */
    // solhint-disable-next-line no-complex-fallback
    fallback(
        bytes calldata callData
    ) external payable virtual returns (bytes memory) {
        if (msg.data.length < 4) {
            revert InvalidFunctionSelector(callData);
        }
        return _fallbackLSP17Extendable(callData);
    }

    /**
     * @dev Reverts whenever someone tries to send native tokens to a LSP7 contract.
     * @notice LSP7 contract cannot receive native tokens.
     */
    receive() external payable virtual {
        // revert on empty calls with no value
        if (msg.value == 0) {
            revert InvalidFunctionSelector(hex"00000000");
        }

        revert LSP7TokenContractCannotHoldValue();
    }

    /**
     * @dev Forwards the call with the received value to an extension mapped to a function selector.
     *
     * Calls {_getExtensionAndForwardValue} to get the address of the extension mapped to the function selector being
     * called on the account. If there is no extension, the address(0) will be returned.
     * Forwards the value if the extension is payable.
     *
     * Reverts if there is no extension for the function being called.
     *
     * If there is an extension for the function selector being called, it calls the extension with the
     * CALL opcode, passing the {msg.data} appended with the 20 bytes of the {msg.sender} and
     * 32 bytes of the {msg.value}
     *
     * @custom:info The LSP7 Token contract should not hold any native tokens. Any native tokens received by the contract
     * will be forwarded to the extension address mapped to the selector from `msg.sig`.
     */
    function _fallbackLSP17Extendable(
        bytes calldata callData
    ) internal virtual override returns (bytes memory) {
        // If there is a function selector
        (address extension, ) = _getExtensionAndForwardValue(msg.sig);

        // if no extension was found, revert
        if (extension == address(0))
            revert NoExtensionFoundForFunctionSelector(msg.sig);

        (bool success, bytes memory result) = extension.call{value: msg.value}(
            abi.encodePacked(callData, msg.sender, msg.value)
        );

        if (success) {
            return result;
        } else {
            // `mload(result)` -> offset in memory where `result.length` is located
            // `add(result, 32)` -> offset in memory where `result` data starts
            /// @solidity memory-safe-assembly
            // solhint-disable-next-line no-inline-assembly
            assembly {
                let resultdata_size := mload(result)
                revert(add(result, 32), resultdata_size)
            }
        }
    }

    /**
     * @dev Returns the extension address stored under the following data key:
     * - {_LSP17_EXTENSION_PREFIX} + `<bytes4>` (Check [LSP2-ERC725YJSONSchema] for encoding the data key).
     * - If no extension is stored, returns the address(0).
     * - we do not check that payable bool as in lsp7 standard we will always forward the value to the extension
     */
    function _getExtensionAndForwardValue(
        bytes4 functionSelector
    ) internal view virtual override returns (address, bool) {
        // Generate the data key relevant for the functionSelector being called
        bytes32 mappedExtensionDataKey = LSP2Utils.generateMappingKey(
            _LSP17_EXTENSION_PREFIX,
            functionSelector
        );

        // Check if there is an extension stored under the generated data key
        bytes memory extensionAddress = _getData(mappedExtensionDataKey);
        if (extensionAddress.length != 20 && extensionAddress.length != 0)
            revert InvalidExtensionAddress(extensionAddress);

        return (address(bytes20(extensionAddress)), true);
    }

    /**
     * @inheritdoc LSP17Extendable
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC725Y, LSP17Extendable) returns (bool) {
        return
            interfaceId == _INTERFACEID_LSP7 ||
            super.supportsInterface(interfaceId) ||
            LSP17Extendable._supportsInterfaceInERC165Extension(interfaceId);
    }

    // --- Token queries

    /**
     * @inheritdoc ILSP7DigitalAsset
     */
    function decimals() public view virtual override returns (uint8) {
        return _isNonDivisible ? 0 : 18;
    }

    /**
     * @inheritdoc ILSP7DigitalAsset
     */
    function totalSupply() public view virtual override returns (uint256) {
        return _existingTokens;
    }

    // --- Token owner queries

    /**
     * @inheritdoc ILSP7DigitalAsset
     */
    function balanceOf(
        address tokenOwner
    ) public view virtual override returns (uint256) {
        return _tokenOwnerBalances[tokenOwner];
    }

    // --- General functionality

    /**
     * @inheritdoc ILSP7DigitalAsset
     *
     * @custom:info It's not possible to send value along the functions call due to the use of `delegatecall`.
     */
    function batchCalls(
        bytes[] calldata data
    ) public virtual override returns (bytes[] memory results) {
        results = new bytes[](data.length);
        for (uint256 i; i < data.length; ) {
            (bool success, bytes memory result) = address(this).delegatecall(
                data[i]
            );

            if (!success) {
                // Look for revert reason and bubble it up if present
                if (result.length != 0) {
                    // The easiest way to bubble the revert reason is using memory via assembly
                    // solhint-disable no-inline-assembly
                    /// @solidity memory-safe-assembly
                    assembly {
                        let returndata_size := mload(result)
                        revert(add(32, result), returndata_size)
                    }
                } else {
                    revert LSP7BatchCallFailed({callIndex: i});
                }
            }

            results[i] = result;

            unchecked {
                ++i;
            }
        }
    }

    // --- Operator functionality

    /**
     * @inheritdoc ILSP7DigitalAsset
     *
     * @custom:danger To avoid front-running and Allowance Double-Spend Exploit when
     * increasing or decreasing the authorized amount of an operator, it is advised to
     * use the {increaseAllowance} and {decreaseAllowance} functions.
     *
     * For more information, see:
     * https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/
     */
    function authorizeOperator(
        address operator,
        uint256 amount,
        bytes memory operatorNotificationData
    ) public virtual override {
        _updateOperator(
            msg.sender,
            operator,
            amount,
            true,
            operatorNotificationData
        );

        bytes memory lsp1Data = abi.encode(
            msg.sender,
            amount,
            operatorNotificationData
        );

        _notifyTokenOperator(operator, lsp1Data);
    }

    /**
     * @inheritdoc ILSP7DigitalAsset
     */
    function revokeOperator(
        address operator,
        address tokenOwner,
        bool notify,
        bytes memory operatorNotificationData
    ) public virtual override {
        if (msg.sender != tokenOwner && msg.sender != operator) {
            revert LSP7RevokeOperatorNotAuthorized(
                msg.sender,
                tokenOwner,
                operator
            );
        }

        _updateOperator(
            tokenOwner,
            operator,
            0,
            notify,
            operatorNotificationData
        );

        if (notify) {
            bytes memory lsp1Data = abi.encode(
                tokenOwner,
                0,
                operatorNotificationData
            );

            _notifyTokenOperator(operator, lsp1Data);
        }
    }

    /**
     * @inheritdoc ILSP7DigitalAsset
     */
    function authorizedAmountFor(
        address operator,
        address tokenOwner
    ) public view virtual override returns (uint256) {
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
    ) public view virtual override returns (address[] memory) {
        return _operators[tokenOwner].values();
    }

    /**
     * @inheritdoc ILSP7DigitalAsset
     */
    function increaseAllowance(
        address operator,
        uint256 addedAmount,
        bytes memory operatorNotificationData
    ) public virtual override {
        uint256 oldAllowance = authorizedAmountFor(operator, msg.sender);
        if (oldAllowance == 0)
            revert OperatorAllowanceCannotBeIncreasedFromZero(operator);

        uint256 newAllowance = oldAllowance + addedAmount;

        _updateOperator(
            msg.sender,
            operator,
            newAllowance,
            true,
            operatorNotificationData
        );

        bytes memory lsp1Data = abi.encode(
            msg.sender,
            newAllowance,
            operatorNotificationData
        );

        _notifyTokenOperator(operator, lsp1Data);
    }

    /**
     * @inheritdoc ILSP7DigitalAsset
     */
    function decreaseAllowance(
        address operator,
        address tokenOwner,
        uint256 subtractedAmount,
        bytes memory operatorNotificationData
    ) public virtual override {
        if (msg.sender != tokenOwner && msg.sender != operator) {
            revert LSP7DecreaseAllowanceNotAuthorized(
                msg.sender,
                tokenOwner,
                operator
            );
        }

        uint256 currentAllowance = authorizedAmountFor(operator, tokenOwner);
        if (currentAllowance < subtractedAmount) {
            revert LSP7DecreasedAllowanceBelowZero();
        }

        uint256 newAllowance;
        unchecked {
            newAllowance = currentAllowance - subtractedAmount;
            _updateOperator(
                tokenOwner,
                operator,
                newAllowance,
                true,
                operatorNotificationData
            );
        }

        bytes memory lsp1Data = abi.encode(
            tokenOwner,
            newAllowance,
            operatorNotificationData
        );

        _notifyTokenOperator(operator, lsp1Data);
    }

    // --- Transfer functionality

    /**
     * @inheritdoc ILSP7DigitalAsset
     */
    function transfer(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public virtual override {
        if (msg.sender != from) {
            _spendAllowance({
                operator: msg.sender,
                tokenOwner: from,
                amountToSpend: amount
            });
        }

        _transfer(from, to, amount, force, data);
    }

    /**
     * @inheritdoc ILSP7DigitalAsset
     */
    function transferBatch(
        address[] memory from,
        address[] memory to,
        uint256[] memory amount,
        bool[] memory force,
        bytes[] memory data
    ) public virtual override {
        uint256 fromLength = from.length;
        if (
            fromLength != to.length ||
            fromLength != amount.length ||
            fromLength != force.length ||
            fromLength != data.length
        ) {
            revert LSP7InvalidTransferBatch();
        }

        for (uint256 i; i < fromLength; ) {
            // using the public transfer function to handle updates to operator authorized amounts
            transfer(from[i], to[i], amount[i], force[i], data[i]);

            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev Changes token `amount` the `operator` has access to from `tokenOwner` tokens.
     * If the amount is zero the operator is removed from the list of operators, otherwise he is added to the list of operators.
     * If the amount is zero then the operator is being revoked, otherwise the operator amount is being modified.
     *
     * @param tokenOwner The address that will give `operator` an allowance for on its balance.
     * @param operator The address to grant an allowance to spend.
     * @param allowance The maximum amount of token that `operator` can spend from the `tokenOwner`'s balance.
     * @param notified Boolean indicating whether the operator has been notified about the change of allowance
     * @param operatorNotificationData The data to send to the universalReceiver function of the operator in case of notifying
     *
     * @custom:events
     * - {OperatorRevoked} event when operator's allowance is set to `0`.
     * - {OperatorAuthorizationChanged} event when operator's allowance is set to any other amount.
     *
     * @custom:requirements
     * - `operator` cannot be the zero address.
     * - `operator` cannot be the same address as `tokenOwner`.
     */
    function _updateOperator(
        address tokenOwner,
        address operator,
        uint256 allowance,
        bool notified,
        bytes memory operatorNotificationData
    ) internal virtual {
        if (operator == address(0)) {
            revert LSP7CannotUseAddressZeroAsOperator();
        }

        if (operator == tokenOwner) {
            revert LSP7TokenOwnerCannotBeOperator();
        }

        _operatorAuthorizedAmount[tokenOwner][operator] = allowance;

        if (allowance != 0) {
            _operators[tokenOwner].add(operator);
            emit OperatorAuthorizationChanged(
                operator,
                tokenOwner,
                allowance,
                operatorNotificationData
            );
        } else {
            _operators[tokenOwner].remove(operator);
            emit OperatorRevoked(
                operator,
                tokenOwner,
                notified,
                operatorNotificationData
            );
        }
    }

    /**
     * @dev Mints `amount` of tokens and transfers it to `to`.
     *
     * @custom:info Any logic in the:
     * - {_beforeTokenTransfer} function will run before updating the balances.
     * - {_afterTokenTransfer} function will run after updating the balances, **but before notifying the recipient via LSP1**.
     *
     * @param to The address to mint tokens for.
     * @param amount The amount of tokens to mint.
     * @param force A boolean that describe if transfer to a `to` address that does not support LSP1 is allowed or not.
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
        bool force,
        bytes memory data
    ) internal virtual {
        if (to == address(0)) {
            revert LSP7CannotSendWithAddressZero();
        }

        _beforeTokenTransfer(address(0), to, amount, data);

        // tokens being minted
        _existingTokens += amount;

        _tokenOwnerBalances[to] += amount;

        emit Transfer({
            operator: msg.sender,
            from: address(0),
            to: to,
            amount: amount,
            force: force,
            data: data
        });

        _afterTokenTransfer(address(0), to, amount, data);

        bytes memory lsp1Data = abi.encode(
            msg.sender,
            address(0),
            to,
            amount,
            data
        );
        _notifyTokenReceiver(to, force, lsp1Data);
    }

    /**
     * @dev Burns (= destroys) `amount` of tokens, decrease the `from` balance. This is done by sending them to the zero address.
     *
     * Both the sender and recipient will be notified of the token transfer through the LSP1 {universalReceiver}
     * function, if they are contracts that support the LSP1 interface. Their `universalReceiver` function will receive
     * all the parameters in the calldata packed encoded.
     *
     * @custom:info Any logic in the:
     * - {_beforeTokenTransfer} function will run before updating the balances.
     * - {_afterTokenTransfer} function will run after updating the balances, **but before notifying the sender via LSP1**.
     *
     * @param from The address to burn tokens from its balance.
     * @param amount The amount of tokens to burn.
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

        _beforeTokenTransfer(from, address(0), amount, data);

        uint256 balance = _tokenOwnerBalances[from];
        if (amount > balance) {
            revert LSP7AmountExceedsBalance(balance, from, amount);
        }
        // tokens being burnt
        _existingTokens -= amount;

        _tokenOwnerBalances[from] -= amount;

        emit Transfer({
            operator: msg.sender,
            from: from,
            to: address(0),
            amount: amount,
            force: false,
            data: data
        });

        _afterTokenTransfer(from, address(0), amount, data);

        bytes memory lsp1Data = abi.encode(
            msg.sender,
            from,
            address(0),
            amount,
            data
        );
        _notifyTokenSender(from, lsp1Data);
    }

    /**
     * @dev Spend `amountToSpend` from the `operator`'s authorized on behalf of the `tokenOwner`.
     *
     * @param operator The address of the operator to decrease the allowance of.
     * @param tokenOwner The address that granted an allowance on its balance to `operator`.
     * @param amountToSpend The amount of tokens to subtract in allowance of `operator`.
     *
     * @custom:events
     * - {OperatorRevoked} event when operator's allowance is set to `0`.
     * - {OperatorAuthorizationChanged} event when operator's allowance is set to any other amount.
     *
     * @custom:requirements
     * - The `amountToSpend` MUST be at least the allowance granted to `operator` (accessible via {`authorizedAmountFor}`)
     * - `operator` cannot be the zero address.
     * - `operator` cannot be the same address as `tokenOwner`.
     */
    function _spendAllowance(
        address operator,
        address tokenOwner,
        uint256 amountToSpend
    ) internal virtual {
        uint256 authorizedAmount = _operatorAuthorizedAmount[tokenOwner][
            operator
        ];

        if (amountToSpend > authorizedAmount) {
            revert LSP7AmountExceedsAuthorizedAmount(
                tokenOwner,
                authorizedAmount,
                operator,
                amountToSpend
            );
        }

        _updateOperator({
            tokenOwner: tokenOwner,
            operator: operator,
            allowance: authorizedAmount - amountToSpend,
            notified: false,
            operatorNotificationData: ""
        });
    }

    /**
     * @dev Transfer tokens from `from` to `to` by decreasing the balance of `from` by `-amount` and increasing the balance
     * of `to` by `+amount`.
     *
     * Both the sender and recipient will be notified of the token transfer through the LSP1 {universalReceiver}
     * function, if they are contracts that support the LSP1 interface. Their `universalReceiver` function will receive
     * all the parameters in the calldata packed encoded.
     *
     * @custom:info Any logic in the:
     * - {_beforeTokenTransfer} function will run before updating the balances.
     * - {_afterTokenTransfer} function will run after updating the balances, **but before notifying the sender/recipient via LSP1**.
     *
     * @param from The address to decrease the balance.
     * @param to The address to increase the balance.
     * @param amount The amount of tokens to transfer from `from` to `to`.
     * @param force A boolean that describe if transfer to a `to` address that does not support LSP1 is allowed or not.
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
        bool force,
        bytes memory data
    ) internal virtual {
        if (from == address(0) || to == address(0)) {
            revert LSP7CannotSendWithAddressZero();
        }

        _beforeTokenTransfer(from, to, amount, data);

        uint256 balance = _tokenOwnerBalances[from];
        if (amount > balance) {
            revert LSP7AmountExceedsBalance(balance, from, amount);
        }

        _tokenOwnerBalances[from] -= amount;
        _tokenOwnerBalances[to] += amount;

        emit Transfer({
            operator: msg.sender,
            from: from,
            to: to,
            amount: amount,
            force: force,
            data: data
        });

        _afterTokenTransfer(from, to, amount, data);

        bytes memory lsp1Data = abi.encode(msg.sender, from, to, amount, data);

        _notifyTokenSender(from, lsp1Data);
        _notifyTokenReceiver(to, force, lsp1Data);
    }

    /**
     * @dev Hook that is called before any token transfer, including minting and burning.
     * Allows to run custom logic before updating balances and notifying sender/recipient by overriding this function.
     *
     * @param from The sender address
     * @param to The recipient address
     * @param amount The amount of token to transfer
     * @param data The data sent alongside the transfer
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount,
        bytes memory data // solhint-disable-next-line no-empty-blocks
    ) internal virtual {}

    /**
     * @dev Hook that is called after any token transfer, including minting and burning.
     * Allows to run custom logic after updating balances, but **before notifying sender/recipient** by overriding this function.
     *
     * @param from The sender address
     * @param to The recipient address
     * @param amount The amount of token to transfer
     * @param data The data sent alongside the transfer
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount,
        bytes memory data // solhint-disable-next-line no-empty-blocks
    ) internal virtual {}

    /**
     * @dev Attempt to notify the operator `operator` about the `amount` tokens being authorized with.
     * This is done by calling its {universalReceiver} function with the `_TYPEID_LSP7_TOKENOPERATOR` as typeId, if `operator` is a contract that supports the LSP1 interface.
     * If `operator` is an EOA or a contract that does not support the LSP1 interface, nothing will happen and no notification will be sent.

     * @param operator The address to call the {universalReceiver} function on.
     * @param lsp1Data the data to be sent to the `operator` address in the `universalReceiver` call.
     */
    function _notifyTokenOperator(
        address operator,
        bytes memory lsp1Data
    ) internal virtual {
        LSP1Utils.notifyUniversalReceiver(
            operator,
            _TYPEID_LSP7_TOKENOPERATOR,
            lsp1Data
        );
    }

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
        LSP1Utils.notifyUniversalReceiver(
            from,
            _TYPEID_LSP7_TOKENSSENDER,
            lsp1Data
        );
    }

    /**
     * @dev Attempt to notify the token receiver `to` about the `amount` tokens being received.
     * This is done by calling its {universalReceiver} function with the `_TYPEID_LSP7_TOKENSRECIPIENT` as typeId, if `to` is a contract that supports the LSP1 interface.
     *
     * If `to` is is an EOA or a contract that does not support the LSP1 interface, the behaviour will depend on the `force` boolean flag.
     * - if `force` is set to `true`, nothing will happen and no notification will be sent.
     * - if `force` is set to `false, the transaction will revert.
     *
     * @param to The address to call the {universalReceiver} function on.
     * @param force A boolean that describe if transfer to a `to` address that does not support LSP1 is allowed or not.
     * @param lsp1Data The data to be sent to the `to` address in the `universalReceiver(...)` call.
     */
    function _notifyTokenReceiver(
        address to,
        bool force,
        bytes memory lsp1Data
    ) internal virtual {
        if (
            ERC165Checker.supportsERC165InterfaceUnchecked(
                to,
                _INTERFACEID_LSP1
            )
        ) {
            ILSP1(to).universalReceiver(_TYPEID_LSP7_TOKENSRECIPIENT, lsp1Data);
        } else if (!force) {
            if (to.code.length != 0) {
                revert LSP7NotifyTokenReceiverContractMissingLSP1Interface(to);
            } else {
                revert LSP7NotifyTokenReceiverIsEOA(to);
            }
        }
    }
}
