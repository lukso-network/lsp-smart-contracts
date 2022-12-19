// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// interfaces
import {ILSP6KeyManager} from "../../LSP6KeyManager/ILSP6KeyManager.sol";
import {LSP14Ownable2Step} from "../../LSP14Ownable2Step/LSP14Ownable2Step.sol";

contract BatchReentrancyRelayer {
    bytes[] private _signatures;
    uint256[] private _nonces;
    uint256[] private _values;
    bytes[] private _payloads;

    function prepareRelayCall(
        bytes[] memory newSignatures,
        uint256[] memory newNonces,
        uint256[] memory newValues,
        bytes[] memory newPayloads
    ) external {
        _signatures = newSignatures;
        _nonces = newNonces;
        _values = newValues;
        _payloads = newPayloads;
    }

    receive() external payable {}

    function relayCallThatReenters(address keyManagerAddress) external returns (bytes[] memory) {
        return
            ILSP6KeyManager(keyManagerAddress).executeRelayCall(
                _signatures,
                _nonces,
                _values,
                _payloads
            );
    }
}
