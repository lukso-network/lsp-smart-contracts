// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;
import {
    ILSP14Ownable2Step
} from "../../LSP14Ownable2Step/ILSP14Ownable2Step.sol";

/**
 * @title sample contract used for testing
 */
contract FirstCallReturnFailValue {
    event CallVerified();

    address public target;

    function lsp20VerifyCall(
        address,
        address,
        address,
        uint256,
        bytes memory
    ) external returns (bytes4) {
        emit CallVerified();

        return 0xaabbccdd;
    }

    function acceptOwnership(address newTarget) external {
        target = newTarget;
        ILSP14Ownable2Step(target).acceptOwnership();
    }

    function transferOwnership(address newOwner) external {
        ILSP14Ownable2Step(target).transferOwnership(newOwner);
    }
}
