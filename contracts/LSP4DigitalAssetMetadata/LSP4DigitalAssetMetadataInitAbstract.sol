// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// modules
import {ERC725YInitAbstract, ERC725YCore} from "@erc725/smart-contracts/contracts/ERC725YInitAbstract.sol";

// constants
import "./LSP4Constants.sol";

/**
 * @title LSP4DigitalAssetMetadata
 * @author Matthew Stevens
 * @dev Inheritable Proxy Implementation of a LSP8 compliant contract.
 */
abstract contract LSP4DigitalAssetMetadataInitAbstract is ERC725YInitAbstract {
    function _initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) internal virtual onlyInitializing {
        ERC725YInitAbstract._initialize(newOwner_);

        // set SupportedStandards:LSP4DigitalAsset
        super._setData(_LSP4_SUPPORTED_STANDARDS_KEY, _LSP4_SUPPORTED_STANDARDS_VALUE);

        super._setData(_LSP4_TOKEN_NAME_KEY, bytes(name_));
        super._setData(_LSP4_TOKEN_SYMBOL_KEY, bytes(symbol_));
    }

    function _setData(bytes32 key, bytes memory value) internal virtual override {
        require(key != _LSP4_TOKEN_NAME_KEY, "LSP4: cannot edit Token Name after deployment");
        require(key != _LSP4_TOKEN_SYMBOL_KEY, "LSP4: cannot edit Token Symbol after deployment");
        super._setData(key, value);
    }
}
