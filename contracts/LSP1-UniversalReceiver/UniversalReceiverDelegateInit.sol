// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

import "./UniversalReceiverDelegateCore.sol";

contract UniversalReceiverDelegateInit is Initializable, UniversalReceiverDelegateCore {
    function initialize() public initializer {
        _registerInterface(_INTERFACE_ID_LSP1DELEGATE);
    }
}