// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// --- Errors

/**
 * @dev tx is reverted with this error if `tokenId` doesn't exist
 */
error LSP8NonExistentTokenId(bytes32 tokenId);

/**
 * @dev tx is reverted with this error if `caller` != `tokenOwner` of the `tokenId`
 */
error LSP8NotTokenOwner(address tokenOwner, bytes32 tokenId, address caller);

/**
 * @dev tx is reverted with this error if `caller` is not an operator for `tokenId`
 */
error LSP8NotTokenOperator(bytes32 tokenId, address caller);

/**
 * @dev tx is reverted with this error if `operator` is already an authorized to trnafer the `tokenId`
 */
error LSP8OperatorAlreadyAuthorized(address operator, bytes32 tokenId);

/**
 * @dev tx is reverted with this error if one tries to authorize the zero address as operator
 */
error LSP8CannotUseAddressZeroAsOperator();

/**
 * @dev tx is reverted with this error if one tries to send token to zero address
 */
error LSP8CannotSendToAddressZero();

/**
 * @dev tx is reverted with this error if one tries to send token to itself
 */
error LSP8CannotSendToSelf();

/**
 * @dev tx is reverted with this error if `_address` is not a operator for the `tokenId`
 */
error LSP8NonExistingOperator(address _address, bytes32 tokenId);

/**
 * @dev tx is reverted with this error if `tokenId` is already minted
 */
error LSP8TokenIdAlreadyMinted(bytes32 tokenId);

/**
 * @dev tx is reverted with this error if the parameters used for `transferBatch` are not adecvate
 * meaning that the arrays: `from`, `to`, `tokenId` and `data` have differnet lengths
 */
error LSP8InvalidTransferBatch();

/**
 * @dev tx is reverted with this error if the `tokenReceiver` is not implementing LSP1
 * this is the case only when `bool force` is set as `false`
 */
error LSP8NotifyTokenReceiverContractMissingLSP1Interface(address tokenReceiver);

/**
 * @dev tx is reverted with this error if the `tokenReceiver` is an EOA
 * this is the case only when `bool force` is set as `false`
 */
error LSP8NotifyTokenReceiverIsEOA(address tokenReceiver);
