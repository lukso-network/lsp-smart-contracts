// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.4;

// interfaces
import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {ILSP1UniversalReceiver} from "../ILSP1UniversalReceiver.sol";
import {ILSP7DigitalAsset} from "../../LSP7DigitalAsset/ILSP7DigitalAsset.sol";

// modules
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";

// libraries
import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {LSP1Utils} from "../LSP1Utils.sol";
import {LSP2Utils} from "../../LSP2ERC725YJSONSchema/LSP2Utils.sol";
import {LSP5Utils} from "../../LSP5ReceivedAssets/LSP5Utils.sol";
import {LSP10Utils} from "../../LSP10ReceivedVaults/LSP10Utils.sol";

// constants
import "../LSP1Constants.sol";
import "../../LSP0ERC725Account/LSP0Constants.sol";
import "../../LSP6KeyManager/LSP6Constants.sol";
import "../../LSP9Vault/LSP9Constants.sol";
import "../../LSP10ReceivedVaults/LSP10Constants.sol";
import "../../LSP14Ownable2Step/LSP14Constants.sol";

// errors
import "../LSP1Errors.sol";

/**
 * @title Implementation of a UniversalReceiverDelegate for LSP0ERC725Account
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev This UniversalReceiverDelegate follows the {LSP1-UniversalReceiver} standards and is designed
 * for LSP0ERC725Account contracts.
 *
 * @dev Handles two cases:
 * - Registers the address of received assets (exclusively LSP7 and LSP8) and vaults (exclusively LSP9) according
 *   to {LSP5-ReceivedAssets} and {LSP10-ReceivedVaults} respectively
 *
 *   https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-5-ReceivedAssets.md
 *   https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-10-ReceivedVaults.md
 *
 * - Removes the address of registered assets and vaults when the full balance is sent from the LSP0ERC725Account contract
 *
 * Requirements:
 * - The contract should be able to setData the LSP5 and LSP10 data Keys according to the logic of the owner
 *    of the LSP0ERC725Account.
 *
 * For example, for contracts that are owned by an LSP6KeyManager, this contract should be granted
 * the SUPER/SETDATA and REENTRANCY Permission.
 *
 * Assets and Vaults that are compliant with this version of the UniversalReceiverDelegate are:
 *
 * - LSP7-DigitalAsset: https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md
 * - LSP8-IdentifiableDigitalAsset: https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md
 * - LSP9-Vault: https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-9-Vault.md
 */
