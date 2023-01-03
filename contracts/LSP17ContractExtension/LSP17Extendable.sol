// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

// constants
import {_INTERFACEID_LSP17_EXTENDABLE} from "./LSP17Constants.sol";

/**
 * @title Implementation of the fallback logic according to LSP17ContractExtension
 * @dev Module to be inherited used to extend the functionality of the parent contract when
 * calling a function that doesn't exist on the parent contract via forwarding the call
 * to an extension mapped to the function selector being called, set originally by the parent contract
 */
abstract contract LSP17Extendable is ERC165 {
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == _INTERFACEID_LSP17_EXTENDABLE || super.supportsInterface(interfaceId);
    }

    /**
     * @dev Returns whether the interfaceId being checked is supported in the extension of the
     * {supportsInterface} selector.
     */
    function _supportsInterfaceInERC165Extension(bytes4 interfaceId)
        internal
        view
        virtual
        returns (bool)
    {
        address erc165Extension = _getExtension(ERC165.supportsInterface.selector);
        if (erc165Extension == address(0)) return false;

        return ERC165Checker.supportsERC165InterfaceUnchecked(erc165Extension, interfaceId);
    }

    /**
     * @dev Returns the extension mapped to a specific function selector
     * If no extension was found, return the address(0)
     * To be overrided.
     * Up to the implementor contract to return an extension based on a function selector
     */
    function _getExtension(bytes4 functionSelector) internal view virtual returns (address);

    /**
     * Forwards the call to an extension mapped to a function selector. If the address of
     * the extension is address(0), then return.
     *
     * The call to the extension is appended with bytes20 (msg.sender) and bytes32 (msg.value).
     * Returns the return value on success and revert in case of failure.
     *
     * If the msg.data is shorter than 4 bytes, do not check for an extension and return
     */
    function _fallbackLSP17Extendable() internal virtual {
        if (msg.data.length < 4) return;
        // If there is a function selector
        address extension = _getExtension(msg.sig);

        // if no extension was found, return
        if (extension == address(0)) return;

        // solhint-disable no-inline-assembly
        // if the extension was found, call the extension with the msg.data
        // appended with bytes20(address) and bytes32(msg.value)
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
