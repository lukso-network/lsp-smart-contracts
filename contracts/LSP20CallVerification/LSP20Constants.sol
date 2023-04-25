// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// bytes4(keccak256("LSP20CallVerification"))
bytes4 constant _INTERFACEID_LSP20_CALL_VERIFICATION = 0x1a0eb6a5;

// `lsp20VerifyCall(address,uint256,bytes)` selector XOR `lsp20VerifyCallResult(bytes32,bytes)` selector
bytes4 constant _INTERFACEID_LSP20_CALL_VERIFIER = 0x480c0ec2;
