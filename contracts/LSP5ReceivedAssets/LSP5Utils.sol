// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";
import "../Utils/ERC725Utils.sol";
import "../LSP2ERC725YJSONSchema/LSP2Utils.sol";
import "../LSP7DigitalAsset/LSP7Constants.sol";
import "../LSP6KeyManager/LSP6Utils.sol";
import "../Utils/UtilsLib.sol";

library LSP5Utils {
    /**
     * @dev Initiates Map and ArrayKey and sets the length of the Array to `1` if it's not set before,
     * If it's already set, it decodes the arrayLength, increment it and adds Map and ArrayKey
     */
    function addMapAndArrayKey(
        IERC725Y _account,
        bytes32 _arrayKey,
        bytes32 _mapKey,
        address _sender,
        bytes4 _appendix
    ) internal view returns (bytes32[] memory keys, bytes[] memory values) {
        keys = new bytes32[](3);
        values = new bytes[](3);

        bytes memory rawArrayLength = ERC725Utils.getDataSingle(
            _account,
            _arrayKey
        );

        keys[0] = _arrayKey;
        keys[2] = _mapKey;

        values[1] = UtilsLib.addressToBytes(_sender);

        if (rawArrayLength.length != 32) {
            keys[1] = LSP2Utils.generateArrayKeyAtIndex(_arrayKey, 0);

            values[0] = UtilsLib.uint256ToBytes(1);
            values[2] = bytes.concat(bytes8(0), _appendix);
        } else if (rawArrayLength.length == 32) {
            uint256 arrayLength = abi.decode(rawArrayLength, (uint256));
            uint256 newArrayLength = arrayLength + 1;

            keys[1] = LSP2Utils.generateArrayKeyAtIndex(
                _arrayKey,
                newArrayLength - 1
            );

            values[0] = UtilsLib.uint256ToBytes(newArrayLength);
            values[2] = bytes.concat(bytes8(uint64(arrayLength)), _appendix);
        }
    }

    /**
     * @dev Decrements the arrayLength, removes the Map, swaps the arrayKey that need to be removed with
     * the last `arrayKey` in the array and removes the last arrayKey with updating all modified entries
     */
    function removeMapAndArrayKey(
        IERC725Y _account,
        bytes32 _arrayKey,
        bytes12 mapPrefix,
        bytes32 _mapKeyToRemove
    ) internal view returns (bytes32[] memory keys, bytes[] memory values) {
        uint64 index = extractIndexFromMap(_account, _mapKeyToRemove);
        bytes32 arrayKeyToRemove = LSP2Utils.generateArrayKeyAtIndex(
            _arrayKey,
            index
        );

        bytes memory rawArrayLength = ERC725Utils.getDataSingle(
            _account,
            _arrayKey
        );
        uint256 arrayLength = abi.decode(rawArrayLength, (uint256));
        uint256 newLength = arrayLength - 1;

        if (index == (arrayLength - 1)) {
            keys = new bytes32[](3);
            values = new bytes[](3);

            keys[0] = _arrayKey;
            values[0] = UtilsLib.uint256ToBytes(newLength);

            keys[1] = _mapKeyToRemove;
            values[1] = "";

            keys[2] = arrayKeyToRemove;
            values[2] = "";
        } else {
            keys = new bytes32[](5);
            values = new bytes[](5);

            keys[0] = _arrayKey;
            values[0] = UtilsLib.uint256ToBytes(newLength);

            keys[1] = _mapKeyToRemove;
            values[1] = "";

            bytes32 lastKey = LSP2Utils.generateArrayKeyAtIndex(
                _arrayKey,
                newLength
            );
            bytes memory lastKeyValue = ERC725Utils.getDataSingle(
                _account,
                lastKey
            );

            bytes32 mapOfLastkey = LSP2Utils
                .generateBytes20MappingWithGroupingKey(
                    mapPrefix,
                    bytes20(lastKeyValue)
                );

            bytes memory mapValueOfLastkey = ERC725Utils.getDataSingle(
                _account,
                mapOfLastkey
            );

            bytes memory appendix = BytesLib.slice(mapValueOfLastkey, 8, 4);

            keys[2] = arrayKeyToRemove;
            values[2] = lastKeyValue;

            keys[3] = lastKey;
            values[3] = "";

            keys[4] = mapOfLastkey;
            values[4] = bytes.concat(bytes8(index), appendix);
        }
    }

    function addMapAndArrayKeyViaKeyManager(
        IERC725Y _account,
        bytes32 _arrayKey,
        bytes32 _mapKey,
        address _sender,
        bytes4 _appendix,
        address _keyManager
    ) internal returns (bytes memory result) {
        (bytes32[] memory _keys, bytes[] memory _values) = addMapAndArrayKey(
            _account,
            _arrayKey,
            _mapKey,
            _sender,
            _appendix
        );
        result = LSP6Utils.setDataViaKeyManager(_keyManager, _keys, _values);
    }

    function removeMapAndArrayKeyViaKeyManager(
        IERC725Y _account,
        bytes32 _arrayKey,
        bytes12 mapPrefix,
        bytes32 _mapKeyToRemove,
        address keyManager
    ) internal returns (bytes memory result) {
        (bytes32[] memory _keys, bytes[] memory _values) = removeMapAndArrayKey(
            _account,
            _arrayKey,
            mapPrefix,
            _mapKeyToRemove
        );
        result = LSP6Utils.setDataViaKeyManager(keyManager, _keys, _values);
    }

    function extractIndexFromMap(IERC725Y _account, bytes32 _mapKey)
        internal
        view
        returns (uint64)
    {
        bytes memory mapValue = ERC725Utils.getDataSingle(_account, _mapKey);
        bytes memory val = BytesLib.slice(mapValue, 0, 8);
        return BytesLib.toUint64(val, 0);
    }

    function extractTokenAmount(bytes32 typeId, bytes memory data)
        internal
        pure
        returns (uint256)
    {
        if (typeId == _TYPEID_LSP7_TOKENSSENDER) {
            return uint256(bytes32(BytesLib.slice(data, 40, 32)));
        } else {
            return 1;
        }
    }
}
