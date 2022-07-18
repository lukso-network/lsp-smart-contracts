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
    function _tokenAndVaultHandling(address caller, bytes32 typeId)
        internal
        returns (bytes memory result)
    {
        // avoid EOAs spamming the storage
        if (caller.code.length == 0) return "";

        address keyManager = ERC725Y(msg.sender).owner();
        if (!ERC165Checker.supportsERC165Interface(keyManager, _INTERFACEID_LSP6)) return "";

        address target = ILSP6KeyManager(keyManager).target();

        // check if the caller is the same account controlled by the keyManager
        if (msg.sender != target) return "";

        (
            bool isReceiving,
            bytes32 arrayLengthKey,
            bytes12 mapPrefix,
            bytes4 interfaceID
        ) = LSP1Utils.getTransferDetails(typeId);

        bytes32 mapKey = LSP2Utils.generateMappingKey(mapPrefix, bytes20(caller));
        bytes memory mapValue = IERC725Y(msg.sender).getData(mapKey);

        if (isReceiving) {
            // if the map value is already set, then do nothing
            if (bytes12(mapValue) != bytes12(0)) return "";

            result = LSP5Utils.addMapAndArrayKeyViaKeyManager(
                IERC725Y(msg.sender),
                arrayLengthKey,
                mapKey,
                caller,
                interfaceID,
                keyManager
            );
        } else {
            // if there is no map value for the asset to remove, then do nothing
            if (bytes12(mapValue) == bytes12(0)) return "";

            // if it's a token transfer (LSP7/LSP8)
            if (typeId != _TYPEID_LSP9_VAULTSENDER) {
                // if the amount sent is not the full balance, then do not remove the keys
                uint256 balance = ILSP7DigitalAsset(caller).balanceOf(msg.sender);
                if (balance != 0) return "";
            }

            result = LSP5Utils.removeMapAndArrayKeyViaKeyManager(
                IERC725Y(msg.sender),
                arrayLengthKey,
                mapPrefix,
                mapKey,
                mapValue,
                keyManager
            );
        }
    }
}
