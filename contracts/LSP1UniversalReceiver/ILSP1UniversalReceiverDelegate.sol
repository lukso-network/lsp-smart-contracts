// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @title Interface of the LSP1 - Universal Receiver Delegate standard.
 * @dev This interface allows contracts implementing the LSP1UniversalReceiver function to delegate the reaction logic to another contract or account. By doing so, the main logic doesn't need to reside within the `universalReceiver` function itself, offering modularity and flexibility.
 */
interface ILSP1UniversalReceiverDelegate {
    /**
     * @dev A delegate function that reacts to calls forwarded from the `universalReceiver(..)` function. This allows for modular handling of the logic based on the `typeId` and `data` provided by the initial caller.
     * @notice Reacted on received notification forwarded from `universalReceiver` with `typeId` & `data`.
     *
     * @param sender The address of the EOA or smart contract that initially called the `universalReceiver` function.
     * @param value The amount sent by the `sender` to the `universalReceiver` function.
     * @param typeId The hash of a specific standard or a hook.
     * @param data The arbitrary data received with the initial call to `universalReceiver`.
     */
    function universalReceiverDelegate(
        address sender,
        uint256 value,
        bytes32 typeId,
        bytes memory data
    ) external returns (bytes memory);
}
