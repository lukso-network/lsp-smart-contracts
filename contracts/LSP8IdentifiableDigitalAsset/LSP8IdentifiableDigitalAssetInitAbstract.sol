// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.4;

// interfaces
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// modules
import {ERC725YCore} from "@erc725/smart-contracts/contracts/ERC725YCore.sol";
import {
    LSP8IdentifiableDigitalAssetCore
} from "./LSP8IdentifiableDigitalAssetCore.sol";
import {
    LSP4DigitalAssetMetadataInitAbstract
} from "../LSP4DigitalAssetMetadata/LSP4DigitalAssetMetadataInitAbstract.sol";

// constants
import {_INTERFACEID_LSP8} from "./LSP8Constants.sol";

/**
 * @title Implementation of a LSP8 Identifiable Digital Asset, a contract that represents a non-fungible token.
 * @author Matthew Stevens
 *
 * @dev Inheritable proxy implementation contract of the LSP8 standard.
 *
 * Minting and transferring are done using by giving a unique `tokenId`.
 * This implementation is agnostic to the way tokens are created.
 * A supply mechanism has to be added in a derived contract using {_mint}
 * For a generic mechanism, see {LSP7Mintable}.
 */
abstract contract LSP8IdentifiableDigitalAssetInitAbstract is
    LSP4DigitalAssetMetadataInitAbstract,
    LSP8IdentifiableDigitalAssetCore
{
    function _initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) internal virtual override onlyInitializing {
        LSP4DigitalAssetMetadataInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_
        );
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(IERC165, ERC725YCore) returns (bool) {
        return
            interfaceId == _INTERFACEID_LSP8 ||
            super.supportsInterface(interfaceId);
    }
}
