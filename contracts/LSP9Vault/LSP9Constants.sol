// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// interfaces
import "@erc725/smart-contracts/contracts/interfaces/IERC725X.sol";
import "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import "@erc725/smart-contracts/contracts/interfaces/ILSP1_UniversalReceiver.sol";

// --- ERC165 interface ids
bytes4 constant _INTERFACEID_LSP9 = type(IERC725X).interfaceId ^
    type(IERC725Y).interfaceId ^
    type(ILSP1).interfaceId;

// --- ERC725Y entries

// --- Token Hooks
bytes32 constant _TYPEID_LSP9_VAULTSENDER = 0x3ca9f769340018257ac15b3a00e502e8fb730d66086f774210f84d0205af31e7; // keccak256("LSP9VaultSender")

bytes32 constant _TYPEID_LSP9_VAULTRECIPIENT = 0x09aaf55960715d8d86b57af40be36b0bfd469c9a3643445d8c65d39e27b4c56f; // keccak256("LSP9VaultRecipient")
