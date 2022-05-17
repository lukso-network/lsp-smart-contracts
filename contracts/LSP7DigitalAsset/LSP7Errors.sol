// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// --- Errors

error LSP7AmountExceedsBalance(uint256 balance, address tokenOwner, uint256 amount);

error LSP7AmountExceedsAuthorizedAmount(
    address tokenOwner,
    uint256 authorizedAmount,
    address operator,
    uint256 amount
);

error LSP7CannotUseAddressZeroAsOperator();

error LSP7CannotSendWithAddressZero();

error LSP7InvalidTransferBatch();

error LSP7NotifyTokenReceiverContractMissingLSP1Interface(address tokenReceiver);

error LSP7NotifyTokenReceiverIsEOA(address tokenReceiver);
