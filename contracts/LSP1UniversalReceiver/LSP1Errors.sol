// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @dev reverts when EOA calls the `universalReceiver(..)` function with an asset/vault typeId
 * @param caller The address of the EOA
 */
error CannotRegisterEOAsAsAssets(address caller);

/**
 * @dev reverts when the account calling the UniversalReceiverDelegate is not the same account
 * linked as target in the KeyManager -- Security Check
 * @param account The address of the account implementing the `universalReceiver(..)` function
 * @param target The address of the target linked to the KeyManager
 */
error CallerNotLSP6LinkedTarget(address account, address target);

/**
 * @dev reverts when `universalReceiver(...)` is called with a value different than 0
 */
error NativeTokensNotAccepted();
