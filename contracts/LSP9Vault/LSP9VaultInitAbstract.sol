// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";

// modules
import {OwnableUnset} from "@erc725/smart-contracts/contracts/utils/OwnableUnset.sol";
import {ERC725InitAbstract} from "@erc725/smart-contracts/contracts/ERC725InitAbstract.sol";
import {LSP9VaultCore, ClaimOwnership} from "./LSP9VaultCore.sol";

// constants
import {_INTERFACEID_LSP1} from "../LSP1UniversalReceiver/LSP1Constants.sol";
import {_INTERFACEID_LSP9, _LSP9_SUPPORTED_STANDARDS_KEY, _LSP9_SUPPORTED_STANDARDS_VALUE} from "../LSP9Vault/LSP9Constants.sol";
import {_INTERFACEID_CLAIM_OWNERSHIP} from "../Utils/IClaimOwnership.sol";

/**
 * @title Inheritable Proxy Implementation of LSP9Vault built on top of ERC725, LSP1UniversalReceiver
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev Could be owned by a UniversalProfile and able to register received asset with UniversalReceiverDelegateVault
 */
abstract contract LSP9VaultInitAbstract is ERC725InitAbstract, LSP9VaultCore {
    function _initialize(address _newOwner) internal virtual override onlyInitializing {
        ERC725InitAbstract._initialize(_newOwner);

        // set key SupportedStandards:LSP9Vault
        _setData(_LSP9_SUPPORTED_STANDARDS_KEY, _LSP9_SUPPORTED_STANDARDS_VALUE);

        _notifyVaultReceiver(_newOwner);
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
        override(ERC725InitAbstract, LSP9VaultCore)
        returns (bool)
    {
        return
            interfaceId == _INTERFACEID_LSP9 ||
            interfaceId == _INTERFACEID_LSP1 ||
            interfaceId == _INTERFACEID_CLAIM_OWNERSHIP ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @inheritdoc OwnableUnset
     */
    function transferOwnership(address newOwner) public virtual override(LSP9VaultCore, OwnableUnset) onlyOwner {
        ClaimOwnership._transferOwnership(newOwner);
    }

    /**
     * @dev Transfer the ownership and notify the vault sender and vault receiver
     */
    function claimOwnership() public virtual override {
        address previousOwner = owner();
        super.claimOwnership();

        _notifyVaultSender(previousOwner);
        _notifyVaultReceiver(msg.sender);
    }
}
