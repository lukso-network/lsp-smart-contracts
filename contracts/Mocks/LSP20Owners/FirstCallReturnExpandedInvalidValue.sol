// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {
    ILSP14Ownable2Step
} from "../../LSP14Ownable2Step/ILSP14Ownable2Step.sol";

/**
 * @title sample contract used for testing
 */
contract FirstCallReturnExpandedFailValue {
    event CallVerified();

    address public target;

    function lsp20VerifyCall(
        address requestor,
        address targetContract,
        address caller,
        uint256 value,
        bytes memory data
    ) external returns (bytes32) {
        emit CallVerified();

        return
            keccak256(
                abi.encode(requestor, targetContract, caller, value, data)
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
