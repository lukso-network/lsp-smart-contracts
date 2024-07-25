// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @dev This contract is used only for testing purposes
 */
contract RevertCustomExtension {
    error RevertWithAddresses(address txOrigin, address msgSender);

    function revertCustom() public view virtual {
        // solhint-disable-next-line avoid-tx-origin
        revert RevertWithAddresses(tx.origin, msg.sender);
    }
}
