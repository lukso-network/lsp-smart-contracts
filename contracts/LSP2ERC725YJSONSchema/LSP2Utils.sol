// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

// libraries
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";
import {UtilsLib} from "../Utils/UtilsLib.sol";

/**
 * @title ERC725 Utility library to encode key types
 * @author Jean Cavallera (CJ-42)
 * @dev based on LSP2 - ERC725Y JSON Schema
 *      https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md
 */
library LSP2Utils {
    using BytesLib for bytes;

    /* solhint-disable no-inline-assembly */

    function generateBytes32Key(bytes memory _rawKey) internal pure returns (bytes32 key) {
        // solhint-disable-next-line
        assembly {
            key := mload(add(_rawKey, 32))
        }
    }

    function generateSingletonKey(string memory _keyName) internal pure returns (bytes32) {
        return keccak256(bytes(_keyName));
    }

    function generateArrayKey(string memory _keyName) internal pure returns (bytes32) {
        bytes memory keyName = bytes(_keyName);

        // prettier-ignore
        require(
            keyName[keyName.length - 2] == 0x5b && // "[" in utf8 encoded
                keyName[keyName.length - 1] == 0x5d, // "]" in utf8
            "Missing empty square brackets \"[]\" at the end of the key name"
        );

        return keccak256(keyName);
    }

    function generateArrayKeyAtIndex(bytes32 _arrayKey, uint256 _index)
        internal
        pure
        returns (bytes32)
    {
        bytes memory elementInArray = UtilsLib.concatTwoBytes16(
            bytes16(_arrayKey),
            bytes16(uint128(_index))
        );
        return generateBytes32Key(elementInArray);
    }

    function generateMappingKey(string memory _firstWord, string memory _lastWord)
        internal
        pure
        returns (bytes32)
    {
        bytes32 firstWordHash = keccak256(bytes(_firstWord));
        bytes32 lastWordHash = keccak256(bytes(_lastWord));

        bytes memory temporaryBytes = abi.encodePacked(
            bytes10(firstWordHash),
            bytes2(0),
            bytes20(lastWordHash)
        );

        return generateBytes32Key(temporaryBytes);
    }

    function generateMappingKey(string memory _firstWord, address _address)
        internal
        pure
        returns (bytes32)
    {
        bytes32 firstWordHash = keccak256(bytes(_firstWord));

        bytes memory temporaryBytes = abi.encodePacked(bytes10(firstWordHash), bytes2(0), _address);

        return generateBytes32Key(temporaryBytes);
    }

    function generateMappingKey(bytes12 _keyPrefix, bytes20 _bytes20)
        internal
        pure
        returns (bytes32)
    {
        bytes memory generatedKey = bytes.concat(_keyPrefix, _bytes20);
        return generateBytes32Key(generatedKey);
    }

    function generateMappingWithGroupingKey(
        string memory _firstWord,
        string memory _secondWord,
        address _address
    ) internal pure returns (bytes32) {
        bytes32 firstWordHash = keccak256(bytes(_firstWord));
        bytes32 secondWordHash = keccak256(bytes(_secondWord));

        bytes memory temporaryBytes = abi.encodePacked(
            bytes6(firstWordHash),
            bytes4(secondWordHash),
            bytes2(0),
            _address
        );

        return generateBytes32Key(temporaryBytes);
    }

    function generateMappingWithGroupingKey(bytes12 _keyPrefix, bytes20 _bytes20)
        internal
        pure
        returns (bytes32)
    {
        bytes memory generatedKey = bytes.concat(_keyPrefix, _bytes20);
        return generateBytes32Key(generatedKey);
    }

    function generateJSONURLValue(
        string memory _hashFunction,
        string memory _json,
        string memory _url
    ) internal pure returns (bytes memory key_) {
        bytes32 hashFunctionDigest = keccak256(bytes(_hashFunction));
        bytes32 jsonDigest = keccak256(bytes(_json));

        key_ = abi.encodePacked(bytes4(hashFunctionDigest), jsonDigest, _url);
    }

    function generateASSETURLValue(
        string memory _hashFunction,
        string memory _assetBytes,
        string memory _url
    ) internal pure returns (bytes memory key_) {
        bytes32 hashFunctionDigest = keccak256(bytes(_hashFunction));
        bytes32 jsonDigest = keccak256(bytes(_assetBytes));

        key_ = abi.encodePacked(bytes4(hashFunctionDigest), jsonDigest, _url);
    }

    function isEncodedArray(bytes memory _data) internal pure returns (bool) {
        uint256 nbOfBytes = _data.length;

        // 1) there must be at least 32 bytes to store the offset
        if (nbOfBytes < 32) return false;

        // 2) there must be at least the same number of bytes specified by
        // the offset value (otherwise, the offset points to nowhere)
        uint256 offset = uint256(bytes32(_data));
        if (nbOfBytes < offset) return false;

        // 3) there must be at least 32 x length bytes after offset
        uint256 arrayLength = _data.toUint256(offset);

        //   32 bytes word (= offset)
        // + 32 bytes word (= array length)
        // + remaining bytes that make each element of the array
        if (nbOfBytes < (offset + 32 + (arrayLength * 32))) return false;

        return true;
    }

    function isEncodedArrayOfAddresses(bytes memory _data) internal pure returns (bool) {
        if (!isEncodedArray(_data)) return false;

        uint256 offset = uint256(bytes32(_data));
        uint256 arrayLength = _data.toUint256(offset);

        uint256 pointer = offset + 32;

        for (uint256 ii = 0; ii < arrayLength; ii++) {
            bytes32 key = _data.toBytes32(pointer);

            // check that the leading bytes are zero bytes "00"
            // NB: address type is padded on the left (unlike bytes20 type that is padded on the right)
            if (bytes12(key) != bytes12(0)) return false;

            // increment the pointer
            pointer += 32;
        }

        return true;
    }

    function isBytes4EncodedArray(bytes memory _data) internal pure returns (bool) {
        if (!isEncodedArray(_data)) return false;

        uint256 offset = uint256(bytes32(_data));
        uint256 arrayLength = _data.toUint256(offset);
        uint256 pointer = offset + 32;

        for (uint256 ii = 0; ii < arrayLength; ii++) {
            bytes32 key = _data.toBytes32(pointer);

            // check that the trailing bytes are zero bytes "00"
            if (uint224(uint256(key)) != 0) return false;

            // increment the pointer
            pointer += 32;
        }

        return true;
    }
}
