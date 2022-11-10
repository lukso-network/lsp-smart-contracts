// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// interfaces
import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {ILSP6KeyManager} from "../../LSP6KeyManager/ILSP6KeyManager.sol";
import {LSP14Ownable2Step} from "../../LSP14Ownable2Step/LSP14Ownable2Step.sol";

// constants
import {
    _LSP6KEY_ADDRESSPERMISSIONS_ARRAY,
    _LSP6KEY_ADDRESSPERMISSIONS_ARRAY_PREFIX,
    _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX
} from "../../LSP6KeyManager/LSP6Constants.sol";

contract ReentrancyWithAddPermission {
    function universalReceiverDelegate(
        address sender,
        uint256 value, // solhint-disable no-unused-vars
        bytes32 typeId, // solhint-disable no-unused-vars
        bytes memory data
    ) public virtual returns (bytes memory result) {
        // solhint-disable no-unused-vars
        address keyManager = LSP14Ownable2Step(sender).owner();

        bytes memory setDataPayload = abi.encodeWithSignature(
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

        ILSP6KeyManager(keyManager).execute(setDataPayload);
    }
}
