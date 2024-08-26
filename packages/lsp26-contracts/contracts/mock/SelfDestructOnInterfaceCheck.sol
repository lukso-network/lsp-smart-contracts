// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

// interfaces
import {
    ILSP1UniversalReceiver
} from "@lukso/lsp1-contracts/contracts/ILSP1UniversalReceiver.sol";

contract SelfDestructOnInterfaceCheck is ILSP1UniversalReceiver {
    uint256 public counter;

    function supportsInterface(bytes4) external returns (bool) {
        selfdestruct(payable(msg.sender));
        return true;
    }

    function universalReceiver(
        bytes32,
        bytes memory
    ) external payable returns (bytes memory) {
        return "";
    }
}
