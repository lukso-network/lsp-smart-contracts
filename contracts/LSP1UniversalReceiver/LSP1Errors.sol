// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @dev Reverts when EOA calls the {universalReceiver(..)} function with an asset/vault typeId.
 * @notice EOA: `caller` cannot be registered as an asset.
 *
 * @param caller The address of the EOA
 */
error CannotRegisterEOAsAsAssets(address caller);

/**
 * @dev Reverts when the {universalReceiver} function in the LSP1 Universal Receiver Delegate contract is called while sending some native tokens along the call (`msg.value` different than `0`)
 * @notice Cannot send native tokens to {universalReceiver(...)} function of the delegated contract.
 */
error NativeTokensNotAccepted();
