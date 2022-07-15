// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// interfaces
import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {ILSP7DigitalAsset} from "../../../LSP7DigitalAsset/ILSP7DigitalAsset.sol";

// libraries
import {ERC165Checker} from "../../../Custom/ERC165Checker.sol";
import {LSP1Utils} from "../../LSP1Utils.sol";
import {LSP2Utils} from "../../../LSP2ERC725YJSONSchema/LSP2Utils.sol";
import {LSP5Utils} from "../../../LSP5ReceivedAssets/LSP5Utils.sol";

// modules
import {ERC725Y} from "@erc725/smart-contracts/contracts/ERC725Y.sol";
import {LSP6KeyManager} from "../../../LSP6KeyManager/LSP6KeyManager.sol";

// constants
import "../../LSP1Constants.sol";
import "../../../LSP9Vault/LSP9Constants.sol";

/**
 * @dev Function logic to add and remove the MapAndArrayKey of incoming assets and vaults
 */
abstract contract TokenHandling {
    function _tokenHandling(address caller, bytes32 typeId) internal returns (bytes memory result) {
        // avoid EOAs spamming the storage
        if (caller.code.length == 0) return "";

        if (!ERC165Checker.supportsERC165Interface(msg.sender, _INTERFACEID_LSP9)) return "";

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

            (bytes32[] memory receiverDataKeys, bytes[] memory receiverDataValues) = LSP5Utils
                .addMapAndArrayKey(
                    IERC725Y(msg.sender),
                    arrayLengthKey,
                    mapKey,
                    caller,
                    interfaceID
                );

            IERC725Y(msg.sender).setData(receiverDataKeys, receiverDataValues);
        } else {
            // if there is no map value for the asset to remove, then do nothing
            if (bytes12(mapValue) == bytes12(0)) return "";

            // if the amount sent is not the full balance, then do not remove the keys
            uint256 balance = ILSP7DigitalAsset(caller).balanceOf(msg.sender);
            if (balance != 0) return "";

            (bytes32[] memory senderDataKeys, bytes[] memory senderDataValues) = LSP5Utils
                .removeMapAndArrayKey(
                    IERC725Y(msg.sender),
                    arrayLengthKey,
                    mapPrefix,
                    mapKey,
                    mapValue
                );

            IERC725Y(msg.sender).setData(senderDataKeys, senderDataValues);
        }
    }
}
