// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

contract ReceiveExtension {
    event ReceiveExtensionCalled();

    fallback() external payable {
        return;
    }
}
