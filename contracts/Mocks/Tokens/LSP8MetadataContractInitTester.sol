// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {
    ILSP8IdentifiableDigitalAsset as ILSP8
} from "../../LSP8IdentifiableDigitalAsset/ILSP8IdentifiableDigitalAsset.sol";

// modules
import {
    ERC725YInitAbstract
} from "@erc725/smart-contracts/contracts/ERC725YInitAbstract.sol";
import {
    LSP8MetadataContractInitAbstract
} from "../../LSP8IdentifiableDigitalAsset/extensions/LSP8MetadataContractInitAbstract.sol";

/**
 * @dev This contract is used only for testing purposes
 */
contract LSP8MetadataContractInitTester is LSP8MetadataContractInitAbstract {
    /**
     * @dev initialize (= lock) base implementation contract on deployment
     */
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address metadataContractOwner,
        ILSP8 lsp8ReferenceContract
    ) public virtual initializer {
        ERC725YInitAbstract._initialize(metadataContractOwner);

        LSP8MetadataContractInitAbstract._initialize(lsp8ReferenceContract);
    }
}
