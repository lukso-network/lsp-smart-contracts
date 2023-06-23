// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {
    ILSP14Ownable2Step
} from "../../LSP14Ownable2Step/ILSP14Ownable2Step.sol";

/**
 * @title sample contract used for testing
 */
contract ImplementingFallback {
    event FallbackCalled(bytes data);

    address public target;

    // solhint-disable-next-line payable-fallback
    fallback() external {
        emit FallbackCalled(msg.data);
    }

    function acceptOwnership(address newTarget) external {
        target = newTarget;
        ILSP14Ownable2Step(target).acceptOwnership();
    }

    function transferOwnership(address newOwner) external {
        ILSP14Ownable2Step(target).transferOwnership(newOwner);
    }
}
