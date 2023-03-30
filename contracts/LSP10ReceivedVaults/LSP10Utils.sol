// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";

// libraries
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";
import {LSP2Utils} from "../LSP2ERC725YJSONSchema/LSP2Utils.sol";

// constants
import "../LSP10ReceivedVaults/LSP10Constants.sol";
import "../LSP9Vault/LSP9Constants.sol";

/**
 * @dev reverts when the value stored under the 'LSP10ReceivedVaults[]' data key is not valid.
 *      The value stored under this data key should be exactly 16 bytes long.
 *
 *      Only possible valid values are:
 *      - any valid uint128 values
 *          i.e. 0x00000000000000000000000000000000 (zero), meaning empty array, no vaults received.
 *          i.e. 0x00000000000000000000000000000005 (non-zero), meaning 5 array elements, 5 vaults received.
 *
 *      - 0x (nothing stored under this data key, equivalent to empty array)
 *
 * @param invalidValueStored the invalid value stored under the LSP10ReceivedVaults[] data key
 * @param invalidValueLength the invalid number of bytes stored under the LSP10ReceivedVaults[] data key (MUST be 16 bytes long)
 */
error InvalidLSP10ReceivedVaultsArrayLength(bytes invalidValueStored, uint256 invalidValueLength);

/**
 * @dev reverts when the `LSP10Vaults[]` array reaches its maximum limit (max(uint128))
 * @param notRegisteredVault the address of the vault that could not be registered
 */
error MaxLSP10VaultsCountReached(address notRegisteredVault);

/**
 * @dev reverts when the vault index is superior to uint128
 * @param index the vault index
 */
error VaultIndexSuperiorToUint128(uint256 index);

/**
 * @title LSP10Utils
 * @author Yamen Merhi <YamenMerhi>, Jean Cavallera <CJ42>
 * @dev LSP5Utils is a library of functions that are used to register and manage vaults received by an ERC725Y smart contract
 *      based on the LSP10 - Received Vaults standard
 *      https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-10-ReceivedVaults.md
 */
