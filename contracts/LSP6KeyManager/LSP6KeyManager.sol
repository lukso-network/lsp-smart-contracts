// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.6;

// modules
import "./LSP6KeyManagerCore.sol";

contract LSP6KeyManager is LSP6KeyManagerCore {

    constructor(address _account) {
        account = ERC725(_account);
        _registerInterface(_INTERFACE_ID_LSP6);
    }
    
}