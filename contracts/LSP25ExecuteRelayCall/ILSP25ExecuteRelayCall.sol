// SPDX-License-Identifier: Apache 2.0
pragma solidity ^0.8.0;

interface ILSP25ExecuteRelayCall {
    /**
     * @notice Get latest nonce for `from` in channel ID: `channelId`.
     *
     * @dev Get the nonce for a specific controller `from` address that can be used for signing relay transaction.
     *
     * @param from the address of the signer of the transaction.
     * @param channelId the channel id that the signer wants to use for executing the transaction.
     *
     * @return the current nonce on a specific `channelId`
     */
    function getNonce(
        address from,
        uint128 channelId
    ) external view returns (uint256);

    /**
     * @dev Allows any address (executor) to execute a payload (= abi-encoded function call) in the linked {target} given they have a signed message from
     * a controller with some permissions.
     *
     * @param signature a 65 bytes long signature for a meta transaction according to LSP6.
     * @param nonce the nonce of the address that signed the calldata (in a specific `_channel`), obtained via {getNonce}. Used to prevent replay attack.
     * @param validityTimestamps * Two `uint128` timestamps concatenated together that describes
     * when the relay transaction is valid "from" (left `uint128`) and "until" as a deadline (right `uint128`).
     * @param payload the abi-encoded function call to execute on the linked {target}.
     *
     * @return the data being returned by the function called on the linked {target}.
     */
    function executeRelayCall(
        bytes calldata signature,
        uint256 nonce,
        uint256 validityTimestamps,
        bytes calldata payload
    ) external payable returns (bytes memory);

    /**
     * @dev Same as {executeRelayCall} but execute a batch of signed calldata payloads (abi-encoded function calls) in a single transaction.
     * The signed transactions can be from multiple controllers, not necessarely the same controller signer, as long as each of these controllers
     * that signed have the right permissions related to the calldata `payload` they signed.
     *
     * @param signatures An array of 65 bytes long signatures for meta transactions according to LSP6.
     * @param nonces An array of nonces of the addresses that signed the calldata payloads (in specific channels). Obtained via {getNonce}. Used to prevent replay attack.
     * @param validityTimestamps An array of two `uint128` concatenated timestamps that describe when the relay transaction is valid "from" (left `uint128`) and "until" (right `uint128`).
     * @param values An array of amount of native tokens to be transferred for each calldata `payload`.
     * @param payloads An array of abi-encoded function calls to execute successively on the linked {target}.
     *
     * @return An array of abi-decoded return data returned by the functions called on the linked {target}.
     */
    function executeRelayCallBatch(
        bytes[] calldata signatures,
        uint256[] calldata nonces,
        uint256[] calldata validityTimestamps,
        uint256[] calldata values,
        bytes[] calldata payloads
    ) external payable returns (bytes[] memory);
}
