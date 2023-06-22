// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.4;

// interfaces
import {
    ILSP1UniversalReceiver
} from "../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";
import {
    ILSP8IdentifiableDigitalAsset
} from "./ILSP8IdentifiableDigitalAsset.sol";

// libraries
import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {
    ERC165Checker
} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

// errors
import "./LSP8Errors.sol";

// constants
import {_INTERFACEID_LSP1} from "../LSP1UniversalReceiver/LSP1Constants.sol";
import {
    _TYPEID_LSP8_TOKENSSENDER,
    _TYPEID_LSP8_TOKENSRECIPIENT
} from "./LSP8Constants.sol";

/**
 * @title LSP8IdentifiableDigitalAsset contract
 * @author Matthew Stevens
 * @dev Core Implementation of a LSP8 compliant contract.
 */
abstract contract LSP8IdentifiableDigitalAssetCore is
    ILSP8IdentifiableDigitalAsset
{
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    // --- Storage

    uint256 private _existingTokens;

    // Mapping from `tokenId` to `tokenOwner`
    mapping(bytes32 => address) private _tokenOwners;

    // Mapping `tokenOwner` to owned tokenIds
    mapping(address => EnumerableSet.Bytes32Set) private _ownedTokens;

    // Mapping a `tokenId` to its authorized operator addresses.
    mapping(bytes32 => EnumerableSet.AddressSet) private _operators;

    mapping(address => EnumerableSet.Bytes32Set) private _tokenIdsForOperator;

    // --- Token queries

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function totalSupply() public view virtual returns (uint256) {
        return _existingTokens;
    }

    // --- Token owner queries

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function balanceOf(
        address tokenOwner
    ) public view virtual returns (uint256) {
        return _ownedTokens[tokenOwner].length();
    }

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function tokenOwnerOf(
        bytes32 tokenId
    ) public view virtual returns (address) {
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
    ) public view virtual returns (bytes32[] memory) {
        return _ownedTokens[tokenOwner].values();
    }

    // --- Operator functionality

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function authorizeOperator(
        address operator,
        bytes32 tokenId
    ) public virtual {
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

        emit AuthorizedOperator(operator, tokenOwner, tokenId);
    }

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function revokeOperator(address operator, bytes32 tokenId) public virtual {
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

        _revokeOperator(operator, tokenOwner, tokenId);
    }

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function isOperatorFor(
        address operator,
        bytes32 tokenId
    ) public view virtual returns (bool) {
        _existsOrError(tokenId);

        return _isOperatorOrOwner(operator, tokenId);
    }

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function getOperatorsOf(
        bytes32 tokenId
    ) public view virtual returns (address[] memory) {
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
        address tokenOwner = tokenOwnerOf(tokenId);

        return (caller == tokenOwner || _operators[tokenId].contains(caller));
    }

    // --- Transfer functionality

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function transfer(
        address from,
        address to,
        bytes32 tokenId,
        bool allowNonLSP1Recipient,
        bytes memory data
    ) public virtual {
        address operator = msg.sender;

        if (!_isOperatorOrOwner(operator, tokenId)) {
            revert LSP8NotTokenOperator(tokenId, operator);
        }

        _transfer(from, to, tokenId, allowNonLSP1Recipient, data);
    }

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function transferBatch(
        address[] memory from,
        address[] memory to,
        bytes32[] memory tokenId,
        bool[] memory allowNonLSP1Recipient,
        bytes[] memory data
    ) public virtual {
        uint256 fromLength = from.length;
        if (
            fromLength != to.length ||
            fromLength != tokenId.length ||
            fromLength != allowNonLSP1Recipient.length ||
            fromLength != data.length
        ) {
            revert LSP8InvalidTransferBatch();
        }

        for (uint256 i = 0; i < fromLength; ) {
            transfer(
                from[i],
                to[i],
                tokenId[i],
                allowNonLSP1Recipient[i],
                data[i]
            );

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
        bytes32 tokenId
    ) internal virtual {
        bool isRemoved = _operators[tokenId].remove(operator);
        if (!isRemoved) revert LSP8NonExistingOperator(operator, tokenId);
        emit RevokedOperator(operator, tokenOwner, tokenId);
    }

    /**
     * @dev clear all the operators for the `tokenId`
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
        for (uint256 i = 0; i < operatorListLength; ) {
            // we are emptying the list, always remove from index 0
            address operator = operatorsForTokenId.at(0);
            _revokeOperator(operator, tokenOwner, tokenId);

            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev Returns whether `tokenId` exists.
     *
     * Tokens start existing when they are minted (`_mint`), and stop existing when they are burned
     * (`_burn`).
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
     * @dev Mints `tokenId` and transfers it to `to`.
     *
     * Requirements:
     *
     * - `tokenId` must not exist.
     * - `to` cannot be the zero address.
     *
     * Emits a {Transfer} event.
     */
    function _mint(
        address to,
        bytes32 tokenId,
        bool allowNonLSP1Recipient,
        bytes memory data
    ) internal virtual {
        if (to == address(0)) {
            revert LSP8CannotSendToAddressZero();
        }

        if (_exists(tokenId)) {
            revert LSP8TokenIdAlreadyMinted(tokenId);
        }

        address operator = msg.sender;

        _beforeTokenTransfer(address(0), to, tokenId);

        // token being minted
        _existingTokens += 1;

        _ownedTokens[to].add(tokenId);
        _tokenOwners[tokenId] = to;

        emit Transfer(
            operator,
            address(0),
            to,
            tokenId,
            allowNonLSP1Recipient,
            data
        );

        bytes memory lsp1Data = abi.encodePacked(address(0), to, tokenId, data);
        _notifyTokenReceiver(to, allowNonLSP1Recipient, lsp1Data);
    }

    /**
     * @dev Destroys `tokenId`, clearing authorized operators.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     *
     * Emits a {Transfer} event.
     */
    function _burn(bytes32 tokenId, bytes memory data) internal virtual {
        address tokenOwner = tokenOwnerOf(tokenId);
        address operator = msg.sender;

        _beforeTokenTransfer(tokenOwner, address(0), tokenId);

        // token being burned
        _existingTokens -= 1;

        _clearOperators(tokenOwner, tokenId);

        _ownedTokens[tokenOwner].remove(tokenId);
        delete _tokenOwners[tokenId];

        emit Transfer(operator, tokenOwner, address(0), tokenId, false, data);

        bytes memory lsp1Data = abi.encodePacked(
            tokenOwner,
            address(0),
            tokenId,
            data
        );
        _notifyTokenSender(tokenOwner, lsp1Data);
    }

    /**
     * @dev Transfers `tokenId` from `from` to `to`.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     *
     * Emits a {Transfer} event.
     */
    function _transfer(
        address from,
        address to,
        bytes32 tokenId,
        bool allowNonLSP1Recipient,
        bytes memory data
    ) internal virtual {
        if (from == to) {
            revert LSP8CannotSendToSelf();
        }

        address tokenOwner = tokenOwnerOf(tokenId);
        if (tokenOwner != from) {
            revert LSP8NotTokenOwner(tokenOwner, tokenId, from);
        }

        if (to == address(0)) {
            revert LSP8CannotSendToAddressZero();
        }

        address operator = msg.sender;

        _beforeTokenTransfer(from, to, tokenId);

        _clearOperators(from, tokenId);

        _ownedTokens[from].remove(tokenId);
        _ownedTokens[to].add(tokenId);
        _tokenOwners[tokenId] = to;

        emit Transfer(operator, from, to, tokenId, allowNonLSP1Recipient, data);

        bytes memory lsp1Data = abi.encodePacked(from, to, tokenId, data);

        _notifyTokenSender(from, lsp1Data);
        _notifyTokenReceiver(to, allowNonLSP1Recipient, lsp1Data);
    }

    /**
     * @dev Hook that is called before any token transfer. This includes minting
     * and burning.
     *
     * Calling conditions:
     *
     * - When `from` and `to` are both non-zero, ``from``'s `tokenId` will be
     * transferred to `to`.
     * - When `from` is zero, `tokenId` will be minted for `to`.
     * - When `to` is zero, ``from``'s `tokenId` will be burned.
     * - `from` and `to` are never both zero.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        bytes32 tokenId
    ) internal virtual {}

    /**
     * @dev An attempt is made to notify the token sender about the `tokenId` changing owners using
     * LSP1 interface.
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
                _TYPEID_LSP8_TOKENSSENDER,
                lsp1Data
            );
        }
    }

    /**
     * @dev An attempt is made to notify the token receiver about the `tokenId` changing owners
     * using LSP1 interface. When allowNonLSP1Recipient is FALSE the token receiver MUST support LSP1.
     *
     * The receiver may revert when the token being sent is not wanted.
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
                _TYPEID_LSP8_TOKENSRECIPIENT,
                lsp1Data
            );
        } else if (!allowNonLSP1Recipient) {
            if (to.code.length > 0) {
                revert LSP8NotifyTokenReceiverContractMissingLSP1Interface(to);
            } else {
                revert LSP8NotifyTokenReceiverIsEOA(to);
            }
        }
    }
}
