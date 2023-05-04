// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @dev This contract is used only for testing purposes
 */
contract GraffitiEventExtension {
    event GraffitiDataReceived(bytes graffitiData);

    // solhint-disable no-complex-fallback
    fallback(bytes calldata data) external payable returns (bytes memory) {
        emit GraffitiDataReceived(data);
        return data;
    }
}
