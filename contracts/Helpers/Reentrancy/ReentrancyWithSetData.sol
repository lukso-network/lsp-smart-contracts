// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// interfaces
import {ILSP6KeyManager} from "../../LSP6KeyManager/ILSP6KeyManager.sol";
import {LSP14Ownable2Step} from "../../LSP14Ownable2Step/LSP14Ownable2Step.sol";

contract ReentrancyWithSetData {
    function universalReceiver(
        bytes32, /* typeId */
        bytes memory /* data */
    ) public virtual returns (bytes memory) {
        // solhint-disable no-unused-vars
        address keyManager = LSP14Ownable2Step(msg.sender).owner();
        bytes memory setDataPayload = abi.encodeWithSignature(
            "setData(bytes32,bytes)",
            keccak256(bytes("SomeRandomTextUsed")),
            bytes("SomeRandomTextUsed")
        );

        return ILSP6KeyManager(keyManager).execute(setDataPayload);
    }
}
