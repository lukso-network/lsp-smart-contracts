// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// --- Errors

/**
 * @dev reverts when sending an `amount` of tokens bigger than the current `balance` of the `tokenOwner`
 */
error LSP7AmountExceedsBalance(uint256 balance, address tokenOwner, uint256 amount);

/**
 * @dev reverts when one of the operators of `tokenOwner` tries to send
 * an `amount` of tokens which is bigger than the current `authorizedAmount`
 */
error LSP7AmountExceedsAuthorizedAmount(
    address tokenOwner,
    uint256 authorizedAmount,
    address operator,
    uint256 amount
);

/**
 * @dev reverts when one tries to set the zero address as operator
 */
error LSP7CannotUseAddressZeroAsOperator();

/**
 * @dev reverts when one tries to mint 0 tokens
 */
error LSP7MintAmountIsZero();

/**
 * @dev reverts when one tries to burn 0 tokens
 */
error LSP7BurnAmountIsZero();

/**
 * @dev reverts when one tries to transfer 0 tokens
 */
error LSP7TransferAmountIsZero();

/**
 * @dev reverts when one tries to send tokens to or from the zero address
 */
error LSP7CannotSendWithAddressZero();

/**
 * @dev reverts when one tries to send tokens to itself
 */
error LSP7CannotSendToSelf();

/**
 * @dev reverts when the parameters used for `transferBatch` have different lengths
 */
error LSP7InvalidTransferBatch();

/**
 * @dev reverts when the `tokenReceiver` is not implementing LSP1
 * this is the case only when `bool force` is set as `false`
 */
error LSP7NotifyTokenReceiverContractMissingLSP1Interface(address tokenReceiver);

/**
 * @dev reverts when the `tokenReceiver` is an EOA
 * this is the case only when `bool force` is set as `false`
 */
error LSP7NotifyTokenReceiverIsEOA(address tokenReceiver);
