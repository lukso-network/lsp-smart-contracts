// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// constants
import "./LSP8Constants.sol";
import "../LSP4/LSP4Constants.sol";

// modules
import "./LSP8Core.sol";
import "../LSP4/LSP4.sol";
import "../../submodules/ERC725/implementations/contracts/ERC725/ERC725Y.sol";

/**
 * @dev Implementation of a LSP8 compliant contract.
 */
contract LSP8 is LSP4, LSP8Core {
    //
    // --- Initialize
    //

    constructor(
        string memory name_,
        string memory symbol_
    ) LSP4(name_, symbol_) {
        // TODO: when ERC725Y has been updated
        // bytes32[] keys = new bytes32[](2);
        // bytes[] values = new bytes[](2);
        //
        // keys.push(_LSP8_SUPPORTED_STANDARD_KEY);
        // values.push(abi.encodePacked(_LSP8_SUPPORTED_STANDARD_VALUE));
        //
        // setDataFromMemory(keys, values);
        setDataFromMemory(_LSP8_SUPPORTED_STANDARDS_KEY, abi.encodePacked(_LSP8_SUPPORTED_STANDARDS_VALUE));
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

        bytes32 metadataKeyForTokenId = _buildMetadataKey(tokenId);

        bytes memory existingMetadataValue = ERC725Utils.getDataSingle(this, metadataKeyForTokenId);
        address existingMetadataAddress = abi.decode(existingMetadataValue, (address));
        if (existingMetadataAddress != address(0)) {
            return existingMetadataAddress;
        }

        // TODO: can use a proxy pattern here
        address metadataAddress = address(new ERC725Y(_msgSender()));

        bytes memory metadataAddressBytes = abi.encodePacked(metadataAddress);
        setDataFromMemory(metadataKeyForTokenId, metadataAddressBytes);

        return metadataAddress;
    }

    //
    // --- Overrides
    //

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165Storage, IERC165)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
