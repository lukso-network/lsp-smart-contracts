// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// libraries
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

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

library LSP1Utils {
    function tryNotifyUniversalReceiver(
        address lsp1Implementation,
        bytes32 typeId,
        bytes memory data
    ) internal {
        if (ERC165Checker.supportsERC165InterfaceUnchecked(lsp1Implementation, _INTERFACEID_LSP1)) {
            ILSP1UniversalReceiver(lsp1Implementation).universalReceiver(typeId, data);
        }
    }

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

        (bool success, bytes memory result) = universalReceiverDelegate.call(callData);
        Address.verifyCallResult(success, result, "Call to universalReceiver failed");
        return result.length != 0 ? abi.decode(result, (bytes)) : result;
    }

    /**
     * @dev Gets all the transfer details depending on the `typeId`
     * @param typeId A unique identifier for a specific action
     */
    function getTransferDetails(bytes32 typeId)
        internal
        pure
        returns (
            bool invalid,
            bytes10 mapPrefix,
            bytes4 interfaceId,
            bool isReceiving
        )
    {
        if (typeId == _TYPEID_LSP7_TOKENSSENDER || typeId == _TYPEID_LSP7_TOKENSRECIPIENT) {
            mapPrefix = _LSP5_RECEIVED_ASSETS_MAP_KEY_PREFIX;
            interfaceId = _INTERFACEID_LSP7;
            isReceiving = typeId == _TYPEID_LSP7_TOKENSRECIPIENT ? true : false;
        } else if (typeId == _TYPEID_LSP8_TOKENSSENDER || typeId == _TYPEID_LSP8_TOKENSRECIPIENT) {
            mapPrefix = _LSP5_RECEIVED_ASSETS_MAP_KEY_PREFIX;
            interfaceId = _INTERFACEID_LSP8;
            isReceiving = typeId == _TYPEID_LSP8_TOKENSRECIPIENT ? true : false;
        } else if (
            typeId == _TYPEID_LSP9_OwnershipTransferred_SenderNotification ||
            typeId == _TYPEID_LSP9_OwnershipTransferred_RecipientNotification
        ) {
            mapPrefix = _LSP10_VAULTS_MAP_KEY_PREFIX;
            interfaceId = _INTERFACEID_LSP9;
            isReceiving = (typeId == _TYPEID_LSP9_OwnershipTransferred_RecipientNotification)
                ? true
                : false;
        } else {
            invalid = true;
        }
    }
}
