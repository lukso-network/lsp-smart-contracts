// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @notice The `LSP1UniversalReceiverDelegate` is not allowed to set the following data key: `dataKey`.
 * @dev Reverts when the Vault version of [LSP1UniversalReceiverDelegate] sets LSP1/6/17 Data Keys.
 * @param dataKey The data key that the Vault version of [LSP1UniversalReceiverDelegate] is not allowed to set.
 */
error LSP1DelegateNotAllowedToSetDataKey(bytes32 dataKey);
