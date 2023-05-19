// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// bytes4(keccak256("LSP20CallVerification"))
bytes4 constant _INTERFACEID_LSP20_CALL_VERIFICATION = 0x1a0eb6a5;

// `lsp20VerifyCall(address,uint256,bytes)` selector XOR `lsp20VerifyCallResult(bytes32,bytes)` selector
bytes4 constant _INTERFACEID_LSP20_CALL_VERIFIER = 0x480c0ec2;

// bytes4(bytes.concat(bytes3(ILSP20.lsp20VerifyCall.selector), hex"01"))
bytes4 constant _LSP20_VERIFY_CALL_MAGIC_VALUE_WITH_POST_VERIFICATION = 0x9bf04b01;

// bytes4(bytes.concat(bytes3(ILSP20.lsp20VerifyCall.selector), hex"00"))
bytes4 constant _LSP20_VERIFY_CALL_MAGIC_VALUE_WITHOUT_POST_VERIFICATION = 0x9bf04b00;

// bytes4(ILSP20.lsp20VerifyCallResult.selector)
bytes4 constant _LSP20_VERIFY_CALL_RESULT_MAGIC_VALUE = 0xd3fc45d3;
