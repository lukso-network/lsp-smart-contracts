// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import {ILSP1UniversalReceiver} from "../../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";

contract UniversalReceiverTester {
    function callImplementationAndReturn(address target, bytes32 typeId)
        external
        payable
        returns (bytes memory)
    {
        return ILSP1UniversalReceiver(target).universalReceiver(typeId, "");
    }

    function checkImplementation(address _target, bytes32 _typeId) external payable {
        ILSP1UniversalReceiver(_target).universalReceiver{ value: msg.value }(_typeId, "");
    }

    function checkImplementationLowLevelCall(address _target, bytes32 _typeId) external payable {
        // solhint-disable avoid-low-level-calls
        (bool success, ) = _target.call{ value: msg.value }(
            abi.encodeWithSelector(ILSP1UniversalReceiver.universalReceiver.selector, _typeId, "")
        );

        require(success, "low-level call to `universalReceiver(...)` function failed");
    }

    receive() external payable {}
}
