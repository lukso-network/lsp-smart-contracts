// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// libraries
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {
    ERC165Checker
} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

// constants
import "./ILSP1UniversalReceiver.sol";
import {_INTERFACEID_LSP1} from "../LSP1UniversalReceiver/LSP1Constants.sol";
import "../LSP0ERC725Account/LSP0Constants.sol";
import "../LSP5ReceivedAssets/LSP5Constants.sol";
import "../LSP7DigitalAsset/LSP7Constants.sol";
import "../LSP8IdentifiableDigitalAsset/LSP8Constants.sol";
import "../LSP9Vault/LSP9Constants.sol";
import "../LSP14Ownable2Step/LSP14Constants.sol";
import "../LSP10ReceivedVaults/LSP10Constants.sol";

/**
 * @title LSP1 Utility library.
 * @author Jean Cavallera <CJ42>, Yamen Merhi <YamenMerhi>, Daniel Afteni <B00ste>
 * @dev LSP1Utils is a library of utility functions that can be used to notify the `universalReceiver` function of a contract
 * that implements LSP1 and retrieve informations related to LSP1 `typeId`.
 * Based on LSP1 Universal Receiver standard.
 */
library LSP1Utils {
    /**
     * @dev Notify a contract at `lsp1Implementation` address by calling its `universalReceiver` function if this contract
     * supports the LSP1 interface.
     *
     * @param lsp1Implementation The address of the contract to notify.
     * @param typeId A `bytes32` typeId.
     * @param data Any optional data to send to the `universalReceiver` function to the `lsp1Implementation` address.
     */
    function tryNotifyUniversalReceiver(
        address lsp1Implementation,
        bytes32 typeId,
        bytes memory data
    ) internal {
        if (
            ERC165Checker.supportsERC165InterfaceUnchecked(
                lsp1Implementation,
                _INTERFACEID_LSP1
            )
        ) {
            ILSP1UniversalReceiver(lsp1Implementation).universalReceiver(
                typeId,
                data
            );
        }
    }

    /**
     * @dev Call a LSP1UniversalReceiverDelegate contract at `universalReceiverDelegate` address and append `msgSender` and `msgValue`
     * as additional informations in the calldata.
     *
     * @param universalReceiverDelegate The address of the LSP1UniversalReceiverDelegate to delegate the `universalReceiver` function to.
     * @param typeId A `bytes32` typeId.
     * @param receivedData The data sent initially to the `universalReceiver` function.
     * @param msgSender The address that initially called the `universalReceiver` function.
     * @param msgValue The amount of native token received initially by the `universalReceiver` function.
     *
     * @return The data returned by the LSP1UniversalReceiverDelegate contract.
     */
    function callUniversalReceiverWithCallerInfos(
        address universalReceiverDelegate,
        bytes32 typeId,
        bytes calldata receivedData,
        address msgSender,
        uint256 msgValue
    ) internal returns (bytes memory) {
        bytes memory callData = abi.encodePacked(
            abi.encodeWithSelector(
                ILSP1UniversalReceiver.universalReceiver.selector,
                typeId,
                receivedData
            ),
            msgSender,
            msgValue
        );

        (bool success, bytes memory result) = universalReceiverDelegate.call(
            callData
        );
        Address.verifyCallResult(
            success,
            result,
            "Call to universalReceiver failed"
        );
        return result.length != 0 ? abi.decode(result, (bytes)) : result;
    }

    /**
     * @dev Gets all the transfer details based on the provided `bytes32 typeId`.
     *
     * @param typeId A `bytes32` unique identifier for a specific action or information.
     *
     * @return invalid `true` if the `typeId` was not recognised, `false otherwise.
     * @return mapPrefix The standard 10 bytes defined in a LSP standard associated with the specific `typeId`.
     * @return interfaceId The bytes4 ERC165 interface ID defined in a LSP standard associated with a specific `typeId`.
     * @return isReceiving When the typeId relate to LSP7/8 tokens or LSP9 Vaults, describe if the `typeId` relates
     * to receiving assets/vaults (`true`), or sending them (`false`).
     */
    function getTransferDetails(
        bytes32 typeId
    )
        internal
        pure
        returns (
            bool invalid,
            bytes10 mapPrefix,
            bytes4 interfaceId,
            bool isReceiving
        )
    {
        if (
            typeId == _TYPEID_LSP7_TOKENSSENDER ||
            typeId == _TYPEID_LSP7_TOKENSRECIPIENT
        ) {
            mapPrefix = _LSP5_RECEIVED_ASSETS_MAP_KEY_PREFIX;
            interfaceId = _INTERFACEID_LSP7;
            isReceiving = typeId == _TYPEID_LSP7_TOKENSRECIPIENT ? true : false;
        } else if (
            typeId == _TYPEID_LSP8_TOKENSSENDER ||
            typeId == _TYPEID_LSP8_TOKENSRECIPIENT
        ) {
            mapPrefix = _LSP5_RECEIVED_ASSETS_MAP_KEY_PREFIX;
            interfaceId = _INTERFACEID_LSP8;
            isReceiving = typeId == _TYPEID_LSP8_TOKENSRECIPIENT ? true : false;
        } else if (
            typeId == _TYPEID_LSP9_OwnershipTransferred_SenderNotification ||
            typeId == _TYPEID_LSP9_OwnershipTransferred_RecipientNotification
        ) {
            mapPrefix = _LSP10_VAULTS_MAP_KEY_PREFIX;
            interfaceId = _INTERFACEID_LSP9;
            isReceiving = (typeId ==
                _TYPEID_LSP9_OwnershipTransferred_RecipientNotification)
                ? true
                : false;
        } else {
            invalid = true;
        }
    }
}
