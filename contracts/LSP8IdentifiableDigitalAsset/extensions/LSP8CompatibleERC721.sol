// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.12;

// interfaces
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {
    IERC721Receiver
} from "@openzeppelin/contracts/interfaces/IERC721Receiver.sol";
import {
    IERC721Metadata,
    IERC721
} from "@openzeppelin/contracts/interfaces/IERC721Metadata.sol";

// libraries
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";
import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {LSP1Utils} from "../../LSP1UniversalReceiver/LSP1Utils.sol";

// modules
import {
    LSP8IdentifiableDigitalAssetCore,
    LSP8IdentifiableDigitalAsset
} from "../LSP8IdentifiableDigitalAsset.sol";

// errors
import {
    LSP8NotTokenOwner,
    LSP8CannotUseAddressZeroAsOperator,
    LSP8TokenOwnerCannotBeOperator,
    LSP8OperatorAlreadyAuthorized,
    LSP8NotTokenOperator
} from "../LSP8Errors.sol";

// constants
import {
    _LSP4_METADATA_KEY,
    _LSP4_TOKEN_NAME_KEY,
    _LSP4_TOKEN_SYMBOL_KEY
} from "../../LSP4DigitalAssetMetadata/LSP4Constants.sol";
import {_TYPEID_LSP8_TOKENOPERATOR} from "../LSP8Constants.sol";

/**
 * @dev LSP8 extension, for compatibility for clients / tools that expect ERC721.
 */
