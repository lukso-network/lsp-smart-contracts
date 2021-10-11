// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../_LSPs/ILSP1_UniversalReceiver.sol";

import "solidity-bytes-utils/contracts/BytesLib.sol";
import "solidity-bytes-utils/contracts/AssertBytes.sol";

contract UniversalReceiverTester {
    function callImplementationAndReturn(address target, bytes32 typeId) external returns (bytes32) {
        return ILSP1(target).universalReceiver(typeId, "");
    }

    function checkImplementation(address target, bytes32 typeId) external returns (bool) {
        bytes32 ret = ILSP1(target).universalReceiver(typeId, "");
        return ret == typeId;
    }

    // function checkImplementationBytes(address target, bytes32 typeId) external returns (bool) {
    //     bytes memory ret = ILSP1(target).universalReceiverBytes(typeId, "");
    //     return AssertBytes.equal(ret, abi.encodePacked(typeId), "");
    // }

    function lowLevelCheckImplementation(address target, bytes32 typeId) external returns (bool) {
        (bool succ, bytes memory ret) = target.call(
            abi.encodeWithSignature(
                "universalReceiver(bytes32,bytes)", 
                typeId, 
                ""
            )
        );
        bytes32 response = BytesLib.toBytes32(ret, 0);
        return succ && response == typeId;
    }

    /* solhint-disable */
    // function lowLevelCheckImplementationBytes(address target, bytes32 typeId) external returns (bool) {
    //     (bool succ, bytes memory ret) = target.call(abi.encodeWithSignature("universalReceiverBytes(bytes32,bytes)", typeId, ""));
    //     return succ && AssertBytes.equal(ret, abi.encodePacked(typeId), "");
    // }
    /* solhint-enable */

}