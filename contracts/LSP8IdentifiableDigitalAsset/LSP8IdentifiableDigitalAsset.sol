// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// interfaces
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// modules
import {ERC725YCore} from "@erc725/smart-contracts/contracts/ERC725YCore.sol";
import {LSP8IdentifiableDigitalAssetCore} from "./LSP8IdentifiableDigitalAssetCore.sol";
import {LSP4DigitalAssetMetadata} from "../LSP4DigitalAssetMetadata/LSP4DigitalAssetMetadata.sol";

// constants
import {_INTERFACEID_LSP8} from "./LSP8Constants.sol";

/**
 * @title LSP8IdentifiableDigitalAsset contract
 * @author Matthew Stevens
 * @dev Implementation of a LSP8 compliant contract.
 */
contract LSP8IdentifiableDigitalAsset is
    LSP4DigitalAssetMetadata,
    LSP8IdentifiableDigitalAssetCore
{
    /**
     * @notice Sets the token-Metadata
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param newOwner_ The owner of the the token-Metadata
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) LSP4DigitalAssetMetadata(name_, symbol_, newOwner_) {} // solhint-disable no-empty-blocks

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, ERC725YCore)
        returns (bool)
    {
        return interfaceId == _INTERFACEID_LSP8 || super.supportsInterface(interfaceId);
    }
}
