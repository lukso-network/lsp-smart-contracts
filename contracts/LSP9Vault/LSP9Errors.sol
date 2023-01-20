// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.4;

/**
 * @dev reverts when the UniversalReceiverDelegates of the Vault sets LSP1/6/17 Data Keys
 * @param dataKey The data key that the UniversalReceiverDelegate is not allowed to set
 */
error LSP1DelegateNotAllowedToSetDataKey(bytes32 dataKey);