library LSP10Utils {
    /**
     * @dev Generating the data keys/values to be set on the receiver address after receiving vaults
     * @param receiver The address receiving the vault and where the Keys should be added
     * @param vault The address of the vault being received
     * @param vaultMapKey The map key of the vault being received containing the interfaceId of the
     * vault and the index in the array
     */
    function generateReceivedVaultKeys(
        address receiver,
        address vault,
        bytes32 vaultMapKey
    ) internal view returns (bytes32[] memory keys, bytes[] memory values) {
        keys = new bytes32[](3);
        values = new bytes[](3);

        IERC725Y account = IERC725Y(receiver);
        bytes memory encodedArrayLength = getLSP10ReceivedVaultsCount(account);

        // CHECK it's either the first vault received,
        // or the storage is already set with a valid `uint128` value
        if (encodedArrayLength.length != 0 && encodedArrayLength.length != 16) {
            revert InvalidLSP10ReceivedVaultsArrayLength({
                invalidValueStored: encodedArrayLength,
                invalidValueLength: encodedArrayLength.length
            });
        }

        uint128 oldArrayLength = uint128(bytes16(encodedArrayLength));

        if (oldArrayLength == type(uint128).max) {
            revert MaxLSP10VaultsCountReached({notRegisteredVault: vault});
        }

        uint128 newArrayLength = oldArrayLength + 1;

        // store the number of received vaults incremented by 1
        keys[0] = _LSP10_VAULTS_ARRAY_KEY;
        values[0] = bytes.concat(bytes16(newArrayLength));

        // store the address of the vault under the element key in the array
        keys[1] = LSP2Utils.generateArrayElementKeyAtIndex(_LSP10_VAULTS_ARRAY_KEY, oldArrayLength);
        values[1] = bytes.concat(bytes20(vault));

        // store the interfaceId and the location in the array of the asset
        // under the LSP5ReceivedAssetMap key
        keys[2] = vaultMapKey;
        values[2] = bytes.concat(_INTERFACEID_LSP9, bytes16(oldArrayLength));
    }

    /**
     * @dev Generating the data keys/values to be set on the sender address after sending vaults
     * @param sender The address sending the vault and where the Keys should be updated
     * @param vaultMapKey The map key of the vault being sent containing the interfaceId of the
     * vault and the index in the array
     * @param vaultInterfaceIdAndIndex The value of the map key of the vault being sent
     */
    function generateSentVaultKeys(
        address sender,
        bytes32 vaultMapKey,
        bytes memory vaultInterfaceIdAndIndex
    ) internal view returns (bytes32[] memory keys, bytes[] memory values) {
        IERC725Y account = IERC725Y(sender);
        bytes memory lsp10VaultsCountValue = getLSP10ReceivedVaultsCount(account);

        if (lsp10VaultsCountValue.length != 16) {
            revert InvalidLSP10ReceivedVaultsArrayLength({
                invalidValueStored: lsp10VaultsCountValue,
                invalidValueLength: lsp10VaultsCountValue.length
            });
        }

        // Updating the number of the received vaults
        uint128 oldArrayLength = uint128(bytes16(lsp10VaultsCountValue));

        if (oldArrayLength > type(uint128).max) {
            revert VaultIndexSuperiorToUint128(oldArrayLength);
        }

        // Updating the number of the received vaults (decrementing by 1
        uint128 newArrayLength = oldArrayLength - 1;

        // Identify where the vault is located in the LSP10Vaults[] array
        // by extracting the index from the tuple value `(bytes4,uint128)`
        // fetched under the LSP10VaultsMap data key
        uint128 index = extractIndexFromMap(vaultInterfaceIdAndIndex);

        // Generate the element key in the array of the vault
        bytes32 vaultInArrayKey = LSP2Utils.generateArrayElementKeyAtIndex(
            _LSP10_VAULTS_ARRAY_KEY,
            index
        );

        // If the asset to remove is the last element in the array
        if (index == newArrayLength) {
            /**
             * We will be updating/removing 3 keys:
             * - Keys[0]: [Update] The arrayLengthKey to contain the new number of the received vaults
             * - Keys[1]: [Remove] The element in arrayKey (Remove the address of the vault sent)
             * - Keys[2]: [Remove] The mapKey (Remove the interfaceId and the index of the vault sent)
             */
            keys = new bytes32[](3);
            values = new bytes[](3);

            // store the number of received vaults decremented by 1
            keys[0] = _LSP10_VAULTS_ARRAY_KEY;
            values[0] = bytes.concat(bytes16(newArrayLength));

            // remove the address of the vault from the element key
            keys[1] = vaultInArrayKey;
            values[1] = "";

            // remove the interfaceId and the location in the array of the vault
            keys[2] = vaultMapKey;
            values[2] = "";

            // Swapping last element in ArrayKey with the element in ArrayKey to remove || {Swap and pop} method;
            // check https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/structs/EnumerableSet.sol#L80
        } else if (index < newArrayLength) {
            /**
             * We will be updating/removing 5 keys:
             * - Keys[0]: [Update] The arrayLengthKey to contain the new number of the received vaults
             * - Keys[1]: [Remove] The mapKey of the vault to remove (Remove the interfaceId and the index of the vault sent)
             * - Keys[2]: [Update] The element in arrayKey to remove (Swap with the address of the last element in Array)
             * - Keys[3]: [Remove] The last element in arrayKey (Remove (pop) the address of the last element as it's already swapped)
             * - Keys[4]: [Update] The mapKey of the last element in array (Update the new index and the interfaceID)
             */
            keys = new bytes32[](5);
            values = new bytes[](5);

            // store the number of received vaults decremented by 1
            keys[0] = _LSP10_VAULTS_ARRAY_KEY;
            values[0] = bytes.concat(bytes16(newArrayLength));

            // remove the interfaceId and the location in the array of the vault
            keys[1] = vaultMapKey;
            values[1] = "";

            // Generate all data Keys/values of the last element in Array to swap
            // with data Keys/values of the vault to remove

            // Generate the element key of the last vault in the array
            bytes32 lastVaultInArrayKey = LSP2Utils.generateArrayElementKeyAtIndex(
                _LSP10_VAULTS_ARRAY_KEY,
                newArrayLength
            );

            // Get the address of the vault from the element key of the last vault in the array
            bytes20 lastVaultInArrayAddress = bytes20(account.getData(lastVaultInArrayKey));

            // Generate the map key of the last vault in the array
            bytes32 lastVaultInArrayMapKey = LSP2Utils.generateMappingKey(
                _LSP10_VAULTS_MAP_KEY_PREFIX,
                lastVaultInArrayAddress
            );

            // Set the address of the last vault instead of the asset to be sent
            // under the element data key in the array
            keys[2] = vaultInArrayKey;
            values[2] = bytes.concat(lastVaultInArrayAddress);

            // Remove the address swapped (last vault in the array) from the last element data key in the array
            keys[3] = lastVaultInArrayKey;
            values[3] = "";

            // Update the index and the interfaceId of the address swapped (last vault in the array)
            // to point to the new location in the LSP10Vaults array
            keys[4] = lastVaultInArrayMapKey;
            values[4] = bytes.concat(_INTERFACEID_LSP9, bytes16(index));
        } else {
            // If index is bigger than the array length, out of bounds
            return (keys, values);
        }
    }

    function getLSP10ReceivedVaultsCount(IERC725Y account) internal view returns (bytes memory) {
        return account.getData(_LSP10_VAULTS_ARRAY_KEY);
    }

    /**
     * @dev returns the index from the LSP10VaultMap
     */
    function extractIndexFromMap(bytes memory mapValue) internal pure returns (uint128) {
        bytes memory val = BytesLib.slice(mapValue, 4, 16);
        return BytesLib.toUint128(val, 0);
    }
}
