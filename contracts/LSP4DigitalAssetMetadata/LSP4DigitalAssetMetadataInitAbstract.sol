// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// modules
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {ERC725YInitAbstract, ERC725YCore} from "@erc725/smart-contracts/contracts/ERC725YInitAbstract.sol";
import {LSP4DigitalAssetMetadataCore} from "./LSP4DigitalAssetMetadataCore.sol";

// constants
import "./LSP4Constants.sol";

/**
 * @title LSP4DigitalAssetMetadata
 * @author Matthew Stevens
 * @dev Inheritable Proxy Implementation of a LSP8 compliant contract.
 */
abstract contract LSP4DigitalAssetMetadataInitAbstract is
    LSP4DigitalAssetMetadataCore,
    ERC725YInitAbstract
{
    function _initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) internal virtual onlyInitializing {
        ERC725YInitAbstract._initialize(newOwner_);

        // set SupportedStandards:LSP4DigitalAsset
        ERC725YCore._setData(_LSP4_SUPPORTED_STANDARDS_KEY, _LSP4_SUPPORTED_STANDARDS_VALUE);

        ERC725YCore._setData(_LSP4_TOKEN_NAME_KEY, bytes(name_));
        ERC725YCore._setData(_LSP4_TOKEN_SYMBOL_KEY, bytes(symbol_));
    }

    function _setData(bytes32 key, bytes memory value)
        internal
        virtual
        override(ERC725YCore, LSP4DigitalAssetMetadataCore)
    {
        LSP4DigitalAssetMetadataCore._setData(key, value);
    }
}
