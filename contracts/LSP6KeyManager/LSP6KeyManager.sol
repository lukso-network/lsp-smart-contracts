// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

// modules
import {LSP6KeyManagerCore} from "./LSP6KeyManagerCore.sol";
import {InvalidLSP6Target} from "./LSP6Errors.sol";

/**
 * @title Implementation of a contract acting as a controller of an ERC725 Account, using permissions stored in the ERC725Y storage.
 * @author Fabian Vogelsteller <frozeman>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 * @dev All the permissions can be set on the ERC725 Account using `setData(bytes32,bytes)` or `setData(bytes32[],bytes[])`.
 */
contract LSP6KeyManager is LSP6KeyManagerCore {
    /**
     * @dev Get the version of the contract.
     * @notice Contract version.
     */
    // DO NOT CHANGE
    // Comments block below is used by release-please to automatically update the version in this file.
    // x-release-please-start-version
    string public constant VERSION = "0.12.0";

    // x-release-please-end

    /**
     * @notice Deploying a LSP6KeyManager linked to the contract at address `target_`.
     * @dev Deploy a Key Manager and set the `target_` address in the contract storage,
     * making this Key Manager linked to this `target_` contract.
     *
     * @param target_ The address of the contract to control and forward calldata payloads to.
     */
    constructor(address target_) {
        if (target_ == address(0)) revert InvalidLSP6Target();
        _target = target_;
    }
}
