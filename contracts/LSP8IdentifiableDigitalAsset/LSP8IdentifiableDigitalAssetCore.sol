// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// interfaces
import {ILSP1UniversalReceiver} from "../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";
import {ILSP8IdentifiableDigitalAsset} from "./ILSP8IdentifiableDigitalAsset.sol";

// libraries
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {ERC165Checker} from "../Custom/ERC165Checker.sol";

// modules
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {ERC725Y} from "@erc725/smart-contracts/contracts/ERC725Y.sol";

// errors
import "./LSP8Errors.sol";

// constants
import {_INTERFACEID_LSP1} from "../LSP1UniversalReceiver/LSP1Constants.sol";
// import {} from "../LSP4DigitalAssetMetadata/LSP4Constants.sol";
import {_TYPEID_LSP8_TOKENSSENDER, _TYPEID_LSP8_TOKENSRECIPIENT} from "./LSP8Constants.sol";

/**
 * @title LSP8IdentifiableDigitalAsset contract
 * @author Matthew Stevens
 * @dev Core Implementation of a LSP8 compliant contract.
 */
abstract contract LSP8IdentifiableDigitalAssetCore is Context, ILSP8IdentifiableDigitalAsset {
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using Address for address;

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
    function totalSupply() public view override returns (uint256) {
        return _existingTokens;
    }

    // --- Token owner queries

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function balanceOf(address tokenOwner) public view override returns (uint256) {
        return _ownedTokens[tokenOwner].length();
    }

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function tokenOwnerOf(bytes32 tokenId) public view override returns (address) {
        address tokenOwner = _tokenOwners[tokenId];

        if (tokenOwner == address(0)) {
            revert LSP8NonExistentTokenId(tokenId);
        }

        return tokenOwner;
    }

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function tokenIdsOf(address tokenOwner) public view override returns (bytes32[] memory) {
        return _ownedTokens[tokenOwner].values();
    }

    // --- Operator functionality

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function authorizeOperator(address operator, bytes32 tokenId) public virtual override {
        address tokenOwner = tokenOwnerOf(tokenId);
        address caller = _msgSender();

        if (tokenOwner != caller) {
            revert LSP8NotTokenOwner(tokenOwner, tokenId, caller);
        }

        if (operator == address(0)) {
            revert LSP8CannotUseAddressZeroAsOperator();
        }

        // tokenOwner is always their own operator, no update required
        if (tokenOwner == operator) {
            return;
        }

        _operators[tokenId].add(operator);

        emit AuthorizedOperator(operator, tokenOwner, tokenId);
    }

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function revokeOperator(address operator, bytes32 tokenId) public virtual override {
        address tokenOwner = tokenOwnerOf(tokenId);
        address caller = _msgSender();

        if (tokenOwner != caller) {
            revert LSP8NotTokenOwner(tokenOwner, tokenId, caller);
        }

        if (operator == address(0)) {
            revert LSP8CannotUseAddressZeroAsOperator();
        }

        // tokenOwner is always their own operator, no update required
        if (tokenOwner == operator) {
            return;
        }

        _revokeOperator(operator, tokenOwner, tokenId);
    }

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function isOperatorFor(address operator, bytes32 tokenId)
        public
        view
        virtual
        override
        returns (bool)
    {
        _existsOrError(tokenId);

        return _isOperatorOrOwner(operator, tokenId);
    }

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function getOperatorsOf(bytes32 tokenId)
        public
        view
        virtual
        override
        returns (address[] memory)
    {
        _existsOrError(tokenId);

        return _operators[tokenId].values();
    }

    function _isOperatorOrOwner(address caller, bytes32 tokenId)
        internal
        view
        virtual
        returns (bool)
    {
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
        bool force,
        bytes memory data
    ) public virtual override {
        address operator = _msgSender();

        if (!_isOperatorOrOwner(operator, tokenId)) {
            revert LSP8NotTokenOperator(tokenId, operator);
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
        bool force,
        bytes[] memory data
    ) public virtual override {
        if (
            from.length != to.length || from.length != tokenId.length || from.length != data.length
        ) {
            revert LSP8InvalidTransferBatch();
        }

        for (uint256 i = 0; i < from.length; i++) {
            transfer(from[i], to[i], tokenId[i], force, data[i]);
        }
    }

    function _revokeOperator(
        address operator,
        address tokenOwner,
        bytes32 tokenId
    ) internal virtual {
        _operators[tokenId].remove(operator);
        emit RevokedOperator(operator, tokenOwner, tokenId);
    }

    function _clearOperators(address tokenOwner, bytes32 tokenId) internal virtual {
        // TODO: here is a good exmaple of why having multiple operators will be expensive.. we
        // need to clear them on token transfer
        //
        // NOTE: this may cause a tx to fail if there is too many operators to clear, in which case
        // the tokenOwner needs to call `revokeOperator` until there is less operators to clear and
        // the desired `transfer` or `burn` call can succeed.
        EnumerableSet.AddressSet storage operatorsForTokenId = _operators[tokenId];

        uint256 operatorListLength = operatorsForTokenId.length();
        for (uint256 i = 0; i < operatorListLength; i++) {
            // we are emptying the list, always remove from index 0
            address operator = operatorsForTokenId.at(0);
            _revokeOperator(operator, tokenOwner, tokenId);
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
    function _existsOrError(bytes32 tokenId) internal view {
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
        bool force,
        bytes memory data
    ) internal virtual {
        if (to == address(0)) {
            revert LSP8CannotSendToAddressZero();
        }

        if (_exists(tokenId)) {
            revert LSP8TokenIdAlreadyMinted(tokenId);
        }

        address operator = _msgSender();

        _beforeTokenTransfer(address(0), to, tokenId);

        _ownedTokens[to].add(tokenId);
        _tokenOwners[tokenId] = to;

        emit Transfer(operator, address(0), to, tokenId, force, data);

        _notifyTokenReceiver(address(0), to, tokenId, force, data);
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
        address operator = _msgSender();

        _beforeTokenTransfer(tokenOwner, address(0), tokenId);

        _clearOperators(tokenOwner, tokenId);

        _ownedTokens[tokenOwner].remove(tokenId);
        delete _tokenOwners[tokenId];

        emit Transfer(operator, tokenOwner, address(0), tokenId, false, data);

        _notifyTokenSender(tokenOwner, address(0), tokenId, data);
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

        address operator = _msgSender();

        _beforeTokenTransfer(from, to, tokenId);

        _clearOperators(from, tokenId);

        _ownedTokens[from].remove(tokenId);
        _ownedTokens[to].add(tokenId);
        _tokenOwners[tokenId] = to;

        emit Transfer(operator, from, to, tokenId, force, data);

        _notifyTokenSender(from, to, tokenId, data);
        _notifyTokenReceiver(from, to, tokenId, force, data);
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
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        bytes32 tokenId
    ) internal virtual {
        // silence compiler warning about unused variable
        tokenId;

        // token being minted
        if (from == address(0)) {
            _existingTokens += 1;
        }

        // token being burned
        if (to == address(0)) {
            _existingTokens -= 1;
        }
    }

    /**
     * @dev An attempt is made to notify the token sender about the `tokenId` changing owners using
     * LSP1 interface.
     */
    function _notifyTokenSender(
        address from,
        address to,
        bytes32 tokenId,
        bytes memory data
    ) internal virtual {
        if (ERC165Checker.supportsERC165Interface(from, _INTERFACEID_LSP1)) {
            bytes memory packedData = abi.encodePacked(from, to, tokenId, data);
            ILSP1UniversalReceiver(from).universalReceiver(_TYPEID_LSP8_TOKENSSENDER, packedData);
        }
    }

    /**
     * @dev An attempt is made to notify the token receiver about the `tokenId` changing owners
     * using LSP1 interface. When force is FALSE the token receiver MUST support LSP1.
     *
     * The receiver may revert when the token being sent is not wanted.
     */
    function _notifyTokenReceiver(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) internal virtual {
        if (ERC165Checker.supportsERC165Interface(to, _INTERFACEID_LSP1)) {
            bytes memory packedData = abi.encodePacked(from, to, tokenId, data);
            ILSP1UniversalReceiver(to).universalReceiver(_TYPEID_LSP8_TOKENSRECIPIENT, packedData);
        } else if (!force) {
            if (to.code.length != 0) {
                revert LSP8NotifyTokenReceiverContractMissingLSP1Interface(to);
            } else {
                revert LSP8NotifyTokenReceiverIsEOA(to);
            }
        }
    }
}
