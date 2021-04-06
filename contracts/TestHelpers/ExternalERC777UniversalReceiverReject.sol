// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.0;

// interfaces
import "../_LSPs/ILSP1_UniversalReceiverDelegate.sol";

// modules
import "@openzeppelin/contracts/introspection/ERC165.sol";

contract ExternalERC777UniversalReceiverRejectTester is ERC165, ILSP1Delegate {

    bytes4 _INTERFACE_ID_LSP1DELEGATE = 0xc2d7bcc1;

    constructor() public {
        _registerInterface(_INTERFACE_ID_LSP1DELEGATE);
    }

    function universalReceiverDelegate(address, bytes32, bytes memory) external override returns(bytes32){
        require(false, "We reject everything");
        return "";
    }
}
