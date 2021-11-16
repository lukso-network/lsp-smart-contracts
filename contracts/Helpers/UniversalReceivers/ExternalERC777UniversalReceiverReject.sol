// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import "../../LSP1UniversalReceiver/ILSP1UniversalReceiverDelegate.sol";

// modules
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

contract ExternalERC777UniversalReceiverRejectTester is ERC165Storage, ILSP1UniversalReceiverDelegate {

    bytes4 internal constant _INTERFACE_ID_LSP1DELEGATE = 0xc2d7bcc1;

    constructor() {
        _registerInterface(_INTERFACE_ID_LSP1DELEGATE);
    }

    function universalReceiverDelegate(address, bytes32, bytes memory) external pure override returns(bytes memory){
        require(false, "We reject everything");
        return "";
    }
}