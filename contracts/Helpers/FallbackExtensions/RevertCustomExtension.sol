// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/**
 * @dev This contract is used only for testing purposes
 */
contract RevertCustomExtension {
    error RevertWithAddresses(address txOrigin, address msgSender);

    function revertCustom() public view virtual {
        revert RevertWithAddresses(tx.origin, msg.sender);
    }
}
