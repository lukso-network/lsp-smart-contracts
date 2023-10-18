// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @dev This contract is used only for testing purposes
 */
contract ERC165Extension is IERC165 {
    bytes4 private constant _RANDOM_INTERFACE_ID = 0xaabbccdd;

    function supportsInterface(
        bytes4 interfaceId
    ) public pure override returns (bool) {
        return interfaceId == _RANDOM_INTERFACE_ID;
    }
}
