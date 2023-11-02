// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// --- ERC165 interface ids
bytes4 constant _INTERFACEID_LSP0 = 0x24871b3d;
bytes4 constant _INTERFACEID_ERC1271 = 0x1626ba7e;

// ERC1271 - Standard Signature Validation
bytes4 constant _ERC1271_SUCCESSVALUE = 0x1626ba7e;
bytes4 constant _ERC1271_FAILVALUE = 0xffffffff;

// --- Native Token Type Id

// keccak256('LSP0ValueReceived')
bytes32 constant _TYPEID_LSP0_VALUE_RECEIVED = 0x9c4705229491d365fb5434052e12a386d6771d976bea61070a8c694e8affea3d;

// Ownership Transfer Type IDs

// keccak256('LSP0OwnershipTransferStarted')
bytes32 constant _TYPEID_LSP0_OwnershipTransferStarted = 0xe17117c9d2665d1dbeb479ed8058bbebde3c50ac50e2e65619f60006caac6926;

// keccak256('LSP0OwnershipTransferred_SenderNotification')
bytes32 constant _TYPEID_LSP0_OwnershipTransferred_SenderNotification = 0xa4e59c931d14f7c8a7a35027f92ee40b5f2886b9fdcdb78f30bc5ecce5a2f814;

// keccak256('LSP0OwnershipTransferred_RecipientNotification')
bytes32 constant _TYPEID_LSP0_OwnershipTransferred_RecipientNotification = 0xceca317f109c43507871523e82dc2a3cc64dfa18f12da0b6db14f6e23f995538;
