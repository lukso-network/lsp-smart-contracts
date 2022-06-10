// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// interfaces
import {ILSP1UniversalReceiverDelegate} from "../../LSP1UniversalReceiver/ILSP1UniversalReceiverDelegate.sol";

// modules
import {ERC165Storage} from "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

// constants
import {_INTERFACEID_LSP1_DELEGATE} from "../../LSP1UniversalReceiver/LSP1Constants.sol";

contract UniversalReceiverDelegateRevert is ILSP1UniversalReceiverDelegate, ERC165Storage {
    constructor() {
        _registerInterface(_INTERFACEID_LSP1_DELEGATE);
    }

    /* solhint-disable no-unused-vars */
    function universalReceiverDelegate(
        address sender,
        uint256 value,
        bytes32 typeId,
        bytes memory data
    ) external pure override returns (bytes memory) {
        bytes memory funcData = abi.encodePacked(sender, typeId, data);
        revert("This Contract reverts");
    }
    /* solhint-enable */
}
