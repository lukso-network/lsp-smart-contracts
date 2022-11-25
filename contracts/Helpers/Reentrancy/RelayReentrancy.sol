// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// interfaces
import {ILSP6KeyManager} from "../../LSP6KeyManager/ILSP6KeyManager.sol";
import {LSP14Ownable2Step} from "../../LSP14Ownable2Step/LSP14Ownable2Step.sol";

contract RelayReentrancy {
    bytes private _signature;
    uint256 private _nonce;
    bytes private _payload;

    function prepareRelayCall(
        bytes memory newSignature,
        uint256 newNonce,
        bytes memory newPayload
    ) external {
        _signature = newSignature;
        _nonce = newNonce;
        _payload = newPayload;
    }

    // solhint-disable no-empty-blocks
    receive() external payable {}

    function universalReceiverDelegate(
        address sender,
        uint256 value, // solhint-disable no-unused-vars
        bytes32 typeId, // solhint-disable no-unused-vars
        bytes memory data // solhint-disable no-unused-vars
    ) public virtual returns (bytes memory result) {
        // solhint-disable no-unused-vars
        address keyManager = LSP14Ownable2Step(sender).owner();

        ILSP6KeyManager(keyManager).executeRelayCall(_signature, _nonce, _payload);
    }
}
