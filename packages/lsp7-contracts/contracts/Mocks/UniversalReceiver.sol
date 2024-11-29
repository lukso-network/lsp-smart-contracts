// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {
    ILSP1UniversalReceiver
} from "@lukso/lsp1-contracts/contracts/ILSP1UniversalReceiver.sol";
import {
    _INTERFACEID_LSP1
} from "@lukso/lsp1-contracts/contracts/LSP1Constants.sol";

contract MockUniversalReceiver is ILSP1UniversalReceiver {
    event UniversalReceiverCalled(
        address indexed from,
        bytes32 indexed typeId,
        bytes receivedData
    );

    function universalReceiver(
        bytes32 typeId,
        bytes calldata receivedData
    ) external payable override returns (bytes memory) {
        emit UniversalReceiverCalled(msg.sender, typeId, receivedData);
        return "";
    }

    function supportsInterface(bytes4 interfaceId) public view returns (bool) {
        return interfaceId == _INTERFACEID_LSP1;
    }
}
