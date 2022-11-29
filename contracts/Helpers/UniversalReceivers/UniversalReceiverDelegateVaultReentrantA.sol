// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.4;

// interfaces
import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {ILSP1UniversalReceiver} from "../../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";

// modules
import {ERC165Storage} from "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

// constants
import {_INTERFACEID_LSP1} from "../../LSP1UniversalReceiver/LSP1Constants.sol";

/**
 * @dev This contract is used only for testing purposes
 */
contract UniversalReceiverDelegateVaultReentrantA is ERC165Storage {
    constructor() {
        _registerInterface(_INTERFACEID_LSP1);
    }

    // solhint-disable no-unused-vars
    function universalReceiver(bytes32 typeId, bytes memory data) external returns (bytes memory) {
        bytes32[] memory keys = new bytes32[](1);
        bytes[] memory values = new bytes[](1);

        keys[0] = bytes32(data);
        values[0] = hex"aabbccdd";
        IERC725Y(msg.sender).setData(keys, values);
        return "";
    }
}
