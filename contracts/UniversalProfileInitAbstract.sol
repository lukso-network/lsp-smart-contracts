// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {LSP0ERC725AccountInitAbstract} from "./LSP0ERC725Account/LSP0ERC725AccountInitAbstract.sol";

/**
 * @title Inheritable Proxy implementation of a LUKSO's Universal Profile based on LSP3
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Implementation of the ERC725Account + LSP1 universalReceiver
 */
abstract contract UniversalProfileInitAbstract is LSP0ERC725AccountInitAbstract {
    function _initialize(address _newOwner) internal virtual override onlyInitializing {
        LSP0ERC725AccountInitAbstract._initialize(_newOwner);

        // set key SupportedStandards:LSP3UniversalProfile
        bytes32 key = 0xeafec4d89fa9619884b60000abe425d64acd861a49b8ddf5c0b6962110481f38;
        bytes memory value = hex"abe425d6";
        _setData(key, value);
    }
}
