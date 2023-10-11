// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {UniversalProfile} from "./UniversalProfile.sol";

contract UniversalProfileLSP17Receive is UniversalProfile {
    constructor(address initialOwner) payable UniversalProfile(initialOwner) {}

    bytes4 private constant _RECEIVE_SELECTOR = bytes4(keccak256("receive()"));

    /**
     * @dev Executed:
     * - When receiving some native tokens without any additional data.
     * - On empty calls to the contract.
     *
     * @custom:events {ValueReceived} event when receiving native tokens.
     */
    receive() external payable override {
        if (msg.value != 0) {
            emit ValueReceived(msg.sender, msg.value);
        }

        // Get the address of the extension set for when receiving plain native tokens
        address extension = _getExtension(_RECEIVE_SELECTOR);

        // if no extension was found return don't revert
        if (extension == address(0)) return;

        (bool success, bytes memory result) = extension.call(
            abi.encodePacked(_RECEIVE_SELECTOR, msg.sender, msg.value)
        );

        assembly {
            // `mload(result)` -> offset in memory where `result.length` is located
            // `add(result, 32)` -> offset in memory where `result` data starts
            let resultdataSize := mload(result)
            let resultdataOffset := add(result, 32)

            // if call failed, revert
            if eq(success, 0) {
                revert(resultdataOffset, resultdataSize)
            }

            // otherwise return the data returned by the extension
            return(resultdataOffset, resultdataSize)
        }
    }
}
