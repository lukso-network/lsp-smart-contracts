// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

error LSP7VotesBrokenClockMode();

error LSP7VotesFutureLookup();

error LSP7VotesSignatureExpired(uint256 expiry);

error LSP7VotesInvalidNonce(address signer, uint256 nonce);

/**
 * @dev Reverts when the total supply of tokens is greater than the token supply cap.
 */
error LSP7VotesExceededSafeSupply(uint256 supply, uint256 cap);
