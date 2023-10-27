// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

abstract contract Version {
    string internal constant _VERSION = "0.12.0";

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
