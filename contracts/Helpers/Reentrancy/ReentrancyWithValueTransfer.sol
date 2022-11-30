// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// interfaces
import {ILSP6KeyManager} from "../../LSP6KeyManager/ILSP6KeyManager.sol";
import {LSP14Ownable2Step} from "../../LSP14Ownable2Step/LSP14Ownable2Step.sol";

contract ReentrancyWithValueTransfer {
    // solhint-disable no-empty-blocks
    receive() external payable {}

    function universalReceiver(
        bytes32 typeId, // solhint-disable no-unused-vars
        bytes memory data // solhint-disable no-unused-vars
    ) public virtual returns (bytes memory) {
        // silent compiler warning (this does not push new items on the stack)
        (typeId, data);

        // solhint-disable no-unused-vars
        address keyManager = LSP14Ownable2Step(msg.sender).owner();
        bytes memory transferValuePayload = abi.encodeWithSignature(
            "execute(uint256,address,uint256,bytes)",
            0,
            address(this),
            1 ether,
            ""
        );
        ILSP6KeyManager(keyManager).execute(transferValuePayload);

        return "";
    }
}
