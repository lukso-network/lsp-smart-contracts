// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import "./LSP0ERC725Account/LSP0ERC725AccountInitAbstract.sol";

/**
 * @title Inheritable Proxy implementation of a LUKSO's Universal Profile based on LSP3
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Implementation of the ERC725Account + LSP1 universalReceiver
 */
abstract contract UniversalProfileInitAbstract is
    Initializable,
    LSP0ERC725AccountInitAbstract
{
    /**
     * @notice Sets the owner of the contract and sets the SupportedStandards:LSP3UniversalProfile key
     * @param _newOwner the owner of the contract
     */
    function initialize(address _newOwner)
        public
        virtual
        override
        onlyInitializing
    {
        LSP0ERC725AccountInitAbstract.initialize(_newOwner);

        // set SupportedStandards:LSP3UniversalProfile
        bytes32 key = 0xeafec4d89fa9619884b6b89135626455000000000000000000000000abe425d6;
        bytes memory value = hex"abe425d6";
        _setData(key, value);
    }
}
