export const INTERFACE_ID_LSP20CallVerification = '0x1a0eb6a5';
export const INTERFACE_ID_LSP20CallVerifier = '0x0d6ecac7';

/**
 * @dev values returned by the `lsp20VerifyCall` and `lsp20VerifyCallResult` functions of the LSP20 standard.
 * Can be used to check if a calldata payload was check and verified.
 */
export const LSP20_SUCCESS_VALUES = {
  VERIFY_CALL: {
    // bytes3(keccak256("lsp20VerifyCall(address,address,address,uint256,bytes)")) + "0x00"
    NO_POST_VERIFICATION: '0xde928f00',
    // bytes3(keccak256("lsp20VerifyCall(address,address,address,uint256,bytes)")) + "0x01"
    WITH_POST_VERIFICATION: '0xde928f01',
  },
  // bytes4(keccak256("lsp20VerifyCallResult(bytes32,bytes)"))
  VERIFY_CALL_RESULT: '0xd3fc45d3',
} as const;
