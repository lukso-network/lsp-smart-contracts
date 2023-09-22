// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {
    ILSP25ExecuteRelayCall
} from "../../LSP25ExecuteRelayCall/ILSP25ExecuteRelayCall.sol";

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

    function relayCallThatReenters(
        address keyManagerAddress
    ) external returns (bytes memory) {
        return
            ILSP25ExecuteRelayCall(keyManagerAddress).executeRelayCall(
                _signature,
                _nonce,
                _validityTimestamps,
                _payload
            );
    }
}
