// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";

// libraries
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";
import {LSP2Utils} from "../LSP2ERC725YJSONSchema/LSP2Utils.sol";
import {LSP6Utils} from "../LSP6KeyManager/LSP6Utils.sol";
import {UtilsLib} from "../Utils/UtilsLib.sol";

// constants
import {_TYPEID_LSP7_TOKENSSENDER} from "../LSP7DigitalAsset/LSP7Constants.sol";

library LSP5Utils {
    /**
     * @dev Generating the data keys/values to be set on the account after receiving assets/vaults
     *
     * @param account The account where the Keys should be added
     * @param arrayLengthKey The arrayLengthKey containing the number of the received assets/vaults
     * @param mapKey The mapKey containing the interfaceID and the index of the asset in the `element in arrayKey`
     * @param caller The address of the asset/vault received
     * @param interfaceID The interfaceID of the asset/vault received
     */
    function addMapAndArrayKey(
        IERC725Y account,
        bytes32 arrayLengthKey,
        bytes32 mapKey,
        address caller,
        bytes4 interfaceID
    ) internal view returns (bytes32[] memory keys, bytes[] memory values) {
        /**
         * We will be setting 3 keys:
         * - Keys[0]: The arrayLengthKey containing the number of the received assets/vaults
         * - Keys[1]: The element in arrayKey containing the address of each received asset/vault for a specific index
         * - Keys[2]: The mapKey containing the interfaceID and the index of the asset in the `element in arrayKey`
         */
        keys = new bytes32[](3);
        values = new bytes[](3);

        bytes memory encodedArrayLength = account.getData(arrayLengthKey);

        // If it's the first asset to receive
        if (encodedArrayLength.length == 0) {
            keys[0] = arrayLengthKey;
            values[0] = UtilsLib.uint256ToBytes(1);

            keys[1] = LSP2Utils.generateArrayElementKeyAtIndex(arrayLengthKey, 0);
            values[1] = UtilsLib.addressToBytes(caller);

            keys[2] = mapKey;
            values[2] = bytes.concat(interfaceID, bytes8(0));

            // If the storage is already initiated
        } else if (encodedArrayLength.length == 32) {
            uint256 arrayLength = abi.decode(encodedArrayLength, (uint256));
            uint256 newArrayLength = arrayLength + 1;

            keys[0] = arrayLengthKey;
            values[0] = UtilsLib.uint256ToBytes(newArrayLength);

            keys[1] = LSP2Utils.generateArrayElementKeyAtIndex(arrayLengthKey, newArrayLength - 1);
            values[1] = UtilsLib.addressToBytes(caller);

            keys[2] = mapKey;
            values[2] = bytes.concat(interfaceID, bytes8(uint64(arrayLength)));
        } else {
            revert("Invalid length of the LSP5ReceivedAssets[] Key");
        }
    }

    /**
     * @dev Generating the data keys/values to be removed/changed on the account after sending assets/vaults
     *
     * @param account The account where the Keys should be added
     * @param arrayLengthKey The arrayLengthKey containing the number of the received assets/vaults
     * @param mapKeyPrefix The mapKey prefix relative to LSP5ReceivedAssetsMap or LSP10VaultsMap Keys
     * @param mapKeyToRemove The mapKey of the asset sent
     * @param mapValue The mapValue of the asset/vault sent
     */
    function removeMapAndArrayKey(
        IERC725Y account,
        bytes32 arrayLengthKey,
        bytes12 mapKeyPrefix,
        bytes32 mapKeyToRemove,
        bytes memory mapValue
    ) internal view returns (bytes32[] memory keys, bytes[] memory values) {
        // Updating the number of the received assets/vaults
        bytes memory encodedArrayLength = account.getData(arrayLengthKey);
        uint256 arrayLength = abi.decode(encodedArrayLength, (uint256));
        uint256 newLength = arrayLength - 1;

        uint64 index = extractIndexFromMap(mapValue);
        bytes32 arrayElementKeyToRemove = LSP2Utils.generateArrayElementKeyAtIndex(
            arrayLengthKey,
            index
        );

        if (index == (arrayLength - 1)) {
            /**
             * We will be updating/removing 3 keys:
             * - Keys[0]: [Update] The arrayLengthKey to contain the new number of the received assets/vaults
             * - Keys[1]: [Remove] The element in arrayKey (Remove the address of the asset sent)
             * - Keys[2]: [Remove] The mapKey (Remove the interfaceId and the index of the asset sent)
             */
            keys = new bytes32[](3);
            values = new bytes[](3);

            keys[0] = arrayLengthKey;
            values[0] = UtilsLib.uint256ToBytes(newLength);

            keys[1] = mapKeyToRemove;
            values[1] = "";

            keys[2] = arrayElementKeyToRemove;
            values[2] = "";

            // Swapping last element in ArrayKey with the elemnt in ArrayKey to remove || {Swap and pop} method;
            // check https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/structs/EnumerableSet.sol#L80
        } else {
            /**
             * We will be updating/removing 5 keys:
             * - Keys[0]: [Update] The arrayLengthKey to contain the new number of the received assets/vaults
             * - Keys[1]: [Remove] The mapKey of the asset to remove (Remove the interfaceId and the index of the asset sent)
             * - Keys[2]: [Update] The element in arrayKey to remove (Swap with the address of the last element in Array)
             * - Keys[3]: [Remove] The last element in arrayKey (Remove (pop) the address of the last element as it's already swapped)
             * - Keys[4]: [Update] The mapKey of the last element in array (Update the new index and the interfaceID)
             */
            keys = new bytes32[](5);
            values = new bytes[](5);

            keys[0] = arrayLengthKey;
            values[0] = UtilsLib.uint256ToBytes(newLength);

            keys[1] = mapKeyToRemove;
            values[1] = "";

            // Generate all data Keys/values of the last element in Array to swap
            // with data Keys/values of the asset to remove
            bytes32 lastArrayElementKey = LSP2Utils.generateArrayElementKeyAtIndex(
                arrayLengthKey,
                newLength
            );
            bytes memory lastArrayElementValue = account.getData(lastArrayElementKey);

            bytes32 lastArrayElementMapKey = LSP2Utils.generateMappingKey(
                mapKeyPrefix,
                bytes20(lastArrayElementValue)
            );
            bytes memory lastArrayElementMapValue = account.getData(lastArrayElementMapKey);
            bytes memory interfaceID = BytesLib.slice(lastArrayElementMapValue, 0, 4);

            keys[2] = arrayElementKeyToRemove;
            values[2] = lastArrayElementValue;

            keys[3] = lastArrayElementKey;
            values[3] = "";

            keys[4] = lastArrayElementMapKey;
            values[4] = bytes.concat(interfaceID, bytes8(index));
        }
    }

    function addMapAndArrayKeyViaKeyManager(
        IERC725Y account,
        bytes32 arrayLengthKey,
        bytes32 mapKey,
        address caller,
        bytes4 interfaceID,
        address keyManager
    ) internal returns (bytes memory result) {
        (bytes32[] memory keys, bytes[] memory values) = addMapAndArrayKey(
            account,
            arrayLengthKey,
            mapKey,
            caller,
            interfaceID
        );
        result = LSP6Utils.setDataViaKeyManager(keyManager, keys, values);
    }

    function removeMapAndArrayKeyViaKeyManager(
        IERC725Y account,
        bytes32 arrayLengthKey,
        bytes12 mapKeyPrefix,
        bytes32 mapKeyToRemove,
        bytes memory mapValue,
        address keyManager
    ) internal returns (bytes memory result) {
        (bytes32[] memory keys, bytes[] memory values) = removeMapAndArrayKey(
            account,
            arrayLengthKey,
            mapKeyPrefix,
            mapKeyToRemove,
            mapValue
        );
        result = LSP6Utils.setDataViaKeyManager(keyManager, keys, values);
    }

    function extractIndexFromMap(bytes memory mapValue) internal pure returns (uint64) {
        bytes memory val = BytesLib.slice(mapValue, 4, 8);
        return BytesLib.toUint64(val, 0);
    }
}
