// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// interfaces
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// libraries
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

// modules
import {LSP8IdentifiableDigitalAsset, LSP4DigitalAssetMetadata, ERC725YCore} from "../LSP8IdentifiableDigitalAsset.sol";
import {LSP8IdentifiableDigitalAssetCore} from "../LSP8IdentifiableDigitalAssetCore.sol";
import {LSP8CompatibilityForERC721Core} from "./LSP8CompatibilityForERC721Core.sol";

// constants
import {_INTERFACEID_ERC721, _INTERFACEID_ERC721METADATA} from "./LSP8CompatibilityConstants.sol";

/**
 * @dev LSP8 extension, for compatibility for clients / tools that expect ERC721.
 */
contract LSP8CompatibilityForERC721 is
    LSP8IdentifiableDigitalAsset,
    LSP8CompatibilityForERC721Core
{
    using EnumerableSet for EnumerableSet.AddressSet;

    /**
     * @notice Sets the name, the symbol and the owner of the token
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param newOwner_ The owner of the token
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) LSP8IdentifiableDigitalAsset(name_, symbol_, newOwner_) {} // solhint-disable no-empty-blocks

    // --- Overrides

    function authorizeOperator(address operator, bytes32 tokenId)
        public
        virtual
        override(LSP8IdentifiableDigitalAssetCore, LSP8CompatibilityForERC721Core)
    {
        super.authorizeOperator(operator, tokenId);
    }

    function _transfer(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) internal virtual override(LSP8IdentifiableDigitalAssetCore, LSP8CompatibilityForERC721Core) {
        super._transfer(from, to, tokenId, force, data);
    }

    function _mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) internal virtual override(LSP8IdentifiableDigitalAssetCore, LSP8CompatibilityForERC721Core) {
        super._mint(to, tokenId, force, data);
    }

    function _burn(bytes32 tokenId, bytes memory data)
        internal
        virtual
        override(LSP8IdentifiableDigitalAssetCore, LSP8CompatibilityForERC721Core)
    {
        super._burn(tokenId, data);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, LSP8IdentifiableDigitalAsset)
        returns (bool)
    {
        return
            interfaceId == _INTERFACEID_ERC721 ||
            interfaceId == _INTERFACEID_ERC721METADATA ||
            super.supportsInterface(interfaceId);
    }

    function _setData(bytes32 key, bytes memory value)
        internal
        virtual
        override(LSP4DigitalAssetMetadata, ERC725YCore)
    {
        super._setData(key, value);
    }
}
