// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// libraries
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

// constants
import {LSP25_VERSION} from "./LSP25Constants.sol";

// errors
import {RelayCallBeforeStartTime, RelayCallExpired} from "./LSP25Errors.sol";

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
     * @dev Read the nonce for a `from` address on a specific `channelId`.
     * This will return an `idx`, which is the concatenation of two `uint128` as follow:
     * 1. the `channelId` where the nonce was queried for.
     * 2. the actual nonce of the given `channelId`.
     *
     * For example, if on `channelId` number `5`, the latest nonce  is `1`, the `idx` returned by this function will be:
     *
     * ```
     * // in decimals = 1701411834604692317316873037158841057281
     * idx = 0x0000000000000000000000000000000500000000000000000000000000000001
     * ```
     *
     * This idx can be described as follow:
     *
     * ```
     *             channelId => 5          nonce in this channel => 1
     *   v------------------------------v-------------------------------v
     * 0x0000000000000000000000000000000500000000000000000000000000000001
     * ```
     *
     * @param from The address to read the nonce for.
     * @param channelId The channel in which to extract the nonce.
     *
     * @return idx The idx composed of two `uint128`: the channelId + nonce in channel concatenated together in a single `uint256` value.
     */
    function _getNonce(
        address from,
        uint128 channelId
    ) internal view virtual returns (uint256 idx) {
        return (uint256(channelId) << 128) | _nonceStore[from][channelId];
    }

    /**
     * @dev Recover the address of the signer that generated a `signature` using the parameters provided `nonce`, `validityTimestamps`, `msgValue` and `callData`.
     * The address of the signer will be recovered using the LSP25 signature format.
     *
     * @param signature A 65 bytes long signature generated according to the signature format specified in the LSP25 standard.
     * @param nonce The nonce that the signer used to generate the `signature`.
     * @param validityTimestamps The validity timestamp that the signer used to generate the signature (See {_verifyValidityTimestamps} to learn more).
     * @param msgValue The amount of native tokens intended to be sent for the relay transaction.
     * @param callData The calldata to execute as a relay transaction that the signer signed for.
     *
     * @return The address that signed, recovered from the `signature`.
     */
    function _recoverSignerFromLSP25Signature(
        bytes memory signature,
        uint256 nonce,
        uint256 validityTimestamps,
        uint256 msgValue,
        bytes calldata callData
    ) internal view returns (address) {
        bytes memory lsp25EncodedMessage = abi.encodePacked(
            LSP25_VERSION,
            block.chainid,
            nonce,
            validityTimestamps,
            msgValue,
            callData
        );

        bytes32 eip191Hash = address(this).toDataWithIntendedValidatorHash(
            lsp25EncodedMessage
        );

        return eip191Hash.recover(signature);
    }

    /**
     * @dev Verify that the current timestamp is within the date and time range provided by `validityTimestamps`.
     *
     * @param validityTimestamps Two `uint128` concatenated together, where the left-most `uint128` represent the timestamp from which the transaction can be executed,
     * and the right-most `uint128` represents the timestamp after which the transaction expire.
     */
    function _verifyValidityTimestamps(
        uint256 validityTimestamps
    ) internal view {
        if (validityTimestamps == 0) return;

        uint128 startingTimestamp = uint128(validityTimestamps >> 128);
        uint128 endingTimestamp = uint128(validityTimestamps);

        // solhint-disable-next-line not-rely-on-time
        if (block.timestamp < startingTimestamp) {
            revert RelayCallBeforeStartTime();
        }

        // Allow `endingTimestamp` to be 0
        // Allow execution anytime past `startingTimestamp`
        if (endingTimestamp == 0) return;

        // solhint-disable-next-line not-rely-on-time
        if (block.timestamp > endingTimestamp) {
            revert RelayCallExpired();
        }
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
        return uint128(idx) == _nonceStore[from][idx >> 128];
    }
}
