// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces

import "./ILSP20ReverseVerification.sol";

// errors
import "./LSP20Errors.sol";

/**
 * @title Implementation of the reverse verification according to LSP20ReverseVerification
 * @dev Module to be inherited used to verify the execution of functions according to an address.
 * Verification can happen before or after execution based on a magicValue.
 */
abstract contract LSP20ReverseVerification {
    /**
     * @dev Calls {lsp20VerifyCall} function on the logicVerifier in case he's not the function caller.
     * Reverts in case the value returned does not match the magic value (lsp20VerifyCall selector)
     * Returns whether a verification after the execution should happen based on the last byte of the magicValue
     */
    function _reverseVerificationBefore(address logicVerifier)
        internal
        virtual
        returns (bool verifyAfter)
    {
        if (msg.sender != logicVerifier) {
            (bool success, bytes memory returnedData) = logicVerifier.call(
                abi.encodeWithSelector(
                    ILSP20ReverseVerification.lsp20VerifyCall.selector,
                    msg.sender,
                    msg.value,
                    msg.data
                )
            );

            if (!success) {
                // Look for revert reason and bubble it up if present
                if (returnedData.length > 0) {
                    // The easiest way to bubble the revert reason is using memory via assembly
                    /// @solidity memory-safe-assembly
                    assembly {
                        let returndata_size := mload(returnedData)
                        revert(add(32, returnedData), returndata_size)
                    }
                } else {
                    revert LSP20CallingOwnerFailed(true);
                }
            }

            if (returnedData.length < 32) revert LSP20InvalidMagicValue(true, returnedData);

            bytes32 magicValue = abi.decode(returnedData, (bytes32));

            if (bytes3(magicValue) != bytes3(ILSP20ReverseVerification.lsp20VerifyCall.selector))
                revert LSP20InvalidMagicValue(true, returnedData);

            return bytes1(magicValue[3]) == 0x01 ? true : false;
        }
    }

    /**
     * @dev Calls {lsp20VerifyCallResult} function on the logicVerifier in case he's not the function caller.
     * Reverts in case the value returned does not match the magic value (lsp20VerifyCallResult selector)
     */
    function _reverseVerificationAfter(address logicVerifier, bytes memory callResult)
        internal
        virtual
    {
        (bool success, bytes memory returnedData) = logicVerifier.call(
            abi.encodeWithSelector(
                ILSP20ReverseVerification.lsp20VerifyCallResult.selector,
                keccak256(abi.encodePacked(msg.sender, msg.value, msg.data)),
                callResult
            )
        );

        if (!success) {
            // Look for revert reason and bubble it up if present
            if (returnedData.length > 0) {
                // The easiest way to bubble the revert reason is using memory via assembly
                /// @solidity memory-safe-assembly
                assembly {
                    let returndata_size := mload(returnedData)
                    revert(add(32, returnedData), returndata_size)
                }
            } else {
                revert LSP20CallingOwnerFailed(false);
            }
        }

        if (
            returnedData.length < 32 ||
            bytes4(abi.decode(returnedData, (bytes32))) !=
            ILSP20ReverseVerification.lsp20VerifyCallResult.selector
        ) revert LSP20InvalidMagicValue(false, returnedData);
    }
}
