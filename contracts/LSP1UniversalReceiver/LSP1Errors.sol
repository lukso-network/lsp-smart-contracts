// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @dev Reverts when EOA calls the {universalReceiver(..)} function with an asset/vault typeId.
 * @notice EOA: `caller` cannot be registered as an asset.
 *
 * @param caller The address of the EOA
 */
error CannotRegisterEOAsAsAssets(address caller);
