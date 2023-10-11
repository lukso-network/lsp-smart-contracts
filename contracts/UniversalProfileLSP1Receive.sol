// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {UniversalProfile} from "./UniversalProfile.sol";

contract UniversalProfileLSP1Receive is UniversalProfile {
    constructor(address initialOwner) payable UniversalProfile(initialOwner) {}

    bytes32 private constant _LSP0_VALUE_RECEIVED_TYPE_ID =
        keccak256("LSP0ValueReceived");

    /**
     * @dev Executed:
     * - When receiving some native tokens without any additional data.
     * - On empty calls to the contract.
     *
     * @custom:events {ValueReceived} event when receiving native tokens.
     */
    receive() external payable override {
        universalReceiver(_LSP0_VALUE_RECEIVED_TYPE_ID, "");
    }
}
