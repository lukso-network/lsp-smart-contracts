// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.6;

import "./KeyManagerCore.sol";

contract KeyManager is KeyManagerCore {

    constructor(address _account) {
        account = ERC725Y(_account);
        // todo register interface id for KeyManager
    }
    
}