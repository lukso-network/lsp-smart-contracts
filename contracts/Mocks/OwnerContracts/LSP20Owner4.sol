// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {
    ILSP20ReverseVerification
} from "../../LSP20ReverseVerification/ILSP20ReverseVerification.sol";
import {ILSP14Ownable2Step} from "../../LSP14Ownable2Step/ILSP14Ownable2Step.sol";

contract LSP20Owner4 {
    event CallVerified();

    address public target;

    function lsp20VerifyCall(
        address caller,
        uint256 value,
        bytes memory data
    ) external returns (bytes32) {
        emit CallVerified();

        return keccak256(abi.encode(caller, value, data));
    }

    function acceptOwnership(address newTarget) external {
        target = newTarget;

        ILSP14Ownable2Step(target).acceptOwnership();
    }

    function transferOwnership(address newOwner) external {
        ILSP14Ownable2Step(target).transferOwnership(newOwner);
    }
}
