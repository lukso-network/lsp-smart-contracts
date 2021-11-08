// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// --- ERC165 interface ids
bytes4 constant _LSP1_INTERFACE_ID = 0x6bb56a14;
bytes4 constant _LSP1_DELEGATE_INTERFACE_ID = 0xc2d7bcc1;

// --- ERC725Y Keys
bytes32 constant _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY =
    0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47; // keccak256("LSP1UniversalReceiverDelegate")

bytes32 constant _LSP5_ASSET_MAP_HASH =
    0x812c4334633eb816c80deebfa5fb7d2509eb438ca1b6418106442cb5ccc62f6c; // keccak256("LSP5ReceivedAssetsMap")

bytes32 constant _LSP5_ARRAY_KEY =
    0x6460ee3c0aac563ccbf76d6e1d07bada78e3a9514e6382b736ed3f478ab7b90b; // keccak256("LSP5ReceivedAssets[]")