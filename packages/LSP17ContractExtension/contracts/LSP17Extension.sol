// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {Version} from "./Version.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";

// constants
import {_INTERFACEID_LSP17_EXTENSION} from "./LSP17Constants.sol";

/**
 * @title Module to create a contract that can act as an extension.
 *
 * @dev Implementation of the extension logic according to LSP17ContractExtension.
 * This module can be inherited to provide context of the msg variable related to the extendable contract
 */
abstract contract LSP17Extension is ERC165, Version {
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return
            interfaceId == _INTERFACEID_LSP17_EXTENSION ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @dev Returns the original `msg.data` passed to the extendable contract
     * without the appended `msg.sender` and `msg.value`.
     */
    function _extendableMsgData()
        internal
        view
        virtual
        returns (bytes calldata)
    {
        return msg.data[:msg.data.length - 52];
    }

    /**
     * @dev Returns the original `msg.sender` calling the extendable contract.
     */
    function _extendableMsgSender() internal view virtual returns (address) {
        return
            address(
                bytes20(msg.data[msg.data.length - 52:msg.data.length - 32])
            );
    }

    /**
     * @dev Returns the original `msg.value` sent to the extendable contract.
     */
    function _extendableMsgValue() internal view virtual returns (uint256) {
        return uint256(bytes32(msg.data[msg.data.length - 32:]));
    }
}
