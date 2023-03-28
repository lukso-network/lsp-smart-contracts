// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.4;

// interfaces
import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {ILSP1UniversalReceiver} from "../ILSP1UniversalReceiver.sol";
import {ILSP7DigitalAsset} from "../../LSP7DigitalAsset/ILSP7DigitalAsset.sol";

// modules
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {ERC725Y} from "@erc725/smart-contracts/contracts/ERC725Y.sol";

// libraries
import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {LSP1Utils} from "../LSP1Utils.sol";
import {LSP2Utils} from "../../LSP2ERC725YJSONSchema/LSP2Utils.sol";
import {LSP5Utils} from "../../LSP5ReceivedAssets/LSP5Utils.sol";

// constants
import "../LSP1Constants.sol";
import "../../LSP9Vault/LSP9Constants.sol";

// errors
import "../LSP1Errors.sol";

/**
 * @title Core Implementation of contract writing the received LSP7 and LSP8 assets into your Vault using
 *        the LSP5-ReceivedAsset standard and removing the sent assets.
 *
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev Delegate contract of the initial universal receiver
 */
contract LSP1UniversalReceiverDelegateVault is ERC165, ILSP1UniversalReceiver {
    /**
     * @inheritdoc ILSP1UniversalReceiver
     * @dev allows to register arrayKeys and Map of incoming assets and remove after being sent
     * @return result The return value
     */
    function universalReceiver(
        bytes32 typeId,
        bytes memory /* data */
    ) public payable virtual returns (bytes memory result) {
        if (msg.value != 0) revert NativeTokensNotAccepted();
        // This contract acts like a UniversalReceiverDelegate of a Vault where we append the
        // address and the value, sent to the universalReceiver function of the LSP9, to the msg.data
        // Check https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-9-Vault.md#universalreceiver
        address notifier = address(bytes20(msg.data[msg.data.length - 52:]));

        (bool invalid, bytes10 mapPrefix, bytes4 interfaceID, bool isReceiving) = LSP1Utils
            .getTransferDetails(typeId);

        if (invalid || interfaceID == _INTERFACEID_LSP9) return "LSP1: typeId out of scope";

        // solhint-disable avoid-tx-origin
        if (notifier == tx.origin) revert CannotRegisterEOAsAsAssets(notifier);

        bytes32 notifierMapKey = LSP2Utils.generateMappingKey(mapPrefix, bytes20(notifier));
        bytes memory notifierMapValue = IERC725Y(msg.sender).getData(notifierMapKey);

        bytes32[] memory dataKeys;
        bytes[] memory dataValues;

        if (isReceiving) {
            // if the map value is already set, then do nothing
            if (bytes20(notifierMapValue) != bytes20(0))
                return "URD: asset received is already registered";

            // if the amount sent is 0, then do not update the keys
            uint256 balance = ILSP7DigitalAsset(notifier).balanceOf(msg.sender);
            if (balance == 0) return "LSP1: balance not updated";

            (dataKeys, dataValues) = LSP5Utils.generateReceivedAssetKeys(
                msg.sender,
                notifier,
                notifierMapKey,
                interfaceID
            );

            IERC725Y(msg.sender).setData(dataKeys, dataValues);
        } else {
            // if there is no map value for the asset to remove, then do nothing
            if (bytes20(notifierMapValue) == bytes20(0))
                return "LSP1: asset sent is not registered";
            // if it's a token transfer (LSP7/LSP8)
            uint256 balance = ILSP7DigitalAsset(notifier).balanceOf(msg.sender);
            if (balance != 0) return "LSP1: full balance is not sent";
            // if the value under the `LSP5ReceivedAssetsMap:<asset-address>`
            // is not a valid tuple as `(bytes4,uint128)`
            if (notifierMapValue.length < 20) return "LSP1: asset data corrupted";

            (dataKeys, dataValues) = LSP5Utils.generateSentAssetKeys(
                msg.sender,
                notifierMapKey,
                notifierMapValue
            );

            /**
             * `generateSentAssetKeys(...)` returns empty arrays in the following cases:
             * - the index returned from the data key `notifierMapKey` is bigger than
             * the length of the `LSP5ReceivedAssets[]`, meaning, index is out of bounds.
             * - the address used to construct the `notifierMapKey` data key is different
             * than the address retrieved from the `LSP5ReceivedAssets[index]` data key. The index
             * is uint128(notifierMapValue[4:])
             */
            if (dataKeys.length == 0 && dataValues.length == 0) return "LSP1: asset data corrupted";

            IERC725Y(msg.sender).setData(dataKeys, dataValues);
        }
    }

    // --- Overrides

    /**
     * @inheritdoc ERC165
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == _INTERFACEID_LSP1 || super.supportsInterface(interfaceId);
    }
}
