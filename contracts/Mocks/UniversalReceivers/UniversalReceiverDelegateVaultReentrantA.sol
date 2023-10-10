// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {
    IERC725Y
} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {
    ILSP1UniversalReceiver
} from "../../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";

// modules
import {
    ERC165Storage
} from "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

// constants
import {_INTERFACEID_LSP1} from "../../LSP1UniversalReceiver/LSP1Constants.sol";
import {
    NativeTokensNotAccepted
} from "../../LSP1UniversalReceiver/LSP1Errors.sol";

/**
 * @dev This contract is used only for testing purposes
 */
contract UniversalReceiverDelegateVaultReentrantA is
    ILSP1UniversalReceiver,
    ERC165Storage
{
    constructor() {
        _registerInterface(_INTERFACEID_LSP1);
    }

    function universalReceiver(
        bytes32 /* typeId */,
        bytes memory data
    ) external payable override returns (bytes memory) {
        if (msg.value != 0) {
            revert NativeTokensNotAccepted();
        }

        bytes32[] memory keys = new bytes32[](1);
        bytes[] memory values = new bytes[](1);

        keys[0] = bytes32(data);
        values[0] = hex"aabbccdd";
        IERC725Y(msg.sender).setDataBatch(keys, values);
        return "";
    }
}
