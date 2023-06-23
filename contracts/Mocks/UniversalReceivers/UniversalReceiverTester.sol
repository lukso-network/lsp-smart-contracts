// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {
    ILSP1UniversalReceiver
} from "../../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";

/**
 * @dev This contract is used only for testing purposes
 */
contract UniversalReceiverTester {
    function callImplementationAndReturn(
        address target,
        bytes32 typeId
    ) external payable returns (bytes memory) {
        return ILSP1UniversalReceiver(target).universalReceiver(typeId, "");
    }

    function checkImplementation(
        address _target,
        bytes32 _typeId
    ) external payable {
        ILSP1UniversalReceiver(_target).universalReceiver{value: msg.value}(
            _typeId,
            ""
        );
    }

    function checkImplementationLowLevelCall(
        address _target,
        bytes32 _typeId
    ) external payable {
        (bool success, ) = _target.call{value: msg.value}(
            abi.encodeWithSelector(
                ILSP1UniversalReceiver.universalReceiver.selector,
                _typeId,
                ""
            )
        );

        require(
            success,
            "low-level call to `universalReceiver(...)` function failed"
        );
    }

    receive() external payable {}
}
