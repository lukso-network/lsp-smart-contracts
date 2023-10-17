// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @title Interface for the LSP20 Call Verification standard, a set of functions intended to perform verifications on behalf of another contract.
 *
 * @dev Interface to be inherited for contract supporting LSP20-CallVerification
 */
interface ILSP20CallVerifier {
    /**
     * @return returnedStatus MUST return the first 3 bytes of `lsp20VerifyCall(address,uint256,bytes)` function selector if the call to
     * the function is allowed, concatened with a byte that determines if the lsp20VerifyCallResult function should
     * be called after the original function call. The byte that invoke the lsp20VerifyCallResult function is strictly `0x01`.
     *
     * @param requestor The address that requested to make the call to `target`.
     * @param target The address of the contract that implements the `LSP20CallVerification` interface.
     * @param caller The address who called the function on the `target` contract.
     * @param value The value sent by the caller to the function called on the msg.sender
     * @param callData The calldata sent by the caller to the msg.sender
     */
    function lsp20VerifyCall(
        address requestor,
        address target,
        address caller,
        uint256 value,
        bytes memory callData
    ) external returns (bytes4 returnedStatus);

    /**
     * @return MUST return the lsp20VerifyCallResult function selector if the call to the function is allowed
     *
     * @param callHash The keccak256 hash of the parameters of {lsp20VerifyCall} concatenated
     * @param callResult The value result of the function called on the msg.sender
     */
    function lsp20VerifyCallResult(
        bytes32 callHash,
        bytes memory callResult
    ) external returns (bytes4);
}
