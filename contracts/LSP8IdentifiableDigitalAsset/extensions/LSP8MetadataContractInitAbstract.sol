// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {
    ILSP8IdentifiableDigitalAsset as ILSP8
} from "../ILSP8IdentifiableDigitalAsset.sol";

// modules
import {
    ERC725YInitAbstract
} from "@erc725/smart-contracts/contracts/ERC725YInitAbstract.sol";

// errors
import {LSP8ReferenceContractNotEditable} from "../LSP8Errors.sol";

// constants
import {_LSP8_REFERENCE_CONTRACT_KEY} from "../LSP8Constants.sol";

/**
 * @title LSP8 Metadata Contract (abstract version to create implementations for proxies)
 * @author Jean Cavallera <CJ42>
 * @dev Contract that can act as a NFT that can holds dynamic metadata that can change overtime.
 * This contract is useful to be used when creating a LSP8 Collection where the tokenId type is set to `address` (`4`) under the `LSP8TokenIdType` data key.
 * A reference to the LSP8 Collection can be set on deployment.
 */
abstract contract LSP8MetadataContractInitAbstract is ERC725YInitAbstract {
    /**
     * @dev Deploy an ERC725Y Metadata contract controlled by `metadataContractOwner` which can set data and transfer ownership of the contract.
     * Set a reference to the LSP8 collection that this metadata contract belongs to on deployment.
     */
    function _initialize(
        ILSP8 lsp8ReferenceContract
    ) internal virtual onlyInitializing {
        super._setData(
            _LSP8_REFERENCE_CONTRACT_KEY,
            abi.encodePacked(
                lsp8ReferenceContract,
                bytes32(bytes20(address(this)))
            )
        );
    }

    function _setData(
        bytes32 dataKey,
        bytes memory dataValue
    ) internal virtual override {
        if (dataKey == _LSP8_REFERENCE_CONTRACT_KEY) {
            revert LSP8ReferenceContractNotEditable();
        }
        super._setData(dataKey, dataValue);
    }
}
