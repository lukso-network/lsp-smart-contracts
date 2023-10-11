// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {
    ILSP20CallVerifier
} from "../../LSP20CallVerification/ILSP20CallVerifier.sol";
import {
    ILSP14Ownable2Step
} from "../../LSP14Ownable2Step/ILSP14Ownable2Step.sol";

/**
 * @title sample contract used for testing
 */
contract FallbackReturnSuccessValue {
    event FallbackCalled(bytes data);

    address public target;

    // solhint-disable payable-fallback
    // solhint-disable no-complex-fallback
    fallback(bytes calldata) external returns (bytes memory) {
        emit FallbackCalled(msg.data);
        return
            bytes.concat(
                ILSP20CallVerifier.lsp20VerifyCall.selector,
                bytes28(0)
            );
    }

    function acceptOwnership(address newTarget) external {
        target = newTarget;
        ILSP14Ownable2Step(target).acceptOwnership();
    }

    function transferOwnership(address newOwner) external {
        ILSP14Ownable2Step(target).transferOwnership(newOwner);
    }
}
