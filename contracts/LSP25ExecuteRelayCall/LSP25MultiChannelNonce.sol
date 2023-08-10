// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {LSP25_VERSION} from "./LSP25Constants.sol";

// libraries
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

// errors
import {
    InvalidRelayNonce,
    RelayCallBeforeStartTime,
    RelayCallExpired
} from "./LSP25Errors.sol";

abstract contract LSP25MultiChannelNonce {
    using ECDSA for *;

    // Mapping of signer -> channelId -> nonce in channel
    mapping(address => mapping(uint256 => uint256)) internal _nonceStore;

    function getNonce(
        address from,
        uint128 channelId
    ) public view virtual returns (uint256) {
        uint256 nonceInChannel = _nonceStore[from][channelId];
        return (uint256(channelId) << 128) | nonceInChannel;
    }

    function _validateExecuteRelayCall(
        bytes memory signature,
        uint256 nonce,
        uint256 validityTimestamps,
        uint256 msgValue,
        bytes calldata callData
    ) internal returns (address signerAddress) {
        bytes memory encodedMessage = abi.encodePacked(
            LSP25_VERSION,
            block.chainid,
            nonce,
            validityTimestamps,
            msgValue,
            callData
        );

        signerAddress = address(this)
            .toDataWithIntendedValidatorHash(encodedMessage)
            .recover(signature);

        if (!_isValidNonce(signerAddress, nonce)) {
            revert InvalidRelayNonce(signerAddress, nonce, signature);
        }

        // increase nonce after successful verification
        _nonceStore[signerAddress][nonce >> 128]++;

        if (validityTimestamps != 0) {
            uint128 startingTimestamp = uint128(validityTimestamps >> 128);
            uint128 endingTimestamp = uint128(validityTimestamps);

            // solhint-disable not-rely-on-time
            if (block.timestamp < startingTimestamp) {
                revert RelayCallBeforeStartTime();
            }
            if (block.timestamp > endingTimestamp) {
                revert RelayCallExpired();
            }
        }

        return signerAddress;
    }

    /**
     * @notice verify the nonce `_idx` for `_from` (obtained via `getNonce(...)`)
     * @dev "idx" is a 256bits (unsigned) integer, where:
     *          - the 128 leftmost bits = channelId
     *      and - the 128 rightmost bits = nonce within the channel
     * @param from caller address
     * @param idx (channel id + nonce within the channel)
     */
    function _isValidNonce(
        address from,
        uint256 idx
    ) internal view virtual returns (bool) {
        uint256 mask = ~uint128(0);
        // Alternatively:
        // uint256 mask = (1<<128)-1;
        // uint256 mask = 0xffffffffffffffffffffffffffffffff;
        return (idx & mask) == (_nonceStore[from][idx >> 128]);
    }
}
