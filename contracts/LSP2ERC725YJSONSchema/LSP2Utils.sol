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

    function generateSingletonKey(string memory keyName) internal pure returns (bytes32) {
        return keccak256(bytes(keyName));
    }

    function generateArrayKey(string memory keyName) internal pure returns (bytes32) {
        bytes memory dataKey = bytes(keyName);

        // prettier-ignore
        require(
            dataKey[dataKey.length - 2] == 0x5b && // "[" in utf8 encoded
                dataKey[dataKey.length - 1] == 0x5d, // "]" in utf8
            "Missing empty square brackets \"[]\" at the end of the key name"
        );

        return keccak256(dataKey);
    }

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

    function generateMappingKey(string memory firstWord, address addr)
        internal
        pure
        returns (bytes32)
    {
        bytes32 firstWordHash = keccak256(bytes(firstWord));

        bytes memory temporaryBytes = bytes.concat(bytes10(firstWordHash), bytes2(0), bytes20(addr));

        return bytes32(temporaryBytes);
    }

    function generateMappingKey(bytes12 keyPrefix, bytes20 bytes20Value)
        internal
        pure
        returns (bytes32)
    {
        bytes memory generatedKey = bytes.concat(keyPrefix, bytes20Value);
        return bytes32(generatedKey);
    }

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

    function generateMappingWithGroupingKey(bytes12 keyPrefix, bytes20 bytes20Value)
        internal
        pure
        returns (bytes32)
    {
        bytes memory generatedKey = bytes.concat(keyPrefix, bytes20Value);
        return bytes32(generatedKey);
    }

    function generateJSONURLValue(
        string memory hashFunction,
        string memory json,
        string memory url
    ) internal pure returns (bytes memory key) {
        bytes32 hashFunctionDigest = keccak256(bytes(hashFunction));
        bytes32 jsonDigest = keccak256(bytes(json));

        key = abi.encodePacked(bytes4(hashFunctionDigest), jsonDigest, url);
    }

    function generateASSETURLValue(
        string memory hashFunction,
        string memory assetBytes,
        string memory url
    ) internal pure returns (bytes memory key) {
        bytes32 hashFunctionDigest = keccak256(bytes(hashFunction));
        bytes32 jsonDigest = keccak256(bytes(assetBytes));

        key = abi.encodePacked(bytes4(hashFunctionDigest), jsonDigest, url);
    }

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

    function isEncodedArrayOfAddresses(bytes memory data) internal pure returns (bool) {
        if (!isEncodedArray(data)) return false;

        uint256 offset = uint256(bytes32(data));
        uint256 arrayLength = data.toUint256(offset);

        uint256 pointer = offset + 32;

        for (uint256 ii = 0; ii < arrayLength; ii++) {
            bytes32 key = data.toBytes32(pointer);

            // check that the leading bytes are zero bytes "00"
            // NB: address type is padded on the left (unlike bytes20 type that is padded on the right)
            if (bytes12(key) != bytes12(0)) return false;

            // increment the pointer
            pointer += 32;
        }

        return true;
    }

    function isBytes4EncodedArray(bytes memory data) internal pure returns (bool) {
        if (!isEncodedArray(data)) return false;

        uint256 offset = uint256(bytes32(data));
        uint256 arrayLength = data.toUint256(offset);
        uint256 pointer = offset + 32;

        for (uint256 ii = 0; ii < arrayLength; ii++) {
            bytes32 key = data.toBytes32(pointer);

            // check that the trailing bytes are zero bytes "00"
            if (uint224(uint256(key)) != 0) return false;

            // increment the pointer
            pointer += 32;
        }

        return true;
    }
}
