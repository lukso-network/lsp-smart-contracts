// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {
    IERC725Y
} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {
    IERC725X
} from "@erc725/smart-contracts/contracts/interfaces/IERC725X.sol";

// constants
import {
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX
} from "../../LSP1UniversalReceiver/LSP1Constants.sol";

import {
    _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
    ALL_REGULAR_PERMISSIONS
} from "../../LSP6KeyManager/LSP6Constants.sol";

contract LSP20ReentrantContract {
    event ValueReceived(uint256);
    mapping(string => function() internal returns (bytes memory))
        private _functionCall;

    address private _newControllerAddress;
    bytes32 private _newURDTypeId;
    address private _newURDAddress;

    constructor(
        address _newControllerAddress_,
        bytes32 _newURDTypeId_,
        address _newURDAddress_
    ) {
        _newControllerAddress = _newControllerAddress_;
        _newURDTypeId = _newURDTypeId_;
        _newURDAddress = _newURDAddress_;

        _functionCall["TRANSFERVALUE"] = _transferValue;
        _functionCall["SETDATA"] = _setData;
        _functionCall["ADDCONTROLLER"] = _addController;
        _functionCall["EDITPERMISSIONS"] = _editPermissions;
        _functionCall[
            "ADDUNIVERSALRECEIVERDELEGATE"
        ] = _addUniversalReceiverDelegate;
        _functionCall[
            "CHANGEUNIVERSALRECEIVERDELEGATE"
        ] = _changeUniversalReceiverDelegate;
    }

    receive() external payable {
        emit ValueReceived(msg.value);
    }

    function callThatReenters(
        string memory payloadType
    ) external returns (bytes memory) {
        return _functionCall[payloadType]();
    }

    // --- Internal Methods

    function _transferValue() internal returns (bytes memory) {
        return IERC725X(msg.sender).execute(0, address(this), 1 ether, "");
    }

    function _setData() internal returns (bytes memory) {
        IERC725Y(msg.sender).setData(
            keccak256(bytes("SomeRandomTextUsed")),
            bytes("SomeRandomTextUsed")
        );

        return "";
    }

    function _addController() internal returns (bytes memory) {
        IERC725Y(msg.sender).setData(
            bytes32(
                bytes.concat(
                    _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
                    bytes2(0),
                    bytes20(_newControllerAddress)
                )
            ),
            bytes.concat(ALL_REGULAR_PERMISSIONS)
        );

        return "";
    }

    function _editPermissions() internal returns (bytes memory) {
        IERC725Y(msg.sender).setData(
            bytes32(
                bytes.concat(
                    _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
                    bytes2(0),
                    bytes20(_newControllerAddress)
                )
            ),
            ""
        );

        return "";
    }

    function _addUniversalReceiverDelegate() internal returns (bytes memory) {
        IERC725Y(msg.sender).setData(
            bytes32(
                bytes.concat(
                    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
                    bytes2(0),
                    bytes20(_newURDTypeId)
                )
            ),
            bytes.concat(bytes20(_newURDAddress))
        );

        return "";
    }

    function _changeUniversalReceiverDelegate()
        internal
        returns (bytes memory)
    {
        IERC725Y(msg.sender).setData(
            bytes32(
                bytes.concat(
                    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
                    bytes2(0),
                    bytes20(_newURDTypeId)
                )
            ),
            ""
        );

        return "";
    }
}
