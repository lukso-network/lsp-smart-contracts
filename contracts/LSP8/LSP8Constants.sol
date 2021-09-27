// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// TODO: we should change this to something unique like `keccak256("ERC721TokensRecipient")`.
//
// We are including this so we can use the existing `UniversalReceiverAddressStore` which only
// works with `ERC777UniversalReceiver`.. so we spoof it
//
// keccak256("ERC777TokensRecipient")
bytes32 constant _LSP8_TOKENS_RECIPIENT_INTERFACE_HASH =
    0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b;

// TODO: we should change this to something unique like `keccak256("ERC721TokensSender")`.
//
// We are including this as a placeholder until `UniversalReceiverAddressStore` can handle more
// than one hardcoded `typeId`.
//
// keccak256("ERC777TokensRecipient")
bytes32 constant _LSP8_TOKENS_SENDER_INTERFACE_HASH =
    0x29ddb589b1fb5fc7cf394961c1adf5f8c6454761adf795e67fe149f658abe895; // keccak256("ERC777TokensSender")
