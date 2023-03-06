// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @dev reverts when the call to the owner fail with no revert reason
 */
error LSP20CallingOwnerFailed(bool preExecution);

/**
 * @dev reverts when the call to the owner does not return the magic value
 */
error LSP20InvalidMagicValue(bool preExecution, bytes returnedData);
