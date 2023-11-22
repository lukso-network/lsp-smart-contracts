// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {
    ILSP8IdentifiableDigitalAsset as ILSP8
} from "../../LSP8IdentifiableDigitalAsset/ILSP8IdentifiableDigitalAsset.sol";

import {
    LSP8MetadataContract
} from "../../LSP8IdentifiableDigitalAsset/extensions/LSP8MetadataContract.sol";

/**
 * @dev This contract is used only for testing purposes
 */
contract LSP8MetadataContractTester is LSP8MetadataContract {
    constructor(
        address metadataContractOwner,
        ILSP8 lsp8ReferenceContract
    ) LSP8MetadataContract(metadataContractOwner, lsp8ReferenceContract) {}
}
