// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";

// modules
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {LSP9VaultCore} from "./LSP9VaultCore.sol";

// libraries
import {LSP1Utils} from "../LSP1UniversalReceiver/LSP1Utils.sol";

// constants
import {_INTERFACEID_LSP1} from "../LSP1UniversalReceiver/LSP1Constants.sol";
import {
    _INTERFACEID_LSP9,
    _LSP9_SUPPORTED_STANDARDS_KEY,
    _LSP9_SUPPORTED_STANDARDS_VALUE,
    _TYPEID_LSP9_OwnershipTransferred_RecipientNotification
} from "../LSP9Vault/LSP9Constants.sol";

/**
 * @title Inheritable Proxy Implementation of LSP9Vault built on top of ERC725, LSP1UniversalReceiver
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev Could be owned by a UniversalProfile and able to register received asset with UniversalReceiverDelegateVault
 */
abstract contract LSP9VaultInitAbstract is Initializable, LSP9VaultCore {
    using LSP1Utils for address;

    function _initialize(address newOwner) internal virtual onlyInitializing {
        if (msg.value != 0) emit ValueReceived(msg.sender, msg.value);
        OwnableUnset._setOwner(newOwner);

        // set key SupportedStandards:LSP9Vault
        _setData(_LSP9_SUPPORTED_STANDARDS_KEY, _LSP9_SUPPORTED_STANDARDS_VALUE);

        newOwner.tryNotifyUniversalReceiver(
            _TYPEID_LSP9_OwnershipTransferred_RecipientNotification,
            ""
        );
    }
}
