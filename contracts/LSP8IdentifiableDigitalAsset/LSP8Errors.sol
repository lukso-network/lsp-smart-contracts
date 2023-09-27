// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// --- Errors

/**
 * @dev Reverts when `tokenId` has not been minted.
 */
error LSP8NonExistentTokenId(bytes32 tokenId);

/**
 * @dev Reverts when `caller` is not the `tokenOwner` of the `tokenId`.
 */
error LSP8NotTokenOwner(address tokenOwner, bytes32 tokenId, address caller);

/**
 * @dev Reverts when `caller` is not an allowed operator for `tokenId`.
 */
error LSP8NotTokenOperator(bytes32 tokenId, address caller);

/**
 * @dev Reverts when `operator` is already authorized for the `tokenId`.
 */
error LSP8OperatorAlreadyAuthorized(address operator, bytes32 tokenId);

/**
 * @dev Reverts when trying to set the zero address as an operator.
 */
error LSP8CannotUseAddressZeroAsOperator();

/**
 * @dev Reverts when trying to send token to the zero address.
 */
error LSP8CannotSendToAddressZero();

/**
 * @dev Reverts when specifying the same address for `from` and `to` in a token transfer.
 */
error LSP8CannotSendToSelf();

/**
 * @dev Reverts when `operator` is not an operator for the `tokenId`.
 */
error LSP8NonExistingOperator(address operator, bytes32 tokenId);

/**
 * @dev Reverts when `tokenId` has already been minted.
 */
error LSP8TokenIdAlreadyMinted(bytes32 tokenId);

/**
 * @dev Reverts when the parameters used for `transferBatch` have different lengths.
 */
error LSP8InvalidTransferBatch();

/**
 * @dev Reverts if the `tokenReceiver` does not implement LSP1
 * when minting or transferring tokens with `bool force` set as `false`.
 */
error LSP8NotifyTokenReceiverContractMissingLSP1Interface(
    address tokenReceiver
);

/**
 * @dev Reverts if the `tokenReceiver` is an EOA
 * when minting or transferring tokens with `bool force` set as `false`.
 */
error LSP8NotifyTokenReceiverIsEOA(address tokenReceiver);

/**
 * @dev Reverts when trying to authorize or revoke the token's owner as an operator.
 */
error LSP8TokenOwnerCannotBeOperator();

/**
 * @dev Error occurs when sending native tokens to the LSP8 contract without sending any data.
 *
 * E.g. Sending value without passing a bytes4 function selector to call a LSP17 Extension.
 *
 * @notice LSP8 contract cannot receive native tokens.
 */
error LSP8TokenContractCannotHoldValue();

/**
 * @dev Reverts when trying to edit the data key `LSP8TokenIdType` after the identifiable digital asset contract has been deployed.
 * The `LSP8TokenIdType` data key is located inside the ERC725Y Data key-value store of the identifiable digital asset contract.
 * It can be set only once inside the constructor/initializer when the identifiable digital asset contract is being deployed.
 */
error LSP8TokenIdTypeNotEditable();
