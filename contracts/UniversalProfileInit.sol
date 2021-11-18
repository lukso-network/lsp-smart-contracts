// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import "./UniversalProfileCore.sol";
import "@erc725/smart-contracts/contracts/ERC725AccountInit.sol";

/**
 * @title Proxy implementation of a LUKSO's Universal Profile based on LSP3
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Implementation of the ERC725Account + LSP1 universalReceiver
 */
contract UniversalProfileInit is Initializable, ERC725AccountInit, UniversalProfileCore {
    function initialize(address _newOwner) public virtual override {
        ERC725AccountInit.initialize(_newOwner);

        // set SupportedStandards:LSP3UniversalProfile
        bytes32 key = 0xeafec4d89fa9619884b6b89135626455000000000000000000000000abe425d6;
        bytes memory value = hex"abe425d6";

        store[key] = value;
        dataKeys.push(key);
        emit DataChanged(key, value);
    }

    function setData(bytes32[] memory _keys, bytes[] memory _values)
        public
        override(UniversalProfileCore, ERC725YCore)
        onlyOwner
    {
        UniversalProfileCore.setData(_keys, _values);
    }
}
