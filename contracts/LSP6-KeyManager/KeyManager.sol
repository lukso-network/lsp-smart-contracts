// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.6;

import "./KeyManagerCore.sol";

contract KeyManager is KeyManagerCore {

    constructor(address _account) {
        account = ERC725(_account);
        _registerInterface(_INTERFACE_ID_LSP6);
    }
    
}