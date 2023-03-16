// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @dev Interface to be inherited for contract supporting LSP20-CallVerification
 */
interface ILSP20CallVerification {
    /**
     * @dev MUST return the first 3 bytes of lsp20VerifyCall function selector if the call to the function is allowed
     * concatened with a byte that determines if the lsp20VerifyCallResult function should be called after the original function
     * call. The byte that invole the lsp20VerifyCallResult function is strictly `0x01`.
     *
     * @param caller The address who called the function on the msg.sender
     * @param value The value sent by the caller to the function called on the msg.sender
     * @param data The data sent by the caller to the msg.sender
     */
    function lsp20VerifyCall(
        address caller,
        uint256 value,
        bytes memory data
    ) external returns (bytes4 magicValue);

    /**
     * @dev MUST return the lsp20VerifyCallResult function selector if the call to the function is allowed
     *
     * @param callHash The keccak256 of the parameters of {lsp20VerifyCall} concatenated
     * @param result The value result of the function called on the msg.sender
     */
    function lsp20VerifyCallResult(bytes32 callHash, bytes memory result) external returns (bytes4);
}
