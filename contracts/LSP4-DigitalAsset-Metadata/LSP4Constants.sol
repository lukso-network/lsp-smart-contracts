// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

//
// --- ERC725Y entries
//

// keccak256('LSP4TokenName')
bytes32 constant _LSP4_METADATA_TOKEN_NAME_KEY =
    0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1;

// keccak256('LSP4TokenSymbol')
bytes32 constant _LSP4_METADATA_TOKEN_SYMBOL_KEY =
    0x2f0a68ab07768e01943a599e73362a0e17a63a72e94dd2e384d2c1d4db932756;

//
// --- LSP4 notify type ids
//

// keccak256("LSP4NotifyTokensSender")
bytes32 constant _LSP4_NOTIFY_TOKENS_SENDER_TYPE_ID =
    0x469a0f1057b0a9d6e1fee14f1b3eed13e3c1d5463cfc514e79ba8660437bee0d;

// keccak256("LSP4NotifyTokensRecipient")
bytes32 constant _LSP4_NOTIFY_TOKENS_RECIPIENT_TYPE_ID =
    0x709ce9002dd788b112f726e7b11ccffd8afa9c1339adf2c86a8089be7f81c507;
