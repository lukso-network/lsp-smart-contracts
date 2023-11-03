// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

abstract contract Version {
    // DO NOT CHANGE
    // Comments block below is used by release-please to automatically update the version in this file.
    // x-release-please-start-version
    string internal constant _VERSION = "0.12.0";

    // x-release-please-end

    /**
     * @dev Get the version of the contract.
     * @notice Contract version.
     *
     * @return The version of the the contract.
     */
    function version() public view virtual returns (string memory) {
        return _VERSION;
    }
}
