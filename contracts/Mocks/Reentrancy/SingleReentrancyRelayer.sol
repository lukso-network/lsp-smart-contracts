// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// interfaces
import {ILSP6KeyManager} from "../../LSP6KeyManager/ILSP6KeyManager.sol";

contract SingleReentrancyRelayer {
    bytes private _signature;
    uint256 private _nonce;
    uint256 private _validityTimestamps;
    bytes private _payload;

    function prepareRelayCall(
        bytes memory signature,
        uint256 nonce,
        uint256 validityTimestamps,
        bytes memory payload
    ) external {
        _signature = signature;
        _nonce = nonce;
        _validityTimestamps = validityTimestamps;
        _payload = payload;
    }

    receive() external payable {}

    function relayCallThatReenters(address keyManagerAddress) external returns (bytes memory) {
        return
            ILSP6KeyManager(keyManagerAddress).executeRelayCall(
                _signature,
                _nonce,
                _validityTimestamps,
                _payload
            );
    }
}
