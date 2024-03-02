// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.12;

// interfaces
import {
    ILSP1UniversalReceiver as ILSP1
} from "@lukso/lsp1-contracts/contracts/ILSP1UniversalReceiver.sol";
import {
    ILSP8IdentifiableDigitalAsset
} from "./ILSP8IdentifiableDigitalAsset.sol";

// modules

import {
    LSP4DigitalAssetMetadataCore
} from "@lukso/lsp4-contracts/contracts/LSP4DigitalAssetMetadataCore.sol";

// libraries
import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {
    ERC165Checker
} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {LSP1Utils} from "@lukso/lsp1-contracts/contracts/LSP1Utils.sol";

// errors
import {
    LSP8NonExistentTokenId,
    LSP8NotTokenOwner,
    LSP8CannotUseAddressZeroAsOperator,
    LSP8TokenOwnerCannotBeOperator,
    LSP8OperatorAlreadyAuthorized,
    LSP8NotTokenOperator,
    LSP8InvalidTransferBatch,
    LSP8NonExistingOperator,
    LSP8CannotSendToAddressZero,
    LSP8TokenIdAlreadyMinted,
    LSP8NotifyTokenReceiverContractMissingLSP1Interface,
    LSP8NotifyTokenReceiverIsEOA,
    LSP8TokenIdsDataLengthMismatch,
    LSP8TokenIdsDataEmptyArray,
    LSP8BatchCallFailed,
    LSP8TokenOwnerChanged,
    LSP8RevokeOperatorNotAuthorized
} from "./LSP8Errors.sol";

// constants
import {
    _INTERFACEID_LSP1
} from "@lukso/lsp1-contracts/contracts/LSP1Constants.sol";
import {
    _TYPEID_LSP8_TOKENOPERATOR,
    _TYPEID_LSP8_TOKENSSENDER,
    _TYPEID_LSP8_TOKENSRECIPIENT
} from "./LSP8Constants.sol";

/**
 * @title LSP8IdentifiableDigitalAsset contract
 * @author Matthew Stevens
 * @dev Core Implementation of a LSP8 compliant contract.
 */
