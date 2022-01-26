// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import "./UniversalProfileInitAbstract.sol";

/**
 * @title Deployable Proxy implementation of a LUKSO's Universal Profile based on LSP3
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Implementation of the ERC725Account + LSP1 universalReceiver
 */
contract UniversalProfileInit is UniversalProfileInitAbstract {
    /**
     * @inheritdoc UniversalProfileInitAbstract
     */
    function initialize(address _newOwner) public virtual override initializer {
        UniversalProfileInitAbstract.initialize(_newOwner);
    }
}
