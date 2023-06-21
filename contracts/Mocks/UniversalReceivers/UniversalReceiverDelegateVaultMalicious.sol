// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {ILSP6KeyManager} from "../../LSP6KeyManager/ILSP6KeyManager.sol";
import {IERC725X} from "@erc725/smart-contracts/contracts/interfaces/IERC725X.sol";
import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {LSP14Ownable2Step} from "../../LSP14Ownable2Step/LSP14Ownable2Step.sol";

// modules
import {ERC725Y} from "@erc725/smart-contracts/contracts/ERC725Y.sol";
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";
import {ERC165Storage} from "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

// constants
import {_TYPEID_LSP7_TOKENSSENDER} from "../../LSP7DigitalAsset/LSP7Constants.sol";
import "../../LSP1UniversalReceiver/LSP1Constants.sol";
import "../../LSP6KeyManager/LSP6Constants.sol";
import "../../LSP17ContractExtension/LSP17Constants.sol";

/**
 * @dev This contract is used only for testing
 */
contract UniversalReceiverDelegateVaultMalicious is ERC165Storage {
    constructor() {
        _registerInterface(_INTERFACEID_LSP1);
    }

    function universalReceiver(
        bytes32 typeId,
        bytes memory data
    ) public virtual returns (bytes memory) {
        if (typeId == keccak256(abi.encodePacked("setData"))) {
            if (data[0] == 0x00) {
                IERC725Y(msg.sender).setData(
                    bytes32(abi.encodePacked(_LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX, bytes22(0))),
                    bytes("some random text for the data value")
                );
            } else if (data[0] == 0x01) {
                IERC725Y(msg.sender).setData(
                    bytes32(abi.encodePacked(_LSP6KEY_ADDRESSPERMISSIONS_PREFIX, bytes26(0))),
                    bytes("some random text for the data value")
                );
            } else if (data[0] == 0x02) {
                IERC725Y(msg.sender).setData(
                    bytes32(abi.encodePacked(_LSP17_EXTENSION_PREFIX, bytes22(0))),
                    bytes("some random text for the data value")
                );
            }
        } else if (typeId == keccak256(abi.encodePacked("setData[]"))) {
            if (data[0] == 0x00) {
                bytes32[] memory keys = new bytes32[](1);
                bytes[] memory values = new bytes[](1);

                keys[0] = bytes32(
                    abi.encodePacked(_LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX, bytes22(0))
                );

                values[0] = bytes("some random text for the data value");
                bytes memory payload = abi.encodeWithSelector(
                    IERC725Y.setDataBatch.selector,
                    keys,
                    values
                );

                (bool success, bytes memory result) = msg.sender.call(payload);
                Address.verifyCallResult(success, result, "Call reverted");
            } else if (data[0] == 0x01) {
                bytes32[] memory keys = new bytes32[](1);
                bytes[] memory values = new bytes[](1);

                keys[0] = bytes32(abi.encodePacked(_LSP6KEY_ADDRESSPERMISSIONS_PREFIX, bytes26(0)));

                values[0] = bytes("some random text for the data value");
                bytes memory payload = abi.encodeWithSelector(
                    IERC725Y.setDataBatch.selector,
                    keys,
                    values
                );

                (bool success, bytes memory result) = msg.sender.call(payload);
                Address.verifyCallResult(success, result, "Call reverted");
            } else if (data[0] == 0x02) {
                bytes32[] memory keys = new bytes32[](1);
                bytes[] memory values = new bytes[](1);

                keys[0] = bytes32(abi.encodePacked(_LSP17_EXTENSION_PREFIX, bytes22(0)));

                values[0] = bytes("some random text for the data value");
                bytes memory payload = abi.encodeWithSelector(
                    IERC725Y.setDataBatch.selector,
                    keys,
                    values
                );

                (bool success, bytes memory result) = msg.sender.call(payload);
                Address.verifyCallResult(success, result, "Call reverted");
            }
        }
        return "Empty";
    }
}
