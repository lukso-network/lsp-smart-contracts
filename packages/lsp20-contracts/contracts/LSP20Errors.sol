// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @dev reverts when the call to the owner fail with no revert reason
 * @param postCall True if the execution call was done, False otherwise
 */
error LSP20CallingVerifierFailed(bool postCall);

/**
 * @dev reverts when the call to the owner does not return the LSP20 success value
 * @param postCall True if the execution call was done, False otherwise
 * @param returnedStatus The bytes4 decoded data returned by the logic verifier.
 */
error LSP20CallVerificationFailed(bool postCall, bytes4 returnedStatus);

/**
 * @dev Reverts when the logic verifier is an Externally Owned Account (EOA) that cannot return the LSP20 success value.
 * @param logicVerifier The address of the logic verifier
 */
error LSP20EOACannotVerifyCall(address logicVerifier);
