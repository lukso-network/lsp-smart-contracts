// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces

import {
    ILSP1UniversalReceiverDelegate
} from "../../LSP1UniversalReceiver/ILSP1UniversalReceiverDelegate.sol";

// modules
import {
    ERC165Storage
} from "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

// constants

import {
    _TYPEID_LSP0_VALUE_RECEIVED
} from "../../LSP0ERC725Account/LSP0Constants.sol";

import {
    _INTERFACEID_LSP1_DELEGATE
} from "../../LSP1UniversalReceiver/LSP1Constants.sol";

import {_TYPEID_LSP9_VALUE_RECEIVED} from "../../LSP9Vault/LSP9Constants.sol";

contract UniversalReceiverDelegateDataLYX is
    ERC165Storage,
    ILSP1UniversalReceiverDelegate
{
    mapping(address => uint256) public lastValueReceived;

    constructor() {
        _registerInterface(_INTERFACEID_LSP1_DELEGATE);
    }

    function universalReceiverDelegate(
        address /*sender*/,
        uint256 value,
        bytes32 typeId,
        bytes memory /* data */
    ) public virtual override returns (bytes memory) {
        if (
            typeId == _TYPEID_LSP0_VALUE_RECEIVED ||
            typeId == _TYPEID_LSP9_VALUE_RECEIVED
        ) {
            lastValueReceived[msg.sender] = value;
        }

        return "";
    }
}
