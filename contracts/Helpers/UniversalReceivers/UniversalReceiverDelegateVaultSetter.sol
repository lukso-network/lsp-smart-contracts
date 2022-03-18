// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

import "../../LSP1UniversalReceiver/ILSP1UniversalReceiverDelegate.sol";
import "../../LSP1UniversalReceiver/LSP1Constants.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";
import "@erc725/smart-contracts/contracts/ERC725Y.sol";

contract UniversalReceiverDelegateVaultSetter is ERC165Storage {
    constructor() {
        _registerInterface(_INTERFACEID_LSP1_DELEGATE);
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
