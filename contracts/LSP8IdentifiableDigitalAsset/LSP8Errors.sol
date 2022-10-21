// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// --- Errors

/**
 * @dev reverts when `tokenId` doesn't exist
 */
error LSP8NonExistentTokenId(bytes32 tokenId);

/**
 * @dev reverts when `caller` != `tokenOwner` of the `tokenId`
 */
error LSP8NotTokenOwner(address tokenOwner, bytes32 tokenId, address caller);

/**
 * @dev reverts when `caller` is not an operator for `tokenId`
 */
error LSP8NotTokenOperator(bytes32 tokenId, address caller);

/**
 * @dev reverts when `operator` is already an authorized to trnafer the `tokenId`
 */
error LSP8OperatorAlreadyAuthorized(address operator, bytes32 tokenId);

/**
 * @dev reverts when one tries to set the zero address as operator
 */
error LSP8CannotUseAddressZeroAsOperator();

/**
 * @dev reverts when one tries to send token to zero address
 */
error LSP8CannotSendToAddressZero();

/**
 * @dev reverts when one tries to send token to itself
 */
error LSP8CannotSendToSelf();

/**
 * @dev reverts when `_address` is not a operator for the `tokenId`
 */
error LSP8NonExistingOperator(address _address, bytes32 tokenId);

/**
 * @dev reverts when `tokenId` is already minted
 */
error LSP8TokenIdAlreadyMinted(bytes32 tokenId);

/**
 * @dev reverts when the parameters used for `transferBatch` have different lengths
 */
error LSP8InvalidTransferBatch();

/**
 * @dev reverts when the `tokenReceiver` is not implementing LSP1
 * this is the case only when `bool force` is set as `false`
 */
error LSP8NotifyTokenReceiverContractMissingLSP1Interface(address tokenReceiver);

/**
 * @dev reverts when the `tokenReceiver` is an EOA
 * this is the case only when `bool force` is set as `false`
 */
error LSP8NotifyTokenReceiverIsEOA(address tokenReceiver);