contract LSP1UniversalReceiverDelegateUP is ERC165, ILSP1UniversalReceiver {
    using ERC165Checker for address;

    /**
     * @dev Handles two cases:
     * - Registers the address of received assets (exclusively LSP7 and LSP8) and vaults (exclusively LSP9) according
     *   to {LSP5-ReceivedAssets} and {LSP10-ReceivedVaults} respectively
     *
     * - Removes the address of registered assets and vaults when the full balance is sent from the LSP0ERC725Account contract
     *
     * Requirements:
     * - The contract should be able to setData the LSP5 and LSP10 data Keys according to the logic of the owner
     *    of the LSP0ERC725Account.
     *
     * - Cannot accept native tokens
     */
    function universalReceiver(
        bytes32 typeId,
        bytes memory /* data */
    ) public payable virtual returns (bytes memory result) {
        if (msg.value != 0) revert NativeTokensNotAccepted();

        // This contract acts like a UniversalReceiverDelegate of an LSP0ERC725Account where we append the
        // address and the value, sent to the universalReceiver function of the LSP0, to the msg.data
        // Check https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-0-ERC725Account.md#universalreceiver
        address notifier = address(bytes20(msg.data[msg.data.length - 52:]));

        // Get the supposed mapPrefix and interfaceId based on the typeID
        (bool invalid, bytes10 mapPrefix, bytes4 interfaceID, bool isReceiving) = LSP1Utils
            .getTransferDetails(typeId);

        // If it's a typeId different than LSP7/LSP8/LSP9 typeIds
        if (invalid) return "LSP1: typeId out of scope";

        // The notifier is supposed to be either the LSP7 or LSP8 or LSP9 contract
        // If it's EOA we revert to avoid registering the EOA as asset or vault (spam protection)
        // solhint-disable avoid-tx-origin
        if (notifier == tx.origin) revert CannotRegisterEOAsAsAssets(notifier);

        // if the contract being transferred doesn't support LSP9 interfaceId, do not register it as a received vault
        if (
            mapPrefix == _LSP10_VAULTS_MAP_KEY_PREFIX &&
            notifier.code.length > 0 &&
            !notifier.supportsERC165InterfaceUnchecked(_INTERFACEID_LSP9)
        ) {
            return "LSP1: not an LSP9Vault ownership transfer";
        }

        // Generate the LSP5ReceivedAssetsMap/LSP10VaultsMap based on the prefix and the notifier
        bytes32 notifierMapKey = LSP2Utils.generateMappingKey(mapPrefix, bytes20(notifier));

        // Query the ERC725Y storage of the LSP0-ERC725Account
        bytes memory notifierMapValue = IERC725Y(msg.sender).getData(notifierMapKey);

        bool isMapValueSet = bytes20(notifierMapValue) != bytes20(0);

        if (isReceiving) {
            // If the mapValue is set, we assume that all other data keys relevant to the asset/vault
            // are registered in the account, we don't need to re register the asset being received
            if (isMapValueSet) return "LSP1: asset received is already registered";

            return _whenReceiving(typeId, notifier, notifierMapKey, interfaceID);
        } else {
            // If the mapValue is not set, we assume that all other data keys relevant to the asset/vault
            // are not registered in the account, we cannot remove non-existing data keys for the asset being sent
            if (!isMapValueSet) return "LSP1: asset sent is not registered";
            // if the value under the `LSP5ReceivedAssetsMap:<asset-address>` or `LSP10VaultsMap:<vault-address>`
            // is not a valid tuple as `(bytes4,uint128)`
            if (notifierMapValue.length < 20) return "LSP1: asset data corrupted";

            return _whenSending(typeId, notifier, notifierMapKey, notifierMapValue);
        }
    }

    // --- Internal functions

    /**
     * @dev To avoid stack too deep error
     * Generate the keys/values of the asset/vault received to set and set them
     * on the account depending on the type of the transfer (asset/vault)
     */
    function _whenReceiving(
        bytes32 typeId,
        address notifier,
        bytes32 notifierMapKey,
        bytes4 interfaceID
    ) internal virtual returns (bytes memory) {
        bytes32[] memory dataKeys;
        bytes[] memory dataValues;

        // if it's a token transfer (LSP7/LSP8)
        if (typeId != _TYPEID_LSP9_OwnershipTransferred_RecipientNotification) {
            // if the amount sent is 0, then do not update the keys
            uint256 balance = ILSP7DigitalAsset(notifier).balanceOf(msg.sender);
            if (balance == 0) return "LSP1: balance not updated";

            (dataKeys, dataValues) = LSP5Utils.generateReceivedAssetKeys(
                msg.sender,
                notifier,
                notifierMapKey,
                interfaceID
            );

            // Set the LSP5 generated data keys on the account
            IERC725Y(msg.sender).setDataBatch(dataKeys, dataValues);
            return "";
        } else {
            (dataKeys, dataValues) = LSP10Utils.generateReceivedVaultKeys(
                msg.sender,
                notifier,
                notifierMapKey
            );

            // Set the LSP10 generated data keys on the account
            IERC725Y(msg.sender).setDataBatch(dataKeys, dataValues);
            return "";
        }
    }

    /**
     * @dev To avoid stack too deep error
     * Generate the keys/values of the asset/vault sent to set and set them
     * on the account depending on the type of the transfer (asset/vault)
     */
    function _whenSending(
        bytes32 typeId,
        address notifier,
        bytes32 notifierMapKey,
        bytes memory notifierMapValue
    ) internal virtual returns (bytes memory) {
        bytes32[] memory dataKeys;
        bytes[] memory dataValues;

        // if it's a token transfer (LSP7/LSP8)
        if (typeId != _TYPEID_LSP9_OwnershipTransferred_SenderNotification) {
            // if the amount sent is not the full balance, then do not update the keys
            uint256 balance = ILSP7DigitalAsset(notifier).balanceOf(msg.sender);
            if (balance != 0) return "LSP1: full balance is not sent";

            (dataKeys, dataValues) = LSP5Utils.generateSentAssetKeys(
                msg.sender,
                notifierMapKey,
                notifierMapValue
            );

            /**
             * `generateSentAssetKeys(...)` returns empty arrays in the following cases:
             * - the index returned from the data key `notifierMapKey` is bigger than
             * the length of the `LSP5ReceivedAssets[]`, meaning, index is out of bounds.
             */
            if (dataKeys.length == 0 && dataValues.length == 0) return "LSP1: asset data corrupted";

            // Set the LSP5 generated data keys on the account
            IERC725Y(msg.sender).setDataBatch(dataKeys, dataValues);
            return "";
        } else {
            (dataKeys, dataValues) = LSP10Utils.generateSentVaultKeys(
                msg.sender,
                notifierMapKey,
                notifierMapValue
            );

            /**
             * `generateSentAssetKeys(...)` returns empty arrays in the following cases:
             * - the index returned from the data key `notifierMapKey` is bigger than
             * the length of the `LSP10Vaults[]`, meaning, index is out of bounds.
             */
            if (dataKeys.length == 0 && dataValues.length == 0) return "LSP1: asset data corrupted";

            // Set the LSP10 generated data keys on the account
            IERC725Y(msg.sender).setDataBatch(dataKeys, dataValues);
            return "";
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
