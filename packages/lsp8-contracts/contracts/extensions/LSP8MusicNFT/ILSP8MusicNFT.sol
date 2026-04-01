// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/// @title ILSP8MusicNFT
/// @dev Interface for LSP33 Music NFT extension on LSP8 collections.
interface ILSP8MusicNFT {
    // Inherits all LSP8 functions.
    // The extension modifies getDataForTokenId to proxy reads to linked LSP7 contracts
    // and setDataForTokenId to forward writes to linked LSP7 contracts.
}
