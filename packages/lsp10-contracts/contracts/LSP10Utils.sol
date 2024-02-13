// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {
    IERC725Y
} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";

// libraries
import {LSP2Utils} from "@lukso/lsp2-contracts/contracts/LSP2Utils.sol";

// constants

// TODO: add LSP9 as a dependency to this package and import the constant from it
bytes4 constant _INTERFACEID_LSP9 = 0x28af17e6;

import {
    _LSP10_VAULTS_MAP_KEY_PREFIX,
    _LSP10_VAULTS_ARRAY_KEY
} from "./LSP10Constants.sol";

/**
 * @title LSP10 Utility library.
 * @author Yamen Merhi <YamenMerhi>, Jean Cavallera <CJ42>
 * @dev LSP5Utils is a library of functions that can be used to register and manage vaults received by an ERC725Y smart contract.
 * Based on the LSP10 Received Vaults standard.
 */
library LSP10Utils {
    /**
     * @dev Generate an array of data keys/values pairs to be set on the receiver address after receiving vaults.
     *
     * @custom:warning This function returns empty arrays when encountering errors. Otherwise the arrays will contain 3 data keys and 3 data values.
     *
     * @param receiver The address receiving the vault and where the LSP10 data keys should be added.
     * @param vaultAddress The address of the vault being received.
     *
     * @return lsp10DataKeys An array data keys used to update the [LSP-10-ReceivedAssets] data.
     * @return lsp10DataValues An array data values used to update the [LSP-10-ReceivedAssets] data.
     */
    function generateReceivedVaultKeys(
        address receiver,
        address vaultAddress
    )
        internal
        view
        returns (bytes32[] memory lsp10DataKeys, bytes[] memory lsp10DataValues)
    {
        IERC725Y erc725YContract = IERC725Y(receiver);

        /// --- `LSP10Vaults[]` Array ---

        bytes memory currentArrayLengthBytes = getLSP10ArrayLengthBytes(
            erc725YContract
        );

        // CHECK that the value of `LSP10Vaults[]` Array length is a valid `uint128` (16 bytes long)
        if (!LSP2Utils.isValidLSP2ArrayLengthValue(currentArrayLengthBytes)) {
            if (currentArrayLengthBytes.length == 0) {
                // if it's the first vault received and nothing is set (= 0x)
                // we need to convert it to: `0x00000000000000000000000000000000`
                // to safely cast to a uint128 of length 0
                currentArrayLengthBytes = abi.encodePacked(bytes16(0));
            } else {
                // otherwise the array length is invalid
                return (lsp10DataKeys, lsp10DataValues);
            }
        }

        uint128 currentArrayLength = uint128(bytes16(currentArrayLengthBytes));

        // CHECK for potential overflow
        if (currentArrayLength == type(uint128).max) {
            return (lsp10DataKeys, lsp10DataValues);
        }

        // --- `LSP10VaultsMap:<vaultAddress>` ---

        bytes32 mapDataKey = LSP2Utils.generateMappingKey(
            _LSP10_VAULTS_MAP_KEY_PREFIX,
            bytes20(vaultAddress)
        );

        // CHECK that the map value is not already set in the storage for the newly received vault
        // If that's the case, the vault is already registered. Do not try to update.
        if (erc725YContract.getData(mapDataKey).length != 0) {
            return (lsp10DataKeys, lsp10DataValues);
        }

        /// --- LSP10 Data Keys & Values ---

        lsp10DataKeys = new bytes32[](3);
        lsp10DataValues = new bytes[](3);

        // Increment `LSP10Vaults[]` Array length
        lsp10DataKeys[0] = _LSP10_VAULTS_ARRAY_KEY;
        lsp10DataValues[0] = abi.encodePacked(currentArrayLength + 1);

        // Add asset address to `LSP10Vaults[index]`, where index == previous array length
        lsp10DataKeys[1] = LSP2Utils.generateArrayElementKeyAtIndex(
            _LSP10_VAULTS_ARRAY_KEY,
            currentArrayLength
        );
        lsp10DataValues[1] = abi.encodePacked(vaultAddress);

        // Add interfaceId + index as value under `LSP10VaultsMap:<vaultAddress>`
        lsp10DataKeys[2] = mapDataKey;
        lsp10DataValues[2] = bytes.concat(
            _INTERFACEID_LSP9,
            currentArrayLengthBytes
        );
    }

    /**
     * @dev Generate an array of data key/value pairs to be set on the sender address after sending vaults.
     *
     * @custom:warning Returns empty arrays when encountering errors. Otherwise the arrays must have at least 3 data keys and 3 data values.
     *
     * @param sender The address sending the vault and where the LSP10 data keys should be updated.
     * @param vaultAddress The address of the vault that is being sent.
     *
     * @return lsp10DataKeys An array data keys used to update the [LSP-10-ReceivedAssets] data.
     * @return lsp10DataValues An array data values used to update the [LSP-10-ReceivedAssets] data.
     */
    function generateSentVaultKeys(
        address sender,
        address vaultAddress
    )
        internal
        view
        returns (bytes32[] memory lsp10DataKeys, bytes[] memory lsp10DataValues)
    {
        IERC725Y erc725YContract = IERC725Y(sender);

        // --- `LSP10Vaults[]` Array ---

        bytes memory newArrayLengthBytes = getLSP10ArrayLengthBytes(
            erc725YContract
        );

        // CHECK that the value of `LSP10Vaults[]` Array length is a valid `uint128` (16 bytes long)
        if (!LSP2Utils.isValidLSP2ArrayLengthValue(newArrayLengthBytes)) {
            return (lsp10DataKeys, lsp10DataValues);
        }

        // CHECK for potential underflow
        if (
            newArrayLengthBytes.length == 0 ||
            bytes16(newArrayLengthBytes) == bytes16(0)
        ) {
            return (lsp10DataKeys, lsp10DataValues);
        }

        uint128 newArrayLength = uint128(bytes16(newArrayLengthBytes)) - 1;

        // --- `LSP10VaultssMap:<vaultAddress>` ---

        bytes32 removedElementMapKey = LSP2Utils.generateMappingKey(
            _LSP10_VAULTS_MAP_KEY_PREFIX,
            bytes20(vaultAddress)
        );

        // Query the ERC725Y storage of the LSP0-ERC725Account
        bytes memory mapValue = erc725YContract.getData(removedElementMapKey);

        // CHECK if no map value was set for the vault to remove.
        // If that's the case, there is nothing to remove. Do not try to update.
        if (mapValue.length != 20) {
            return (lsp10DataKeys, lsp10DataValues);
        }

        // Extract index of vault to remove from the map value
        uint128 removedElementIndex = uint128(bytes16(bytes20(mapValue) << 32));

        bytes32 removedElementIndexKey = LSP2Utils
            .generateArrayElementKeyAtIndex(
                _LSP10_VAULTS_ARRAY_KEY,
                uint128(removedElementIndex)
            );

        if (removedElementIndex == newArrayLength) {
            return
                LSP2Utils.removeLastElementFromArrayAndMap(
                    _LSP10_VAULTS_ARRAY_KEY,
                    newArrayLength,
                    removedElementIndexKey,
                    removedElementMapKey
                );
        } else if (removedElementIndex < newArrayLength) {
            return
                LSP2Utils.removeElementFromArrayAndMap(
                    erc725YContract,
                    _LSP10_VAULTS_ARRAY_KEY,
                    newArrayLength,
                    removedElementIndexKey,
                    removedElementIndex,
                    removedElementMapKey
                );
        } else {
            // If index is bigger than the array length, out of bounds
            return (lsp10DataKeys, lsp10DataValues);
        }
    }

    /**
     * @dev Get the raw bytes value stored under the `_LSP10_VAULTS_ARRAY_KEY`.
     * @param erc725YContract The contract to query the ERC725Y storage from.
     * @return The raw bytes value stored under this data key.
     */
    function getLSP10ArrayLengthBytes(
        IERC725Y erc725YContract
    ) internal view returns (bytes memory) {
        return erc725YContract.getData(_LSP10_VAULTS_ARRAY_KEY);
    }
}
