// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

// interfaces
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {ILSP8CompatibleERC721} from "./ILSP8CompatibleERC721.sol";
import {ILSP8IdentifiableDigitalAsset} from "../ILSP8IdentifiableDigitalAsset.sol";

// libraries
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";

// modules
import {LSP4Compatibility} from "../../LSP4DigitalAssetMetadata/LSP4Compatibility.sol";
import {
    LSP8IdentifiableDigitalAssetInitAbstract,
    LSP4DigitalAssetMetadataInitAbstract,
    ERC725YCore
} from "../LSP8IdentifiableDigitalAssetInitAbstract.sol";
import {LSP8IdentifiableDigitalAssetCore} from "../LSP8IdentifiableDigitalAssetCore.sol";

// errors
import "../LSP8Errors.sol";

// constants
import {_LSP4_METADATA_KEY} from "../../LSP4DigitalAssetMetadata/LSP4Constants.sol";
import {_INTERFACEID_ERC721, _INTERFACEID_ERC721METADATA} from "./ILSP8CompatibleERC721.sol";

/**
 * @dev LSP8 extension, for compatibility for clients / tools that expect ERC721.
 */
abstract contract LSP8CompatibleERC721InitAbstract is
    ILSP8CompatibleERC721,
    LSP8IdentifiableDigitalAssetInitAbstract,
    LSP4Compatibility
{
    using EnumerableSet for EnumerableSet.AddressSet;

    /**
     * Mapping from owner to operator approvals
     * @dev for backward compatibility with ERC721
     */
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    function _initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) internal virtual override onlyInitializing {
        LSP8IdentifiableDigitalAssetInitAbstract._initialize(name_, symbol_, newOwner_);
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
        override(IERC165, ERC725YCore, LSP8IdentifiableDigitalAssetInitAbstract)
        returns (bool)
    {
        return
            interfaceId == _INTERFACEID_ERC721 ||
            interfaceId == _INTERFACEID_ERC721METADATA ||
            super.supportsInterface(interfaceId);
    }

    /*
     * @inheritdoc ILSP8CompatibleERC721
     */
    function tokenURI(uint256 /* tokenId */) public view virtual returns (string memory) {
        bytes memory data = _getData(_LSP4_METADATA_KEY);

        // offset = bytes4(hashSig) + bytes32(contentHash) -> 4 + 32 = 36
        uint256 offset = 36;

        bytes memory uriBytes = BytesLib.slice(data, offset, data.length - offset);
        return string(uriBytes);
    }

    /**
     * @inheritdoc ILSP8CompatibleERC721
     */
    function ownerOf(uint256 tokenId) public view virtual returns (address) {
        return tokenOwnerOf(bytes32(tokenId));
    }

    /**
     * @inheritdoc ILSP8CompatibleERC721
     */
    function getApproved(uint256 tokenId) public view virtual returns (address) {
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

    /*
     * @inheritdoc ILSP8CompatibleERC721
     */
    function isApprovedForAll(
        address tokenOwner,
        address operator
    ) public view virtual returns (bool) {
        return _operatorApprovals[tokenOwner][operator];
    }

    /**
     * @inheritdoc ILSP8CompatibleERC721
     */
    function approve(address operator, uint256 tokenId) public virtual {
        authorizeOperator(operator, bytes32(tokenId));
        emit Approval(tokenOwnerOf(bytes32(tokenId)), operator, tokenId);
    }

    /**
     * @dev See _setApprovalForAll
     */
    function setApprovalForAll(address operator, bool approved) public virtual {
        _setApprovalForAll(msg.sender, operator, approved);
    }

    /**
     * @inheritdoc ILSP8CompatibleERC721
     * @dev Compatible with ERC721 transferFrom.
     * Using allowNonLSP1Recipient=true so that EOA and any contract may receive the tokenId.
     */
    function transferFrom(address from, address to, uint256 tokenId) public virtual {
        _transfer(from, to, bytes32(tokenId), true, "");
    }

    /**
     * @inheritdoc ILSP8CompatibleERC721
     * @dev Compatible with ERC721 safeTransferFrom (without optional data).
     * Using allowNonLSP1Recipient=false so that no EOA and only contracts supporting LSP1 interface may receive the tokenId.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) public virtual {
        _safeTransfer(from, to, tokenId, "");
    }

    /*
     * @dev Compatible with ERC721 safeTransferFrom (with optional data).
     * Using allowNonLSP1Recipient=false so that no EOA and only contracts supporting LSP1 interface may receive the tokenId.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual {
        _safeTransfer(from, to, tokenId, data);
    }

    // --- Overrides

    /**
     * @inheritdoc ILSP8IdentifiableDigitalAsset
     */
    function authorizeOperator(
        address operator,
        bytes32 tokenId
    ) public virtual override(ILSP8IdentifiableDigitalAsset, LSP8IdentifiableDigitalAssetCore) {
        super.authorizeOperator(operator, tokenId);
        emit Approval(tokenOwnerOf(tokenId), operator, uint256(tokenId));
    }

    function _transfer(
        address from,
        address to,
        bytes32 tokenId,
        bool allowNonLSP1Recipient,
        bytes memory data
    ) internal virtual override {
        address operator = msg.sender;

        if (!isApprovedForAll(from, operator) && !_isOperatorOrOwner(operator, tokenId)) {
            revert LSP8NotTokenOperator(tokenId, operator);
        }

        emit Transfer(from, to, uint256(tokenId));
        super._transfer(from, to, tokenId, allowNonLSP1Recipient, data);
    }

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

    function _mint(
        address to,
        bytes32 tokenId,
        bool allowNonLSP1Recipient,
        bytes memory data
    ) internal virtual override {
        emit Transfer(address(0), to, uint256(tokenId));
        super._mint(to, tokenId, allowNonLSP1Recipient, data);
    }

    function _burn(bytes32 tokenId, bytes memory data) internal virtual override {
        address tokenOwner = tokenOwnerOf(tokenId);

        emit Transfer(tokenOwner, address(0), uint256(tokenId));
        super._burn(tokenId, data);
    }

    /**
     * @dev Approve `operator` to operate on all of `owner` tokens
     *
     * Emits an {ApprovalForAll} event.
     */
    function _setApprovalForAll(
        address tokensOwner,
        address operator,
        bool approved
    ) internal virtual {
        require(tokensOwner != operator, "LSP8CompatibleERC721: approve to caller");
        _operatorApprovals[tokensOwner][operator] = approved;
        emit ApprovalForAll(tokensOwner, operator, approved);
    }

    /**
     * @dev Internal function to invoke {IERC721Receiver-onERC721Received} on a target address.
     * The call is not executed if the target address is not a contract.
     *
     * @param from address representing the previous owner of the given token ID
     * @param to target address that will receive the token
     * @param tokenId uint256 ID of the token to be transferred
     * @param data bytes optional data to send along with the call
     * @return bool whether the call correctly returned the expected magic value
     */
    function _checkOnERC721Received(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) private returns (bool) {
        if (to.code.length > 0) {
            try IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, data) returns (
                bytes4 retval
            ) {
                return retval == IERC721Receiver.onERC721Received.selector;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert("LSP8CompatibleERC721: transfer to non ERC721Receiver implementer");
                } else {
                    // solhint-disable no-inline-assembly
                    /// @solidity memory-safe-assembly
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        } else {
            return true;
        }
    }

    function _setData(
        bytes32 key,
        bytes memory value
    ) internal virtual override(LSP4DigitalAssetMetadataInitAbstract, ERC725YCore) {
        super._setData(key, value);
    }
}
