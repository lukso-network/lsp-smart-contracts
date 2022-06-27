// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// interfaces
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// modules
import {ERC725YCore} from "@erc725/smart-contracts/contracts/ERC725YCore.sol";
import {LSP4DigitalAssetMetadata} from "../LSP4DigitalAssetMetadata/LSP4DigitalAssetMetadata.sol";
import {LSP7DigitalAssetCore} from "./LSP7DigitalAssetCore.sol";

// constants
import {_INTERFACEID_LSP7} from "./LSP7Constants.sol";

/**
 * @title LSP7DigitalAsset contract
 * @author Matthew Stevens
 * @dev Implementation of a LSP7 compliant contract.
 *
 * This implementation is agnostic to the way tokens are created.
 * A supply mechanism has to be added in a derived contract using {_mint}
 * For a generic mechanism, see {LSP7Mintable}.
 */
contract LSP7DigitalAsset is LSP4DigitalAssetMetadata, LSP7DigitalAssetCore {
    /**
     * @notice Sets the token-Metadata
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param newOwner_ The owner of the the token-Metadata
     * @param isNFT_ Specify if the LSP7 token is a fungible or non-fungible token
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        bool isNFT_
    ) LSP4DigitalAssetMetadata(name_, symbol_, newOwner_) {
        _isNFT = isNFT_;
    }

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
        return interfaceId == _INTERFACEID_LSP7 || super.supportsInterface(interfaceId);
    }
}
