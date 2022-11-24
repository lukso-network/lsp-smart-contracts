// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// constants
import "./LSP1Constants.sol";
import "../LSP5ReceivedAssets/LSP5Constants.sol";
import "../LSP7DigitalAsset/LSP7Constants.sol";
import "../LSP8IdentifiableDigitalAsset/LSP8Constants.sol";
import "../LSP9Vault/LSP9Constants.sol";
import "../LSP14Ownable2Step/LSP14Constants.sol";
import "../LSP10ReceivedVaults/LSP10Constants.sol";

library LSP1Utils {
    function callUniversalReceiverAppended(
        address universalReceiverDelegate,
        bytes32 typeId,
        bytes calldata receivedData,
        address msgSender,
        uint256 msgValue
    ) internal returns (bytes memory) {
        bytes memory callData = abi.encodePacked(
            abi.encodeWithSelector(_LSP1_UNIVERSALRECEIVER_SELECTOR, typeId, receivedData),
            msgSender,
            msgValue
        );

        // solhint-disable avoid-low-level-calls
        (bool success, bytes memory result) = universalReceiverDelegate.call(callData);
        if (!success) _revert(result);
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
            typeId == _TYPEID_LSP14_OwnershipTransferred_SenderNotification ||
            typeId == _TYPEID_LSP14_OwnershipTransferred_RecipientNotification
        ) {
            mapPrefix = _LSP10_VAULTS_MAP_KEY_PREFIX;
            interfaceId = _INTERFACEID_LSP9;
            isReceiving = typeId == _TYPEID_LSP14_OwnershipTransferred_RecipientNotification
                ? true
                : false;
        } else {
            invalid = true;
        }
    }

    function _revert(bytes memory returndata) private pure returns (bytes memory) {
        // Look for revert reason and bubble it up if present
        if (returndata.length > 0) {
            // The easiest way to bubble the revert reason is using memory via assembly
            // solhint-disable no-inline-assembly
            /// @solidity memory-safe-assembly
            assembly {
                let returndata_size := mload(returndata)
                revert(add(32, returndata), returndata_size)
            }
        } else {
            // solhint-disable reason-string
            revert();
        }
    }
}
