// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {
    IERC725Y
} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {
    ILSP1UniversalReceiverDelegate
} from "../ILSP1UniversalReceiverDelegate.sol";
import {ILSP7DigitalAsset} from "../../LSP7DigitalAsset/ILSP7DigitalAsset.sol";

// modules
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {Version} from "../../Version.sol";

// libraries
import {LSP5Utils} from "../../LSP5ReceivedAssets/LSP5Utils.sol";

// constants
import {_INTERFACEID_LSP1_DELEGATE} from "../LSP1Constants.sol";
import {
    _TYPEID_LSP7_TOKENSSENDER,
    _TYPEID_LSP7_TOKENSRECIPIENT,
    _INTERFACEID_LSP7
} from "../../LSP7DigitalAsset/LSP7Constants.sol";
import {
    _TYPEID_LSP8_TOKENSSENDER,
    _TYPEID_LSP8_TOKENSRECIPIENT,
    _INTERFACEID_LSP8
} from "../../LSP8IdentifiableDigitalAsset/LSP8Constants.sol";

// errors
import {CannotRegisterEOAsAsAssets} from "../LSP1Errors.sol";

/**
 * @title Implementation of a UniversalReceiverDelegate for the [LSP9Vault]
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev The {LSP1UniversalReceiverDelegateVault} follows the [LSP-1-UniversalReceiver] standard and is designed
 * for [LSP9Vault] contracts.
 *
 * The {LSP1UniversalReceiverDelegateVault} is a contract called by the {universalReceiver(...)} function of the [LSP-9-Vault] contract that:
 *
 * - Writes the data keys representing assets received from type [LSP-7-DigitalAsset] and [LSP-8-IdentifiableDigitalAsset] into the account storage, and removes them when the balance is zero according to the [LSP-5-ReceivedAssets] Standard.
 */
