// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// interfaces
import {ILSP6KeyManager} from "../../LSP6KeyManager/ILSP6KeyManager.sol";
import {LSP14Ownable2Step} from "../../LSP14Ownable2Step/LSP14Ownable2Step.sol";

contract ReentrancyWithSetData {
    function universalReceiver(
        bytes32 typeId, // solhint-disable no-unused-vars
        bytes memory data // solhint-disable no-unused-vars
    ) public virtual returns (bytes memory result) {
        // solhint-disable no-unused-vars
        address sender = address(bytes20(msg.data[msg.data.length - 52:]));
        address keyManager = LSP14Ownable2Step(sender).owner();
        bytes memory setDataPayload = abi.encodeWithSignature(
            "setData(bytes32,bytes)",
            keccak256(bytes("SomeRandomTextUsed")),
            bytes("SomeRandomTextUsed")
        );
        ILSP6KeyManager(keyManager).execute(setDataPayload);
    }
}
