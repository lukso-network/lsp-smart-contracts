// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// solhint-disable
/**
 * @title Implementation of LSP17FallbackExtension
 * @dev Module to be inherited used to extend the functionality of the parent contract when
 * calling a function that doesn't exist on the parent contract via forwarding the call
 * to an extension mapped to the function selector being called, set originaly by the parent contract
 */
abstract contract LSP17FallbackExtension {
    /**
     * @dev Returns the extension mapped to a specific function selector
     * If no extension was found, return the address(0)
     */
    function _getExtension(bytes4 functionSelector) internal view virtual returns (address) {
        // To be overrided
    }

    /**
     * Forwards the call to an extension mapped to a function selector. If the address of
     * the extension is address(0), then return.
     *
     * The call to the extension is appended with bytes20 (msg.sender) and bytes32 (msg.value).
     * Returns the return value on success and revert in case of failure.
     *
     * If the msg.data is shorter than 4 bytes or msg.sig is the bytes4(0), do not check
     * for an extension and return
     */
    function _fallbackExtension() internal virtual {
        // People wishing to send graffiti can prepend the data with bytes4(0)
        // to bypass the check of a possible extension
        if (msg.data.length < 4 || msg.sig == bytes4(0)) {
            return;
        }
        // If the function selector is not bytes4(0), check for a call extension
        else {
            address extension = _getExtension(msg.sig);

            // if no extension was found, return
            if (extension == address(0)) {
                return;
            }
            // if the extension was found, call the extension with the msg.data
            // appended with bytes20(address) and bytes32(msg.value)
            else {
                assembly {
                    calldatacopy(0, 0, calldatasize())

                    // The msg.sender address is shifted to the left by 12 bytes to remove the padding
                    // Then the address without padding is stored right after the calldata
                    mstore(calldatasize(), shl(96, caller()))

                    // The msg.value is stored right after the calldata + msg.sender
                    mstore(add(calldatasize(), 20), callvalue())

                    // Add 52 bytes for the msg.sender and msg.value appended at the end of the calldata
                    let success := call(gas(), extension, 0, 0, add(calldatasize(), 52), 0, 0)

                    // Copy the returned data
                    returndatacopy(0, 0, returndatasize())

                    switch success
                    // call returns 0 on failed calls
                    case 0 {
                        revert(0, returndatasize())
                    }
                    default {
                        return(0, returndatasize())
                    }
                }
            }
        }
    }
}
