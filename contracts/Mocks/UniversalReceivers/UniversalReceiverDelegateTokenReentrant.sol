// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {ILSP6KeyManager} from "../../LSP6KeyManager/ILSP6KeyManager.sol";

// modules
import {ERC725Y} from "@erc725/smart-contracts/contracts/ERC725Y.sol";
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";
import {ERC165Storage} from "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

// constants
import {EXECUTE_SELECTOR} from "@erc725/smart-contracts/contracts/constants.sol";
import {
    _TYPEID_LSP7_TOKENSSENDER,
    _TYPEID_LSP7_TOKENSRECIPIENT
} from "../../LSP7DigitalAsset/LSP7Constants.sol";

import {
    _TYPEID_LSP8_TOKENSSENDER,
    _TYPEID_LSP8_TOKENSRECIPIENT
} from "../../LSP8IdentifiableDigitalAsset/LSP8Constants.sol";

import {_INTERFACEID_LSP1} from "../../LSP1UniversalReceiver/LSP1Constants.sol";

/**
 * @dev This contract is used only for testing purposes
 */
contract UniversalReceiverDelegateTokenReentrant is ERC165Storage {
    constructor() {
        _registerInterface(_INTERFACEID_LSP1);
    }

    function universalReceiver(
        bytes32 typeId,
        bytes memory data
    ) public payable virtual returns (bytes memory result) {
        address sender = address(bytes20(msg.data[msg.data.length - 52:]));
        if (typeId == _TYPEID_LSP7_TOKENSRECIPIENT || typeId == _TYPEID_LSP8_TOKENSRECIPIENT) {
            // if the optional data field when minting/transferring is existing, re-execute the data on token contract
            if (data.length > 72) {
                bytes memory tokenPayload = BytesLib.slice(data, 72, data.length - 72);
                bytes memory executePayload = abi.encodeWithSelector(
                    EXECUTE_SELECTOR,
                    0, // OPERATION CALL
                    sender, // TOKEN CONTRACT
                    0, // VALUE TO BE SENT
                    tokenPayload
                );

                address keyManager = ERC725Y(msg.sender).owner();
                result = ILSP6KeyManager(keyManager).execute(executePayload);
            }
        }
    }
}
