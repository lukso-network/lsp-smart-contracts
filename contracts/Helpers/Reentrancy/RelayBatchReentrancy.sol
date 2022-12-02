// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// interfaces
import {ILSP6KeyManager} from "../../LSP6KeyManager/ILSP6KeyManager.sol";
import {LSP14Ownable2Step} from "../../LSP14Ownable2Step/LSP14Ownable2Step.sol";

contract RelayBatchReentrancy {
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

    // solhint-disable no-empty-blocks
    receive() external payable {}

    function universalReceiver(
        bytes32, /* typeId */
        bytes memory /* data */
    ) public virtual returns (bytes[] memory) {
        address keyManager = LSP14Ownable2Step(msg.sender).owner();

        return
            ILSP6KeyManager(keyManager).executeRelayCall(_signatures, _nonces, _values, _payloads);
    }
}
