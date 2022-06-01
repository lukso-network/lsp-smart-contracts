// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// libraries
import {ERC165Checker} from "../Custom/ERC165Checker.sol";

/**
 * @dev Contract used to test the custom implementation of ERC165Checker
 */
contract ERC165CheckerCustomTest {
    function supportsERC165Interface(address account, bytes4 interfaceId)
        public
        view
        returns (bool)
    {
        return ERC165Checker.supportsERC165Interface(account, interfaceId);
    }
}
