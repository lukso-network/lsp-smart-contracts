// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @title Interface for the LSP20 Call Verification standard, a set of functions intended to perform verifications on behalf of another contract.
 *
 * @dev Interface to be inherited for contract supporting LSP20-CallVerification
 */
interface ILSP20CallVerifier {
    /**
     * @return magicValue MUST return the first 3 bytes of `lsp20VerifyCall(address,uint256,bytes)` function selector if the call to
     * the function is allowed, concatened with a byte that determines if the lsp20VerifyCallResult function should
     * be called after the original function call. The byte that invoke the lsp20VerifyCallResult function is strictly `0x01`.
     *
     * @param caller The address who called the function on the msg.sender
     * @param value The value sent by the caller to the function called on the msg.sender
     * @param receivedCalldata The receivedCalldata sent by the caller to the msg.sender
     */
    function lsp20VerifyCall(
        address caller,
        uint256 value,
        bytes memory receivedCalldata
    ) external returns (bytes4 magicValue);

    /**
     * @return MUST return the lsp20VerifyCallResult function selector if the call to the function is allowed
     *
     * @param callHash The keccak256 of the parameters of {lsp20VerifyCall} concatenated
     * @param result The value result of the function called on the msg.sender
     */
    function lsp20VerifyCallResult(
        bytes32 callHash,
        bytes memory result
    ) external returns (bytes4);
}
