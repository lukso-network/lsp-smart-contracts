// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

import "../../LSP1UniversalReceiver/ILSP1UniversalReceiverDelegate.sol";
import "../../LSP1UniversalReceiver/LSP1Constants.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

contract UniversalReceiverDelegateRevert is
    ILSP1UniversalReceiverDelegate,
    ERC165Storage
{
    constructor() {
        _registerInterface(_INTERFACEID_LSP1_DELEGATE);
    }

    /* solhint-disable no-unused-vars */
    function universalReceiverDelegate(
        address sender,
        bytes32 typeId,
        bytes memory data
    ) external pure override returns (bytes memory) {
        bytes memory funcData = abi.encodePacked(sender, typeId, data);
        revert("This Contract reverts");
    }
    /* solhint-enable */
}
