// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./UniversalProfileCore.sol";

// modules
import "../submodules/ERC725/implementations/contracts/ERC725/ERC725AccountInit.sol";

/**
 * @title Proxy implementation of a LUKSO's Universal Profile based on LSP3
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Implementation of the ERC725Account + LSP1 universalReceiver
 */
contract UniversalProfileInit is Initializable, ERC725AccountInit, UniversalProfileCore {

    function initialize(address _newOwner) virtual override public {
        ERC725AccountInit.initialize(_newOwner);

        // set SupportedStandards:LSP3UniversalProfile
        bytes32 key = 0xeafec4d89fa9619884b6b89135626455000000000000000000000000abe425d6;
        store[key] = abi.encodePacked(bytes4(0xabe425d6));
        dataKeys.push(key);
        emit DataChanged(key, store[key]);
    }

    function execute(
        uint256 _operation,
        address _to,
        uint256 _value,
        bytes calldata _data
    ) public payable virtual override(ERC725AccountInit, ERC725XCore) onlyOwner returns(bytes memory result) {
        result = ERC725AccountInit.execute(_operation,_to,_value,_data);
    }

    function setData(bytes32[] calldata _keys, bytes[] calldata _values)
        public
        override(UniversalProfileCore, ERC725AccountInit)
        onlyOwner
    {
        UniversalProfileCore.setData(_keys, _values);
    }

}