// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces

import {ILSP20CallVerification as ILSP20} from "./ILSP20CallVerification.sol";

// errors
import "./LSP20Errors.sol";

/**
 * @title Implementation of contract calling the verification functions according to LSP20CallVerification
 * @dev Module to be inherited used to verify the execution of functions according to a verifier address.
 * Verification can happen before or after execution based on a magicValue.
 */
abstract contract LSP20CallVerification {
    /**
     * @dev Calls {lsp20VerifyCall} function on the logicVerifier.
     * Reverts in case the value returned does not match the magic value (lsp20VerifyCall selector)
     * Returns whether a verification after the execution should happen based on the last byte of the magicValue
     */
    function _verifyCall(address logicVerifier) internal virtual returns (bool verifyAfter) {
        (bool success, bytes memory returnedData) = logicVerifier.call(
            abi.encodeWithSelector(ILSP20.lsp20VerifyCall.selector, msg.sender, msg.value, msg.data)
        );

        if (!success) _revert(false, returnedData);

        if (returnedData.length < 32) revert LSP20InvalidMagicValue(false, returnedData);

        bytes32 magicValue = abi.decode(returnedData, (bytes32));

        if (bytes3(magicValue) != bytes3(ILSP20.lsp20VerifyCall.selector))
            revert LSP20InvalidMagicValue(false, returnedData);

        return bytes1(magicValue[3]) == 0x01 ? true : false;
    }

    /**
     * @dev Calls {lsp20VerifyCallResult} function on the logicVerifier.
     * Reverts in case the value returned does not match the magic value (lsp20VerifyCallResult selector)
     */
    function _verifyCallResult(address logicVerifier, bytes memory callResult) internal virtual {
        (bool success, bytes memory returnedData) = logicVerifier.call(
            abi.encodeWithSelector(
                ILSP20.lsp20VerifyCallResult.selector,
                keccak256(abi.encodePacked(msg.sender, msg.value, msg.data)),
                callResult
            )
        );

        if (!success) _revert(true, returnedData);

        if (
            returnedData.length < 32 ||
            bytes4(abi.decode(returnedData, (bytes32))) != ILSP20.lsp20VerifyCallResult.selector
        ) revert LSP20InvalidMagicValue(true, returnedData);
    }

    function _revert(bool postCall, bytes memory returnedData) internal pure {
        // Look for revert reason and bubble it up if present
        if (returnedData.length > 0) {
            // The easiest way to bubble the revert reason is using memory via assembly
            // solhint-disable no-inline-assembly
            /// @solidity memory-safe-assembly
            assembly {
                let returndata_size := mload(returnedData)
                revert(add(32, returnedData), returndata_size)
            }
        } else {
            revert LSP20CallingVerifierFailed(postCall);
        }
    }
}
