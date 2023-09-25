// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {ILSP6KeyManager} from "../../LSP6KeyManager/ILSP6KeyManager.sol";

// constants
import {
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX
} from "../../LSP1UniversalReceiver/LSP1Constants.sol";

import {
    _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX
} from "../../LSP6KeyManager/LSP6Constants.sol";

contract ReentrantContract {
    event ValueReceived(uint256);
    mapping(string => bytes) private _payloads;

    constructor(
        address newControllerAddress,
        bytes32 newURDTypeId,
        address newURDAddress
    ) {
        _payloads["TRANSFERVALUE"] = abi.encodeWithSignature(
            "execute(uint256,address,uint256,bytes)",
            0,
            address(this),
            1 ether,
            ""
        );
        _payloads["SETDATA"] = abi.encodeWithSignature(
            "setData(bytes32,bytes)",
            keccak256(bytes("SomeRandomTextUsed")),
            bytes("SomeRandomTextUsed")
        );
        _payloads["ADDCONTROLLER"] = abi.encodeWithSignature(
            "setData(bytes32,bytes)",
            bytes32(
                bytes.concat(
                    _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
                    bytes2(0),
                    bytes20(newControllerAddress)
                )
            ),
            bytes.concat(bytes32(uint256(16)))
        );
        _payloads["EDITPERMISSIONS"] = abi.encodeWithSignature(
            "setData(bytes32,bytes)",
            bytes32(
                bytes.concat(
                    _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
                    bytes2(0),
                    bytes20(newControllerAddress)
                )
            ),
            ""
        );
        _payloads["ADDUNIVERSALRECEIVERDELEGATE"] = abi.encodeWithSignature(
            "setData(bytes32,bytes)",
            bytes32(
                bytes.concat(
                    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
                    bytes2(0),
                    bytes20(newURDTypeId)
                )
            ),
            bytes.concat(bytes20(newURDAddress))
        );
        _payloads["CHANGEUNIVERSALRECEIVERDELEGATE"] = abi.encodeWithSignature(
            "setData(bytes32,bytes)",
            bytes32(
                bytes.concat(
                    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
                    bytes2(0),
                    bytes20(newURDTypeId)
                )
            ),
            ""
        );
    }

    receive() external payable {
        emit ValueReceived(msg.value);
    }

    function callThatReenters(
        address keyManagerAddress,
        string memory payloadType
    ) external returns (bytes memory) {
        return
            ILSP6KeyManager(keyManagerAddress).execute(_payloads[payloadType]);
    }
}
