// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// interfaces
import {ILSP6KeyManager} from "../../LSP6KeyManager/ILSP6KeyManager.sol";

contract SingleReentrancyRelayer {
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

    function relayCallThatReenters(address keyManagerAddress) external returns (bytes memory) {
        return ILSP6KeyManager(keyManagerAddress).executeRelayCall(_signature, _nonce, _payload);
    }
}
