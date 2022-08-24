// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import {ILSP6KeyManager} from "../../LSP6KeyManager/ILSP6KeyManager.sol";
import {IERC725X} from "@erc725/smart-contracts/contracts/interfaces/IERC725X.sol";

// modules
import {ERC725Y} from "@erc725/smart-contracts/contracts/ERC725Y.sol";
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";
import {ERC165Storage} from "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

// constants
import {
    _TYPEID_LSP7_TOKENSSENDER,
    _TYPEID_LSP7_TOKENSRECIPIENT
} from "../../LSP7DigitalAsset/LSP7Constants.sol";

import {
    _TYPEID_LSP8_TOKENSSENDER,
    _TYPEID_LSP8_TOKENSRECIPIENT
} from "../../LSP8IdentifiableDigitalAsset/LSP8Constants.sol";

import {_INTERFACEID_LSP1_DELEGATE} from "../../LSP1UniversalReceiver/LSP1Constants.sol";

contract UniversalReceiverDelegateTokenReentrant is ERC165Storage {
    constructor() {
        _registerInterface(_INTERFACEID_LSP1_DELEGATE);
    }

    function universalReceiverDelegate(
        address sender,
        uint256 value, // solhint-disable no-unused-vars
        bytes32 typeId,
        bytes memory data
    ) public virtual returns (bytes memory result) {
        if (typeId == _TYPEID_LSP7_TOKENSRECIPIENT || typeId == _TYPEID_LSP8_TOKENSRECIPIENT) {
            // if the optional data field when minting/transferring is existing, re-execute the data on token contract
            if (data.length > 72) {
                bytes memory tokenPayload = BytesLib.slice(data, 72, data.length - 72);
                bytes memory executePayload = abi.encodeWithSelector(
                    IERC725X.execute.selector,
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
