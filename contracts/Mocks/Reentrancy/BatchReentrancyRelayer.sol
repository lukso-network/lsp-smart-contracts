// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {
    ILSP25ExecuteRelayCall
} from "../../LSP25ExecuteRelayCall/ILSP25ExecuteRelayCall.sol";

contract BatchReentrancyRelayer {
    bytes[] private _signatures;
    uint256[] private _nonces;
    uint256[] private _validityTimestamps;
    uint256[] private _values;
    bytes[] private _payloads;

    function prepareRelayCall(
        bytes[] memory signatures,
        uint256[] memory nonces,
        uint256[] memory validityTimestamps,
        uint256[] memory values,
        bytes[] memory payloads
    ) external {
        _signatures = signatures;
        _nonces = nonces;
        _validityTimestamps = validityTimestamps;
        _values = values;
        _payloads = payloads;
    }

    receive() external payable {}

    function relayCallThatReenters(
        address keyManagerAddress
    ) external returns (bytes[] memory) {
        return
            ILSP25ExecuteRelayCall(keyManagerAddress).executeRelayCallBatch(
                _signatures,
                _nonces,
                _validityTimestamps,
                _values,
                _payloads
            );
    }
}
