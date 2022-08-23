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

    /**
     * @dev Generates a data key of keyType Singleton
     * @param keyName The string to hash to generate a Singleton data key
     * @return a bytes32 dataKey
     * 
     */
    function generateSingletonKey(string memory keyName) internal pure returns (bytes32) {
        return keccak256(bytes(keyName));
    }

    /**
     * @dev Generates a data key of keyType Array by hashing `keyName`.
     * @param keyName The string that will be used to generate an data key of keyType Array 
     */
    function generateArrayKey(string memory keyName) internal pure returns (bytes32) {
        bytes memory dataKey = bytes(keyName);

        require(
            dataKey[dataKey.length - 2] == 0x5b && // "[" in utf8 encoded
                dataKey[dataKey.length - 1] == 0x5d, // "]" in utf8
            "Missing empty square brackets '[]' at the end of the key name"
        );

        return keccak256(dataKey);
    }

    /**
     * @dev Generates a Array index data key by concatenating the first 16 bytes of `arrayKey`
     * and `index` transformed from uint256 to bytes16 (uint256 -> uint128 -> bytes16)
     * @param arrayKey The key from which we're getting the first half of the Array index data key from
     * @param index Used to generate the second half of the Array index data key
     */
    function generateArrayElementKeyAtIndex(bytes32 arrayKey, uint256 index)
        internal
        pure
        returns (bytes32)
    {
        bytes memory elementInArray = UtilsLib.concatTwoBytes16(
            bytes16(arrayKey),
            bytes16(uint128(index))
        );
        return bytes32(elementInArray);
    }

    /**
     * @dev @dev Generates a data key of keyType Mapping by hashing two strings:
     * <bytes10(keccak256(firstWord))>:<bytes2(0)>:<bytes20(keccak256(firstWord))>
     * @param firstWord Used to generate a hash and its first 10 bytes
     * are used for the first part of the data key of keyType Mapping
     * @param lastWord Used to generate a hash and its first 20 bytes
     * are used for the last part of the data key of keyType Mapping
     */
    function generateMappingKey(string memory firstWord, string memory lastWord)
        internal
        pure
        returns (bytes32)
    {
        bytes32 firstWordHash = keccak256(bytes(firstWord));
        bytes32 lastWordHash = keccak256(bytes(lastWord));

        bytes memory temporaryBytes = bytes.concat(
            bytes10(firstWordHash),
            bytes2(0),
            bytes20(lastWordHash)
        );

        return bytes32(temporaryBytes);
    }

    /**
     * @dev Generates a data key of keyType Mapping by hashing a string and concatenating it with an address:
     * <bytes10(keccak256(firstWord))>:<bytes2(0)>:<bytes20(addr)>
     * @param firstWord Used to generate a hash and its first 10 bytes
     * are used for the first part of the data key of keyType Mapping
     * @param addr used for the last part of the data key of keyType Mapping
     */
    function generateMappingKey(string memory firstWord, address addr)
        internal
        pure
        returns (bytes32)
    {
        bytes32 firstWordHash = keccak256(bytes(firstWord));

        bytes memory temporaryBytes = bytes.concat(
            bytes10(firstWordHash),
            bytes2(0),
            bytes20(addr)
        );

        return bytes32(temporaryBytes);
    }

    /**
     * @dev Generate a data key of keyType Mapping
     * <keyPrefix>:<bytes20Value>
     * @param keyPrefix First part of the data key of keyType Mapping
     * @param bytes20Value Second part of the data key of keyType Mapping
     */
    function generateMappingKey(bytes12 keyPrefix, bytes20 bytes20Value)
        internal
        pure
        returns (bytes32)
    {
        bytes memory generatedKey = bytes.concat(keyPrefix, bytes20Value);
        return bytes32(generatedKey);
    }

    /**
     * @dev Generate a data key of keyType MappingWithGrouping by using two strings and an address
     * <bytes6(keccak256(firstWord))>:<bytes4(keccak256(secondWord))>:<bytes2(0)>:<bytes20(addr)>
     * @param firstWord Used to generate a hash and its first 6 bytes
     * are used for the first part of the data key of keyType MappingWithGrouping
     * @param secondWord Used to generate a hash and its first 4 bytes
     * are used for the second part of the data key of keyType MappingWithGrouping
     * @param addr Used for the last part of the data key of keyType MappingWithGrouping
     */
    function generateMappingWithGroupingKey(
        string memory firstWord,
        string memory secondWord,
        address addr
    ) internal pure returns (bytes32) {
        bytes32 firstWordHash = keccak256(bytes(firstWord));
        bytes32 secondWordHash = keccak256(bytes(secondWord));

        bytes memory temporaryBytes = bytes.concat(
            bytes6(firstWordHash),
            bytes4(secondWordHash),
            bytes2(0),
            bytes20(addr)
        );

        return bytes32(temporaryBytes);
    }

    /**
     * @dev Generate a data key of keyType MappingWithGrouping
     * <keyPrefix>:<bytes20Value>
     * @param keyPrefix Used for the first part of the data key of keyType MappingWithGrouping
     * @param bytes20Value Used for the first last of the data key of keyType MappingWithGrouping
     */
    function generateMappingWithGroupingKey(bytes12 keyPrefix, bytes20 bytes20Value)
        internal
        pure
        returns (bytes32)
    {
        bytes memory generatedKey = bytes.concat(keyPrefix, bytes20Value);
        return bytes32(generatedKey);
    }

    /**
     * @dev Generate a JSONURL valueContent
     * @param hashFunction The function used to hash the JSON file
     * @param json Bytes value of the JSON file
     * @param url The URL where the JSON file is hosted
     */
    function generateJSONURLValue(
        string memory hashFunction,
        string memory json,
        string memory url
    ) internal pure returns (bytes memory key) {
        bytes32 hashFunctionDigest = keccak256(bytes(hashFunction));
        bytes32 jsonDigest = keccak256(bytes(json));

        key = abi.encodePacked(bytes4(hashFunctionDigest), jsonDigest, url);
    }

    /**
     * @dev Generate a ASSETURL valueContent
     * @param hashFunction The function used to hash the JSON file
     * @param assetBytes Bytes value of the JSON file
     * @param url The URL where the JSON file is hosted
     */
    function generateASSETURLValue(
        string memory hashFunction,
        string memory assetBytes,
        string memory url
    ) internal pure returns (bytes memory key) {
        bytes32 hashFunctionDigest = keccak256(bytes(hashFunction));
        bytes32 jsonDigest = keccak256(bytes(assetBytes));

        key = abi.encodePacked(bytes4(hashFunctionDigest), jsonDigest, url);
    }

    /**
     * Verifing if `data` is an encoded array
     * @param data The value that is to be verified
     */
    function isEncodedArray(bytes memory data) internal pure returns (bool) {
        uint256 nbOfBytes = data.length;

        // 1) there must be at least 32 bytes to store the offset
        if (nbOfBytes < 32) return false;

        // 2) there must be at least the same number of bytes specified by
        // the offset value (otherwise, the offset points to nowhere)
        uint256 offset = uint256(bytes32(data));
        if (nbOfBytes < offset) return false;

        // 3) there must be at least 32 x length bytes after offset
        uint256 arrayLength = data.toUint256(offset);

        //   32 bytes word (= offset)
        // + 32 bytes word (= array length)
        // + remaining bytes that make each element of the array
        if (nbOfBytes < (offset + 32 + (arrayLength * 32))) return false;

        return true;
    }

    /**
     * Verifing if `data` is an encoded array of addresses (address[])
     * @param data The value that is to be verified
     */
    function isEncodedArrayOfAddresses(bytes memory data) internal pure returns (bool) {
        if (!isEncodedArray(data)) return false;

        uint256 offset = uint256(bytes32(data));
        uint256 arrayLength = data.toUint256(offset);

        uint256 pointer = offset + 32;

        for (uint256 ii = 0; ii < arrayLength; ii = uncheckedIncrement(ii)) {
            bytes32 key = data.toBytes32(pointer);

            // check that the leading bytes are zero bytes "00"
            // NB: address type is padded on the left (unlike bytes20 type that is padded on the right)
            if (bytes12(key) != bytes12(0)) return false;

            // increment the pointer
            pointer += 32;
        }

        return true;
    }

    /**
     * @dev verify that `data` is an array of bytes4 (bytes4[]) encoded according to the Solidity ABI specs.
     * @param data The value that is to be verified
     */
    function isBytes4EncodedArray(bytes memory data) internal pure returns (bool) {
        if (!isEncodedArray(data)) return false;

        uint256 offset = uint256(bytes32(data));
        uint256 arrayLength = data.toUint256(offset);
        uint256 pointer = offset + 32;

        for (uint256 ii = 0; ii < arrayLength; ii = uncheckedIncrement(ii)) {
            bytes32 key = data.toBytes32(pointer);

            // check that the trailing bytes are zero bytes "00"
            if (uint224(uint256(key)) != 0) return false;

            // increment the pointer
            pointer += 32;
        }

        return true;
    }

    /**
     * @dev Will return unchecked incremented uint256
     *      can be used to save gas when iterating over loops
     */
    function uncheckedIncrement(uint256 i) internal pure returns (uint256) {
        unchecked {
            return i + 1;
        }
    }
}
