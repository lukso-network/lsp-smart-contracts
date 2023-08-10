// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.4;

// interfaces
import {
    IERC725Y
} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {ILSP1UniversalReceiver} from "../ILSP1UniversalReceiver.sol";
import {ILSP7DigitalAsset} from "../../LSP7DigitalAsset/ILSP7DigitalAsset.sol";

// modules
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";

// libraries
import {
    ERC165Checker
} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
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
 * @title Implementation of a UniversalReceiverDelegate for the [LSP-0-ERC725Account]
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev The {LSP1UniversalReceiverDelegateUP} follows the [LSP-1-UniversalReceiver] standard and is designed
 * for [LSP-0-ERC725Account] contracts.
 *
 * The {LSP1UniversalReceiverDelegateUP} is a contract called by the {universalReceiver(...)} function of the [LSP-0-ERC725Account] contract that:
 *
 * - Writes the data keys representing assets received from type [LSP-7-DigitalAsset] and [LSP-8-IdentifiableDigitalAsset] into the account storage, and removes them when the balance is zero according to the [LSP-5-ReceivedAssets] Standard.
 * - Writes the data keys representing the owned vaults from type [LSP-9-Vault] into your account storage, and removes them when transferring ownership to other accounts according to the [LSP-10-ReceivedVaults] Standard.
 *
 */
contract LSP1UniversalReceiverDelegateUP is ERC165, ILSP1UniversalReceiver {
    using ERC165Checker for address;

    /**
     * @dev
     * 1. Writes the data keys of the received [LSP-7-DigitalAsset], [LSP-8-IdentifiableDigitalAsset] and [LSP-9-Vault] contract addresses into the account storage according to the [LSP-5-ReceivedAssets] and [LSP-10-ReceivedVaults] Standard.
     * 2. The data keys representing an asset/vault are cleared when the asset/vault is no longer owned by the account.
     *
     * @notice Reacted on received notification with `typeId`.
     *
     * @custom:warning When the data stored in the ERC725Y storage of the LSP0 contract is corrupted (_e.g: ([LSP-5-ReceivedAssets]'s Array length not 16 bytes long, the token received is already registered in `LSP5ReceivetAssets[]`, the token being sent is not sent as full balance, etc...), the function call will still pass and return (**not revert!**) and not modify any data key on the storage of the [LSP-0-ERC725Account].
     *
     * @custom:requirements
     * - This contract should be allowed to use the {setDataBatch(...)} function in order to update the LSP5 and LSP10 Data Keys.
     * - Cannot accept native tokens
     *
     * @param typeId Unique identifier for a specific notification.
     * @return result The result of the reaction for `typeId`.
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
        (
            bool invalid,
            bytes10 mapPrefix,
            bytes4 interfaceID,
            bool isReceiving
        ) = LSP1Utils.getTransferDetails(typeId);

        // If it's a typeId different than LSP7/LSP8/LSP9 typeIds
        if (invalid) return "LSP1: typeId out of scope";

        // The notifier is supposed to be either the LSP7 or LSP8 or LSP9 contract
        // If it's EOA we revert to avoid registering the EOA as asset or vault (spam protection)
        // solhint-disable avoid-tx-origin
        if (notifier == tx.origin) revert CannotRegisterEOAsAsAssets(notifier);

        // Generate the LSP5ReceivedAssetsMap/LSP10VaultsMap based on the prefix and the notifier
        bytes32 notifierMapKey = LSP2Utils.generateMappingKey(
            mapPrefix,
            bytes20(notifier)
        );

        // Query the ERC725Y storage of the LSP0-ERC725Account
        bytes memory notifierMapValue = IERC725Y(msg.sender).getData(
            notifierMapKey
        );

        bool isMapValueSet = bytes20(notifierMapValue) != bytes20(0);

        if (isReceiving) {
            // If the mapValue is set, we assume that all other data keys relevant to the asset/vault
            // are registered in the account, we don't need to re register the asset being received
            if (isMapValueSet)
                return "LSP1: asset received is already registered";

            return
                _whenReceiving(typeId, notifier, notifierMapKey, interfaceID);
        } else {
            // If the mapValue is not set, we assume that all other data keys relevant to the asset/vault
            // are not registered in the account, we cannot remove non-existing data keys for the asset being sent
            if (!isMapValueSet) return "LSP1: asset sent is not registered";

            // if the value under the `LSP5ReceivedAssetsMap:<asset-address>` or `LSP10VaultsMap:<vault-address>`
            // is not a valid tuple as `(bytes4,uint128)`
            if (notifierMapValue.length < 20)
                return "LSP1: asset data corrupted";

            // Identify where the asset/vault is located in the `LSP5ReceivedAssets[]` / `LSP10Vaults[]` Array
            // by extracting the index from the tuple value `(bytes4,uint128)`
            // fetched under the `LSP5ReceivedAssetsMap` / `LSP10VaultsMap` data key
            uint128 arrayIndex = uint128(uint160(bytes20(notifierMapValue)));

            return _whenSending(typeId, notifier, notifierMapKey, arrayIndex);
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
            // CHECK balance only when the Token contract is already deployed,
            // not when tokens are being transferred on deployment through the `constructor`
            if (notifier.code.length > 0) {
                // if the amount sent is 0, then do not update the keys
                uint256 balance = ILSP7DigitalAsset(notifier).balanceOf(
                    msg.sender
                );
                if (balance == 0) return "LSP1: balance not updated";
            }

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
        uint128 arrayIndex
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
                arrayIndex
            );

            /**
             * `generateSentAssetKeys(...)` returns empty arrays in the following cases:
             * - the index returned from the data key `notifierMapKey` is bigger than
             * the length of the `LSP5ReceivedAssets[]`, meaning, index is out of bounds.
             */
            if (dataKeys.length == 0 && dataValues.length == 0)
                return "LSP1: asset data corrupted";

            // Set the LSP5 generated data keys on the account
            IERC725Y(msg.sender).setDataBatch(dataKeys, dataValues);
            return "";
        } else {
            (dataKeys, dataValues) = LSP10Utils.generateSentVaultKeys(
                msg.sender,
                notifierMapKey,
                arrayIndex
            );

            /**
             * `generateSentAssetKeys(...)` returns empty arrays in the following cases:
             * - the index returned from the data key `notifierMapKey` is bigger than
             * the length of the `LSP10Vaults[]`, meaning, index is out of bounds.
             */
            if (dataKeys.length == 0 && dataValues.length == 0)
                return "LSP1: asset data corrupted";

            // Set the LSP10 generated data keys on the account
            IERC725Y(msg.sender).setDataBatch(dataKeys, dataValues);
            return "";
        }
    }

    // --- Overrides

    /**
     * @inheritdoc ERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return
            interfaceId == _INTERFACEID_LSP1 ||
            super.supportsInterface(interfaceId);
    }
}
