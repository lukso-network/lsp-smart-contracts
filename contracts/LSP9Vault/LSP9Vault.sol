// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import "@erc725/smart-contracts/contracts/ERC725.sol";
import "./LSP9VaultCore.sol";

// constants
import "../LSP1UniversalReceiver/LSP1Constants.sol";

contract LSP9Vault is LSP9VaultCore, ERC725 {
    constructor(address _newOwner) ERC725(_newOwner) {
        // set SupportedStandards:LSP9Vault
        bytes32 key = 0xeafec4d89fa9619884b6b891356264550000000000000000000000007c0334a1;
        bytes memory value = hex"7c0334a1";
        store[key] = value;
        emit DataChanged(key, value);

        _notifyVaultReceiver(_newOwner);

        _registerInterface(_INTERFACEID_LSP1);
        _registerInterface(_INTERFACEID_LSP9);
    }

    function transferOwnership(address newOwner)
        public
        override(OwnableUnset, LSP9VaultCore)
        onlyOwner
    {
        LSP9VaultCore.transferOwnership(newOwner);
    }

    function setData(bytes32[] memory _keys, bytes[] memory _values)
        public
        virtual
        override(ERC725YCore, LSP9VaultCore)
        onlyAllowed
    {
        LSP9VaultCore.setData(_keys, _values);
    }
}
