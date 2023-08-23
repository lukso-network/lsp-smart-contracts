// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {
    LSP25MultiChannelNonce
} from "../LSP25ExecuteRelayCall/LSP25MultiChannelNonce.sol";

/**
 * @dev This contract is used only for testing the internal functions.
 */
contract LSP25MultiChannelNonceTester is LSP25MultiChannelNonce {
    function getNonce(
        address from,
        uint128 channelId
    ) public view returns (uint256 idx) {
        return _getNonce(from, channelId);
    }

    function recoverSignerFromLSP25Signature(
        bytes memory signature,
        uint256 nonce,
        uint256 validityTimestamps,
        uint256 msgValue,
        bytes calldata callData
    ) public view returns (address) {
        return
            _recoverSignerFromLSP25Signature(
                signature,
                nonce,
                validityTimestamps,
                msgValue,
                callData
            );
    }

    function verifyValidityTimestamps(uint256 validityTimestamps) public view {
        return _verifyValidityTimestamps(validityTimestamps);
    }

    function isValidNonce(
        address from,
        uint256 nonce
    ) public view returns (bool) {
        return _isValidNonce(from, nonce);
    }
}
