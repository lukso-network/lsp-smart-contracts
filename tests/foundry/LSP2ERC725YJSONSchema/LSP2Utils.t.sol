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
        bytes2 thirdBytes
    ) public pure {
        // store firstBytes length
        uint16 firstBytesLength = firstBytes.length;
        // store secondBytes length
        uint16 secondBytesLength = secondBytes.length;
        // store thirdBytes length
        uint16 thirdBytesLength = thirdBytes.length;
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

    function testShouldNotRevertWithLowerLengthElement(
        bytes memory firstBytes,
        bytes memory secondBytes,
        uint8 reducer
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
}
