// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// modules
import "@erc725/smart-contracts/contracts/ERC725YInitAbstract.sol";

// constants
import "./LSP4Constants.sol";

/**
 * @title LSP4DigitalAssetMetadata
 * @author Matthew Stevens
 * @dev Inheritable Proxy Implementation of a LSP8 compliant contract.
 */
abstract contract LSP4DigitalAssetMetadataInitAbstract is
    Initializable,
    ERC725YInitAbstract
{
    function _initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) internal virtual onlyInitializing {
        ERC725YInitAbstract._initialize(newOwner_);

        // set SupportedStandards:LSP4DigitalAsset
        _setData(
            _LSP4_SUPPORTED_STANDARDS_KEY,
            _LSP4_SUPPORTED_STANDARDS_VALUE
        );

        _setData(_LSP4_TOKEN_NAME_KEY, bytes(name_));
        _setData(_LSP4_TOKEN_SYMBOL_KEY, bytes(symbol_));
    }
}
