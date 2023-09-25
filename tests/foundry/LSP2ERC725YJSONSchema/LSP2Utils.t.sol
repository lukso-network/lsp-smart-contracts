// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.13;

import "forge-std/Test.sol";

import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";

import "../../../contracts/LSP2ERC725YJSONSchema/LSP2Utils.sol";

contract LSP2UtilsTests is Test {
    function testRevertsOnWrongLastBracket(string memory x) public {
        bytes memory dataKey = bytes(x);
        // check if x last char is not ]
        if (dataKey.length > 1 && dataKey[dataKey.length - 1] != 0x5d) {
            vm.expectRevert();
            LSP2Utils.generateArrayKey(x);
            //
        }
    }

    function testRevertsOnWrongSecondToLastBracket(string memory x) public {
        bytes memory dataKey = bytes(x);
        // check if x sencond to last char is not [
        if (dataKey.length > 1 && dataKey[dataKey.length - 2] != 0x5b) {
            vm.expectRevert();
            LSP2Utils.generateArrayKey(x);
        }
    }

    function testArrayElementKeyAtIndexShouldAllowedOverwrite(
        uint128 index
    ) public pure {
        bytes32 arrayKey = keccak256(abi.encodePacked("test"));
        uint256 uniqueIndex = 1;
        if (index == uniqueIndex) {
            return;
        }
        bytes32 key = LSP2Utils.generateArrayElementKeyAtIndex(arrayKey, index);
        assert(key != bytes32(0));
    }

    function testIsCompactBytesArray(
        uint8 firstBytesLength,
        uint8 secondBytesLength,
        uint16 thirdBytesLength
    ) public view {
        // check if thirdBytesLength is not too big to speed up test
        if (thirdBytesLength > 750) return;

        // store firstBytes length
        bytes memory firstBytes = _generateRandomBytes(firstBytesLength);
        // store secondBytes length
        bytes memory secondBytes = _generateRandomBytes(secondBytesLength);

        bytes memory thirdBytes = _generateRandomBytes(thirdBytesLength);

        uint16 firstBytesLength16 = uint16(firstBytesLength);
        uint16 secondBytesLength16 = uint16(secondBytesLength);

        // store thirdBytes length
        bytes memory data = abi.encodePacked(
            firstBytesLength16,
            firstBytes,
            secondBytesLength16,
            secondBytes,
            thirdBytesLength,
            thirdBytes
        );
        assert(LSP2Utils.isCompactBytesArray(data));
    }

    function testShouldNotRevertWithLowerLengthElement(
        bytes memory firstBytes,
        bytes memory secondBytes,
        uint16 reducer
    ) public pure {
        // store firstBytes length
        uint16 firstBytesLength = uint16(firstBytes.length);
        // store secondBytes length
        uint16 secondBytesLength = uint16(secondBytes.length);

        if (reducer > secondBytesLength) {
            secondBytesLength = 0;
        } else {
            secondBytesLength -= reducer;
        }

        bytes memory data = abi.encodePacked(
            firstBytesLength,
            firstBytes,
            secondBytesLength,
            secondBytes
        );

        LSP2Utils.isCompactBytesArray(data);
    }

    function testShouldNotRevertWithBiggerLengthElement(
        bytes memory firstBytes,
        bytes memory secondBytes,
        uint16 adder
    ) public pure {
        // store firstBytes length
        uint16 firstBytesLength = uint16(firstBytes.length);
        // store secondBytes length
        uint16 secondBytesLength = uint16(secondBytes.length);

        if (adder > type(uint16).max - secondBytesLength) {
            secondBytesLength = adder;
        } else {
            secondBytesLength += adder;
        }

        bytes memory data = abi.encodePacked(
            firstBytesLength,
            firstBytes,
            secondBytesLength,
            secondBytes
        );

        LSP2Utils.isCompactBytesArray(data);
    }

    function testShouldConcatenateMappingWithGroupingKey(
        bytes6 keyPrefix,
        bytes4 mapPrefix,
        bytes20 subMapKey
    ) public {
        bytes32 lsp2Generated = LSP2Utils.generateMappingWithGroupingKey(
            keyPrefix,
            mapPrefix,
            subMapKey
        );

        assertEq32(
            bytes32(
                abi.encodePacked(keyPrefix, mapPrefix, bytes2(0), subMapKey)
            ),
            lsp2Generated
        );
    }

    function _generateRandomBytes(
        uint256 length
    ) private view returns (bytes memory) {
        bytes memory b = new bytes(length);
        for (uint256 i = 0; i < length; i++) {
            b[i] = bytes1(
                uint8(uint256(keccak256(abi.encodePacked(block.timestamp, i))))
            );
        }
        return b;
    }
}
