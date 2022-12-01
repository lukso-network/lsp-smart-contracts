// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

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

    function universalReceiver(
        bytes32, /* typeId */
        bytes memory /* data */
    ) public virtual returns (bytes memory) {
        // solhint-disable no-unused-vars
        address keyManager = LSP14Ownable2Step(msg.sender).owner();

        return ILSP6KeyManager(keyManager).executeRelayCall(_signature, _nonce, _payload);
    }
}
