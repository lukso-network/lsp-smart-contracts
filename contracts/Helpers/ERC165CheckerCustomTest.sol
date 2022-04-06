// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../Utils/ERC165CheckerCustom.sol";

/**
 * @dev Contract used to test the custom implementation of ERC165Checker
 */
contract ERC165CheckerCustomTest {
    function supportsERC165Interface(address account, bytes4 interfaceId)
        public
        view
        returns (bool)
    {
        return
            ERC165CheckerCustom.supportsERC165Interface(account, interfaceId);
    }
}
