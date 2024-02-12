// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {
    IERC725Y
} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";

// libraries
import {LSP2Utils} from "@lukso/lsp2-contracts/contracts/LSP2Utils.sol";

// constants
import {
    _LSP5_RECEIVED_ASSETS_MAP_KEY_PREFIX,
    _LSP5_RECEIVED_ASSETS_ARRAY_KEY
} from "./LSP5Constants.sol";

/**
 * @title LSP5 Utility library.
 * @author Yamen Merhi <YamenMerhi>, Jean Cavallera <CJ42>
 * @dev LSP5Utils is a library of functions that can be used to register and manage assets under an ERC725Y smart contract.
 * Based on the LSP5 Received Assets standard.
 */
library LSP5Utils {
    /**
     * @dev Generate an array of data key/value pairs to be set on the receiver address after receiving assets.
     *
     * @custom:warning Returns empty arrays when encountering errors. Otherwise the arrays must have 3 data keys and 3 data values.
     *
     * @param receiver The address receiving the asset and where the LSP5 data keys should be added.
     * @param assetAddress The address of the asset being received (_e.g: an LSP7 or LSP8 token_).
     * @param assetInterfaceId The interfaceID of the asset being received.
     *
     * @return lsp5DataKeys An array Data Keys used to update the [LSP-5-ReceivedAssets] data.
     * @return lsp5DataValues An array Data Values used to update the [LSP-5-ReceivedAssets] data.
     */
    function generateReceivedAssetKeys(
        address receiver,
        address assetAddress,
        bytes4 assetInterfaceId
    )
        internal
        view
        returns (bytes32[] memory lsp5DataKeys, bytes[] memory lsp5DataValues)
    {
        IERC725Y erc725YContract = IERC725Y(receiver);

        // --- `LSP5ReceivedAssets[]` Array ---

        bytes memory currentArrayLengthBytes = getLSP5ArrayLengthBytes(
            erc725YContract
        );

        // CHECK that the value of `LSP5ReceivedAssets[]` Array length is a valid `uint128` (16 bytes long)
        if (!LSP2Utils.isValidLSP2ArrayLengthValue(currentArrayLengthBytes)) {
            if (currentArrayLengthBytes.length == 0) {
                // if it's the first asset received and nothing is set (= 0x)
                // we need to convert it to: `0x00000000000000000000000000000000`
                // to safely cast to a uint128 of length 0
                currentArrayLengthBytes = abi.encodePacked(bytes16(0));
            } else {
                // otherwise the array length is invalid
                return (lsp5DataKeys, lsp5DataValues);
            }
        }

        uint128 currentArrayLength = uint128(bytes16(currentArrayLengthBytes));

        // CHECK for potential overflow
        if (currentArrayLength == type(uint128).max) {
            return (lsp5DataKeys, lsp5DataValues);
        }

        // --- `LSP5ReceivedAssetsMap:<assetAddress>` ---

        bytes32 mapDataKey = LSP2Utils.generateMappingKey(
            _LSP5_RECEIVED_ASSETS_MAP_KEY_PREFIX,
            bytes20(assetAddress)
        );

        // CHECK that the map value is not already set in the storage for the newly received asset
        // If that's the case, the asset is already registered. Do not try to update.
        if (erc725YContract.getData(mapDataKey).length != 0) {
            return (lsp5DataKeys, lsp5DataValues);
        }

        // --- LSP5 Data Keys & Values ---

        lsp5DataKeys = new bytes32[](3);
        lsp5DataValues = new bytes[](3);

        // Increment `LSP5ReceivedAssets[]` Array length
        lsp5DataKeys[0] = _LSP5_RECEIVED_ASSETS_ARRAY_KEY;
        lsp5DataValues[0] = abi.encodePacked(currentArrayLength + 1);

        // Add asset address to `LSP5ReceivedAssets[index]`, where index == previous array length
        lsp5DataKeys[1] = LSP2Utils.generateArrayElementKeyAtIndex(
            _LSP5_RECEIVED_ASSETS_ARRAY_KEY,
            currentArrayLength
        );
        lsp5DataValues[1] = abi.encodePacked(assetAddress);

        // Add interfaceId + index as value under `LSP5ReceivedAssetsMap:<assetAddress>`
        lsp5DataKeys[2] = mapDataKey;
        lsp5DataValues[2] = bytes.concat(
            assetInterfaceId,
            currentArrayLengthBytes
        );
    }

    /**
     * @dev Generate an array of Data Key/Value pairs to be set on the sender address after sending assets.
     *
     * @custom:warning Returns empty arrays when encountering errors. Otherwise the arrays must have at least 3 data keys and 3 data values.
     *
     * @param sender The address sending the asset and where the LSP5 data keys should be updated.
     * @param assetAddress The address of the asset that is being sent.
     *
     * @return lsp5DataKeys An array Data Keys used to update the [LSP-5-ReceivedAssets] data.
     * @return lsp5DataValues An array Data Values used to update the [LSP-5-ReceivedAssets] data.
     */
    function generateSentAssetKeys(
        address sender,
        address assetAddress
    )
        internal
        view
        returns (bytes32[] memory lsp5DataKeys, bytes[] memory lsp5DataValues)
    {
        IERC725Y erc725YContract = IERC725Y(sender);

        // --- `LSP5ReceivedAssets[]` Array ---

        bytes memory newArrayLengthBytes = getLSP5ArrayLengthBytes(
            erc725YContract
        );

        // CHECK that the value of `LSP5ReceivedAssets[]` Array length is a valid `uint128` (16 bytes long)
        if (!LSP2Utils.isValidLSP2ArrayLengthValue(newArrayLengthBytes)) {
            return (lsp5DataKeys, lsp5DataValues);
        }

        // CHECK for potential underflow
        if (bytes16(newArrayLengthBytes) == bytes16(0)) {
            return (lsp5DataKeys, lsp5DataValues);
        }

        uint128 newArrayLength = uint128(bytes16(newArrayLengthBytes)) - 1;

        // --- `LSP5ReceivedAssetsMap:<assetAddress>` ---

        bytes32 removedElementMapKey = LSP2Utils.generateMappingKey(
            _LSP5_RECEIVED_ASSETS_MAP_KEY_PREFIX,
            bytes20(assetAddress)
        );

        // Query the ERC725Y storage of the LSP0-ERC725Account
        bytes memory mapValue = erc725YContract.getData(removedElementMapKey);

        // CHECK if no map value was set for the asset to remove.
        // If that's the case, there is nothing to remove. Do not try to update.
        if (mapValue.length != 20) {
            return (lsp5DataKeys, lsp5DataValues);
        }

        // Extract index of asset to remove from the map value
        uint128 removedElementIndex = uint128(bytes16(bytes20(mapValue) << 32));

        bytes32 removedElementIndexKey = LSP2Utils
            .generateArrayElementKeyAtIndex(
                _LSP5_RECEIVED_ASSETS_ARRAY_KEY,
                removedElementIndex
            );

        if (removedElementIndex == newArrayLength) {
            return
                LSP2Utils.removeLastElementFromArrayAndMap(
                    _LSP5_RECEIVED_ASSETS_ARRAY_KEY,
                    newArrayLength,
                    removedElementIndexKey,
                    removedElementMapKey
                );
        } else if (removedElementIndex < newArrayLength) {
            return
                LSP2Utils.removeElementFromArrayAndMap(
                    erc725YContract,
                    _LSP5_RECEIVED_ASSETS_ARRAY_KEY,
                    newArrayLength,
                    removedElementIndexKey,
                    removedElementIndex,
                    removedElementMapKey
                );
        } else {
            // If index is bigger than the array length, out of bounds
            return (lsp5DataKeys, lsp5DataValues);
        }
    }

    /**
     * @dev Get the raw bytes value stored under the `_LSP5_RECEIVED_ASSETS_ARRAY_KEY`.
     * @param erc725YContract The contract to query the ERC725Y storage from.
     * @return The raw bytes value stored under this data key.
     */
    function getLSP5ArrayLengthBytes(
        IERC725Y erc725YContract
    ) internal view returns (bytes memory) {
        return erc725YContract.getData(_LSP5_RECEIVED_ASSETS_ARRAY_KEY);
    }
}
