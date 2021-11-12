// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.6;

// modules
import "./LSP6KeyManagerCore.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract LSP6KeyManagerInit is Initializable, LSP6KeyManagerCore {

    function initialize(address _account) public initializer {
        account = ERC725(_account);
        _registerInterface(_INTERFACE_ID_LSP6);
    }
}