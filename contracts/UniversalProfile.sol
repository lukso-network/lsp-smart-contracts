// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {LSP0ERC725Account} from "./LSP0ERC725Account/LSP0ERC725Account.sol";

// constants
import {
    _LSP3_SUPPORTED_STANDARDS_KEY,
    _LSP3_SUPPORTED_STANDARDS_VALUE
} from "./LSP3ProfileMetadata/LSP3Constants.sol";

/**
 * @title implementation of a LUKSO's Universal Profile based on LSP3
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Implementation of the ERC725Account + LSP1 universalReceiver
 */
contract UniversalProfile is LSP0ERC725Account {
    /**
     * @notice Deploying a UniversalProfile contract with owner set to address `initialOwner`.
     *
     * @dev Set `initialOwner` as the contract owner and the `SupportedStandards:LSP3Profile` data key in the ERC725Y data key/value store.
     * - The `constructor` is payable and allows funding the contract on deployment.
     * - The `initialOwner` will then be allowed to call protected functions marked with the `onlyOwner` modifier.
     *
     * @param initialOwner the owner of the contract
     *
     * @custom:events
     * - {UniversalReceiver} event when funding the contract on deployment.
     * - {OwnershipTransferred} event when `initialOwner` is set as the contract {owner}.
     * - {DataChanged} event when setting the {_LSP3_SUPPORTED_STANDARDS_KEY}.
     */
    constructor(address initialOwner) payable LSP0ERC725Account(initialOwner) {
        // set data key SupportedStandards:LSP3Profile
        _setData(
            _LSP3_SUPPORTED_STANDARDS_KEY,
            _LSP3_SUPPORTED_STANDARDS_VALUE
        );
    }
}
