// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import {LSP0ERC725Account} from "./LSP0ERC725Account/LSP0ERC725Account.sol";

// constants
// prettier-ignore
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
     * @notice Sets the owner of the contract and sets the SupportedStandards:LSP3UniversalProfile key
     * @param newOwner the owner of the contract
     */
    constructor(address newOwner) LSP0ERC725Account(newOwner) {
        // set key SupportedStandards:LSP3UniversalProfile
        _setData(_LSP3_SUPPORTED_STANDARDS_KEY, _LSP3_SUPPORTED_STANDARDS_VALUE);
    }
}
