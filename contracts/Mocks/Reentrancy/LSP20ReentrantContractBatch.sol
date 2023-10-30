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

contract LSP20ReentrantContractBatch {
    event ValueReceived(uint256);
    mapping(string => function() internal returns (bytes[] memory))
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
    ) external returns (bytes[] memory) {
        return _functionCall[payloadType]();
    }

    // --- Internal Methods

    function _transferValue() internal returns (bytes[] memory) {
        uint256[] memory operationTypes = new uint256[](1);
        operationTypes[0] = 0;
        address[] memory callees = new address[](1);
        callees[0] = address(this);
        uint256[] memory values = new uint256[](1);
        values[0] = 1 ether;
        bytes[] memory callDatas = new bytes[](1);
        callDatas[0] = "";

        return
            IERC725X(msg.sender).executeBatch(
                operationTypes,
                callees,
                values,
                callDatas
            );
    }

    function _setData() internal returns (bytes[] memory) {
        bytes32[] memory dataKeys = new bytes32[](1);
        dataKeys[0] = keccak256(bytes("SomeRandomTextUsed"));
        bytes[] memory dataValues = new bytes[](1);
        dataValues[0] = bytes("SomeRandomTextUsed");

        IERC725Y(msg.sender).setDataBatch(dataKeys, dataValues);

        return new bytes[](0);
    }

    function _addController() internal returns (bytes[] memory) {
        bytes32[] memory dataKeys = new bytes32[](1);
        dataKeys[0] = bytes32(
            bytes.concat(
                _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
                bytes2(0),
                bytes20(_newControllerAddress)
            )
        );
        bytes[] memory dataValues = new bytes[](1);
        dataValues[0] = bytes.concat(ALL_REGULAR_PERMISSIONS);

        IERC725Y(msg.sender).setDataBatch(dataKeys, dataValues);

        return new bytes[](0);
    }

    function _editPermissions() internal returns (bytes[] memory) {
        bytes32[] memory dataKeys = new bytes32[](1);
        dataKeys[0] = bytes32(
            bytes.concat(
                _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
                bytes2(0),
                bytes20(_newControllerAddress)
            )
        );
        bytes[] memory dataValues = new bytes[](1);
        dataValues[0] = "";

        IERC725Y(msg.sender).setDataBatch(dataKeys, dataValues);

        return new bytes[](0);
    }

    function _addUniversalReceiverDelegate() internal returns (bytes[] memory) {
        bytes32[] memory dataKeys = new bytes32[](1);
        dataKeys[0] = bytes32(
            bytes.concat(
                _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
                bytes2(0),
                bytes20(_newURDTypeId)
            )
        );
        bytes[] memory dataValues = new bytes[](1);
        dataValues[0] = bytes.concat(bytes20(_newURDAddress));

        IERC725Y(msg.sender).setDataBatch(dataKeys, dataValues);

        return new bytes[](0);
    }

    function _changeUniversalReceiverDelegate()
        internal
        returns (bytes[] memory)
    {
        bytes32[] memory dataKeys = new bytes32[](1);
        dataKeys[0] = bytes32(
            bytes.concat(
                _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
                bytes2(0),
                bytes20(_newURDTypeId)
            )
        );
        bytes[] memory dataValues = new bytes[](1);
        dataValues[0] = "";

        IERC725Y(msg.sender).setDataBatch(dataKeys, dataValues);

        return new bytes[](0);
    }
}
