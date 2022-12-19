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
 *      The value stored under this data key should be exactly 32 bytes long.
 *
 *      Only possible valid values are:
 *      - any valid uint256 values
 *          i.e. 0x0000000000000000000000000000000000000000000000000000000000000000 (zero), meaning empty array, no vaults received.
 *          i.e. 0x0000000000000000000000000000000000000000000000000000000000000005 (non-zero), meaning 5 array elements, 5 vaults received.
 *
 *      - 0x (nothing stored under this data key, equivalent to empty array)
 *
 * @param invalidValue the invalid value stored under the LSP10ReceivedVaults[] data key
 * @param invalidValueLength the invalid number of bytes stored under the LSP10ReceivedVaults[] data key (MUST be 32)
 */
error InvalidLSP10ReceivedVaultsArrayLength(bytes invalidValue, uint256 invalidValueLength);

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
     * @param interfaceID The interfaceID of the vault being received
     */
    function generateReceivedVaultKeys(
        address receiver,
        address vault,
        bytes32 vaultMapKey,
        bytes4 interfaceID
    ) internal view returns (bytes32[] memory keys, bytes[] memory values) {
        keys = new bytes32[](3);
        values = new bytes[](3);

        IERC725Y account = IERC725Y(receiver);
        bytes memory encodedArrayLength = getLSP10ReceivedVaultsCount(account);

        // If it's the first vault to receive
        if (encodedArrayLength.length == 0) {
            keys[0] = _LSP10_VAULTS_ARRAY_KEY;
            values[0] = bytes.concat(bytes32(uint256(1)));

            keys[1] = LSP2Utils.generateArrayElementKeyAtIndex(_LSP10_VAULTS_ARRAY_KEY, 0);
            values[1] = bytes.concat(bytes20(vault));

            keys[2] = vaultMapKey;
            values[2] = bytes.concat(interfaceID, bytes8(0));

            // If the storage is already initiated
        } else if (encodedArrayLength.length == 32) {
            uint256 oldArrayLength = uint256(bytes32(encodedArrayLength));

            keys[0] = _LSP10_VAULTS_ARRAY_KEY;
            values[0] = bytes.concat(bytes32(oldArrayLength + 1));

            keys[1] = LSP2Utils.generateArrayElementKeyAtIndex(
                _LSP10_VAULTS_ARRAY_KEY,
                oldArrayLength
            );
            values[1] = bytes.concat(bytes20(vault));

            keys[2] = vaultMapKey;
            values[2] = bytes.concat(interfaceID, bytes8(uint64(oldArrayLength)));
        } else {
            revert InvalidLSP10ReceivedVaultsArrayLength(
                encodedArrayLength,
                encodedArrayLength.length
            );
        }
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

        // Updating the number of the received vaults
        uint256 oldArrayLength = uint256(bytes32(getLSP10ReceivedVaultsCount(account)));
        uint256 newArrayLength = oldArrayLength - 1;

        uint64 index = extractIndexFromMap(vaultInterfaceIdAndIndex);
        bytes32 vaultInArrayKey = LSP2Utils.generateArrayElementKeyAtIndex(
            _LSP10_VAULTS_ARRAY_KEY,
            index
        );

        if (index == newArrayLength) {
            /**
             * We will be updating/removing 3 keys:
             * - Keys[0]: [Update] The arrayLengthKey to contain the new number of the received vaults
             * - Keys[1]: [Remove] The element in arrayKey (Remove the address of the vault sent)
             * - Keys[2]: [Remove] The mapKey (Remove the interfaceId and the index of the vault sent)
             */
            keys = new bytes32[](3);
            values = new bytes[](3);

            keys[0] = _LSP10_VAULTS_ARRAY_KEY;
            values[0] = bytes.concat(bytes32(newArrayLength));

            keys[1] = vaultInArrayKey;
            values[1] = "";

            keys[2] = vaultMapKey;
            values[2] = "";

            // Swapping last element in ArrayKey with the element in ArrayKey to remove || {Swap and pop} method;
            // check https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/structs/EnumerableSet.sol#L80
        } else {
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

            keys[0] = _LSP10_VAULTS_ARRAY_KEY;
            values[0] = bytes.concat(bytes32(newArrayLength));

            keys[1] = vaultMapKey;
            values[1] = "";

            // Generate all data Keys/values of the last element in Array to swap
            // with data Keys/values of the vault to remove
            bytes32 lastVaultInArrayKey = LSP2Utils.generateArrayElementKeyAtIndex(
                _LSP10_VAULTS_ARRAY_KEY,
                newArrayLength
            );

            bytes20 lastVaultInArrayAddress = bytes20(account.getData(lastVaultInArrayKey));

            bytes32 lastVaultInArrayMapKey = LSP2Utils.generateMappingKey(
                _LSP10_VAULTS_MAP_KEY_PREFIX,
                lastVaultInArrayAddress
            );

            keys[2] = vaultInArrayKey;
            values[2] = bytes.concat(lastVaultInArrayAddress);

            keys[3] = lastVaultInArrayKey;
            values[3] = "";

            keys[4] = lastVaultInArrayMapKey;
            values[4] = bytes.concat(_INTERFACEID_LSP9, bytes8(index));
        }
    }

    function getLSP10ReceivedVaultsCount(IERC725Y account) internal view returns (bytes memory) {
        return account.getData(_LSP10_VAULTS_ARRAY_KEY);
    }

    /**
     * @dev returns the index from a maping
     */
    function extractIndexFromMap(bytes memory mapValue) internal pure returns (uint64) {
        bytes memory val = BytesLib.slice(mapValue, 4, 8);
        return BytesLib.toUint64(val, 0);
    }
}
