// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// interfaces
import {ILSP6KeyManager} from "../../LSP6KeyManager/ILSP6KeyManager.sol";
import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {IERC725X} from "@erc725/smart-contracts/contracts/interfaces/IERC725X.sol";

// constants
import "../../LSP1UniversalReceiver/LSP1Constants.sol";
import "../../LSP6KeyManager/LSP6Constants.sol";

contract ReentrantContract {
    event ValueReceived(uint256);
    mapping(string => function() internal returns (bytes memory)) private functionCall;

    address newControllerAddress;
    bytes32 newURDTypeId;
    address newURDAddress;

    constructor(address newControllerAddress_, bytes32 newURDTypeId_, address newURDAddress_) {
        newControllerAddress = newControllerAddress_;
        newURDTypeId = newURDTypeId_;
        newURDAddress = newURDAddress_;

        functionCall["TRANSFERVALUE"] = transferValue;
        functionCall["SETDATA"] = setData;
        functionCall["ADDCONTROLLER"] = addController;
        functionCall["EDITPERMISSIONS"] = editPermissions;
        functionCall["ADDUNIVERSALRECEIVERDELEGATE"] = addUniversalReceiverDelegate;
        functionCall["CHANGEUNIVERSALRECEIVERDELEGATE"] = changeUniversalReceiverDelegate;
    }

    receive() external payable {
        emit ValueReceived(msg.value);
    }

    function callThatReenters(string memory payloadType) external returns (bytes memory) {
        return functionCall[payloadType]();
    }

    // --- Internal Methods

    function transferValue() internal returns (bytes memory) {
        return IERC725X(msg.sender).execute(0, address(this), 1 ether, "");
    }

    function setData() internal returns (bytes memory) {
        IERC725Y(msg.sender).setData(
            keccak256(bytes("SomeRandomTextUsed")),
            bytes("SomeRandomTextUsed")
        );

        return "";
    }

    function addController() internal returns (bytes memory) {
        IERC725Y(msg.sender).setData(
            bytes32(
                bytes.concat(
                    _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
                    bytes2(0),
                    bytes20(newControllerAddress)
                )
            ),
            bytes.concat(bytes32(uint256(16)))
        );

        return "";
    }

    function editPermissions() internal returns (bytes memory) {
        IERC725Y(msg.sender).setData(
            bytes32(
                bytes.concat(
                    _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
                    bytes2(0),
                    bytes20(newControllerAddress)
                )
            ),
            ""
        );

        return "";
    }

    function addUniversalReceiverDelegate() internal returns (bytes memory) {
        IERC725Y(msg.sender).setData(
            bytes32(
                bytes.concat(
                    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
                    bytes2(0),
                    bytes20(newURDTypeId)
                )
            ),
            bytes.concat(bytes20(newURDAddress))
        );

        return "";
    }

    function changeUniversalReceiverDelegate() internal returns (bytes memory) {
        IERC725Y(msg.sender).setData(
            bytes32(
                bytes.concat(
                    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
                    bytes2(0),
                    bytes20(newURDTypeId)
                )
            ),
            ""
        );

        return "";
    }
}
