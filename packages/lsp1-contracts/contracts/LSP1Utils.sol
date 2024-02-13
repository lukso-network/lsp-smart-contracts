// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// libraries
import {
    ERC165Checker
} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {LSP2Utils} from "@lukso/lsp2-contracts/contracts/LSP2Utils.sol";

// constants
import {ILSP1UniversalReceiver as ILSP1} from "./ILSP1UniversalReceiver.sol";

// constants
import {
    _INTERFACEID_LSP1,
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY,
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX
} from "./LSP1Constants.sol";

/**
 * @title LSP1 Utility library.
 * @author Jean Cavallera <CJ42>, Yamen Merhi <YamenMerhi>, Daniel Afteni <B00ste>
 * @dev LSP1Utils is a library of utility functions that can be used to notify the `universalReceiver` function of a contract
 * that implements LSP1 and retrieve informations related to LSP1 `typeId`.
 * Based on LSP1 Universal Receiver standard.
 */
library LSP1Utils {
    using ERC165Checker for address;

    /**
     * @dev Notify a contract at `lsp1Implementation` address by calling its `universalReceiver` function if this contract
     * supports the LSP1 interface.
     *
     * @param lsp1Implementation The address of the contract to notify.
     * @param typeId A `bytes32` typeId.
     * @param data Any optional data to send to the `universalReceiver` function to the `lsp1Implementation` address.
     */
    function notifyUniversalReceiver(
        address lsp1Implementation,
        bytes32 typeId,
        bytes memory data
    ) internal {
        if (
            lsp1Implementation.supportsERC165InterfaceUnchecked(
                _INTERFACEID_LSP1
            )
        ) {
            ILSP1(lsp1Implementation).universalReceiver(typeId, data);
        }
    }

    /**
     * @notice Retrieving the value stored under the ERC725Y data key `LSP1UniversalReceiverDelegate`.
     *
     * @dev Query internally the ERC725Y storage of a `ERC725Y` smart contract to retrieve
     * the value set under the `LSP1UniversalReceiverDelegate` data key.
     *
     * @param erc725YStorage A reference to the ERC725Y storage mapping of the contract.
     * @return The bytes value stored under the `LSP1UniversalReceiverDelegate` data key.
     */
    function getLSP1DelegateValue(
        mapping(bytes32 => bytes) storage erc725YStorage
    ) internal view returns (bytes memory) {
        return erc725YStorage[_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY];
    }

    /**
     * @notice Retrieving the value stored under the ERC725Y data key `LSP1UniversalReceiverDelegate:<type-id>` for a specific `typeId`.
     *
     * @dev Query internally the ERC725Y storage of a `ERC725Y` smart contract to retrieve
     * the value set under the `LSP1UniversalReceiverDelegate:<bytes32>` data key for a specific LSP1 `typeId`.
     *
     * @param erc725YStorage A reference to the ERC725Y storage mapping of the contract.
     * @param typeId A bytes32 LSP1 `typeId`;
     * @return The bytes value stored under the `LSP1UniversalReceiverDelegate:<bytes32>` data key.
     */
    function getLSP1DelegateValueForTypeId(
        mapping(bytes32 => bytes) storage erc725YStorage,
        bytes32 typeId
    ) internal view returns (bytes memory) {
        bytes32 lsp1TypeIdDataKey = LSP2Utils.generateMappingKey(
            _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
            bytes20(typeId)
        );
        return erc725YStorage[lsp1TypeIdDataKey];
    }
}
