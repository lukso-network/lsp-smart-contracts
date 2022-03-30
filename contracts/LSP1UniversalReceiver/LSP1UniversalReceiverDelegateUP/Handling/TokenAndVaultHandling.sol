// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import "@erc725/smart-contracts/contracts/ERC725Y.sol";
import "../../../LSP6KeyManager/LSP6KeyManager.sol";

// interfaces
import "../../../LSP7DigitalAsset/ILSP7DigitalAsset.sol";

// libraries
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import "../../../LSP2ERC725YJSONSchema/LSP2Utils.sol";
import "../../../LSP5ReceivedAssets/LSP5Utils.sol";
import "../../LSP1Utils.sol";

// constants
import "../../LSP1Constants.sol";

/**
 * @dev Function logic to add and remove the MapAndArrayKey of incoming assets and vaults
 */
abstract contract TokenAndVaultHandling {

    // internal functions
    function _tokenAndVaultHandling(address sender, bytes32 typeId)
        internal
        returns (bytes memory result)
    {
        address keyManager = ERC725Y(msg.sender).owner();
        if (!ERC165Checker.supportsInterface(keyManager, _INTERFACEID_LSP6))
            return "";
        address accountAddress = address(LSP6KeyManager(keyManager).account());
        // check if the caller is the same account controlled by the keyManager
        if (msg.sender != accountAddress) return "";
        (
            bool senderHook,
            bytes32 arrayKey,
            bytes12 mapPrefix,
            bytes4 interfaceID
        ) = LSP1Utils.getTransferDetails(typeId);

        bytes32 mapKey = LSP2Utils.generateBytes20MappingWithGroupingKey(
            mapPrefix,
            bytes20(sender)
        );
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
                uint256 balance = ILSP7DigitalAsset(sender).balanceOf(
                    msg.sender
                );
                // if the amount sent is not the full balance, then do nothing
                if (balance != 0) return "";
            }
            result = LSP5Utils.removeMapAndArrayKeyViaKeyManager(
                IERC725Y(msg.sender),
                arrayKey,
                mapPrefix,
                mapKey,
                keyManager
            );
        }
    }
}
