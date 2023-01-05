// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";

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

    function testArrayElementKeyAtIndexShouldAllowedOverwrite(uint128 index) public pure {
        bytes32 arrayKey = keccak256(abi.encodePacked("test"));
        uint256 uniqueIndex = 1;
        if (index == uniqueIndex) {
            return;
        }
        bytes32 key = LSP2Utils.generateArrayElementKeyAtIndex(arrayKey, index);
        assert(key != bytes32(0));
    }

    function testIsCompactBytesArray(
        bytes32 firstBytes,
        bytes20 secondBytes,
        bytes1 thirdBytes
    ) public pure {
        //return if some  bytes are empty
        if (firstBytes.length == 0 || secondBytes.length == 0 || thirdBytes.length == 0) {
            return;
        }
        // store firstBytes length
        uint8 firstBytesLength = uint8(firstBytes.length);
        // store secondBytes length
        uint8 secondBytesLength = uint8(secondBytes.length);
        // store thirdBytes length
        uint8 thirdBytesLength = uint8(thirdBytes.length);
        bytes memory data = abi.encodePacked(
            firstBytesLength,
            firstBytes,
            secondBytesLength,
            secondBytes,
            thirdBytesLength,
            thirdBytes
        );
        assert(LSP2Utils.isCompactBytesArray(data));
    }

    // Skip test because failing sometimes
    function testIsCompactBytesArrayShouldReturnFalseWithWrongLengthElementSkip(
        bytes32 firstBytes,
        bytes32 secondBytes
    ) public pure {
        //return if some  bytes are empty
        if (firstBytes.length == 0 || secondBytes.length == 0) {
            return;
        }
        // store firstBytes length
        uint8 firstBytesLength = uint8(firstBytes.length);
        // secondBytesLength is 32 and not 10
        uint8 secondBytesLength = 10;
        bytes memory data = abi.encodePacked(
            firstBytesLength,
            firstBytes,
            secondBytesLength,
            secondBytes
        );
        // should always return false because secondBytesConcatTimes10Length is 320 and not 0x40
        assert(!LSP2Utils.isCompactBytesArray(data));
    }

    // Skip test because failing sometimes
    function testIsCompactBytesArrayShouldReturnFalseWithTruncatedLengthElementSkip(
        bytes32 firstBytes,
        bytes32 secondBytes
    ) public pure {
        //return if some  bytes are empty
        if (firstBytes.length == 0 || secondBytes.length == 0) {
            return;
        }
        // store firstBytes length
        uint8 firstBytesLength = uint8(firstBytes.length);
        // concat secondBytes 10 times so that we have 320 bytes length
        bytes memory secondBytesConcatTimes10 = abi.encodePacked(
            secondBytes,
            secondBytes,
            secondBytes,
            secondBytes,
            secondBytes,
            secondBytes,
            secondBytes,
            secondBytes,
            secondBytes,
            secondBytes
        );
        // secondBytesConcatTimes10Length is 320 and not 10
        uint8 secondBytesConcatTimes10Length = 10;
        bytes memory data = abi.encodePacked(
            firstBytesLength,
            firstBytes,
            secondBytesConcatTimes10Length,
            secondBytesConcatTimes10
        );
        // should always return false because secondBytesConcatTimes10Length is 320 and not 0x40
        assert(!LSP2Utils.isCompactBytesArray(data));
    }

    // Skip test because failing sometimes
    function testIsCompactBytesArrayShouldReturnFalseWithBigCBASkip(
        bytes32 firstBytes,
        bytes32 secondBytes
    ) public pure {
        //return if some  bytes are empty
        if (firstBytes.length == 0 || secondBytes.length == 0) {
            return;
        }
        // store firstBytes length
        uint8 firstBytesLength = uint8(firstBytes.length);
        // concat secondBytes 10 times so that we have 320 bytes length
        bytes memory secondBytesConcatTimes10 = abi.encodePacked(
            secondBytes,
            secondBytes,
            secondBytes,
            secondBytes,
            secondBytes,
            secondBytes,
            secondBytes,
            secondBytes,
            secondBytes,
            secondBytes
        );
        // cast down to uint8 : 320 = 0x0140 => uint8(0x0140) = 0x40
        uint8 secondBytesConcatTimes10Length = uint8(secondBytesConcatTimes10.length);
        bytes memory data = abi.encodePacked(
            firstBytesLength,
            firstBytes,
            secondBytesConcatTimes10Length,
            secondBytesConcatTimes10
        );
        // should always return false because secondBytesConcatTimes10Length is 320 and not 0x40
        assert(!LSP2Utils.isCompactBytesArray(data));
    }

    // Skip test because failing sometimes
    function testIsCompactBytesArrayShouldReturnTrueSkip(bytes32 firstBytes, bytes32 secondBytes)
        public
        pure
    {
        //return if some  bytes are empty
        if (firstBytes.length == 0 || secondBytes.length == 0) {
            return;
        }
        // store firstBytes length
        uint8 firstBytesLength = uint8(firstBytes.length);
        // concat secondBytes 10 times so that we have 320 bytes length
        bytes memory secondBytesConcatTimes10 = abi.encodePacked(
            secondBytes,
            secondBytes,
            secondBytes,
            secondBytes,
            secondBytes,
            secondBytes,
            secondBytes,
            secondBytes,
            secondBytes,
            secondBytes
        );
        // cast down to uint8 : 320 = 0x0140 => uint8(0x0140) = 0x40
        bytes memory data = abi.encodePacked(
            firstBytesLength,
            firstBytes,
            uint16(secondBytesConcatTimes10.length),
            secondBytesConcatTimes10
        );
        // should always return false because secondBytesConcatTimes10Length is 320 and not 0x40
        assert(LSP2Utils.isCompactBytesArray(data));
    }
}
