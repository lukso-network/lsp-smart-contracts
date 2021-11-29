// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

import "../../LSP1UniversalReceiver/ILSP1UniversalReceiverDelegate.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";
import "@erc725/smart-contracts/contracts/ERC725Y.sol";

contract URDVaultSetter is ERC165Storage {
    bytes4 private constant _INTERFACE_ID_LSP1DELEGATE = 0xc2d7bcc1;

    constructor() {
        _registerInterface(_INTERFACE_ID_LSP1DELEGATE);
    }

    function universalReceiverDelegate(
        address vaultadd,
        bytes32 key,
        bytes memory value
    ) external {
        bytes32[] memory keys = new bytes32[](1);
        bytes[] memory values = new bytes[](1);

        keys[0] = key;
        values[0] = value;
        IERC725Y(vaultadd).setData(keys, values);
    }
}
