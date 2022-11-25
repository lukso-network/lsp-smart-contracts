// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// interfaces
import {ILSP6KeyManager} from "../../LSP6KeyManager/ILSP6KeyManager.sol";
import {LSP14Ownable2Step} from "../../LSP14Ownable2Step/LSP14Ownable2Step.sol";

// constants
import "../../LSP6KeyManager/LSP6Constants.sol";

contract ReentrancyWithAddPermission {
    function universalReceiver(
        bytes32 typeId, // solhint-disable no-unused-vars
        bytes memory data // bytes20(address(controller))
    ) public virtual returns (bytes memory result) {
        address sender = address(bytes20(msg.data[msg.data.length - 52:]));
        // solhint-disable no-unused-vars
        address keyManager = LSP14Ownable2Step(sender).owner();

        bytes memory addPermissionPayload = abi.encodeWithSignature(
            "setData(bytes32,bytes)",
            bytes32(
                bytes.concat(
                    _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
                    bytes2(0),
                    bytes20(data)
                )
            ),
            bytes.concat(bytes32(uint256(16)))
        );

        ILSP6KeyManager(keyManager).execute(addPermissionPayload);
    }
}
