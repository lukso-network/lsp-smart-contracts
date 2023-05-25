// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.4;

// interfaces
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// modules
import {ERC725YCore} from "@erc725/smart-contracts/contracts/ERC725YCore.sol";
import {LSP8IdentifiableDigitalAssetCore} from "./LSP8IdentifiableDigitalAssetCore.sol";
import {LSP4DigitalAssetMetadata} from "../LSP4DigitalAssetMetadata/LSP4DigitalAssetMetadata.sol";

// constants
import {_INTERFACEID_LSP8, _LSP8_TOKENID_TYPE_KEY} from "./LSP8Constants.sol";

// errors
import {LSP8TokenIdTypeNotEditable} from "./LSP8Errors.sol";

/**
 * @title LSP8IdentifiableDigitalAsset contract
 * @author Matthew Stevens
 * @dev Implementation of a LSP8 compliant contract.
 */
abstract contract LSP8IdentifiableDigitalAsset is
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
        address newOwner_,
        uint256 tokenIdType
    ) LSP4DigitalAssetMetadata(name_, symbol_, newOwner_) {
        _setData(_LSP8_TOKENID_TYPE_KEY, abi.encode(tokenIdType));
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
        return interfaceId == _INTERFACEID_LSP8 || super.supportsInterface(interfaceId);
    }

    /**
     * @inheritdoc LSP4DigitalAssetMetadata
     * @dev The ERC725Y data key `_LSP8_TOKENID_TYPE_KEY` cannot be changed
     * once the identifiable digital asset contract has been deployed.
     */
    function _setData(bytes32 dataKey, bytes memory dataValue) internal virtual override {
        if (dataKey == _LSP8_TOKENID_TYPE_KEY) {
            revert LSP8TokenIdTypeNotEditable();
        }
        LSP4DigitalAssetMetadata._setData(dataKey, dataValue);
    }
}
