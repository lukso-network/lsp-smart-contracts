// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// constants
import "./LSP8Constants.sol";
import "../LSP4/LSP4Constants.sol";

// modules
import "./LSP8Core.sol";
import "../LSP4/LSP4Init.sol";

/**
 * @dev Implementation of a LSP8 compliant contract.
 */
contract LSP8Init is Initializable, LSP4Init, LSP8Core {
    //
    // --- Initialize
    //

    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    )
        public
        virtual
        override
        initializer
    {
        LSP4Init.initialize(name_, symbol_, newOwner_);

        _setData(_LSP8_SUPPORTED_STANDARDS_KEY, abi.encodePacked(_LSP8_SUPPORTED_STANDARDS_VALUE));
    }

    //
    // --- Metadata functionality
    //

    /**
     * @dev Create a ERC725Y contract to be used for metadata storage of `tokenId`.
     */
    function _createMetadataFor(bytes32 tokenId)
        internal
        virtual
        returns (address)
    {
        require(
            _exists(tokenId),
            "LSP8: metadata creation for nonexistent token"
        );

        bytes32 metadataKeyForTokenId = _buildMetadataKey(tokenId, true);

        bytes memory existingMetadataValue = ERC725Utils.getDataSingle(this, metadataKeyForTokenId);
        address existingMetadataAddress = abi.decode(existingMetadataValue, (address));
        if (existingMetadataAddress != address(0)) {
            return existingMetadataAddress;
        }

        // TODO: can use a proxy pattern here
        address metadataAddress = address(new ERC725Y(_msgSender()));

        bytes memory metadataAddressBytes = abi.encodePacked(metadataAddress);
        _setData(metadataKeyForTokenId, metadataAddressBytes);

        return metadataAddress;
    }
}
