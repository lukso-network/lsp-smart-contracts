// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.6;

import "./KeyManagerCore.sol";

// modules
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract KeyManagerInit is KeyManagerCore, Initializable {

    function initialize(address _account) public initializer {
        account = ERC725Y(_account);
        // todo register interface id for KeyManager
    }
}