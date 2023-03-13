// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @dev Interface for reverse verification
 */
interface ILSP20CallVerification {
    function lsp20VerifyCall(
        address caller,
        uint256 value,
        bytes memory data
    ) external returns (bytes4 magicValue);

    function lsp20VerifyCallResult(bytes32 callHash, bytes memory result) external returns (bytes4);
}
