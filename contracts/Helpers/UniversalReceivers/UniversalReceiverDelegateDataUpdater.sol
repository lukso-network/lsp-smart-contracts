// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {ILSP6KeyManager} from "../../LSP6KeyManager/ILSP6KeyManager.sol";
import {IERC725X} from "@erc725/smart-contracts/contracts/interfaces/IERC725X.sol";
import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {LSP14Ownable2Step} from "../../LSP14Ownable2Step/LSP14Ownable2Step.sol";

// modules
import {ERC725Y} from "@erc725/smart-contracts/contracts/ERC725Y.sol";
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";
import {ERC165Storage} from "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

// constants
import {_TYPEID_LSP7_TOKENSSENDER} from "../../LSP7DigitalAsset/LSP7Constants.sol";

import {_INTERFACEID_LSP1} from "../../LSP1UniversalReceiver/LSP1Constants.sol";

contract UniversalReceiverDelegateDataUpdater is ERC165Storage {
    constructor() {
        _registerInterface(_INTERFACEID_LSP1);
    }

    function universalReceiver(
        bytes32 typeId,
        bytes memory data // solhint-disable no-unused-vars
    ) public virtual returns (bytes memory) {
        if (typeId == _TYPEID_LSP7_TOKENSSENDER) {
            address keyManager = LSP14Ownable2Step(msg.sender).owner();
            bytes memory setDataPayload = abi.encodeWithSignature(
                "setData(bytes32,bytes)",
                keccak256(bytes("some random data key")),
                bytes("some random text for the data value")
            );
            ILSP6KeyManager(keyManager).execute(setDataPayload);
        }
        return "";
    }
}
