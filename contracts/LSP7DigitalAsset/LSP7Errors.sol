// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.4;

// --- Errors

/**
 * @dev reverts when sending an `amount` of tokens larger than the current `balance` of the `tokenOwner`.
 */
error LSP7AmountExceedsBalance(uint256 balance, address tokenOwner, uint256 amount);

/**
 * @dev reverts when `operator` of `tokenOwner` send an `amount` of tokens
 * larger than the `authorizedAmount`.
 */
error LSP7AmountExceedsAuthorizedAmount(
    address tokenOwner,
    uint256 authorizedAmount,
    address operator,
    uint256 amount
);

/**
 * @dev reverts when trying to set the zero address as an operator.
 */
error LSP7CannotUseAddressZeroAsOperator();

/**
 * @dev reverts when one tries to send tokens to or from the zero address.
 */
error LSP7CannotSendWithAddressZero();

/**
 * @dev reverts when specifying the same address for `from` or `to` in a token transfer.
 */
error LSP7CannotSendToSelf();

/**
 * @dev reverts when the parameters used for `transferBatch` have different lengths.
 */
error LSP7InvalidTransferBatch();

/**
 * @dev reverts if the `tokenReceiver` does not implement LSP1
 * when minting or transferring tokens with `bool allowNonLSP1Recipient` set as `false`.
 */
error LSP7NotifyTokenReceiverContractMissingLSP1Interface(address tokenReceiver);

/**
 * @dev reverts if the `tokenReceiver` is an EOA
 * when minting or transferring tokens with `bool allowNonLSP1Recipient` set as `false`.
 */
error LSP7NotifyTokenReceiverIsEOA(address tokenReceiver);

/**
 * @dev reverts when trying to authorize or revoke the token's owner as an operator.
 */
error LSP7TokenOwnerCannotBeOperator();
