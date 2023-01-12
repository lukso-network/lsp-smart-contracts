// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

// interfaces
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
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
    function supportsInterface(bytes4 interfaceId)
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
    function tokenURI(
        uint256 /* tokenId */
    ) public view virtual returns (string memory) {
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

        EnumerableSet.AddressSet storage operatorsForTokenId = _operators[tokenIdAsBytes32];
        uint256 operatorListLength = operatorsForTokenId.length();

        if (operatorListLength == 0) {
            return address(0);
        } else {
            // Read the last added operator authorized to provide "best" compatibility.
            // In ERC721 there is one operator address at a time for a tokenId, so multiple calls to
            // `approve` would cause `getApproved` to return the last added operator. In this
            // compatibility version the same is true, when the authorized operators were not previously
            // authorized. If addresses are removed, then `getApproved` returned address can change due
            // to implementation of `EnumberableSet._remove`.
            return operatorsForTokenId.at(operatorListLength - 1);
        }
    }

    /*
     * @inheritdoc ILSP8CompatibleERC721
     */
    function isApprovedForAll(address tokenOwner, address operator)
        public
        view
        virtual
        returns (bool)
    {
        return _operatorApprovals[tokenOwner][operator];
    }

    /**
     * @inheritdoc ILSP8CompatibleERC721
     */
    function approve(address operator, uint256 tokenId) public virtual {
        authorizeOperator(operator, bytes32(tokenId));
        emit Approval(tokenOwnerOf(bytes32(tokenId)), operator, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) public virtual {
        _setApprovalForAll(msg.sender, operator, approved);
    }

    /**
     * @inheritdoc ILSP8CompatibleERC721
     * @dev Compatible with ERC721 transferFrom.
     * Using allowNonLSP1Recipient=true so that EOA and any contract may receive the tokenId.
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual {
        return _transfer(from, to, bytes32(tokenId), true, "");
    }

    /**
     * @inheritdoc ILSP8CompatibleERC721
     * @dev Compatible with ERC721 safeTransferFrom.
     * Using allowNonLSP1Recipient=false so that no EOA and only contracts supporting LSP1 interface may receive the tokenId.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual {
        return _transfer(from, to, bytes32(tokenId), false, "");
    }

    /*
     * @dev Compatible with ERC721 safeTransferFrom.
     * Using allowNonLSP1Recipient=false so that no EOA and only contracts supporting LSP1 interface may receive the tokenId.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual {
        return _transfer(from, to, bytes32(tokenId), false, data);
    }

    // --- Overrides

    function authorizeOperator(address operator, bytes32 tokenId)
        public
        virtual
        override(ILSP8IdentifiableDigitalAsset, LSP8IdentifiableDigitalAssetCore)
    {
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

        super._transfer(from, to, tokenId, allowNonLSP1Recipient, data);
        emit Transfer(from, to, uint256(tokenId));
    }

    function _mint(
        address to,
        bytes32 tokenId,
        bool allowNonLSP1Recipient,
        bytes memory data
    ) internal virtual override {
        super._mint(to, tokenId, allowNonLSP1Recipient, data);
        emit Transfer(address(0), to, uint256(tokenId));
    }

    function _burn(bytes32 tokenId, bytes memory data) internal virtual override {
        address tokenOwner = tokenOwnerOf(tokenId);

        super._burn(tokenId, data);
        emit Transfer(tokenOwner, address(0), uint256(tokenId));
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

    function _setData(bytes32 key, bytes memory value)
        internal
        virtual
        override(LSP4DigitalAssetMetadataInitAbstract, ERC725YCore)
    {
        super._setData(key, value);
    }
}
