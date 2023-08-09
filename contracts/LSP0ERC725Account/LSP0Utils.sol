// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// libraries
import {LSP2Utils} from "../LSP2ERC725YJSONSchema/LSP2Utils.sol";

// constants
import {
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY
} from "../LSP1UniversalReceiver/LSP1Constants.sol";

/**
 * @title Utility functions to query the storage of an LSP0ERC725Account.
 * @author Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 */
library LSP0Utils {
    /**
     * @dev Query internally the ERC725Y storage of a `ERC725Y` smart contract to retrieve
     * the value set under the `LSP1UniversalReceiverDelegate` data key.
     * @param erc725YStorage A reference to the ERC725Y storage mapping of the contract.
     * @return The bytes value stored under the `LSP1UniversalReceiverDelegate` data key.
     */
    function getLSP1DelegateValue(
        mapping(bytes32 => bytes) storage erc725YStorage
    ) internal view returns (bytes memory) {
        return erc725YStorage[_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY];
    }

    /**
     * @dev Query internally the ERC725Y storage of a `ERC725Y` smart contract to retrieve
     * the value set under the `LSP1UniversalReceiverDelegate:<bytes32>` data key for a specific LSP1 `typeId`.
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
