// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import {
    LSP8Reference
} from "../../LSP8IdentifiableDigitalAsset/extensions/LSP8Reference.sol";

import {
    LSP8IdentifiableDigitalAsset
} from "../../LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";

import {
    _LSP8_REFERENCE_CONTRACT
} from "../../LSP8IdentifiableDigitalAsset/LSP8Constants.sol";

contract LSP8ReferenceTokenIdContractTester is
    LSP8IdentifiableDigitalAsset,
    LSP8Reference
{
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 tokenIdType_
    ) LSP8IdentifiableDigitalAsset(name_, symbol_, newOwner_, tokenIdType_) {}

    function setReferenceCollectionContract(address _referenceContract) public {
        super._setData(
            _LSP8_REFERENCE_CONTRACT,
            abi.encodePacked(
                _referenceContract,
                bytes32(bytes20(address(this)))
            )
        );
    }
}
