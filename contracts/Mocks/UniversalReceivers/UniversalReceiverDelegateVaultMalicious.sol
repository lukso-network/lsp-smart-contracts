// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {
    IERC725Y
} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {
    IERC725Y
} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";

import {
    ILSP1UniversalReceiverDelegate
} from "../../LSP1UniversalReceiver/ILSP1UniversalReceiverDelegate.sol";

// modules
import {
    ERC165Storage
} from "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

// constants
import {
    _INTERFACEID_LSP1_DELEGATE,
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX
} from "../../LSP1UniversalReceiver/LSP1Constants.sol";
import {
    _LSP6KEY_ADDRESSPERMISSIONS_PREFIX
} from "../../LSP6KeyManager/LSP6Constants.sol";

import {
    _LSP17_EXTENSION_PREFIX
} from "../../LSP17ContractExtension/LSP17Constants.sol";

/**
 * @dev This contract is used only for testing
 */
contract UniversalReceiverDelegateVaultMalicious is
    ERC165Storage,
    ILSP1UniversalReceiverDelegate
{
    constructor() {
        _registerInterface(_INTERFACEID_LSP1_DELEGATE);
    }

    function universalReceiverDelegate(
        address /*sender*/,
        uint256 /*value*/,
        bytes32 typeId,
        bytes memory data
    ) public virtual override returns (bytes memory) {
        if (typeId == keccak256(abi.encodePacked("setData"))) {
            if (data[0] == 0x00) {
                IERC725Y(msg.sender).setData(
                    bytes32(
                        abi.encodePacked(
                            _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
                            bytes22(0)
                        )
                    ),
                    bytes("some random text for the data value")
                );
            } else if (data[0] == 0x01) {
                IERC725Y(msg.sender).setData(
                    bytes32(
                        abi.encodePacked(
                            _LSP6KEY_ADDRESSPERMISSIONS_PREFIX,
                            bytes26(0)
                        )
                    ),
                    bytes("some random text for the data value")
                );
            } else if (data[0] == 0x02) {
                IERC725Y(msg.sender).setData(
                    bytes32(
                        abi.encodePacked(_LSP17_EXTENSION_PREFIX, bytes22(0))
                    ),
                    bytes("some random text for the data value")
                );
            }
        } else if (typeId == keccak256(abi.encodePacked("setData[]"))) {
            if (data[0] == 0x00) {
                bytes32[] memory keys = new bytes32[](1);
                bytes[] memory values = new bytes[](1);

                keys[0] = bytes32(
                    abi.encodePacked(
                        _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
                        bytes22(0)
                    )
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

                keys[0] = bytes32(
                    abi.encodePacked(
                        _LSP6KEY_ADDRESSPERMISSIONS_PREFIX,
                        bytes26(0)
                    )
                );

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

                keys[0] = bytes32(
                    abi.encodePacked(_LSP17_EXTENSION_PREFIX, bytes22(0))
                );

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
