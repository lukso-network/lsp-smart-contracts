// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import "@erc725/smart-contracts/contracts/ERC725.sol";
import "./LSP9VaultCore.sol";

// constants
import "../LSP1UniversalReceiver/LSP1Constants.sol";

/**
 * @title Implementation of LSP9Vault built on top of ERC725, LSP1UniversalReceiver
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev Could be owned by a UniversalProfile and able to register received asset with UniversalReceiverDelegateVault
 */
contract LSP9Vault is LSP9VaultCore, ERC725 {
    /**
     * @notice Sets the owner of the contract and sets the SupportedStandards:LSP9Vault key and register
     * LSP1UniversalReceiver and LSP9Vault InterfaceId
     * @param _newOwner the owner of the contract
     */
    constructor(address _newOwner) ERC725(_newOwner) {
        // set key SupportedStandards:LSP9Vault
        _setData(
            _LSP9_SUPPORTED_STANDARDS_KEY, 
            _LSP9_SUPPORTED_STANDARDS_VALUE
        );

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
