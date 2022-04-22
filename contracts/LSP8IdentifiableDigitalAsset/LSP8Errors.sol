// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// --- Errors

error LSP8NonExistentTokenId(bytes32 tokenId);

error LSP8NotTokenOwner(address tokenOwner, bytes32 tokenId, address caller);

error LSP8NotTokenOperator(bytes32 tokenId, address caller);

error LSP8CannotUseAddressZeroAsOperator();

error LSP8CannotSendToAddressZero();

error LSP8TokenIdAlreadyMinted(bytes32 tokenId);

error LSP8InvalidTransferBatch();

error LSP8NotifyTokenReceiverContractMissingLSP1Interface(address tokenReceiver);

error LSP8NotifyTokenReceiverIsEOA(address tokenReceiver);
