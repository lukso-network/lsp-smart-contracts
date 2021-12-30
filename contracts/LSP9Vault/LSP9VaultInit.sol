// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import "@erc725/smart-contracts/contracts/ERC725Init.sol";
import "./LSP9VaultCore.sol";

/**
 * @title Proxy Implementation of LSP9Vault built on top of ERC725, LSP1UniversalReceiver
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev Could be owned by a UniversalProfile and able to register received asset with UniversalReceiverDelegateVault
 */
contract LSP9VaultInit is LSP9VaultCore, ERC725Init {
    /**
     * @notice Sets the owner of the contract and sets the SupportedStandards:LSP9Vault key and register
     * LSP1UniversalReceiver and LSP9Vault InterfaceId
     * @param _newOwner the owner of the contract
     */
    function initialize(address _newOwner) public override initializer {
        ERC725Init.initialize(_newOwner);

        // set SupportedStandards:LSP9Vault
        bytes32 key = 0xeafec4d89fa9619884b6b891356264550000000000000000000000007c0334a1;
        bytes memory value = hex"7c0334a1";
        _setData(key, value);

        _notifyVaultReceiver(_newOwner);

        _registerInterface(_INTERFACEID_LSP1);
        _registerInterface(_INTERFACEID_LSP9);
    }

    /**
     * @inheritdoc OwnableUnset
     */
    function transferOwnership(address newOwner)
        public
        override(OwnableUnset, LSP9VaultCore)
        onlyOwner
    {
        LSP9VaultCore.transferOwnership(newOwner);
    }

    /**
     * @inheritdoc LSP9VaultCore
     */
    function setData(bytes32[] memory _keys, bytes[] memory _values)
        public
        virtual
        override(ERC725YCore, LSP9VaultCore)
        onlyAllowed
    {
        LSP9VaultCore.setData(_keys, _values);
    }
}
