// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// interfaces
import {ILSP6KeyManager} from "../../LSP6KeyManager/ILSP6KeyManager.sol";
import {LSP14Ownable2Step} from "../../LSP14Ownable2Step/LSP14Ownable2Step.sol";

// constants
import "../../LSP1UniversalReceiver/LSP1Constants.sol";

contract ReentrancyWithChangeURD {
    function universalReceiver(
        bytes32, /* typeId */
        bytes calldata data // bytes32(TYPE_ID) + bytes20(address(URD))
    ) public virtual returns (bytes memory) {
        address keyManager = LSP14Ownable2Step(msg.sender).owner();

        bytes memory addURDPayload = abi.encodeWithSignature(
            "setData(bytes32,bytes)",
            bytes32(
                bytes.concat(
                    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
                    bytes2(0),
                    bytes20(data[:20])
                )
            ),
            ""
        );

        return ILSP6KeyManager(keyManager).execute(addURDPayload);
    }
}
