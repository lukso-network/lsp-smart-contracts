// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";

// modules
import {OwnableUnset} from "@erc725/smart-contracts/contracts/utils/OwnableUnset.sol";
import {ERC725} from "@erc725/smart-contracts/contracts/ERC725.sol";
import {LSP9VaultCore} from "./LSP9VaultCore.sol";

// constants
import {_INTERFACEID_LSP1} from "../LSP1UniversalReceiver/LSP1Constants.sol";
import {_INTERFACEID_LSP9, _LSP9_SUPPORTED_STANDARDS_KEY, _LSP9_SUPPORTED_STANDARDS_VALUE} from "../LSP9Vault/LSP9Constants.sol";

/**
 * @title Implementation of LSP9Vault built on top of ERC725, LSP1UniversalReceiver
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev Could be owned by a UniversalProfile and able to register received asset with UniversalReceiverDelegateVault
 */
contract LSP9Vault is ERC725, LSP9VaultCore {
    /**
     * @notice Sets the owner of the contract and sets the SupportedStandards:LSP9Vault key
     * @param _newOwner the owner of the contract
     */
    constructor(address _newOwner) ERC725(_newOwner) {
        // set key SupportedStandards:LSP9Vault
        _setData(_LSP9_SUPPORTED_STANDARDS_KEY, _LSP9_SUPPORTED_STANDARDS_VALUE);

        _notifyVaultReceiver(_newOwner);
    }

    /**
     * @inheritdoc OwnableUnset
     * @dev Transfer the ownership and notify the vault sender and vault receiver
     */
    function transferOwnership(address newOwner) public virtual override(LSP9VaultCore, OwnableUnset) onlyOwner {
        super.transferOwnership(newOwner);

        _notifyVaultSender(msg.sender);
        _notifyVaultReceiver(newOwner);
    }

    /**
     * @inheritdoc IERC725Y
     * @dev Sets data as bytes in the vault storage for a single key.
     * SHOULD only be callable by the owner of the contract set via ERC173
     * and the UniversalReceiverDelegate
     *
     * Emits a {DataChanged} event.
     */
    function setData(bytes32 _key, bytes memory _value) public virtual override onlyAllowed {
        _setData(_key, _value);
    }

    /**
     * @inheritdoc IERC725Y
     * @dev Sets array of data at multiple given `key`
     * SHOULD only be callable by the owner of the contract set via ERC173
     * and the UniversalReceiverDelegate
     *
     * Emits a {DataChanged} event.
     */
    function setData(bytes32[] memory _keys, bytes[] memory _values)
        public
        virtual
        override
        onlyAllowed
    {
        require(_keys.length == _values.length, "Keys length not equal to values length");
        for (uint256 i = 0; i < _keys.length; i++) {
            _setData(_keys[i], _values[i]);
        }
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC725, LSP9VaultCore)
        returns (bool)
    {
        return
            interfaceId == _INTERFACEID_LSP9 ||
            interfaceId == _INTERFACEID_LSP1 ||
            super.supportsInterface(interfaceId);
    }
}
