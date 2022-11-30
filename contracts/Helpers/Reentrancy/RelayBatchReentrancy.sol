// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// interfaces
import {ILSP6KeyManager} from "../../LSP6KeyManager/ILSP6KeyManager.sol";
import {LSP14Ownable2Step} from "../../LSP14Ownable2Step/LSP14Ownable2Step.sol";

contract RelayBatchReentrancy {
    bytes[] private signatures;
    uint256[] private nonces;
    uint256[] private values;
    bytes[] private payloads;

    function prepareRelayCall(
        bytes[] memory newSignatures,
        uint256[] memory newNonces,
        uint256[] memory newValues,
        bytes[] memory newPayloads
    ) external {
        signatures = newSignatures;
        nonces = newNonces;
        values = newValues;
        payloads = newPayloads;
    }

    // solhint-disable no-empty-blocks
    receive() external payable {}

    function universalReceiver(
        bytes32 typeId, // solhint-disable no-unused-vars
        bytes memory data // solhint-disable no-unused-vars
    ) public virtual returns (bytes memory result) {
        // solhint-disable no-unused-vars
        address keyManager = LSP14Ownable2Step(msg.sender).owner();

        ILSP6KeyManager(keyManager).executeRelayCall(signatures, nonces, values, payloads);
    }
}
