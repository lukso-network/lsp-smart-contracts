// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// --- Errors

/**
 * @dev tx is reverted with this error if the `amount` of tokens which are to be transferred
 * from `tokenOwner` is bigger than the current `balance` of the `tokenOwner`
 */
error LSP7AmountExceedsBalance(uint256 balance, address tokenOwner, uint256 amount);

/**
 * @dev tx is reverted with this error if one of the operators of `tokenOwner` tries to send
 * an `amount` of tokens which is bigger than the current `authorizedAmount`
 */
error LSP7AmountExceedsAuthorizedAmount(
    address tokenOwner,
    uint256 authorizedAmount,
    address operator,
    uint256 amount
);

/**
 * @dev tx is reverted with this error if one tries to set an operator the zero address
 */
error LSP7CannotUseAddressZeroAsOperator();

/**
 * @dev tx is reverted with this error if one tries to mint 0 tokens
 */
error LSP7MintAmountIsZero();

/**
 * @dev tx is reverted with this error if one tries to burn 0 tokens
 */
error LSP7BurnAmountIsZero();

/**
 * @dev tx is reverted with this error if one tries to transfer 0 tokens
 */
error LSP7TransferAmountIsZero();

/**
 * @dev tx is reverted with this error if one tries to send tokens to or from the zero address
 */
error LSP7CannotSendWithAddressZero();

/**
 * @dev tx is reverted with this error if one tries to send tokens to itself
 */
error LSP7CannotSendToSelf();

/**
 * @dev tx is reverted with this error if the parameters used for `transferBatch` are not adecvate
 * meaning that the arrays: `from`, `to`, `amount` and `data` have differnet lengths
 */
error LSP7InvalidTransferBatch();

/**
 * @dev tx is reverted with this error if the `tokenReceiver` is not implementing LSP1
 * this is the case only when `bool force` is set as `false`
 */
error LSP7NotifyTokenReceiverContractMissingLSP1Interface(address tokenReceiver);

/**
 * @dev tx is reverted with this error if the `tokenReceiver` is an EOA
 * this is the case only when `bool force` is set as `false`
 */
error LSP7NotifyTokenReceiverIsEOA(address tokenReceiver);
