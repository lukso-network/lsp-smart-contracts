// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @dev reverts when the call to the owner fail with no revert reason
 * @param postCall True if the execution call was done, False otherwise
 */
error LSP20CallingVerifierFailed(bool postCall);

/**
 * @dev reverts when the call to the owner does not return the magic value
 * @param postCall True if the execution call was done, False otherwise
 * @param returnedData The data returned by the call to the logic verifier
 */
error LSP20InvalidMagicValue(bool postCall, bytes returnedData);

/**
 * @dev reverts when the logicVerifier is an EOA that cannot return magicValue
 * @param logicVerifier The address of the logic verifier
 */
error EOACannotVerifyCall(address logicVerifier);
