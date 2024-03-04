// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @title Interface of the LSP1 - Universal Receiver standard, an entry function for a contract to receive arbitrary information.
 * @dev LSP1UniversalReceiver allows to receive arbitrary messages and to be informed when assets are sent or received.
 */
interface ILSP1UniversalReceiver {
    /**
     * @dev Emitted when the {universalReceiver} function was called with a specific `typeId` and some `receivedData`
     * @notice Address `from` called the `universalReceiver(...)` function while sending `value` LYX. Notification type (typeId): `typeId` - Data received: `receivedData`.
     *
     * @param from The address of the EOA or smart contract that called the {universalReceiver(...)} function.
     * @param value The amount sent to the {universalReceiver(...)} function.
     * @param typeId A `bytes32` unique identifier (= _"hook"_)that describe the type of notification, information or transaction received by the contract. Can be related to a specific standard or a hook.
     * @param receivedData Any arbitrary data that was sent to the {universalReceiver(...)} function.
     * @param returnedValue The value returned by the {universalReceiver(...)} function.
     */
    event UniversalReceiver(
        address indexed from,
        uint256 indexed value,
        bytes32 indexed typeId,
        bytes receivedData,
        bytes returnedValue
    );

    /**
     * @dev Generic function that can be used to notify the contract about specific incoming transactions or events like asset transfers, vault transfers, etc. Allows for custom on-chain and off-chain reactions based on the `typeId` and `data`.
     * @notice Reacted on received notification with `typeId` & `data`.
     *
     * @param typeId The hash of a specific standard or a hook.
     * @param data The arbitrary data received with the call.
     *
     * @custom:events {UniversalReceiver} event.
     */
    function universalReceiver(
        bytes32 typeId,
        bytes calldata data
    ) external payable returns (bytes memory);
}
