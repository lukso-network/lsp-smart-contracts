// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../LSP0ERC725Account/LSP0Constants.sol";

/**
 * @dev This contract is used only for testing purposes
 */
contract SupportsInterfaceOnlyLSP0 {
    function supportsInterface(bytes4 interfaceId) public view virtual returns (bool) {
        return interfaceId == _INTERFACEID_LSP0;
    }
}
