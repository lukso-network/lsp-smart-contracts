// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {LSP0ERC725Account} from "./LSP0ERC725Account/LSP0ERC725Account.sol";

// constants
import {
    _LSP3_SUPPORTED_STANDARDS_KEY,
    _LSP3_SUPPORTED_STANDARDS_VALUE
} from "./LSP3UniversalProfile/LSP3Constants.sol";

/**
 * @title implementation of a LUKSO's Universal Profile based on LSP3
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Implementation of the ERC725Account + LSP1 universalReceiver
 */
contract UniversalProfile is LSP0ERC725Account {
    /**
     * @notice Deploying the contract with owner set to: `initialOwner`
     * @dev Set `initialOwner` as the contract owner and set the `SupportedStandards:LSP3UniversalProfile` data key
     * in the ERC725Y data key/value store. The `constructor` also allows funding the contract on deployment.
     *
     * Emitted Events:
     * - ValueReceived: when the contract is funded on deployment.
     *
     * @param initialOwner the owner of the contract
     */
    constructor(address initialOwner) payable LSP0ERC725Account(initialOwner) {
        // set data key SupportedStandards:LSP3UniversalProfile
        _setData(
            _LSP3_SUPPORTED_STANDARDS_KEY,
            _LSP3_SUPPORTED_STANDARDS_VALUE
        );
    }
}