abstract contract LSP8IdentifiableDigitalAssetCore is
    LSP4DigitalAssetMetadataCore,
    ILSP8IdentifiableDigitalAsset
{
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    // --- Storage

    uint256 internal _existingTokens;

    // Mapping from `tokenId` to `tokenOwner`
    mapping(bytes32 => address) internal _tokenOwners;

    // Mapping `tokenOwner` to owned tokenIds
    mapping(address => EnumerableSet.Bytes32Set) internal _ownedTokens;

    // Mapping a `tokenId` to its authorized operator addresses.
    mapping(bytes32 => EnumerableSet.AddressSet) internal _operators;

    // --- Token queries

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function totalSupply() public view virtual override returns (uint256) {
        return _existingTokens;
    }

    // --- Token owner queries

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function balanceOf(
        address tokenOwner
    ) public view virtual override returns (uint256) {
        return _ownedTokens[tokenOwner].length();
    }

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function tokenOwnerOf(
        bytes32 tokenId
    ) public view virtual override returns (address) {
        address tokenOwner = _tokenOwners[tokenId];

        if (tokenOwner == address(0)) {
            revert LSP8NonExistentTokenId(tokenId);
        }

        return tokenOwner;
    }

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function tokenIdsOf(
        address tokenOwner
    ) public view virtual override returns (bytes32[] memory) {
        return _ownedTokens[tokenOwner].values();
    }

    // --- TokenId Metadata functionality

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function getDataForTokenId(
        bytes32 tokenId,
        bytes32 dataKey
    ) public view virtual override returns (bytes memory dataValue) {
        return _getDataForTokenId(tokenId, dataKey);
    }

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function getDataBatchForTokenIds(
        bytes32[] memory tokenIds,
        bytes32[] memory dataKeys
    ) public view virtual override returns (bytes[] memory dataValues) {
        if (tokenIds.length != dataKeys.length) {
            revert LSP8TokenIdsDataLengthMismatch();
        }

        dataValues = new bytes[](tokenIds.length);

        for (uint256 i; i < tokenIds.length; ) {
            dataValues[i] = _getDataForTokenId(tokenIds[i], dataKeys[i]);

            // Increment the iterator in unchecked block to save gas
            unchecked {
                ++i;
            }
        }

        return dataValues;
    }

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function setDataForTokenId(
        bytes32 tokenId,
        bytes32 dataKey,
        bytes memory dataValue
    ) public virtual override onlyOwner {
        _setDataForTokenId(tokenId, dataKey, dataValue);
    }

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function setDataBatchForTokenIds(
        bytes32[] memory tokenIds,
        bytes32[] memory dataKeys,
        bytes[] memory dataValues
    ) public virtual override onlyOwner {
        if (
            tokenIds.length != dataKeys.length ||
            dataKeys.length != dataValues.length
        ) {
            revert LSP8TokenIdsDataLengthMismatch();
        }

        if (tokenIds.length == 0) {
            revert LSP8TokenIdsDataEmptyArray();
        }

        for (uint256 i; i < tokenIds.length; ) {
            _setDataForTokenId(tokenIds[i], dataKeys[i], dataValues[i]);

            // Increment the iterator in unchecked block to save gas
            unchecked {
                ++i;
            }
        }
    }

    // --- General functionality

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
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
                    revert LSP8BatchCallFailed({callIndex: i});
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
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function authorizeOperator(
        address operator,
        bytes32 tokenId,
        bytes memory operatorNotificationData
    ) public virtual override {
        address tokenOwner = tokenOwnerOf(tokenId);

        if (tokenOwner != msg.sender) {
            revert LSP8NotTokenOwner(tokenOwner, tokenId, msg.sender);
        }

        if (operator == address(0)) {
            revert LSP8CannotUseAddressZeroAsOperator();
        }

        if (tokenOwner == operator) {
            revert LSP8TokenOwnerCannotBeOperator();
        }

        bool isAdded = _operators[tokenId].add(operator);
        if (!isAdded) revert LSP8OperatorAlreadyAuthorized(operator, tokenId);

        emit OperatorAuthorizationChanged(
            operator,
            tokenOwner,
            tokenId,
            operatorNotificationData
        );

        bytes memory lsp1Data = abi.encode(
            msg.sender,
            tokenId,
            true, // authorized
            operatorNotificationData
        );

        _notifyTokenOperator(operator, lsp1Data);
    }

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function revokeOperator(
        address operator,
        bytes32 tokenId,
        bool notify,
        bytes memory operatorNotificationData
    ) public virtual override {
        address tokenOwner = tokenOwnerOf(tokenId);

        if (msg.sender != tokenOwner) {
            if (operator != msg.sender) {
                revert LSP8RevokeOperatorNotAuthorized(
                    msg.sender,
                    tokenOwner,
                    tokenId
                );
            }
        }

        if (operator == address(0)) {
            revert LSP8CannotUseAddressZeroAsOperator();
        }

        if (tokenOwner == operator) {
            revert LSP8TokenOwnerCannotBeOperator();
        }

        _revokeOperator(
            operator,
            tokenOwner,
            tokenId,
            notify,
            operatorNotificationData
        );

        if (notify) {
            bytes memory lsp1Data = abi.encode(
                tokenOwner,
                tokenId,
                false, // unauthorized
                operatorNotificationData
            );

            _notifyTokenOperator(operator, lsp1Data);
        }
    }

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function isOperatorFor(
        address operator,
        bytes32 tokenId
    ) public view virtual override returns (bool) {
        return _isOperatorOrOwner(operator, tokenId);
    }

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function getOperatorsOf(
        bytes32 tokenId
    ) public view virtual override returns (address[] memory) {
        _existsOrError(tokenId);

        return _operators[tokenId].values();
    }

    /**
     * @dev verifies if the `caller` is operator or owner for the `tokenId`
     * @return true if `caller` is either operator or owner
     */
    function _isOperatorOrOwner(
        address caller,
        bytes32 tokenId
    ) internal view virtual returns (bool) {
        return (caller == tokenOwnerOf(tokenId) ||
            _operators[tokenId].contains(caller));
    }

    // --- Transfer functionality

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function transfer(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public virtual override {
        if (!_isOperatorOrOwner(msg.sender, tokenId)) {
            revert LSP8NotTokenOperator(tokenId, msg.sender);
        }

        _transfer(from, to, tokenId, force, data);
    }

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function transferBatch(
        address[] memory from,
        address[] memory to,
        bytes32[] memory tokenId,
        bool[] memory force,
        bytes[] memory data
    ) public virtual override {
        uint256 fromLength = from.length;
        if (
            fromLength != to.length ||
            fromLength != tokenId.length ||
            fromLength != force.length ||
            fromLength != data.length
        ) {
            revert LSP8InvalidTransferBatch();
        }

        for (uint256 i; i < fromLength; ) {
            transfer(from[i], to[i], tokenId[i], force[i], data[i]);

            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev removes `operator` from the list of operators for the `tokenId`
     */
    function _revokeOperator(
        address operator,
        address tokenOwner,
        bytes32 tokenId,
        bool notified,
        bytes memory operatorNotificationData
    ) internal virtual {
        bool isRemoved = _operators[tokenId].remove(operator);
        if (!isRemoved) revert LSP8NonExistingOperator(operator, tokenId);

        emit OperatorRevoked(
            operator,
            tokenOwner,
            tokenId,
            notified,
            operatorNotificationData
        );
    }

    /**
     * @dev revoke all the current operators for a specific `tokenId` token which belongs to `tokenOwner`.
     *
     * @param tokenOwner The address that is the owner of the `tokenId`.
     * @param tokenId The token to remove the associated operators for.
     */
    function _clearOperators(
        address tokenOwner,
        bytes32 tokenId
    ) internal virtual {
        // here is a good example of why having multiple operators will be expensive.. we
        // need to clear them on token transfer
        //
        // NOTE: this may cause a tx to fail if there is too many operators to clear, in which case
        // the tokenOwner needs to call `revokeOperator` until there is less operators to clear and
        // the desired `transfer` or `burn` call can succeed.
        EnumerableSet.AddressSet storage operatorsForTokenId = _operators[
            tokenId
        ];

        uint256 operatorListLength = operatorsForTokenId.length();
        address operator;
        for (uint256 i; i < operatorListLength; ) {
            // we are emptying the list, always remove from index 0
            operator = operatorsForTokenId.at(0);
            _revokeOperator(operator, tokenOwner, tokenId, false, "");

            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev Returns whether `tokenId` exists.
     *
     * Tokens start existing when they are minted ({_mint}), and stop existing when they are burned ({_burn}).
     */
    function _exists(bytes32 tokenId) internal view virtual returns (bool) {
        return _tokenOwners[tokenId] != address(0);
    }

    /**
     * @dev When `tokenId` does not exist then revert with an error.
     */
    function _existsOrError(bytes32 tokenId) internal view virtual {
        if (!_exists(tokenId)) {
            revert LSP8NonExistentTokenId(tokenId);
        }
    }

    /**
     * @dev Create `tokenId` by minting it and transfers it to `to`.
     *
     * @custom:info Any logic in the:
     * - {_beforeTokenTransfer} function will run before updating the balances and ownership of `tokenId`s.
     * - {_afterTokenTransfer} function will run after updating the balances and ownership of `tokenId`s, **but before notifying the recipient via LSP1**.
     *
     * @param to The address that will receive the minted `tokenId`.
     * @param tokenId The token ID to create (= mint).
     * @param force When set to `true`, `to` may be any address. When set to `false`, `to` must be a contract that supports the LSP1 standard.
     * @param data Any additional data the caller wants included in the emitted event, and sent in the hook of the `to` address.
     *
     * @custom:requirements
     * - `tokenId` must not exist and not have been already minted.
     * - `to` cannot be the zero address.

     * @custom:events {Transfer} event with `address(0)` as `from` address.
     */
    function _mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) internal virtual {
        if (to == address(0)) {
            revert LSP8CannotSendToAddressZero();
        }

        // Check that `tokenId` is not already minted
        if (_exists(tokenId)) {
            revert LSP8TokenIdAlreadyMinted(tokenId);
        }

        _beforeTokenTransfer(address(0), to, tokenId, data);

        // Check that `tokenId` was not minted inside the `_beforeTokenTransfer` hook
        if (_exists(tokenId)) {
            revert LSP8TokenIdAlreadyMinted(tokenId);
        }

        // token being minted
        ++_existingTokens;

        _ownedTokens[to].add(tokenId);
        _tokenOwners[tokenId] = to;

        emit Transfer(msg.sender, address(0), to, tokenId, force, data);

        _afterTokenTransfer(address(0), to, tokenId, data);

        bytes memory lsp1Data = abi.encode(
            msg.sender,
            address(0),
            to,
            tokenId,
            data
        );
        _notifyTokenReceiver(to, force, lsp1Data);
    }

    /**
     * @dev Burn a specific `tokenId`, removing the `tokenId` from the {tokenIdsOf} the caller and decreasing its {balanceOf} by -1.
     * This will also clear all the operators allowed to transfer the `tokenId`.
     *
     * The owner of the `tokenId` will be notified about the `tokenId` being transferred through its LSP1 {universalReceiver}
     * function, if it is a contract that supports the LSP1 interface. Its {universalReceiver} function will receive
     * all the parameters in the calldata packed encoded.
     *
     * @custom:info Any logic in the:
     * - {_beforeTokenTransfer} function will run before updating the balances and ownership of `tokenId`s.
     * - {_afterTokenTransfer} function will run after updating the balances and ownership of `tokenId`s, **but before notifying the sender via LSP1**.
     *
     * @param tokenId The token to burn.
     * @param data Any additional data the caller wants included in the emitted event, and sent in the LSP1 hook on the token owner's address.
     *
     * @custom:hint In dApps, you can know which addresses are burning tokens by listening for the `Transfer` event and filter with the zero address as `to`.
     *
     * @custom:requirements
     * - `tokenId` must exist.
     *
     * @custom:events {Transfer} event with `address(0)` as the `to` address.
     */
    function _burn(bytes32 tokenId, bytes memory data) internal virtual {
        address tokenOwner = tokenOwnerOf(tokenId);

        _beforeTokenTransfer(tokenOwner, address(0), tokenId, data);

        // Re-fetch and update `tokenOwner` in case `tokenId`
        // was transferred inside the `_beforeTokenTransfer` hook
        tokenOwner = tokenOwnerOf(tokenId);

        // token being burned
        --_existingTokens;

        _clearOperators(tokenOwner, tokenId);

        _ownedTokens[tokenOwner].remove(tokenId);
        delete _tokenOwners[tokenId];

        emit Transfer(msg.sender, tokenOwner, address(0), tokenId, false, data);

        _afterTokenTransfer(tokenOwner, address(0), tokenId, data);

        bytes memory lsp1Data = abi.encode(
            msg.sender,
            tokenOwner,
            address(0),
            tokenId,
            data
        );

        _notifyTokenSender(tokenOwner, lsp1Data);
    }

    /**
     * @dev Change the owner of the `tokenId` from `from` to `to`.
     *
     * Both the sender and recipient will be notified of the `tokenId` being transferred through their LSP1 {universalReceiver}
     * function, if they are contracts that support the LSP1 interface. Their `universalReceiver` function will receive
     * all the parameters in the calldata packed encoded.
     *
     * @custom:info Any logic in the:
     * - {_beforeTokenTransfer} function will run before updating the balances and ownership of `tokenId`s.
     * - {_afterTokenTransfer} function will run after updating the balances and ownership of `tokenId`s, **but before notifying the sender/recipient via LSP1**.
     *
     * @param from The sender address.
     * @param to The recipient address.
     * @param tokenId The token to transfer.
     * @param force When set to `true`, `to` may be any address. When set to `false`, `to` must be a contract that supports the LSP1 standard.
     * @param data Additional data the caller wants included in the emitted event, and sent in the hooks to `from` and `to` addresses.
     *
     * @custom:requirements
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     *
     * @custom:events {Transfer} event.
     *
     * @custom:danger This internal function does not check if the sender is authorized or not to operate on the `tokenId`.
     */
    function _transfer(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) internal virtual {
        address tokenOwner = tokenOwnerOf(tokenId);
        if (tokenOwner != from) {
            revert LSP8NotTokenOwner(tokenOwner, tokenId, from);
        }

        if (to == address(0)) {
            revert LSP8CannotSendToAddressZero();
        }

        _beforeTokenTransfer(from, to, tokenId, data);

        // Check that `tokenId`'s owner was not changed inside the `_beforeTokenTransfer` hook
        address currentTokenOwner = tokenOwnerOf(tokenId);
        if (tokenOwner != currentTokenOwner) {
            revert LSP8TokenOwnerChanged(
                tokenId,
                tokenOwner,
                currentTokenOwner
            );
        }

        _clearOperators(from, tokenId);

        _ownedTokens[from].remove(tokenId);
        _ownedTokens[to].add(tokenId);
        _tokenOwners[tokenId] = to;

        emit Transfer(msg.sender, from, to, tokenId, force, data);

        _afterTokenTransfer(from, to, tokenId, data);

        bytes memory lsp1Data = abi.encode(msg.sender, from, to, tokenId, data);

        _notifyTokenSender(from, lsp1Data);
        _notifyTokenReceiver(to, force, lsp1Data);
    }

    /**
     * @dev Sets data for a specific `tokenId` and `dataKey` in the ERC725Y storage
     * The ERC725Y data key is the hash of the `tokenId` and `dataKey` concatenated
     * @param tokenId The unique identifier for a token.
     * @param dataKey The key for the data to set.
     * @param dataValue The value to set for the given data key.
     * @custom:events {TokenIdDataChanged} event.
     */
    function _setDataForTokenId(
        bytes32 tokenId,
        bytes32 dataKey,
        bytes memory dataValue
    ) internal virtual {
        _store[keccak256(bytes.concat(tokenId, dataKey))] = dataValue;
        emit TokenIdDataChanged(tokenId, dataKey, dataValue);
    }

    /**
     * @dev Retrieves data for a specific `tokenId` and `dataKey` from the ERC725Y storage
     * The ERC725Y data key is the hash of the `tokenId` and `dataKey` concatenated
     * @param tokenId The unique identifier for a token.
     * @param dataKey The key for the data to retrieve.
     * @return dataValues The data value associated with the given `tokenId` and `dataKey`.
     */
    function _getDataForTokenId(
        bytes32 tokenId,
        bytes32 dataKey
    ) internal view virtual returns (bytes memory dataValues) {
        return _store[keccak256(bytes.concat(tokenId, dataKey))];
    }

    /**
     * @dev Hook that is called before any token transfer, including minting and burning.
     * Allows to run custom logic before updating balances and notifiying sender/recipient by overriding this function.
     *
     * @param from The sender address
     * @param to The recipient address
     * @param tokenId The tokenId to transfer
     * @param data The data sent alongside the transfer
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        bytes32 tokenId,
        bytes memory data // solhint-disable-next-line no-empty-blocks
    ) internal virtual {}

    /**
     * @dev Hook that is called after any token transfer, including minting and burning.
     * Allows to run custom logic after updating balances, but **before notifiying sender/recipient via LSP1** by overriding this function.
     *
     * @param from The sender address
     * @param to The recipient address
     * @param tokenId The tokenId to transfer
     * @param data The data sent alongside the transfer
     */
    function _afterTokenTransfer(
        address from,
        address to,
        bytes32 tokenId,
        bytes memory data // solhint-disable-next-line no-empty-blocks
    ) internal virtual {}

    /**
     * @dev Attempt to notify the operator `operator` about the `tokenId` being authorized.
     * This is done by calling its {universalReceiver} function with the `_TYPEID_LSP8_TOKENOPERATOR` as typeId, if `operator` is a contract that supports the LSP1 interface.
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
            _TYPEID_LSP8_TOKENOPERATOR,
            lsp1Data
        );
    }

    /**
     * @dev Attempt to notify the token sender `from` about the `tokenId` being transferred.
     * This is done by calling its {universalReceiver} function with the `_TYPEID_LSP8_TOKENSSENDER` as typeId, if `from` is a contract that supports the LSP1 interface.
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
            _TYPEID_LSP8_TOKENSSENDER,
            lsp1Data
        );
    }

    /**
     * @dev Attempt to notify the token receiver `to` about the `tokenId` being received.
     * This is done by calling its {universalReceiver} function with the `_TYPEID_LSP8_TOKENSRECIPIENT` as typeId, if `to` is a contract that supports the LSP1 interface.
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
            ILSP1(to).universalReceiver(_TYPEID_LSP8_TOKENSRECIPIENT, lsp1Data);
        } else if (!force) {
            if (to.code.length != 0) {
                revert LSP8NotifyTokenReceiverContractMissingLSP1Interface(to);
            } else {
                revert LSP8NotifyTokenReceiverIsEOA(to);
            }
        }
    }
}
