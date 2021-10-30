// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../../../submodules/ERC725/implementations/contracts/interfaces/ILSP1_UniversalReceiver.sol";

import "solidity-bytes-utils/contracts/BytesLib.sol";
import "solidity-bytes-utils/contracts/AssertBytes.sol";

contract UniversalReceiverTester {
    function callImplementationAndReturn(address target, bytes32 typeId) external returns (bytes memory) {
        return ILSP1(target).universalReceiver(typeId, "");
    }

    function checkImplementation(address _target, bytes32 _typeId) external returns (bool) {
        bytes memory ret = ILSP1(_target).universalReceiver(_typeId, "");
        return abi.decode(ret, (bytes32)) == _typeId;
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
        bytes32 response = BytesLib.toBytes32(ret, 64);
        return succ && response == typeId;
    }

    /* solhint-disable */
    // function lowLevelCheckImplementationBytes(address target, bytes32 typeId) external returns (bool) {
    //     (bool succ, bytes memory ret) = target.call(abi.encodeWithSignature("universalReceiverBytes(bytes32,bytes)", typeId, ""));
    //     return succ && AssertBytes.equal(ret, abi.encodePacked(typeId), "");
    // }
    /* solhint-enable */

}