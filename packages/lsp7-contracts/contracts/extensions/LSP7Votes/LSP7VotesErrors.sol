// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

error LSP7VotesBrokenClockMode();

/**
 * @dev Reverts when attempting to lookup a previous votes or total supply for a timepoint in the future.
 */
error LSP7VotesFutureLookup(uint256 timepoint);

/**
 * @dev Reverts when a signature is expired.
 */
error LSP7VotesSignatureExpired(uint256 expiry);

/**
 * @dev Reverts when the `nonce` for `signer` is invalid.
 */
error LSP7VotesInvalidNonce(address signer, uint256 nonce);

/**
 * @dev Reverts when the total supply of tokens is greater than the token supply cap.
 */
error LSP7VotesExceededSafeSupply(uint256 supply, uint256 cap);
