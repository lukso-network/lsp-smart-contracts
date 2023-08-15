// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// libraries
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

// constants
import {LSP25_VERSION} from "./LSP25Constants.sol";

// errors
import {
    InvalidRelayNonce,
    RelayCallBeforeStartTime,
    RelayCallExpired
} from "./LSP25Errors.sol";

/**
 * @title Implementation of the multi channel nonce and the signature verification defined in the LSP25 standard.
 * @author Jean Cavallera (CJ42)
 * @dev This contract can be used as a backbone for other smart contracts to implement meta-transactions via the LSP25 Execute Relay Call interface.
 *
 * It contains a storage of nonces for signer addresses across various channel IDs, enabling these signers to submit signed transactions that order-independant.
 * (transactions that do not need to be submitted one after the other in a specific order).
 *
 * Finally, it contains internal functions to verify signatures for specific calldata according the signature format specified in the LSP25 standard.
 */
abstract contract LSP25MultiChannelNonce {
    using ECDSA for *;

    // Mapping of signer -> channelId -> nonce in channel
    mapping(address => mapping(uint256 => uint256)) internal _nonceStore;

    /**
     * @dev Validate that the `nonce` given for the `signature` signed and the `payload` to execute is valid
     * and conform to the signature format according to the LSP25 standard.
     *
     * @param signature A valid signature for a signer, generated according to the signature format specified in the LSP25 standard.
     * @param nonce The nonce that the signer used to generate the `signature`.
     * @param validityTimestamps Two `uint128` concatenated together, where the left-most `uint128` represent the timestamp from which the transaction can be executed,
     * and the right-most `uint128` represents the timestamp after which the transaction expire.
     * @param callData The abi-encoded function call to execute.
     *
     * @return recoveredSignerAddress The address of the signer recovered, for which the signature was validated.
     *
     * @custom:warning Be aware that this function can also throw an error if the `callData` was signed incorrectly (not conforming to the signature format defined in the LSP25 standard).
     * The contract cannot distinguish if the data is signed correctly or not. Instead, it will recover an incorrect signer address from the signature
     * and throw an {InvalidRelayNonce} error with the incorrect signer address as the first parameter.
     */
    function _validateExecuteRelayCall(
        bytes memory signature,
        uint256 nonce,
        uint256 validityTimestamps,
        uint256 msgValue,
        bytes calldata callData
    ) internal returns (address recoveredSignerAddress) {
        bytes memory encodedMessage = abi.encodePacked(
            LSP25_VERSION,
            block.chainid,
            nonce,
            validityTimestamps,
            msgValue,
            callData
        );

        recoveredSignerAddress = address(this)
            .toDataWithIntendedValidatorHash(encodedMessage)
            .recover(signature);

        if (!_isValidNonce(recoveredSignerAddress, nonce)) {
            revert InvalidRelayNonce(recoveredSignerAddress, nonce, signature);
        }

        // increase nonce after successful verification
        _nonceStore[recoveredSignerAddress][nonce >> 128]++;

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

        return recoveredSignerAddress;
    }

    /**
     * @dev Verify that the nonce `_idx` for `_from` (obtained via {getNonce}) is valid in its channel ID.
     *
     * The "idx" is a 256bits (unsigned) integer, where:
     * - the 128 leftmost bits = channelId
     * - and the 128 rightmost bits = nonce within the channel

     * @param from The signer's address.
     * @param idx The concatenation of the `channelId` + `nonce` within a specific channel ID.
     *
     * @return true if the nonce is the latest nonce for the `signer`, false otherwise.
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
