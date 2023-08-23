// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {
    ILSP1UniversalReceiver
} from "../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";

// modules
import {ERC725YCore} from "@erc725/smart-contracts/contracts/ERC725YCore.sol";

// libraries
import {
    ERC165Checker
} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {LSP1Utils} from "../LSP1UniversalReceiver/LSP1Utils.sol";
import {LSP2Utils} from "../LSP2ERC725YJSONSchema/LSP2Utils.sol";

// constants
import {
    _INTERFACEID_LSP1,
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY
} from "../LSP1UniversalReceiver/LSP1Constants.sol";

abstract contract LSP1UniversalReceiver is ERC725YCore, ILSP1UniversalReceiver {
    using ERC165Checker for address;
    using LSP1Utils for address;

    function universalReceiver(
        bytes32 typeId,
        bytes calldata receivedData
    ) public payable virtual returns (bytes memory returnedValues) {
        returnedValues = _callUniversalReceiverDelegates(typeId, receivedData);

        emit UniversalReceiver(
            msg.sender,
            msg.value,
            typeId,
            receivedData,
            returnedValues
        );

        return returnedValues;
    }

    function _callUniversalReceiverDelegates(
        bytes32 typeId,
        bytes calldata receivedData
    ) internal virtual returns (bytes memory) {
        // Query the ERC725Y storage with the data key {_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY}
        bytes memory lsp1DelegateValue = _getData(
            _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY
        );
        bytes memory resultDefaultDelegate;

        if (lsp1DelegateValue.length >= 20) {
            address universalReceiverDelegate = address(
                bytes20(lsp1DelegateValue)
            );

            // Checking LSP1 InterfaceId support
            if (
                universalReceiverDelegate.supportsERC165InterfaceUnchecked(
                    _INTERFACEID_LSP1
                )
            ) {
                // calling {universalReceiver} function on URD appending the caller and the value sent
                resultDefaultDelegate = universalReceiverDelegate
                    .callUniversalReceiverWithCallerInfos(
                        typeId,
                        receivedData,
                        msg.sender,
                        msg.value
                    );
            }
        }

        // Generate the data key {_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY + <bytes32 typeId>}
        bytes32 lsp1typeIdDelegateKey = LSP2Utils.generateMappingKey(
            _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
            bytes20(typeId)
        );

        // Query the ERC725Y storage with the data key {_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY + <bytes32 typeId>}
        bytes memory lsp1TypeIdDelegateValue = _getData(lsp1typeIdDelegateKey);
        bytes memory resultTypeIdDelegate;

        if (lsp1TypeIdDelegateValue.length >= 20) {
            address universalReceiverDelegate = address(
                bytes20(lsp1TypeIdDelegateValue)
            );

            // Checking LSP1 InterfaceId support
            if (
                universalReceiverDelegate.supportsERC165InterfaceUnchecked(
                    _INTERFACEID_LSP1
                )
            ) {
                // calling {universalReceiver} function on URD appending the caller and the value sent
                resultTypeIdDelegate = universalReceiverDelegate
                    .callUniversalReceiverWithCallerInfos(
                        typeId,
                        receivedData,
                        msg.sender,
                        msg.value
                    );
            }
        }

        return abi.encode(resultDefaultDelegate, resultTypeIdDelegate);
    }
}