contract LSP1UniversalReceiverDelegateVault is
    ERC165,
    Version,
    ILSP1UniversalReceiverDelegate
{
    /**
     * @dev When receiving notifications about:
     * - LSP7 Tokens sent or received
     * - LSP8 Tokens sent or received
     * The notifier should be either the LSP7 or LSP8 contract.
     *
     * We revert to avoid registering the EOA as asset (spam protection)
     * if we received a typeId associated with tokens transfers.
     *
     * @param notifier The address that notified.
     */
    modifier notEOA(address notifier) {
        // solhint-disable-next-line avoid-tx-origin
        if (notifier == tx.origin) {
            revert CannotRegisterEOAsAsAssets(notifier);
        }
        _;
    }

    /**
     * @inheritdoc ILSP1UniversalReceiverDelegate
     * @dev Handles two cases:
     *
     * Writes the received [LSP-7-DigitalAsset] or [LSP-8-IdentifiableDigitalAsset] assets into the vault storage according to the [LSP-5-ReceivedAssets] standard.
     *
     * @notice Reacted on received notification with `typeId`.
     *
     * @custom:requirements Cannot accept native tokens.
     * @custom:info
     * - If some issues occured with generating the `dataKeys` or `dataValues` the `returnedMessage` will be an error message, otherwise it will be empty.
     * - If an error occured when trying to use `setDataBatch(dataKeys,dataValues)`, it will return the raw error data back to the caller.
     *
     * @param typeId Unique identifier for a specific notification.
     * @return The result of the reaction for `typeId`.
     */
    function universalReceiverDelegate(
        address notifier,
        uint256 /*value*/,
        bytes32 typeId,
        bytes memory /* data */
    ) public virtual override returns (bytes memory) {
        if (typeId == _TYPEID_LSP7_TOKENSSENDER) {
            return _tokenSender(notifier);
        }

        if (typeId == _TYPEID_LSP7_TOKENSRECIPIENT) {
            return _tokenRecipient(notifier, _INTERFACEID_LSP7);
        }

        if (typeId == _TYPEID_LSP8_TOKENSSENDER) {
            return _tokenSender(notifier);
        }

        if (typeId == _TYPEID_LSP8_TOKENSRECIPIENT) {
            return _tokenRecipient(notifier, _INTERFACEID_LSP8);
        }

        return "LSP1: typeId out of scope";
    }

    /**
     * @dev Handler for LSP7 and LSP8 token sender type id.
     *
     * @custom:info
     * - Tries to generate LSP5 data key/value pairs for removing asset from the ERC725Y storage.
     * - Tries to use `setDataBatch(bytes32[],bytes[])` if generated proper LSP5 data key/value pairs.
     * - Does not revert. But returns an error message. Use off-chain lib to get even more info.
     *
     * @param notifier The LSP7 or LSP8 token address.
     */
    function _tokenSender(
        address notifier
    ) internal notEOA(notifier) returns (bytes memory) {
        // if the amount sent is not the full balance, then do not update the keys
        try ILSP7DigitalAsset(notifier).balanceOf(msg.sender) returns (
            uint256 balance
        ) {
            if (balance != 0) {
                return "LSP1: full balance is not sent";
            }
        } catch {
            return "LSP1: `balanceOf(address)` function not found";
        }

        (bytes32[] memory dataKeys, bytes[] memory dataValues) = LSP5Utils
            .generateSentAssetKeys(msg.sender, notifier);

        // `generateSentAssetKeys(...)` returns empty arrays when encountering errors
        if (dataKeys.length == 0 && dataValues.length == 0) {
            return "LSP5: Error generating data key/value pairs";
        }

        // Set the LSP5 generated data keys on the account
        return _setDataBatchWithoutReverting(dataKeys, dataValues);
    }

    /**
     * @dev Handler for LSP7 and LSP8 token recipient type id.
     *
     * @custom:info
     * - Tries to generate LSP5 data key/value pairs for adding asset to the ERC725Y storage.
     * - Tries to use `setDataBatch(bytes32[],bytes[])` if generated proper LSP5 data key/value pairs.
     * - Does not revert. But returns an error message. Use off-chain lib to get even more info.
     *
     * @param notifier The LSP7 or LSP8 token address.
     * @param interfaceId The LSP7 or LSP8 interface id.
     */
    function _tokenRecipient(
        address notifier,
        bytes4 interfaceId
    ) internal notEOA(notifier) returns (bytes memory) {
        // CHECK balance only when the Token contract is already deployed,
        // not when tokens are being transferred on deployment through the `constructor`
        if (notifier.code.length != 0) {
            // if the amount sent is 0, then do not update the keys
            try ILSP7DigitalAsset(notifier).balanceOf(msg.sender) returns (
                uint256 balance
            ) {
                if (balance == 0) {
                    return "LSP1: balance is zero";
                }
            } catch {
                return "LSP1: `balanceOf(address)` function not found";
            }
        }

        (bytes32[] memory dataKeys, bytes[] memory dataValues) = LSP5Utils
            .generateReceivedAssetKeys(msg.sender, notifier, interfaceId);

        // `generateReceivedAssetKeys(...)` returns empty arrays when encountering errors
        if (dataKeys.length == 0 && dataValues.length == 0) {
            return "LSP5: Error generating data key/value pairs";
        }

        // Set the LSP5 generated data keys on the account
        return _setDataBatchWithoutReverting(dataKeys, dataValues);
    }

    /**
     * @dev Calls `bytes4(keccak256(setDataBatch(bytes32[],bytes[])))` without checking for `bool succes`, but it returns all the data back.
     *
     * @custom:info If an the low-level transaction revert, the returned data will be forwarded. Th contract that uses this function can use the `Address` library to revert with the revert reason.
     *
     * @param dataKeys Data Keys to be set.
     * @param dataValues Data Values to be set.
     */
    function _setDataBatchWithoutReverting(
        bytes32[] memory dataKeys,
        bytes[] memory dataValues
    ) internal returns (bytes memory) {
        try IERC725Y(msg.sender).setDataBatch(dataKeys, dataValues) {
            return "";
        } catch (bytes memory errorData) {
            return errorData;
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
            interfaceId == _INTERFACEID_LSP1_DELEGATE ||
            super.supportsInterface(interfaceId);
    }
}
