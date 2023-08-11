// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {
    ERC165Checker
} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

// constants
import {_INTERFACEID_LSP17_EXTENDABLE} from "./LSP17Constants.sol";

// errors
import "./LSP17Errors.sol";

/**
 * @title Module to add more functionalities to a contract using extensions.
 *
 * @dev Implementation of the `fallback(...)` logic according to LSP17 - Contract Extension standard.
 * This module can be inherited to extend the functionality of the parent contract when
 * calling a function that doesn't exist on the parent contract via forwarding the call
 * to an extension mapped to the function selector being called, set originally by the parent contract
 */
abstract contract LSP17Extendable is ERC165 {
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return
            interfaceId == _INTERFACEID_LSP17_EXTENDABLE ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @dev Returns whether the interfaceId being checked is supported in the extension of the
     * {supportsInterface} selector.
     *
     * To be used by extendable contracts wishing to extend the ERC165 interfaceIds originally
     * supported by reading whether the interfaceId queried is supported in the `supportsInterface`
     * extension if the extension is set, if not it returns false.
     */
    function _supportsInterfaceInERC165Extension(
        bytes4 interfaceId
    ) internal view virtual returns (bool) {
        address erc165Extension = _getExtension(
            ERC165.supportsInterface.selector
        );
        if (erc165Extension == address(0)) return false;

        return
            ERC165Checker.supportsERC165InterfaceUnchecked(
                erc165Extension,
                interfaceId
            );
    }

    /**
     * @dev Returns the extension mapped to a specific function selector
     * If no extension was found, return the address(0)
     * To be overrided.
     * Up to the implementor contract to return an extension based on a function selector
     */
    function _getExtension(
        bytes4 functionSelector
    ) internal view virtual returns (address);

    /**
     * @dev Forwards the call to an extension mapped to a function selector.
     *
     * Calls {_getExtension} to get the address of the extension mapped to the function selector being
     * called on the account. If there is no extension, the address(0) will be returned.
     *
     * Reverts if there is no extension for the function being called.
     *
     * If there is an extension for the function selector being called, it calls the extension with the
     * CALL opcode, passing the {msg.data} appended with the 20 bytes of the {msg.sender} and
     * 32 bytes of the {msg.value}
     *
     * Because the function uses assembly {return()/revert()} to terminate the call, it cannot be
     * called before other codes in fallback().
     *
     * Otherwise, the codes after _fallbackLSP17Extendable() may never be reached.
     */
    function _fallbackLSP17Extendable(
        bytes calldata callData
    ) internal virtual returns (bytes memory) {
        // If there is a function selector
        address extension = _getExtension(msg.sig);

        // if no extension was found, revert
        if (extension == address(0))
            revert NoExtensionFoundForFunctionSelector(msg.sig);

        (bool success, bytes memory result) = extension.call(
            abi.encodePacked(callData, msg.sender, msg.value)
        );

        if (success) {
            return result;
        } else {
            // `mload(result)` -> offset in memory where `result.length` is located
            // `add(result, 32)` -> offset in memory where `result` data starts
            // solhint-disable no-inline-assembly
            /// @solidity memory-safe-assembly
            assembly {
                let resultdata_size := mload(result)
                revert(add(result, 32), resultdata_size)
            }
        }
    }
}
