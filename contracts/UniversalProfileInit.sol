// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import {UniversalProfileInitAbstract} from "./UniversalProfileInitAbstract.sol";

/**
 * @title Deployable Proxy implementation of a LUKSO's Universal Profile based on LSP3
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Implementation of the ERC725Account + LSP1 universalReceiver
 */
contract UniversalProfileInit is UniversalProfileInitAbstract {
    /**
     * @dev initialize the base (= implementation) contract
     */
    constructor() initializer {} // solhint-disable no-empty-blocks

    /**
     * @notice Sets the owner of the contract and sets the SupportedStandards:LSP3UniversalProfile key
     * @param newOwner the owner of the contract
     */
    function initialize(address newOwner) public virtual initializer {
        UniversalProfileInitAbstract._initialize(newOwner);
    }
}
