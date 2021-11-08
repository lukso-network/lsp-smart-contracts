// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.6;

// modules
import "./LSP6-KeyManagerCore.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

contract KeyManagerInit is Initializable, KeyManagerCore {

    function initialize(address _account) public initializer {
        account = ERC725(_account);
        _registerInterface(_INTERFACE_ID_LSP6);
    }
}