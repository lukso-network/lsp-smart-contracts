// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// interfaces
import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {ILSP7DigitalAsset} from "../../../LSP7DigitalAsset/ILSP7DigitalAsset.sol";
import {ILSP6KeyManager} from "../../../LSP6KeyManager/ILSP6KeyManager.sol";

// libraries
import {ERC165Checker} from "../../../Custom/ERC165Checker.sol";
import {LSP1Utils} from "../../LSP1Utils.sol";
import {LSP2Utils} from "../../../LSP2ERC725YJSONSchema/LSP2Utils.sol";
import {LSP5Utils} from "../../../LSP5ReceivedAssets/LSP5Utils.sol";

// modules
import {ERC725Y} from "@erc725/smart-contracts/contracts/ERC725Y.sol";
import {LSP6KeyManager} from "../../../LSP6KeyManager/LSP6KeyManager.sol";

// constants
import {_INTERFACEID_LSP6} from "../../../LSP6KeyManager/LSP6Constants.sol";
import {_TYPEID_LSP9_VAULTSENDER} from "../../../LSP9Vault/LSP9Constants.sol";

/**
 * @dev Function logic to add and remove the MapAndArrayKey of incoming assets and vaults
 */
abstract contract TokenAndVaultHandling {
    // internal functions
    function _tokenAndVaultHandling(address sender, bytes32 typeId)
        internal
        returns (bytes memory result)
    {
        if (sender.code.length == 0) return "";

        address keyManager = ERC725Y(msg.sender).owner();
        if (!ERC165Checker.supportsERC165Interface(keyManager, _INTERFACEID_LSP6)) return "";

        address target = ILSP6KeyManager(keyManager).target();

        // check if the caller is the same account controlled by the keyManager
        if (msg.sender != target) return "";
        (bool senderHook, bytes32 arrayKey, bytes12 mapPrefix, bytes4 interfaceID) = LSP1Utils
            .getTransferDetails(typeId);

        bytes32 mapKey = LSP2Utils.generateMappingKey(mapPrefix, bytes20(sender));
        bytes memory mapValue = IERC725Y(msg.sender).getData(mapKey);

        if (!senderHook) {
            // if the map is already set, then do nothing
            if (bytes12(mapValue) != bytes12(0)) return "";
            result = LSP5Utils.addMapAndArrayKeyViaKeyManager(
                IERC725Y(msg.sender),
                arrayKey,
                mapKey,
                sender,
                interfaceID,
                keyManager
            );
        } else if (senderHook) {
            // if there is no map for the asset to remove, then do nothing
            if (bytes12(mapValue) == bytes12(0)) return "";
            if (typeId != _TYPEID_LSP9_VAULTSENDER) {
                uint256 balance = ILSP7DigitalAsset(sender).balanceOf(msg.sender);
                // if the amount sent is not the full balance, then do nothing
                if (balance != 0) return "";
            }
            result = LSP5Utils.removeMapAndArrayKeyViaKeyManager(
                IERC725Y(msg.sender),
                arrayKey,
                mapPrefix,
                mapKey,
                mapValue,
                keyManager
            );
        }
    }
}
