// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {
    ILSP1UniversalReceiver
} from "../../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";

// modules
import {
    ERC165Storage
} from "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

// constants
import {_INTERFACEID_LSP1} from "../../LSP1UniversalReceiver/LSP1Constants.sol";

contract TokenReceiverWithLSP1 is ERC165Storage, ILSP1UniversalReceiver {
    constructor() {
        _registerInterface(_INTERFACEID_LSP1);
    }

    function universalReceiver(
        bytes32 typeId,
        bytes memory data
    ) external payable override returns (bytes memory returnValue) {
        emit UniversalReceiver(msg.sender, msg.value, typeId, data, "");

        return "thanks for calling";
    }

    receive() external payable {}

    fallback() external payable {}
}
