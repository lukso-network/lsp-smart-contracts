// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// --- Errors

/**
 * @dev reverts when sending an `amount` of tokens larger than the current `balance` of the `tokenOwner`.
 */
error LSP7AmountExceedsBalance(
    uint256 balance,
    address tokenOwner,
    uint256 amount
);

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
 * @dev reverts when trying to:
 * - mint tokens to the zero address.
 * - burn tokens from the zero address.
 * - transfer tokens from or to the zero address.
 */
error LSP7CannotSendWithAddressZero();

/**
 * @dev reverts when the array parameters used in {transferBatch} have different lengths.
 */
error LSP7InvalidTransferBatch();

/**
 * @dev reverts if the `tokenReceiver` does not implement LSP1
 * when minting or transferring tokens with `bool force` set as `false`.
 */
error LSP7NotifyTokenReceiverContractMissingLSP1Interface(
    address tokenReceiver
);

/**
 * @dev reverts if the `tokenReceiver` is an EOA when minting or transferring tokens with `bool force` set as `false`.
 */
error LSP7NotifyTokenReceiverIsEOA(address tokenReceiver);

/**
 * @dev reverts when trying to authorize or revoke the token's owner as an operator.
 */
error LSP7TokenOwnerCannotBeOperator();

/**
 * @dev Reverts when trying to decrease an operator's allowance to more than its current allowance.
 */
error LSP7DecreasedAllowanceBelowZero();

/**
 * @dev Error occurs when sending native tokens to the LSP7 contract without sending any data.
 *
 * E.g. Sending value without passing a bytes4 function selector to call a LSP17 Extension.
 *
 * @notice LSP7 contract cannot receive native tokens.
 */
error LSP7TokenContractCannotHoldValue();

/**
 * @dev Reverts when token owner call {increaseAllowance} for an operator that does not have any allowance
 */
error OperatorAllowanceCannotBeIncreasedFromZero(address operator);

/**
 * @dev Reverts when a batch call failed.
 * @notice Batch call failed.
 */
error LSP7BatchCallFailed(uint256 callIndex);

/**
 * @dev Reverts when the call to revoke operator is not authorized.
 */
error LSP7RevokeOperatorNotAuthorized(
    address caller,
    address tokenOwner,
    address operator
);

/**
 * @dev Reverts when the call to decrease allowance is not authorized.
 */
error LSP7DecreaseAllowanceNotAuthorized(
    address caller,
    address tokenOwner,
    address operator
);
