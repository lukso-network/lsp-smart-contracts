// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {UniversalProfileInitAbstract} from "./UniversalProfileInitAbstract.sol";

/**
 * @title Deployable Proxy implementation of a LUKSO's Universal Profile based on LSP3
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Implementation of the ERC725Account + LSP1 universalReceiver
 */
contract UniversalProfileInit is UniversalProfileInitAbstract {
    /**
     * @dev initialize (= lock) base implementation contract on deployment
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Sets the owner of the contract and sets the SupportedStandards:LSP3UniversalProfile key
     * @param newOwner the owner of the contract
     */
    function initialize(address newOwner) external payable virtual initializer {
        UniversalProfileInitAbstract._initialize(newOwner);
    }
}