abstract contract LSP8CompatibleERC721 is
    IERC721Metadata,
    LSP8IdentifiableDigitalAsset
{
    using BytesLib for bytes;
    using EnumerableSet for EnumerableSet.AddressSet;
    using LSP1Utils for address;

    /**
     * @dev Mapping from owner to operator approvals for backward compatibility with ERC721
     */
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    /**
     * @notice Deploying a `LSP8CompatibleERC721` token contract with: token name = `name_`, token symbol = `symbol_`, and
     * address `newOwner_` as the token contract owner.
     *
     * @param name_ The name of the token.
     * @param symbol_ The symbol of the token.
     * @param newOwner_ The owner of the token contract.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 tokenIdType_
    ) LSP8IdentifiableDigitalAsset(name_, symbol_, newOwner_, tokenIdType_) {}

    /**
     * @inheritdoc IERC721Metadata
     * @dev Returns the name of the token.
     * For compatibility with clients & tools that expect ERC721.
     *
     * @return The name of the token
     */
    function name() public view virtual override returns (string memory) {
        bytes memory data = _getData(_LSP4_TOKEN_NAME_KEY);
        return string(data);
    }

    /**
     * @inheritdoc IERC721Metadata
     * @dev Returns the symbol of the token, usually a shorter version of the name.
     * For compatibility with clients & tools that expect ERC721.
     *
     * @return The symbol of the token
     */
    function symbol() public view virtual override returns (string memory) {
        bytes memory data = _getData(_LSP4_TOKEN_SYMBOL_KEY);
        return string(data);
    }

    /**
     * @inheritdoc LSP8IdentifiableDigitalAssetCore
     */
    function balanceOf(
        address tokenOwner
    )
        public
        view
        virtual
        override(IERC721, LSP8IdentifiableDigitalAssetCore)
        returns (uint256)
    {
        return super.balanceOf(tokenOwner);
    }

    /**
     * @inheritdoc LSP8IdentifiableDigitalAsset
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(IERC165, LSP8IdentifiableDigitalAsset)
        returns (bool)
    {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @inheritdoc IERC721Metadata
     * @notice Retrieving the token URI of tokenId `tokenId`.
     *
     * @dev Compatible with ERC721Metadata tokenURI. Retrieve the tokenURI for a specific `tokenId`.
     *
     * @return The token URI.
     */
    function tokenURI(
        uint256 /* tokenId */
    ) public view virtual returns (string memory) {
        bytes memory data = _getData(_LSP4_METADATA_KEY);

        // offset = bytes4(hashSig) + bytes32(contentHash) -> 4 + 32 = 36
        uint256 offset = 36;

        bytes memory uriBytes = data.slice(offset, data.length - offset);
        return string(uriBytes);
    }

    /**
     * @inheritdoc IERC721
     * @notice Retrieving the address that own tokenId `tokenId`.
     *
     * @dev Compatible with ERC721 ownerOf.
     *
     * @param tokenId The tokenId to query.
     * @return The owner of the tokenId.
     */
    function ownerOf(
        uint256 tokenId
    ) public view virtual override returns (address) {
        return tokenOwnerOf(bytes32(tokenId));
    }

    /**
     * @inheritdoc IERC721
     * @notice Retrieving the address other than the token owner that is approved to transfer tokenId `tokenId` on behalf of its owner.
     *
     * @dev Compatible with ERC721 getApproved.
     *
     * @param tokenId The tokenId to query.
     * @return The address of the operator for `tokenId`.
     */
    function getApproved(
        uint256 tokenId
    ) public view virtual override returns (address) {
        bytes32 tokenIdAsBytes32 = bytes32(tokenId);
        _existsOrError(tokenIdAsBytes32);

        address[] memory operatorsForTokenId = getOperatorsOf(tokenIdAsBytes32);
        uint256 operatorListLength = operatorsForTokenId.length;

        if (operatorListLength == 0) {
            return address(0);
        } else {
            // Read the last added operator authorized to provide "best" compatibility.
            // In ERC721 there is one operator address at a time for a tokenId, so multiple calls to
            // `approve` would cause `getApproved` to return the last added operator. In this
            // compatibility version the same is true, when the authorized operators were not previously
            // authorized. If addresses are removed, then `getApproved` returned address can change due
            // to implementation of `EnumberableSet._remove`.
            return operatorsForTokenId[operatorListLength - 1];
        }
    }

    /**
     * @inheritdoc IERC721
     * @notice Checking if address `operator` is approved to transfer any tokenId owned by address `owner`.
     *
     * @dev Compatible with ERC721 isApprovedForAll.
     *
     * @param tokenOwner The tokenOwner address to query.
     * @param operator The operator address to query.
     *
     * @return Returns if the `operator` is allowed to manage all of the assets of `owner`
     */
    function isApprovedForAll(
        address tokenOwner,
        address operator
    ) public view virtual override returns (bool) {
        return _operatorApprovals[tokenOwner][operator];
    }

    /**
     * @inheritdoc IERC721
     * @notice Calling `approve` function to approve operator at address `operator` to transfer tokenId `tokenId` on behalf of its owner.
     *
     * @dev Approval function compatible with ERC721 `approve(address,uint256)`.
     *
     * @param operator The address to approve for `tokenId`.
     * @param tokenId The tokenId to approve.
     */
    function approve(
        address operator,
        uint256 tokenId
    ) public virtual override {
        authorizeOperator(operator, bytes32(tokenId), "");
    }

    /**
     * @inheritdoc IERC721
     * @notice Setting the "approval for all" status of operator `_operator` to `_approved` to allow it to transfer any tokenIds on behalf of `msg.sender`.
     *
     * @dev Enable or disable approval for a third party ("operator") to manage all of `msg.sender`'s assets. The contract MUST allow multiple operators per owner.
     * See {_setApprovalForAll}
     *
     * @param operator Address to add to the set of authorized operators.
     * @param approved True if the operator is approved, false to revoke approval.
     *
     * @custom:events {ApprovalForAll} event
     */
    function setApprovalForAll(
        address operator,
        bool approved
    ) public virtual override {
        _setApprovalForAll(msg.sender, operator, approved);
    }

    /**
     * @inheritdoc IERC721
     * @notice Calling `transferFrom` function to transfer tokenId `tokenId` from address `from` to address `to`.
     *
     * @dev Transfer functions from the ERC721 standard interface.
     *
     * @param from The sending address.
     * @param to The receiving address.
     * @param tokenId The tokenId to transfer.
     *
     * @custom:info This function sets the `force` parameter to `true` so that EOAs and any contract can receive the `tokenId`.
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        _transfer(from, to, bytes32(tokenId), true, "");
    }

    /**
     * @inheritdoc IERC721
     * @notice Calling `safeTransferFrom` function to transfer tokenId `tokenId` from address `from` to address `to`.
     *
     * @dev Safe Transfer function without optional data from the ERC721 standard interface.
     *
     * @param from The sending address.
     * @param to The receiving address.
     * @param tokenId The tokenId to transfer.
     *
     * @custom:info This function sets the `force` parameter to `true` so that EOAs and any contract can receive the `tokenId`.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        _safeTransfer(from, to, tokenId, "");
    }

    /**
     * @inheritdoc IERC721
     * @notice Calling `safeTransferFrom` function to transfer tokenId `tokenId` from address `from` to address `to`.
     *
     * @dev Safe Transfer function with optional data from the ERC721 standard interface.
     *
     * @param from The sending address.
     * @param to The receiving address.
     * @param tokenId The tokenId to transfer.
     * @param data The data to be sent with the transfer.
     *
     * @custom:info This function sets the `force` parameter to `true` so that EOAs and any contract can receive the `tokenId`.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual override {
        _safeTransfer(from, to, tokenId, data);
    }

    // --- Overrides

    /**
     * @inheritdoc LSP8IdentifiableDigitalAssetCore
     *
     * @custom:events
     * - LSP7 {AuthorizedOperator} event.
     * - ERC721 {Approval} event.
     */
    function authorizeOperator(
        address operator,
        bytes32 tokenId,
        bytes memory operatorNotificationData
    ) public virtual override {
        address tokenOwner = tokenOwnerOf(tokenId);

        if (
            tokenOwner != msg.sender &&
            !isApprovedForAll(tokenOwner, msg.sender)
        ) {
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

        emit AuthorizedOperator(
            operator,
            tokenOwner,
            tokenId,
            operatorNotificationData
        );
        emit Approval(tokenOwnerOf(tokenId), operator, uint256(tokenId));

        bytes memory lsp1Data = abi.encode(
            msg.sender,
            tokenId,
            operatorNotificationData
        );
        operator.notifyUniversalReceiver(_TYPEID_LSP8_TOKENOPERATOR, lsp1Data);
    }

    /**
     * @inheritdoc LSP8IdentifiableDigitalAssetCore
     *
     * @custom:events
     * - LSP8 {Transfer} event.
     * - ERC721 {Transfer} event.
     */
    function _transfer(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) internal virtual override {
        if (
            !isApprovedForAll(from, msg.sender) &&
            !_isOperatorOrOwner(msg.sender, tokenId)
        ) {
            revert LSP8NotTokenOperator(tokenId, msg.sender);
        }

        emit Transfer(from, to, uint256(tokenId));
        super._transfer(from, to, tokenId, force, data);
    }

    /**
     * @dev Transfer the `tokenId` from `from` to `to` and check if the `to` recipient address is
     * a contract that implements the `IERC721Received` interface and return the right magic value.
     * See {_checkOnERC721Received} for more infos.
     */
    function _safeTransfer(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) internal virtual {
        _transfer(from, to, bytes32(tokenId), true, data);
        require(
            _checkOnERC721Received(from, to, tokenId, data),
            "LSP8CompatibleERC721: transfer to non ERC721Receiver implementer"
        );
    }

    /**
     * @inheritdoc LSP8IdentifiableDigitalAssetCore
     *
     * @custom:events
     * - LSP8 {Transfer} event with `address(0)` as `from`.
     * - ERC721 {Transfer} event with `address(0)` as `from`.
     */
    function _mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) internal virtual override {
        emit Transfer(address(0), to, uint256(tokenId));
        super._mint(to, tokenId, force, data);
    }

    /**
     * @inheritdoc LSP8IdentifiableDigitalAssetCore
     *
     * @custom:events
     * - LSP8 {Transfer} event with `address(0)` as the `to` address.
     * - ERC721 {Transfer} event with `address(0)` as the `to` address.
     */
    function _burn(
        bytes32 tokenId,
        bytes memory data
    ) internal virtual override {
        address tokenOwner = tokenOwnerOf(tokenId);

        emit Transfer(tokenOwner, address(0), uint256(tokenId));
        super._burn(tokenId, data);
    }

    /**
     * @dev Approve `operator` to operate on all tokens of `tokensOwner`.
     *
     * @custom:events {ApprovalForAll} event.
     */
    function _setApprovalForAll(
        address tokensOwner,
        address operator,
        bool approved
    ) internal virtual {
        require(
            tokensOwner != operator,
            "LSP8CompatibleERC721: approve to caller"
        );
        _operatorApprovals[tokensOwner][operator] = approved;
        emit ApprovalForAll(tokensOwner, operator, approved);
    }

    /**
     * @dev Internal function to invoke `IERC721Receiver.onERC721Received(...)` function on a target address.
     * The call is not executed if the target address is not a contract.
     *
     * @param from address representing the previous owner of the given `tokenId`.
     * @param to target address that will receive the token.
     * @param tokenId uint256 ID of the token to be transferred.
     * @param data bytes optional data to send along with the call.
     * @return bool whether the call correctly returned the expected magic value.
     */
    function _checkOnERC721Received(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) private returns (bool) {
        if (to.code.length == 0) {
            return true;
        }

        try
            IERC721Receiver(to).onERC721Received(
                msg.sender,
                from,
                tokenId,
                data
            )
        returns (bytes4 retval) {
            return retval == IERC721Receiver.onERC721Received.selector;
        } catch (bytes memory reason) {
            if (reason.length == 0) {
                revert(
                    "LSP8CompatibleERC721: transfer to non ERC721Receiver implementer"
                );
            } else {
                // solhint-disable no-inline-assembly
                /// @solidity memory-safe-assembly
                assembly {
                    revert(add(32, reason), mload(reason))
                }
            }
        }
    }
}
