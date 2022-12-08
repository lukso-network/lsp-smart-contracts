// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// interfaces
import {ILSP6KeyManager} from "../../LSP6KeyManager/ILSP6KeyManager.sol";
import {LSP14Ownable2Step} from "../../LSP14Ownable2Step/LSP14Ownable2Step.sol";

// constants
import "../../LSP1UniversalReceiver/LSP1Constants.sol";
import "../../LSP6KeyManager/LSP6Constants.sol";

contract ReentrantContract {
    event ValueReceived(uint256);
    mapping(string => bytes) payloads;

    constructor(
        address _CONTROLLER_ADDRESS,
        bytes32 _URD_TYPE_ID,
        address _URD_ADDRESS
    ) {
        payloads["TRANSFERVALUE"] = abi.encodeWithSignature(
            "execute(uint256,address,uint256,bytes)",
            0,
            address(this),
            1 ether,
            ""
        );
        payloads["SETDATA"] = abi.encodeWithSignature(
            "setData(bytes32,bytes)",
            keccak256(bytes("SomeRandomTextUsed")),
            bytes("SomeRandomTextUsed")
        );
        payloads["ADDPERMISSIONS"] = abi.encodeWithSignature(
            "setData(bytes32,bytes)",
            bytes32(
                bytes.concat(
                    _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
                    bytes2(0),
                    bytes20(_CONTROLLER_ADDRESS)
                )
            ),
            bytes.concat(bytes32(uint256(16)))
        );
        payloads["CHANGEPERMISSIONS"] = abi.encodeWithSignature(
            "setData(bytes32,bytes)",
            bytes32(
                bytes.concat(
                    _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
                    bytes2(0),
                    bytes20(_CONTROLLER_ADDRESS)
                )
            ),
            ""
        );
        payloads["ADDUNIVERSALRECEIVERDELEGATE"] = abi.encodeWithSignature(
            "setData(bytes32,bytes)",
            bytes32(
                bytes.concat(_LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX, bytes2(0), _URD_TYPE_ID)
            ),
            _URD_ADDRESS
        );
        payloads["CHANGEUNIVERSALRECEIVERDELEGATE"] = abi.encodeWithSignature(
            "setData(bytes32,bytes)",
            bytes32(
                bytes.concat(_LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX, bytes2(0), _URD_TYPE_ID)
            ),
            ""
        );
    }

    receive() external payable {
        emit ValueReceived(msg.value);
    }

    function getPayloads() external view returns (bytes[6] memory) {
        return [
            payloads["TRANSFERVALUE"],
            payloads["SETDATA"],
            payloads["ADDPERMISSIONS"],
            payloads["CHANGEPERMISSIONS"],
            payloads["ADDUNIVERSALRECEIVERDELEGATE"],
            payloads["CHANGEUNIVERSALRECEIVERDELEGATE"]
        ];
    }

    function callThatReenters(address keyManagerAddress, string memory payloadType)
        external
        returns (bytes memory)
    {
        return ILSP6KeyManager(keyManagerAddress).execute(payloads[payloadType]);
    }
}
