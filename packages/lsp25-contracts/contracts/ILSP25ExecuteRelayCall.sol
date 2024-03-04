// SPDX-License-Identifier: Apache 2.0
pragma solidity ^0.8.0;

interface ILSP25ExecuteRelayCall {
    /**
     * @notice Reading the latest nonce of address `from` in the channel ID `channelId`.
     *
     * @dev Get the nonce for a specific `from` address that can be used for signing relay transactions via {executeRelayCall}.
     *
     * @param from The address of the signer of the transaction.
     * @param channelId The channel id that the signer wants to use for executing the transaction.
     *
     * @return The current nonce on a specific `channelId`.
     */
    function getNonce(
        address from,
        uint128 channelId
    ) external view returns (uint256);

    /**
     * @notice Executing the following payload given the nonce `nonce` and signature `signature`. Payload: `payload`
     *
     * @dev Allows any address (executor) to execute a payload (= abi-encoded function call), given they have a valid signature from a signer address and a valid `nonce` for this signer.
     * The signature MUST be generated according to the signature format defined by the LSP25 standard.
     *
     * @param signature A 65 bytes long signature for a meta transaction according to LSP25.
     * @param nonce The nonce of the address that signed the calldata (in a specific `_channel`), obtained via {getNonce}. Used to prevent replay attack.
     * @param validityTimestamps Two `uint128` timestamps concatenated together that describes
     * when the relay transaction is valid "from" (left `uint128`) and "until" as a deadline (right `uint128`).
     * @param payload The abi-encoded function call to execute.
     *
     * @return The data being returned by the function executed.
     *
     * @custom:requirements
     * - `nonce` MUST be a valid nonce nonce provided (see {getNonce} function).
     * - The transaction MUST be submitted within a valid time period defined by the `validityTimestamp`.
     *
     * @custom:hint You can use `validityTimestamps == 0` to define an `executeRelayCall` transaction that is indefinitely valid,
     * meaning that does not require to start from a specific date/time, or that has an expiration date/time.
     */
    function executeRelayCall(
        bytes calldata signature,
        uint256 nonce,
        uint256 validityTimestamps,
        bytes calldata payload
    ) external payable returns (bytes memory);

    /**
     * @notice Executing a batch of relay calls (= meta-transactions).
     *
     * @dev Same as {executeRelayCall} but execute a batch of signed calldata payloads (abi-encoded function calls) in a single transaction.
     *
     * @param signatures An array of 65 bytes long signatures for meta transactions according to LSP25.
     * @param nonces An array of nonces of the addresses that signed the calldata payloads (in specific channels). Obtained via {getNonce}. Used to prevent replay attack.
     * @param validityTimestamps An array of two `uint128` concatenated timestamps that describe when the relay transaction is valid "from" (left `uint128`) and "until" (right `uint128`).
     * @param values An array of amount of native tokens to be transferred for each calldata `payload`.
     * @param payloads An array of abi-encoded function calls to be executed successively.
     *
     * @return An array of abi-decoded data returned by the functions executed.
     */
    function executeRelayCallBatch(
        bytes[] calldata signatures,
        uint256[] calldata nonces,
        uint256[] calldata validityTimestamps,
        uint256[] calldata values,
        bytes[] calldata payloads
    ) external payable returns (bytes[] memory);
}
