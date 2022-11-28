// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.4;

// --- Errors

/**
 * @dev reverts when `tokenId` has not been minted.
 */
error LSP8NonExistentTokenId(bytes32 tokenId);

/**
 * @dev reverts when `caller` is not the `tokenOwner` of the `tokenId`.
 */
error LSP8NotTokenOwner(address tokenOwner, bytes32 tokenId, address caller);

/**
 * @dev reverts when `caller` is not an allowed operator for `tokenId`.
 */
error LSP8NotTokenOperator(bytes32 tokenId, address caller);

/**
 * @dev reverts when `operator` is already authorized for the `tokenId`.
 */
error LSP8OperatorAlreadyAuthorized(address operator, bytes32 tokenId);

/**
 * @dev reverts when trying to set the zero address as an operator.
 */
error LSP8CannotUseAddressZeroAsOperator();

/**
 * @dev reverts when trying to send token to the zero address.
 */
error LSP8CannotSendToAddressZero();

/**
 * @dev reverts when specifying the same address for `from` and `to` in a token transfer.
 */
error LSP8CannotSendToSelf();

/**
 * @dev reverts when `operator` is not an operator for the `tokenId`.
 */
error LSP8NonExistingOperator(address operator, bytes32 tokenId);

/**
 * @dev reverts when `tokenId` has already been minted.
 */
error LSP8TokenIdAlreadyMinted(bytes32 tokenId);

/**
 * @dev reverts when the parameters used for `transferBatch` have different lengths.
 */
error LSP8InvalidTransferBatch();

/**
 * @dev reverts if the `tokenReceiver` does not implement LSP1
 * when minting or transferring tokens with `bool force` set as `false`.
 */
error LSP8NotifyTokenReceiverContractMissingLSP1Interface(address tokenReceiver);

/**
 * @dev reverts if the `tokenReceiver` is an EOA
 * when minting or transferring tokens with `bool force` set as `false`.
 */
error LSP8NotifyTokenReceiverIsEOA(address tokenReceiver);
