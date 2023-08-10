// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";

/**
 * @title Interface of the LSP6 - Key Manager standard, a contract acting as a controller of an ERC725 Account using predfined permissions.
 */
interface ILSP6KeyManager is
    IERC1271
    /* is ERC165 */
{
    /**
     * @dev Emitted when the LSP6KeyManager contract verified the permissions of the `signer` successfully.
     * @notice Verified the permissions of `signer` for calling function `selector` on the linked account and sending `value` of native token.
     * @param signer The address of the controller that executed the calldata payload (either directly via {execute} or via meta transaction using {executeRelayCall}).
     * @param value The amount of native token to be transferred in the calldata payload.
     * @param selector The bytes4 function of the function that was executed on the linked {target}
     */
    event PermissionsVerified(
        address indexed signer,
        uint256 indexed value,
        bytes4 indexed selector
    );

    /**
     * @dev Get The address of the contract linked to this Key Manager.
     * @return The address of the linked contract
     */
    function target() external view returns (address);

    /**
     * @notice Reading the latest nonce of address `from` in the channel ID `channelId`.
     *
     * @dev Get The nonce for a specific controller `from` address that can be used for signing relay transaction.
     *
     * @param from The address of the signer of the transaction.
     * @param channelId The channel id that the signer wants to use for executing the transaction.
     *
     * @return The current nonce on a specific `channelId`
     */
    function getNonce(
        address from,
        uint128 channelId
    ) external view returns (uint256);

    /**
     * @notice Executing the following payload on the linked contract: `payload`
     *
     * @dev Execute A `payload` on the linked {target} contract after having verified the permissions associated with the function being run.
     * The `payload` MUST be a valid abi-encoded function call of one of the functions present in the linked {target}, otherwise the call will fail.
     * The linked {target} will return some data on successful execution, or revert on failure.
     *
     * @param payload The abi-encoded function call to execute on the linked {target}.
     * @return The abi-decoded data returned by the function called on the linked {target}.
     */
    function execute(
        bytes calldata payload
    ) external payable returns (bytes memory);

    /**
     * @notice Executing the following batch of payloads and sensind on the linked contract.
     * - payloads: `payloads`
     * - values transferred for each payload: `values`
     *
     * @dev Same as {execute} but execute a batch of payloads (abi-encoded function calls) in a single transaction.
     *
     * @param values An array of amount of native tokens to be transferred for each `payload`.
     * @param payloads An array of abi-encoded function calls to execute successively on the linked {target}.
     *
     * @return An array of abi-decoded data returned by the functions called on the linked {target}.
     */
    function executeBatch(
        uint256[] calldata values,
        bytes[] calldata payloads
    ) external payable returns (bytes[] memory);

    /**
     * @notice Executing a relay call (= meta-transaction).
     *
     * @dev Allows any address (executor) to execute a payload (= abi-encoded function call) in the linked {target} given they have a signed message from
     * a controller with some permissions.
     *
     * @param signature A 65 bytes long signature for a meta transaction according to LSP6.
     * @param nonce The nonce of the address that signed the calldata (in a specific `_channel`), obtained via {getNonce}. Used to prevent replay attack.
     * @param validityTimestamps Two `uint128` timestamps concatenated together that describes
     * when the relay transaction is valid "from" (left `uint128`) and "until" as a deadline (right `uint128`).
     * @param payload The abi-encoded function call to execute on the linked {target}.
     *
     * @return The data being returned by the function called on the linked {target}.
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
     * The signed transactions can be from multiple controllers, not necessarely the same controller signer, as long as each of these controllers
     * that signed have the right permissions related to the calldata `payload` they signed.
     *
     * @param signatures An array of 65 bytes long signatures for meta transactions according to LSP6.
     * @param nonces An array of nonces of the addresses that signed the calldata payloads (in specific channels). Obtained via {getNonce}. Used to prevent replay attack.
     * @param validityTimestamps An array of two `uint128` concatenated timestamps that describe when the relay transaction is valid "from" (left `uint128`) and "until" (right `uint128`).
     * @param values An array of amount of native tokens to be transferred for each calldata `payload`.
     * @param payloads An array of abi-encoded function calls to be executed successively on the linked {target}.
     *
     * @return An array of abi-decoded data returned by the functions called on the linked {target}.
     */
    function executeRelayCallBatch(
        bytes[] calldata signatures,
        uint256[] calldata nonces,
        uint256[] calldata validityTimestamps,
        uint256[] calldata values,
        bytes[] calldata payloads
    ) external payable returns (bytes[] memory);
}
